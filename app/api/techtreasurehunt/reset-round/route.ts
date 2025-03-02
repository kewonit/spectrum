import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { verifyProgressOwnership } from '@/app/utils/tech-treasure-hunt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { progressId, roundId } = body;
    
    if (!progressId || !roundId) {
      return NextResponse.json({ 
        error: 'Progress ID and Round ID are required' 
      }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if round progress exists
    const { data: progressData, error: progressError } = await supabase
      .from('round_progress')
      .select('*, event_rounds(round_type)')
      .eq('id', progressId)
      .eq('round_id', roundId)
      .single();
    
    if (progressError || !progressData) {
      console.error('Error fetching round progress:', progressError);
      return NextResponse.json({ error: 'Round progress not found' }, { status: 404 });
    }
    
    // Verify ownership using our utility function
    const hasAccess = await verifyProgressOwnership(supabase, progressId, user.id);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized access to this progress' }, { status: 403 });
    }
    
    // Check attempts limit
    if (progressData.attempts >= progressData.max_attempts) {
      return NextResponse.json({ 
        error: 'Maximum attempts reached' 
      }, { status: 400 });
    }
    
    // Increment attempt counter
    const { error: updateError } = await supabase
      .from('round_progress')
      .update({
        status: 'not_started',
        start_time: null,
        end_time: null,
        score: null,
        attempts: progressData.attempts + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', progressId);
    
    if (updateError) {
      console.error('Error resetting round progress:', updateError);
      return NextResponse.json({ error: 'Failed to reset round' }, { status: 500 });
    }
    
    // Clear submissions if this is an image_code round
    if (progressData.event_rounds.round_type === 'image_code') {
      const { error: deleteError } = await supabase
        .from('image_code_submissions')
        .delete()
        .eq('progress_id', progressId);
      
      if (deleteError) {
        console.error('Error clearing submissions:', deleteError);
        // Continue anyway, this isn't critical
      }
    }
    
    // Clear math quiz answers if this is a math_quiz round
    if (progressData.event_rounds.round_type === 'math_quiz') {
      const { error: deleteError } = await supabase
        .from('math_quiz_answers')
        .delete()
        .eq('progress_id', progressId);
      
      if (deleteError) {
        console.error('Error clearing math quiz answers:', deleteError);
        // Continue anyway, this isn't critical
      }
    }
    
    return NextResponse.json({
      success: true,
      newAttempt: progressData.attempts + 1,
      maxAttempts: progressData.max_attempts
    });
    
  } catch (error) {
    console.error('Unexpected error in reset-round route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
