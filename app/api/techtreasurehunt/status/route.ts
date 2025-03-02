import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { getActiveRound, getUserProgress } from '@/app/utils/tech-treasure-hunt';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("User ID:", user.id); // Debug log

    // Explicitly get the Tech Treasure Hunt event by ID
    const eventId = 'e47b5692-1e66-4f06-9362-f5727f27e167';
    
    // Get event with its rounds directly by ID - removed is_active check
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        name,
        event_rounds (
          id,
          name,
          description,
          round_number,
          round_type,
          time_limit
        )
      `)
      .eq('id', eventId)
      .single();
    
    if (eventError) {
      console.error('Error fetching event:', eventError);
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
    }
    
    // If no event or no rounds
    if (!event || !event.event_rounds || 
       (Array.isArray(event.event_rounds) && event.event_rounds.length === 0)) {
      console.error('No event or rounds found for ID:', eventId);
      return NextResponse.json({ 
        status: 'not_started', 
        message: 'No active rounds available',
        debug: { eventId, foundEvent: !!event, foundRounds: event?.event_rounds?.length || 0 }
      });
    }

    console.log("Event found:", event.name, "with rounds:", 
      Array.isArray(event.event_rounds) ? event.event_rounds.length : 'object');

    // Query registration for this specific user and event
    let registration = null;
    
    // First check for individual registration
    const { data: individualRegistrations, error: indRegError } = await supabase
      .from('registrations')
      .select('id, individual_id')
      .eq('event_id', eventId)
      .eq('individual_id', user.id)
      .maybeSingle();
    
    if (indRegError) {
      console.error('Error fetching individual registrations:', indRegError);
      return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
    }
    
    if (individualRegistrations) {
      registration = individualRegistrations;
      console.log("Found individual registration:", registration.id);
    } else {
      // Check for team-based registrations where user is the team leader
      const { data: teamLeaderRegistrations, error: teamLeaderError } = await supabase
        .from('teams')
        .select(`
          id,
          registrations!inner (
            id,
            team_id
          )
        `)
        .eq('event_id', eventId)
        .eq('leader_id', user.id)
        .maybeSingle();
      
      if (teamLeaderError) {
        console.error('Error fetching team leader registrations:', teamLeaderError);
        return NextResponse.json({ error: 'Failed to fetch team registrations' }, { status: 500 });
      }
      
      if (teamLeaderRegistrations && teamLeaderRegistrations.registrations) {
        // Handle the case where registrations could be an array or a single object
        registration = Array.isArray(teamLeaderRegistrations.registrations)
          ? teamLeaderRegistrations.registrations[0]
          : teamLeaderRegistrations.registrations;
          
        console.log("Found team registration:", registration?.id);
      }
    }
    
    // If user is not registered, create a registration automatically for demo purposes
    if (!registration) {
      console.log("No registration found, auto-registering user for demo purpose");
      
      // Create a registration for this user
      const { data: newRegistration, error: regError } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          individual_id: user.id,
          registration_status: 'confirmed',
          payment_status: 'success'
        })
        .select()
        .single();
        
      if (regError) {
        console.error("Failed to auto-register user:", regError);
        return NextResponse.json({ 
          status: 'not_registered',
          message: 'You are not registered for this event and auto-registration failed'
        });
      }
      
      registration = newRegistration;
      console.log("Auto-registered user with registration ID:", registration.id);
    }
    
    const registrationId = registration.id;
    
    // Sort rounds by number, ensure we're working with an array
    const eventRounds = Array.isArray(event.event_rounds) 
      ? event.event_rounds.sort((a: any, b: any) => a.round_number - b.round_number)
      : [event.event_rounds]; // Convert to array if it's a single object
    
    console.log("Sorted rounds:", eventRounds.map((r:any) => r.round_number));
    
    // Always use the first round as the accessible round
    let accessibleRound = eventRounds[0];
    let userProgress = null;
    
    // Extract the round type from the accessible round
    const roundType = accessibleRound.round_type;
    
    // Check for user progress on first round
    const firstRoundProgress = await getUserProgress(supabase, registrationId, accessibleRound.id);
    
    if (firstRoundProgress) {
      console.log("Found progress for first round:", firstRoundProgress.status);
      userProgress = firstRoundProgress;
      
      // If first round is passed, check next rounds
      if (firstRoundProgress.status === 'passed' && eventRounds.length > 1) {
        for (let i = 1; i < eventRounds.length; i++) {
          const nextRound = eventRounds[i];
          const nextProgress = await getUserProgress(supabase, registrationId, nextRound.id);
          
          if (!nextProgress || nextProgress.status !== 'passed') {
            accessibleRound = nextRound;
            userProgress = nextProgress;
            break;
          }
        }
      }
    }
    
    console.log("Selected round:", accessibleRound.name, "Progress:", userProgress?.status || "none", "Type:", roundType);
    
    // If the user has already completed this round
    if (userProgress && (userProgress.status === 'completed' || userProgress.status === 'passed' || userProgress.status === 'failed')) {
      // Get the results for the completed round
      if (roundType === 'math_quiz') {
        const { data: results } = await supabase
          .from('math_quiz_answers')
          .select('*')
          .eq('progress_id', userProgress.id);
        
        return NextResponse.json({
          status: 'completed',
          currentRound: accessibleRound,
          progressId: userProgress.id,
          roundResults: {
            passed: userProgress.status === 'passed',
            correctCount: (results || []).filter((a: any) => a.is_correct).length,
            totalQuestions: results?.length || 0,
            totalTime: userProgress.end_time 
              ? (new Date(userProgress.end_time).getTime() - new Date(userProgress.start_time).getTime()) / 1000
              : 0,
            avgResponseTime: results?.reduce((acc: number, curr: any) => acc + (curr.response_time_ms || 0), 0) / (results?.length || 1) / 1000,
            progressId: userProgress.id, // Make sure this is included
            answers: results?.map((a: any) => ({
              question: a.question,
              answer: a.participant_answer,
              correct_answer: a.correct_answer,
              is_correct: a.is_correct
            })) || []
          }
        });
      } else if (roundType === 'image_code') {
        // Handle image_code completion results
        const { data: submissions } = await supabase
          .from('image_code_submissions')
          .select('*')
          .eq('progress_id', userProgress.id);
        
        // Get image round metadata for correct info
        const { data: imageRound } = await supabase
          .from('image_code_rounds')
          .select('*')
          .eq('round_id', accessibleRound.id)
          .single();
        
        // Check if we have the image round data
        if (!imageRound || !imageRound.images) {
          console.error("Missing image_code_rounds data for completed round:", accessibleRound.id);
          // Return generic completion info if we can't find detailed data
          return NextResponse.json({
            status: 'completed',
            currentRound: accessibleRound,
            progressId: userProgress.id,
            roundResults: {
              passed: userProgress.status === 'passed',
              score: userProgress.score || {},
              totalTime: userProgress.end_time 
                ? (new Date(userProgress.end_time).getTime() - new Date(userProgress.start_time).getTime()) / 1000
                : 0
            }
          });
        }
        
        // Map submissions to images with correct code info
        const imageResults = (imageRound?.images || []).map((img: any) => {
          const submission = submissions?.find((s: any) => s.image_id === img.id);
          return {
            id: img.id,
            url: img.url,
            correctCode: img.code,
            submittedCode: submission?.submitted_code || null,
            isCorrect: submission?.is_correct || false,
            attempts: submission?.attempts || 0
          };
        });
        
        return NextResponse.json({
          status: 'completed',
          currentRound: accessibleRound,
          progressId: userProgress.id,
          roundResults: {
            passed: userProgress.status === 'passed',
            correctCount: (submissions || []).filter((s: any) => s.is_correct).length,
            totalImages: imageRound?.images?.length || 0,
            totalTime: userProgress.end_time 
              ? (new Date(userProgress.end_time).getTime() - new Date(userProgress.start_time).getTime()) / 1000
              : 0,
            progressId: userProgress.id,
            images: imageResults
          }
        });
      } else {
        // Handle other round types with default format
        return NextResponse.json({
          status: 'completed',
          currentRound: accessibleRound,
          progressId: userProgress.id,
          roundResults: {
            passed: userProgress.status === 'passed',
            score: userProgress.score || {},
            totalTime: userProgress.end_time 
              ? (new Date(userProgress.end_time).getTime() - new Date(userProgress.start_time).getTime()) / 1000
              : 0
          }
        });
      }
    }
    
    // If the user has started but not completed this round
    if (userProgress && userProgress.status === 'in_progress') {
      // Make sure we return the actual round type from the round itself,
      // not potentially incorrect data from elsewhere
      return NextResponse.json({
        status: 'in_progress',
        currentRound: accessibleRound,
        progressId: userProgress.id,
        roundType: accessibleRound.round_type // Use accessibleRound.round_type instead of roundType variable
      });
    }
    
    // Default case: round available but not started
    return NextResponse.json({
      status: 'not_started',
      currentRound: accessibleRound
    });
    
  } catch (error) {
    console.error('Error in tech treasure hunt status:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
