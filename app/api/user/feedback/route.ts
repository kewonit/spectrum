import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's own feedback only
    const { data: userFeedback, error: userFeedbackError } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Handle the "no rows" case more gracefully
    if (userFeedbackError) {
      // If it's just a "no rows" error, don't treat it as an error
      if (userFeedbackError.code === 'PGRST116') {
        console.log("No feedback found for user, this is normal for new users");
        return NextResponse.json({ userFeedback: null });
      } else {
        console.error("Failed to fetch user feedback:", userFeedbackError);
        return NextResponse.json(
          { error: "Failed to fetch feedback" }, 
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ userFeedback });
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user already has feedback
    const { data: existingFeedback } = await supabase
      .from('user_feedback')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingFeedback) {
      return NextResponse.json(
        { error: "You have already provided feedback. Please edit your existing feedback." },
        { status: 400 }
      );
    }

    // Parse the feedback data
    const body = await request.json();
    const { rating, feedback_text, event_id } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating is required and must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Insert the feedback - always set anonymous to false
    const { data: feedback, error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: user.id,
        rating,
        feedback_text: feedback_text || null,
        anonymous: false,
        event_id: event_id || null
      })
      .select('*')
      .single();

    if (error) {
      console.error("Database error when inserting feedback:", error);
      return NextResponse.json(
        { error: "Failed to submit feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
