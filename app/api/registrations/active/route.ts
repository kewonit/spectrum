import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { RegistrationStatus } from "@/app/types/events";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  college_name: string | null;
  prn: string | null;
  branch: string | null;
  class: string | null;
  gender: string | null;
  bio: string | null;
}

interface Event {
  id: string;
  name: string;
  description: string | null;
  event_type: 'solo' | 'fixed_team' | 'variable_team';
  min_team_size: number;
  max_team_size: number;
  registration_start: string | null;
  registration_end: string | null;
  event_start: string | null;
  event_end: string | null;
  max_registrations: number | null;
  is_active: boolean | null;
}

interface TeamMemberWithProfile {
  member_id: string | null;
  member_email: string;
  invitation_status: 'accepted' | 'pending' | 'rejected';
  profiles: Profile;
}

interface FormattedTeamMember {
  id: string;
  email: string;
  name: string;
  status: 'accepted' | 'pending' | 'rejected';
  isRegistered: boolean;
  isLeader: boolean;
  profile?: {
    prn?: string | null;
  };
}

interface TeamRegistration {
  teams: {
    leader: any;
    id: string;
    team_name: string;
    leader_id: string;
    registrations: Array<{
      id: string;
      created_at: string;
      registration_status: string;
    }>;
    events: Event;
  };
  status: string;
}

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fetch solo registrations with created_at and status
    const { data: soloRegistrations } = await supabase
      .from('registrations')
      .select(`
        id,
        created_at,
        registration_status,
        events (*)
      `)
      .eq('individual_id', user.id);

    // Updated team registrations query to include ALL team members
    const { data: teamRegistrations } = await supabase
      .from('team_members')
      .select(`
        teams!inner (
          id,
          team_name,
          leader_id,
          leader:leader_id (
            id,
            full_name,
            email
          ),
          registrations!inner (
            id,
            created_at,
            registration_status
          ),
          events (*)
        ),
        status: invitation_status
      `)
      .eq('member_id', user.id)
      .eq('invitation_status', 'accepted') as { data: TeamRegistration[] | null };

    // Get team members including pending ones for each team
    const teamRegistrationsWithMembers = await Promise.all(
      (teamRegistrations || []).map(async (reg) => {
        const { data: members } = await supabase
          .from('team_members')
          .select(`
            member_id,
            member_email,
            invitation_status,
            profiles:member_id (
              id,
              full_name,
              email,
              prn
            )
          `)
          .eq('team_id', reg.teams.id) as { data: TeamMemberWithProfile[] | null };

        // Format members including both accepted and pending
        const formattedMembers: FormattedTeamMember[] = (members || []).map((m) => ({
          id: m.member_id || m.member_email,
          email: m.member_email || (m.profiles?.email ?? ''),
          name: m.profiles?.full_name ?? '',
          status: m.invitation_status,
          isRegistered: !!m.member_id,
          isLeader: m.member_id === reg.teams.leader_id,
          profile: m.profiles ? {
            prn: m.profiles.prn
          } : undefined
        }));

        return {
          ...reg,
          teams: {
            ...reg.teams,
            members: formattedMembers
          }
        };
      })
    );

    // Format response
    const formattedRegistrations = [
      ...(soloRegistrations || []).map(reg => ({
        id: reg.id,
        created_at: reg.created_at,
        event: reg.events,
        type: 'solo' as const,
        status: reg.registration_status || 'pending',
        profile: {
          phone: profile?.phone,
          college_name: profile?.college_name,
          prn: profile?.prn,
          branch: profile?.branch,
          class: profile?.class,
        }
      })),
      ...teamRegistrationsWithMembers.map(reg => ({
        id: reg.teams.registrations[0].id,
        created_at: reg.teams.registrations[0].created_at,
        event: reg.teams.events,
        type: 'team' as const,
        status: reg.teams.registrations[0].registration_status || 'pending',
        team: {
          id: reg.teams.id,
          name: reg.teams.team_name,
          members: reg.teams.members, // Now includes both accepted and pending members
          isLeader: reg.teams.leader_id === user.id,
        },
        profile: {
          phone: profile?.phone,
          college_name: profile?.college_name,
          prn: profile?.prn,
          branch: profile?.branch,
          class: profile?.class,
        }
      }))
    ];

    // Add metadata about pending members
    const registrationsWithPendingInfo = formattedRegistrations.map(reg => {
      if (reg.type === 'team' && reg.team) {
        const pendingMembers = reg.team.members.filter(m => m.status === 'pending');
        const acceptedMembers = reg.team.members.filter(m => m.status === 'accepted');
        
        return {
          ...reg,
          team: {
            ...reg.team,
            pendingCount: pendingMembers.length,
            acceptedCount: acceptedMembers.length,
            totalMembers: reg.team.members.length
          }
        };
      }
      return reg;
    });

    return NextResponse.json({
      registrations: registrationsWithPendingInfo
    });

  } catch (error) {
    console.error("Failed to fetch registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
