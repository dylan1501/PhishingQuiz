import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { finishAttempt, getQuestions, getSession, saveSession } from "../storage";
import type { AnswerOption } from "../types";

type HotspotNote = {
  id: string;
  label: string;
  spot: "danger" | "safe";
};

type ExplanationStep = {
  id: string;
  title: string;
  body: string;
  spot?: "danger" | "safe";
  hotspotIndex?: number;
};

function cloneFieldValue(document: Document, fieldNode: Element | null, fallback: string) {
  const value = document.createElement("div");
  value.className = "email-field-value";

  if (!fieldNode) {
    value.textContent = fallback;
    return value;
  }

  if (fieldNode.getAttribute("data-spot")) {
    value.dataset.spot = fieldNode.getAttribute("data-spot") ?? "";
    value.dataset.label = fieldNode.getAttribute("data-label") ?? "";
  }

  const clonedField = fieldNode.cloneNode(true) as HTMLElement;
  const firstStrong = clonedField.querySelector("strong");
  if (firstStrong && /^(from|subject)\s*:/i.test(firstStrong.textContent?.trim() ?? "")) {
    firstStrong.remove();
  }
  value.append(...Array.from(clonedField.childNodes));
  if (!value.textContent?.trim()) {
    value.textContent = fallback;
  }
  return value;
}

function createEmailField(document: Document, label: string, valueNode: Element) {
  const row = document.createElement("div");
  row.className = `email-field email-field-${label.toLowerCase()}`;

  const labelNode = document.createElement("span");
  labelNode.className = "email-field-label";
  labelNode.textContent = label;

  row.append(labelNode, valueNode);
  return row;
}

function normalizeEmailTemplate(document: Document, container: HTMLElement, questionTitle: string) {
  const childElements = Array.from(container.children);
  const fromNode =
    childElements.find((child) => /(^|\s)mail-row(\s|$)/.test(child.className) && /^from\s*:/i.test(child.textContent?.trim() ?? "")) ??
    childElements.find((child) => /^from\s*:/i.test(child.textContent?.trim() ?? ""));
  const subjectNode =
    childElements.find((child) => /(^|\s)mail-row(\s|$)/.test(child.className) && /^subject\s*:/i.test(child.textContent?.trim() ?? "")) ??
    childElements.find((child) => /^subject\s*:/i.test(child.textContent?.trim() ?? ""));
  const fromValue = cloneFieldValue(document, fromNode ?? null, "Người gửi không hiển thị rõ");
  const subjectValue = cloneFieldValue(document, subjectNode ?? null, questionTitle);
  const contentValue = document.createElement("div");
  contentValue.className = "email-field-value email-content-value";

  Array.from(container.childNodes).forEach((node) => {
    if (node === fromNode || node === subjectNode) {
      return;
    }
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      return;
    }
    contentValue.append(node.cloneNode(true));
  });

  if (!contentValue.textContent?.trim()) {
    contentValue.textContent = "Không có nội dung email.";
  }

  container.replaceChildren(
    createEmailField(document, "From", fromValue),
    createEmailField(document, "Subject", subjectValue),
    createEmailField(document, "Content", contentValue),
  );
}

function normalizeSmsTemplate(document: Document, container: HTMLElement) {
  if (container.querySelector(".sms-phone-screen")) {
    return;
  }

  container.classList.add("sms-phone-template");
  const children = Array.from(container.children);
  const senderNode = children[0] ?? null;
  const sender = senderNode?.textContent?.trim() || "SMS";
  const senderInitial = sender.trim().charAt(0).toUpperCase() || "S";
  const messageNodes = Array.from(container.childNodes).filter((node) => {
    if (node === senderNode) {
      return false;
    }
    return node.nodeType !== Node.TEXT_NODE || Boolean(node.textContent?.trim());
  });

  const screen = document.createElement("div");
  screen.className = "sms-phone-screen";
  const status = document.createElement("div");
  status.className = "sms-status-bar";
  status.innerHTML = "<span>09:41</span><span>5G 82%</span>";

  const header = document.createElement("div");
  header.className = "sms-conversation-header";
  const avatar = document.createElement("span");
  avatar.className = "sms-sender-avatar";
  avatar.textContent = senderInitial;
  const senderInfo = document.createElement("div");
  senderInfo.className = "sms-sender-info";
  const senderName = document.createElement("strong");
  senderName.textContent = sender;
  const senderCaption = document.createElement("span");
  senderCaption.textContent = "Người gửi SMS";
  senderInfo.append(senderName, senderCaption);
  header.append(avatar, senderInfo);

  const thread = document.createElement("div");
  thread.className = "sms-thread";
  const time = document.createElement("span");
  time.className = "sms-message-time";
  time.textContent = "09:41";
  thread.append(time);
  messageNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const clonedMessage = node.cloneNode(true) as HTMLElement;
      clonedMessage.classList.add("sms-message-bubble");
      thread.append(clonedMessage);
      return;
    }
    const message = document.createElement("p");
    message.className = "sms-message-bubble";
    message.textContent = node.textContent ?? "";
    thread.append(message);
  });

  screen.append(status, header, thread);
  container.replaceChildren(screen);
}

function normalizeWebsiteTemplate(document: Document, container: HTMLElement, questionTitle: string) {
  if (container.querySelector(".browser-window")) {
    return;
  }

  container.classList.add("website-browser-template");
  const childElements = Array.from(container.children);
  const addressSource =
    childElements.find((child) => child.querySelector("a")) ?? childElements[0] ?? null;
  const addressLink = addressSource?.querySelector("a") ?? null;
  const addressText =
    addressLink?.getAttribute("title") ??
    addressLink?.getAttribute("href") ??
    addressLink?.textContent?.trim() ??
    "https://example.local";

  const browserWindow = document.createElement("div");
  browserWindow.className = "browser-window";
  const topbar = document.createElement("div");
  topbar.className = "browser-topbar";
  const controls = document.createElement("span");
  controls.className = "browser-controls";
  controls.innerHTML = "<i></i><i></i><i></i>";
  const addressBar = document.createElement("div");
  addressBar.className = "browser-address";
  if (addressSource?.getAttribute("data-spot")) {
    addressBar.dataset.spot = addressSource.getAttribute("data-spot") ?? "";
    addressBar.dataset.label = addressSource.getAttribute("data-label") ?? "";
  } else if (addressLink?.getAttribute("data-spot")) {
    addressBar.dataset.spot = addressLink.getAttribute("data-spot") ?? "";
    addressBar.dataset.label = addressLink.getAttribute("data-label") ?? "";
  }
  const addressValue = document.createElement("span");
  addressValue.textContent = addressText;
  addressBar.append(addressValue);
  topbar.append(controls, addressBar);

  const page = document.createElement("div");
  page.className = "browser-page";
  Array.from(container.childNodes).forEach((node) => {
    if (node === addressSource) {
      return;
    }
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      return;
    }
    page.append(node.cloneNode(true));
  });
  if (!page.textContent?.trim()) {
    const fallbackTitle = document.createElement("h4");
    fallbackTitle.textContent = questionTitle;
    page.append(fallbackTitle);
  }

  browserWindow.append(topbar, page);
  container.replaceChildren(browserWindow);
}

function normalizeScenarioHtml(html: string, questionTitle: string) {
  if (typeof window === "undefined") {
    return html;
  }

  const parser = new window.DOMParser();
  const parsedDocument = parser.parseFromString(html, "text/html");
  parsedDocument
    .querySelectorAll<HTMLElement>(".mail-sim, .invoice-sim, .bank-sim")
    .forEach((container) => normalizeEmailTemplate(parsedDocument, container, questionTitle));
  parsedDocument
    .querySelectorAll<HTMLElement>(".sms-sim")
    .forEach((container) => normalizeSmsTemplate(parsedDocument, container));
  parsedDocument
    .querySelectorAll<HTMLElement>(".portal-sim")
    .forEach((container) => normalizeWebsiteTemplate(parsedDocument, container, questionTitle));

  return parsedDocument.body.innerHTML;
}

export function QuizPage() {
  const { index } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const questions = useMemo(() => {
    const allQuestions = getQuestions();
    if (!session) {
      return allQuestions;
    }
    const orderMap = new Map(allQuestions.map((question) => [question.id, question] as const));
    return session.questionIds
      .map((questionId) => orderMap.get(questionId))
      .filter((question): question is NonNullable<typeof question> => Boolean(question));
  }, [session]);
  const questionNumber = Number(index ?? 1);
  const question = questions[questionNumber - 1];
  const existingAnswer = session?.answers.find((answer) => answer.questionId === question?.id);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerOption | null>(
    existingAnswer?.selectedAnswer ?? null,
  );
  const [explanationViewed, setExplanationViewed] = useState(false);
  const [explanationStepIndex, setExplanationStepIndex] = useState(0);
  const scenarioHtmlRef = useRef<HTMLDivElement | null>(null);
  const scenarioStageRef = useRef<HTMLDivElement | null>(null);
  const [bubblePosition, setBubblePosition] = useState<{ left: number; top: number } | null>(null);
  const [anchorPosition, setAnchorPosition] = useState<{ left: number; top: number } | null>(null);

  if (!session) {
    return <Navigate to="/quiz/start" replace />;
  }
  if (!question) {
    return <Navigate to="/quiz/result" replace />;
  }
  const activeSession = session;

  useEffect(() => {
    setSelectedAnswer(existingAnswer?.selectedAnswer ?? null);
    setExplanationViewed(false);
    setExplanationStepIndex(0);
    setBubblePosition(null);
    setAnchorPosition(null);
  }, [existingAnswer?.selectedAnswer, question.id]);

  function answerQuestion(answer: AnswerOption) {
    if (selectedAnswer) {
      return;
    }
    setSelectedAnswer(answer);
    const nextAnswers = activeSession.answers.filter((entry) => entry.questionId !== question.id);
    nextAnswers.push({
      questionId: question.id,
      selectedAnswer: answer,
      isCorrect: answer === question.correctAnswer,
      answeredAt: new Date().toISOString(),
    });
    saveSession({ ...activeSession, answers: nextAnswers });
  }

  function goNext() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (questionNumber === questions.length) {
      const attempt = finishAttempt();
      const route = attempt?.id ? `/quiz/result?attempt=${attempt.id}` : "/quiz/result";
      navigate(route, { replace: true });
      return;
    }
    setExplanationViewed(false);
    setBubblePosition(null);
    setAnchorPosition(null);
    navigate(`/quiz/questions/${questionNumber + 1}`, { replace: true });
  }

  function handleExplanationNext() {
    if (hasMoreExplanationSteps) {
      setExplanationStepIndex((currentStep) => currentStep + 1);
      return;
    }
    goNext();
  }

  function showExplanation() {
    setExplanationViewed(true);
    setExplanationStepIndex(0);
  }

  const correct = selectedAnswer ? selectedAnswer === question.correctAnswer : null;
  const progress = (questionNumber / questions.length) * 100;
  const normalizedScenarioHtml = useMemo(() => {
    if (!question.scenarioHtml || typeof window === "undefined") {
      return question.scenarioHtml;
    }

    return normalizeScenarioHtml(question.scenarioHtml, question.title);
  }, [question.scenarioHtml, question.title]);
  const hotspotNotes = useMemo<HotspotNote[]>(() => {
    if (!normalizedScenarioHtml || typeof window === "undefined") {
      return [];
    }

    const parser = new window.DOMParser();
    const parsedDocument = parser.parseFromString(normalizedScenarioHtml, "text/html");
    return Array.from(parsedDocument.querySelectorAll<HTMLElement>("[data-spot][data-label]")).map(
      (element, noteIndex) => ({
        id: element.dataset.label ?? `${question.id}-${noteIndex}`,
        label: element.dataset.label ?? "",
        spot: element.dataset.spot === "safe" ? "safe" : "danger",
      }),
    );
  }, [normalizedScenarioHtml, question.id]);
  const scenarioHtmlWithSpotOrder = useMemo(() => {
    if (!normalizedScenarioHtml || typeof window === "undefined") {
      return normalizedScenarioHtml;
    }

    const parser = new window.DOMParser();
    const parsedDocument = parser.parseFromString(normalizedScenarioHtml, "text/html");
    Array.from(parsedDocument.querySelectorAll<HTMLElement>("[data-spot][data-label]")).forEach(
      (element, noteIndex) => {
        element.dataset.spotOrder = String(noteIndex);
        element.dataset.activeSpot = explanationViewed && explanationStepIndex === noteIndex ? "true" : "false";
      },
    );
    return parsedDocument.body.innerHTML;
  }, [explanationStepIndex, explanationViewed, normalizedScenarioHtml]);
  const explanationSteps = useMemo<ExplanationStep[]>(() => {
    if (hotspotNotes.length > 0) {
      return hotspotNotes.map((note, noteIndex) => ({
        id: `${question.id}-hotspot-${noteIndex}`,
        title: note.spot === "danger" ? "Dấu hiệu phishing" : "Dấu hiệu hợp lệ",
        body: note.label,
        spot: note.spot,
        hotspotIndex: noteIndex,
      }));
    }

    const fallbackSteps: ExplanationStep[] = [
      {
        id: `${question.id}-summary`,
        title: "Tổng quan",
        body: question.explanation,
      },
    ];

    question.indicators.forEach((indicator, indicatorIndex) => {
      fallbackSteps.push({
        id: `${question.id}-indicator-${indicatorIndex}`,
        title: "Điểm cần ghi nhớ",
        body: indicator,
      });
    });

    return fallbackSteps;
  }, [hotspotNotes, question.explanation, question.id, question.indicators]);
  const currentExplanationStep = explanationSteps[explanationStepIndex] ?? null;
  const hasMoreExplanationSteps = explanationStepIndex < explanationSteps.length - 1;

  useEffect(() => {
    if (
      !explanationViewed ||
      currentExplanationStep?.hotspotIndex === undefined ||
      !scenarioHtmlRef.current ||
      !scenarioStageRef.current
    ) {
      setBubblePosition(null);
      setAnchorPosition(null);
      return;
    }

    const container = scenarioHtmlRef.current;
    const stage = scenarioStageRef.current;
    const hotspot = container.querySelector<HTMLElement>(
      `[data-spot-order="${currentExplanationStep.hotspotIndex}"]`,
    );

    if (!hotspot) {
      setBubblePosition({ left: 12, top: 48 });
      setAnchorPosition(null);
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const hotspotRect = hotspot.getBoundingClientRect();
    const estimatedBubbleWidth = 320;
    const maxLeft = Math.max(16, stage.clientWidth - estimatedBubbleWidth - 12);
    const hotspotCenter = hotspotRect.left - stageRect.left + hotspotRect.width / 2;
    const nextLeft = Math.min(Math.max(hotspotCenter - estimatedBubbleWidth / 2, 12), maxLeft);
    const anchorTop = hotspotRect.bottom - stageRect.top + 8;
    setBubblePosition({ left: nextLeft, top: anchorTop + 36 });
    setAnchorPosition({
      left: hotspotCenter - 4,
      top: anchorTop,
    });
  }, [currentExplanationStep, explanationViewed, scenarioHtmlWithSpotOrder]);

  return (
    <section className="quiz-layout">
      <div className="progress-bar">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="quiz-meta">
        <span className="question-count-pill">
          Câu {questionNumber}/{questions.length}
        </span>
        <span className="question-category-pill">Loại: {question.category}</span>
      </div>
      <article className="content-card quiz-card">
        <h3>{question.title}</h3>
        <p className="section-text">{question.scenarioIntro}</p>
        <div className="scenario-box">{question.scenarioContent}</div>
        {question.scenarioHtml && (
          <div className="scenario-html-box">
            <div className="scenario-html-stage" ref={scenarioStageRef}>
              <div className="interactive-label">Khu vực mô phỏng để kiểm tra tương tác</div>
              <div
                ref={scenarioHtmlRef}
                className={`scenario-html-content ${explanationViewed ? "explanation-active explanation-with-bubble" : ""}`}
                dangerouslySetInnerHTML={{ __html: scenarioHtmlWithSpotOrder }}
              />
              {explanationViewed && currentExplanationStep?.spot && anchorPosition && (
                <span
                  className={`active-explanation-anchor active-explanation-anchor-${currentExplanationStep.spot}`}
                  style={{ left: anchorPosition.left, top: anchorPosition.top }}
                />
              )}
              {explanationViewed && currentExplanationStep?.spot && bubblePosition && (
                <div
                  className={`active-explanation-bubble active-explanation-${currentExplanationStep.spot}`}
                  style={{ left: bubblePosition.left, top: bubblePosition.top }}
                >
                  <strong>{currentExplanationStep.title}</strong>
                  <p>{currentExplanationStep.body}</p>
                  <button
                    type="button"
                    className="button button-primary explanation-next-button"
                    onClick={handleExplanationNext}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            {explanationViewed && (
              <>
                <div className="explanation-legend">
                  <span className="legend-chip legend-danger">Vị trí nghi ngờ</span>
                  <span className="legend-chip legend-safe">Dấu hiệu hợp lệ</span>
                </div>
                {!currentExplanationStep?.spot && currentExplanationStep && (
                  <div className="inline-explanation-note">
                    <strong>{currentExplanationStep.title}</strong>
                    <p>{currentExplanationStep.body}</p>
                    <button
                      type="button"
                      className="button button-primary explanation-next-button"
                      onClick={handleExplanationNext}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        <div className="answer-grid">
          <button
            type="button"
            className={`answer-button ${selectedAnswer === "phishing" ? "selected-phishing" : ""}`}
            onClick={() => answerQuestion("phishing")}
          >
            Phishing
          </button>
          <button
            type="button"
            className={`answer-button ${selectedAnswer === "legitimate" ? "selected-legitimate" : ""}`}
            onClick={() => answerQuestion("legitimate")}
          >
            Legitimate
          </button>
        </div>

        {selectedAnswer && (
          <> 
            <div className={`answer-feedback ${correct ? "feedback-correct" : "feedback-wrong"}`}>
              <div className="feedback-icon">{correct ? "✓" : "!"}</div>
              <div>
                <strong>{correct ? "Chính xác" : "Chưa chính xác"}</strong>
                <p>
                  {correct
                    ? `Bạn đã nhận diện đúng đây là ${question.correctAnswer === "phishing" ? "phishing" : "legitimate"}.`
                    : `Đáp án đúng là ${question.correctAnswer === "phishing" ? "phishing" : "legitimate"}.`}
                </p>
              </div>
              {!explanationViewed && (
                <button
                  type="button"
                  className="button feedback-explain-button"
                  onClick={showExplanation}
                >
                  Xem giải thích
                </button>
              )}
            </div>
            {!explanationViewed && (
              <div className="notice notice-warning">
                Bạn phải mở phần giải thích trước khi sang câu tiếp theo.
              </div>
            )}
          </>
        )}
          {explanationViewed && currentExplanationStep && (
            <div className="explanation-step-meta">
              <span>
                Giải thích {explanationStepIndex + 1}/{explanationSteps.length}
              </span>
              <strong>
                {hasMoreExplanationSteps
                  ? "Bấm Next để xem phần tiếp theo"
                  : questionNumber === questions.length
                    ? "Bấm Next để sang kết quả"
                    : "Bấm Next để sang câu tiếp theo"}
              </strong>
            </div>
          )}
      </article>
    </section>
  );
}
