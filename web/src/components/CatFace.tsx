type Mood = "happy" | "neutral" | "sad";
type Accessory = "sunglasses" | "crown" | "ribbon" | null;

export function CatFace({
  color,
  mood,
  size = 80,
  accessory,
}: {
  color: string;
  mood: Mood;
  size?: number;
  accessory: Accessory;
}) {
  const s = size;
  const happy = mood === "happy";
  const sad = mood === "sad";
  const eyeY = s * 0.44;
  const eyeSpacing = s * 0.17;
  const cx = s / 2;
  const gid = `cg-${color.replace(/#/g, "")}`;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="block">
      <defs>
        <radialGradient id={gid} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <ellipse
        cx={cx - s * 0.22}
        cy={s * 0.22}
        rx={s * 0.11}
        ry={s * 0.14}
        fill={color}
        opacity={0.7}
        transform={`rotate(-18 ${cx - s * 0.22} ${s * 0.22})`}
      />
      <ellipse
        cx={cx + s * 0.22}
        cy={s * 0.22}
        rx={s * 0.11}
        ry={s * 0.14}
        fill={color}
        opacity={0.7}
        transform={`rotate(18 ${cx + s * 0.22} ${s * 0.22})`}
      />
      <ellipse cx={cx} cy={s * 0.54} rx={s * 0.38} ry={s * 0.35} fill={`url(#${gid})`} />
      {happy ? (
        <>
          <path
            d={`M${cx - eyeSpacing - s * 0.06} ${eyeY} Q${cx - eyeSpacing} ${eyeY - s * 0.07} ${cx - eyeSpacing + s * 0.06} ${eyeY}`}
            stroke="white"
            strokeWidth={s * 0.035}
            fill="none"
            strokeLinecap="round"
            opacity={0.9}
          />
          <path
            d={`M${cx + eyeSpacing - s * 0.06} ${eyeY} Q${cx + eyeSpacing} ${eyeY - s * 0.07} ${cx + eyeSpacing + s * 0.06} ${eyeY}`}
            stroke="white"
            strokeWidth={s * 0.035}
            fill="none"
            strokeLinecap="round"
            opacity={0.9}
          />
        </>
      ) : sad ? (
        <>
          <ellipse cx={cx - eyeSpacing} cy={eyeY + s * 0.02} rx={s * 0.04} ry={s * 0.025} fill="white" opacity={0.7} />
          <ellipse cx={cx + eyeSpacing} cy={eyeY + s * 0.02} rx={s * 0.04} ry={s * 0.025} fill="white" opacity={0.7} />
        </>
      ) : (
        <>
          <rect x={cx - eyeSpacing - s * 0.055} y={eyeY - s * 0.015} width={s * 0.11} height={s * 0.03} rx={s * 0.015} fill="white" opacity={0.85} />
          <rect x={cx + eyeSpacing - s * 0.055} y={eyeY - s * 0.015} width={s * 0.11} height={s * 0.03} rx={s * 0.015} fill="white" opacity={0.85} />
        </>
      )}
      <ellipse cx={cx} cy={s * 0.56} rx={s * 0.04} ry={s * 0.025} fill="white" opacity={0.6} />
      {happy ? (
        <path
          d={`M${cx - s * 0.06} ${s * 0.6} Q${cx} ${s * 0.67} ${cx + s * 0.06} ${s * 0.6}`}
          stroke="white"
          strokeWidth={s * 0.025}
          fill="none"
          strokeLinecap="round"
          opacity={0.7}
        />
      ) : sad ? (
        <path
          d={`M${cx - s * 0.06} ${s * 0.65} Q${cx} ${s * 0.6} ${cx + s * 0.06} ${s * 0.65}`}
          stroke="white"
          strokeWidth={s * 0.025}
          fill="none"
          strokeLinecap="round"
          opacity={0.5}
        />
      ) : (
        <line x1={cx - s * 0.05} y1={s * 0.62} x2={cx + s * 0.05} y2={s * 0.62} stroke="white" strokeWidth={s * 0.025} strokeLinecap="round" opacity={0.5} />
      )}
      {accessory === "sunglasses" && (
        <>
          <rect x={cx - eyeSpacing - s * 0.09} y={eyeY - s * 0.06} width={s * 0.16} height={s * 0.1} rx={s * 0.04} fill="#2d2520" opacity={0.75} />
          <rect x={cx + eyeSpacing - s * 0.07} y={eyeY - s * 0.06} width={s * 0.16} height={s * 0.1} rx={s * 0.04} fill="#2d2520" opacity={0.75} />
          <line x1={cx - eyeSpacing + s * 0.07} y1={eyeY - 0.01 * s} x2={cx + eyeSpacing - s * 0.07} y2={eyeY - 0.01 * s} stroke="#2d2520" strokeWidth={s * 0.03} opacity={0.75} />
        </>
      )}
      {accessory === "crown" && (
        <polygon
          points={`${cx - s * 0.14},${s * 0.18} ${cx - s * 0.14},${s * 0.08} ${cx},${s * 0.14} ${cx + s * 0.14},${s * 0.08} ${cx + s * 0.14},${s * 0.18}`}
          fill="#c9a96e"
          opacity={0.9}
        />
      )}
      {accessory === "ribbon" && (
        <>
          <ellipse cx={cx - s * 0.2} cy={s * 0.2} rx={s * 0.1} ry={s * 0.07} fill="#e8825a" opacity={0.85} transform={`rotate(-30 ${cx - s * 0.2} ${s * 0.2})`} />
          <ellipse cx={cx - s * 0.2} cy={s * 0.2} rx={s * 0.1} ry={s * 0.07} fill="#e8825a" opacity={0.85} transform={`rotate(30 ${cx - s * 0.2} ${s * 0.2})`} />
          <circle cx={cx - s * 0.2} cy={s * 0.2} r={s * 0.04} fill="#f7f3ee" opacity={0.9} />
        </>
      )}
    </svg>
  );
}
