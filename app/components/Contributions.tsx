import { getContributions, type Day } from "../lib/github";

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const LABEL_H = 16;

// Empty day, then four teal steps.
const SHADES = ["#E7E5E4", "#CCFBF1", "#5EEAD4", "#14B8A6", "#0F766E"];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function level(count: number, [t1, t2, t3]: [number, number, number]) {
  if (count === 0) return 0;
  if (count <= t1) return 1;
  if (count <= t2) return 2;
  if (count <= t3) return 3;
  return 4;
}

function monthLabels(weeks: (Day | null)[][]) {
  const labels: { x: number; text: string }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, i) => {
    const firstDay = week.find((d): d is Day => d !== null);
    if (!firstDay) return;
    const month = Number(firstDay.date.slice(5, 7)) - 1;
    if (month !== lastMonth) {
      // Skip a label that would collide with the previous one.
      if (labels.length === 0 || i * STEP - labels[labels.length - 1].x >= 28) {
        labels.push({ x: i * STEP, text: MONTHS[month] });
      }
      lastMonth = month;
    }
  });

  return labels;
}

function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export default async function Contributions() {
  const data = await getContributions();

  // No account returned data (missing tokens locally, or GitHub is down) —
  // render nothing rather than an empty wall of grey.
  if (!data) return null;

  const { weeks, total, thresholds, sources, start, end } = data;
  const width = weeks.length * STEP - GAP;
  const height = LABEL_H + 7 * STEP - GAP;
  const labels = monthLabels(weeks);

  return (
    <section className="py-16 bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-teal-600 font-medium tracking-[0.2em] uppercase text-xs mb-3">
          Building, daily
        </p>

        <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 leading-tight mb-6">
          {total.toLocaleString()} contributions in the last year
        </h2>

        <div className="overflow-x-auto pb-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            className="max-w-full h-auto"
            role="img"
            aria-label={`GitHub contribution heatmap: ${total} contributions between ${formatDate(start)} and ${formatDate(end)}, merged across ${sources.join(", ")}.`}
          >
            {labels.map((label) => (
              <text
                key={`${label.x}-${label.text}`}
                x={label.x}
                y={LABEL_H - 6}
                fontSize="10"
                fill="#A8A29E"
                fontFamily="inherit"
              >
                {label.text}
              </text>
            ))}

            {weeks.map((week, x) =>
              week.map((day, y) =>
                day === null ? null : (
                  <rect
                    key={day.date}
                    x={x * STEP}
                    y={LABEL_H + y * STEP}
                    width={CELL}
                    height={CELL}
                    rx={2}
                    fill={SHADES[level(day.count, thresholds)]}
                  >
                    <title>
                      {day.count === 0
                        ? `No contributions on ${formatDate(day.date)}`
                        : `${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDate(day.date)}`}
                    </title>
                  </rect>
                ),
              ),
            )}
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-stone-400">
            {sources.join(" · ")}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <span>Less</span>
            {SHADES.map((shade) => (
              <span
                key={shade}
                className="inline-block w-[11px] h-[11px] rounded-[2px]"
                style={{ backgroundColor: shade }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </section>
  );
}
