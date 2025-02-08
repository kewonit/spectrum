import { createClient } from "@/app/utils/supabase/super-server";
import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';

// Import COLLEGE_OPTIONS
const COLLEGE_OPTIONS = {
  pccoe: "Pimpri Chinchwad College of Engineering, Pune",
  pccoer: "Pimpri Chinchwad College of Engineering & Research, Ravet",
  pcu: "Pimpri Chinchwad University",
  nutan: "Nutan Maharashtra Institute of Engineering & Technology, Pune",
  nmit: "Nutan College of Engineering & Research (NCER)",
  ait: "Army Institute of Technology",
  aissms: "All India Shri Shivaji Memorial Society's College of Engineering",
  bvp: "Bharati Vidyapeeth College of Engineering",
  coep: "College of Engineering Pune",
  cummins: "Cummins College of Engineering",
  dyp: "Dr. D.Y. Patil Institute of Technology, Akurdi",
  iiit: "Indian Institute of Information Technology, Pune",
  jspm: "JSPM's Rajarshi Shahu College of Engineering",
  mit: "MIT World Peace University (MIT-WPU)",
  mit_adt: "MIT Art, Design and Technology University",
  pict: "SCTR'S Pune Institute of Computer Technology",
  pvg: "PVG's College of Engineering and Technology",
  scoe: "Sinhgad College of Engineering",
  sit_lavle: "Symbiosis Institute of Technology, Lavle",
  viit: "BRACT's, Vishwakarma Institute of Information Technology",
  vit: "Vishwakarma Institute of Technology",
} as const;

// Helper to generate a random password
function generateRandomPassword() {
  return crypto.randomBytes(16).toString('hex');
}

// Helper to determine PCCOE status
function determineIsPccoeStudent(collegeName: string): boolean {
  // Direct match for PCCOE main branch
  if (collegeName === "Pimpri Chinchwad College of Engineering, Pune") {
    return true;
  }

  // Normalize and check for variations
  const normalizedName = collegeName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const pccoeVariations = [
    'pimprichinchwadcollegeofengineeringpune',
    'pimprichinchwadcollegeofengineering',
    'pccoepune',
    'pccoe'
  ];

  return pccoeVariations.some(variation => normalizedName.includes(variation));
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const match = pathname.match(/\/teams\/([^/]+)\/invite/);
  const teamId = match ? match[1] : '';

  try {
    // Validate teamId after getting it
    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(teamId)) {
      return NextResponse.json({ error: "Invalid team ID format" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      email, 
      userId, 
      isExisting,
      ...profileData 
    } = await request.json();

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Get team details with event info
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select(`
        *,
        events!inner(
          id,
          max_team_size
        )
      `)
      .eq('id', teamId)
      .eq('leader_id', user.id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ 
        error: "Team not found or you're not the leader" 
      }, { status: 403 });
    }

    // Check if team is locked
    if (team.registration_locked) {
      return NextResponse.json({
        error: "This team is locked and cannot accept new members"
      }, { status: 400 });
    }

    // Check member count
    const { count: memberCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact' })
      .eq('team_id', teamId)
      .in('invitation_status', ['accepted', 'pending']);

    if (memberCount && memberCount >= team.events.max_team_size) {
      return NextResponse.json({
        error: `Maximum team size of ${team.events.max_team_size} would be exceeded`
      }, { status: 400 });
    }

    // Check existing invitation
    const { data: existingInvite } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('member_email', normalizedEmail)
      .maybeSingle();

    if (existingInvite) {
      if (existingInvite.invitation_status !== 'rejected') {
        return NextResponse.json({
          error: "An active invitation already exists for this email"
        }, { status: 400 });
      } else {
        // Update a previously rejected invitation back to pending
        const { error: updateError } = await supabase
          .from('team_members')
          .update({
            invitation_status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingInvite.id);
        if (updateError) throw updateError;
        return NextResponse.json({ 
          success: true,
          message: "Invitation re-sent successfully",
          tabToShow: "members"
        });
      }
    }

    // For new users, create auth user first, then profile
    if (!isExisting && profileData.full_name) {
      const tempPassword = generateRandomPassword();
      
      // First check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json({
          error: "A user with this email already exists"
        }, { status: 400 });
      }

      // Create new user with signUp instead of createUser
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: tempPassword,
        options: {
          data: {
            full_name: profileData.full_name,
            team_id: teamId,
            event_name: team.events.name
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/events/accept?teamId=${teamId}`
        }
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        return NextResponse.json(
          { error: "Failed to create user account" },
          { status: 500 }
        );
      }

      if (!authUser.user) {
        throw new Error('User creation failed');
      }

      // Determine PCCOE status based on college name
      const is_pccoe_student = determineIsPccoeStudent(profileData.college_name);

      // Create profile for new user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: normalizedEmail,
          ...profileData,
          is_pccoe_student,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Clean up the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authUser.user.id);
        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }

      const { error: teamMemberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          member_id: authUser.user.id,
          member_email: normalizedEmail,
          invitation_status: 'pending',
          invited_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (teamMemberError) {
        console.error('Team member creation error:', teamMemberError);
        // Clean up the auth user and profile if team member creation fails
        await supabase.auth.admin.deleteUser(authUser.user.id);
        await supabase
          .from('profiles')
          .delete()
          .eq('id', authUser.user.id);
        return NextResponse.json(
          { error: "Failed to create team member" },
          { status: 500 }
        );
      }

    } else {
      // For existing users, just create the invitation
      const { error: inviteError } = await supabase
        .from('team_members')
        .insert({

          team_id: teamId,
          member_id: userId,
          member_email: normalizedEmail,
          invitation_status: 'pending',
          invited_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (inviteError) throw inviteError;
    }

    return NextResponse.json({ 
      success: true,
      message: "Invitation sent successfully",
      tabToShow: "members" // Add this to trigger tab switch
    });

  } catch (error: any) {
    console.error("Invitation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send invitation" },
      { status: 500 }
    );
  }
}
