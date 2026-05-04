// Abstract pixel-cat mood widget — chill cool cat aesthetic
// Each cat is a unique abstract shape with mood expressed via color + geometry

const CAT_CONFIGS = [
  { name: 'Ember', color: '#e8825a', mood: 'happy', streak: 12, level: 4, accessory: 'sunglasses' },
  { name: 'Moss',  color: '#4caf7d', mood: 'happy', streak: 7,  level: 3, accessory: 'crown' },
  { name: 'Dusk',  color: '#9b7fd4', mood: 'neutral', streak: 2, level: 2, accessory: null },
  { name: 'Sand',  color: '#c9a96e', mood: 'sad',   streak: 0,  level: 1, accessory: null },
  { name: 'Mist',  color: '#6b9fd4', mood: 'happy', streak: 21, level: 5, accessory: 'ribbon' },
];

function CatFace({ color, mood, size = 80, accessory }) {
  const T = window.THEME;
  const s = size;
  const happy = mood === 'happy';
  const sad = mood === 'sad';
  const eyeY = s * 0.44;
  const eyeSpacing = s * 0.17;
  const cx = s / 2;

  // Ear positions
  const earW = s * 0.18, earH = s * 0.20;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`catgrad-${color.replace('#','')}`} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </radialGradient>
        <filter id={`catglow-${color.replace('#','')}`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ears */}
      <ellipse cx={cx - s*0.22} cy={s*0.22} rx={earW*0.6} ry={earH*0.7}
        fill={color} opacity="0.7" transform={`rotate(-18, ${cx - s*0.22}, ${s*0.22})`} />
      <ellipse cx={cx + s*0.22} cy={s*0.22} rx={earW*0.6} ry={earH*0.7}
        fill={color} opacity="0.7" transform={`rotate(18, ${cx + s*0.22}, ${s*0.22})`} />
      {/* Inner ear */}
      <ellipse cx={cx - s*0.22} cy={s*0.22} rx={earW*0.3} ry={earH*0.38}
        fill="white" opacity="0.4" transform={`rotate(-18, ${cx - s*0.22}, ${s*0.22})`} />
      <ellipse cx={cx + s*0.22} cy={s*0.22} rx={earW*0.3} ry={earH*0.38}
        fill="white" opacity="0.4" transform={`rotate(18, ${cx + s*0.22}, ${s*0.22})`} />

      {/* Head */}
      <ellipse cx={cx} cy={s*0.54} rx={s*0.38} ry={s*0.35}
        fill={`url(#catgrad-${color.replace('#','')})`} />

      {/* Eyes */}
      {happy ? (
        <>
          {/* Happy: curved arc eyes */}
          <path d={`M ${cx - eyeSpacing - s*0.06} ${eyeY} Q ${cx - eyeSpacing} ${eyeY - s*0.07} ${cx - eyeSpacing + s*0.06} ${eyeY}`}
            stroke="white" strokeWidth={s*0.035} fill="none" strokeLinecap="round" opacity="0.9" />
          <path d={`M ${cx + eyeSpacing - s*0.06} ${eyeY} Q ${cx + eyeSpacing} ${eyeY - s*0.07} ${cx + eyeSpacing + s*0.06} ${eyeY}`}
            stroke="white" strokeWidth={s*0.035} fill="none" strokeLinecap="round" opacity="0.9" />
        </>
      ) : sad ? (
        <>
          {/* Sad: droopy dots */}
          <ellipse cx={cx - eyeSpacing} cy={eyeY + s*0.02} rx={s*0.04} ry={s*0.025}
            fill="white" opacity="0.7" />
          <ellipse cx={cx + eyeSpacing} cy={eyeY + s*0.02} rx={s*0.04} ry={s*0.025}
            fill="white" opacity="0.7" />
        </>
      ) : (
        <>
          {/* Neutral: half-closed horizontal slits — chill */}
          <rect x={cx - eyeSpacing - s*0.055} y={eyeY - s*0.015} width={s*0.11} height={s*0.03}
            rx={s*0.015} fill="white" opacity="0.85" />
          <rect x={cx + eyeSpacing - s*0.055} y={eyeY - s*0.015} width={s*0.11} height={s*0.03}
            rx={s*0.015} fill="white" opacity="0.85" />
        </>
      )}

      {/* Nose */}
      <ellipse cx={cx} cy={s*0.56} rx={s*0.04} ry={s*0.025}
        fill="white" opacity="0.6" />

      {/* Mouth */}
      {happy ? (
        <path d={`M ${cx - s*0.06} ${s*0.60} Q ${cx} ${s*0.67} ${cx + s*0.06} ${s*0.60}`}
          stroke="white" strokeWidth={s*0.025} fill="none" strokeLinecap="round" opacity="0.7" />
      ) : sad ? (
        <path d={`M ${cx - s*0.06} ${s*0.65} Q ${cx} ${s*0.60} ${cx + s*0.06} ${s*0.65}`}
          stroke="white" strokeWidth={s*0.025} fill="none" strokeLinecap="round" opacity="0.5" />
      ) : (
        <line x1={cx - s*0.05} y1={s*0.62} x2={cx + s*0.05} y2={s*0.62}
          stroke="white" strokeWidth={s*0.025} strokeLinecap="round" opacity="0.5" />
      )}

      {/* Whiskers */}
      <line x1={cx - s*0.38} y1={s*0.55} x2={cx - s*0.16} y2={s*0.57}
        stroke="white" strokeWidth={s*0.018} opacity="0.35" strokeLinecap="round" />
      <line x1={cx - s*0.38} y1={s*0.62} x2={cx - s*0.16} y2={s*0.60}
        stroke="white" strokeWidth={s*0.018} opacity="0.35" strokeLinecap="round" />
      <line x1={cx + s*0.38} y1={s*0.55} x2={cx + s*0.16} y2={s*0.57}
        stroke="white" strokeWidth={s*0.018} opacity="0.35" strokeLinecap="round" />
      <line x1={cx + s*0.38} y1={s*0.62} x2={cx + s*0.16} y2={s*0.60}
        stroke="white" strokeWidth={s*0.018} opacity="0.35" strokeLinecap="round" />

      {/* Accessories */}
      {accessory === 'sunglasses' && (
        <>
          <rect x={cx - eyeSpacing - s*0.09} y={eyeY - s*0.06} width={s*0.16} height={s*0.1} rx={s*0.04}
            fill="#2d2520" opacity="0.75" />
          <rect x={cx + eyeSpacing - s*0.07} y={eyeY - s*0.06} width={s*0.16} height={s*0.1} rx={s*0.04}
            fill="#2d2520" opacity="0.75" />
          <line x1={cx - eyeSpacing + s*0.07} y1={eyeY - s*0.01} x2={cx + eyeSpacing - s*0.07} y2={eyeY - s*0.01}
            stroke="#2d2520" strokeWidth={s*0.03} opacity="0.75" />
        </>
      )}
      {accessory === 'crown' && (
        <polygon
          points={`${cx-s*0.14},${s*0.18} ${cx-s*0.14},${s*0.08} ${cx},${s*0.14} ${cx+s*0.14},${s*0.08} ${cx+s*0.14},${s*0.18}`}
          fill="#c9a96e" opacity="0.9" />
      )}
      {accessory === 'ribbon' && (
        <>
          <ellipse cx={cx - s*0.2} cy={s*0.2} rx={s*0.1} ry={s*0.07}
            fill="#e8825a" opacity="0.85" transform={`rotate(-30, ${cx - s*0.2}, ${s*0.2})`} />
          <ellipse cx={cx - s*0.2} cy={s*0.2} rx={s*0.1} ry={s*0.07}
            fill="#e8825a" opacity="0.85" transform={`rotate(30, ${cx - s*0.2}, ${s*0.2})`} />
          <circle cx={cx - s*0.2} cy={s*0.2} r={s*0.04} fill="#f7f3ee" opacity="0.9" />
        </>
      )}
    </svg>
  );
}

function CatCard({ cat, habitName, onClick }) {
  const T = window.THEME;
  const moodLabel = { happy: 'Vibing ✦', neutral: 'Chill', sad: 'Needs love' }[cat.mood];
  const moodColor = { happy: T.colors.green, neutral: T.colors.gold, sad: T.colors.accent }[cat.mood];

  return (
    <div onClick={onClick} style={{
      background: T.colors.bgCard,
      border: `1px solid ${T.colors.border}`,
      borderRadius: T.radius.lg,
      padding: '24px',
      cursor: 'pointer',
      transition: 'transform 0.18s, box-shadow 0.18s',
      boxShadow: T.shadow.sm,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '14px',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = T.shadow.md; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = T.shadow.sm; }}>
      <CatFace color={cat.color} mood={cat.mood} size={88} accessory={cat.accessory} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: T.font.sans, fontWeight: 700, fontSize: '17px', color: T.colors.text }}>{cat.name}</div>
        <div style={{ fontFamily: T.font.sans, fontSize: '13px', color: T.colors.textMuted, marginTop: '2px' }}>{habitName}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{
          background: T.colors.bgMuted, color: T.colors.textMid, borderRadius: T.radius.full,
          padding: '3px 10px', fontSize: '12px', fontFamily: T.font.mono
        }}>Lv.{cat.level}</span>
        <span style={{
          background: moodColor + '22', color: moodColor, borderRadius: T.radius.full,
          padding: '3px 10px', fontSize: '12px', fontFamily: T.font.sans, fontWeight: 600
        }}>{moodLabel}</span>
        {cat.streak > 0 && (
          <span style={{
            background: T.colors.accentLight, color: T.colors.accent, borderRadius: T.radius.full,
            padding: '3px 10px', fontSize: '12px', fontFamily: T.font.mono
          }}>{cat.streak}🔥</span>
        )}
      </div>
      {/* XP bar */}
      <div style={{ width: '100%' }}>
        <div style={{ height: '4px', background: T.colors.bgMuted, borderRadius: T.radius.full, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${(cat.streak % 10) * 10 + 20}%`,
            background: cat.color, borderRadius: T.radius.full,
            transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{ fontFamily: T.font.mono, fontSize: '11px', color: T.colors.textMuted, marginTop: '4px', textAlign: 'right' }}>
          {(cat.streak % 10) * 10 + 20}/100 XP
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CatFace, CatCard, CAT_CONFIGS });
