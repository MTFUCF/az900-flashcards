# AZ-900 Flashcard Quiz App

Fast, repeatable AZ-900 exam drills with local progress tracking.

## Live demo

https://mtfucf.github.io/az900-flashcards/

## What it is

A no-build browser study tool for drilling AZ-900 concepts through short flashcard rounds, confidence checks, and lightweight progress memory in localStorage. The repo stays buildless on purpose so it is easy to review, easy to host on GitHub Pages, and easy to extend with more practice content.

## What it covers

- Cloud concepts such as public, private, and hybrid models, plus OpEx vs. CapEx
- Core Azure architecture, including regions, availability zones, subscriptions, and resource groups
- Common Azure services across compute, networking, storage, and identity
- Security, privacy, compliance, pricing, governance, and monitoring fundamentals

## Study workflow

- Filter by domain when you want to target a weak area
- Flip cards with Space or a tap/click
- Grade each answer as got it, close, or missed
- Revisit due cards automatically through lightweight spaced repetition

## How to run locally

```bash
cd az900-flashcards
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Push to GitHub

```bash
git init -b main
git config user.name "Matthew Faber"
git config user.email "MTFUCF@users.noreply.github.com"
git add .
git commit -m "Initial commit"
gh repo create MTFUCF/az900-flashcards --public --source=. --remote=origin --push --description "Fast, repeatable AZ-900 exam drills with local progress tracking."
```

## GitHub Pages

This repo includes `.github/workflows/deploy-pages.yml` for GitHub Pages.

1. Open repository settings.
2. Under Pages, set the source to GitHub Actions.
3. Push to `main` or run the workflow manually.
4. Open `https://mtfucf.github.io/az900-flashcards/` after deployment completes.

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- localStorage
- GitHub Pages

## Project structure

```text
.
├── .github/
├── data/
│   └── az900-flashcards.json
├── src/
│   └── app.js
├── styles/
│   └── main.css
├── README.md
└── index.html
```

## Notes

The question deck is original study content designed to reinforce the AZ-900 objective areas. It is not a dump of real exam questions.

## Author

**Matthew Faber**  


