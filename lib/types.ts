export type ErrorCategory = "E001" | "E002" | "E003";
export type GrammarCategory =
  | "reflexive-pronoun"
  | "participial-adjective"
  | "preposition"
  | "extreme-adverb"
  | "subject-verb-agreement"
  | "tense"
  | "voice"
  | "collocation"
  | "conjunction"
  | "other";

export type ChunkTag = "S" | "V" | "O" | "C" | "M";

export interface TextChunk {
  text: string;
  tag?: ChunkTag;
  isBlank?: boolean;
}

export interface Choice {
  id: "A" | "B" | "C" | "D";
  text: string;
  errorCategory?: ErrorCategory;
  errorReason: string;
}

export interface Tip {
  title: string;
  body: string;
}

export interface Question {
  id: string;
  sentence: string;
  chunks: TextChunk[];
  slashGroups: string[];
  correctAnswer: "A" | "B" | "C" | "D";
  choices: Choice[];
  grammarCategory: GrammarCategory;
  grammarLabel: string;
  solutionSteps: {
    step1: string;
    step2: string;
    step3: string;
  };
  explanation: string;
  tips: Tip[];
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  timestamp: number;
  stepReached: 1 | 2 | 3;
}

export interface UserProgress {
  answers: UserAnswer[];
  lastUpdated: number;
}

export interface WeakPoint {
  category: GrammarCategory;
  label: string;
  errorRate: number;
  count: number;
}
