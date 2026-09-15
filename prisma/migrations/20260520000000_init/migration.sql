-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "answer_option" AS ENUM ('phishing', 'legitimate');

-- CreateEnum
CREATE TYPE "hotspot_type" AS ENUM ('danger', 'safe');

-- CreateEnum
CREATE TYPE "admin_role" AS ENUM ('admin', 'viewer', 'superuser');

-- CreateEnum
CREATE TYPE "quiz_session_status" AS ENUM ('in_progress', 'completed', 'expired', 'abandoned');

-- CreateTable
CREATE TABLE "participants" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_accounts" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "password_salt" VARCHAR(255) NOT NULL,
    "role" "admin_role" NOT NULL DEFAULT 'admin',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_settings" (
    "id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "question_count" INTEGER NOT NULL DEFAULT 10,
    "randomize_questions" BOOLEAN NOT NULL DEFAULT true,
    "randomize_answers" BOOLEAN NOT NULL DEFAULT false,
    "require_explanation" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" VARCHAR(80) NOT NULL,
    "quiz_id" UUID NOT NULL,
    "title" VARCHAR(220) NOT NULL,
    "category" VARCHAR(80) NOT NULL,
    "scenario_intro" TEXT NOT NULL,
    "scenario_content" TEXT NOT NULL,
    "scenario_html" TEXT NOT NULL,
    "correct_answer" "answer_option" NOT NULL,
    "explanation" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "always_included" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_indicators" (
    "id" UUID NOT NULL,
    "question_id" VARCHAR(80) NOT NULL,
    "label" VARCHAR(240) NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_hotspots" (
    "id" UUID NOT NULL,
    "question_id" VARCHAR(80) NOT NULL,
    "label" TEXT NOT NULL,
    "spot" "hotspot_type" NOT NULL DEFAULT 'danger',
    "html_target" VARCHAR(180),
    "order_index" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_hotspots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_sessions" (
    "id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "status" "quiz_session_status" NOT NULL DEFAULT 'in_progress',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_session_questions" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "question_id" VARCHAR(80) NOT NULL,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "quiz_session_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_session_answers" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "question_id" VARCHAR(80) NOT NULL,
    "selected_answer" "answer_option" NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_session_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_answers" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "question_id" VARCHAR(80) NOT NULL,
    "selected_answer" "answer_option" NOT NULL,
    "correct_answer" "answer_option" NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL,
    "response_ms" INTEGER,

    CONSTRAINT "attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "key" VARCHAR(120) NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "admin_id" UUID,
    "action" VARCHAR(120) NOT NULL,
    "entity_type" VARCHAR(120) NOT NULL,
    "entity_id" VARCHAR(120),
    "before" JSONB,
    "after" JSONB,
    "ip_address" VARCHAR(80),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participants_email_key" ON "participants"("email");

-- CreateIndex
CREATE INDEX "participants_created_at_idx" ON "participants"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "admin_accounts_email_key" ON "admin_accounts"("email");

-- CreateIndex
CREATE INDEX "admin_accounts_is_active_idx" ON "admin_accounts"("is_active");

-- CreateIndex
CREATE INDEX "quizzes_is_active_idx" ON "quizzes"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_settings_quiz_id_key" ON "quiz_settings"("quiz_id");

-- CreateIndex
CREATE INDEX "questions_quiz_id_active_order_index_idx" ON "questions"("quiz_id", "active", "order_index");

-- CreateIndex
CREATE INDEX "questions_quiz_id_always_included_idx" ON "questions"("quiz_id", "always_included");

-- CreateIndex
CREATE INDEX "question_indicators_question_id_order_index_idx" ON "question_indicators"("question_id", "order_index");

-- CreateIndex
CREATE INDEX "question_hotspots_question_id_order_index_idx" ON "question_hotspots"("question_id", "order_index");

-- CreateIndex
CREATE INDEX "quiz_sessions_participant_id_started_at_idx" ON "quiz_sessions"("participant_id", "started_at");

-- CreateIndex
CREATE INDEX "quiz_sessions_quiz_id_status_idx" ON "quiz_sessions"("quiz_id", "status");

-- CreateIndex
CREATE INDEX "quiz_session_questions_session_id_order_index_idx" ON "quiz_session_questions"("session_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_session_questions_session_id_question_id_key" ON "quiz_session_questions"("session_id", "question_id");

-- CreateIndex
CREATE INDEX "quiz_session_answers_question_id_is_correct_idx" ON "quiz_session_answers"("question_id", "is_correct");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_session_answers_session_id_question_id_key" ON "quiz_session_answers"("session_id", "question_id");

-- CreateIndex
CREATE INDEX "attempts_participant_id_completed_at_idx" ON "attempts"("participant_id", "completed_at");

-- CreateIndex
CREATE INDEX "attempts_quiz_id_score_duration_seconds_completed_at_idx" ON "attempts"("quiz_id", "score", "duration_seconds", "completed_at");

-- CreateIndex
CREATE INDEX "attempt_answers_question_id_is_correct_idx" ON "attempt_answers"("question_id", "is_correct");

-- CreateIndex
CREATE UNIQUE INDEX "attempt_answers_attempt_id_question_id_key" ON "attempt_answers"("attempt_id", "question_id");

-- CreateIndex
CREATE INDEX "audit_logs_admin_id_created_at_idx" ON "audit_logs"("admin_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "quiz_settings" ADD CONSTRAINT "quiz_settings_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_indicators" ADD CONSTRAINT "question_indicators_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_hotspots" ADD CONSTRAINT "question_hotspots_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_session_questions" ADD CONSTRAINT "quiz_session_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_session_questions" ADD CONSTRAINT "quiz_session_questions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_session_answers" ADD CONSTRAINT "quiz_session_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_session_answers" ADD CONSTRAINT "quiz_session_answers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

