import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

// GET endpoint to fetch user's feedback
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Build the query
    let query = supabase
      .from("user_feedback")
      .select(`
        id, 
        rating, 
        feedback_text, 
        anonymous, 
        created_at,
        updated_at,
        events (
          id,
          name,
          img_url
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    // Filter by event if provided
    if (eventId) {
      query = query.eq("event_id", eventId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching feedback:", error);
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
    }
    
    return NextResponse.json({ feedback: data || [] });
  } catch (error) {
    console.error("Unexpected error fetching feedback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST endpoint to create new feedback
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    const { eventId, rating, feedbackText, anonymous = false } = body;
    
    // Validate the required fields
    if (rating === undefined || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    
    // Check if feedback already exists for this user and event
    if (eventId) {
      const { data: existingFeedback } = await supabase
        .from("user_feedback")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_id", eventId)
        .maybeSingle();
      
      if (existingFeedback) {
        return NextResponse.json({ 
          error: "Feedback already exists for this event",
          feedbackId: existingFeedback.id 
        }, { status: 409 });
      }
    }
    
    // Create the feedback record
    const { data, error } = await supabase
      .from("user_feedback")
      .insert({
        user_id: user.id,
        event_id: eventId || null,
        rating,
        feedback_text: feedbackText || null,
        anonymous
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating feedback:", error);
      return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Feedback submitted successfully",
      feedback: data
    });
    
  } catch (error) {
    console.error("Unexpected error creating feedback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
