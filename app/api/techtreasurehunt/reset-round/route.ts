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
    const { progressId, roundId } = body;
    
    if (!progressId || !roundId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify ownership using our utility function
    const hasAccess = await verifyProgressOwnership(supabase, progressId, user.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized access to this progress' }, { status: 403 });
    }
    
    // Get current progress to check attempts
    const { data: currentProgress, error: currentProgressError } = await supabase
      .from('round_progress')
      .select('*')
      .eq('id', progressId)
      .single();
    
    if (currentProgressError || !currentProgress) {
      console.error('Error fetching current progress:', currentProgressError);
      return NextResponse.json({ error: 'Failed to fetch current progress' }, { status: 500 });
    }
    
    // Check if max attempts reached
    if (currentProgress.attempts >= currentProgress.max_attempts && 
        currentProgress.status !== 'passed') {
      return NextResponse.json({ 
        error: 'Maximum attempts reached',
        attemptsUsed: currentProgress.attempts,
        maxAttempts: currentProgress.max_attempts
      }, { status: 403 });
    }

    // Instead of creating a new entry, UPDATE the existing one
    const { data: updatedProgress, error: updateError } = await supabase
      .from('round_progress')
      .update({
        status: 'not_started',
        attempts: currentProgress.attempts + 1,
        start_time: null,
        end_time: null,
        score: null
      })
      .eq('id', progressId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating progress:', updateError);
      return NextResponse.json({ error: 'Failed to reset round' }, { status: 500 });
    }
    
    // Clear any existing answers to start fresh
    const { error: deleteAnswersError } = await supabase
      .from('math_quiz_answers')
      .delete()
      .eq('progress_id', progressId);
      
    if (deleteAnswersError) {
      console.error('Error deleting previous answers:', deleteAnswersError);
      // Continue anyway, this is not fatal
    }
    
    return NextResponse.json({
      message: 'Round reset successfully',
      progressId: updatedProgress.id,
      attempts: updatedProgress.attempts,
      maxAttempts: updatedProgress.max_attempts
    });
    
  } catch (error) {
    console.error('Error resetting round:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
