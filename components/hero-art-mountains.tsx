const CREAM = "#f4ecd9";

function Mug({
  cx,
  topY,
  w,
  bodyH,
}: {
  cx: number;
  topY: number;
  w: number;
  bodyH: number;
}) {
  const Lx = cx - w / 2;
  const Rx = cx + w / 2;
  const baseY = topY + bodyH;
  const foamTop = topY - w * 0.36;

  const foam =
    `M ${Lx - 6},${topY + 5}` +
    ` C ${Lx - 11},${foamTop + 8} ${Lx + w * 0.08},${foamTop - 3} ${cx - w * 0.2},${foamTop + 3}` +
    ` C ${cx - w * 0.1},${foamTop - 12} ${cx + w * 0.14},${foamTop - 12} ${cx + w * 0.2},${foamTop + 3}` +
    ` C ${cx + w * 0.34},${foamTop - 5} ${Rx + 9},${foamTop + 8} ${Rx + 6},${topY + 5}` +
    " Z";

  return (
    <g
      stroke="var(--text)"
      strokeWidth={3}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* handle */}
      <path
        d={`M ${Rx - 2},${topY + bodyH * 0.16} c ${w * 0.5},0 ${w * 0.5},${bodyH * 0.5} 0,${bodyH * 0.52}`}
        fill="none"
        strokeWidth={7}
      />
      {/* glass body with amber beer */}
      <rect
        x={Lx}
        y={topY}
        width={w}
        height={bodyH}
        rx={7}
        fill="var(--accent)"
      />
      {/* vertical staves (light gaps) */}
      <line
        x1={cx - w / 6}
        y1={topY + 8}
        x2={cx - w / 6}
        y2={baseY - 8}
        stroke={CREAM}
        strokeWidth={4}
        opacity={0.55}
      />
      <line
        x1={cx + w / 6}
        y1={topY + 8}
        x2={cx + w / 6}
        y2={baseY - 8}
        stroke={CREAM}
        strokeWidth={4}
        opacity={0.55}
      />
      {/* foam head */}
      <path d={foam} fill={CREAM} />
    </g>
  );
}

export default function HeroArt() {
  return (
    <svg
      viewBox="0 0 400 380"
      className="h-full w-full"
      role="img"
      aria-label="Půllitry vyrůstající z hor"
      preserveAspectRatio="xMidYMax meet"
    >
      {/* slunce / měsíc */}
      <circle cx={272} cy={118} r={58} fill="var(--accent)" opacity={0.14} />

      {/* vzdálené hory */}
      <path
        d="M0,235 L50,178 L110,215 L175,148 L240,200 L310,158 L360,205 L400,178 L400,380 L0,380 Z"
        fill="var(--text-soft)"
        opacity={0.16}
      />
      {/* sníh na vzdálených vrcholcích */}
      <path d="M161,163 L175,148 L189,163 Z" fill={CREAM} opacity={0.9} />
      <path d="M298,172 L310,158 L322,172 Z" fill={CREAM} opacity={0.9} />

      {/* střední hřeben (teplý) */}
      <path
        d="M0,300 L70,250 L140,286 L210,236 L290,280 L360,244 L400,276 L400,380 L0,380 Z"
        fill="var(--accent)"
        opacity={0.2}
      />

      {/* půllitry vyrůstající z hor */}
      <Mug cx={114} topY={250} w={58} bodyH={86} />
      <Mug cx={300} topY={256} w={54} bodyH={78} />
      <Mug cx={202} topY={206} w={78} bodyH={120} />

      {/* přední hřeben — zakrývá paty půllitrů */}
      <path
        d="M0,332 L60,300 L130,332 L200,298 L280,330 L350,302 L400,322 L400,380 L0,380 Z"
        fill="var(--text-soft)"
        opacity={0.5}
      />
      <path
        d="M0,360 L90,332 L170,358 L250,330 L340,356 L400,340 L400,380 L0,380 Z"
        fill="var(--text-soft)"
        opacity={0.72}
      />
    </svg>
  );
}
