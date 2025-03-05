import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

// List all emails with attendance permission
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
    
    // Check if user is an admin (basic approach - you might want a more sophisticated role check)
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
      
    if (!userProfile?.is_admin) {
      return NextResponse.json(
        { error: "Only administrators can manage attendance permissions." },
        { status: 403 }
      );
    }
    
    // Get all allowed emails
    const { data, error } = await supabase
      .from("allowed_emails_attendance")
      .select("id, email, created_at")
      .order("email", { ascending: true });
      
    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch allowed emails: " + error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      emails: data || [] 
    });
    
  } catch (error: any) {
    console.error("Error fetching allowed emails:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch allowed emails" },
      { status: 500 }
    );
  }
}

// Add a new email to allowed list
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
    
    // Check if user is an admin
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
      
    if (!userProfile?.is_admin) {
      return NextResponse.json(
        { error: "Only administrators can manage attendance permissions." },
        { status: 403 }
      );
    }
    
    // Get email from request body
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }
    
    // Normalize the email (lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }
    
    // Add email to allowed list
    const { data, error } = await supabase
      .from("allowed_emails_attendance")
      .insert([{ email: normalizedEmail }])
      .select()
      .single();
      
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: "This email already has attendance permission" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to add email: " + error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully added ${normalizedEmail} to allowed emails`,
      data
    });
    
  } catch (error: any) {
    console.error("Error adding allowed email:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to add email to allowed list" },
      { status: 500 }
    );
  }
}

// Remove email from allowed list
export async function DELETE(request: NextRequest) {
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
    
    // Check if user is an admin
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
      
    if (!userProfile?.is_admin) {
      return NextResponse.json(
        { error: "Only administrators can manage attendance permissions." },
        { status: 403 }
      );
    }
    
    // Get email or id from URL query params
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const email = url.searchParams.get('email');
    
    if (!id && !email) {
      return NextResponse.json(
        { error: "Either id or email parameter is required" },
        { status: 400 }
      );
    }
    
    // Fix: First call delete() then apply the filter condition
    let deleteOperation;
    
    if (id) {
      deleteOperation = await supabase
        .from("allowed_emails_attendance")
        .delete()
        .eq('id', id);
    } else {
      deleteOperation = await supabase
        .from("allowed_emails_attendance")
        .delete()
        .eq('email', email);
    }
    
    if (deleteOperation.error) {
      return NextResponse.json(
        { error: "Failed to remove email: " + deleteOperation.error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully removed ${email || 'the email'} from allowed list`
    });
    
  } catch (error: any) {
    console.error("Error removing allowed email:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to remove email from allowed list" },
      { status: 500 }
    );
  }
}
