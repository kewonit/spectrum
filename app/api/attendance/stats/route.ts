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
    
    // Get today's date in UTC format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    
    // Get attendance count for today
    const { count: todayCount, error: todayError } = await supabase
      .from("event_attendance")
      .select("id", { count: 'exact', head: true })
      .gte("marked_at", todayStr);
      
    if (todayError) {
      console.error("Error fetching today's attendance:", todayError);
      return NextResponse.json({
        today: 0,
        total: 0
      });
    }
    
    // Get total attendance count
    const { count: totalCount, error: totalError } = await supabase
      .from("event_attendance")
      .select("id", { count: 'exact', head: true })
      .eq("is_present", true);
      
    if (totalError) {
      console.error("Error fetching total attendance:", totalError);
      return NextResponse.json({
        today: todayCount || 0,
        total: 0
      });
    }
    
    return NextResponse.json({
      today: todayCount || 0,
      total: totalCount || 0
    });
    
  } catch (error: any) {
    console.error("Error fetching attendance stats:", error);
    
    // Return empty stats instead of error to prevent UI breakage
    return NextResponse.json({
      today: 0,
      total: 0
    });
  }
}
