import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { verifyProgressOwnership } from '@/app/utils/tech-treasure-hunt';

// Helper function to normalize image data from any format
function normalizeImageData(imagesData: any): Array<any> {
  console.log("Normalizing image data type:", typeof imagesData);
  
  if (!imagesData) {
    console.log("No image data provided");
    return [];
  }
  
  // Special handling for jsonb array column
  if (typeof imagesData === 'string') {
    try {
      console.log("Trying to parse string image data");
      imagesData = JSON.parse(imagesData);
    } catch (e) {
      console.error("Failed to parse image data string:", e);
    }
  }
  
  // Handle different data structures
  let imageArray: any[] = [];
  
  try {
    if (Array.isArray(imagesData)) {
      console.log("Processing images as array");
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
      console.log("Processing images as object");
      // Handle case where images might be a property of the object
      let imageItems = imagesData.images || [];
      if (!Array.isArray(imageItems)) {
        imageItems = [imageItems]; // Convert single object to array
      }
      
      imageArray = imageItems.map((img: any, index: number) => ({
        id: (img.id || `image-${index}`).toString(),
        url: img.image_url || img.url || `https://placehold.co/600x400/png?text=Image+${index+1}`,
        code: img.code || `CODE${index+1}`,
        hint: img.hint || 'Look carefully at the image',
        max_attempts: img.max_attempts || 3
      }));
    }
    
    console.log(`Normalized ${imageArray.length} images`);
    
    // If we got no images but have an image_count, create placeholder images
    if (imageArray.length === 0 && typeof imagesData.image_count === 'number') {
      console.log(`Creating ${imagesData.image_count} placeholder images from image_count`);
      
      for (let i = 0; i < imagesData.image_count; i++) {
        imageArray.push({
          id: `image-${i}`,
          url: `https://placehold.co/600x400/png?text=Image+${i+1}`,
          code: `CODE${i+1}`,
          hint: 'Look carefully at the image',
          max_attempts: 3
        });
      }
    }
  } catch (error) {
    console.error('Error normalizing image data:', error);
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
    
    console.log(`Fetching image codes for progress ID: ${progressId}`);
    
    const supabase = await createClient();
    
    // Get round progress data
    const { data: progressData, error: progressError } = await supabase
      .from('round_progress')
      .select('*, event_rounds(id, round_type)')
      .eq('id', progressId)
      .single();
    
    if (progressError || !progressData) {
      console.error('Error fetching round progress:', progressError);
      return NextResponse.json({ error: 'Failed to fetch round progress' }, { status: 500 });
    }
    
    console.log(`Round type: ${progressData.event_rounds.round_type}`);
    
    // Verify this is an image_code round, use case-insensitive comparison
    const normalizedRoundType = progressData.event_rounds.round_type.toLowerCase().replace(/-/g, '_');
    if (normalizedRoundType !== 'image_code') {
      console.error(`Invalid round type: ${progressData.event_rounds.round_type}`);
      return NextResponse.json({ error: 'Invalid round type' }, { status: 400 });
    }
    
    console.log(`Fetching image code round config for round ID: ${progressData.round_id}`);
    
    // Get image code round configuration
    let roundConfig;
    const { data, error: roundError } = await supabase
      .from('image_code_rounds')
      .select('*')
      .eq('round_id', progressData.round_id)
      .single();
    
    if (roundError) {
      console.error('Error fetching round config:', roundError);
    }
    
    // If no data or error, try to create a default config
    if (!data) {
      console.log("No round config found, creating default...");
      
      const success = await setupDefaultImageCodeRound(supabase, progressData.round_id);
      if (success) {
        // Retry fetching the newly created config
        const { data: createdConfig, error: createdError } = await supabase
          .from('image_code_rounds')
          .select('*')
          .eq('round_id', progressData.round_id)
          .single();
          
        if (createdError || !createdConfig) {
          console.error('Error fetching created config:', createdError);
          return NextResponse.json({ 
            error: 'Failed to create or fetch round configuration',
            details: createdError
          }, { status: 500 });
        }
        
        roundConfig = createdConfig;
      } else {
        // Create a minimal default config
        roundConfig = {
          images: [{
            id: "image-1",
            image_url: "https://placehold.co/600x400/png?text=Default+Image",
            code: "CODE123",
            hint: "This is a default image. The code is CODE123"
          }],
          time_limit: 300
        };
      }
    } else {
      roundConfig = data;
    }
    
    console.log("Round config structure:", {
      id: roundConfig.id,
      has_images: !!roundConfig.images,
      images_type: typeof roundConfig.images,
      is_images_array: Array.isArray(roundConfig.images),
      image_count: roundConfig.image_count,
      time_limit: roundConfig.time_limit
    });
    
    // Get existing submissions for this progress
    const { data: submissions, error: submissionsError } = await supabase
      .from('image_code_submissions')
      .select('*')
      .eq('progress_id', progressId);
    
    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
    }
    
    const normalizedImages = normalizeImageData(roundConfig.images || []);
    
    const processedImages = normalizedImages.map((image: any) => {
      // Find existing submission for this image (note image_id is text)
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
    
    console.log(`Processed ${processedImages.length} images for round.`);
    
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
    console.error('Unexpected error in image-codes route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to set up a default image code round if one doesn't exist
async function setupDefaultImageCodeRound(supabase: any, roundId: string) {
  console.log('Creating default image code round configuration');
  
  // Create sample image data that matches the expected jsonb[] format
  const sampleImages = [
    {
      code: "TH123",
      image_url: "https://placehold.co/600x400/png?text=Code+Challenge+1"
    },
    {
      code: "NT456",
      image_url: "https://placehold.co/600x400/png?text=Code+Challenge+2"
    },
    {
      code: "HU789",
      image_url: "https://placehold.co/600x400/png?text=Code+Challenge+3"
    }
  ];
  
  try {
    const { error } = await supabase
      .from('image_code_rounds')
      .insert({
        round_id: roundId,
        image_count: 3,
        images: sampleImages,
        time_limit: 600 // 10 minutes
      });
      
    if (error) {
      console.error('Error creating default image code round:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception creating default image code round:', error);
    return false;
  }
}
