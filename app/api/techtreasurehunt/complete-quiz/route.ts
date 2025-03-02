import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { progressId, totalTimeSeconds, autoPass = false } = body;
    
    if (!progressId) {
      return NextResponse.json({ error: 'Progress ID is required' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // First get round progress data with event round information
    const { data: progressData, error: progressError } = await supabase
      .from('round_progress')
      .select(`
        *,
        event_rounds(*)
      `)
      .eq('id', progressId)
      .single();
    
    if (progressError || !progressData) {
      console.error('Error fetching round progress:', progressError);
      return NextResponse.json({ error: 'Failed to fetch round progress' }, { status: 500 });
    }

    // Ensure this is a math quiz round
    if (progressData.event_rounds.round_type !== 'math_quiz') {
      return NextResponse.json({ error: 'This endpoint only handles math quiz rounds' }, { status: 400 });
    }
    
    // Separately fetch the math quiz round configuration
    const { data: mathQuizRound, error: mathQuizError } = await supabase
      .from('math_quiz_rounds')
      .select('*')
      .eq('round_id', progressData.event_rounds.id)
      .single();
      
    if (mathQuizError) {
      console.error('Error fetching math quiz configuration:', mathQuizError);
      return NextResponse.json({ error: 'Failed to fetch math quiz configuration' }, { status: 500 });
    }
    
    // Get math quiz answers
    const { data: answers, error: answersError } = await supabase
      .from('math_quiz_answers')
      .select('*')
      .eq('progress_id', progressId);
    
    if (answersError) {
      console.error('Error fetching answers:', answersError);
      return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
    }
    
    // Calculate results
    const totalQuestions = answers?.length || 0;
    const correctAnswers = answers?.filter(a => a.is_correct) || [];
    const correctCount = correctAnswers.length;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    
    // Check if passed based on passing score
    const passingScore = mathQuizRound?.passing_score || 0.6;
    
    // Modified: Only mark as passed if passing score is met
    // Don't auto-pass unless specifically requested
    const passed = totalQuestions > 0 && 
                   (correctCount / totalQuestions) >= passingScore &&
                   (answers?.every(a => a.participant_answer !== null) || autoPass);
    
    console.log(`Quiz results: ${correctCount}/${totalQuestions} correct (${percentage.toFixed(1)}%), passing: ${passed}`);
    console.log(`Passing criteria: ${passingScore * 100}% required, all answers must be attempted`);
    
    // Calculate average response time
    const totalResponseTime = answers?.reduce((sum, a) => sum + (a.response_time_ms || 0), 0) || 0;
    const avgResponseTime = totalQuestions > 0 ? totalResponseTime / totalQuestions / 1000 : 0;
    
    // Update round progress - mark as passed only if criteria met
    // Otherwise mark as 'failed' so they can retry
    const { error: updateError } = await supabase
      .from('round_progress')
      .update({
        status: passed ? 'passed' : 'failed',
        end_time: new Date().toISOString(),
        score: {
          correctCount,
          totalQuestions,
          percentage,
          passed,
          totalTimeSeconds: totalTimeSeconds || (totalResponseTime / 1000)
        }
      })
      .eq('id', progressId);
    
    if (updateError) {
      console.error('Error updating round progress:', updateError);
      return NextResponse.json({ error: 'Failed to update round progress' }, { status: 500 });
    }
    
    // Call stored procedure to evaluate completion 
    await supabase.rpc('evaluate_round_completion', { p_progress_id: progressId });
    
    // Prepare detailed results for the frontend
    const results = {
      passed,
      correctCount,
      totalQuestions,
      totalTime: totalTimeSeconds || (totalResponseTime / 1000),
      avgResponseTime,
      answers: answers?.map(a => ({
        question: a.question,
        answer: a.participant_answer,
        correct_answer: a.correct_answer,
        is_correct: a.is_correct
      })),
      progressId
    };
    
    return NextResponse.json({ results });
    
  } catch (error) {
    console.error('Unexpected error in complete-quiz route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
