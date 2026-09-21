import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { QuestionPreview } from "../components/QuestionPreview";
import {
  createAdminQuestion,
  deleteAdminQuestion,
  getAdminQuestions,
  patchAdminQuestionState,
  updateAdminQuestion,
} from "../apiClient";
import type { AnswerOption, QuizQuestion } from "../types";
import { EyeIcon, PencilIcon, PinIcon, PinOffIcon, PlusIcon, PowerIcon, SearchIcon, TrashIcon } from "../components/icons";

type QuestionSortKey = "orderIndex" | "title" | "category" | "active" | "timeLimitSeconds" | "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | "active" | "inactive";
type AlwaysFilter = "all" | "yes" | "no";

function formatDateTime(value?: string) {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface QuestionFormState {
  title: string;
  category: string;
  scenarioIntro: string;
  scenarioContent: string;
  scenarioHtml: string;
  correctAnswer: AnswerOption;
  explanation: string;
  indicators: string;
  alwaysIncluded: boolean;
  timeLimitSeconds: number;
}

const emptyForm: QuestionFormState = {
  title: "",
  category: "Email",
  scenarioIntro: "",
  scenarioContent: "",
  scenarioHtml: "",
  correctAnswer: "phishing",
  explanation: "",
  indicators: "",
  alwaysIncluded: false,
  timeLimitSeconds: 30,
};

function mapQuestionToForm(question: QuizQuestion): QuestionFormState {
  return {
    title: question.title,
    category: question.category,
    scenarioIntro: question.scenarioIntro,
    scenarioContent: question.scenarioContent,
    scenarioHtml: question.scenarioHtml,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    indicators: question.indicators.join(", "),
    alwaysIncluded: question.alwaysIncluded,
    timeLimitSeconds: question.timeLimitSeconds ?? 30,
  };
}

export function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionFormState>(emptyForm);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<QuizQuestion | null>(null);
  const [pendingDelete, setPendingDelete] = useState<QuizQuestion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const editFormRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [alwaysFilter, setAlwaysFilter] = useState<AlwaysFilter>("all");
  const [sortKey, setSortKey] = useState<QuestionSortKey>("orderIndex");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  function setField<K extends keyof QuestionFormState>(key: K, value: QuestionFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // Đóng modal preview / xác nhận xóa bằng phím Esc.
  useEffect(() => {
    if (!previewQuestion && !pendingDelete) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewQuestion(null);
        setPendingDelete(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewQuestion, pendingDelete]);

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    setLoadError("");
    try {
      await deleteAdminQuestion(pendingDelete.id);
      setQuestions((currentQuestions) => currentQuestions.filter((question) => question.id !== pendingDelete.id));
      if (editingId === pendingDelete.id) {
        resetForm();
      }
      setPendingDelete(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Không xóa được câu hỏi.");
      setPendingDelete(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    let active = true;
    getAdminQuestions()
      .then((remoteQuestions) => {
        if (active) {
          setQuestions(remoteQuestions);
        }
      })
      .catch((error) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "Không tải được ngân hàng câu hỏi.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function toggleActive(questionId: string) {
    const currentQuestion = questions.find((question) => question.id === questionId);
    if (!currentQuestion) {
      return;
    }
    try {
      const updatedQuestion = await patchAdminQuestionState(questionId, { active: !currentQuestion.active });
      setQuestions((currentQuestions) =>
        currentQuestions.map((question) => (question.id === questionId ? updatedQuestion : question)),
      );
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Không cập nhật được trạng thái câu hỏi.");
    }
  }

  async function toggleAlwaysIncluded(questionId: string) {
    const currentQuestion = questions.find((question) => question.id === questionId);
    if (!currentQuestion) {
      return;
    }
    try {
      const updatedQuestion = await patchAdminQuestionState(questionId, {
        alwaysIncluded: !currentQuestion.alwaysIncluded,
      });
      setQuestions((currentQuestions) =>
        currentQuestions.map((question) => (question.id === questionId ? updatedQuestion : question)),
      );
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Không cập nhật được câu hỏi luôn có.");
    }
  }

  function editQuestion(question: QuizQuestion) {
    setEditingId(question.id);
    setForm(mapQuestionToForm(question));
    window.requestAnimationFrame(() => {
      editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startNewQuestion() {
    resetForm();
    window.requestAnimationFrame(() => {
      editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // ---- lọc + sắp xếp bảng ----
  const categories = useMemo(
    () => Array.from(new Set(questions.map((question) => question.category))).sort((a, b) => a.localeCompare(b, "vi")),
    [questions],
  );
  const hasActiveFilters = Boolean(search.trim()) || Boolean(categoryFilter) || statusFilter !== "all" || alwaysFilter !== "all";
  const visibleQuestions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = questions.filter((question) => {
      if (needle && !`${question.title} ${question.category} ${question.scenarioIntro}`.toLowerCase().includes(needle)) {
        return false;
      }
      if (categoryFilter && question.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && question.active !== (statusFilter === "active")) {
        return false;
      }
      if (alwaysFilter !== "all" && question.alwaysIncluded !== (alwaysFilter === "yes")) {
        return false;
      }
      return true;
    });
    const direction = sortDirection === "asc" ? 1 : -1;
    const isDefaultOrder = sortKey === "orderIndex" && sortDirection === "asc";
    return [...filtered].sort((first, second) => {
      // Thứ tự mặc định: câu "luôn có" ghim lên đầu, rồi tới thứ tự trong ngân hàng.
      if (isDefaultOrder && first.alwaysIncluded !== second.alwaysIncluded) {
        return first.alwaysIncluded ? -1 : 1;
      }
      if (sortKey === "orderIndex") {
        return (first.orderIndex - second.orderIndex) * direction;
      }
      if (sortKey === "active") {
        return (Number(first.active) - Number(second.active)) * direction;
      }
      if (sortKey === "timeLimitSeconds") {
        return ((first.timeLimitSeconds ?? 0) - (second.timeLimitSeconds ?? 0)) * direction;
      }
      if (sortKey === "createdAt" || sortKey === "updatedAt") {
        const firstTime = first[sortKey] ? new Date(first[sortKey]).getTime() : 0;
        const secondTime = second[sortKey] ? new Date(second[sortKey]).getTime() : 0;
        return (firstTime - secondTime) * direction;
      }
      return first[sortKey].localeCompare(second[sortKey], "vi", { sensitivity: "base" }) * direction;
    });
  }, [questions, search, categoryFilter, statusFilter, alwaysFilter, sortKey, sortDirection]);

  function changeSort(nextSortKey: QuestionSortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextSortKey);
    setSortDirection(nextSortKey === "createdAt" || nextSortKey === "updatedAt" ? "desc" : "asc");
  }

  function renderSortHeader(label: string, nextSortKey: QuestionSortKey) {
    const isActive = sortKey === nextSortKey;
    return (
      <button type="button" className="table-sort-button" onClick={() => changeSort(nextSortKey)}>
        <span>{label}</span>
        <span className={`sort-indicator ${isActive ? "sort-indicator-active" : ""}`}>
          {isActive ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    );
  }

  function clearFilters() {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("all");
    setAlwaysFilter("all");
  }

  const alwaysIncludedCount = questions.filter((question) => question.alwaysIncluded && question.active).length;
  const formPreviewQuestion = useMemo(
    () => ({
      title: form.title,
      category: form.category,
      scenarioIntro: form.scenarioIntro,
      scenarioContent: form.scenarioContent,
      scenarioHtml: form.scenarioHtml,
      correctAnswer: form.correctAnswer,
      explanation: form.explanation,
      indicators: form.indicators
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    }),
    [form],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      scenarioIntro: form.scenarioIntro.trim(),
      scenarioContent: form.scenarioContent.trim(),
      scenarioHtml: form.scenarioHtml.trim(),
      correctAnswer: form.correctAnswer,
      explanation: form.explanation.trim(),
      indicators: form.indicators
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      alwaysIncluded: form.alwaysIncluded,
      timeLimitSeconds: form.timeLimitSeconds,
    };

    setSaving(true);
    setLoadError("");
    if (editingId) {
      try {
        const updatedQuestion = await updateAdminQuestion(editingId, payload);
        setQuestions((currentQuestions) =>
          currentQuestions.map((question) => (question.id === editingId ? updatedQuestion : question)),
        );
        resetForm();
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Không lưu được câu hỏi.");
      } finally {
        setSaving(false);
      }
      return;
    }

    try {
      const nextQuestion = await createAdminQuestion(payload);
      setQuestions((currentQuestions) => [...currentQuestions, nextQuestion].sort((a, b) => a.orderIndex - b.orderIndex));
      resetForm();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Không thêm được câu hỏi.");
    } finally {
      setSaving(false);
    }
  }

  const activeCount = questions.filter((question) => question.active).length;

  return (
    <section className="stack">
      <div className="content-card questions-card">
        <div className="admin-page-heading">
          <div>
            <h2>Ngân hàng câu hỏi</h2>
            <p className="questions-summary">
              {questions.length} câu · {activeCount} đang bật · {alwaysIncludedCount} luôn có
              {hasActiveFilters ? ` · đang hiện ${visibleQuestions.length}` : ""}
            </p>
          </div>
          <button type="button" className="button button-primary button-small add-question-button" onClick={startNewQuestion}>
            <PlusIcon />
            Thêm câu hỏi
          </button>
        </div>
        {loadError && <div className="notice notice-error">{loadError}</div>}
        <div className="table-toolbar">
          <label className="search-field">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tiêu đề, loại, mô tả…"
              aria-label="Tìm câu hỏi"
            />
          </label>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Lọc theo loại">
            <option value="">Tất cả loại</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            aria-label="Lọc theo trạng thái"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="active">Đang bật</option>
            <option value="inactive">Đang tắt</option>
          </select>
          <select
            value={alwaysFilter}
            onChange={(event) => setAlwaysFilter(event.target.value as AlwaysFilter)}
            aria-label="Lọc theo luôn có"
          >
            <option value="all">Luôn có: tất cả</option>
            <option value="yes">Chỉ luôn có</option>
            <option value="no">Không luôn có</option>
          </select>
          {hasActiveFilters && (
            <button type="button" className="button button-small" onClick={clearFilters}>
              Xóa lọc
            </button>
          )}
        </div>
        <div className="table-scroll">
          <table className="table questions-table">
            <thead>
              <tr>
                <th className="stt-col">{renderSortHeader("#", "orderIndex")}</th>
                <th>{renderSortHeader("Tiêu đề", "title")}</th>
                <th>{renderSortHeader("Loại", "category")}</th>
                <th>Đáp án</th>
                <th>{renderSortHeader("Trạng thái", "active")}</th>
                <th>Luôn có</th>
                <th>{renderSortHeader("Thời gian", "timeLimitSeconds")}</th>
                <th>{renderSortHeader("Created", "createdAt")}</th>
                <th>{renderSortHeader("Last edit", "updatedAt")}</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visibleQuestions.map((question) => (
                <tr
                  key={question.id}
                  className={`${question.active ? "" : "row-inactive"} ${question.alwaysIncluded ? "row-pinned" : ""}`}
                >
                  <td className="stt-col">{question.orderIndex}</td>
                  <td className="question-title-cell">{question.title}</td>
                  <td>{question.category}</td>
                  <td>
                    <span className={`answer-chip answer-chip-${question.correctAnswer}`}>
                      {question.correctAnswer === "phishing" ? "Phishing" : "An toàn"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-chip ${question.active ? "status-on" : "status-off"}`}>
                      {question.active ? "Đang bật" : "Đang tắt"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-chip ${question.alwaysIncluded ? "status-on" : "status-off"}`}>
                      {question.alwaysIncluded ? "Có" : "Không"}
                    </span>
                  </td>
                  <td className="time-limit-cell">{question.timeLimitSeconds ?? 30}s</td>
                  <td className="date-cell">{formatDateTime(question.createdAt)}</td>
                  <td className="date-cell">{formatDateTime(question.updatedAt)}</td>
                  <td className="table-actions">
                    <button
                      type="button"
                      className="icon-button icon-button-preview"
                      title="Xem thử như người làm bài"
                      aria-label={`Xem thử câu hỏi: ${question.title}`}
                      onClick={() => setPreviewQuestion(question)}
                    >
                      <EyeIcon />
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      title="Sửa"
                      aria-label={`Sửa câu hỏi: ${question.title}`}
                      onClick={() => editQuestion(question)}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      className={`icon-button ${question.active ? "icon-button-danger" : "icon-button-success"}`}
                      title={question.active ? "Tắt câu hỏi" : "Bật câu hỏi"}
                      aria-label={`${question.active ? "Tắt" : "Bật"} câu hỏi: ${question.title}`}
                      aria-pressed={question.active}
                      onClick={() => toggleActive(question.id)}
                    >
                      <PowerIcon />
                    </button>
                    <button
                      type="button"
                      className={`icon-button ${question.alwaysIncluded ? "icon-button-active" : ""}`}
                      title={question.alwaysIncluded ? "Bỏ đánh dấu luôn có" : "Đánh dấu luôn có"}
                      aria-label={`${question.alwaysIncluded ? "Bỏ luôn có" : "Luôn có"}: ${question.title}`}
                      aria-pressed={question.alwaysIncluded}
                      onClick={() => toggleAlwaysIncluded(question.id)}
                    >
                      {question.alwaysIncluded ? <PinOffIcon /> : <PinIcon />}
                    </button>
                    <button
                      type="button"
                      className="icon-button icon-button-delete"
                      title="Xóa câu hỏi"
                      aria-label={`Xóa câu hỏi: ${question.title}`}
                      onClick={() => setPendingDelete(question)}
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
              {visibleQuestions.length === 0 && (
                <tr>
                  <td colSpan={10} className="table-empty">
                    {questions.length === 0 ? "Chưa có câu hỏi nào." : "Không có câu hỏi khớp bộ lọc."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="content-card question-editor-card" ref={editFormRef}>
        <div className="admin-page-heading question-editor-heading">
          <div>
            <p className="eyebrow">{editingId ? "Sửa Câu Hỏi" : "Thêm Câu Hỏi"}</p>
            <h2>{editingId ? form.title || "Câu hỏi" : "Câu hỏi mới"}</h2>
          </div>
          <div className="hero-actions question-editor-actions">
            {editingId && (
              <button type="button" className="button button-ghost button-small" onClick={resetForm}>
                Hủy chỉnh sửa
              </button>
            )}
            <button className="button button-primary button-small" type="submit" form="question-editor-form" disabled={saving}>
              {saving ? "Đang lưu..." : editingId ? "Lưu chỉnh sửa" : "Thêm câu hỏi"}
            </button>
          </div>
        </div>
        <div className="question-editor">
          <form id="question-editor-form" className="question-editor-fields" onSubmit={onSubmit}>
            <div className="field-row">
              <label>
                Tiêu đề
                <input value={form.title} onChange={(event) => setField("title", event.target.value)} />
              </label>
              <label>
                Loại tình huống
                <input value={form.category} onChange={(event) => setField("category", event.target.value)} />
              </label>
            </div>
            <div className="field-row field-row-answer field-row-three">
              <label>
                Đáp án đúng
                <select
                  value={form.correctAnswer}
                  onChange={(event) => setField("correctAnswer", event.target.value as AnswerOption)}
                >
                  <option value="phishing">Phishing</option>
                  <option value="legitimate">An toàn</option>
                </select>
              </label>
              <label>
                Thời gian (giây)
                <input
                  type="number"
                  min={5}
                  max={600}
                  value={form.timeLimitSeconds}
                  onChange={(event) => setField("timeLimitSeconds", Number(event.target.value))}
                />
              </label>
              <label className="admin-check-row">
                <input
                  type="checkbox"
                  checked={form.alwaysIncluded}
                  onChange={(event) => setField("alwaysIncluded", event.target.checked)}
                />
                <span>Luôn có trong đề</span>
              </label>
            </div>
            <label>
              Mô tả mở đầu
              <textarea
                className="textarea-short"
                value={form.scenarioIntro}
                onChange={(event) => setField("scenarioIntro", event.target.value)}
              />
            </label>
            <label>
              Nội dung tình huống
              <textarea
                className="textarea-short"
                value={form.scenarioContent}
                onChange={(event) => setField("scenarioContent", event.target.value)}
              />
            </label>
            <label>
              Vùng HTML mô phỏng tương tác
              <textarea
                className="html-editor"
                value={form.scenarioHtml}
                onChange={(event) => setField("scenarioHtml", event.target.value)}
                placeholder={`<div>
  <a href="https://example.com" title="https://example.com">Hover me</a>
</div>`}
              />
            </label>
            <label>
              Giải thích
              <textarea
                className="textarea-short"
                value={form.explanation}
                onChange={(event) => setField("explanation", event.target.value)}
              />
            </label>
            <label>
              Dấu hiệu nhận biết
              <input
                value={form.indicators}
                onChange={(event) => setField("indicators", event.target.value)}
                placeholder="domain giả, tạo cảm giác gấp, yêu cầu OTP"
              />
            </label>
          </form>
          <aside className="question-editor-preview">
            <QuestionPreview question={formPreviewQuestion} label="Preview — cập nhật theo nội dung đang nhập" />
          </aside>
        </div>
      </div>
      {pendingDelete && (
        <div className="modal-backdrop preview-modal-backdrop" onClick={() => !deleting && setPendingDelete(null)}>
          <div
            className="modal-card confirm-modal-card"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-question-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">Xóa Câu Hỏi</p>
            <h3 id="delete-question-title">Xóa “{pendingDelete.title}”?</h3>
            <p className="section-text">
              Câu hỏi sẽ bị xóa vĩnh viễn khỏi ngân hàng và không thể hoàn tác. Câu hỏi đã có trong lịch sử
              làm bài sẽ không xóa được — hãy tắt thay vì xóa.
            </p>
            <div className="hero-actions confirm-modal-actions">
              <button type="button" className="button button-ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
                Hủy
              </button>
              <button type="button" className="button button-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Đang xóa..." : "Xóa câu hỏi"}
              </button>
            </div>
          </div>
        </div>
      )}
      {previewQuestion && (
        <div className="modal-backdrop preview-modal-backdrop" onClick={() => setPreviewQuestion(null)}>
          <div
            className="modal-card preview-modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={`Xem thử: ${previewQuestion.title}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="preview-modal-head">
              <div>
                <p className="eyebrow">Xem thử như người làm bài</p>
                <h3>{previewQuestion.title}</h3>
              </div>
              <button
                type="button"
                className="button button-small"
                onClick={() => setPreviewQuestion(null)}
                aria-label="Đóng"
              >
                Đóng ✕
              </button>
            </div>
            <QuestionPreview question={previewQuestion} label="" />
          </div>
        </div>
      )}
    </section>
  );
}
