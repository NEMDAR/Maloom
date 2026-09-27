# معلوم — Maloom frontend prototype

## Build
- Create a shared Arabic RTL application shell with the custom Maloom mark, desktop navigation, and safe-area mobile navigation.
- Build the translator at `/` with conversation/writing modes, context-aware fixture examples, source swapping, demo recording flow, editing, ambiguity choices, simpler alternatives, copy/favorite/listen actions, and new-conversation reset.
- Add `/phrases` with searchable categorized phrase pairs and local favorites.
- Add `/history` with local persistence, seeded examples until real local activity exists, search, date groups, expandable details, single deletion, and clear confirmation.
- Add `/settings` with local larger-text and auto-read preferences, local-history clearing, and an about dialog.

## Visual direction
- Use a warm ivory, forest teal, mint, apricot, and charcoal semantic token system with Cairo typography.
- Keep cards softly rounded, borders crisp, shadows restrained, and motion subtle with reduced-motion support.
- Optimize the two-pane desktop translator and single-column 360–390px mobile layout without overflow.

## Technical details
- Keep all translation logic behind a typed local service interface and fixture data, ready to replace later.
- Persist favorites, history, and preferences only in `localStorage`; no network, account, microphone permission, or AI calls.
- Use browser speech synthesis only when available and show truthful fallback messaging.
- Add unique Arabic metadata to every content route, update project architecture notes, then verify build diagnostics and key desktop/mobile interactions.
