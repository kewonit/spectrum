import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Create a non-cached function to fetch leaderboard data
async function fetchLeaderboardData(supabase: any, eventId: string, roundNumber?: number) {
  // Query for leaderboard data with optimized fields
  const { data, error } = await supabase.rpc('get_event_leaderboard', {
    p_event_id: eventId,
    p_include_round_filter: roundNumber ? true : false,
    p_round_number: roundNumber || 0
  });
  
  if (error) {
    console.error('Error fetching leaderboard:', error);
    return { leaders: [] };
  }
  
  return { leaders: data || [] };
}

// Simple client-side cache with expiration
const cache = new Map();
const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function GET(req: NextRequest) {
  try {
    const eventId = 'e47b5692-1e66-4f06-9362-f5727f27e167'; // Tech Treasure Hunt ID
    
    // Get optional round filter from query params
    const roundNumber = req.nextUrl.searchParams.get('round') 
      ? parseInt(req.nextUrl.searchParams.get('round') || '0', 10) 
      : undefined;
    
    // Create cache key
    const cacheKey = `leaderboard:${eventId}:${roundNumber || 'all'}`;
    
    // Check if we have a valid cached response
    const cachedItem = cache.get(cacheKey);
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_DURATION)) {
      return NextResponse.json(cachedItem.data);
    }
    
    // No valid cache, fetch fresh data
    const supabase = await createClient();
    const data = await fetchLeaderboardData(supabase, eventId, roundNumber);
    
    // Cache the response
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
