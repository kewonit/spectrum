import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

// Define interfaces for proper typing
interface UserProfile {
  id: string;
  full_name: string;
}

interface FeedbackItem {
  id: string;
  rating: number;
  feedback_text: string | null;
  anonymous: boolean;
  event_id: string | null;
  created_at: string;
  updated_at: string;
  user: UserProfile | null;
}

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's own feedback
    const { data: userFeedback, error: userFeedbackError } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (userFeedbackError && userFeedbackError.code !== 'PGSQL_NO_ROWS_RETURNED') {
      console.error("Failed to fetch user feedback:", userFeedbackError);
    }

    // Get all feedback (including user's own)
    const { data: allFeedback, error: allFeedbackError } = await supabase
      .from('user_feedback')
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
      .order('created_at', { ascending: false })
      .limit(100);

    if (allFeedbackError) {
      throw allFeedbackError;
    }

    // Process the feedback list to hide user identity for anonymous feedback
    const processedFeedback = (allFeedback as unknown as FeedbackItem[]).map(feedback => {
      if (feedback.anonymous && feedback.user?.id !== user.id) {
        return {
          ...feedback,
          user: null
        };
      }
      return feedback;
    });

    return NextResponse.json({ 
      userFeedback,
      allFeedback: processedFeedback
    });
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
    const { rating, feedback_text, anonymous, event_id } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating is required and must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Insert the feedback
    const { data: feedback, error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: user.id,
        rating,
        feedback_text: feedback_text || null,
        anonymous: anonymous || false,
        event_id: event_id || null
      })
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
    console.error("Failed to submit feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
