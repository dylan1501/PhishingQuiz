export type AnswerOption = "phishing" | "legitimate";

export interface Participant {
  id: string;
  fullName: string;
  email: string;
  consent: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  title: string;
  category: string;
  scenarioIntro: string;
  scenarioContent: string;
  scenarioHtml: string;
  correctAnswer: AnswerOption;
  explanation: string;
  indicators: string[];
  active: boolean;
  alwaysIncluded: boolean;
  orderIndex: number;
}

export interface AttemptAnswer {
  questionId: string;
  selectedAnswer: AnswerOption;
  isCorrect: boolean;
  answeredAt: string;
}

export interface Attempt {
  id: string;
  participantId: string;
  score: number;
  totalQuestions: number;
  durationSeconds: number;
  startedAt: string;
  completedAt: string;
  answers: AttemptAnswer[];
}

export interface QuizSession {
  participantId: string;
  startedAt: string;
  questionIds: string[];
  answers: AttemptAnswer[];
}
