import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  createAdminCredentials,
  hasAdminCredentials,
  isAdminAuthenticated,
  signInAdmin,
} from "../storage";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const needsSetup = !hasAdminCredentials();

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Vui lòng nhập email quản trị hợp lệ.");
      return;
    }

    if (password.length < 10) {
      setError("Mật khẩu quản trị phải có ít nhất 10 ký tự.");
      return;
    }

    setSubmitting(true);
    try {
      if (needsSetup) {
        if (password !== confirmPassword) {
          setError("Mật khẩu xác nhận không khớp.");
          return;
        }
        await createAdminCredentials(email, password);
        navigate("/admin/dashboard");
        return;
      }

      if (!(await signInAdmin(email, password))) {
        setError("Thông tin đăng nhập quản trị không đúng.");
        return;
      }
      navigate("/admin/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="content-card form-card">
      <p className="eyebrow">Quản Trị</p>
      <h2>{needsSetup ? "Thiết lập tài khoản quản trị" : "Đăng nhập quản trị"}</h2>
      <p className="section-text">
        {needsSetup
          ? "Tạo tài khoản quản trị đầu tiên cho trình duyệt này. Thông tin đăng nhập không được hardcode trong source hoặc bundle JS."
          : "Nhập thông tin quản trị để truy cập dashboard và dữ liệu quiz."}
      </p>
      <form className="stack" onSubmit={onSubmit}>
        <label>
          Email
          <input
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            autoComplete={needsSetup ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {needsSetup && (
          <label>
            Xác nhận mật khẩu
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        )}
        {error && <div className="notice notice-error">{error}</div>}
        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? "Đang xử lý..." : needsSetup ? "Tạo tài khoản quản trị" : "Đăng nhập"}
        </button>
      </form>
    </section>
  );
}
