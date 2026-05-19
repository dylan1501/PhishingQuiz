import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  createAdminQuestion,
  getAdminQuestions,
  patchAdminQuestionState,
  updateAdminQuestion,
} from "../apiClient";
import type { AnswerOption, QuizQuestion } from "../types";

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
}

type HotspotNote = {
  label: string;
  spot: "danger" | "safe";
};

type PreviewStep = {
  title: string;
  body: string;
  spot?: "danger" | "safe";
  hotspotIndex?: number;
};

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
  };
}

function parseHotspotNotes(html: string): HotspotNote[] {
  if (!html || typeof window === "undefined") {
    return [];
  }

  const parser = new window.DOMParser();
  const parsedDocument = parser.parseFromString(html, "text/html");
  return Array.from(parsedDocument.querySelectorAll<HTMLElement>("[data-spot][data-label]")).map(
    (element) => ({
      label: element.dataset.label ?? "",
      spot: element.dataset.spot === "safe" ? "safe" : "danger",
    }),
  );
}

export function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionFormState>(emptyForm);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewAnswer, setPreviewAnswer] = useState<AnswerOption | null>(null);
  const [previewExplanationViewed, setPreviewExplanationViewed] = useState(false);
  const [previewStepIndex, setPreviewStepIndex] = useState(0);
  const [previewBubblePosition, setPreviewBubblePosition] = useState<{ left: number; top: number } | null>(null);
  const [previewAnchorPosition, setPreviewAnchorPosition] = useState<{ left: number; top: number } | null>(null);
  const previewScenarioHtmlRef = useRef<HTMLDivElement | null>(null);
  const editFormRef = useRef<HTMLDivElement | null>(null);

  function setField<K extends keyof QuestionFormState>(key: K, value: QuestionFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setPreviewAnswer(null);
    setPreviewExplanationViewed(false);
    setPreviewStepIndex(0);
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
    setPreviewAnswer(null);
    setPreviewExplanationViewed(false);
    setPreviewStepIndex(0);
    window.requestAnimationFrame(() => {
      editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setPreviewAnswer(null);
    setPreviewExplanationViewed(false);
    setPreviewStepIndex(0);
  }

  const previewHotspotNotes = useMemo(() => parseHotspotNotes(form.scenarioHtml), [form.scenarioHtml]);
  const previewExplanationSteps = useMemo<PreviewStep[]>(() => {
    if (previewHotspotNotes.length > 0) {
      return previewHotspotNotes.map((note, noteIndex) => ({
        title: note.spot === "danger" ? "Dấu hiệu phishing" : "Dấu hiệu hợp lệ",
        body: note.label,
        spot: note.spot,
        hotspotIndex: noteIndex,
      }));
    }

    const steps: PreviewStep[] = [];
    if (form.explanation.trim()) {
      steps.push({ title: "Tổng quan", body: form.explanation.trim() });
    }
    form.indicators
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((indicator) => steps.push({ title: "Điểm cần ghi nhớ", body: indicator }));
    return steps;
  }, [form.explanation, form.indicators, previewHotspotNotes]);
  const previewCurrentStep = previewExplanationSteps[previewStepIndex] ?? null;
  const previewHasMoreSteps = previewStepIndex < previewExplanationSteps.length - 1;
  const alwaysIncludedCount = questions.filter((question) => question.alwaysIncluded && question.active).length;
  const previewHtmlWithSpotOrder = useMemo(() => {
    if (!form.scenarioHtml || typeof window === "undefined") {
      return form.scenarioHtml;
    }

    const parser = new window.DOMParser();
    const parsedDocument = parser.parseFromString(form.scenarioHtml, "text/html");
    Array.from(parsedDocument.querySelectorAll<HTMLElement>("[data-spot][data-label]")).forEach(
      (element, noteIndex) => {
        element.dataset.spotOrder = String(noteIndex);
        element.dataset.activeSpot =
          previewExplanationViewed && previewCurrentStep?.hotspotIndex === noteIndex ? "true" : "false";
      },
    );
    return parsedDocument.body.innerHTML;
  }, [form.scenarioHtml, previewCurrentStep?.hotspotIndex, previewExplanationViewed]);
  const previewCorrect = previewAnswer ? previewAnswer === form.correctAnswer : null;

  useEffect(() => {
    if (
      !previewExplanationViewed ||
      previewCurrentStep?.hotspotIndex === undefined ||
      !previewScenarioHtmlRef.current
    ) {
      setPreviewBubblePosition(null);
      setPreviewAnchorPosition(null);
      return;
    }

    const container = previewScenarioHtmlRef.current;
    const hotspot = container.querySelector<HTMLElement>(
      `[data-spot-order="${previewCurrentStep.hotspotIndex}"]`,
    );

    if (!hotspot) {
      setPreviewBubblePosition({ left: 12, top: 48 });
      setPreviewAnchorPosition(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const hotspotRect = hotspot.getBoundingClientRect();
    const estimatedBubbleWidth = 320;
    const maxLeft = Math.max(16, container.clientWidth - estimatedBubbleWidth - 12);
    const hotspotCenter = hotspotRect.left - containerRect.left + hotspotRect.width / 2;
    const nextLeft = Math.min(Math.max(hotspotCenter - estimatedBubbleWidth / 2, 12), maxLeft);
    const anchorTop = hotspotRect.bottom - containerRect.top + 8;
    setPreviewBubblePosition({ left: nextLeft, top: anchorTop + 36 });
    setPreviewAnchorPosition({ left: hotspotCenter - 4, top: anchorTop });
  }, [previewCurrentStep, previewExplanationViewed, previewHtmlWithSpotOrder]);

  function handlePreviewNext() {
    if (previewHasMoreSteps) {
      setPreviewStepIndex((currentStep) => currentStep + 1);
      return;
    }
    setPreviewExplanationViewed(false);
    setPreviewStepIndex(0);
  }

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

  return (
    <section className="stack">
      <div className="content-card" ref={editFormRef}>
        <p className="eyebrow">Ngân Hàng Câu Hỏi</p>
        <h2>Quản lý tình huống</h2>
        <p className="section-text">
          Đề kiểm tra luôn tối đa 10 câu. Các câu đánh dấu “Luôn có” sẽ được ưu tiên đưa vào đề,
          phần còn lại được random từ các câu đang bật khác, sau đó toàn bộ đề được trộn lại. Hiện có{" "}
          {alwaysIncludedCount} câu đang được đánh dấu luôn có.
        </p>
        {loadError && <div className="notice notice-error">{loadError}</div>}
      </div>
      <div className="content-card">
        <form className="stack" onSubmit={onSubmit}>
          <label>
            Tiêu đề
            <input value={form.title} onChange={(event) => setField("title", event.target.value)} />
          </label>
          <label>
            Loại tình huống
            <input
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
            />
          </label>
          <label>
            Mô tả mở đầu
            <textarea
              value={form.scenarioIntro}
              onChange={(event) => setField("scenarioIntro", event.target.value)}
            />
          </label>
          <label>
            Nội dung tình huống
            <textarea
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
              placeholder={`<div>\n  <a href="https://example.com" title="https://example.com">Hover me</a>\n</div>`}
            />
          </label>
          <div className="html-preview-card admin-question-preview">
            <div className="interactive-label">Preview câu hỏi và giải thích</div>
            <div className="preview-question-head">
              <div>
                <p className="eyebrow">{form.category || "Loại tình huống"}</p>
                <h3>{form.title || "Tiêu đề câu hỏi"}</h3>
                <p className="section-text">
                  {form.scenarioIntro || "Mô tả mở đầu sẽ hiển thị tại đây."}
                </p>
              </div>
              <span className="preview-answer-pill">
                Đáp án đúng: {form.correctAnswer === "phishing" ? "Phishing" : "An toàn"}
              </span>
            </div>
            <div className="scenario-box">
              {form.scenarioContent || "Nội dung tình huống sẽ hiển thị tại đây."}
            </div>
            <div className="scenario-html-stage">
              <div
                ref={previewScenarioHtmlRef}
                className={`scenario-html-content ${previewExplanationViewed ? "explanation-active explanation-with-bubble" : ""}`}
                dangerouslySetInnerHTML={{
                  __html: previewHtmlWithSpotOrder || "<p>Chưa có nội dung HTML.</p>",
                }}
              />
              {previewExplanationViewed && previewCurrentStep?.spot && previewAnchorPosition && (
                <span
                  className={`active-explanation-anchor active-explanation-anchor-${previewCurrentStep.spot}`}
                  style={{ left: previewAnchorPosition.left, top: previewAnchorPosition.top }}
                />
              )}
              {previewExplanationViewed && previewCurrentStep?.spot && previewBubblePosition && (
                <div
                  className={`active-explanation-bubble active-explanation-${previewCurrentStep.spot}`}
                  style={{ left: previewBubblePosition.left, top: previewBubblePosition.top }}
                >
                  <strong>{previewCurrentStep.title}</strong>
                  <p>{previewCurrentStep.body}</p>
                  <button
                    type="button"
                    className="button button-primary explanation-next-button"
                    onClick={handlePreviewNext}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            <div className="answer-grid preview-answer-grid">
              <button
                type="button"
                className={`answer-button ${previewAnswer === "phishing" ? "selected-phishing" : ""}`}
                onClick={() => {
                  setPreviewAnswer("phishing");
                  setPreviewExplanationViewed(false);
                  setPreviewStepIndex(0);
                }}
              >
                Phishing
              </button>
              <button
                type="button"
                className={`answer-button ${previewAnswer === "legitimate" ? "selected-legitimate" : ""}`}
                onClick={() => {
                  setPreviewAnswer("legitimate");
                  setPreviewExplanationViewed(false);
                  setPreviewStepIndex(0);
                }}
              >
                An toàn
              </button>
            </div>
            {previewAnswer && (
              <div className={`answer-feedback ${previewCorrect ? "feedback-correct" : "feedback-wrong"}`}>
                <div className="feedback-icon">{previewCorrect ? "✓" : "!"}</div>
                <div>
                  <strong>{previewCorrect ? "Chính xác" : "Chưa chính xác"}</strong>
                  <p>
                    {previewCorrect
                      ? `Preview đang nhận diện đúng đây là ${form.correctAnswer === "phishing" ? "phishing" : "an toàn"}.`
                      : `Đáp án đúng trong preview là ${form.correctAnswer === "phishing" ? "phishing" : "an toàn"}.`}
                  </p>
                </div>
              </div>
            )}
            <div className="quiz-actions quiz-actions-spaced">
              <button
                type="button"
                className="button button-ghost button-explain"
                disabled={!previewAnswer || previewExplanationSteps.length === 0}
                onClick={() => {
                  setPreviewExplanationViewed(true);
                  setPreviewStepIndex(0);
                }}
              >
                Giải thích
              </button>
              <span className="preview-help-text">
                {previewExplanationSteps.length > 0
                  ? `Có ${previewExplanationSteps.length} điểm giải thích trong preview.`
                  : "Thêm data-spot/data-label hoặc nội dung giải thích để preview lời giải."}
              </span>
            </div>
            {previewExplanationViewed && previewCurrentStep && (
              <>
                <div className="explanation-legend">
                  <span className="legend-chip legend-danger">Vị trí nghi ngờ</span>
                  <span className="legend-chip legend-safe">Dấu hiệu hợp lệ</span>
                </div>
                {!previewCurrentStep.spot && (
                  <div className="inline-explanation-note">
                    <strong>{previewCurrentStep.title}</strong>
                    <p>{previewCurrentStep.body}</p>
                    <button
                      type="button"
                      className="button button-primary explanation-next-button"
                      onClick={handlePreviewNext}
                    >
                      Next
                    </button>
                  </div>
                )}
                <div className="explanation-step-meta">
                  <span>
                    Giải thích {previewStepIndex + 1}/{previewExplanationSteps.length}
                  </span>
                  <strong>
                    {previewHasMoreSteps ? "Bấm Next để xem phần tiếp theo" : "Bấm Next để kết thúc preview"}
                  </strong>
                </div>
              </>
            )}
          </div>
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
          <label className="admin-check-row">
            <input
              type="checkbox"
              checked={form.alwaysIncluded}
              onChange={(event) => setField("alwaysIncluded", event.target.checked)}
            />
            <span>Luôn có trong đề kiểm tra</span>
          </label>
          <label>
            Giải thích
            <textarea
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
          <div className="hero-actions">
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : editingId ? "Lưu chỉnh sửa" : "Thêm câu hỏi"}
            </button>
            {editingId && (
              <button type="button" className="button button-ghost" onClick={resetForm}>
                Hủy chỉnh sửa
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="content-card">
        <table className="table">
          <thead>
            <tr>
              <th>Thứ tự</th>
              <th>Tiêu đề</th>
              <th>Loại</th>
              <th>Đáp án</th>
              <th>Trạng thái</th>
              <th>Luôn có</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id}>
                <td>{question.orderIndex}</td>
                <td>{question.title}</td>
                <td>{question.category}</td>
                <td>{question.correctAnswer}</td>
                <td>{question.active ? "Đang bật" : "Đang tắt"}</td>
                <td>{question.alwaysIncluded ? "Có" : "Không"}</td>
                <td className="table-actions">
                  <button
                    type="button"
                    className="button button-small"
                    onClick={() => editQuestion(question)}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="button button-small"
                    onClick={() => toggleActive(question.id)}
                  >
                    {question.active ? "Tắt" : "Bật"}
                  </button>
                  <button
                    type="button"
                    className="button button-small"
                    onClick={() => toggleAlwaysIncluded(question.id)}
                  >
                    {question.alwaysIncluded ? "Bỏ luôn có" : "Luôn có"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
