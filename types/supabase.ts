export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
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
          created_at: string | null;
          updated_at: string | null;
        };
      };
      event_rounds: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          event_id: string;
          round_number: number;
          round_type: string;
          name: string;
          description: string | null;
          time_limit: number | null;
          passing_criteria: Json;
          is_active: boolean;
        };
      };
      math_quiz_rounds: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          round_id: string;
          question_count: number;
          operations: string[];
          difficulty_level: number;
          min_value: number;
          max_value: number;
          required_correct: number;
          time_limit: number;
        };
      };
      math_quiz_answers: {
        Row: {
          id: string;
          created_at: string | null;
          progress_id: string;
          question_number: number;
          question: string;
          participant_answer: number | null;
          correct_answer: number;
          is_correct: boolean | null;
          response_time_ms: number | null;
        };
      };
      registrations: {
        Row: {
          id: string;
          created_at: string | null;
          profile_id: string;
          event_id: string;
          status: string;
        };
      };
      round_progress: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          registration_id: string;
          round_id: string;
          start_time: string | null;
          end_time: string | null;
          status: string;
          score: Json;
          attempts: number;
          max_attempts: number;
        };
      };
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
        };
      };
    };
  };
}
