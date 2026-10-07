-- AlterTable
ALTER TABLE "questions" ADD COLUMN "difficulty" VARCHAR(20) NOT NULL DEFAULT 'none';

-- AlterTable
ALTER TABLE "quiz_settings" ADD COLUMN "require_participant_info" BOOLEAN NOT NULL DEFAULT false;
