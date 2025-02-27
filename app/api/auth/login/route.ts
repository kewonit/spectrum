import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;
const ipRequestMap = new Map<string, { count: number; timestamp: number }>();

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const requestData = ipRequestMap.get(ip);

    if (requestData) {
      if (now - requestData.timestamp < RATE_LIMIT_WINDOW) {
        if (requestData.count >= MAX_REQUESTS) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
          );
        }
        ipRequestMap.set(ip, { count: requestData.count + 1, timestamp: requestData.timestamp });
      } else {
        ipRequestMap.set(ip, { count: 1, timestamp: now });
      }
    } else {
      ipRequestMap.set(ip, { count: 1, timestamp: now });
    }

    // Parse request body
    const { email, token, action } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = await createClient();

    if (action === "sendOtp") {
      // Send OTP email
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: `${req.nextUrl.origin}/dashboard`,
        },
      });

      if (error) {
        console.error("Server auth error:", error);
        return NextResponse.json(
          { error: "Failed to send verification code" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Verification code sent successfully" },
        { status: 200 }
      );
    } else if (action === "verifyOtp") {
      if (!token || typeof token !== "string" || token.length !== 6) {
        return NextResponse.json(
          { error: "Valid verification code is required" },
          { status: 400 }
        );
      }

      // Verify OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.toLowerCase().trim(),
        token: token.trim(),
        type: "email",
      });

      if (error) {
        console.error("Server verification error:", error);
        return NextResponse.json(
          { error: "Invalid or expired verification code" },
          { status: 400 }
        );
      }

      if (!data?.session) {
        return NextResponse.json(
          { error: "Verification failed" },
          { status: 400 }
        );
      }

      // Update user profile
      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: data.session.user.id,
              email: data.session.user.email,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "id",
            }
          );

        if (profileError) {
          console.error("Profile update error:", profileError);
        }
      } catch (err) {
        console.error("Profile update failed:", err);
      }

      return NextResponse.json(
        { 
          message: "Successfully logged in",
          session: {
            user: {
              id: data.session.user.id,
              email: data.session.user.email
            }
          }
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
