# Habit Tracker + Flashcard Web App — PRD

## Problem Statement

I struggle to track my daily habits consistently, and I have one habit in particular — learning English — that needs more than a checkbox. I have no platform to save new vocabulary I encounter, and without a structured spaced-repetition system I forget words faster than I learn them. I want a single app that handles both: a habit tracker for my routines, and an integrated flashcard module for English vocabulary that uses spaced repetition to reinforce memory.

## Solution

A personal web app that combines daily habit tracking with a built-in flashcard system. Habits are checked off daily on a dashboard with streaks, completion rates, and a calendar heatmap. The "learn English" habit is wired to the flashcard module — completing a daily flashcard review session automatically marks the habit as done. Each habit also has its own pixel-art virtual cat that levels up, changes mood, and earns accessories based on my consistency. The app is designed for a single user (me), online-only, with Google sign-in.

## User Stories

### Auth & General
1. As the sole user, I want to sign in with Google, so that I don't have to manage a password.
2. As the user, I want to be automatically signed back in on return visits, so that the app feels frictionless.
3. As the user, I want to sign out from my account menu, so that I can secure my session if needed.

### Habit Management
4. As the user, I want to create a habit with a name, description, and category tag, so that I can organize my routines.
5. As the user, I want to assign a schedule to a habit (daily, weekly on specific days, or monthly on specific dates), so that the app expects completions only when relevant.
6. As the user, I want to edit a habit's name, description, category, or schedule, so that I can refine it as my goals change.
7. As the user, I want to archive a habit I no longer want to track, so that it disappears from my dashboard but its history is preserved.
8. As the user, I want to delete a habit permanently, so that I can remove data I no longer want.
9. As the user, I want to filter or group habits by category tag, so that I can focus on one area at a time.

### Daily Habit Tracking
10. As the user, I want to wake up, open the app, and see today's due habits in under 3 seconds, so that logging takes no friction.
11. As the user, I want to check off a habit completion with a single click, so that logging is instant.
12. As the user, I want to add a note when completing a habit, so that I can capture how it went.
13. As the user, I want to undo a completion if I clicked it by mistake, so that my data stays accurate.
14. As the user, I want to log a completion for a past date, so that I can backfill days I forgot.
15. As the user, I want to edit notes on past completions, so that I can refine my reflections later.
16. As the user, I want missed scheduled days to break my streak, so that the streak number reflects honest consistency.

### Progress & Feedback
17. As the user, I want to see each habit's current streak and longest streak, so that I have clear progress signals.
18. As the user, I want to see a completion rate (%) per habit over a chosen window, so that I can gauge consistency.
19. As the user, I want a calendar heatmap per habit, so that I can see months of history at a glance.
20. As the user, I want a simple chart of completions over time, so that I can spot trends.
21. As the user, I want a weekly summary view (e.g., a "this week" recap), so that I can review my progress at the end of each week.
22. As the user, I want a total completion count per habit, so that I can see lifetime volume.

### Virtual Pet Cat (Gamification)
23. As the user, I want each habit to have its own pixel-art cat, so that progress feels personal and visual.
24. As the user, I want the cat to level up as I complete the habit, so that consistency produces visible growth.
25. As the user, I want the cat's mood to reflect recent activity — happy when I'm consistent, sad/hungry when I miss days — so that I get an emotional nudge to keep going.
26. As the user, I want the cat to earn accessories or outfits at streak milestones, so that long streaks feel rewarded.
27. As the user, I want to see all my cats on a dedicated page or as part of the dashboard, so that I can enjoy the collection.

### Flashcard / English Vocabulary
28. As the user, I want a dedicated flashcards page accessible from the main navigation, so that I can switch between habit tracking and vocabulary learning easily.
29. As the user, I want to organize flashcards into decks, so that I can group them by topic, source, or difficulty.
30. As the user, I want to create a deck with a name and description, so that I can structure my vocabulary library.
31. As the user, I want to add a new flashcard with English word, meaning, example sentence, pronunciation, image, audio, and part of speech, so that each card is rich enough to learn deeply.
32. As the user, I want to upload an image and audio file when creating a card, so that I have multimodal context for memorization.
33. As the user, I want to click a flashcard to open a modal showing all its detailed fields, so that I can study the full content without leaving the deck view.
34. As the user, I want to edit any field of a card after creation, so that I can correct mistakes or improve cards over time.
35. As the user, I want to delete a card, so that I can remove cards I no longer want to study.
36. As the user, I want to start a daily review session that surfaces cards due according to SM-2 scheduling, so that I review the right cards at the right time.
37. As the user, I want to rate each reviewed card with Again / Hard / Good / Easy (Anki-style), so that the spaced repetition algorithm can adjust intervals correctly.
38. As the user, I want the SM-2 algorithm to compute the next review interval for each card based on my rating, so that easy cards appear less often and hard ones more often.
39. As the user, I want unlimited daily new cards and reviews, so that I can study as much as I want in a single session.
40. As the user, I want completing a flashcard review session to automatically mark my "learn English" habit as completed for today, so that I don't have to log it twice.
41. As the user, I want to see how many cards are due today across all decks, so that I know my review load at a glance.
42. As the user, I want to see review history per card (last reviewed, next due, current ease factor), so that I can understand the algorithm's behavior.

## Implementation Decisions

### Stack
- **Frontend:** Next.js (App Router) + Tailwind CSS.
- **Data fetching / state:** TanStack Query.
- **Auth + Database + Storage:** Supabase (Google OAuth, Postgres, Storage for card images/audio).
- **Hosting:** Vercel.
- **Online-only.** No offline cache or sync logic.

### Modules

**Auth Module**
- Wraps Supabase Auth for Google OAuth sign-in/out and session restoration.
- Interface: `signInWithGoogle`, `signOut`, `getSession`.

**Habit Module**
- CRUD for habits and schedules. Stores name, description, category tag, schedule (daily / weekly-on-days / monthly-on-dates), archived flag.
- Interface: `createHabit`, `updateHabit`, `archiveHabit`, `deleteHabit`, `listHabits`, `getDueToday`.

**Completion Module**
- Records and edits habit completions. Each completion has a habit id, date, and optional note.
- One completion per habit per scheduled day; supports past-date logging and editing notes.
- Interface: `logCompletion`, `editCompletionNote`, `removeCompletion`, `getCompletions(habitId, range)`.

**Streak Engine**
- Pure function. Given a completion history and a schedule, computes current streak, longest streak, and missed scheduled days.
- No I/O. Reused by the dashboard and the cat module.

**Stats Module**
- Aggregates completion data into the views the dashboard needs: completion rate over windows, heatmap data, total count, weekly summary.
- Reads from Completion module; writes nothing.

**Cat Module**
- One cat per habit. Tracks level, XP, mood, and unlocked accessories.
- Mood is derived from recent completion behavior (happy on streak, sad on missed days).
- Level/XP increases on each completion. Accessories unlock at predefined streak milestones.
- Pixel-art assets stored as static files in the Next.js app.
- Interface: `getCatState(habitId)`, plus pure derivation functions for mood and level.

**Flashcard Deck Module**
- CRUD for decks. Stores name, description, owner.
- Interface: `createDeck`, `updateDeck`, `deleteDeck`, `listDecks`.

**Flashcard Card Module**
- CRUD for cards within a deck. Stores word, meaning, example sentence, pronunciation, image URL, audio URL, part of speech, and SM-2 state (ease factor, interval, repetition count, due date, last reviewed).
- Image and audio uploaded to Supabase Storage.
- Interface: `createCard`, `updateCard`, `deleteCard`, `getCard`, `listCardsInDeck`, `getDueCards`.

**SM-2 Engine**
- Pure function. Given a card's current SM-2 state and a rating (Again/Hard/Good/Easy), returns the new state (ease factor, interval, next due date, repetition count).
- No I/O. The most important module for tests.
- Interface: `applyReview(currentState, rating) -> newState`.

**Review Session Module**
- Orchestrates a review session: fetches due cards, applies user ratings via the SM-2 Engine, persists state.
- On session completion, fires a side effect to mark the "learn English" habit as completed for today via the Completion Module.
- Interface: `startSession`, `submitReview(cardId, rating)`, `endSession`.

### Habit ↔ Flashcard Wiring
- A specific habit (the user's "learn English" habit) is designated as the flashcard-linked habit in app config or via a flag on the habit record.
- Completing a flashcard review session triggers a completion on that habit for today (idempotent — if already completed, no-op).

### Schema (logical)
- `users` — managed by Supabase Auth.
- `habits` — id, user_id, name, description, category, schedule (jsonb), archived_at, is_flashcard_linked.
- `completions` — id, habit_id, date, note, created_at.
- `cats` — id, habit_id, level, xp, unlocked_accessories (jsonb).
- `decks` — id, user_id, name, description.
- `cards` — id, deck_id, word, meaning, example_sentence, pronunciation, image_url, audio_url, part_of_speech, ease_factor, interval, repetition_count, due_date, last_reviewed_at.

### Architectural Notes
- Streak Engine and SM-2 Engine are deep modules: pure logic, no I/O, simple stable interfaces, fully unit-testable.
- Cat mood/level derivation is also pure and testable.
- Server-side data access via Supabase from Next.js Server Components or Route Handlers; client mutations via TanStack Query.

## Testing Decisions

**What makes a good test:** tests verify observable behavior given controlled inputs, not internal implementation details. A test should still pass after a refactor that doesn't change behavior.

**In v1, only the SM-2 Engine is unit-tested.** It is the highest-stakes pure logic in the app — if it's wrong, every flashcard review degrades. Test cases must cover:
- First-ever review of a new card for each of the four ratings.
- Subsequent reviews maintaining or modifying ease factor correctly.
- Ease factor floor (cannot drop below SM-2's specified minimum).
- Interval progression on consecutive Good ratings.
- Reset behavior on Again rating.
- Edge cases around rating sequences (Good → Again → Good).

**Prior art:** none — greenfield project. Tests will use the standard Next.js testing setup (Vitest or Jest) with no external dependencies, since the SM-2 Engine is pure.

Other modules (Streak Engine, Cat Module, Habit/Card CRUD) are not tested in v1 — they may be added later.

## Out of Scope

- Mobile app (web only).
- Offline mode / sync.
- Reminders or notifications of any kind.
- Multi-user / sharing / social features.
- Negative habits ("avoid X").
- Quantified habits (e.g., "drink 8 glasses of water" with a counter) — checkbox only in v1.
- AI-generated vocabulary, definitions, or coaching.
- Importing flashcards from CSV or external sources.
- Daily new-card or review limits.
- Pause/vacation mode for streaks.
- CSV / data export.
- Tests for any module other than the SM-2 Engine.
- Web push or email notifications.

## Further Notes

- The SM-2 Engine and Streak Engine being pure, isolated modules is the most important architectural decision. All scheduling logic for both habits and flashcards must flow through them.
- The flashcard ↔ habit link is the unique value proposition of this app over a generic habit tracker or generic flashcard app — keep that integration first-class.
- Pixel-art cat assets need to be sourced or created before the cat module can ship; this is the only non-code dependency of v1.
- No timeline committed; ship at personal pace.
