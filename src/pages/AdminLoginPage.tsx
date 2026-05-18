import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { isAdminAuthenticated, signInAdmin } from "../storage";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@phishingquiz.local");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!signInAdmin(email, password)) {
      setError("Thông tin đăng nhập quản trị không đúng.");
      return;
    }
    navigate("/admin/dashboard");
  }

  return (
    <section className="content-card form-card">
      <p className="eyebrow">Quản Trị</p>
      <h2>Đăng nhập để quản lý dữ liệu quiz</h2>
      <p className="section-text">Tài khoản demo đã được điền sẵn để bạn kiểm tra nhanh.</p>
      <form className="stack" onSubmit={onSubmit}>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <div className="notice notice-error">{error}</div>}
        <button className="button button-primary" type="submit">
          Đăng nhập
        </button>
      </form>
    </section>
  );
}
