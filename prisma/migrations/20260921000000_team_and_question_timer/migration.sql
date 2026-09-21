-- Đội liên minh của người chơi (chọn ở màn bắt đầu).
ALTER TABLE "participants" ADD COLUMN "team" VARCHAR(80);

-- Thời gian tối đa cho mỗi câu hỏi; câu mới mặc định 30s.
ALTER TABLE "questions" ADD COLUMN "time_limit_seconds" INTEGER NOT NULL DEFAULT 30;

-- Câu hỏi đang có: đặt ngẫu nhiên 40/45/50/55/60 giây.
UPDATE "questions" SET "time_limit_seconds" = (ARRAY[40, 45, 50, 55, 60])[floor(random() * 5) + 1];
