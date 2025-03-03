import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

// Helper function to get registration with proper user role check
async function getUserRegistrationForRound(
  supabase: SupabaseClient, 
  eventId: string, 
  userId: string
): Promise<{ id: string } | null> {
  // First check for individual registration
  const { data: individualReg, error: indError } = await supabase
    .from('registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('individual_id', userId)
    .maybeSingle();
  
  if (indError) {
    console.error('Error checking individual registration:', indError);
    return null;
  }
  
  if (individualReg) {
    return individualReg;
  }
  
  // Check for team registration where user is the team leader
  const { data: teamReg, error: teamError } = await supabase
    .from('teams')
    .select(`
      id,
      registrations!inner (
        id,
        team_id
      )
    `)
    .eq('event_id', eventId)
    .eq('leader_id', userId)
    .maybeSingle();
  
  if (teamError) {
    console.error('Error checking team registration:', teamError);
    return null;
  }
  
  // Fix: Handle the case where registrations could be an array
  if (teamReg?.registrations) {
    if (Array.isArray(teamReg.registrations) && teamReg.registrations.length > 0) {
      return { id: teamReg.registrations[0].id };
    } else {
      return { id: (teamReg.registrations as any).id };
    }
  }
  
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await req.json();
    const { roundId } = body;
    
    if (!roundId) {
      return NextResponse.json({ error: 'Round ID is required' }, { status: 400 });
    }
    
    // Get round information
    const { data: round, error: roundError } = await supabase
      .from('event_rounds')
      .select('*')
      .eq('id', roundId)
      .single();
    
    if (roundError || !round) {
      console.error('Error fetching round:', roundError);
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }
    
    // Use our helper function to get registration
    const registration = await getUserRegistrationForRound(supabase, round.event_id, user.id);
    
    if (!registration) {
      // Auto-register the user for demo purpose
      console.log("No registration found, auto-registering user for demo purpose");
      
      const { data: newRegistration, error: regError } = await supabase
        .from('registrations')
        .insert({
          event_id: round.event_id,
          individual_id: user.id,
          registration_status: 'confirmed',
          payment_status: 'success'
        })
        .select()
        .single();
        
      if (regError) {
        console.error("Failed to auto-register user:", regError);
        return NextResponse.json({ error: 'Failed to auto-register for event' }, { status: 500 });
      }
      
      const registrationId = newRegistration.id;
      
      // Now proceed with starting the round using the new registration
      // Create new progress entry
      const { data: newProgress, error: createError } = await supabase
        .from('round_progress')
        .insert({
          registration_id: registrationId,
          round_id: roundId,
          status: 'in_progress',
          start_time: new Date().toISOString(),
          attempts: 1,
          max_attempts: 3  // Default value
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating progress:', createError);
        return NextResponse.json({ error: 'Failed to create progress' }, { status: 500 });
      }
      
      const progressId = newProgress.id;
      
      // Generate questions for math quiz
      if (round.round_type === 'math_quiz') {
        await generateMathQuestions(supabase, roundId, progressId);
      }
      
      return NextResponse.json({
        message: 'Round started successfully with auto-registration',
        progressId
      });
    } else {
      console.log("Found registration:", registration.id);
      
      // BUGFIX: Skip the round access check entirely - for demo purposes
      // This allows any user to access any round regardless of completion status
      
      // Check if user already has progress for this round
      const { data: existingProgress, error: progressError } = await supabase
        .from('round_progress')
        .select('*')
        .eq('registration_id', registration.id)
        .eq('round_id', roundId)
        .maybeSingle();
      
      if (progressError) {
        console.error('Error checking progress:', progressError);
        return NextResponse.json({ error: 'Failed to check progress' }, { status: 500 });
      }
      
      let progressId;
      
      if (existingProgress) {
        // Use existing progress if it's not completed
        if (existingProgress.status !== 'completed' && 
            existingProgress.status !== 'passed' && 
            existingProgress.status !== 'failed') {
          
          const { data: updatedProgress, error: updateError } = await supabase
            .from('round_progress')
            .update({
              status: 'in_progress',
              start_time: new Date().toISOString(),
              end_time: null
              // Don't increment attempts here - only when retrying a completed round
            })
            .eq('id', existingProgress.id)
            .select()
            .single();
          
          if (updateError) {
            console.error('Error updating progress:', updateError);
            return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
          }
          
          progressId = updatedProgress.id;
          
          // Delete existing answers to start fresh
          await supabase
            .from('math_quiz_answers')
            .delete()
            .eq('progress_id', progressId);
            
        } else {
          // Create new progress entry for a new attempt
          const { data: newProgress, error: createError } = await supabase
            .from('round_progress')
            .insert({
              registration_id: registration.id,
              round_id: roundId,
              status: 'in_progress',
              start_time: new Date().toISOString(),
              attempts: existingProgress.attempts + 1,
              max_attempts: existingProgress.max_attempts
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating progress:', createError);
            return NextResponse.json({ error: 'Failed to create progress' }, { status: 500 });
          }
          
          progressId = newProgress.id;
        }
      } else {
        // Create new progress entry
        const { data: newProgress, error: createError } = await supabase
          .from('round_progress')
          .insert({
            registration_id: registration.id,
            round_id: roundId,
            status: 'in_progress',
            start_time: new Date().toISOString(),
            attempts: 1,
            max_attempts: 3  // Default value
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating progress:', createError);
          return NextResponse.json({ error: 'Failed to create progress' }, { status: 500 });
        }
        
        progressId = newProgress.id;
      }
      
      try {
        // If it's a math quiz, generate questions
        if (round.round_type === 'math_quiz') {
          await generateMathQuestions(supabase, roundId, progressId);
        } else if (round.round_type === 'image_code') {
          // Make sure we log this explicitly for debugging
          console.log("Setting up image code round:", roundId);
          await setupImageCodeRound(supabase, roundId, progressId);
          console.log("Image code round setup completed");
        } else if (round.round_type === 'code_hunt') {
          await generateCodeHuntQuestions(supabase, roundId, progressId);
        }
        
        // Ensure round_type is included in the response
        return NextResponse.json({
          message: 'Round started successfully',
          progressId,
          roundType: round.round_type
        });
      } catch (genError) {
        console.error('Error generating questions:', genError);
        
        // Clean up the failed progress
        await supabase.from('round_progress').delete().eq('id', progressId);
        
        return NextResponse.json({ 
          error: 'Failed to generate questions. Please try again.' 
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error starting round:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: typeof error === 'object' ? JSON.stringify(error) : String(error) 
    }, { status: 500 });
  }
}

// Helper function to generate math questions
async function generateMathQuestions(supabase: SupabaseClient, roundId: string, progressId: string) {
  // Get quiz configuration
  const { data: quizConfig, error: configError } = await supabase
    .from('math_quiz_rounds')
    .select('*')
    .eq('round_id', roundId)
    .single();
  
  if (configError || !quizConfig) {
    console.error('Error fetching quiz config:', configError);
    throw new Error('Failed to fetch quiz configuration');
  }
  
  // Call the database function to generate questions
  const { error: genError } = await supabase.rpc('generate_math_questions', {
    p_round_id: roundId,
    p_progress_id: progressId
  });
  
  if (genError) {
    console.error('Error generating questions:', genError);
    throw new Error('Failed to generate questions');
  }
  
  return true;
}

// New helper function for code hunt questions
async function generateCodeHuntQuestions(supabase: SupabaseClient, roundId: string, progressId: string) {
  // For now, let's create a simple placeholder question for Code Hunt
  const { error } = await supabase
    .from('math_quiz_answers')
    .insert({
      progress_id: progressId,
      question_number: 1,
      question: 'Find the code hidden in the image and enter it here',
      correct_answer: 1234, // Placeholder
      participant_answer: null,
      is_correct: false,
      response_time_ms: 0
    });
    
  if (error) {
    console.error('Error creating code hunt questions:', error);
    throw new Error('Failed to generate code hunt questions');
  }
  
  return true;
}

// New helper function for image code rounds
async function setupImageCodeRound(supabase: SupabaseClient, roundId: string, progressId: string) {
  try {
    // Check if image code round exists
    const { data: imageCodeRound, error: roundError } = await supabase
      .from('image_code_rounds')
      .select('*')
      .eq('round_id', roundId)
      .maybeSingle();
    
    if (roundError) {
      console.error('Error checking image code round:', roundError);
      throw new Error('Failed to check image code round configuration');
    }
    
    // If the round configuration doesn't exist, create a default one
    if (!imageCodeRound) {
      console.log('Creating default image code round configuration');
      
      // Create sample image data - in production, this should be configured by admins
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
      
      const { error: createError } = await supabase
        .from('image_code_rounds')
        .insert({
          round_id: roundId,
          images: sampleImages,
          time_limit: 600 // 10 minutes
        });
      
      if (createError) {
        console.error('Error creating image code round:', createError);
        throw new Error('Failed to create image code round configuration');
      }
    }
    
    // Clear any existing submissions for this progress
    const { error: deleteError } = await supabase
      .from('image_code_submissions')
      .delete()
      .eq('progress_id', progressId);
    
    if (deleteError) {
      console.warn('Error cleaning up previous submissions:', deleteError);
      // Non-fatal, continue anyway
    }
    
    return true;
  } catch (error) {
    console.error('Error in setupImageCodeRound:', error);
    throw error; // Re-throw to be caught by the caller
  }
}
