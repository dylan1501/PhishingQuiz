-- Link each saved attempt to its quiz session so finishing a session is idempotent.
ALTER TABLE "attempts" ADD COLUMN "quiz_session_id" UUID;

CREATE UNIQUE INDEX "attempts_quiz_session_id_key" ON "attempts"("quiz_session_id");

ALTER TABLE "attempts" ADD CONSTRAINT "attempts_quiz_session_id_fkey"
FOREIGN KEY ("quiz_session_id") REFERENCES "quiz_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
