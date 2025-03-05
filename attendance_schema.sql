-- Table for tracking event attendance
CREATE TABLE IF NOT EXISTS public.event_attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_id uuid NOT NULL,
  registration_id uuid,
  is_present boolean NOT NULL DEFAULT false,
  marked_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  marked_by uuid,
  verification_method text NULL,
  verification_data jsonb NULL DEFAULT '{}'::jsonb,
  notes text NULL,
  created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT event_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT event_attendance_user_event_key UNIQUE (user_id, event_id),
  CONSTRAINT event_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT event_attendance_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT event_attendance_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  CONSTRAINT event_attendance_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES profiles(id),
  CONSTRAINT valid_verification_method CHECK (verification_method IS NULL OR verification_method IN ('qr_code', 'manual', 'auto', 'biometric', 'other'))
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_attendance_user_id ON public.event_attendance USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_event_id ON public.event_attendance USING btree (event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_present ON public.event_attendance USING btree (is_present);
CREATE INDEX IF NOT EXISTS idx_event_attendance_marked_at ON public.event_attendance USING btree (marked_at);

-- Update timestamp trigger
CREATE TRIGGER update_event_attendance_updated_at
BEFORE UPDATE ON public.event_attendance
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger for attendance changes
CREATE TRIGGER audit_trigger_event_attendance
AFTER INSERT OR DELETE OR UPDATE ON public.event_attendance
FOR EACH ROW
EXECUTE FUNCTION log_changes();

-- Function to mark attendance for a user across multiple events
CREATE OR REPLACE FUNCTION public.mark_user_attendance(
  p_user_id uuid,
  p_is_present boolean DEFAULT true,
  p_event_ids uuid[] DEFAULT NULL,
  p_marked_by uuid DEFAULT NULL,
  p_verification_method text DEFAULT 'manual',
  p_verification_data jsonb DEFAULT '{}'::jsonb,
  p_notes text DEFAULT NULL
) RETURNS SETOF uuid AS $$
DECLARE
  v_event_id uuid;
  v_registration_id uuid;
  v_result uuid;
  v_events uuid[];
BEGIN
  -- If no specific events provided, get all events the user is registered for
  IF p_event_ids IS NULL THEN
    -- Get events through individual registrations
    WITH user_registrations AS (
      SELECT r.event_id, r.id AS registration_id
      FROM registrations r
      WHERE r.individual_id = p_user_id
      
      UNION ALL
      
      -- Get events through team registrations
      SELECT r.event_id, r.id AS registration_id
      FROM registrations r
      JOIN teams t ON r.team_id = t.id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.member_id = p_user_id AND tm.invitation_status = 'accepted'
    )
    SELECT array_agg(DISTINCT event_id) INTO v_events FROM user_registrations;
  ELSE
    v_events := p_event_ids;
  END IF;
  
  -- Process each event
  FOREACH v_event_id IN ARRAY v_events LOOP
    -- Find the related registration ID
    SELECT r.id INTO v_registration_id
    FROM registrations r
    WHERE (r.individual_id = p_user_id OR 
          (r.team_id IN (
            SELECT tm.team_id 
            FROM team_members tm 
            WHERE tm.member_id = p_user_id AND tm.invitation_status = 'accepted'
          ))) 
      AND r.event_id = v_event_id
    LIMIT 1;
    
    -- Insert or update attendance record
    INSERT INTO public.event_attendance (
      user_id, event_id, registration_id, is_present, marked_by, 
      verification_method, verification_data, notes
    ) VALUES (
      p_user_id, v_event_id, v_registration_id, p_is_present, p_marked_by,
      p_verification_method, p_verification_data, p_notes
    )
    ON CONFLICT (user_id, event_id) DO UPDATE SET
      is_present = p_is_present,
      marked_at = timezone('utc'::text, now()),
      marked_by = p_marked_by,
      verification_method = p_verification_method,
      verification_data = p_verification_data,
      notes = p_notes,
      updated_at = timezone('utc'::text, now())
    RETURNING id INTO v_result;
    
    RETURN NEXT v_result;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to get attendance statistics for an event
CREATE OR REPLACE FUNCTION public.get_event_attendance_stats(p_event_id uuid)
RETURNS TABLE (
  total_registrations bigint,
  present_count bigint,
  absent_count bigint,
  attendance_percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE ea.is_present = true) AS present,
      COUNT(*) FILTER (WHERE ea.is_present = false OR ea.is_present IS NULL) AS absent
    FROM public.event_attendance ea
    WHERE ea.event_id = p_event_id
  )
  SELECT
    stats.total AS total_registrations,
    stats.present AS present_count,
    stats.absent AS absent_count,
    CASE
      WHEN stats.total > 0 THEN ROUND((stats.present::numeric / stats.total) * 100, 2)
      ELSE 0
    END AS attendance_percentage
  FROM stats;
END;
$$ LANGUAGE plpgsql;

-- View for easy querying of attendance data
CREATE OR REPLACE VIEW public.attendance_view AS
SELECT
  ea.id,
  ea.user_id,
  p.full_name AS attendee_name,
  p.email AS attendee_email,
  ea.event_id,
  e.name AS event_name,
  ea.is_present,
  ea.marked_at,
  ea.registration_id,
  mb.full_name AS marked_by_name,
  ea.verification_method,
  ea.notes
FROM public.event_attendance ea
JOIN public.profiles p ON ea.user_id = p.id
JOIN public.events e ON ea.event_id = e.id
LEFT JOIN public.profiles mb ON ea.marked_by = mb.id;
