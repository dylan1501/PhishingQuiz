import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AnswerOption } from "../types";

/** Các trường tối thiểu để dựng lại trải nghiệm làm bài của một câu hỏi. */
export interface PreviewQuestion {
  title: string;
  category: string;
  scenarioIntro: string;
  scenarioContent: string;
  scenarioHtml: string;
  correctAnswer: AnswerOption;
  explanation: string;
  indicators: string[];
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

interface QuestionPreviewProps {
  question: PreviewQuestion;
  /** Nhãn góc trên; bỏ trống để ẩn (dùng trong modal). */
  label?: string;
}

// Mô phỏng đúng luồng người dùng làm bài: chọn đáp án → phản hồi → xem giải thích từng bước
// (bong bóng gắn vào hotspot data-spot/data-label, hoặc ghi chú inline nếu không có hotspot).
export function QuestionPreview({ question, label = "Preview câu hỏi và giải thích" }: QuestionPreviewProps) {
  const [answer, setAnswer] = useState<AnswerOption | null>(null);
  const [explanationViewed, setExplanationViewed] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [bubblePosition, setBubblePosition] = useState<{ left: number; top: number } | null>(null);
  const [anchorPosition, setAnchorPosition] = useState<{ left: number; top: number } | null>(null);
  const scenarioHtmlRef = useRef<HTMLDivElement | null>(null);

  // Nội dung câu hỏi đổi (gõ trong form / mở câu khác) → làm mới trạng thái preview.
  const questionSignature = JSON.stringify(question);
  useEffect(() => {
    setAnswer(null);
    setExplanationViewed(false);
    setStepIndex(0);
  }, [questionSignature]);

  const hotspotNotes = useMemo(() => parseHotspotNotes(question.scenarioHtml), [question.scenarioHtml]);
  const explanationSteps = useMemo<PreviewStep[]>(() => {
    if (hotspotNotes.length > 0) {
      return hotspotNotes.map((note, noteIndex) => ({
        title: note.spot === "danger" ? "Dấu hiệu phishing" : "Dấu hiệu hợp lệ",
        body: note.label,
        spot: note.spot,
        hotspotIndex: noteIndex,
      }));
    }

    const steps: PreviewStep[] = [];
    if (question.explanation.trim()) {
      steps.push({ title: "Tổng quan", body: question.explanation.trim() });
    }
    question.indicators.forEach((indicator) => steps.push({ title: "Điểm cần ghi nhớ", body: indicator }));
    return steps;
  }, [question.explanation, question.indicators, hotspotNotes]);
  const currentStep = explanationSteps[stepIndex] ?? null;
  const hasMoreSteps = stepIndex < explanationSteps.length - 1;

  const htmlWithSpotOrder = useMemo(() => {
    if (!question.scenarioHtml || typeof window === "undefined") {
      return question.scenarioHtml;
    }

    const parser = new window.DOMParser();
    const parsedDocument = parser.parseFromString(question.scenarioHtml, "text/html");
    Array.from(parsedDocument.querySelectorAll<HTMLElement>("[data-spot][data-label]")).forEach(
      (element, noteIndex) => {
        element.dataset.spotOrder = String(noteIndex);
        element.dataset.activeSpot = explanationViewed && currentStep?.hotspotIndex === noteIndex ? "true" : "false";
      },
    );
    return parsedDocument.body.innerHTML;
  }, [question.scenarioHtml, currentStep?.hotspotIndex, explanationViewed]);
  const correct = answer ? answer === question.correctAnswer : null;

  useLayoutEffect(() => {
    if (!explanationViewed || currentStep?.hotspotIndex === undefined || !scenarioHtmlRef.current) {
      setBubblePosition(null);
      setAnchorPosition(null);
      return;
    }

    const container = scenarioHtmlRef.current;
    const hotspot = container.querySelector<HTMLElement>(`[data-spot-order="${currentStep.hotspotIndex}"]`);

    if (!hotspot) {
      setBubblePosition({ left: 12, top: 48 });
      setAnchorPosition(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const hotspotRect = hotspot.getBoundingClientRect();
    const estimatedBubbleWidth = 320;
    const maxLeft = Math.max(16, container.clientWidth - estimatedBubbleWidth - 12);
    const hotspotCenter = hotspotRect.left - containerRect.left + hotspotRect.width / 2;
    const nextLeft = Math.min(Math.max(hotspotCenter - estimatedBubbleWidth / 2, 12), maxLeft);
    const anchorTop = hotspotRect.bottom - containerRect.top + 8;
    setBubblePosition({ left: nextLeft, top: anchorTop + 36 });
    setAnchorPosition({ left: hotspotCenter - 4, top: anchorTop });
  }, [currentStep, explanationViewed, htmlWithSpotOrder]);

  function chooseAnswer(nextAnswer: AnswerOption) {
    setAnswer(nextAnswer);
    setExplanationViewed(false);
    setStepIndex(0);
  }

  function handleNext() {
    if (hasMoreSteps) {
      setStepIndex((currentIndex) => currentIndex + 1);
      return;
    }
    setExplanationViewed(false);
    setStepIndex(0);
  }

  const answerLabel = question.correctAnswer === "phishing" ? "phishing" : "an toàn";

  return (
    <div className="html-preview-card admin-question-preview">
      {label && <div className="interactive-label">{label}</div>}
      <div className="preview-question-head">
        <div>
          <p className="eyebrow">{question.category || "Loại tình huống"}</p>
          <h3>{question.title || "Tiêu đề câu hỏi"}</h3>
          <p className="section-text">{question.scenarioIntro || "Mô tả mở đầu sẽ hiển thị tại đây."}</p>
        </div>
        <span className="preview-answer-pill">
          Đáp án đúng: {question.correctAnswer === "phishing" ? "Phishing" : "An toàn"}
        </span>
      </div>
      <div className="scenario-box">{question.scenarioContent || "Nội dung tình huống sẽ hiển thị tại đây."}</div>
      <div className="scenario-html-stage">
        <div
          ref={scenarioHtmlRef}
          className={`scenario-html-content ${explanationViewed ? "explanation-active explanation-with-bubble" : ""}`}
          dangerouslySetInnerHTML={{ __html: htmlWithSpotOrder || "<p>Chưa có nội dung HTML.</p>" }}
        />
        {explanationViewed && currentStep?.spot && anchorPosition && (
          <span
            className={`active-explanation-anchor active-explanation-anchor-${currentStep.spot}`}
            style={{ left: anchorPosition.left, top: anchorPosition.top }}
          />
        )}
        {explanationViewed && currentStep?.spot && bubblePosition && (
          <div
            className={`active-explanation-bubble active-explanation-${currentStep.spot}`}
            style={{ left: bubblePosition.left, top: bubblePosition.top }}
          >
            <strong>{currentStep.title}</strong>
            <p>{currentStep.body}</p>
            <button type="button" className="button button-primary explanation-next-button" onClick={handleNext}>
              Next
            </button>
          </div>
        )}
      </div>
      <div className="answer-grid preview-answer-grid">
        <button
          type="button"
          className={`answer-button ${answer === "phishing" ? "selected-phishing" : ""}`}
          onClick={() => chooseAnswer("phishing")}
        >
          Phishing
        </button>
        <button
          type="button"
          className={`answer-button ${answer === "legitimate" ? "selected-legitimate" : ""}`}
          onClick={() => chooseAnswer("legitimate")}
        >
          An toàn
        </button>
      </div>
      {answer && (
        <div className={`answer-feedback ${correct ? "feedback-correct" : "feedback-wrong"}`}>
          <div className="feedback-icon">{correct ? "✓" : "!"}</div>
          <div>
            <strong>{correct ? "Chính xác" : "Chưa chính xác"}</strong>
            <p>{correct ? `Bạn đã nhận diện đúng đây là ${answerLabel}.` : `Đáp án đúng là ${answerLabel}.`}</p>
          </div>
        </div>
      )}
      <div className="quiz-actions quiz-actions-spaced">
        <button
          type="button"
          className="button button-ghost button-explain"
          disabled={!answer || explanationSteps.length === 0}
          onClick={() => {
            setExplanationViewed(true);
            setStepIndex(0);
          }}
        >
          Giải thích
        </button>
        <span className="preview-help-text">
          {explanationSteps.length > 0
            ? `Có ${explanationSteps.length} điểm giải thích.`
            : "Thêm data-spot/data-label hoặc nội dung giải thích để preview lời giải."}
        </span>
      </div>
      {explanationViewed && currentStep && (
        <>
          <div className="explanation-legend">
            <span className="legend-chip legend-danger">Vị trí nghi ngờ</span>
            <span className="legend-chip legend-safe">Dấu hiệu hợp lệ</span>
          </div>
          {!currentStep.spot && (
            <div className="inline-explanation-note">
              <strong>{currentStep.title}</strong>
              <p>{currentStep.body}</p>
              <button type="button" className="button button-primary explanation-next-button" onClick={handleNext}>
                Next
              </button>
            </div>
          )}
          <div className="explanation-step-meta">
            <span>
              Giải thích {stepIndex + 1}/{explanationSteps.length}
            </span>
            <strong>{hasMoreSteps ? "Bấm Next để xem phần tiếp theo" : "Bấm Next để kết thúc preview"}</strong>
          </div>
        </>
      )}
    </div>
  );
}
