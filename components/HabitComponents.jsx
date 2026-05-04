// Habit row, habit card, and category chip components

const CATEGORIES = [
  { id: 'health',    label: 'Health',    color: '#4caf7d' },
  { id: 'learning',  label: 'Learning',  color: '#6b9fd4' },
  { id: 'mindful',   label: 'Mindful',   color: '#9b7fd4' },
  { id: 'fitness',   label: 'Fitness',   color: '#e8825a' },
  { id: 'creative',  label: 'Creative',  color: '#c9a96e' },
];

const HABITS_DATA = [
  { id: 1, name: 'Learn English', category: 'learning', streak: 12, longest: 21, rate: 89, done: true,  note: '', flashcard: true,  schedule: 'Daily' },
  { id: 2, name: 'Morning Run',   category: 'fitness',  streak: 7,  longest: 14, rate: 78, done: false, note: '', flashcard: false, schedule: 'Daily' },
  { id: 3, name: 'Meditate',      category: 'mindful',  streak: 5,  longest: 18, rate: 65, done: true,  note: 'Felt peaceful today', flashcard: false, schedule: 'Daily' },
  { id: 4, name: 'Read a Book',   category: 'learning', streak: 3,  longest: 9,  rate: 72, done: false, note: '', flashcard: false, schedule: 'Daily' },
  { id: 5, name: 'Drink Water',   category: 'health',   streak: 21, longest: 21, rate: 95, done: true,  note: '', flashcard: false, schedule: 'Daily' },
  { id: 6, name: 'Sketch Daily',  category: 'creative', streak: 0,  longest: 5,  rate: 40, done: false, note: '', flashcard: false, schedule: 'Daily' },
];

function CategoryChip({ category, small }) {
  const T = window.THEME;
  const cat = CATEGORIES.find(c => c.id === category) || { label: category, color: T.colors.textMuted };
  return (
    <span style={{
      background: cat.color + '22', color: cat.color,
      borderRadius: T.radius.full, padding: small ? '2px 8px' : '3px 10px',
      fontSize: small ? '11px' : '12px', fontFamily: T.font.sans, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      whiteSpace: 'nowrap',
    }}>{cat.label}</span>
  );
}

function HabitRow({ habit, onToggle, onNote, onClick, catColor }) {
  const T = window.THEME;
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 16px',
        background: hovered ? T.colors.bgMuted : 'transparent',
        borderRadius: T.radius.md,
        transition: 'background 0.15s',
        cursor: 'pointer',
      }}
    >
      {/* Completion toggle */}
      <button
        onClick={e => { e.stopPropagation(); onToggle(habit.id); }}
        style={{
          width: '28px', height: '28px', borderRadius: T.radius.full,
          border: `2px solid ${habit.done ? catColor || T.colors.accent : T.colors.borderStrong}`,
          background: habit.done ? catColor || T.colors.accent : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0, transition: 'all 0.18s',
        }}
      >
        {habit.done && (
          <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
            <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }} onClick={() => onClick(habit.id)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: T.font.sans, fontWeight: 600, fontSize: '15px',
            color: habit.done ? T.colors.textMuted : T.colors.text,
            textDecoration: habit.done ? 'line-through' : 'none',
            transition: 'color 0.15s',
          }}>{habit.name}</span>
          <CategoryChip category={habit.category} small />
          {habit.flashcard && (
            <span style={{
              background: T.colors.blueLight, color: T.colors.blue,
              borderRadius: T.radius.full, padding: '2px 8px',
              fontSize: '11px', fontFamily: T.font.sans, fontWeight: 600
            }}>📖 Flashcard</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          <span style={{ fontFamily: T.font.mono, fontSize: '12px', color: T.colors.textMuted }}>
            {habit.streak > 0 ? `🔥 ${habit.streak}d streak` : '— no streak'}
          </span>
          <span style={{ fontFamily: T.font.mono, fontSize: '12px', color: T.colors.textMuted }}>
            {habit.rate}% this month
          </span>
        </div>
      </div>

      {/* Note button */}
      <button
        onClick={e => { e.stopPropagation(); onNote(habit.id); }}
        style={{
          opacity: hovered ? 1 : 0.3, transition: 'opacity 0.15s',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '6px', borderRadius: T.radius.sm,
          color: T.colors.textMuted,
        }}
        title="Add note"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12v9H8l-4 3V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        </svg>
      </button>
    </div>
  );
}

function AddHabitModal({ onClose, onAdd }) {
  const T = window.THEME;
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState('health');
  const [description, setDescription] = React.useState('');
  const [schedule, setSchedule] = React.useState('daily');

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: T.radius.md,
    border: `1.5px solid ${T.colors.border}`, background: T.colors.bg,
    fontFamily: T.font.sans, fontSize: '14px', color: T.colors.text,
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(45,37,32,0.4)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.colors.bgCard, borderRadius: T.radius.xl, padding: '32px',
        width: '460px', maxWidth: '90vw', boxShadow: T.shadow.lg,
        display: 'flex', flexDirection: 'column', gap: '18px',
      }}>
        <div style={{ fontFamily: T.font.sans, fontWeight: 700, fontSize: '20px', color: T.colors.text }}>
          New Habit
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontFamily: T.font.sans, fontSize: '13px', color: T.colors.textMid, fontWeight: 600 }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Morning run" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontFamily: T.font.sans, fontSize: '13px', color: T.colors.textMid, fontWeight: 600 }}>Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Optional details…" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: T.font.sans, fontSize: '13px', color: T.colors.textMid, fontWeight: 600 }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle }}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: T.font.sans, fontSize: '13px', color: T.colors.textMid, fontWeight: 600 }}>Schedule</label>
            <select value={schedule} onChange={e => setSchedule(e.target.value)} style={{ ...inputStyle }}>
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="custom">Custom days</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: T.radius.md,
            border: `1.5px solid ${T.colors.border}`, background: 'none',
            fontFamily: T.font.sans, fontSize: '14px', color: T.colors.textMid,
            cursor: 'pointer', fontWeight: 600,
          }}>Cancel</button>
          <button onClick={() => { if(name.trim()) { onAdd({ name, category, description, schedule }); onClose(); } }} style={{
            padding: '10px 24px', borderRadius: T.radius.md,
            border: 'none', background: T.colors.accent,
            fontFamily: T.font.sans, fontSize: '14px', color: 'white',
            cursor: 'pointer', fontWeight: 700,
            opacity: name.trim() ? 1 : 0.5,
          }}>Create Habit</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CATEGORIES, HABITS_DATA, CategoryChip, HabitRow, AddHabitModal });
