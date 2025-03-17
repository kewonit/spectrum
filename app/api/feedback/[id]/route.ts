import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

// GET endpoint to fetch a specific feedback
export async function GET(
  request: Request, // Add request parameter
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const feedbackId = (await params).id;
    
    if (!feedbackId) {
      return NextResponse.json({ error: "Feedback ID is required" }, { status: 400 });
    }
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Fetch the feedback
    const { data, error } = await supabase
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
      .eq("id", feedbackId)
      .eq("user_id", user.id) // Ensure the user owns this feedback
      .single();
    
    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
      }
      console.error("Error fetching feedback:", error);
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
    }
    
    return NextResponse.json({ feedback: data });
  } catch (error) {
    console.error("Unexpected error fetching feedback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT endpoint to update feedback
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const feedbackId = (await params).id;
    
    if (!feedbackId) {
      return NextResponse.json({ error: "Feedback ID is required" }, { status: 400 });
    }
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    const { rating, feedbackText, anonymous = false } = body;
    
    // Validate the required fields
    if (rating === undefined || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    
    // Verify ownership of feedback
    const { data: existingFeedback, error: checkError } = await supabase
      .from("user_feedback")
      .select("id")
      .eq("id", feedbackId)
      .eq("user_id", user.id)
      .single();
    
    if (checkError || !existingFeedback) {
      return NextResponse.json({ 
        error: "Feedback not found or you don't have permission to edit it" 
      }, { status: 404 });
    }
    
    // Update the feedback record
    const { data, error } = await supabase
      .from("user_feedback")
      .update({
        rating,
        feedback_text: feedbackText || null,
        anonymous
      })
      .eq("id", feedbackId)
      .eq("user_id", user.id) // Double check ownership
      .select()
      .single();
    
    if (error) {
      console.error("Error updating feedback:", error);
      return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Feedback updated successfully",
      feedback: data
    });
    
  } catch (error) {
    console.error("Unexpected error updating feedback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE endpoint to remove feedback
export async function DELETE(
  request: Request, // Add request parameter
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const feedbackId = (await params).id;
    
    if (!feedbackId) {
      return NextResponse.json({ error: "Feedback ID is required" }, { status: 400 });
    }
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verify ownership of feedback
    const { data: existingFeedback, error: checkError } = await supabase
      .from("user_feedback")
      .select("id")
      .eq("id", feedbackId)
      .eq("user_id", user.id)
      .single();
    
    if (checkError || !existingFeedback) {
      return NextResponse.json({ 
        error: "Feedback not found or you don't have permission to delete it" 
      }, { status: 404 });
    }
    
    // Delete the feedback record
    const { error } = await supabase
      .from("user_feedback")
      .delete()
      .eq("id", feedbackId)
      .eq("user_id", user.id); // Double check ownership
    
    if (error) {
      console.error("Error deleting feedback:", error);
      return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Feedback deleted successfully"
    });
    
  } catch (error) {
    console.error("Unexpected error deleting feedback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
