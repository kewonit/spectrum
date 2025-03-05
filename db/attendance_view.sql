-- Drop the existing view if it exists
drop view if exists public.attendance_view;

-- Create the view with all the required columns
create or replace view public.attendance_view as
   select ea.id,
          ea.user_id,
          p.full_name as attendee_name,
          p.email as attendee_email,
          ea.event_id,
          e.name as event_name,
          ea.is_present,
          ea.marked_at,
          ea.marked_by,
          mb.full_name as marked_by_name,
          ea.verification_method,
          ea.notes
     from public.event_attendance ea
     join public.profiles p
   on ea.user_id = p.id
     join public.events e
   on ea.event_id = e.id
     left join public.profiles mb
   on ea.marked_by = mb.id;

-- Grant permissions
grant select on public.attendance_view to public;