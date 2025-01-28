import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const supabase = await createClient();

  try {
    const { email } = await request.json();
    const { teamId } = await params;

    // Get current user & team details
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get team details and verify leadership
    const { data: team } = await supabase
      .from('teams')
      .select('*, events!inner(max_team_size)')
      .eq('id', teamId)
      .eq('leader_id', user.id)
      .single();

    if (!team) {
      return NextResponse.json({ 
        error: "Team not found or you're not the leader" 
      }, { status: 403 });
    }

    // Check total members + pending invites won't exceed max team size
    const { count: totalCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact' })
      .eq('team_id', teamId)
      .in('invitation_status', ['accepted', 'pending']); // Only count active and pending

    if (totalCount && totalCount >= team.events.max_team_size) {
      return NextResponse.json({
        error: `Maximum team size of ${team.events.max_team_size} members would be exceeded`
      }, { status: 400 });
    }

    // Check for existing invitation that isn't rejected
    const { data: existingInvite } = await supabase
      .from('team_members')
      .select('invitation_status')
      .eq('team_id', teamId)
      .eq('member_email', email.toLowerCase())
      .not('invitation_status', 'eq', 'rejected')
      .single();

    if (existingInvite) {
      return NextResponse.json({
        error: "User already has an active invitation to this team"
      }, { status: 400 });
    }

    // Create invitation
    const { error: inviteError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        member_id: null,
        member_email: email.toLowerCase(), // Ensure email is lowercase
        invitation_status: 'pending',
        invited_by: user.id
      });

    if (inviteError) throw inviteError;

    return NextResponse.json({ 
      success: true,
      message: "Invitation sent successfully"
    });

  } catch (error) {
    console.error("Invitation error:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
