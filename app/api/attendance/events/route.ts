import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { checkAttendancePermission } from "@/app/utils/permissions";

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
    
    // Check if user has permission to access attendance data
    const { isAllowed, error: permissionError } = await checkAttendancePermission(
      supabase,
      user.email
    );
    
    if (!isAllowed) {
      return NextResponse.json(
        { error: permissionError || "You don't have permission to access attendance events." },
        { status: 403 }
      );
    }
    
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
