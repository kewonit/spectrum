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
  img_url: string | null;
}

export type InvitationStatus = 'pending' | 'accepted' | 'rejected';
export type EventType = 'solo' | 'fixed_team' | 'variable_team';
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface RegistrationStatusResponse {
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
  payment: {
    required: boolean;
    status: string;
    amount: number | null;
    timestamp: string | null;
  };
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
  profile?: {
    phone: string | null;
    college_name: string | null;
    prn: string | null;
    branch: string | null;
    class: string | null;
    is_pccoe_student: boolean | null;
  };
}

export interface PaymentDetails {
  required: boolean;
  amount: number;
  nonPccoeCount: number;
}
