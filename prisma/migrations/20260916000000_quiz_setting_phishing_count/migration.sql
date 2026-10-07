-- Số câu có đáp án "Phishing" trong mỗi đề; các câu còn lại có đáp án "An toàn".
ALTER TABLE "quiz_settings" ADD COLUMN "phishing_count" INTEGER NOT NULL DEFAULT 5;
