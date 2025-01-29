export interface EventDetails {
  id: string;
  name: string;
  description: string | null;
  event_type: string;
  min_team_size: number;
  max_team_size: number;
  registration_start: string;
  registration_end: string;
  event_start: string;
  event_end: string;
  max_registrations: number | null;
  is_active: boolean;
}

export type InvitationStatus = 'pending' | 'accepted' | 'rejected';
export type EventType = 'solo' | 'fixed_team' | 'variable_team';
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface RegistrationStatusResponse {
  isRegistered: boolean;
  type: 'solo' | 'team' | null;
  teamId?: string;
  isLeader?: boolean;
}

export interface TeamRegistration {
  id: string;
  registration_status: RegistrationStatus;
}

export interface TeamMember {
  isLeader: any;
  id: string;
  email: string;
  name: string | null;
  status: InvitationStatus;
  isRegistered: boolean;
}
