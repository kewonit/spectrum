import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get current user to exclude from search
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, college_name')
      .ilike('email', `%${email}%`)
      .neq('id', user?.id) // Exclude current user
      .limit(5);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
