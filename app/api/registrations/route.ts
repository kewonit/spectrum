import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { slugify } from "@/app/utils/slugify";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get("name");

    if (!eventSlug) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: events, error } = await supabase
      .from("events")
      .select("*");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Find the event by comparing slugified names
    const event = events.find(e => slugify(e.name) === eventSlug);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { eventId, type, teamId } = await request.json();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registration = {
      event_id: eventId,
      ...(type === 'solo' 
        ? { individual_id: user.id }
        : { team_id: teamId }
      )
    };

    const { error } = await supabase
      .from('registrations')
      .insert(registration);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register" },
      { status: 500 }
    );
  }
}