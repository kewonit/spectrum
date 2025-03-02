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
) {
  // Get the progress record with registration details
  const { data: progress, error: progressError } = await supabase
    .from('round_progress')
    .select(`
      id,
      registration_id,
      registrations (
        id,
        individual_id,
        team_id
      )
    `)
    .eq('id', progressId)
    .single();
  
  if (progressError || !progress) {
    console.error('Error verifying progress ownership:', progressError);
    return false;
  }
  
  // Fix: Handle case where registrations could be an array
  const registrations = Array.isArray(progress.registrations) 
    ? progress.registrations[0] 
    : progress.registrations;
  
  if (!registrations) {
    return false;
  }
  
  // Check individual ownership
  if (registrations.individual_id === userId) {
    return true;
  }
  
  // Check team leadership
  if (registrations.team_id) {
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('leader_id')
      .eq('id', registrations.team_id)
      .single();
    
    if (teamError) {
      console.error('Error checking team leadership:', teamError);
      return false;
    }
    
    return team.leader_id === userId;
  }
  
  return false;
}
