import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roundId = searchParams.get('roundId');
    
    if (!roundId) {
      return NextResponse.json({ error: 'Round ID is required' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // Get math quiz round configuration
    const { data: quizConfig, error: quizError } = await supabase
      .from('math_quiz_rounds')
      .select('*')
      .eq('round_id', roundId)
      .single();
    
    if (quizError) {
      console.error('Error fetching quiz config:', quizError);
      return NextResponse.json({ error: 'Failed to fetch quiz configuration' }, { status: 500 });
    }
    
    if (!quizConfig) {
      return NextResponse.json({ error: 'Quiz configuration not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      numQuestions: quizConfig.num_questions,
      difficulty: quizConfig.difficulty,
      timeLimit: quizConfig.num_questions * quizConfig.time_limit_per_question,
      passingScore: quizConfig.passing_score
    });
    
  } catch (error) {
    console.error('Unexpected error in quiz-config route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
