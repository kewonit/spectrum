import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // Can be 'active', 'closed', or null (all)
    
    const supabase = await createClient();

    // Check for authentication - optional, can be removed if you want public access
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json(
        { error: "Not authenticated" }, 
        { status: 401 }
      );
    }

    // Build the query based on status parameter
    let query = supabase.from("events").select("*");
    
    // Apply filters based on status parameter
    if (status === 'active') {
      // Active events: is_active is true AND end_date is in the future
      const now = new Date().toISOString();
      query = query
        .eq('is_active', true)
        .gt('event_end', now);
    } else if (status === 'closed') {
      // Closed events: either is_active is false OR end_date is in the past
      const now = new Date().toISOString();
      query = query.or(`is_active.eq.false,event_end.lt.${now}`);
    }

    // Execute the query
    const { data: events, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch events" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
