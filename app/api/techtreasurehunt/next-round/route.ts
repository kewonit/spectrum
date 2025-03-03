import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const currentRoundId = req.nextUrl.searchParams.get('currentRoundId');
    
    if (!currentRoundId) {
      return NextResponse.json({ error: 'Current round ID is required' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // First get the current round info to get its event_id and round_number
    const { data: currentRound, error: currentError } = await supabase
      .from('event_rounds')
      .select('event_id, round_number')
      .eq('id', currentRoundId)
      .single();
    
    if (currentError || !currentRound) {
      console.error("Error fetching current round:", currentError);
      return NextResponse.json({ error: 'Current round not found' }, { status: 404 });
    }
    
    // Now get the next round (if any)
    const { data: nextRound, error: nextError } = await supabase
      .from('event_rounds')
      .select('*')
      .eq('event_id', currentRound.event_id)
      .eq('round_number', currentRound.round_number + 1)
      .eq('is_active', true)
      .single();
    
    if (nextError && nextError.code !== 'PGRST116') { // PGRST116 is "no rows returned" - not a real error
      console.error("Error fetching next round:", nextError);
      return NextResponse.json({ error: 'Error fetching next round' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      hasNextRound: !!nextRound,
      nextRound: nextRound || null
    });
  } catch (error) {
    console.error("Error in next-round API:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
