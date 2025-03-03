import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { progressId, roundId, imageId, code } = body;
    
    // Validate required fields
    if (!progressId || !roundId || !imageId || !code) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // Get round progress data
    const { data: progressData, error: progressError } = await supabase
      .from('round_progress')
      .select('*')
      .eq('id', progressId)
      .single();
    
    if (progressError || !progressData) {
      console.error('Error fetching round progress:', progressError);
      return NextResponse.json({ error: 'Failed to fetch round progress' }, { status: 500 });
    }
    
    // Get image code round configuration
    const { data: roundConfig, error: roundError } = await supabase
      .from('image_code_rounds')
      .select('images')
      .eq('round_id', roundId)
      .single();
    
    if (roundError || !roundConfig) {
      console.error('Error fetching round config:', roundError);
      return NextResponse.json({ error: 'Failed to fetch round configuration' }, { status: 500 });
    }
    
    // Convert imageId to string to match text type in database
    const imageIdString = imageId.toString();
    
    // Find the specific image in the configuration (handling jsonb[] format)
    const imageArr = roundConfig.images || [];
    
    // Find image by index or id if provided
    const imageIndex = parseInt(imageIdString.replace('image-', ''), 10);
    
    // First try to find by ID if it's a numerically indexed image
    let imageConfig = !isNaN(imageIndex) && imageIndex < imageArr.length 
      ? imageArr[imageIndex]
      : null;
      
    // If not found by index, try to find by matching id field
    if (!imageConfig) {
      imageConfig = imageArr.find((img: any) => 
        (img.id && img.id.toString() === imageIdString) ||
        (!img.id && `image-${imageArr.indexOf(img)}` === imageIdString)
      );
    }
    
    if (!imageConfig) {
      console.error(`Image ID ${imageIdString} not found in round config`, {
        availableImages: imageArr.map((img: any, idx: number) => ({ 
          id: img.id || `image-${idx}`,
          code: img.code 
        }))
      });
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    // Check if the image code matches (case-sensitive)
    const isCorrect = imageConfig.code === code;
    
    console.log(`Code submission: "${code}" for image ID: ${imageIdString}, correct: ${isCorrect}`);
    
    // Get existing submission or create one
    const { data: existingSubmission, error: submissionError } = await supabase
      .from('image_code_submissions')
      .select('*')
      .eq('progress_id', progressId)
      .eq('image_id', imageIdString)
      .maybeSingle();
    
    let attempts = 1;
    
    if (!submissionError && existingSubmission) {
      // Increment attempts if submission exists
      attempts = (existingSubmission.attempts || 0) + 1;
      
      // Update existing submission
      const { error: updateError } = await supabase
        .from('image_code_submissions')
        .update({
          submitted_code: code,
          is_correct: isCorrect,
          attempts: attempts,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubmission.id);
      
      if (updateError) {
        console.error('Error updating submission:', updateError);
        return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
      }
    } else {
      // Create new submission
      const { error: insertError } = await supabase
        .from('image_code_submissions')
        .insert({
          progress_id: progressId,
          image_id: imageIdString,
          submitted_code: code,
          is_correct: isCorrect,
          attempts: attempts
        });
      
      if (insertError) {
        console.error('Error creating submission:', insertError);
        return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
      }
    }
    
    return NextResponse.json({
      isCorrect,
      attempts,
      maxAttempts: imageConfig.max_attempts || 3
    });
    
  } catch (error) {
    console.error('Unexpected error in submit-code route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
