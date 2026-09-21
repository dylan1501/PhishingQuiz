export type AnswerOption = "phishing" | "legitimate";

export interface Participant {
  id: string;
  fullName: string;
  /** Đội liên minh người chơi chọn ở màn bắt đầu. */
  team?: string | null;
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
  /** Thời gian tối đa cho câu hỏi (giây), chỉ tính tới lúc chọn đáp án. */
  timeLimitSeconds: number;
  /** ISO; không có với dữ liệu seed trong bộ nhớ dev. */
  createdAt?: string;
  updatedAt?: string;
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
  /** Số câu có đáp án "Phishing" trong mỗi đề; phần còn lại là "An toàn". */
  phishingCount: number;
  /** Bật thì mỗi email chỉ được làm bài một lần. */
  singleAttemptPerEmail: boolean;
  updatedAt: string;
}

/** Dữ liệu trả về khi khởi tạo hoặc tải một phiên làm bài. */
export interface QuizSessionPayload {
  session: QuizSession;
  questions: QuizQuestion[];
  passScore: number;
}
