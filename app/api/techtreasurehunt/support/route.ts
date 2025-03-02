import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// This endpoint provides a quick fix for common issues
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { action, progressId } = body;
    
    if (!action || !progressId) {
      return NextResponse.json({ error: 'Action and progressId are required' }, { status: 400 });
    }
    
    // Handle different support actions
    if (action === 'fix_image_code_round') {
      return await fixImageCodeRound(supabase, progressId);
    } else if (action === 'reset_round_progress') {
      return await resetRoundProgress(supabase, progressId);
    } else if (action === 'sync_round_type') {
      return await syncRoundType(supabase, progressId);
    }
    
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Error in support endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Fix for image code round
async function fixImageCodeRound(supabase: any, progressId: string) {
  // First get progress info to find the round
  const { data: progress, error: progressError } = await supabase
    .from('round_progress')
    .select('round_id')
    .eq('id', progressId)
    .single();
    
  if (progressError || !progress) {
    return NextResponse.json({ error: 'Progress not found' }, { status: 404 });
  }
  
  const roundId = progress.round_id;
  
  // Next, check if image_code_round exists
  const { data: imageCodeRound, error: imageCodeError } = await supabase
    .from('image_code_rounds')
    .select('id')
    .eq('round_id', roundId)
    .maybeSingle();
    
  // If it exists, we're good
  if (imageCodeRound) {
    return NextResponse.json({ 
      message: 'Image code round already exists',
      roundId, 
      imageCodeRoundId: imageCodeRound.id 
    });
  }
  
  // Create sample images
  const sampleImages = [
    {
      id: crypto.randomUUID(),
      code: "CODE1",
      image_url: "https://placehold.co/600x400/png?text=Find+The+Code+1"
    },
    {
      id: crypto.randomUUID(),
      code: "CODE2",
      image_url: "https://placehold.co/600x400/png?text=Find+The+Code+2"
    },
    {
      id: crypto.randomUUID(),
      code: "CODE3",
      image_url: "https://placehold.co/600x400/png?text=Find+The+Code+3"
    }
  ];
  
  // Create a new image_code_round entry
  const { data: newRound, error: createError } = await supabase
    .from('image_code_rounds')
    .insert({
      round_id: roundId,
      image_count: 3,
      images: sampleImages,
      time_limit: 600
    })
    .select()
    .single();
    
  if (createError) {
    return NextResponse.json({ error: 'Failed to create image code round', details: createError }, { status: 500 });
  }
  
  return NextResponse.json({
    message: 'Image code round created successfully',
    roundId,
    imageCodeRoundId: newRound.id
  });
}

// Reset round progress
async function resetRoundProgress(supabase: any, progressId: string) {
  const { data: updatedProgress, error: updateError } = await supabase
    .from('round_progress')
    .update({
      status: 'not_started',
      start_time: null,
      end_time: null
    })
    .eq('id', progressId)
    .select()
    .single();
    
  if (updateError) {
    return NextResponse.json({ error: 'Failed to reset progress', details: updateError }, { status: 500 });
  }
  
  return NextResponse.json({
    message: 'Progress reset successfully',
    progress: updatedProgress
  });
}

// Sync round type
async function syncRoundType(supabase: any, progressId: string) {
  const { data: progress, error: progressError } = await supabase
    .from('round_progress')
    .select(`
      id,
      round_id,
      event_rounds (
        id,
        round_type
      )
    `)
    .eq('id', progressId)
    .single();
    
  if (progressError || !progress) {
    return NextResponse.json({ error: 'Progress not found' }, { status: 404 });
  }
  
  // Get actual round type
  let actualRoundType = null;
  
  if (Array.isArray(progress.event_rounds)) {
    actualRoundType = progress.event_rounds[0]?.round_type;
  } else if (progress.event_rounds) {
    actualRoundType = (progress.event_rounds as any).round_type;
  }
  
  if (!actualRoundType) {
    return NextResponse.json({ error: 'Could not determine round type' }, { status: 500 });
  }
  
  // Update progress with correct metadata
  const { data: updatedProgress, error: updateError } = await supabase
    .from('round_progress')
    .update({
      metadata: { roundType: actualRoundType }
    })
    .eq('id', progressId)
    .select()
    .single();
    
  if (updateError) {
    return NextResponse.json({ error: 'Failed to sync round type', details: updateError }, { status: 500 });
  }
  
  return NextResponse.json({
    message: 'Round type synced successfully',
    roundType: actualRoundType,
    progress: updatedProgress
  });
}
