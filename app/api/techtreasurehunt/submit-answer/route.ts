import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { verifyProgressOwnership } from '@/app/utils/tech-treasure-hunt';

// Add local verification for faster response
function verifyAnswer(submittedAnswer: number, correctAnswer: number): boolean {
  return Math.abs(submittedAnswer - correctAnswer) < 0.0001;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { progressId, questionId, answer, responseTimeMs } = body;
    
    if (!progressId || !questionId || answer === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify ownership using our utility function
    const hasAccess = await verifyProgressOwnership(supabase, progressId, user.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized access to this progress' }, { status: 403 });
    }
    
    // Fetch question more efficiently - only get the data we need
    const { data: question, error: questionError } = await supabase
      .from('math_quiz_answers')
      .select('correct_answer')
      .eq('id', questionId)
      .eq('progress_id', progressId)
      .single();
    
    if (questionError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    // Verify answer locally for performance
    const isCorrect = verifyAnswer(answer, question.correct_answer);
    
    // Start the update operation but don't wait for it
    const updatePromise = supabase
      .from('math_quiz_answers')
      .update({
        participant_answer: answer,
        is_correct: isCorrect,
        response_time_ms: responseTimeMs || null
      })
      .eq('id', questionId)
      .eq('progress_id', progressId);
    
    // Immediately return response to client
    const response = NextResponse.json({
      isCorrect,
      correctAnswer: question.correct_answer,
      message: 'Answer submitted successfully'
    });
    
    // Wait for update to complete in the background
    updatePromise.then(({ error }) => {
      if (error) {
        console.error('Background error updating answer:', error);
      }
    });
    
    return response;
    
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
