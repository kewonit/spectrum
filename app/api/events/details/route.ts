import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { slugify } from "@/app/utils/slugify";

export async function GET(request: Request) {
  try {
    // Get authenticated user first
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json(
        { error: "Not authenticated" }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get("name");

    if (!eventSlug) {
      return NextResponse.json(
        { error: "Event name is required" }, 
        { status: 400 }
      );
    }

    // Fetch all events and find the matching one
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*");

    if (eventsError) {
      console.error("Database error:", eventsError);
      return NextResponse.json(
        { error: "Failed to fetch events" }, 
        { status: 500 }
      );
    }

    const event = events.find(e => slugify(e.name) === eventSlug);

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
