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
    
    if (!questions || questions.length === 0) {
      // Try to generate questions
      console.log('No questions found, attempting to generate...');
      
      // Get round ID from progress
      const { data: roundData, error: roundError } = await supabase
        .from('math_quiz_rounds')
        .select('*')
        .eq('round_id', progress.round_id)
        .single();
        
      if (roundError || !roundData) {
        console.error('Error fetching quiz round configuration:', roundError);
        return NextResponse.json({ error: 'Failed to fetch quiz configuration' }, { status: 500 });
      }
      
      // Generate questions
      const generatedQuestions = [];
      for (let i = 1; i <= roundData.num_questions; i++) {
        generatedQuestions.push({
          progress_id: progressId,
          question_number: i,
          question: generateMathQuestion(roundData),
          correct_answer: Math.floor(Math.random() * 100), // This would normally be calculated
          participant_answer: null,
          is_correct: null
        });
      }
      
      // Insert generated questions
      const { data: insertedQuestions, error: insertError } = await supabase
        .from('math_quiz_answers')
        .insert(generatedQuestions)
        .select('id, question, question_number');
      
      if (insertError) {
        console.error('Error inserting generated questions:', insertError);
        return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
      }
      
      return NextResponse.json({ questions: insertedQuestions || [] });
    }
    
    return NextResponse.json({
      questions
    });
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate a math question
function generateMathQuestion(config: any): string {
  const operations = config.operations || ['add', 'subtract', 'multiply', 'divide'];
  const minRange = config.min_range || 1;
  const maxRange = config.max_range || 100;
  const difficulty = config.difficulty || 'medium';
  
  const operation = operations[Math.floor(Math.random() * operations.length)];
  const a = Math.floor(Math.random() * (maxRange - minRange)) + minRange;
  const b = Math.floor(Math.random() * (maxRange - minRange)) + minRange;
  
  switch (operation) {
    case 'add':
      return `${a} + ${b} = ?`;
    case 'subtract':
      return `${a + b} - ${a} = ?`;
    case 'multiply':
      return `${a} × ${b} = ?`;
    case 'divide':
      return `${a * b} ÷ ${a} = ?`;
    default:
      return `${a} + ${b} = ?`;
  }
}
