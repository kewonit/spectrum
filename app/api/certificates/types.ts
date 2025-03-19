// Common types for certificates
export interface CertificateEvent {
  id: string;
  name: string;
  description?: string | null;
  event_type?: string;
  min_team_size?: number;
  max_team_size?: number;
  registration_start?: string | null;
  registration_end?: string | null;
  event_start?: string | null;
  event_end?: string | null;
  max_registrations?: number | null;
  is_active?: boolean;
  img_url?: string | null;
  whatsapp_url?: string | null;
}

export interface Certificate {
  id: number;
  certificate_url: string;
  certificate_uuid: string | null;
  created_at: string;
  event: CertificateEvent | null;
  recipient_name?: string;
}

export interface VerificationResult {
  verified: boolean;
  certificate?: {
    id: number;
    event_name?: string;
    event_id?: string;
    event_description?: string | null;
    created_at: string;
    recipient: string;
    email?: string;
  };
  error?: string;
}
