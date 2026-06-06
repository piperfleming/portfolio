"use client";
import { useEffect, useRef } from "react";

const FULL_SPAN = 76;
const MIN_SPAN  = 12;
const SPEED     = 0.42;
const PAD       = 5;
const MAX_ARCH  = 17;
const GROUND_Y  = 22;
const SVG_H     = 30;
const SVG_W     = FULL_SPAN + PAD * 2 + 16;
const HEAD_R    = 5.5;
const BODY_SW   = 8;
const DOT_R     = 1.8;
const DOT_OPACITY = 0.5;

const BODY_CLR = "#84cc16";
const HEAD_CLR = "#4d7c0f";
const DOT_CLR  = "#1a3300";
const DOT_TS   = [0.15, 0.3, 0.5, 0.7, 0.85];

function bezierX(t: number, x0: number, x3: number) {
  // Control points share x with endpoints (vertical control arms)
  const u = 1 - t;
  return u * u * u * x0 + 3 * u * u * t * x0 + 3 * u * t * t * x3 + t * t * t * x3;
}

function bezierY(t: number, archH: number) {
  return GROUND_Y - archH * 3 * t * (1 - t);
}

export default function Caterpillar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const walkerRef    = useRef<HTMLDivElement>(null);
  const pathRef      = useRef<SVGPathElement>(null);
  const headRef      = useRef<SVGCircleElement>(null);
  const dotsRef      = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const walker    = walkerRef.current;
    const path      = pathRef.current;
    const head      = headRef.current;
    if (!container || !walker || !path || !head) return;

    // Start gathered, head just entering from left edge
    let leftEnd  = -MIN_SPAN;
    let rightEnd = 0;
    let dir: 1 | -1 = 1;
    let phase: "extend" | "gather" = "extend";
    let raf: number;

    const tick = () => {
      const maxX = container.offsetWidth;

      if (phase === "extend") {
        if (dir === 1) rightEnd = Math.min(rightEnd + SPEED, maxX);
        else           leftEnd  = Math.max(leftEnd  - SPEED, 0);

        const span = rightEnd - leftEnd;
        if (span >= FULL_SPAN || (dir === 1 && rightEnd >= maxX) || (dir === -1 && leftEnd <= 0)) {
          phase = "gather";
        }
      } else {
        if (dir === 1) leftEnd  = Math.min(leftEnd  + SPEED, rightEnd - MIN_SPAN);
        else           rightEnd = Math.max(rightEnd - SPEED, leftEnd  + MIN_SPAN);

        const span = rightEnd - leftEnd;
        if (span <= MIN_SPAN) {
          if (rightEnd >= maxX - 1 || leftEnd <= 1) dir = dir === 1 ? -1 : 1;
          phase = "extend";
        }
      }

      const span  = rightEnd - leftEnd;
      const archH = MAX_ARCH * Math.max(0, 1 - (span - MIN_SPAN) / (FULL_SPAN - MIN_SPAN));

      // Position walker at leftEnd
      walker.style.transform = `translateX(${leftEnd - PAD}px)`;

      const localL    = PAD;
      const localR    = PAD + span;
      const localHead = dir === 1 ? localR : localL;

      // Body bezier path
      const ctrlY = GROUND_Y - archH;
      path.setAttribute("d", `M ${localL} ${GROUND_Y} C ${localL} ${ctrlY} ${localR} ${ctrlY} ${localR} ${GROUND_Y}`);

      // Head circle
      head.setAttribute("cx", String(localHead));
      head.setAttribute("cy", String(GROUND_Y - HEAD_R * 0.15));

      // Dots along body curve
      DOT_TS.forEach((t, i) => {
        const dot = dotsRef.current[i];
        if (!dot) return;
        dot.setAttribute("cx", String(bezierX(t, localL, localR)));
        dot.setAttribute("cy", String(bezierY(t, archH)));
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 pointer-events-none"
      style={{ top: "-26px", height: `${SVG_H}px` }}
    >
      <div ref={walkerRef} style={{ position: "absolute", top: 0, left: 0 }}>
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ overflow: "visible" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            ref={pathRef}
            d={`M ${PAD} ${GROUND_Y} C ${PAD} ${GROUND_Y} ${PAD + FULL_SPAN} ${GROUND_Y} ${PAD + FULL_SPAN} ${GROUND_Y}`}
            fill="none"
            stroke={BODY_CLR}
            strokeWidth={BODY_SW}
            strokeLinecap="round"
          />
          {DOT_TS.map((_, i) => (
            <circle
              key={i}
              ref={el => { dotsRef.current[i] = el; }}
              r={DOT_R}
              fill={DOT_CLR}
              opacity={DOT_OPACITY}
            />
          ))}
          <circle ref={headRef} r={HEAD_R} fill={HEAD_CLR} />
        </svg>
      </div>
    </div>
  );
}
