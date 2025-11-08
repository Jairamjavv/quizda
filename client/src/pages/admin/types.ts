// Types shared across admin pages and components
export type QuestionType =
  | "mcq_single"
  | "mcq_multiple"
  | "true_false"
  | "fill_blanks";
export type ContentType = "text" | "markdown" | "latex";

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  group_id?: string;
  total_points: number;
  tags: string[];
  created_by: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionChoice {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface Question {
  _id: string;
  quiz_id: string;
  text: string;
  choices: QuestionChoice[];
  points: number;
  tags: string[];
  order: number;
  question_type?: QuestionType;
  content_type?: ContentType;
  correct_answers?: string[];
}

export interface Group {
  _id: string;
  name: string;
  description: string;
}
