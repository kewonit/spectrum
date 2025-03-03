import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the round ID from query parameters
    const roundId = req.nextUrl.searchParams.get('roundId');
    
    if (!roundId) {
      return NextResponse.json({ error: 'Round ID is required' }, { status: 400 });
    }
    
    // Fetch round information
    const { data: round, error } = await supabase
      .from('event_rounds')
      .select('*')
      .eq('id', roundId)
      .single();
    
    if (error) {
      console.error('Error fetching round info:', error);
      return NextResponse.json({ error: 'Failed to fetch round information' }, { status: 500 });
    }
    
    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }
    
    return NextResponse.json({ round });
    
  } catch (error) {
    console.error('Error in round-info API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
