import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export interface ChartPoint {
  label: string;
  value: number;
  /** Nhãn đầy đủ hiển thị trong tooltip/bảng (mặc định dùng `label`). */
  detail?: string;
}

interface ChartProps {
  points: ChartPoint[];
  /** Đơn vị của giá trị, ví dụ "người", "lượt thi". */
  unit: string;
  /** Tiêu đề cột nhãn trong bảng dữ liệu. */
  labelHeader: string;
  ariaLabel: string;
  height?: number;
}

const margin = { top: 24, right: 16, bottom: 30, left: 36 };

function useContainerWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const update = () => setWidth(element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

// Mốc trục Y là số nguyên "đẹp" (1, 2, 5 × 10^k), luôn có 0 và phủ hết giá trị lớn nhất.
function niceTicks(maxValue: number, tickCount = 4) {
  if (maxValue <= 0) {
    return [0, 1];
  }
  const roughStep = maxValue / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceFactor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = Math.max(1, niceFactor * magnitude);
  const top = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= top; value += step) {
    ticks.push(value);
  }
  return ticks;
}

function useHoverIndex(pointCount: number) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (pointCount === 0) {
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      setHoverIndex((current) => {
        const base = current ?? (delta > 0 ? -1 : pointCount);
        return Math.min(pointCount - 1, Math.max(0, base + delta));
      });
    }
    if (event.key === "Escape") {
      setHoverIndex(null);
    }
  }

  return { hoverIndex, setHoverIndex, onKeyDown };
}

function ChartTooltip({
  x,
  y,
  width,
  title,
  value,
  unit,
}: {
  x: number;
  y: number;
  width: number;
  title: string;
  value: number;
  unit: string;
}) {
  const alignRight = x > width - 96;
  return (
    <div
      className={`viz-tooltip ${alignRight ? "viz-tooltip-right" : ""}`}
      style={{ left: x, top: y }}
      role="status"
    >
      <strong>
        {value.toLocaleString("vi-VN")} {unit}
      </strong>
      <span>{title}</span>
    </div>
  );
}

function ChartTable({ points, unit, labelHeader }: Pick<ChartProps, "points" | "unit" | "labelHeader">) {
  return (
    <details className="viz-table-details">
      <summary>Xem dạng bảng</summary>
      <table className="viz-table">
        <thead>
          <tr>
            <th>{labelHeader}</th>
            <th>Số {unit}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.label}>
              <td>{point.detail ?? point.label}</td>
              <td>{point.value.toLocaleString("vi-VN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export function LineChart({ points, unit, labelHeader, ariaLabel, height = 240 }: ChartProps) {
  const { ref, width } = useContainerWidth();
  const { hoverIndex, setHoverIndex, onKeyDown } = useHoverIndex(points.length);
  const gradientId = useId();

  const plotWidth = Math.max(0, width - margin.left - margin.right);
  const plotHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(0, ...points.map((point) => point.value));
  const ticks = niceTicks(maxValue);
  const yMax = ticks[ticks.length - 1];
  const stepX = points.length > 1 ? plotWidth / (points.length - 1) : 0;
  const xAt = (index: number) => margin.left + (points.length > 1 ? index * stepX : plotWidth / 2);
  const yAt = (value: number) => margin.top + plotHeight - (value / yMax) * plotHeight;
  const baseline = margin.top + plotHeight;

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${xAt(index)},${yAt(point.value)}`).join(" ");
  const areaPath = points.length > 0 ? `${linePath} L${xAt(points.length - 1)},${baseline} L${xAt(0)},${baseline} Z` : "";
  const peakIndex = maxValue > 0 ? points.findIndex((point) => point.value === maxValue) : -1;
  const labelEvery = points.length <= 12 ? 1 : Math.ceil(points.length / 8);

  function onPointerMove(event: PointerEvent<SVGRectElement>) {
    if (points.length === 0) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - bounds.left;
    const index = stepX > 0 ? Math.round(relativeX / stepX) : 0;
    setHoverIndex(Math.min(points.length - 1, Math.max(0, index)));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="viz-root">
      <div className="viz-plot" ref={ref}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={ariaLabel}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onBlur={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--series-1)" stopOpacity="0.16" />
                <stop offset="100%" stopColor="var(--series-1)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={margin.left} x2={width - margin.right} y1={yAt(tick)} y2={yAt(tick)} className="viz-grid" />
                <text x={margin.left - 8} y={yAt(tick)} className="viz-axis-text" textAnchor="end" dominantBaseline="middle">
                  {tick.toLocaleString("vi-VN")}
                </text>
              </g>
            ))}
            {points.map((point, index) =>
              index % labelEvery === 0 ? (
                <text key={point.label} x={xAt(index)} y={baseline + 18} className="viz-axis-text" textAnchor="middle">
                  {point.label}
                </text>
              ) : null,
            )}
            {points.length > 1 && <path d={areaPath} fill={`url(#${gradientId})`} />}
            {points.length > 1 && <path d={linePath} className="viz-line" />}
            {hoverIndex !== null && (
              <line x1={xAt(hoverIndex)} x2={xAt(hoverIndex)} y1={margin.top} y2={baseline} className="viz-crosshair" />
            )}
            {points.map((point, index) => (
              <circle
                key={point.label}
                cx={xAt(index)}
                cy={yAt(point.value)}
                r={hoverIndex === index ? 5.5 : 4}
                className="viz-marker"
              />
            ))}
            {peakIndex >= 0 && hoverIndex === null && (
              <text x={xAt(peakIndex)} y={yAt(maxValue) - 12} className="viz-value-text" textAnchor="middle">
                {maxValue.toLocaleString("vi-VN")}
              </text>
            )}
            <rect
              x={margin.left}
              y={margin.top}
              width={plotWidth}
              height={plotHeight}
              fill="transparent"
              onPointerMove={onPointerMove}
              onPointerLeave={() => setHoverIndex(null)}
            />
          </svg>
        )}
        {hovered && hoverIndex !== null && (
          <ChartTooltip
            x={xAt(hoverIndex)}
            y={yAt(hovered.value)}
            width={width}
            title={hovered.detail ?? hovered.label}
            value={hovered.value}
            unit={unit}
          />
        )}
      </div>
      <ChartTable points={points} unit={unit} labelHeader={labelHeader} />
    </div>
  );
}

// Cột bo 4px ở đầu dữ liệu, vuông ở chân (baseline).
function columnPath(x: number, top: number, bottom: number, barWidth: number) {
  const radius = Math.min(4, barWidth / 2, Math.max(0, bottom - top));
  return [
    `M${x},${bottom}`,
    `V${top + radius}`,
    `Q${x},${top} ${x + radius},${top}`,
    `H${x + barWidth - radius}`,
    `Q${x + barWidth},${top} ${x + barWidth},${top + radius}`,
    `V${bottom}`,
    "Z",
  ].join(" ");
}

export function BarChart({ points, unit, labelHeader, ariaLabel, height = 240 }: ChartProps) {
  const { ref, width } = useContainerWidth();
  const { hoverIndex, setHoverIndex, onKeyDown } = useHoverIndex(points.length);

  const plotWidth = Math.max(0, width - margin.left - margin.right);
  const plotHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(0, ...points.map((point) => point.value));
  const ticks = niceTicks(maxValue);
  const yMax = ticks[ticks.length - 1];
  const band = points.length > 0 ? plotWidth / points.length : 0;
  // Cột tối đa 24px, luôn chừa tối thiểu 2px khoảng trống nền giữa hai cột kề nhau.
  const barWidth = Math.max(4, Math.min(24, band - 2));
  const yAt = (value: number) => margin.top + plotHeight - (value / yMax) * plotHeight;
  const baseline = margin.top + plotHeight;
  const bandStart = (index: number) => margin.left + index * band;
  const barX = (index: number) => bandStart(index) + (band - barWidth) / 2;
  const centerX = (index: number) => bandStart(index) + band / 2;

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="viz-root">
      <div className="viz-plot" ref={ref}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={ariaLabel}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onBlur={() => setHoverIndex(null)}
          >
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={margin.left} x2={width - margin.right} y1={yAt(tick)} y2={yAt(tick)} className="viz-grid" />
                <text x={margin.left - 8} y={yAt(tick)} className="viz-axis-text" textAnchor="end" dominantBaseline="middle">
                  {tick.toLocaleString("vi-VN")}
                </text>
              </g>
            ))}
            {points.map((point, index) => (
              <g key={point.label} className={hoverIndex === index ? "viz-bar-group viz-bar-hover" : "viz-bar-group"}>
                {point.value > 0 && (
                  <path d={columnPath(barX(index), yAt(point.value), baseline, barWidth)} className="viz-bar" />
                )}
                <text
                  x={centerX(index)}
                  y={yAt(point.value) - 7}
                  className={point.value > 0 ? "viz-value-text" : "viz-value-text viz-value-muted"}
                  textAnchor="middle"
                >
                  {point.value.toLocaleString("vi-VN")}
                </text>
                <text x={centerX(index)} y={baseline + 18} className="viz-axis-text" textAnchor="middle">
                  {point.label}
                </text>
                <rect
                  x={bandStart(index)}
                  y={margin.top}
                  width={band}
                  height={plotHeight + margin.bottom}
                  fill="transparent"
                  onPointerEnter={() => setHoverIndex(index)}
                  onPointerLeave={() => setHoverIndex(null)}
                />
              </g>
            ))}
            <line x1={margin.left} x2={width - margin.right} y1={baseline} y2={baseline} className="viz-axis-line" />
          </svg>
        )}
        {hovered && hoverIndex !== null && (
          <ChartTooltip
            x={centerX(hoverIndex)}
            y={yAt(hovered.value) - 14}
            width={width}
            title={hovered.detail ?? hovered.label}
            value={hovered.value}
            unit={unit}
          />
        )}
      </div>
      <ChartTable points={points} unit={unit} labelHeader={labelHeader} />
    </div>
  );
}
