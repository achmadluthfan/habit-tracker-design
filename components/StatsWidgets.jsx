// Heatmap + Stats components

function HeatmapGrid({ completions, months = 6 }) {
  const T = window.THEME;
  const today = new Date(2026, 4, 4); // May 4 2026
  const cells = [];
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - months);

  // Build day cells
  const dayMs = 86400000;
  for (let d = new Date(startDate); d <= today; d = new Date(d.getTime() + dayMs)) {
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, done: completions.has(key) });
  }

  // Group into weeks
  const weeks = [];
  let week = [];
  // Pad first week
  const firstDay = new Date(cells[0].date).getDay();
  for (let i = 0; i < firstDay; i++) week.push(null);
  cells.forEach(c => {
    week.push(c);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }

  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAY_LABELS = ['S','M','T','W','T','F','S'];

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-start' }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '18px' }}>
          {DAY_LABELS.map((d, i) => (
            <div key={i} style={{
              width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', color: T.colors.textMuted, fontFamily: T.font.mono
            }}>{i % 2 === 1 ? d : ''}</div>
          ))}
        </div>
        {/* Weeks */}
        <div>
          {/* Month label row */}
          <div style={{ display: 'flex', gap: '3px', marginBottom: '3px', height: '16px' }}>
            {weeks.map((w, wi) => {
              const firstReal = w.find(c => c !== null);
              if (!firstReal) return <div key={wi} style={{ width: '14px' }} />;
              const d = new Date(firstReal.date);
              const showLabel = d.getDate() <= 7;
              return (
                <div key={wi} style={{ width: '14px', fontSize: '10px', color: T.colors.textMuted,
                  fontFamily: T.font.mono, overflow: 'visible', whiteSpace: 'nowrap' }}>
                  {showLabel ? MONTH_LABELS[d.getMonth()] : ''}
                </div>
              );
            })}
          </div>
          {/* Grid */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {weeks.map((w, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {w.map((cell, di) => (
                  <div key={di} style={{
                    width: '14px', height: '14px', borderRadius: '3px',
                    background: cell === null ? 'transparent'
                      : cell.done ? T.colors.accent
                      : T.colors.bgMuted,
                    opacity: cell && cell.done ? 0.9 : 1,
                    title: cell ? cell.date : '',
                  }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color, mono = true }) {
  const T = window.THEME;
  return (
    <div style={{
      background: T.colors.bgMuted, borderRadius: T.radius.md, padding: '12px 18px',
      display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '80px',
    }}>
      <div style={{
        fontFamily: mono ? T.font.mono : T.font.sans,
        fontSize: '22px', fontWeight: 700, color: color || T.colors.text, lineHeight: 1
      }}>{value}</div>
      <div style={{ fontFamily: T.font.sans, fontSize: '12px', color: T.colors.textMuted }}>{label}</div>
    </div>
  );
}

function CompletionChart({ data, color }) {
  const T = window.THEME;
  // data: array of {label, count}
  const max = Math.max(...data.map(d => d.count), 1);
  const barW = 28;
  const chartH = 80;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: `${chartH + 24}px` }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: barW, height: `${(d.count / max) * chartH}px`,
            background: d.count > 0 ? (color || T.colors.accent) : T.colors.bgMuted,
            borderRadius: '6px 6px 3px 3px',
            minHeight: d.count > 0 ? '6px' : '3px',
            opacity: i === data.length - 1 ? 1 : 0.55 + (i / data.length) * 0.45,
            transition: 'height 0.4s ease',
          }} />
          <div style={{ fontFamily: T.font.mono, fontSize: '10px', color: T.colors.textMuted }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { HeatmapGrid, StatPill, CompletionChart });
