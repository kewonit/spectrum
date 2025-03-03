import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { verifyProgressOwnership } from '@/app/utils/tech-treasure-hunt';

// Simplified helper function to normalize image data
function normalizeImageData(imagesData: any): Array<any> {
  if (!imagesData) {
    return [];
  }
  
  // Handle string format
  if (typeof imagesData === 'string') {
    try {
      imagesData = JSON.parse(imagesData);
    } catch (e) {
      return [];
    }
  }
  
  // Handle different data structures
  let imageArray: any[] = [];
  
  if (Array.isArray(imagesData)) {
    imageArray = imagesData.map((img: any, index: number) => {
      return {
        id: (img.id || `image-${index}`).toString(),
        url: img.image_url || img.url || `https://placehold.co/600x400/png?text=Image+${index+1}`,
        code: img.code || `CODE${index+1}`,
        hint: img.hint || 'Look carefully at the image',
        max_attempts: img.max_attempts || 3
      };
    });
  } 
  else if (typeof imagesData === 'object' && imagesData !== null) {
    let imageItems = imagesData.images || [];
    if (!Array.isArray(imageItems)) {
      imageItems = [imageItems];
    }
    
    imageArray = imageItems.map((img: any, index: number) => ({
      id: (img.id || `image-${index}`).toString(),
      url: img.image_url || img.url || `https://placehold.co/600x400/png?text=Image+${index+1}`,
      code: img.code || `CODE${index+1}`,
      hint: img.hint || 'Look carefully at the image',
      max_attempts: img.max_attempts || 3
    }));
  }
  
  return imageArray;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const progressId = searchParams.get('progressId');
    
    if (!progressId) {
      return NextResponse.json({ error: 'Progress ID is required' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // Get round progress data
    const { data: progressData, error: progressError } = await supabase
      .from('round_progress')
      .select('*, event_rounds(id, round_type)')
      .eq('id', progressId)
      .single();
    
    if (progressError || !progressData) {
      return NextResponse.json({ error: 'Failed to fetch round progress' }, { status: 500 });
    }
    
    // Verify this is an image_code round
    const normalizedRoundType = progressData.event_rounds?.round_type?.toLowerCase()?.replace(/-/g, '_');
    if (normalizedRoundType !== 'image_code') {
      return NextResponse.json({ error: 'Invalid round type' }, { status: 400 });
    }
    
    // Get image code round configuration
    let roundConfig;
    const { data, error: roundError } = await supabase
      .from('image_code_rounds')
      .select('*')
      .eq('round_id', progressData.round_id)
      .single();
    
    if (!data) {
      // Create a minimal default config if nothing exists
      roundConfig = {
        images: [{
          id: "image-1",
          url: "https://placehold.co/600x400/png?text=Default+Image",
          code: "CODE123",
          hint: "This is a default image. The code is CODE123",
          max_attempts: 3
        }],
        time_limit: 300
      };
    } else {
      roundConfig = data;
    }
    
    // Get existing submissions for this progress
    const { data: submissions } = await supabase
      .from('image_code_submissions')
      .select('*')
      .eq('progress_id', progressId);
    
    const normalizedImages = normalizeImageData(roundConfig.images || []);
    
    const processedImages = normalizedImages.map((image: any) => {
      // Find existing submission for this image
      const submission = submissions?.find((s: { image_id: string }) => 
        s.image_id.toString() === image.id.toString()
      );
      
      return {
        id: image.id,
        url: image.url,
        hint: image.hint,
        isCorrect: submission?.is_correct || false,
        attempts: submission?.attempts || 0,
        maxAttempts: image.max_attempts || 3
      };
    });
    
    // Update round progress status if it's not started yet
    if (progressData.status === 'not_started') {
      await supabase
        .from('round_progress')
        .update({
          status: 'in_progress',
          start_time: new Date().toISOString()
        })
        .eq('id', progressId);
    }
    
    return NextResponse.json({
      images: processedImages,
      timeLimit: roundConfig.time_limit || 600
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
