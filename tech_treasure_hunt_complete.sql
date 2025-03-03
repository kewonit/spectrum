-- =============================================================================
-- TECH TREASURE HUNT COMPLETE SETUP SCRIPT
-- =============================================================================

-- =============================================================================
-- SCHEMA DEFINITION
-- =============================================================================
-- Create enum for round types
CREATE TYPE public.round_type AS ENUM ('math_quiz', 'image_code', 'advanced_problems');

-- Create table for round definitions
CREATE TABLE public.event_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  event_id UUID NOT NULL,
  round_number INTEGER NOT NULL,
  round_type public.round_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  time_limit INTEGER, -- in seconds
  passing_criteria JSONB NOT NULL DEFAULT '{}'::jsonb, -- flexible structure for different round requirements
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT event_rounds_pkey PRIMARY KEY (id),
  CONSTRAINT event_rounds_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT event_rounds_event_round_unique UNIQUE (event_id, round_number)
);

-- Create table for math quiz round configuration
CREATE TABLE public.math_quiz_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  round_id UUID NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 10,
  operations TEXT[] NOT NULL DEFAULT ARRAY['addition', 'subtraction', 'multiplication', 'division'],
  difficulty_level INTEGER NOT NULL DEFAULT 1, -- 1: Easy, 2: Medium, 3: Hard
  min_value INTEGER NOT NULL DEFAULT 1,
  max_value INTEGER NOT NULL DEFAULT 100,
  required_correct INTEGER NOT NULL DEFAULT 7, -- minimum number of correct answers to pass
  time_limit INTEGER NOT NULL DEFAULT 30, -- in seconds
  
  CONSTRAINT math_quiz_rounds_pkey PRIMARY KEY (id),
  CONSTRAINT math_quiz_rounds_round_id_fkey FOREIGN KEY (round_id) REFERENCES event_rounds(id) ON DELETE CASCADE,
  CONSTRAINT math_quiz_rounds_round_id_unique UNIQUE (round_id)
);

-- Create table for image code round configuration
CREATE TABLE public.image_code_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  round_id UUID NOT NULL,
  image_count INTEGER NOT NULL DEFAULT 5,
  images JSONB[] NOT NULL DEFAULT '{}', -- array of objects with image_url and code
  time_limit INTEGER NOT NULL DEFAULT 300, -- in seconds
  
  CONSTRAINT image_code_rounds_pkey PRIMARY KEY (id),
  CONSTRAINT image_code_rounds_round_id_fkey FOREIGN KEY (round_id) REFERENCES event_rounds(id) ON DELETE CASCADE,
  CONSTRAINT image_code_rounds_round_id_unique UNIQUE (round_id)
);

-- Create table for advanced problems round configuration
CREATE TABLE public.advanced_problem_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  round_id UUID NOT NULL,
  problems JSONB NOT NULL DEFAULT '{}'::jsonb, -- Contains matrix, integration, and stats problems
  time_limit INTEGER NOT NULL DEFAULT 1800, -- in seconds (30 minutes)
  
  CONSTRAINT advanced_problem_rounds_pkey PRIMARY KEY (id),
  CONSTRAINT advanced_problem_rounds_round_id_fkey FOREIGN KEY (round_id) REFERENCES event_rounds(id) ON DELETE CASCADE,
  CONSTRAINT advanced_problem_rounds_round_id_unique UNIQUE (round_id)
);

-- Create table to track participant progress through rounds
CREATE TABLE public.round_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  registration_id UUID NOT NULL,
  round_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed, passed, failed
  score JSONB DEFAULT '{}'::jsonb, -- Flexible structure to store different round metrics
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 1,
  
  CONSTRAINT round_progress_pkey PRIMARY KEY (id),
  CONSTRAINT round_progress_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  CONSTRAINT round_progress_round_id_fkey FOREIGN KEY (round_id) REFERENCES event_rounds(id) ON DELETE CASCADE,
  CONSTRAINT round_progress_registration_round_unique UNIQUE (registration_id, round_id)
);

-- Store detailed answers for math quiz rounds
CREATE TABLE public.math_quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  progress_id UUID NOT NULL, -- References round_progress
  question_number INTEGER NOT NULL,
  question TEXT NOT NULL,
  participant_answer NUMERIC,
  correct_answer NUMERIC NOT NULL,
  is_correct BOOLEAN,
  response_time_ms INTEGER, -- Time taken to answer in milliseconds
  
  CONSTRAINT math_quiz_answers_pkey PRIMARY KEY (id),
  CONSTRAINT math_quiz_answers_progress_id_fkey FOREIGN KEY (progress_id) REFERENCES round_progress(id) ON DELETE CASCADE,
  CONSTRAINT math_quiz_answers_progress_question_unique UNIQUE (progress_id, question_number)
);

-- Store image code submissions
CREATE TABLE public.image_code_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  progress_id UUID NOT NULL, -- References round_progress
  image_id TEXT NOT NULL,
  submitted_code TEXT,
  is_correct BOOLEAN,
  attempts INTEGER DEFAULT 0,
  
  CONSTRAINT image_code_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT image_code_submissions_progress_id_fkey FOREIGN KEY (progress_id) REFERENCES round_progress(id) ON DELETE CASCADE,
  CONSTRAINT image_code_submissions_progress_image_unique UNIQUE (progress_id, image_id)
);

-- Store advanced problem solutions
CREATE TABLE public.advanced_problem_solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  progress_id UUID NOT NULL, -- References round_progress
  problem_type TEXT NOT NULL, -- 'matrix', 'integration', or 'stats'
  problem_id TEXT NOT NULL,
  submitted_answer TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN,
  score NUMERIC,
  graded_by UUID, -- References profiles for manual grading
  graded_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  
  CONSTRAINT advanced_problem_solutions_pkey PRIMARY KEY (id),
  CONSTRAINT advanced_problem_solutions_progress_id_fkey FOREIGN KEY (progress_id) REFERENCES round_progress(id) ON DELETE CASCADE,
  CONSTRAINT advanced_problem_solutions_progress_problem_unique UNIQUE (progress_id, problem_type, problem_id),
  CONSTRAINT advanced_problem_solutions_graded_by_fkey FOREIGN KEY (graded_by) REFERENCES profiles(id)
);

-- Create triggers for updated_at maintenance
CREATE TRIGGER update_event_rounds_updated_at BEFORE UPDATE ON event_rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_math_quiz_rounds_updated_at BEFORE UPDATE ON math_quiz_rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_image_code_rounds_updated_at BEFORE UPDATE ON image_code_rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_advanced_problem_rounds_updated_at BEFORE UPDATE ON advanced_problem_rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_round_progress_updated_at BEFORE UPDATE ON round_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit log triggers
CREATE TRIGGER audit_trigger_event_rounds AFTER INSERT OR DELETE OR UPDATE ON event_rounds
  FOR EACH ROW EXECUTE FUNCTION log_changes();
  
CREATE TRIGGER audit_trigger_round_progress AFTER INSERT OR DELETE OR UPDATE ON round_progress
  FOR EACH ROW EXECUTE FUNCTION log_changes();

-- =============================================================================
-- FUNCTIONS
-- =============================================================================
-- Function to check if a participant can access the next round
CREATE OR REPLACE FUNCTION public.can_access_next_round(
    p_registration_id UUID, 
    p_event_id UUID
) RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
DECLARE
    current_level INTEGER;
    next_round_available BOOLEAN;
BEGIN
    -- Get the current level of the player
    SELECT MAX(round_number) INTO current_level
    FROM round_progress
    WHERE registration_id = p_registration_id
    AND completed = true;

    -- If null, they haven't completed any rounds yet
    IF current_level IS NULL THEN
        current_level := 0;
    END IF;

    -- Check if there's a next round available
    SELECT EXISTS (
        SELECT 1
        FROM rounds
        WHERE event_id = p_event_id
        AND round_number = current_level + 1
        AND is_active = true
    ) INTO next_round_available;

    RETURN next_round_available;
END;
$$;

-- Function to generate random math questions
CREATE OR REPLACE FUNCTION public.generate_math_questions(
  p_round_id UUID,
  p_progress_id UUID
) RETURNS VOID AS $$
DECLARE
  round_config RECORD;
  operation TEXT;
  num1 INTEGER;
  num2 INTEGER;
  correct_answer NUMERIC;
  question TEXT;
  i INTEGER;
BEGIN
  -- Get round configuration
  SELECT * INTO round_config FROM math_quiz_rounds WHERE round_id = p_round_id;
  
  -- Generate questions
  FOR i IN 1..round_config.question_count LOOP
    -- Select random operation
    operation := round_config.operations[floor(random() * array_length(round_config.operations, 1)) + 1];
    
    -- Generate random numbers based on difficulty
    num1 := floor(random() * (round_config.max_value - round_config.min_value + 1) + round_config.min_value);
    num2 := floor(random() * (round_config.max_value - round_config.min_value + 1) + round_config.min_value);
    
    -- Ensure division doesn't result in decimal if that's easier
    IF operation = 'division' AND round_config.difficulty_level < 3 THEN
      correct_answer := num1;
      num1 := num1 * num2;
    END IF;
    
    -- Compute correct answer
    CASE operation
      WHEN 'addition' THEN 
        correct_answer := num1 + num2;
        question := num1 || ' + ' || num2;
      WHEN 'subtraction' THEN 
        IF round_config.difficulty_level < 2 AND num2 > num1 THEN
          -- Ensure positive result for easier difficulty
          SELECT num2, num1 INTO num1, num2;
        END IF;
        correct_answer := num1 - num2;
        question := num1 || ' - ' || num2;
      WHEN 'multiplication' THEN 
        correct_answer := num1 * num2;
        question := num1 || ' × ' || num2;
      WHEN 'division' THEN 
        -- Division handled above to ensure clean division for lower difficulty
        question := num1 || ' ÷ ' || num2;
    END CASE;
    
    -- Insert the question
    INSERT INTO math_quiz_answers (
      progress_id, 
      question_number, 
      question, 
      correct_answer
    ) VALUES (
      p_progress_id,
      i,
      question,
      correct_answer
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to evaluate a round's completion
CREATE OR REPLACE FUNCTION public.evaluate_round_completion(p_progress_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  progress_record RECORD;
  round_record RECORD;
  pass_condition JSONB;
  has_passed BOOLEAN := FALSE;
  correct_count INTEGER;
BEGIN
  -- Get progress and round info
  SELECT rp.*, er.round_type, er.passing_criteria 
  INTO progress_record
  FROM round_progress rp
  JOIN event_rounds er ON rp.round_id = er.id
  WHERE rp.id = p_progress_id;
  
  -- Evaluate based on round type
  CASE progress_record.round_type
    WHEN 'math_quiz' THEN
      -- Count correct answers
      SELECT COUNT(*) INTO correct_count
      FROM math_quiz_answers
      WHERE progress_id = p_progress_id AND is_correct = TRUE;
      
      -- Get required count from round config
      SELECT required_correct INTO pass_condition
      FROM math_quiz_rounds
      WHERE round_id = progress_record.round_id;
      
      -- Check if passed
      IF correct_count >= pass_condition::INTEGER THEN
        has_passed := TRUE;
      END IF;
      
    WHEN 'image_code' THEN
      -- Check if all image codes were correctly submitted
      SELECT COUNT(*) = COUNT(CASE WHEN is_correct THEN 1 END) INTO has_passed
      FROM image_code_submissions
      WHERE progress_id = p_progress_id;
      
    WHEN 'advanced_problems' THEN
      -- Check if all required problems were correctly solved
      -- This may require additional logic based on specific criteria
      SELECT jsonb_build_object(
        'matrix', (SELECT is_correct FROM advanced_problem_solutions 
                  WHERE progress_id = p_progress_id AND problem_type = 'matrix' LIMIT 1),
        'integration', (SELECT is_correct FROM advanced_problem_solutions 
                       WHERE progress_id = p_progress_id AND problem_type = 'integration' LIMIT 1),
        'stats', (SELECT is_correct FROM advanced_problem_solutions 
                 WHERE progress_id = p_progress_id AND problem_type = 'stats' LIMIT 1)
      ) INTO progress_record.score;
      
      -- Pass if all three problems are solved correctly
      IF (progress_record.score->>'matrix')::BOOLEAN AND 
         (progress_record.score->>'integration')::BOOLEAN AND 
         (progress_record.score->>'stats')::BOOLEAN THEN
        has_passed := TRUE;
      END IF;
  END CASE;
  
  -- Update progress status
  UPDATE round_progress
  SET status = CASE WHEN has_passed THEN 'passed' ELSE 'failed' END,
      end_time = NOW(),
      score = progress_record.score
  WHERE id = p_progress_id;
  
  RETURN has_passed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- First drop the existing leaderboard function if it exists
DROP FUNCTION IF EXISTS public.get_event_leaderboard(uuid, boolean, integer);

-- Function to get event leaderboard
CREATE OR REPLACE FUNCTION public.get_event_leaderboard(
  p_event_id UUID,
  p_include_round_filter BOOLEAN DEFAULT false,
  p_round_number INTEGER DEFAULT 0
) RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  total_points BIGINT,
  fastest_time NUMERIC,
  rounds_completed BIGINT,
  highest_round INTEGER,
  is_team BOOLEAN,
  team_name TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH participant_progress AS (
    -- Get all progress data for the event
    SELECT 
      r.id AS registration_id,
      r.team_id,
      r.individual_id,
      t.team_name,
      p.id AS progress_id,
      p.round_id,
      er.round_number,
      p.status,
      p.start_time,
      p.end_time,
      CASE 
        WHEN p.status = 'passed' THEN 100
        WHEN p.status = 'completed' THEN 50
        ELSE 0
      END AS points,
      CASE
        WHEN p.start_time IS NOT NULL AND p.end_time IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (p.end_time - p.start_time))
        ELSE NULL
      END AS completion_time
    FROM 
      registrations r
    JOIN 
      round_progress p ON r.id = p.registration_id
    JOIN 
      event_rounds er ON p.round_id = er.id
    LEFT JOIN
      teams t ON r.team_id = t.id
    WHERE 
      er.event_id = p_event_id
      AND (
        NOT p_include_round_filter 
        OR er.round_number = p_round_number
      )
      AND p.status IN ('passed', 'completed')
  ),
  aggregated_scores AS (
    -- Aggregate scores by user/team
    SELECT
      COALESCE(pp.team_id, pp.individual_id) AS participant_id,
      pp.individual_id,
      pp.team_name,
      SUM(pp.points) AS total_points,
      MIN(pp.completion_time) AS fastest_time,
      COUNT(DISTINCT pp.round_id) AS rounds_completed,
      MAX(pp.round_number) AS highest_round,
      pp.team_id IS NOT NULL AS is_team
    FROM
      participant_progress pp
    GROUP BY
      COALESCE(pp.team_id, pp.individual_id),
      pp.individual_id,
      pp.team_name,
      (pp.team_id IS NOT NULL)
  )
  
  -- Get profile information and return final result
  SELECT
    p.id AS user_id,
    p.full_name AS display_name,
    as_scores.total_points,
    as_scores.fastest_time,
    as_scores.rounds_completed,
    as_scores.highest_round,
    as_scores.is_team,
    COALESCE(as_scores.team_name, '') AS team_name
  FROM
    aggregated_scores as_scores
  LEFT JOIN
    profiles p ON as_scores.individual_id = p.id
  ORDER BY
    as_scores.total_points DESC,
    as_scores.fastest_time ASC,
    as_scores.highest_round DESC
  LIMIT 100;
END;
$$;

-- =============================================================================
-- EVENT CREATION AND SEED DATA
-- =============================================================================
-- Insert a test event with a fixed ID
INSERT INTO public.events (
  id,  -- Using fixed ID for easier reference
  name, 
  description, 
  event_type, 
  min_team_size, 
  max_team_size, 
  registration_start, 
  registration_end, 
  event_start, 
  event_end, 
  max_registrations, 
  is_active
) VALUES (
  'e47b5692-1e66-4f06-9362-f5727f27e167',  -- Fixed ID for Tech Treasure Hunt
  'Tech Treasure Hunt',
  'Test your technical skills in our multi-round challenge with math quizzes, coding challenges, and advanced problems.',
  'game',
  1,
  1,
  NOW() - INTERVAL '7 days',
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW() + INTERVAL '30 days',
  100,
  true
) ON CONFLICT (id) DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- =============================================================================
-- CREATE ROUNDS FOR THE EVENT
-- =============================================================================
-- Create Round 1: Math Quiz for the existing event
INSERT INTO public.event_rounds (
  event_id,
  round_number,
  round_type,
  name,
  description,
  time_limit,
  passing_criteria,
  is_active
) VALUES (
  'e47b5692-1e66-4f06-9362-f5727f27e167',
  1,
  'math_quiz',
  'Math Challenge: Round 1',
  'Test your math skills with basic operations including addition, subtraction, multiplication, and division.',
  180,
  '{"required_correct": 7}',
  true
) ON CONFLICT (event_id, round_number) DO UPDATE SET
  is_active = true,
  updated_at = NOW()
RETURNING id as round_id_1;

-- Configure Math Quiz Round 1
WITH round_data AS (
  SELECT id FROM public.event_rounds 
  WHERE event_id = 'e47b5692-1e66-4f06-9362-f5727f27e167' 
  AND round_number = 1
  LIMIT 1
)
INSERT INTO public.math_quiz_rounds (
  round_id,
  question_count,
  operations,
  difficulty_level,
  min_value,
  max_value,
  required_correct,
  time_limit
) VALUES (
  (SELECT id FROM round_data),
  10,
  ARRAY['addition', 'subtraction', 'multiplication', 'division'],
  1,  -- Easy difficulty
  1,
  25,
  7,  -- Need 7 correct to pass
  180  -- 3 minutes
) ON CONFLICT (round_id) DO UPDATE SET
  updated_at = NOW();

-- Create Round 2: Advanced Math Quiz
INSERT INTO public.event_rounds (
  event_id,
  round_number,
  round_type,
  name,
  description,
  time_limit,
  passing_criteria,
  is_active
) VALUES (
  'e47b5692-1e66-4f06-9362-f5727f27e167',
  2,
  'math_quiz',
  'Advanced Math: Round 2',
  'Challenge yourself with more complex mathematical operations and larger numbers.',
  300,
  '{"required_correct": 6}',
  true
) ON CONFLICT (event_id, round_number) DO UPDATE SET
  is_active = true,
  updated_at = NOW()
RETURNING id as round_id_2;

-- Configure Math Quiz Round 2
WITH round_data AS (
  SELECT id FROM public.event_rounds 
  WHERE event_id = 'e47b5692-1e66-4f06-9362-f5727f27e167' 
  AND round_number = 2
  LIMIT 1
)
INSERT INTO public.math_quiz_rounds (
  round_id,
  question_count,
  operations,
  difficulty_level,
  min_value,
  max_value,
  required_correct,
  time_limit
) VALUES (
  (SELECT id FROM round_data),
  8,
  ARRAY['addition', 'subtraction', 'multiplication', 'division'],
  2,  -- Medium difficulty
  10,
  100,
  6,  -- Need 6 correct to pass
  300  -- 5 minutes
) ON CONFLICT (round_id) DO UPDATE SET
  updated_at = NOW();

-- Create Round 3: Image Code Round
INSERT INTO public.event_rounds (
  event_id,
  round_number,
  round_type,
  name,
  description,
  time_limit,
  passing_criteria,
  is_active
) VALUES (
  'e47b5692-1e66-4f06-9362-f5727f27e167',
  3,
  'image_code',
  'Code Hunt: Round 3',
  'Decipher the hidden codes in images to progress to the final challenge.',
  600,
  '{"required_correct": 3}',
  true
) ON CONFLICT (event_id, round_number) DO UPDATE SET
  is_active = true,
  updated_at = NOW()
RETURNING id as round_id_3;

-- Configure Image Code Round
WITH round_data AS (
  SELECT id FROM public.event_rounds 
  WHERE event_id = 'e47b5692-1e66-4f06-9362-f5727f27e167' 
  AND round_number = 3
  LIMIT 1
)
INSERT INTO public.image_code_rounds (
  round_id,
  image_count,
  images,
  time_limit
) VALUES (
  (SELECT id FROM round_data),
  3,
  ARRAY[
    '{"image_url": "https://placehold.co/600x400/png?text=Code+Challenge+1", "code": "TH123"}',
    '{"image_url": "https://placehold.co/600x400/png?text=Code+Challenge+2", "code": "NT456"}',
    '{"image_url": "https://placehold.co/600x400/png?text=Code+Challenge+3", "code": "HU789"}'
  ]::jsonb[],
  600  -- 10 minutes
) ON CONFLICT (round_id) DO UPDATE SET
  updated_at = NOW();

-- =============================================================================
-- TEST USER REGISTRATION 
-- =============================================================================
-- Function to register a test user for the event
CREATE OR REPLACE FUNCTION register_test_user(user_id UUID) 
RETURNS UUID AS $$
DECLARE
  event_id UUID := 'e47b5692-1e66-4f06-9362-f5727f27e167'; -- Tech Treasure Hunt ID
  registration_id UUID;
BEGIN
  -- Register the user for the event if not already registered
  INSERT INTO public.registrations (
    event_id,
    individual_id,
    registration_status,
    payment_status
  ) VALUES (
    event_id,
    user_id,
    'confirmed',
    'success'
  ) 
  ON CONFLICT (event_id, individual_id) 
  DO UPDATE SET updated_at = NOW()
  RETURNING id INTO registration_id;
  
  RETURN registration_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- QUICK SETUP FOR TESTING
-- =============================================================================
-- Function to quickly setup a test environment for a user
CREATE OR REPLACE FUNCTION quick_setup_for_user(user_id UUID)
RETURNS TABLE (
  registration_id UUID,
  progress_id UUID,
  round_id UUID,
  round_number INTEGER
) AS $$
DECLARE
  event_id UUID := 'e47b5692-1e66-4f06-9362-f5727f27e167'; -- Tech Treasure Hunt ID
  reg_id UUID;
  prog_id UUID;
  round_rec RECORD;
BEGIN
  -- Register user
  reg_id := register_test_user(user_id);
  
  -- Get first round
  SELECT id, round_number INTO round_rec 
  FROM event_rounds 
  WHERE event_id = 'e47b5692-1e66-4f06-9362-f5727f27e167'
  AND round_number = 1;
  
  -- Create progress record
  INSERT INTO public.round_progress (
    registration_id,
    round_id,
    status,
    start_time,
    attempts,
    max_attempts
  ) VALUES (
    reg_id,
    round_rec.id,
    'in_progress',
    NOW(),
    1,
    3
  ) 
  ON CONFLICT (registration_id, round_id) 
  DO UPDATE SET status = 'in_progress', start_time = NOW()
  RETURNING id INTO prog_id;
  
  -- Generate sample questions if this is a math quiz round
  PERFORM generate_math_questions(round_rec.id, prog_id);
  
  registration_id := reg_id;
  progress_id := prog_id;
  round_id := round_rec.id;
  round_number := round_rec.round_number;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comment out this section and replace YOUR_USER_ID_HERE with actual UUID when ready to test
/*
-- Example usage of quick setup function
SELECT * FROM quick_setup_for_user('YOUR_USER_ID_HERE');
*/
