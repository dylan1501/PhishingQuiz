# Thiết kế cơ sở dữ liệu Phishing Quiz

Tài liệu này mô tả thiết kế CSDL PostgreSQL đang dùng cho Phishing Quiz khi triển khai trên Vercel hoặc hạ tầng backend riêng.

## Mục tiêu

- Lưu người tham gia, lượt làm bài, câu trả lời và leaderboard dùng chung trên nhiều thiết bị.
- Lưu ngân hàng câu hỏi, vùng HTML mô phỏng, hotspot giải thích và cấu hình số câu hỏi.
- Lưu tài khoản quản trị bằng password hash, không hardcode credential ở frontend.
- Hỗ trợ audit log cho các thao tác chỉnh sửa câu hỏi/cấu hình.

## Công nghệ đề xuất

- Database: PostgreSQL.
- ORM: Prisma.
- Biến môi trường: `DATABASE_URL`.
- Khi chạy trên Vercel, cần thêm API route/serverless function để frontend gọi tới database. Frontend Vite không được kết nối trực tiếp tới database từ trình duyệt.

## Nhóm bảng chính

### Người tham gia và kết quả

- `participants`: lưu họ tên, email, đồng ý lưu kết quả.
- `quiz_sessions`: lưu phiên làm bài đang chạy, trạng thái, thời gian bắt đầu/kết thúc.
- `quiz_session_questions`: lưu danh sách câu hỏi đã random cho từng phiên để đảm bảo reload hoặc làm tiếp vẫn dùng đúng đề.
- `quiz_session_answers`: lưu tạm câu trả lời trong quá trình làm bài trước khi hoàn tất.
- `attempts`: lưu kết quả cuối cùng, điểm, tổng số câu, thời gian làm bài.
- `attempt_answers`: lưu từng câu trả lời, đáp án đã chọn, đáp án đúng, đúng/sai.

### Quiz và ngân hàng câu hỏi

- `quizzes`: lưu bộ quiz.
- `quiz_settings`: lưu số câu hỏi mỗi đề, random, bắt buộc xem giải thích.
- `questions`: lưu title, category, scenario intro/content/html, đáp án đúng, giải thích, trạng thái active, luôn có.
- `question_indicators`: lưu các dấu hiệu nhận biết dạng danh sách.
- `question_hotspots`: lưu các vị trí/dấu hiệu trong vùng HTML mô phỏng để hiển thị bong bóng giải thích.

### Quản trị và vận hành

- `admin_accounts`: lưu tài khoản quản trị, salt/hash mật khẩu, role, trạng thái.
- `audit_logs`: lưu thao tác chỉnh sửa câu hỏi/cấu hình/người dùng.
- `app_settings`: lưu các tham số hệ thống dạng key/value.

## Mapping dữ liệu ứng dụng

| Nhóm dữ liệu | Bảng CSDL |
| --- | --- |
| Người tham gia | `participants` |
| Ngân hàng câu hỏi | `questions`, `question_indicators`, `question_hotspots` |
| Lượt thi đã hoàn tất | `attempts`, `attempt_answers` |
| Phiên làm bài đang chạy | `quiz_sessions`, `quiz_session_questions`, `quiz_session_answers` |
| Cấu hình bài thi | `quiz_settings` hoặc `app_settings` |
| Tài khoản quản trị | `admin_accounts` |

## Luồng API cần có ở bước triển khai backend

Project hiện đã có API serverless dạng catch-all tại `api/[...path].ts`. Frontend gọi API trực tiếp và yêu cầu `DATABASE_URL` hợp lệ để hoạt động.

### Public

- `POST /api/participants`: tạo hoặc lấy người tham gia theo email.
- `POST /api/quiz-sessions`: tạo phiên làm bài và random danh sách câu hỏi.
- `POST /api/quiz-sessions/:id/answers`: lưu câu trả lời từng câu.
- `POST /api/quiz-sessions/:id/finish`: tạo `attempt`, `attempt_answers`, đóng session.
- `GET /api/questions`: lấy danh sách câu hỏi đang bật.
- `GET /api/attempts?attemptId=:id`: lấy kết quả một lượt thi.
- `GET /api/leaderboard`: lấy bảng xếp hạng theo `score DESC`, `duration_seconds ASC`, `completed_at ASC`.

### Admin

- `POST /api/admin/login`: đăng nhập quản trị.
- `GET /api/admin/participants`: danh sách người tham gia.
- `GET /api/admin/attempts`: lịch sử làm bài.
- `GET /api/admin/questions`: danh sách câu hỏi.
- `POST /api/admin/questions`: thêm câu hỏi.
- `PUT /api/admin/questions/:id`: sửa câu hỏi.
- `PATCH /api/admin/questions/:id/status`: bật/tắt hoặc đánh dấu luôn có.
- `GET /api/admin/settings`: lấy cấu hình quiz.
- `PUT /api/admin/settings`: cập nhật số câu hỏi/cấu hình.

## Các lệnh Prisma

Tạo file `.env` từ `.env.example` rồi cấu hình `DATABASE_URL`.

```bash
npm run db:validate
npm run db:format
npm run db:generate
npm run db:migrate
npm run db:studio
```

## Ghi chú triển khai

- Không import Prisma Client vào code chạy trên trình duyệt. Chỉ dùng trong serverless/API/backend.
- Khi chạy `npm run dev`, Vite có middleware xử lý `/api/*` bằng cùng handler với Vercel. Nếu PostgreSQL chưa bật hoặc `DATABASE_URL` trỏ sai, môi trường dev sẽ dùng bộ nhớ tạm phía server để UI vẫn chạy được. Production không dùng fallback này.
- Khi migrate thật, cần viết script seed để đưa `seedQuestions` từ `src/data.ts` vào `quizzes`, `questions`, `question_indicators`, `question_hotspots`.
- Password admin được hash ở server trước khi lưu vào `admin_accounts`. Có thể nâng cấp thuật toán sang Argon2 hoặc bcrypt nếu cần tiêu chuẩn mạnh hơn.
- Leaderboard không hiển thị email đầy đủ; chỉ trả về tên, điểm, thời gian, ngày làm bài.
- `scenario_html` phải sanitize ở server trước khi lưu và/hoặc trước khi render.
