import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Gets the active round for a user in an event
 * 
 * @param supabase - Supabase client
 * @param eventId - ID of the event
 * @param registrationId - Optional registration ID to find specific user progress
 */
export async function getActiveRound(
  supabase: SupabaseClient,
  eventId: string,
  registrationId?: string
) {
  try {
    // Get all rounds for this event - removed is_active check
    const { data: rounds, error: roundsError } = await supabase
      .from('event_rounds')
      .select('*')
      .eq('event_id', eventId)
      .order('round_number', { ascending: true });
    
    if (roundsError || !rounds || rounds.length === 0) {
      console.error('Error fetching rounds:', roundsError);
      return null;
    }
    
    // If no registration ID provided, just return the first active round
    if (!registrationId) {
      return rounds[0];
    }
    
    // Get user's progress for these rounds
    const { data: progress, error: progressError } = await supabase
      .from('round_progress')
      .select('round_id, status')
      .eq('registration_id', registrationId)
      .in('round_id', rounds.map(r => r.id));
    
    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return null;
    }
    
    // Create a map of round_id to status
    const progressMap = new Map();
    progress?.forEach(p => progressMap.set(p.round_id, p.status));
    
    // Find the first round that is not completed or failed
    for (const round of rounds) {
      const status = progressMap.get(round.id);
      
      // If no progress or progress is not 'passed', this is the active round
      if (!status || (status !== 'passed' && status !== 'completed')) {
        return round;
      }
    }
    
    // If all rounds are passed, return the highest round
    return rounds[rounds.length - 1];
  } catch (error) {
    console.error('Error in getActiveRound:', error);
    return null;
  }
}

/**
 * Gets user's progress for a specific round
 * 
 * @param supabase - Supabase client
 * @param registrationId - ID of the registration
 * @param roundId - ID of the round
 */
export async function getUserProgress(
  supabase: SupabaseClient,
  registrationId: string,
  roundId: string
) {
  try {
    const { data, error } = await supabase
      .from('round_progress')
      .select('*')
      .eq('registration_id', registrationId)
      .eq('round_id', roundId)
      .order('created_at', { ascending: false })
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    return null;
  }
}

/**
 * Gets user registration for an event with proper role check
 * - For individual events: user must be registered individually
 * - For team events: user must be the team leader
 */
export async function getUserRegistrationForEvent(
  supabase: SupabaseClient,
  eventId: string,
  userId: string
) {
  // First check for individual registration
  const { data: individualReg, error: indError } = await supabase
    .from('registrations')
    .select('id, individual_id')
    .eq('event_id', eventId)
    .eq('individual_id', userId)
    .maybeSingle();
  
  if (indError) {
    console.error('Error checking individual registration:', indError);
    return null;
  }
  
  if (individualReg) {
    return {
      id: individualReg.id,
      type: 'individual',
      userId
    };
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
  
  // Fix: Handle case where registrations could be an array
  if (teamReg && teamReg.registrations) {
    const registrations = teamReg.registrations;
    const regId = Array.isArray(registrations) && registrations.length > 0
      ? registrations[0].id 
      : typeof registrations === 'object' 
        ? (registrations as any).id
        : null;
        
    if (regId) {
      return {
        id: regId,
        type: 'team',
        teamId: teamReg.id,
        userId
      };
    }
  }
  
  return null;
}

/**
 * Check if a progress record is owned by the user
 * Verifies either direct ownership (individual) or team leadership (team)
 */
export async function verifyProgressOwnership(
  supabase: SupabaseClient,
  progressId: string,
  userId: string
): Promise<boolean> {
  try {
    // Fetch the registration associated with this progress
    const { data: progressData, error: progressError } = await supabase
      .from('round_progress')
      .select('registration_id')
      .eq('id', progressId)
      .single();
    
    if (progressError || !progressData?.registration_id) {
      console.error('Error fetching progress data:', progressError);
      return false;
    }

    // Check if this is an individual registration
    const { data: indivReg, error: indivError } = await supabase
      .from('registrations')
      .select('individual_id')
      .eq('id', progressData.registration_id)
      .single();
    
    if (!indivError && indivReg?.individual_id) {
      // Individual registration - check if user is the registrant
      return indivReg.individual_id === userId;
    }
    
    // Check if this is a team registration
    const { data: teamReg, error: teamError } = await supabase
      .from('registrations')
      .select('team_id')
      .eq('id', progressData.registration_id)
      .single();
    
    if (!teamError && teamReg?.team_id) {
      // Team registration - check if user is a member of the team
      const { data: member, error: memberError } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamReg.team_id)
        .eq('member_id', userId)
        .eq('invitation_status', 'accepted')
        .single();
      
      if (!memberError && member) {
        return true; // User is a team member
      }
      
      // Also check if user is team leader
      const { data: team, error: teamLeaderError } = await supabase
        .from('teams')
        .select('leader_id')
        .eq('id', teamReg.team_id)
        .single();
      
      if (!teamLeaderError && team?.leader_id === userId) {
        return true; // User is team leader
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in verifyProgressOwnership:', error);
    return false;
  }
}

// New utility function to get image round data
export async function getImageRoundData(
  supabase: SupabaseClient,
  roundId: string
) {
  try {
    const { data, error } = await supabase
      .from('image_code_rounds')
      .select('*')
      .eq('round_id', roundId)
      .single();
      
    if (error) {
      console.error('Error fetching image round data:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getImageRoundData:', error);
    return null;
  }
}

/**
 * Handles round initialization based on round type
 */
export async function initializeRound(supabase: SupabaseClient, roundId: string, progressId: string, roundType: string) {
  switch (roundType) {
    case 'math_quiz':
      return generateMathQuestions(supabase, roundId, progressId);
    case 'image_code':
      return setupImageCodeRound(supabase, roundId, progressId);
    case 'code_hunt':
      return generateCodeHuntQuestions(supabase, roundId, progressId);
    default:
      console.log(`No special initialization for round type: ${roundType}`);
      return true;
  }
}

/**
 * Generate math questions for a quiz round
 */
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

/**
 * Setup an image code round - enhanced to handle both schema formats
 */
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
      
      try {
        // First try with the newer schema
        const { error: newSchemaError } = await supabase
          .from('image_code_rounds')
          .insert({
            round_id: roundId,
            images: [
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
            ],
            time_limit: 600 // 10 minutes
          });

        if (newSchemaError) {
          console.error('Error with new schema, trying alternate format:', newSchemaError);
          
          // If that fails, try with the alternate schema format
          const { error: oldSchemaError } = await supabase
            .from('image_code_rounds')
            .insert({
              round_id: roundId,
              image_count: 3,
              images: [
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
              ],
              time_limit: 600
            });
            
          if (oldSchemaError) {
            console.error('Error with alternate schema format:', oldSchemaError);
            throw new Error('Failed to create image code round with both schema attempts');
          }
        }
      } catch (schemaError) {
        console.error('Schema error:', schemaError);
        throw new Error('Failed to create image code round: ' + String(schemaError));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in setupImageCodeRound:', error);
    throw error;
  }
}

/**
 * Get normalized image data from a round regardless of database schema
 */
export async function getNormalizedImageData(supabase: SupabaseClient, roundId: string) {
  try {
    const { data, error } = await supabase
      .from('image_code_rounds')
      .select('*')
      .eq('round_id', roundId)
      .single();
      
    if (error) {
      console.error('Error fetching image round data:', error);
      return [];
    }
    
    if (!data || !data.images) return [];
    
    // Handle different image data formats
    const images = data.images;
    let normalizedImages: any[] = [];
    
    if (Array.isArray(images)) {
      normalizedImages = images.map((img: any, index: number) => {
        // Convert from either format to our standard format
        return {
          id: img.id || crypto.randomUUID(),
          url: img.image_url || img.url || `https://placehold.co/600x400/png?text=Image+${index+1}`,
          code: img.code || `CODE${index+1}`,
          hint: img.hint || 'Look carefully at the image',
          max_attempts: img.max_attempts || 3
        };
      });
    }
    
    return normalizedImages;
  } catch (error) {
    console.error('Error in getNormalizedImageData:', error);
    return [];
  }
}

/**
 * Generate code hunt questions
 */
async function generateCodeHuntQuestions(supabase: SupabaseClient, roundId: string, progressId: string) {
  // Implementation for code hunt questions
  // ...existing code...
  return true;
}
