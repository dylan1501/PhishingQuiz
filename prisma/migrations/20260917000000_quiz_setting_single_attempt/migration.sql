-- Bật thì mỗi email chỉ được làm bài một lần.
ALTER TABLE "quiz_settings" ADD COLUMN "single_attempt_per_email" BOOLEAN NOT NULL DEFAULT false;
