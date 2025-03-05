import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
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
    
    // Get the request body with better error handling
    let userId;
    let verificationMethod = 'qr_code';
    let notes = null;
    
    try {
      const body = await request.json();
      userId = body.userId;
      verificationMethod = body.verificationMethod || 'qr_code';
      notes = body.notes || null;
    } catch (error) {
      console.error('Error parsing request body:', error);
      
      // Try to get userId directly from URL if JSON parsing fails
      const url = new URL(request.url);
      userId = url.searchParams.get('userId');
      
      if (!userId) {
        return NextResponse.json(
          { error: "Invalid request format. Please provide a valid user ID." },
          { status: 400 }
        );
      }
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    console.log('Attendance mark request received for userId:', userId);
    
    // Clean and sanitize userId to handle various formats
    // Strip any non-alphanumeric and dash characters (keeping only valid UUID chars)
    const cleanUserId = userId.toString().trim().replace(/[^a-zA-Z0-9-]/g, '');
    
    console.log('Cleaned userId for lookup:', cleanUserId);
    
    // Check if the user is authenticated (skip role-based permission)
    const { data: currentUserProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching marker profile:', profileError);
      // Continue anyway, just log the error
      console.log('Proceeding with attendance marking despite profile fetch error');
    }
    
    // Skip role checks - allow any authenticated user to mark attendance
    // Removed role-based permission check
    
    // Try two different ways to find the profile
    // 1. First try as direct UUID match
    let attendeeProfileQuery = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", cleanUserId)
      .maybeSingle();
      
    let attendeeProfile = attendeeProfileQuery.data;
    let attendeeError = attendeeProfileQuery.error;
    
    // 2. If not found, try with case-insensitive LIKE search
    if (!attendeeProfile && !attendeeError) {
      console.log('Profile not found with direct match, trying case-insensitive search');
      
      const likeQuery = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .ilike("id", `%${cleanUserId}%`)
        .maybeSingle();
      
      attendeeProfile = likeQuery.data;
      attendeeError = likeQuery.error;
    }
    
    // 3. If still not found and looks like email, try finding by email
    if (!attendeeProfile && !attendeeError && userId.includes('@')) {
      console.log('Trying to find profile by email');
      
      const emailQuery = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .ilike("email", userId)
        .maybeSingle();
      
      attendeeProfile = emailQuery.data;
      attendeeError = emailQuery.error;
    }
    
    console.log('Attendance lookup result:', { 
      attendeeProfile, 
      attendeeError, 
      userId: cleanUserId 
    });
      
    if (attendeeError) {
      console.error('Database error when looking up profile:', attendeeError);
      return NextResponse.json(
        { error: "Database error when looking up user: " + attendeeError.message },
        { status: 500 }
      );
    }
    
    if (!attendeeProfile) {
      return NextResponse.json(
        { error: "User profile not found. Please check the QR code or user ID." },
        { status: 404 }
      );
    }
    
    // Use the validated attendee profile ID for all subsequent operations
    const validatedUserId = attendeeProfile.id;

    // Find all events the user is registered for
    // First, get individual registrations
    const { data: individualRegistrations, error: indRegError } = await supabase
      .from("registrations")
      .select(`
        id, 
        event_id,
        events:event_id (
          id,
          name
        )
      `)
      .eq('individual_id', validatedUserId)
      .eq('registration_status', 'confirmed');

    if (indRegError) {
      console.error('Error fetching individual registrations:', indRegError);
      return NextResponse.json(
        { error: "Failed to fetch user registrations: " + indRegError.message },
        { status: 500 }
      );
    }

    // Then, get team memberships
    const { data: teamMemberships, error: teamMemberError } = await supabase
      .from("team_members")
      .select(`
        team_id
      `)
      .eq('member_id', validatedUserId)
      .eq('invitation_status', 'accepted');

    if (teamMemberError) {
      console.error('Error fetching team memberships:', teamMemberError);
      return NextResponse.json(
        { error: "Failed to fetch team memberships: " + teamMemberError.message },
        { status: 500 }
      );
    }

    // Get team registrations if any team memberships exist
    let teamRegistrations: any[] = [];
    if (teamMemberships && teamMemberships.length > 0) {
      const teamIds = teamMemberships.map(tm => tm.team_id);
      
      const { data: teamsRegs, error: teamRegError } = await supabase
        .from("registrations")
        .select(`
          id,
          event_id,
          events:event_id (
            id,
            name
          )
        `)
        .in('team_id', teamIds)
        .eq('registration_status', 'confirmed');
      
      if (teamRegError) {
        console.error('Error fetching team registrations:', teamRegError);
        return NextResponse.json(
          { error: "Failed to fetch team registrations: " + teamRegError.message },
          { status: 500 }
        );
      }
      
      if (teamsRegs) {
        teamRegistrations = teamsRegs;
      }
    }

    // Combine individual and team registrations
    const userRegistrations = [
      ...(individualRegistrations || []),
      ...teamRegistrations
    ];

    if (!userRegistrations || userRegistrations.length === 0) {
      console.log('No registrations found for user:', validatedUserId);
      
      // If not registered for any events but we want to mark them present anyway
      // We'll mark them for a default event (e.g. all active events)
      
      // Get active events
      const { data: activeEvents, error: eventsError } = await supabase
        .from("events")
        .select("id, name")
        .eq("is_active", true)
        .limit(1);
        
      if (eventsError || !activeEvents || activeEvents.length === 0) {
        return NextResponse.json(
          { error: "User is not registered for any events and no active events found" },
          { status: 404 }
        );
      }
      
      // Create a synthetic registration for the first active event
      const defaultEvent = activeEvents[0];
      
      // Call the SQL function to mark attendance for the default event
      const { data: result, error: markError } = await supabase.rpc(
        'mark_user_attendance',
        {
          p_user_id: validatedUserId,
          p_is_present: true,
          p_event_ids: [defaultEvent.id],
          p_marked_by: user.id,
          p_verification_method: verificationMethod,
          p_verification_data: { scanned_by: user.id, timestamp: new Date().toISOString() },
          p_notes: notes || 'Default attendance - not registered'
        }
      );
      
      if (markError) {
        console.error('Error marking default attendance:', markError);
        return NextResponse.json(
          { error: "Failed to mark attendance: " + markError.message },
          { status: 500 }
        );
      }
      
      // Revalidate the attendance page to show updated data
      revalidatePath("/dashboard/mark-attendance");
      
      return NextResponse.json({
        success: true,
        message: `Successfully marked ${attendeeProfile.full_name} as present (default)`,
        attendee: attendeeProfile,
        eventIds: [defaultEvent.id],
        eventNames: [defaultEvent.name],
        eventCount: 1,
        isDefaultAttendance: true
      });
    }
    
    // Extract event IDs and names
    const eventIds = userRegistrations.map(reg => reg.event_id);
    
    // Handle events field format safely
    const eventNames = userRegistrations.map(reg => {
      if (!reg.events) return "Unknown Event";
      
      // Ensure proper type handling by explicitly casting
      const events = reg.events as any;
      
      // Handle both array and object formats
      if (Array.isArray(events)) {
        return events[0]?.name || "Unknown Event";
      } else if (typeof events === 'object') {
        return events.name || "Unknown Event";
      } else {
        return "Unknown Event";
      }
    });
    
    console.log('Found registrations:', {
      count: eventIds.length,
      eventIds,
      eventNames
    });
    
    // Call the SQL function to mark attendance for all registered events
    const { data: result, error: markError } = await supabase.rpc(
      'mark_user_attendance',
      {
        p_user_id: validatedUserId,
        p_is_present: true,
        p_event_ids: eventIds,
        p_marked_by: user.id,
        p_verification_method: verificationMethod,
        p_verification_data: { scanned_by: user.id, timestamp: new Date().toISOString() },
        p_notes: notes || null
      }
    );
    
    if (markError) {
      console.error('Error marking attendance:', markError);
      return NextResponse.json(
        { error: "Failed to mark attendance: " + markError.message },
        { status: 500 }
      );
    }
    
    // Revalidate the attendance page to show updated data
    revalidatePath("/dashboard/mark-attendance");
    
    return NextResponse.json({
      success: true,
      message: `Successfully marked ${attendeeProfile.full_name} as present`,
      attendee: attendeeProfile,
      eventIds,
      eventNames,
      eventCount: eventIds.length
    });
    
  } catch (error: any) {
    console.error("Error marking attendance:", error);
    
    return NextResponse.json(
      { error: error?.message || "Failed to mark attendance" },
      { status: 500 }
    );
  }
}
