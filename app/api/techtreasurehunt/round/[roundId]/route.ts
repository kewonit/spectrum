import { createClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { roundId: string } }
) {
  try {
    const supabase = await createClient();
    const roundId = params.roundId;

    if (!roundId) {
      return NextResponse.json(
        { error: 'Round ID is required' },
        { status: 400 }
      );
    }

    console.log(`API: Fetching round data for ID: ${roundId}`);

    // Get round data
    const { data: round, error: roundError } = await supabase
      .from('event_rounds')
      .select('*')
      .eq('id', roundId)
      .single();

    if (roundError) {
      console.error('Error fetching round:', roundError);
      return NextResponse.json(
        { error: 'Failed to fetch round' },
        { status: 500 }
      );
    }

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // Debug round type
    console.log(`API: Round type: ${round.round_type}`);
    
    // Get user ID
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get registration for this event
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('id, event_id')
      .eq('event_id', round.event_id)
      .or(`individual_id.eq.${user.id},team_id.in.(select id from teams where leader_id='${user.id}')`)
      .maybeSingle();

    if (regError) {
      console.error('Error fetching registration:', regError);
      return NextResponse.json(
        { error: 'Failed to fetch registration' },
        { status: 500 }
      );
    }

    if (!registration) {
      return NextResponse.json(
        { error: 'You are not registered for this event' },
        { status: 403 }
      );
    }

    // Get round progress
    const { data: progress, error: progressError } = await supabase
      .from('round_progress')
      .select('*')
      .eq('registration_id', registration.id)
      .eq('round_id', roundId)
      .maybeSingle();

    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch round progress' },
        { status: 500 }
      );
    }

    // Modified to return the raw round data including round_type for debugging
    return NextResponse.json({
      round: {
        ...round,
        attempts: progress?.attempts || 0,
        max_attempts: progress?.max_attempts || 3
      },
      progressId: progress?.id || null,
      status: progress?.status || 'not_started'
    });
    
  } catch (error) {
    console.error('Unexpected error in round route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
