/**
 * Database schema types for Spectrum application
 * Matches the actual database structure for better type safety
 */

export interface User {
  id: string;
  email?: string;
  // Add other auth.users fields as needed
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  college_name: string;
  prn: string;
  branch: string;
  class: string;
  gender: string;
  // Add other profile fields as needed
}

export type EventType = 'solo' | 'fixed_team' | 'variable_team';

export interface Event {
  id: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  description: string | null;
  event_type: EventType;
  min_team_size: number;
  max_team_size: number;
  registration_start: string | null;
  registration_end: string | null;
  event_start: string | null;
  event_end: string | null;
  max_registrations: number | null;
  is_active: boolean;
  img_url: string | null;
  whatsapp_url: string | null;
}

export type VerificationMethod = 'qr_code' | 'manual' | 'auto' | 'biometric' | 'other';

export interface EventAttendance {
  id: string;
  user_id: string;
  event_id: string;
  registration_id: string;
  is_present: boolean;
  marked_at: string | null;
  marked_by: string | null;
  verification_method: VerificationMethod | null;
  verification_data: Record<string, any> | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  
  // Relations
  events?: Event;
  user?: Profile;
}

export interface UserCertificate {
  id: number;
  user_id: string;
  event_name: string;
  certificate_url: string;
  attendance_id: string | null;
  created_at: string | null;
  certificate_uuid: string | null;
  
  // Relations
  event_attendance?: EventAttendance;
}

export interface Registration {
  id: string;
  event_id: string;
  registration_status: string;
  // Add other registration fields as needed
}
