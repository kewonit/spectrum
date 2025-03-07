import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user profile data as well
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error("Failed to fetch profile:", profileError);
    }

    // Fetch user's attendance records with expanded event details and staff information
    const { data: attendance, error } = await supabase
      .from('event_attendance')
      .select(`
        id,
        is_present,
        marked_at,
        verification_method,
        events (
          id,
          name,
          description,
          event_type,
          event_start,
          event_end,
          img_url,
          whatsapp_url
        ),
        registrations (
          id,
          event_id,
          registration_status
        ),
        staff:profiles!event_attendance_marked_by_fkey (
          id,
          full_name
        )
      `)
      .eq('user_id', user.id)
      .order('marked_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      attendance,
      profile: profileData || null 
    });
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}
