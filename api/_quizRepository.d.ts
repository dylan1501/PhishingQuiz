import type { AnswerOption as ClientAnswerOption, Attempt, Participant, QuizConfig, QuizQuestion, QuizSession } from "../src/types";
type QuestionInput = {
    title: string;
    category: string;
    scenarioIntro: string;
    scenarioContent: string;
    scenarioHtml: string;
    correctAnswer: ClientAnswerOption;
    explanation: string;
    indicators: string[];
    alwaysIncluded: boolean;
};
export declare function ensureDefaultQuiz(): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    title: string;
    description: string | null;
}>;
export declare function listQuestions(includeInactive?: boolean): Promise<QuizQuestion[]>;
export declare function createQuestion(input: QuestionInput): Promise<QuizQuestion>;
export declare function updateQuestion(questionId: string, input: QuestionInput): Promise<QuizQuestion>;
export declare function updateQuestionState(questionId: string, input: Partial<Pick<QuizQuestion, "active" | "alwaysIncluded">>): Promise<QuizQuestion>;
export declare function getQuizConfig(): Promise<QuizConfig>;
export declare function saveQuizConfig(questionCount: number): Promise<QuizConfig>;
export declare function upsertParticipant(input: {
    fullName: string;
    email: string;
    consent: boolean;
}): Promise<Participant>;
export declare function listParticipants(): Promise<Participant[]>;
export declare function startQuizSession(participantId: string): Promise<QuizSession>;
export declare function getQuizSession(sessionId: string): Promise<{
    session: {
        id: string;
        remote: true;
        participantId: string;
        startedAt: string;
        questionIds: string[];
        answers: {
            questionId: string;
            selectedAnswer: ClientAnswerOption;
            isCorrect: boolean;
            answeredAt: string;
        }[];
    };
    questions: QuizQuestion[];
}>;
export declare function saveSessionAnswer(input: {
    sessionId: string;
    questionId: string;
    selectedAnswer: ClientAnswerOption;
}): Promise<{
    questionId: string;
    selectedAnswer: ClientAnswerOption;
    isCorrect: boolean;
    answeredAt: string;
}>;
export declare function finishQuizSession(sessionId: string): Promise<Attempt & {
    participant: Participant;
}>;
export declare function getAttemptById(attemptId: string): Promise<Attempt & {
    participant: Participant;
}>;
export declare function listAttempts(): Promise<(Attempt & {
    participant: Participant;
})[]>;
export declare function getLeaderboard(): Promise<(Attempt & {
    participant: Participant;
})[]>;
export {};
