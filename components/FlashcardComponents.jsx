// Flashcard components: decks, card modal, review session

const DECKS_DATA = [
  { id: 1, name: 'IELTS Vocab', description: 'Academic word list for IELTS 7+', cardCount: 142, dueToday: 18, lastStudied: '2026-05-03' },
  { id: 2, name: 'Daily Expressions', description: 'Idioms and collocations from podcasts', cardCount: 64, dueToday: 5, lastStudied: '2026-05-04' },
  { id: 3, name: 'Business English', description: 'Formal vocab for writing and meetings', cardCount: 88, dueToday: 0, lastStudied: '2026-04-28' },
  { id: 4, name: 'Phrasal Verbs', description: 'Tricky two-word verbs', cardCount: 37, dueToday: 12, lastStudied: '2026-05-02' },
];

const CARDS_DATA = [
  {
    id: 1, deckId: 1, word: 'Meticulous', partOfSpeech: 'adj',
    meaning: 'Showing great attention to detail; very careful and precise.',
    example: 'She was meticulous in her research, checking every source twice.',
    pronunciation: '/mɪˈtɪk.jʊ.ləs/',
    easeFactor: 2.5, interval: 4, repetitions: 3,
    dueDate: '2026-05-04', lastReviewed: '2026-04-30',
  },
  {
    id: 2, deckId: 1, word: 'Ephemeral', partOfSpeech: 'adj',
    meaning: 'Lasting for a very short time.',
    example: 'The beauty of cherry blossoms is ephemeral — gone in a week.',
    pronunciation: '/ɪˈfem.ər.əl/',
    easeFactor: 1.8, interval: 1, repetitions: 1,
    dueDate: '2026-05-04', lastReviewed: '2026-05-03',
  },
  {
    id: 3, deckId: 1, word: 'Ubiquitous', partOfSpeech: 'adj',
    meaning: 'Present, appearing, or found everywhere.',
    example: 'Smartphones have become ubiquitous in modern society.',
    pronunciation: '/juːˈbɪk.wɪ.təs/',
    easeFactor: 2.2, interval: 2, repetitions: 2,
    dueDate: '2026-05-04', lastReviewed: '2026-05-02',
  },
  {
    id: 4, deckId: 2, word: 'Hit the nail on the head', partOfSpeech: 'idiom',
    meaning: 'To describe exactly what is causing a situation or problem.',
    example: 'You hit the nail on the head — that\'s exactly the issue.',
    pronunciation: '',
    easeFactor: 2.6, interval: 6, repetitions: 4,
    dueDate: '2026-05-06', lastReviewed: '2026-04-30',
  },
];

const REVIEW_QUEUE = CARDS_DATA.filter(c => c.dueDate <= '2026-05-04');

function DeckCard({ deck, onStudy, onView }) {
  const T = window.THEME;
  const [hovered, setHovered] = React.useState(false);
  const hasDue = deck.dueToday > 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.colors.bgCard, border: `1px solid ${T.colors.border}`,
        borderRadius: T.radius.lg, padding: '20px 22px',
        boxShadow: hovered ? T.shadow.md : T.shadow.sm,
        transform: hovered ? 'translateY(-2px)' : '',
        transition: 'all 0.18s',
        display: 'flex', flexDirection: 'column', gap: '12px',
        cursor: 'pointer',
      }}
      onClick={() => onView(deck)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div>
          <div style={{ fontFamily: T.font.sans, fontWeight: 700, fontSize: '16px', color: T.colors.text }}>{deck.name}</div>
          <div style={{ fontFamily: T.font.sans, fontSize: '13px', color: T.colors.textMuted, marginTop: '3px' }}>{deck.description}</div>
        </div>
        {hasDue && (
          <div style={{
            background: T.colors.accent, color: 'white',
            borderRadius: T.radius.full, padding: '3px 10px',
            fontSize: '12px', fontFamily: T.font.mono, fontWeight: 700,
            flexShrink: 0, whiteSpace: 'nowrap',
          }}>{deck.dueToday} due</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <span style={{ fontFamily: T.font.mono, fontSize: '12px', color: T.colors.textMuted }}>{deck.cardCount} cards</span>
        <span style={{ fontFamily: T.font.mono, fontSize: '12px', color: T.colors.textMuted }}>
          Studied {deck.lastStudied === '2026-05-04' ? 'today' : deck.lastStudied}
        </span>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onStudy(deck); }}
        style={{
          padding: '9px 0', borderRadius: T.radius.md,
          border: hasDue ? 'none' : `1.5px solid ${T.colors.border}`,
          background: hasDue ? T.colors.accent : 'transparent',
          color: hasDue ? 'white' : T.colors.textMid,
          fontFamily: T.font.sans, fontWeight: 700, fontSize: '14px',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >{hasDue ? `Study ${deck.dueToday} cards` : 'Browse'}</button>
    </div>
  );
}

function CardDetailModal({ card, onClose, onEdit }) {
  const T = window.THEME;
  const PoS_COLOR = {
    adj: T.colors.purple, noun: T.colors.blue, verb: T.colors.green, adv: T.colors.gold, idiom: T.colors.accent
  };
  const posColor = PoS_COLOR[card.partOfSpeech] || T.colors.textMuted;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(45,37,32,0.45)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.colors.bgCard, borderRadius: T.radius.xl,
        width: '500px', maxWidth: '90vw', boxShadow: T.shadow.lg,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 28px 20px', borderBottom: `1px solid ${T.colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <span style={{
                background: posColor + '22', color: posColor,
                borderRadius: T.radius.full, padding: '2px 10px',
                fontSize: '12px', fontFamily: T.font.sans, fontWeight: 600,
              }}>{card.partOfSpeech}</span>
              <div style={{
                fontFamily: T.font.sans, fontWeight: 800, fontSize: '32px',
                color: T.colors.text, marginTop: '8px', lineHeight: 1,
              }}>{card.word}</div>
              {card.pronunciation && (
                <div style={{ fontFamily: T.font.mono, fontSize: '14px', color: T.colors.textMuted, marginTop: '4px' }}>
                  {card.pronunciation}
                </div>
              )}
            </div>
            <button onClick={onClose} style={{
              background: T.colors.bgMuted, border: 'none', borderRadius: T.radius.full,
              width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', color: T.colors.textMid,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>
        </div>
        {/* Body */}
        <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontFamily: T.font.sans, fontSize: '12px', color: T.colors.textMuted, fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Meaning</div>
            <div style={{ fontFamily: T.font.sans, fontSize: '15px', color: T.colors.text, lineHeight: 1.6 }}>{card.meaning}</div>
          </div>
          <div>
            <div style={{ fontFamily: T.font.sans, fontSize: '12px', color: T.colors.textMuted, fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Example</div>
            <div style={{
              fontFamily: T.font.sans, fontSize: '14px', color: T.colors.textMid, lineHeight: 1.7,
              fontStyle: 'italic', background: T.colors.bgMuted, padding: '10px 14px', borderRadius: T.radius.md,
            }}>"{card.example}"</div>
          </div>
          {/* SM-2 state */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: T.font.mono, fontSize: '12px', color: T.colors.textMuted }}>EF: {card.easeFactor}</span>
            <span style={{ fontFamily: T.font.mono, fontSize: '12px', color: T.colors.textMuted }}>Interval: {card.interval}d</span>
            <span style={{ fontFamily: T.font.mono, fontSize: '12px', color: T.colors.textMuted }}>Reps: {card.repetitions}</span>
            <span style={{ fontFamily: T.font.mono, fontSize: '12px', color: T.colors.textMuted }}>Next: {card.dueDate}</span>
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => onEdit(card)} style={{
            padding: '9px 20px', borderRadius: T.radius.md,
            border: `1.5px solid ${T.colors.border}`, background: 'none',
            fontFamily: T.font.sans, fontSize: '14px', color: T.colors.textMid,
            cursor: 'pointer', fontWeight: 600,
          }}>Edit card</button>
        </div>
      </div>
    </div>
  );
}

function ReviewSession({ deck, cards, onComplete, onExit }) {
  const T = window.THEME;
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [results, setResults] = React.useState([]);
  const [done, setDone] = React.useState(false);

  const card = cards[idx];

  const RATINGS = [
    { id: 'again', label: 'Again', color: '#e8825a', shortcut: '1', desc: '<1d' },
    { id: 'hard',  label: 'Hard',  color: '#c9a96e', shortcut: '2', desc: '+1d' },
    { id: 'good',  label: 'Good',  color: '#4caf7d', shortcut: '3', desc: '+4d' },
    { id: 'easy',  label: 'Easy',  color: '#6b9fd4', shortcut: '4', desc: '+7d' },
  ];

  function rate(rating) {
    setResults(prev => [...prev, { cardId: card.id, rating }]);
    if (idx + 1 >= cards.length) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setFlipped(false);
    }
  }

  if (done) {
    const counts = results.reduce((acc, r) => { acc[r.rating] = (acc[r.rating] || 0) + 1; return acc; }, {});
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '28px', padding: '60px 40px', flex: 1,
      }}>
        <div style={{ fontSize: '56px' }}>✦</div>
        <div style={{ fontFamily: T.font.sans, fontWeight: 800, fontSize: '28px', color: T.colors.text, textAlign: 'center' }}>
          Session complete!
        </div>
        <div style={{ fontFamily: T.font.sans, fontSize: '16px', color: T.colors.textMid, textAlign: 'center' }}>
          {cards.length} cards reviewed · Learn English habit marked ✓
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {RATINGS.map(r => counts[r.id] && (
            <div key={r.id} style={{
              background: r.color + '22', color: r.color,
              borderRadius: T.radius.md, padding: '10px 18px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: T.font.mono, fontSize: '22px', fontWeight: 700 }}>{counts[r.id]}</div>
              <div style={{ fontFamily: T.font.sans, fontSize: '13px', fontWeight: 600 }}>{r.label}</div>
            </div>
          ))}
        </div>
        <button onClick={onComplete} style={{
          padding: '12px 32px', borderRadius: T.radius.md,
          background: T.colors.accent, border: 'none', color: 'white',
          fontFamily: T.font.sans, fontWeight: 700, fontSize: '16px', cursor: 'pointer',
        }}>Back to Decks</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Progress bar */}
      <div style={{ padding: '20px 32px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <button onClick={onExit} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: T.font.sans, fontSize: '14px', color: T.colors.textMuted,
            display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
          }}>
            ← Exit
          </button>
          <span style={{ fontFamily: T.font.mono, fontSize: '14px', color: T.colors.textMuted }}>
            {idx + 1} / {cards.length}
          </span>
        </div>
        <div style={{ height: '4px', background: T.colors.bgMuted, borderRadius: T.radius.full }}>
          <div style={{
            height: '100%', width: `${((idx + 1) / cards.length) * 100}%`,
            background: T.colors.accent, borderRadius: T.radius.full,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div
          onClick={() => setFlipped(f => !f)}
          style={{
            width: '100%', maxWidth: '520px', minHeight: '240px',
            background: T.colors.bgCard, border: `1px solid ${T.colors.border}`,
            borderRadius: T.radius.xl, padding: '40px',
            boxShadow: T.shadow.md, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '16px', textAlign: 'center',
            transition: 'all 0.2s',
          }}
        >
          {!flipped ? (
            <>
              <span style={{
                background: T.colors.blueLight, color: T.colors.blue,
                borderRadius: T.radius.full, padding: '3px 12px',
                fontSize: '12px', fontFamily: T.font.sans, fontWeight: 600,
              }}>{card.partOfSpeech}</span>
              <div style={{ fontFamily: T.font.sans, fontWeight: 800, fontSize: '36px', color: T.colors.text }}>
                {card.word}
              </div>
              {card.pronunciation && (
                <div style={{ fontFamily: T.font.mono, fontSize: '14px', color: T.colors.textMuted }}>
                  {card.pronunciation}
                </div>
              )}
              <div style={{ fontFamily: T.font.sans, fontSize: '13px', color: T.colors.textMuted, marginTop: '8px' }}>
                Tap to reveal
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: T.font.sans, fontWeight: 700, fontSize: '20px', color: T.colors.text }}>
                {card.word}
              </div>
              <div style={{ fontFamily: T.font.sans, fontSize: '16px', color: T.colors.textMid, lineHeight: 1.6 }}>
                {card.meaning}
              </div>
              <div style={{
                fontFamily: T.font.sans, fontSize: '14px', color: T.colors.textMuted,
                fontStyle: 'italic', background: T.colors.bgMuted,
                padding: '10px 16px', borderRadius: T.radius.md, lineHeight: 1.7, width: '100%',
              }}>"{card.example}"</div>
            </>
          )}
        </div>
      </div>

      {/* Rating buttons */}
      <div style={{ padding: '0 32px 32px', display: 'flex', gap: '10px' }}>
        {!flipped ? (
          <button onClick={() => setFlipped(true)} style={{
            flex: 1, padding: '14px', borderRadius: T.radius.md,
            background: T.colors.accent, border: 'none', color: 'white',
            fontFamily: T.font.sans, fontWeight: 700, fontSize: '16px', cursor: 'pointer',
          }}>Show Answer</button>
        ) : (
          RATINGS.map(r => (
            <button key={r.id} onClick={() => rate(r.id)} style={{
              flex: 1, padding: '12px 0', borderRadius: T.radius.md,
              border: `2px solid ${r.color}33`, background: r.color + '15',
              color: r.color, fontFamily: T.font.sans, fontWeight: 700, fontSize: '14px',
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            }}>
              <span>{r.label}</span>
              <span style={{ fontFamily: T.font.mono, fontSize: '11px', opacity: 0.7 }}>{r.desc}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function AddCardModal({ onClose, decks }) {
  const T = window.THEME;
  const [word, setWord] = React.useState('');
  const [pos, setPos] = React.useState('adj');
  const [meaning, setMeaning] = React.useState('');
  const [example, setExample] = React.useState('');
  const [pronunciation, setPronunciation] = React.useState('');
  const [deckId, setDeckId] = React.useState(decks[0]?.id || 1);

  const inputStyle = {
    width: '100%', padding: '9px 13px', borderRadius: T.radius.md,
    border: `1.5px solid ${T.colors.border}`, background: T.colors.bg,
    fontFamily: T.font.sans, fontSize: '14px', color: T.colors.text,
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: T.font.sans, fontSize: '12px', color: T.colors.textMid,
    fontWeight: 600, marginBottom: '4px', display: 'block',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(45,37,32,0.45)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.colors.bgCard, borderRadius: T.radius.xl, padding: '32px',
        width: '520px', maxWidth: '92vw', boxShadow: T.shadow.lg,
        display: 'flex', flexDirection: 'column', gap: '16px',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ fontFamily: T.font.sans, fontWeight: 700, fontSize: '20px', color: T.colors.text }}>Add New Card</div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Word / Phrase</label>
            <input value={word} onChange={e => setWord(e.target.value)} placeholder="e.g. Meticulous" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Part of Speech</label>
            <select value={pos} onChange={e => setPos(e.target.value)} style={inputStyle}>
              <option value="adj">Adjective</option>
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adv">Adverb</option>
              <option value="idiom">Idiom</option>
              <option value="phrase">Phrase</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Pronunciation</label>
          <input value={pronunciation} onChange={e => setPronunciation(e.target.value)} placeholder="/ˌmɛt.ɪˈkjuː.ləs/" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Meaning</label>
          <textarea value={meaning} onChange={e => setMeaning(e.target.value)}
            placeholder="Clear definition in your own words…"
            style={{ ...inputStyle, height: '72px', resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        <div>
          <label style={labelStyle}>Example Sentence</label>
          <textarea value={example} onChange={e => setExample(e.target.value)}
            placeholder="A natural sentence using this word…"
            style={{ ...inputStyle, height: '72px', resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Deck</label>
            <select value={deckId} onChange={e => setDeckId(Number(e.target.value))} style={inputStyle}>
              {decks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Image</label>
            <div style={{
              ...inputStyle, display: 'flex', alignItems: 'center', gap: '8px',
              color: T.colors.textMuted, cursor: 'pointer',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="5.5" cy="6.5" r="1" fill="currentColor"/>
                <path d="M1 11l4-3 3 3 2.5-2 3.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              Upload image
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: T.radius.md,
            border: `1.5px solid ${T.colors.border}`, background: 'none',
            fontFamily: T.font.sans, fontSize: '14px', color: T.colors.textMid,
            cursor: 'pointer', fontWeight: 600,
          }}>Cancel</button>
          <button style={{
            padding: '10px 24px', borderRadius: T.radius.md, border: 'none',
            background: T.colors.accent, color: 'white',
            fontFamily: T.font.sans, fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            opacity: word.trim() && meaning.trim() ? 1 : 0.5,
          }} onClick={onClose}>Add Card</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DECKS_DATA, CARDS_DATA, REVIEW_QUEUE, DeckCard, CardDetailModal, ReviewSession, AddCardModal });
