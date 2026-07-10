# Copilot instructions for AZ-900 Flashcard Quiz App

AZ-900 Flashcard Quiz App is a focused cloud fundamentals study project owned by Matthew Faber. The goal is straightforward: a no-build browser study tool for drilling AZ-900 concepts through short flashcard rounds, confidence checks, and lightweight progress memory in localStorage. Deployment target is GitHub Pages. The stack is HTML5, CSS3, Vanilla JavaScript, localStorage, GitHub Pages. Keep the repo easy to review, easy to explain, and easy to deploy from a clean branch.

When helping here, bias toward the smallest useful implementation. Preserve the deliberate no-build-step approach for the frontend. If the project uses Azure Functions, keep Node tooling isolated to `api/` and do not introduce root-level package management. Prefer plain HTML, CSS, and vanilla JavaScript that reads clearly.

What Copilot should help with:
- Expand flashcard navigation, reveal-answer states, and score summaries without adding framework overhead.
- Keep study data in a simple JSON shape that can be reviewed for technical accuracy.
- Improve accessibility, keyboard shortcuts, and responsive card layout for quick mobile practice.

Domain guardrail: The content tone should stay exam-prep oriented: concise, specific, and accurate about Azure cloud fundamentals. Treat copy, labels, and examples as reviewable study content, not filler text.

What to avoid:
- Do not introduce React, bundlers, or `package.json` for the static app shell.
- Do not turn the flashcard data into opaque generated blobs; keep it hand-reviewable.
- Do not mix AZ-900 study objectives with unrelated exam material.

Keep README examples, testing steps, and placeholder UI text aligned whenever scope changes. This project has no secret-bearing runtime configuration in-repo. If you add data files later, keep them human-readable and stable so Matthew or another reviewer can audit the content without reverse engineering generated output.
