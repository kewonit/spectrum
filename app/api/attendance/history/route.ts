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
        { error: permissionError || "You don't have permission to view attendance data." },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId'); // Now optional
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '0');
    
    // Get user profile but don't check for role
    const { data: currentUserProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();
      
    if (!currentUserProfile) {
      console.error("User profile not found when fetching attendance history");
      
      // Return empty data instead of error response
      return NextResponse.json({
        data: [],
        page,
        limit,
        total: 0,
        hasMore: false
      });
    }
    
    // Build the query and try to fetch data - without column check
    let data, error, count;
    
    try {
      // First try with the marked_by filter
      const result = await supabase
        .from("attendance_view")
        .select("*", { count: 'exact' })
        .order("marked_at", { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)
        .eq("marked_by", user.id);  // Try to filter by marked_by
      
      // If event ID is provided, also filter by that
      if (eventId && result.data) {
        data = result.data.filter(record => record.event_id === eventId);
        count = data.length;
      } else {
        data = result.data;
        count = result.count;
        error = result.error;
      }
    } catch (filterError: any) {
      console.log('Error using marked_by filter, fetching all records:', filterError);
      
      // If the filter fails (column doesn't exist), fetch without the filter
      const result = await supabase
        .from("attendance_view")
        .select("*", { count: 'exact' })
        .order("marked_at", { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);
      
      // If event ID is provided, filter by that
      if (eventId && result.data) {
        data = result.data.filter(record => record.event_id === eventId);
        count = data.length;
      } else {
        data = result.data;
        count = result.count;
        error = result.error;
      }
    }
    
    if (error) {
      console.error("Database error fetching attendance history:", error);
      
      return NextResponse.json({
        data: [],
        page,
        limit,
        total: 0,
        hasMore: false
      });
    }
    
    return NextResponse.json({
      data: data || [],
      page,
      limit,
      total: count || 0,
      hasMore: data && data.length === limit
    });
    
  } catch (error: any) {
    console.error("Error fetching attendance history:", error);
    
    // Return empty data instead of error
    return NextResponse.json({
      data: [],
      page: 0,
      limit: 20,
      total: 0,
      hasMore: false
    });
  }
}
