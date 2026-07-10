# Manual Testing Guide

Project: **SC-900 Flashcard Quiz App**  
Baseline date: **2026-05-16**

## P0 — must pass before this repo is public
- [ ] The README title, tagline, live demo URL, and author block all match SC-900 Flashcard Quiz App.
- [ ] `index.html` loads from `python -m http.server 8080` with no broken relative links.
- [ ] The under-construction page clearly states the project name and credits Matthew Faber in the footer.
- [ ] No secrets, local-only files, or editor junk appear outside the `.gitignore` baseline.
- [ ] The placeholder deck area clearly signals where SC-900 flashcards, answer reveals, and score state will live.
- [ ] A future flashcard session can rely on localStorage without changing the documented project structure.
- [ ] The root page works correctly when served from a GitHub Pages subpath such as `/sc900-flashcards/`.
- [ ] README language makes it clear this is a study aid, not an official Microsoft exam product.

## P1 — should pass before first feature-complete share
- [ ] The landing page remains readable at 320px, 768px, and 1440px wide.
- [ ] Keyboard focus is visible and the placeholder page has a logical reading order.
- [ ] Chrome and Edge show no console errors on initial load.
- [ ] The README local-run instructions work exactly as written from the project root.
- [ ] Copy stays short enough that future flashcards will fit a single card view without scrolling on common laptop sizes.
- [ ] The planned localStorage behavior is described consistently across README and Copilot instructions.
- [ ] Visual hierarchy leaves room for deck selection, answer reveal, and progress feedback in a future iteration.
- [ ] The placeholder tone feels like a practical study tool rather than a marketing landing page.

## P2 — polish and follow-up checks
- [ ] A fresh screenshot can eventually be dropped into `docs/screenshot.png` without changing the README contract.
- [ ] The roadmap still reflects useful next iterations instead of vague wishlist items.
- [ ] The repo still feels intentionally lightweight, with no accidental build tooling added.
- [ ] The placeholder page looks acceptable in both light and dark system themes.
- [ ] Roadmap items stay focused on study effectiveness instead of adding unnecessary gamification.
- [ ] The README structure leaves a clean slot for a future screenshot from a real flashcard session.
- [ ] Future contributors can tell at a glance that this project should remain static and reviewable.
- [ ] The repo is ready for a later Cassian content pass without structural changes.
