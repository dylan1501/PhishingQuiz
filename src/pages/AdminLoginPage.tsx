import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getRemoteAdminStatus, loginRemoteAdmin, setupRemoteAdmin } from "../apiClient";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    let active = true;
    getRemoteAdminStatus()
      .then((status) => {
        if (active) {
          setNeedsSetup(!status.hasAdmin);
          setAuthenticated(status.authenticated);
        }
      })
      .catch((error) => {
        if (active) {
          setError(error instanceof Error ? error.message : "Không kiểm tra được trạng thái quản trị.");
        }
      })
      .finally(() => {
        if (active) {
          setLoadingStatus(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (authenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (loadingStatus) {
    return (
      <section className="content-card form-card">
        <p className="eyebrow">Quản Trị</p>
        <h2>Đang kiểm tra trạng thái quản trị</h2>
      </section>
    );
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
        await setupRemoteAdmin(email, password);
        navigate("/admin/dashboard");
        return;
      }

      await loginRemoteAdmin(email, password);
      navigate("/admin/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không xử lý được đăng nhập quản trị.");
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
          ? "Tạo tài khoản quản trị đầu tiên trong cơ sở dữ liệu. Thông tin đăng nhập không được lưu ở trình duyệt."
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
