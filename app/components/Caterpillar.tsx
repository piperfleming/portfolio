"use client";
import { useEffect, useRef } from "react";

const FULL_SPAN  = 76;
const MIN_SPAN   = 12;
const SPEED      = 0.42;
const PAD        = 12;
const MAX_ARCH   = 17;
const GROUND_Y   = 30;
const SVG_H      = 50;
const SVG_W      = FULL_SPAN + PAD * 2 + 16;
const HEAD_R     = 9;
const BODY_SW    = 13;
const CUTOFF     = 0.90;
const N_BODY     = 6;
const LEG_LEN    = 6;
const ANT_LEN    = 11;
const ANT_BALL_R = 2.2;

// Gradient y bounds — fixed in SVG coordinate space (body lives near GROUND_Y)
const G_TOP    = GROUND_Y - BODY_SW / 2 - 1;  // ~22.5
const G_BOTTOM = GROUND_Y + BODY_SW / 2 + 2;  // ~38.5

function bezierPt(t: number, x0: number, x3: number, archH: number) {
  const u = 1 - t;
  return {
    x: u*u*u*x0 + 3*u*u*t*x0 + 3*u*t*t*x3 + t*t*t*x3,
    y: GROUND_Y - archH * 3 * t * (1 - t),
  };
}

export default function Caterpillar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const walkerRef    = useRef<HTMLDivElement>(null);
  const bodyRef      = useRef<SVGPathElement>(null);
  const shadowRef    = useRef<SVGEllipseElement>(null);
  const headRef      = useRef<SVGCircleElement>(null);
  const irisRef      = useRef<SVGCircleElement>(null);
  const pupilRef     = useRef<SVGCircleElement>(null);
  const shineRef     = useRef<SVGCircleElement>(null);
  const antPathRefs  = useRef<(SVGPathElement | null)[]>([]);
  const antBallRefs  = useRef<(SVGCircleElement | null)[]>([]);
  const legRefs      = useRef<(SVGLineElement | null)[]>([]);
  const ribRefs      = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const walker    = walkerRef.current;
    if (!container || !walker) return;

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
        if (span >= FULL_SPAN || (dir === 1 && rightEnd >= maxX) || (dir === -1 && leftEnd <= 0))
          phase = "gather";
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

      walker.style.transform = `translateX(${leftEnd - PAD}px)`;

      const localL = PAD;
      const localR = PAD + span;
      const ctrlY  = GROUND_Y - archH;

      // Body — single tube stroke
      bodyRef.current?.setAttribute("d",
        `M ${localL} ${GROUND_Y} C ${localL} ${ctrlY} ${localR} ${ctrlY} ${localR} ${GROUND_Y}`
      );

      // Shadow tracks body center and span width
      shadowRef.current?.setAttribute("cx", String(PAD + span / 2));
      shadowRef.current?.setAttribute("rx", String(span * 0.40));

      // Head
      const headPt = bezierPt(dir === 1 ? 1 : 0, localL, localR, archH);
      headRef.current?.setAttribute("cx", String(headPt.x));
      headRef.current?.setAttribute("cy", String(headPt.y));

      // Legs at each segment center
      for (let i = 0; i < N_BODY; i++) {
        const tFrac = ((i + 0.5) / N_BODY) * CUTOFF;
        const t = dir === 1 ? tFrac : 1 - tFrac;
        const pt = bezierPt(t, localL, localR, archH);
        const legY = pt.y + BODY_SW / 2 * 0.65;
        const ll = legRefs.current[i * 2], lr = legRefs.current[i * 2 + 1];
        ll?.setAttribute("x1", String(pt.x - 4)); ll?.setAttribute("y1", String(legY));
        ll?.setAttribute("x2", String(pt.x - 6)); ll?.setAttribute("y2", String(legY + LEG_LEN));
        lr?.setAttribute("x1", String(pt.x + 4)); lr?.setAttribute("y1", String(legY));
        lr?.setAttribute("x2", String(pt.x + 6)); lr?.setAttribute("y2", String(legY + LEG_LEN));
      }

      // Rib marks between segments — thin lines perpendicular to body
      for (let i = 0; i < N_BODY - 1; i++) {
        const tFrac = ((i + 1) / N_BODY) * CUTOFF;
        const t = dir === 1 ? tFrac : 1 - tFrac;
        const pt = bezierPt(t, localL, localR, archH);
        const eps = 0.025;
        const ptA = bezierPt(Math.max(0.01, t - eps), localL, localR, archH);
        const ptB = bezierPt(Math.min(0.99, t + eps), localL, localR, archH);
        const tx = ptB.x - ptA.x, ty = ptB.y - ptA.y;
        const len = Math.sqrt(tx * tx + ty * ty) || 1;
        const half = BODY_SW * 0.52;
        // Normal direction (perpendicular to tangent)
        const px = (-ty / len) * half, py = (tx / len) * half;
        const rib = ribRefs.current[i];
        rib?.setAttribute("x1", String(pt.x + px)); rib?.setAttribute("y1", String(pt.y + py));
        rib?.setAttribute("x2", String(pt.x - px)); rib?.setAttribute("y2", String(pt.y - py));
      }

      // Eye
      const ex = headPt.x + dir * 4.5, ey = headPt.y - 2;
      irisRef.current?.setAttribute("cx", String(ex));           irisRef.current?.setAttribute("cy", String(ey));
      pupilRef.current?.setAttribute("cx", String(ex + dir * 0.5)); pupilRef.current?.setAttribute("cy", String(ey + 0.3));
      shineRef.current?.setAttribute("cx", String(ex + dir * 1.2)); shineRef.current?.setAttribute("cy", String(ey - 1.1));

      // Antennae
      [{ bx: -2.5 * dir, tx: -4 * dir }, { bx: 2 * dir, tx: 5 * dir }].forEach(({ bx, tx }, i) => {
        const bxA = headPt.x + bx, byA = headPt.y - HEAD_R + 0.5;
        const txA = headPt.x + tx, tyA = headPt.y - HEAD_R - ANT_LEN;
        antPathRefs.current[i]?.setAttribute("d", `M ${bxA} ${byA} Q ${(bxA + txA) / 2} ${byA - 5} ${txA} ${tyA}`);
        antBallRefs.current[i]?.setAttribute("cx", String(txA));
        antBallRefs.current[i]?.setAttribute("cy", String(tyA));
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
      style={{ top: "-42px", height: `${SVG_H}px` }}
    >
      <div ref={walkerRef} style={{ position: "absolute", top: 0, left: 0 }}>
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ overflow: "visible" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Single light source top-to-bottom across the whole body — no per-segment sphere shading */}
            <linearGradient id="g-body" x1="0" y1={G_TOP} x2="0" y2={G_BOTTOM} gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#d4f56a" />
              <stop offset="38%"  stopColor="#84cc16" />
              <stop offset="100%" stopColor="#2d5406" />
            </linearGradient>
            {/* Head still gets sphere shading since it's a distinct ball */}
            <radialGradient id="g-head" cx="0.35" cy="0.27" r="0.70" gradientUnits="objectBoundingBox">
              <stop offset="0%"   stopColor="#b8e028" />
              <stop offset="45%"  stopColor="#5a9010" />
              <stop offset="100%" stopColor="#1e3a04" />
            </radialGradient>
            <radialGradient id="g-ant-ball" cx="0.35" cy="0.3" r="0.68" gradientUnits="objectBoundingBox">
              <stop offset="0%"   stopColor="#a05a1a" />
              <stop offset="100%" stopColor="#3d1a04" />
            </radialGradient>
            <filter id="f-shadow">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>

          {/* Ground shadow — cx and rx updated each frame to follow body */}
          <ellipse
            ref={shadowRef}
            cy={GROUND_Y + BODY_SW / 2 + 5} rx={30} ry={3}
            fill="rgb(20,40,0)" opacity={0.14}
            filter="url(#f-shadow)"
          />

          {/* Body tube — one connected shape, one gradient */}
          <path
            ref={bodyRef}
            fill="none" stroke="url(#g-body)"
            strokeWidth={BODY_SW} strokeLinecap="round"
          />

          {/* Rib marks between segments */}
          {Array.from({ length: N_BODY - 1 }, (_, i) => (
            <line key={i} ref={el => { ribRefs.current[i] = el; }}
              stroke="#244704" strokeWidth={1.2} strokeLinecap="round" strokeOpacity={0.55} />
          ))}

          {/* Legs */}
          {Array.from({ length: N_BODY * 2 }, (_, i) => (
            <line key={i} ref={el => { legRefs.current[i] = el; }}
              stroke="#2d5406" strokeWidth={1.8} strokeLinecap="round" />
          ))}

          {/* Antennae stems */}
          {[0, 1].map(i => (
            <path key={i} ref={el => { antPathRefs.current[i] = el; }}
              stroke="#3d1a04" strokeWidth={1.8} strokeLinecap="round" fill="none" />
          ))}

          {/* Head — separate sphere with its own radial gradient */}
          <circle ref={headRef} r={HEAD_R} fill="url(#g-head)" />

          {/* Antenna balls */}
          {[0, 1].map(i => (
            <circle key={i} ref={el => { antBallRefs.current[i] = el; }}
              r={ANT_BALL_R} fill="url(#g-ant-ball)" />
          ))}

          {/* Single eye */}
          <circle ref={irisRef}  r={2.8} fill="#1a2e05" />
          <circle ref={pupilRef} r={1.5} fill="#060d01" />
          <circle ref={shineRef} r={0.75} fill="rgba(255,255,255,0.9)" />
        </svg>
      </div>
    </div>
  );
}
