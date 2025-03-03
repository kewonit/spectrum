import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Server-side cache with ttl
const CACHE_TTL = 60 * 1000; // 60 seconds
const cache = new Map<string, {data: any, timestamp: number}>();

export async function GET(req: NextRequest) {
  try {
    // Get request-specific parameters
    const eventId = 'e47b5692-1e66-4f06-9362-f5727f27e167'; // Tech Treasure Hunt ID
    const roundNumber = req.nextUrl.searchParams.get('round') 
      ? parseInt(req.nextUrl.searchParams.get('round') || '0', 10) 
      : undefined;
    
    // Construct cache key
    const cacheKey = `leaderboard:${eventId}:${roundNumber || 'all'}`;
    
    // Get client timestamp header (if any)
    const clientTimestamp = req.headers.get('x-client-timestamp');
    
    // Check cache and bypass only if forced
    const cachedItem = cache.get(cacheKey);
    const now = Date.now();
    
    if (cachedItem && (now - cachedItem.timestamp < CACHE_TTL)) {
      // Log cache hit
      console.log(`Cache hit for ${cacheKey} (age: ${(now - cachedItem.timestamp)/1000}s)`);
      
      // Add cache header to response
      return NextResponse.json(cachedItem.data, {
        headers: {
          'x-cache': 'HIT',
          'x-cache-age': `${(now - cachedItem.timestamp)/1000}s`
        }
      });
    }
    
    // Cache miss or expired, fetch new data
    console.log(`Cache miss for ${cacheKey}, fetching from database`);
    
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_event_leaderboard', {
      p_event_id: eventId,
      p_include_round_filter: roundNumber ? true : false,
      p_round_number: roundNumber || 0
    });
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch leaderboard data'
      }, { status: 500 });
    }
    
    // Prepare response data
    const responseData = { 
      leaders: data || [],
      timestamp: now
    };
    
    // Store in cache
    cache.set(cacheKey, {
      data: responseData,
      timestamp: now
    });
    
    // Return response with cache miss header
    return NextResponse.json(responseData, {
      headers: {
        'x-cache': 'MISS',
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
