import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// This endpoint will initialize an image code round for an existing event round
// Useful for admin purposes or to fix missing image_code_rounds entries

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // This should be restricted to admins in a real app
    // For simplicity in this demo, we're allowing any authenticated user
    
    const body = await req.json();
    const { roundId } = body;
    
    if (!roundId) {
      return NextResponse.json({ error: 'Round ID is required' }, { status: 400 });
    }
    
    // Check if the round exists and is of type image_code
    const { data: round, error: roundError } = await supabase
      .from('event_rounds')
      .select('*')
      .eq('id', roundId)
      .single();
    
    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }
    
    if (round.round_type !== 'image_code') {
      return NextResponse.json({ 
        error: 'This round is not an image code round',
        roundType: round.round_type
      }, { status: 400 });
    }
    
    // Check if image code round already exists
    const { data: existingRound, error: existingError } = await supabase
      .from('image_code_rounds')
      .select('id')
      .eq('round_id', roundId)
      .maybeSingle();
    
    if (existingRound) {
      return NextResponse.json({
        message: 'Image code round already exists',
        id: existingRound.id,
        roundId: roundId
      });
    }
    
    // Create sample images
    const sampleImages = [
      {
        id: crypto.randomUUID(),
        url: 'https://i.imgur.com/kywHlA4.jpeg',
        code: '1234',
        hint: 'Look for numbers hidden in the image',
        max_attempts: 3
      },
      {
        id: crypto.randomUUID(),
        url: 'https://i.imgur.com/6xHxbVj.jpeg',
        code: '5678',
        hint: 'The code is related to the building',
        max_attempts: 3
      },
      {
        id: crypto.randomUUID(),
        url: 'https://i.imgur.com/RhS6cDU.jpeg',
        code: '9012',
        hint: 'Count the elements in the pattern',
        max_attempts: 3
      }
    ];
    
    // Create a new image_code_rounds entry
    const { data: newRound, error: createError } = await supabase
      .from('image_code_rounds')
      .insert({
        round_id: roundId,
        images: sampleImages,
        time_limit: round.time_limit || 600, // Use the round's time limit or default to 10 minutes
        passing_score: 0.8 // 80%
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating image code round:', createError);
      return NextResponse.json({ error: 'Failed to create image code round' }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'Image code round created successfully',
      imageRound: newRound,
      roundId: roundId
    });
    
  } catch (error) {
    console.error('Error initializing image round:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
