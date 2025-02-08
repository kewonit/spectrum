import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

interface TeamRegistration {
  teams: {
    id: string;
    registrations: Array<{
      id: string;
      registration_status: string;
    }> | null;
  };
}

interface TeamInvite {
  teams: {
    id: string;
    team_name: string;
    event_id: string;
    leader_id?: string;
  };
}

// Update TeamStatus interface
interface TeamStatus {
  teams: {
    id: string;
    team_name: string;
    event_id: string;
    leader_id: string;
    team_members: Array<{
      invitation_status: string;
      member_id: string;
    }>;
    registrations: Array<{
      registration_status: string;
      payment_status: string;
      created_at: string;
    }>;
  };
}

// Add TeamRegistrationResponse interface
interface TeamRegistrationResponse {
  registration_status: string;
  payment_status: string;
  created_at: string;
}

// Update PaymentInfo interface
interface PaymentInfo {
  required: boolean;
  status: string;
  amount: number | null;
  timestamp: string | null;
  pendingMembers?: number;
  acceptedMembers?: number;
  perMemberAmount?: number;
  totalMembers?: number;  // Add this property to match the usage
}

// Update the response type
interface RegistrationResponse {
  isRegistered: boolean;
  type: 'team' | 'solo' | null;
  teamId: string | null;
  teamName: string | null;
  isLeader: boolean;
  registrationStatus: string | null;
  paymentStatus: string | null;
  profile: {
    is_pccoe_student: boolean;
  };
  payment: PaymentInfo;
}

export const revalidate = 0; // Disable cache

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First check for individual registration
    const { data: soloRegistration } = await supabase
      .from('registrations')
      .select(`
        *,
        payment:payments (
          status,
          amount,
          payment_time
        )
      `)
      .eq('event_id', eventId)
      .eq('individual_id', user.id)
      .not('registration_status', 'eq', 'cancelled')
      .maybeSingle();

    // If found solo registration, return it
    if (soloRegistration) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return NextResponse.json({
        isRegistered: true,
        type: 'solo',
        teamId: null,
        teamName: null,
        isLeader: false,
        registrationStatus: soloRegistration.registration_status,
        paymentStatus: soloRegistration.payment_status,
        profile: {
          is_pccoe_student: profile?.is_pccoe_student || false,
        },
        payment: {
          required: !profile?.is_pccoe_student,
          status: soloRegistration.payment?.status || 'pending',
          amount: soloRegistration.payment?.amount || null,
          timestamp: soloRegistration.payment?.payment_time || null
        }
      });
    }

    // Get the registration with comprehensive status check for teams
    const { data: registration } = await supabase
      .from('registrations')
      .select(`
        *,
        teams (
          id,
          team_name,
          leader_id,
          team_members (
            member_id,
            invitation_status
          )
        ),
        payment:payments (
          status,
          amount,
          payment_time
        )
      `)
      .eq('event_id', eventId)
      .not('registration_status', 'eq', 'cancelled')
      .or(
        `and(team_id.neq.null,teams.team_members.member_id.eq.${user.id}),` +
        `individual_id.eq.${user.id}`
      )
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get team membership status separately to ensure we catch all cases
    const { data: teamStatus } = await supabase
      .from('team_members')
      .select(`
        teams!inner(
          id,
          team_name,
          event_id,
          leader_id,
          registrations(
            registration_status,
            payment_status,
            created_at
          )
        )
      `)
      .eq('member_id', user.id)
      .eq('teams.event_id', eventId)
      .eq('invitation_status', 'accepted')
      .order('created_at', { ascending: false })
      .maybeSingle() as { data: TeamStatus | null };

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Find the most recent valid registration with proper typing
    const teamRegistration = teamStatus?.teams?.registrations?.find(
      (r: TeamRegistrationResponse) => r.registration_status !== 'cancelled'
    );

    // Determine registration status with proper fallbacks
    const response: RegistrationResponse = {
      isRegistered: !!(registration || teamRegistration),
      type: registration?.team_id ? 'team' : (registration?.individual_id ? 'solo' : null),
      teamId: registration?.teams?.id || (teamStatus?.teams && teamStatus.teams.id) || null,
      teamName: registration?.teams?.team_name || (teamStatus?.teams && teamStatus.teams.team_name) || null,
      isLeader: !!(registration?.teams?.leader_id === user.id || (teamStatus?.teams && teamStatus.teams.leader_id === user.id)),
      registrationStatus: registration?.registration_status || teamRegistration?.registration_status || null,
      paymentStatus: registration?.payment_status || teamRegistration?.payment_status || null,
      profile: {
        is_pccoe_student: profile?.is_pccoe_student || false,
      },
      payment: {
        required: !profile?.is_pccoe_student,
        status: registration?.payment?.status || 'pending',
        amount: registration?.payment?.amount || null,
        timestamp: registration?.payment?.payment_time || null
      }
    };

    const { data: pendingMembers } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', response.teamId)
      .eq('invitation_status', 'pending')
      .select();

    // When adding payment info for team registrations
    if (response.type === 'team' && !profile?.is_pccoe_student) {
      // Get ALL team members (both accepted and pending)
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('invitation_status')
        .eq('team_id', response.teamId);

      const acceptedCount = teamMembers?.filter(m => m.invitation_status === 'accepted').length || 0;
      const pendingCount = teamMembers?.filter(m => m.invitation_status === 'pending').length || 0;
      const totalMembers = acceptedCount + pendingCount;
      const perMemberFee = 100;

      response.payment = {
        ...response.payment,
        required: true,
        amount: totalMembers * perMemberFee,
        perMemberAmount: perMemberFee,
        totalMembers,
        acceptedMembers: acceptedCount,
        pendingMembers: pendingCount
      };
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("Error checking registration status:", error);
    return NextResponse.json(
      { error: "Failed to check registration status" },
      { status: 500 }
    );
  }
}
