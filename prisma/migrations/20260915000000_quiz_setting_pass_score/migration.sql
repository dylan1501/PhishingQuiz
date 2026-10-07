-- Số câu đúng tối thiểu để một lượt thi được tính là hoàn thành.
ALTER TABLE "quiz_settings" ADD COLUMN "pass_score" INTEGER NOT NULL DEFAULT 4;
