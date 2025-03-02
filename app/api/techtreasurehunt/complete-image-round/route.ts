import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Helper function to normalize image data from jsonb[] format
function normalizeImageData(imagesArray: any[]): Array<any> {
  if (!imagesArray || !Array.isArray(imagesArray) || imagesArray.length === 0) {
    return [];
  }
  
  return imagesArray.map((img: any, index: number) => {
    // Each element in the array is a JSON object with code and image_url
    return {
      id: (img.id || `image-${index}`).toString(),
      code: img.code || `CODE${index+1}`,
      name: img.name || `Image ${index+1}`
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { progressId, totalTimeSeconds } = body;
    
    if (!progressId) {
      return NextResponse.json({ error: 'Progress ID is required' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    console.log(`Completing image round for progress ID: ${progressId}`);
    
    // Get round progress data
    const { data: progressData, error: progressError } = await supabase
      .from('round_progress')
      .select('*, event_rounds(*)')
      .eq('id', progressId)
      .single();
    
    if (progressError || !progressData) {
      console.error('Error fetching round progress:', progressError);
      return NextResponse.json({ error: 'Failed to fetch round progress' }, { status: 500 });
    }
    
    // Get image code round configuration
    const { data: roundConfig, error: roundError } = await supabase
      .from('image_code_rounds')
      .select('*')
      .eq('round_id', progressData.round_id)
      .single();
    
    if (roundError || !roundConfig) {
      console.error('Error fetching round config:', roundError);
      return NextResponse.json({ error: 'Failed to fetch round configuration' }, { status: 500 });
    }
    
    // Get all submissions for this progress
    const { data: submissions, error: submissionsError } = await supabase
      .from('image_code_submissions')
      .select('*')
      .eq('progress_id', progressId);
    
    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }
    
    console.log(`Found ${submissions?.length || 0} submissions for this round`);
    
    // Calculate results
    const normalizedImages = normalizeImageData(roundConfig.images || []);
    const totalImages = normalizedImages.length || roundConfig.image_count || 0;
    const correctSubmissions = submissions?.filter((s: { is_correct: boolean }) => s.is_correct) || [];
    const correctCount = correctSubmissions.length;
    const percentage = totalImages > 0 ? (correctCount / totalImages) * 100 : 0;
    
    // Use passing_score or default to 1.0 (100%)
    const passingScore = roundConfig.passing_score || 1.0;
    const passed = percentage >= (passingScore * 100);
    
    console.log(`Round results: ${correctCount}/${totalImages} correct (${percentage}%), passing: ${passed}`);
    
    // Prepare detailed results
    const answers = normalizedImages.map((image: any) => {
      const submission = submissions?.find((s: { image_id: string }) => s.image_id === image.id);
      return {
        question: `Image ${image.name || image.id}`,
        answer: submission?.submitted_code || '',
        correct_answer: image.code,
        is_correct: submission?.is_correct || false
      };
    });
    
    // Update round progress
    const { error: updateError } = await supabase
      .from('round_progress')
      .update({
        status: passed ? 'passed' : 'failed',
        end_time: new Date().toISOString(),
        score: {
          correctCount,
          totalImages,
          percentage,
          passed,
          totalTimeSeconds
        }
      })
      .eq('id', progressId);
    
    if (updateError) {
      console.error('Error updating round progress:', updateError);
      return NextResponse.json({ error: 'Failed to update round progress' }, { status: 500 });
    }
    
    // Call stored procedure to evaluate completion
    await supabase.rpc('evaluate_round_completion', { p_progress_id: progressId });
    
    // Format results for the frontend
    const results = {
      passed,
      correctCount,
      totalQuestions: totalImages,
      totalTime: totalTimeSeconds,
      avgResponseTime: totalImages > 0 ? totalTimeSeconds / totalImages : 0,
      answers,
      progressId // Include the progressId to help with retries
    };
    
    return NextResponse.json({ results });
    
  } catch (error) {
    console.error('Unexpected error in complete-image-round route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
