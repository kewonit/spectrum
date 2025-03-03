import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { verifyProgressOwnership } from '@/app/utils/tech-treasure-hunt';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the progress ID from query parameters
    const progressId = req.nextUrl.searchParams.get('progressId');
    
    if (!progressId) {
      return NextResponse.json({ error: 'Progress ID is required' }, { status: 400 });
    }
    
    // Verify ownership using our utility function
    const hasAccess = await verifyProgressOwnership(supabase, progressId, user.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized access to this progress' }, { status: 403 });
    }
    
    // Get progress with all relevant data
    const { data: progress, error: progressError } = await supabase
      .from('round_progress')
      .select(`
        id,
        registration_id,
        round_id,
        status,
        start_time,
        end_time,
        score,
        attempts,
        max_attempts,
        event_rounds (
          id,
          name,
          round_number,
          round_type,
          time_limit,
          passing_criteria
        )
      `)
      .eq('id', progressId)
      .single();
    
    if (progressError || !progress) {
      console.error('Error fetching progress details:', progressError);
      return NextResponse.json({ error: 'Progress not found' }, { status: 404 });
    }
    
    // Get total questions and correct answers for math quizzes
    let answersData = null;
    
    // Check if this is a math quiz round
    const roundType = Array.isArray(progress.event_rounds) 
      ? progress.event_rounds[0]?.round_type 
      : (progress.event_rounds as any)?.round_type;
    
    if (roundType === 'math_quiz') {
      const { data: answers, error: answersError } = await supabase
        .from('math_quiz_answers')
        .select('id, is_correct')
        .eq('progress_id', progressId);
      
      if (!answersError && answers) {
        answersData = {
          totalQuestions: answers.length,
          correctAnswers: answers.filter(a => a.is_correct).length
        };
      }
    }
    
    return NextResponse.json({
      progress,
      answers: answersData
    });
    
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}