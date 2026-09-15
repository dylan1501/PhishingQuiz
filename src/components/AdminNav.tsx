import { NavLink, useNavigate } from "react-router-dom";
import { logoutRemoteAdmin } from "../apiClient";

export function AdminNav() {
  const navigate = useNavigate();

  async function signOut() {
    await logoutRemoteAdmin().catch(() => undefined);
    navigate("/admin/login", { replace: true });
  }

  return (
    <nav className="admin-links" aria-label="Điều hướng quản trị">
      <NavLink to="/admin/dashboard">
        <img src="/assets/illustrations/shield-scan.svg" alt="" className="admin-tab-icon" />
        Tổng quan
      </NavLink>
      <NavLink to="/admin/participants">
        <img src="/assets/icons/participants.svg" alt="" className="admin-tab-icon" />
        Người tham gia
      </NavLink>
      <NavLink to="/admin/attempts">
        <img src="/assets/icons/attempts.svg" alt="" className="admin-tab-icon" />
        Lịch sử làm bài
      </NavLink>
      <NavLink to="/admin/questions">
        <img src="/assets/icons/questions.svg" alt="" className="admin-tab-icon" />
        Câu hỏi
      </NavLink>
      <button type="button" className="button button-small admin-signout-button" onClick={signOut}>
        <img src="/assets/icons/signout.svg" alt="" className="admin-tab-icon" />
        Đăng xuất
      </button>
    </nav>
  );
}
