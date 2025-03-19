import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { UserCertificate, EventAttendance, Event } from "@/app/types/database";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get user profile to get the name
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    
    if (profileError) {
      console.warn("Could not fetch user profile:", profileError);
      // Continue without the profile, we'll just not show the name
    }
    
    // First, get the certificate data
    const { data: certificatesData, error: certError } = await supabase
      .from("user_certificates")
      .select(`
        id,
        certificate_url,
        certificate_uuid,
        created_at,
        attendance_id
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (certError) {
      console.error("Error fetching certificates:", certError);
      return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
    }
    
    // Process each certificate to get event details through the proper relationship path
    const formattedCertificates = await Promise.all(
      certificatesData.map(async (cert) => {
        // Only if we have attendance_id, try to get event data
        if (!cert.attendance_id) {
          return {
            id: cert.id,
            certificate_url: cert.certificate_url,
            certificate_uuid: cert.certificate_uuid,
            created_at: cert.created_at,
            attendance_id: null,
            event: null,
            recipient_name: profile?.full_name || undefined
          };
        }
        
        // Get event details from event_attendance -> events (follows schema relationship)
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("event_attendance")
          .select(`
            id,
            event_id,
            events:event_id (
              id,
              name,
              description,
              event_type,
              min_team_size,
              max_team_size,
              registration_start,
              registration_end,
              event_start,
              event_end,
              max_registrations,
              is_active,
              img_url,
              whatsapp_url
            )
          `)
          .eq("id", cert.attendance_id)
          .single();
          
        // Default return object with certificate data but no event
        const result = {
          id: cert.id,
          certificate_url: cert.certificate_url,
          certificate_uuid: cert.certificate_uuid,
          created_at: cert.created_at,
          attendance_id: cert.attendance_id,
          event: null as Event | null,
          recipient_name: profile?.full_name || undefined
        };
        
        // If we found event data, add it to the result
        if (!attendanceError && attendanceData?.events) {
          // Properly cast the events object to match our Event interface
          const eventData = attendanceData.events as unknown as Event;
          result.event = eventData;
        }
        
        return result;
      })
    );
    
    return NextResponse.json({ certificates: formattedCertificates });
  } catch (error) {
    console.error("Unexpected error fetching certificates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { certificateUuid } = body;
    
    if (!certificateUuid) {
      return NextResponse.json({ error: "Certificate UUID is required" }, { status: 400 });
    }
    
    // First query the certificate to get ONLY the attendance_id and basic info
    const { data: certData, error: certError } = await supabase
      .from("user_certificates")
      .select(`
        id,
        user_id,
        certificate_url,
        created_at,
        attendance_id,
        certificate_uuid
      `)
      .eq("certificate_uuid", certificateUuid)
      .single();
    
    if (certError || !certData) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    
    // Initialize default values in case we can't find event data
    let eventName = "Certificate";
    let eventId = undefined;
    let eventDescription = null;
    
    // ONLY try to get event details from the events table through attendance relation
    if (certData.attendance_id) {
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("event_attendance")
        .select(`
          id,
          event_id,
          events:event_id (
            id,
            name,
            description
          )
        `)
        .eq("id", certData.attendance_id)
        .single();
      
      if (!attendanceError && attendanceData && attendanceData.events) {
        // Access the event properties from the events table
        const eventData = attendanceData.events as unknown as { 
          id: string; 
          name: string;
          description: string | null;
        };
        
        eventName = eventData.name;
        eventId = eventData.id;
        eventDescription = eventData.description;
      } else {
        // Log the error but continue
        console.warn("Failed to retrieve event info for certificate:", certData.id);
      }
    } else {
      console.warn("Certificate has no attendance_id, cannot get event details:", certData.id);
    }
    
    // Get user profile information
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", certData.user_id)
      .single();
    
    if (profileError) {
      return NextResponse.json({ error: "Error retrieving user information" }, { status: 500 });
    }
    
    return NextResponse.json({
      verified: true,
      certificate: {
        id: certData.id,
        created_at: certData.created_at,
        recipient: profile?.full_name || "Unknown",
      }
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
