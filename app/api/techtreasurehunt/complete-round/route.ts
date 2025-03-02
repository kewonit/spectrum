import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { verifyProgressOwnership } from '@/app/utils/tech-treasure-hunt';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { progressId, score } = body;
    
    if (!progressId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify ownership using our utility function
    const hasAccess = await verifyProgressOwnership(supabase, progressId, user.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized access to this progress' }, { status: 403 });
    }
    
    // Get round information to determine type
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
      console.error('Error fetching progress:', progressError);
      return NextResponse.json({ error: 'Progress not found' }, { status: 404 });
    }
    
    // Get round type safely
    let roundType = '';
    if (Array.isArray(progress.event_rounds)) {
      roundType = progress.event_rounds[0]?.round_type || '';
    } else if (progress.event_rounds) {
      roundType = (progress.event_rounds as any).round_type || '';
    }
    
    // Update round_progress with score data
    const { data: updatedProgress, error: updateError } = await supabase
      .from('round_progress')
      .update({
        score: score,
        end_time: new Date().toISOString()
      })
      .eq('id', progressId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating progress score:', updateError);
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }
    
    // Call the evaluate_round_completion function
    const { data: evaluationResult, error: evalError } = await supabase.rpc(
      'evaluate_round_completion', 
      { p_progress_id: progressId }
    );
    
    if (evalError) {
      console.error('Error evaluating round completion:', evalError);
      return NextResponse.json({ error: 'Failed to evaluate round completion' }, { status: 500 });
    }
    
    // Fetch the updated progress record to get the final status
    const { data: finalProgress, error: finalProgressError } = await supabase
      .from('round_progress')
      .select('status, score')
      .eq('id', progressId)
      .single();
    
    if (finalProgressError) {
      console.error('Error fetching final progress:', finalProgressError);
      return NextResponse.json({ error: 'Failed to fetch final progress' }, { status: 500 });
    }
    
    // Get results based on round type
    if (roundType === 'math_quiz') {
      // Fetch answers for the result display
      const { data: answers, error: answerError } = await supabase
        .from('math_quiz_answers')
        .select('question, participant_answer, correct_answer, is_correct')
        .eq('progress_id', progressId);
      
      if (answerError) {
        console.error('Error fetching answers:', answerError);
        return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
      }
      
      // Get correct count from answers
      const correctCount = (answers || []).filter((a: any) => a.is_correct).length;
      
      // Return math quiz results
      return NextResponse.json({
        results: {
          passed: finalProgress.status === 'passed',
          correctCount: correctCount,
          totalQuestions: answers?.length || 0,
          totalTime: score.totalTime,
          avgResponseTime: score.avgResponseTime,
          progressId: progressId,
          answers: answers?.map((a: any) => ({
            question: a.question,
            answer: a.participant_answer,
            correct_answer: a.correct_answer,
            is_correct: a.is_correct
          })) || []
        }
      });
    } else if (roundType === 'image_code') {
      // Fetch submissions for the result display
      const { data: submissions, error: submissionsError } = await supabase
        .from('image_code_submissions')
        .select('*')
        .eq('progress_id', progressId);
      
      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
      }
      
      // Get image round info
      const { data: imageRound, error: imageRoundError } = await supabase
        .from('image_code_rounds')
        .select('*')
        .eq('round_id', progress.round_id)
        .single();
      
      if (imageRoundError) {
        console.error('Error fetching image round:', imageRoundError);
        // Continue anyway with what we have
      }
      
      // Map submissions to images with results
      const allImages = imageRound?.images || [];
      const correctCount = (submissions || []).filter((s: any) => s.is_correct).length;
      
      // Return image code results
      return NextResponse.json({
        results: {
          passed: finalProgress.status === 'passed',
          correctCount: correctCount,
          totalImages: allImages.length,
          totalTime: score.totalTime || 0,
          progressId: progressId,
          images: allImages.map((img: any) => {
            const submission = submissions?.find((s: any) => s.image_id === img.id);
            return {
              id: img.id,
              url: img.url,
              correctCode: img.code,
              submittedCode: submission?.submitted_code || null,
              isCorrect: submission?.is_correct || false,
              attempts: submission?.attempts || 0
            };
          })
        }
      });
    } else {
      // Generic result format for other round types
      return NextResponse.json({
        results: {
          passed: finalProgress.status === 'passed',
          score: finalProgress.score || {},
          totalTime: score?.totalTime || 0,
          progressId: progressId
        }
      });
    }
    
  } catch (error) {
    console.error('Error completing round:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
