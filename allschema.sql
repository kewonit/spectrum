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

-- Add these new tables to the schema

-- Table for event rounds
create table if not exists public.event_rounds (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text null,
  round_number integer not null,
  round_type text not null,
  time_limit integer null default 300, -- in seconds
  passing_criteria jsonb null,
  created_at timestamp with time zone null default timezone('utc'::text, now()),
  updated_at timestamp with time zone null default timezone('utc'::text, now()),
  constraint event_rounds_pkey primary key (id),
  constraint event_rounds_event_id_round_number_key unique (event_id, round_number),
  constraint valid_round_type check (round_type in ('math_quiz', 'coding', 'image_code', 'code_hunt', 'puzzle'))
);

-- Table for round progress
create table if not exists public.round_progress (
  id uuid not null default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  round_id uuid not null references public.event_rounds(id) on delete cascade,
  status text not null default 'not_started',
  start_time timestamp with time zone null,
  end_time timestamp with time zone null,
  score jsonb null,
  attempts integer not null default 1,
  max_attempts integer not null default 3,
  created_at timestamp with time zone null default timezone('utc'::text, now()),
  updated_at timestamp with time zone null default timezone('utc'::text, now()),
  constraint round_progress_pkey primary key (id),
  constraint valid_progress_status check (status in ('not_started', 'in_progress', 'completed', 'passed', 'failed'))
);

-- Table for math quiz questions/answers
create table if not exists public.math_quiz_answers (
  id uuid not null default gen_random_uuid(),
  progress_id uuid not null references public.round_progress(id) on delete cascade,
  question_number integer not null,
  question text not null,
  correct_answer numeric not null,
  participant_answer numeric null,
  is_correct boolean null,
  response_time_ms integer null,
  created_at timestamp with time zone null default timezone('utc'::text, now()),
  updated_at timestamp with time zone null default timezone('utc'::text, now()),
  constraint math_quiz_answers_pkey primary key (id),
  constraint math_quiz_answers_progress_id_question_number_key unique (progress_id, question_number)
);

-- Table for math quiz round configuration
create table if not exists public.math_quiz_rounds (
  id uuid not null default gen_random_uuid(),
  round_id uuid not null references public.event_rounds(id) on delete cascade,
  num_questions integer not null default 10,
  difficulty level not null default 'medium',
  min_range integer not null default 1,
  max_range integer not null default 100,
  operations text[] not null default array['add', 'subtract', 'multiply', 'divide'],
  time_limit_per_question integer not null default 30, -- in seconds
  passing_score numeric not null default 0.6, -- 60%
  created_at timestamp with time zone null default timezone('utc'::text, now()),
  updated_at timestamp with time zone null default timezone('utc'::text, now()),
  constraint math_quiz_rounds_pkey primary key (id),
  constraint math_quiz_rounds_round_id_key unique (round_id)
);

-- Table for image code round configuration
create table if not exists public.image_code_rounds (
  id uuid not null default gen_random_uuid(),
  round_id uuid not null references public.event_rounds(id) on delete cascade,
  images jsonb not null default '[]'::jsonb,
  time_limit integer not null default 600, -- in seconds
  passing_score numeric not null default 1.0, -- 100%
  created_at timestamp with time zone null default timezone('utc'::text, now()),
  updated_at timestamp with time zone null default timezone('utc'::text, now()),
  constraint image_code_rounds_pkey primary key (id),
  constraint image_code_rounds_round_id_key unique (round_id)
);

-- Table for image code submissions
create table if not exists public.image_code_submissions (
  id uuid not null default gen_random_uuid(),
  progress_id uuid not null references public.round_progress(id) on delete cascade,
  image_id uuid not null,
  submitted_code text not null,
  is_correct boolean not null,
  attempts integer not null default 1,
  created_at timestamp with time zone null default timezone('utc'::text, now()),
  updated_at timestamp with time zone null default timezone('utc'::text, now()),
  constraint image_code_submissions_pkey primary key (id),
  constraint image_code_submissions_progress_id_image_id_key unique (progress_id, image_id)
);

-- Create stored procedure to evaluate round completion
create or replace function public.evaluate_round_completion(p_progress_id uuid)
returns boolean as $$
declare
  v_round_type text;
  v_passing_score numeric;
  v_correct_count int;
  v_total_count int;
  v_actual_score numeric;
  v_passed boolean;
begin
  -- Get the round type and passing score
  select 
    er.round_type,
    case
      when er.round_type = 'math_quiz' then coalesce((select mqr.passing_score from public.math_quiz_rounds mqr where mqr.round_id = er.id), 0.6)
      when er.round_type = 'image_code' then coalesce((select icr.passing_score from public.image_code_rounds icr where icr.round_id = er.id), 1.0)
      else 0.7 -- default passing score for other types
    end as passing_score
  into v_round_type, v_passing_score
  from public.round_progress rp
  join public.event_rounds er on rp.round_id = er.id
  where rp.id = p_progress_id;
  
  -- Handle math quiz rounds
  if v_round_type = 'math_quiz' then
    select count(*), count(*) filter (where is_correct = true)
    into v_total_count, v_correct_count
    from public.math_quiz_answers
    where progress_id = p_progress_id;
    
    v_actual_score := case when v_total_count > 0 then v_correct_count::numeric / v_total_count else 0 end;
    
  -- Handle image code rounds
  elsif v_round_type = 'image_code' then
    -- Count image code submissions
    select count(*), count(*) filter (where is_correct = true)
    into v_total_count, v_correct_count
    from public.image_code_submissions
    where progress_id = p_progress_id;
    
    -- For image code, also check against total expected images
    declare
      v_round_id uuid;
      v_total_expected int;
    begin
      select round_id into v_round_id from public.round_progress where id = p_progress_id;
      
      select coalesce(jsonb_array_length(images), 0)
      into v_total_expected
      from public.image_code_rounds
      where round_id = v_round_id;
      
      if v_total_expected > v_total_count then
        v_total_count := v_total_expected;
      end if;
    end;
    
    v_actual_score := case when v_total_count > 0 then v_correct_count::numeric / v_total_count else 0 end;
  
  -- Default for other round types
  else
    -- Use the score directly from the progress if available
    select 
      coalesce((rp.score->>'score')::numeric, 0)
    into v_actual_score
    from public.round_progress rp
    where rp.id = p_progress_id;
  end if;
  
  -- Determine if passed
  v_passed := v_actual_score >= v_passing_score;
  
  -- Update the progress status
  update public.round_progress
  set 
    status = case when v_passed then 'passed' else 'failed' end
  where id = p_progress_id;
  
  return v_passed;
end;
$$ language plpgsql;