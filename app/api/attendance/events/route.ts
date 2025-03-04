import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }
    
    // Check if the user is authenticated (skip role check)
    const { data: currentUserProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();
      
    if (profileError) {
      console.log('Error fetching user profile:', profileError);
      // Continue anyway - all authenticated users can access events
    }
    
    // Skip role-based permission check - all authenticated users can access
    // Removed allowedRoles check
    
    // Get all active events
    const now = new Date().toISOString();
    
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, name, start_date, end_date, location")
      .order("start_date", { ascending: true });
    
    if (eventsError) {
      return NextResponse.json(
        { error: "Failed to fetch events: " + eventsError.message },
        { status: 500 }
      );
    }
    
    // Get attendance stats for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event: { id: string, name: string, start_date: string, end_date: string, location: string }) => {
        const { data: stats } = await supabase.rpc(
          'get_event_attendance_stats',
          { p_event_id: event.id }
        );
        
        return {
          ...event,
          stats: stats && stats.length > 0 ? stats[0] : {
            total_registrations: 0,
            present_count: 0,
            absent_count: 0,
            attendance_percentage: 0
          }
        };
      })
    );
    
    return NextResponse.json({ events: eventsWithStats });
    
  } catch (error: any) {
    console.error("Error fetching events for attendance:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch events: " + error.message },
      { status: 500 }
    );
  }
}
