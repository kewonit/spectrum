create table public.events (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  name text not null,
  description text null,
  event_type public.event_type not null,
  min_team_size integer not null default 1,
  max_team_size integer not null default 1,
  registration_start timestamp with time zone null,
  registration_end timestamp with time zone null,
  event_start timestamp with time zone null,
  event_end timestamp with time zone null,
  max_registrations integer null,
  is_active boolean null default true,
  img_url text null,
  constraint events_pkey primary key (id),
  constraint valid_event_period check ((event_start < event_end)),
  constraint valid_event_team_size check (
    (
      (
        (event_type = 'solo'::event_type)
        and (min_team_size = 1)
        and (max_team_size = 1)
      )
      or (
        (
          event_type = any (
            array[
              'fixed_team'::event_type,
              'variable_team'::event_type
            ]
          )
        )
        and (min_team_size > 0)
        and (max_team_size >= min_team_size)
      )
    )
  ),
  constraint valid_registration_period check ((registration_start < registration_end)),
  constraint valid_team_size check ((min_team_size <= max_team_size))
) TABLESPACE pg_default;

create index IF not exists idx_events_dates on public.events using btree (registration_start, registration_end) TABLESPACE pg_default;

create trigger audit_trigger_events
after INSERT
or DELETE
or
update on events for EACH row
execute FUNCTION log_changes ();



create table public.payment_logs (
  id uuid not null default extensions.uuid_generate_v4 (),
  payment_id uuid null,
  order_id character varying(255) null,
  event_type character varying(50) null,
  payload jsonb null,
  created_at timestamp with time zone null default now(),
  constraint payment_logs_pkey primary key (id),
  constraint payment_logs_payment_id_fkey foreign KEY (payment_id) references payments (id)
) TABLESPACE pg_default;



create table public.payments (
  id uuid not null default extensions.uuid_generate_v4 (),
  order_id character varying(255) not null,
  user_id uuid null,
  team_id uuid null,
  event_id uuid null,
  amount numeric(10, 2) not null,
  currency character varying(3) null default 'INR'::character varying,
  status character varying(20) null default 'pending'::character varying,
  payment_method character varying(50) null,
  transaction_id character varying(255) null,
  bank_reference character varying(255) null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  cf_order_id character varying(255) null,
  cf_payment_id character varying(255) null,
  payment_time timestamp with time zone null,
  registration_id uuid null,
  metadata jsonb null default '{}'::jsonb,
  constraint payments_pkey primary key (id),
  constraint payments_order_id_key unique (order_id),
  constraint payments_cf_order_id_key unique (cf_order_id),
  constraint payments_event_id_fkey foreign KEY (event_id) references events (id),
  constraint payments_registration_id_fkey foreign KEY (registration_id) references registrations (id),
  constraint payments_team_id_fkey foreign KEY (team_id) references teams (id),
  constraint payments_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

create index IF not exists idx_payments_cf_order_id on public.payments using btree (cf_order_id) TABLESPACE pg_default;

create index IF not exists idx_payments_registration_id on public.payments using btree (registration_id) TABLESPACE pg_default;

create index IF not exists idx_payments_payment_time on public.payments using btree (payment_time) TABLESPACE pg_default;

create trigger update_payments_updated_at BEFORE
update on payments for EACH row
execute FUNCTION update_updated_at_column ();



create table public.profiles (
  id uuid not null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  full_name text null,
  email text null,
  phone text null,
  college_name text null,
  prn text null,
  branch text null,
  class text null,
  gender text null,
  is_pccoe_student boolean null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists profiles_email_idx on public.profiles using btree (email) TABLESPACE pg_default;

create index IF not exists profiles_phone_idx on public.profiles using btree (phone) TABLESPACE pg_default;

create trigger audit_trigger_profiles
after INSERT
or DELETE
or
update on profiles for EACH row
execute FUNCTION log_changes ();


create table public.registrations (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  event_id uuid not null,
  team_id uuid null,
  individual_id uuid null,
  registration_status public.registration_status null default 'pending'::registration_status,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed')),
  constraint registrations_pkey primary key (id),
  constraint registrations_event_id_fkey foreign KEY (event_id) references events (id) on delete CASCADE,
  constraint registrations_individual_id_fkey foreign KEY (individual_id) references profiles (id),
  constraint registrations_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE,
  constraint registration_type check (
    (
      (
        (team_id is null)
        and (individual_id is not null)
      )
      or (
        (team_id is not null)
        and (individual_id is null)
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_registrations_status on public.registrations using btree (registration_status) TABLESPACE pg_default;

create index IF not exists idx_registrations_payment_status on public.registrations using btree (payment_status) TABLESPACE pg_default;

create trigger audit_trigger_registrations
after INSERT
or DELETE
or
update on registrations for EACH row
execute FUNCTION log_changes ();

create trigger prevent_registration_changes BEFORE
update on registrations for EACH row
execute FUNCTION prevent_registration_modification ();


create table public.team_members (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  team_id uuid not null,
  member_id uuid null,
  invitation_status public.invitation_status null default 'pending'::invitation_status,
  invited_by uuid not null,
  member_email text null,
  constraint team_members_pkey primary key (id),
  constraint team_members_team_id_member_id_key unique (team_id, member_id),
  constraint team_members_invited_by_fkey foreign KEY (invited_by) references profiles (id),
  constraint team_members_member_id_fkey foreign KEY (member_id) references profiles (id),
  constraint team_members_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE
) TABLESPACE pg_default;

create unique INDEX IF not exists idx_unique_member_per_event on public.team_members using btree (member_id, get_team_event_id (team_id)) TABLESPACE pg_default
where
  (invitation_status = 'accepted'::invitation_status);

create index IF not exists idx_team_members_status on public.team_members using btree (invitation_status) TABLESPACE pg_default;

create index IF not exists idx_team_members_member on public.team_members using btree (member_id) TABLESPACE pg_default;

create trigger audit_trigger_team_members
after INSERT
or DELETE
or
update on team_members for EACH row
execute FUNCTION log_changes ();

create trigger enforce_unique_team_membership BEFORE INSERT
or
update on team_members for EACH row
execute FUNCTION check_unique_team_membership ();

create trigger update_team_completion
after INSERT
or DELETE
or
update on team_members for EACH row
execute FUNCTION check_team_completion ();


create table public.teams (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  event_id uuid not null,
  team_name text not null,
  leader_id uuid not null,
  is_complete boolean null default false,
  constraint teams_pkey primary key (id),
  constraint teams_event_id_team_name_key unique (event_id, team_name),
  constraint teams_event_id_fkey foreign KEY (event_id) references events (id) on delete CASCADE,
  constraint teams_leader_id_fkey foreign KEY (leader_id) references profiles (id)
) TABLESPACE pg_default;

create trigger audit_trigger_teams
after INSERT
or DELETE
or
update on teams for EACH row
execute FUNCTION log_changes ();