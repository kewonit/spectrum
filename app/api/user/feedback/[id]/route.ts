import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  // Use destructuring to get the ID from params and await it
  const { id: feedbackId } = await params;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the feedback belongs to the user
    const { data: existingFeedback, error: existingError } = await supabase
      .from('user_feedback')
      .select('id, user_id')
      .eq('id', feedbackId)
      .single();

    if (existingError || !existingFeedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    if (existingFeedback.user_id !== user.id) {
      return NextResponse.json(
        { error: "You can only update your own feedback" },
        { status: 403 }
      );
    }

    // Parse the updated feedback data
    const body = await request.json();
    const { rating, feedback_text } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating is required and must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Update the feedback - always set anonymous to false
    const { data: feedback, error } = await supabase
      .from('user_feedback')
      .update({
        rating,
        feedback_text: feedback_text || null,
        anonymous: false,
      })
      .eq('id', feedbackId)
      .select(`
        id, 
        rating, 
        feedback_text, 
        anonymous, 
        event_id,
        created_at, 
        updated_at,
        user:profiles (
          id, 
          full_name
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Failed to update feedback:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  // Use destructuring to get the ID from params and await it
  const { id: feedbackId } = await params;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the feedback belongs to the user
    const { data: existingFeedback, error: existingError } = await supabase
      .from('user_feedback')
      .select('id, user_id')
      .eq('id', feedbackId)
      .single();

    if (existingError || !existingFeedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    if (existingFeedback.user_id !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own feedback" },
        { status: 403 }
      );
    }

    // Delete the feedback
    const { error } = await supabase
      .from('user_feedback')
      .delete()
      .eq('id', feedbackId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
