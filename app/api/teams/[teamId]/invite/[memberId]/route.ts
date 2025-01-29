import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  const supabase = await createClient();

  try {
    const { teamId, memberId } = await params;

    // Get current user & team details
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is team leader
    const { data: team } = await supabase
      .from('teams')
      .select('leader_id')
      .eq('id', teamId)
      .single();

    if (!team || team.leader_id !== user.id) {
      return NextResponse.json({ 
        error: "Only team leaders can remove invitations" 
      }, { status: 403 });
    }

    // Delete the invitation
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('team_id', teamId)
      .eq('invitation_status', 'pending');

    if (deleteError) throw deleteError;

    return NextResponse.json({ 
      success: true,
      message: "Invitation removed successfully"
    });

  } catch (error) {
    console.error("Remove invitation error:", error);
    return NextResponse.json(
      { error: "Failed to remove invitation" },
      { status: 500 }
    );
  }
}
