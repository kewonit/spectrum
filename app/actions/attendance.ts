'use server';

/**
 * Server action to mark attendance
 */
export async function markAttendanceAction(userId: string, notes: string = 'Marked via QR scan') {
  try {
    // Create URL parameters
    const params = new URLSearchParams();
    params.append('userId', userId);

    // Send the request to your API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/attendance/mark?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        verificationMethod: 'qr_code',
        notes
      }),
      cache: 'no-store',
    });

    // Return the response directly to be handled by the client
    const data = await response.json();
    
    // Add a status flag to help client-side code understand the result
    return {
      ...data,
      success: response.ok,
      status: response.status,
      alreadyMarked: response.status === 409 && data.alreadyMarked
    };
  } catch (error: any) {
    console.error('Error in markAttendanceAction:', error);
    return { 
      success: false, 
      error: error.message || 'An error occurred marking attendance' 
    };
  }
}

/**
 * Server action to fetch attendance stats
 */
export async function getAttendanceStatsAction() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/attendance/stats`, {
      cache: 'no-store',
    });
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      today: data?.today || 0,
      total: data?.total || 0,
      error: !response.ok ? data.error : null
    };
  } catch (error: any) {
    console.error('Error fetching attendance stats:', error);
    return { 
      success: false, 
      today: 0, 
      total: 0, 
      error: error.message || 'Failed to load attendance stats' 
    };
  }
}

/**
 * Server action to fetch attendance history
 */
export async function getAttendanceHistoryAction(page: number = 0, limit: number = 10) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/attendance/history?page=${page}&limit=${limit}`,
      { cache: 'no-store' }
    );
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data?.data || [],
      hasMore: data?.hasMore || false,
      error: !response.ok ? data.error : null
    };
  } catch (error: any) {
    console.error('Error fetching attendance history:', error);
    return { 
      success: false, 
      data: [], 
      hasMore: false, 
      error: error.message || 'Failed to load attendance history' 
    };
  }
}
