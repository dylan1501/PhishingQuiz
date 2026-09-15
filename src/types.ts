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
  id?: string;
  remote?: boolean;
  participantId: string;
  startedAt: string;
  /** Hết hạn nếu không có hoạt động; server tự chốt kết quả và xóa phiên sau mốc này. */
  expiresAt?: string;
  questionIds: string[];
  answers: AttemptAnswer[];
}

export interface QuizConfig {
  questionCount: number;
  /** Số câu đúng tối thiểu để lượt thi được tính là hoàn thành. */
  passScore: number;
  updatedAt: string;
}

/** Dữ liệu trả về khi khởi tạo hoặc tải một phiên làm bài. */
export interface QuizSessionPayload {
  session: QuizSession;
  questions: QuizQuestion[];
  passScore: number;
}
