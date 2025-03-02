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
    
    // Get round information from progress
    const { data: progress, error: progressError } = await supabase
      .from('round_progress')
      .select(`
        id,
        round_id,
        event_rounds (
          id, round_type
        )
      `)
      .eq('id', progressId)
      .single();
    
    if (progressError || !progress) {
      console.error('Error fetching progress details:', progressError);
      return NextResponse.json({ error: 'Progress not found' }, { status: 404 });
    }
    
    // Fix: Access the round type safely with better type guards
    let roundType: string | undefined;
    
    if (progress.event_rounds) {
      if (Array.isArray(progress.event_rounds) && progress.event_rounds.length > 0) {
        roundType = progress.event_rounds[0]?.round_type;
      } else if (typeof progress.event_rounds === 'object') {
        roundType = (progress.event_rounds as any).round_type;
      }
    }
    
    // Ensure this is a math quiz round
    if (roundType !== 'math_quiz') {
      return NextResponse.json({ error: 'This API is only for math quiz rounds' }, { status: 400 });
    }
    
    // Fetch questions for this progress
    const { data: questions, error: questionsError } = await supabase
      .from('math_quiz_answers')
      .select('id, question_number, question, correct_answer')
      .eq('progress_id', progressId)
      .order('question_number', { ascending: true });
    
    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
    
    return NextResponse.json({
      questions
    });
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
