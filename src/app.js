const STORAGE_KEYS = {
  progress: 'az900-flashcards-progress-v1',
  theme: 'az900-flashcards-theme-v1'
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DOMAIN_LABELS = {
  Cloud: 'Cloud Concepts',
  Architecture: 'Core Architectural Components',
  Services: 'Compute, Networking, and Storage',
  Security: 'Security, Privacy, and Compliance',
  Management: 'Management and Governance'
};
const DOMAIN_MAP = {
  'Cloud Concepts': 'Cloud',
  'Core Architectural Components': 'Architecture',
  'Compute, Networking, and Storage': 'Services',
  'Security, Privacy, and Compliance': 'Security',
  'Management and Governance': 'Management'
};

const state = {
  deck: [],
  progress: loadProgress(),
  mode: 'flashcards',
  testLength: 10,
  filter: 'all',
  currentCardId: null,
  flipped: false,
  currentBucket: '',
  test: {
    questions: [],
    currentIndex: 0,
    answered: 0,
    correct: 0,
    selectedChoice: null,
    revealed: false
  }
};

const elements = {
  themeToggle: document.querySelector('#themeToggle'),
  filterButtons: Array.from(document.querySelectorAll('[data-filter]')),
  modeButtons: Array.from(document.querySelectorAll('[data-mode]')),
  testLengthButtons: Array.from(document.querySelectorAll('[data-test-length]')),
  resetButton: document.querySelector('#resetProgress'),
  cardButton: document.querySelector('#cardButton'),
  cardBucket: document.querySelector('#cardBucket'),
  cardCount: document.querySelector('#cardCount'),
  domainPill: document.querySelector('#domainPill'),
  subdomain: document.querySelector('#subdomain'),
  question: document.querySelector('#questionText'),
  answerPanel: document.querySelector('#answerPanel'),
  answer: document.querySelector('#answerText'),
  rationale: document.querySelector('#rationaleText'),
  sourceLink: document.querySelector('#sourceLink'),
  gradeActions: document.querySelector('#gradeActions'),
  statusText: document.querySelector('#statusText'),
  progressSummary: document.querySelector('#progressSummary'),
  seenProgress: document.querySelector('#seenProgress'),
  masteryProgress: document.querySelector('#masteryProgress'),
  totalCards: document.querySelector('#totalCards'),
  dueCount: document.querySelector('#dueCount'),
  masteredCount: document.querySelector('#masteredCount'),
  testPanel: document.querySelector('#testPanel'),
  testProgress: document.querySelector('#testProgress'),
  testScore: document.querySelector('#testScore'),
  testQuestion: document.querySelector('#testQuestionText'),
  testChoices: document.querySelector('#testChoices'),
  testFeedback: document.querySelector('#testFeedback'),
  testAnswer: document.querySelector('#testAnswerText'),
  testRationale: document.querySelector('#testRationaleText'),
  testSourceLink: document.querySelector('#testSourceLink'),
  startTestButton: document.querySelector('#startTestButton'),
  nextQuestionButton: document.querySelector('#nextQuestionButton')
};

initializeTheme();
attachEvents();
loadDeck();

async function loadDeck() {
  try {
    const response = await fetch('data/az900-flashcards.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.deck = payload.flashcards.map((card) => ({
      ...card,
      shortDomain: DOMAIN_MAP[card.domain] || card.domain
    }));

    elements.totalCards.textContent = String(state.deck.length);
    ensureProgressShape();
    chooseNextCard();
    render();
  } catch (error) {
    elements.statusText.textContent = `Could not load the deck: ${error.message}`;
    elements.cardButton.disabled = true;
  }
}

function attachEvents() {
  elements.modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.mode = button.dataset.mode;

      if (state.mode === 'test') {
        startTestSession();
      } else {
        state.flipped = false;
        chooseNextCard();
      }

      render();
    });
  });

  elements.testLengthButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.testLength = Number(button.dataset.testLength);

      if (state.mode === 'test') {
        startTestSession();
      }

      render();
    });
  });

  elements.filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.filter = button.dataset.filter;
      state.currentCardId = null;
      state.flipped = false;

      if (state.mode === 'test') {
        startTestSession();
      } else {
        chooseNextCard();
      }

      render();
    });
  });

  elements.cardButton.addEventListener('click', () => {
    if (!state.currentCardId || state.flipped) {
      return;
    }

    state.flipped = true;
    render();
  });

  document.querySelectorAll('[data-grade]').forEach((button) => {
    button.addEventListener('click', () => applyGrade(button.dataset.grade));
  });

  elements.startTestButton.addEventListener('click', () => {
    startTestSession();
    render();
  });

  elements.nextQuestionButton.addEventListener('click', () => {
    advanceTestQuestion();
    render();
  });

  elements.resetButton.addEventListener('click', () => {
    const confirmed = window.confirm('Reset all AZ-900 spaced-repetition progress?');
    if (!confirmed) {
      return;
    }

    state.progress = {};
    saveProgress();
    state.currentCardId = null;
    state.flipped = false;
    ensureProgressShape();
    chooseNextCard();
    render();
  });

  document.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLElement) {
      const tag = event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable) {
        return;
      }
    }

    if (event.code === 'Space') {
      event.preventDefault();
      if (state.mode === 'flashcards' && state.currentCardId && !state.flipped) {
        state.flipped = true;
        render();
      }
      return;
    }

    if (state.mode === 'test') {
      const choiceIndex = Number(event.key) - 1;
      if (choiceIndex >= 0 && choiceIndex < 4) {
        event.preventDefault();
        selectTestChoice(choiceIndex);
        render();
      }
      return;
    }

    if (!state.flipped) {
      return;
    }

    const keyMap = {
      '1': 'got-it',
      '2': 'close',
      '3': 'missed'
    };
    const grade = keyMap[event.key];
    if (grade) {
      event.preventDefault();
      applyGrade(grade);
    }
  });
}

function chooseNextCard() {
  const candidates = getFilteredDeck();
  const now = Date.now();

  if (!candidates.length) {
    state.currentCardId = null;
    state.currentBucket = 'No cards in this filter';
    return;
  }

  const fresh = candidates.filter((card) => getCardProgress(card).attempts === 0);
  if (fresh.length) {
    state.currentCardId = fresh[0].id;
    state.currentBucket = `New card · ${fresh.length} remaining`;
    return;
  }

  const due = candidates
    .filter((card) => getCardProgress(card).nextDue <= now)
    .sort((left, right) => getCardProgress(left).nextDue - getCardProgress(right).nextDue);

  if (due.length) {
    state.currentCardId = due[0].id;
    state.currentBucket = `Due now · ${due.length} ready`;
    return;
  }

  const upcoming = candidates
    .slice()
    .sort((left, right) => getCardProgress(left).nextDue - getCardProgress(right).nextDue);

  state.currentCardId = upcoming[0].id;
  state.currentBucket = 'Ahead of schedule · earliest upcoming review';
}

function startTestSession() {
  const candidates = shuffleArray(getFilteredDeck().slice());
  const sessionLength = Math.min(state.testLength, candidates.length);

  state.test.questions = candidates.slice(0, sessionLength).map((card) => buildTestQuestion(card));
  state.test.currentIndex = 0;
  state.test.answered = 0;
  state.test.correct = 0;
  state.test.selectedChoice = null;
  state.test.revealed = false;
}

function buildTestQuestion(card) {
  const distractorPool = state.deck
    .filter((candidate) => candidate.id !== card.id && candidate.answer !== card.answer)
    .sort((left, right) => {
      const leftScore = left.shortDomain === card.shortDomain ? 0 : 1;
      const rightScore = right.shortDomain === card.shortDomain ? 0 : 1;
      return leftScore - rightScore;
    });

  const distractors = shuffleArray(distractorPool.slice()).slice(0, 3).map((candidate) => candidate.answer);
  const choices = shuffleArray([
    { text: card.answer, isCorrect: true },
    ...distractors.map((text) => ({ text, isCorrect: false }))
  ]);

  return {
    id: card.id,
    question: card.question,
    shortDomain: card.shortDomain,
    subdomain: card.subdomain,
    answer: card.answer,
    rationale: card.rationale,
    source: card.source,
    choices
  };
}

function advanceTestQuestion() {
  if (state.test.currentIndex < state.test.questions.length - 1) {
    state.test.currentIndex += 1;
    state.test.selectedChoice = null;
    state.test.revealed = false;
    return;
  }

  startTestSession();
}

function selectTestChoice(choiceIndex) {
  const currentQuestion = getCurrentTestQuestion();
  if (!currentQuestion || state.test.revealed) {
    return;
  }

  const choice = currentQuestion.choices[choiceIndex];
  if (!choice) {
    return;
  }

  state.test.selectedChoice = choiceIndex;
  state.test.revealed = true;
  state.test.answered += 1;

  if (choice.isCorrect) {
    state.test.correct += 1;
  }
}

function applyGrade(grade) {
  const card = getCurrentCard();
  if (!card) {
    return;
  }

  const entry = getCardProgress(card);
  const now = Date.now();

  if (grade === 'got-it') {
    if (entry.repetitions === 0) {
      entry.interval = 1;
    } else if (entry.repetitions === 1) {
      entry.interval = 3;
    } else {
      entry.interval = Math.max(entry.interval + 1, Math.round(entry.interval * entry.easeFactor));
    }
    entry.easeFactor = Number((entry.easeFactor + 0.15).toFixed(2));
    entry.repetitions += 1;
    entry.gotItStreak += 1;
  }

  if (grade === 'close') {
    entry.interval = entry.repetitions === 0 ? 1 : Math.max(1, Math.round(entry.interval * 1.3));
    entry.easeFactor = Math.max(1.3, Number((entry.easeFactor - 0.05).toFixed(2)));
    entry.repetitions += 1;
    entry.gotItStreak = 0;
  }

  if (grade === 'missed') {
    entry.interval = 1;
    entry.easeFactor = Math.max(1.3, Number((entry.easeFactor - 0.2).toFixed(2)));
    entry.repetitions = 0;
    entry.gotItStreak = 0;
  }

  entry.attempts += 1;
  entry.lastGrade = grade;
  entry.lastSeen = now;
  entry.nextDue = now + entry.interval * DAY_MS;

  saveProgress();
  state.flipped = false;
  chooseNextCard();
  render();
}

function render() {
  renderModeButtons();
  renderMetrics();

  if (state.mode === 'test') {
    renderTestMode();
    return;
  }

  renderFlashcardMode();
}

function renderModeButtons() {
  elements.modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === state.mode;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  elements.testLengthButtons.forEach((button) => {
    const isActive = Number(button.dataset.testLength) === state.testLength;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function renderMetrics() {
  const currentCard = getCurrentCard();
  const filteredDeck = getFilteredDeck();
  const dueNow = filteredDeck.filter((card) => getCardProgress(card).attempts > 0 && getCardProgress(card).nextDue <= Date.now()).length;
  const seen = state.deck.filter((card) => getCardProgress(card).attempts > 0).length;
  const mastered = state.deck.filter((card) => getCardProgress(card).gotItStreak >= 3).length;

  elements.filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === state.filter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  elements.progressSummary.textContent = `Seen ${seen} of ${state.deck.length} cards · Mastered ${mastered}`;
  elements.seenProgress.max = Math.max(1, state.deck.length);
  elements.seenProgress.value = seen;
  elements.masteryProgress.max = Math.max(1, state.deck.length);
  elements.masteryProgress.value = mastered;
  elements.dueCount.textContent = String(dueNow);
  elements.masteredCount.textContent = String(mastered);
  elements.cardBucket.textContent = state.currentBucket;
  elements.cardCount.textContent = `${filteredDeck.length} card${filteredDeck.length === 1 ? '' : 's'} in view`;

  return { currentCard, filteredDeck };
}

function renderFlashcardMode() {
  const { currentCard } = renderMetrics();

  elements.cardButton.hidden = false;
  elements.testPanel.hidden = true;

  if (!currentCard) {
    elements.cardButton.disabled = true;
    elements.cardButton.setAttribute('aria-expanded', 'false');
    elements.domainPill.textContent = 'No card loaded';
    elements.subdomain.textContent = 'Adjust the filter or reset progress.';
    elements.question.textContent = 'No cards match the current filter.';
    elements.answerPanel.hidden = true;
    elements.gradeActions.hidden = true;
    return;
  }

  const progress = getCardProgress(currentCard);
  elements.cardButton.disabled = false;
  elements.cardButton.setAttribute('aria-expanded', String(state.flipped));
  elements.domainPill.textContent = currentCard.shortDomain;
  elements.subdomain.textContent = currentCard.subdomain;
  elements.question.textContent = currentCard.question;
  elements.answer.textContent = currentCard.answer;
  elements.rationale.textContent = currentCard.rationale;
  elements.sourceLink.href = currentCard.source;
  elements.sourceLink.textContent = 'Microsoft Learn source';

  if (state.flipped) {
    elements.answerPanel.hidden = false;
    elements.gradeActions.hidden = false;
    elements.statusText.textContent = `Interval ${progress.interval || 0} day(s) · Ease ${progress.easeFactor.toFixed(2)} · Streak ${progress.gotItStreak}`;
  } else {
    elements.answerPanel.hidden = true;
    elements.gradeActions.hidden = true;
    elements.statusText.textContent = 'Press Space or tap the card to flip it.';
  }
}

function renderTestMode() {
  const filteredDeck = getFilteredDeck();
  const currentQuestion = getCurrentTestQuestion();

  elements.cardButton.hidden = true;
  elements.answerPanel.hidden = true;
  elements.gradeActions.hidden = true;
  elements.testPanel.hidden = false;

  elements.cardBucket.textContent = filteredDeck.length
    ? `Practice test · ${Math.min(state.testLength, filteredDeck.length)} question session`
    : 'No cards in this filter';
  elements.cardCount.textContent = `${filteredDeck.length} card${filteredDeck.length === 1 ? '' : 's'} available`;

  if (!filteredDeck.length) {
    elements.testProgress.textContent = 'Practice test';
    elements.testScore.textContent = 'Score 0/0';
    elements.testQuestion.textContent = 'No cards match the current filter.';
    elements.testChoices.innerHTML = '';
    elements.testFeedback.hidden = true;
    elements.nextQuestionButton.hidden = true;
    elements.startTestButton.hidden = false;
    elements.statusText.textContent = 'Choose another domain filter to build a practice test.';
    return;
  }

  if (!currentQuestion) {
    startTestSession();
    renderTestMode();
    return;
  }

  const questionNumber = state.test.currentIndex + 1;
  const totalQuestions = state.test.questions.length;
  const selectedChoice = currentQuestion.choices[state.test.selectedChoice] || null;
  const correctChoice = currentQuestion.choices.find((choice) => choice.isCorrect) || null;

  elements.testProgress.textContent = `Question ${questionNumber} of ${totalQuestions}`;
  elements.testScore.textContent = `Score ${state.test.correct}/${state.test.answered}`;
  elements.testQuestion.textContent = currentQuestion.question;
  elements.testChoices.innerHTML = '';

  currentQuestion.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-button';
    button.textContent = `${index + 1}. ${choice.text}`;

    if (state.test.revealed) {
      button.disabled = true;
      if (choice.isCorrect) {
        button.classList.add('is-correct');
      }
      if (state.test.selectedChoice === index && !choice.isCorrect) {
        button.classList.add('is-wrong');
      }
    }

    button.addEventListener('click', () => {
      selectTestChoice(index);
      render();
    });

    elements.testChoices.append(button);
  });

  if (state.test.revealed) {
    elements.testFeedback.hidden = false;
    elements.testAnswer.textContent = `${selectedChoice?.isCorrect ? 'Correct.' : 'Not quite.'} ${correctChoice?.text || currentQuestion.answer}`;
    elements.testRationale.textContent = currentQuestion.rationale;
    elements.testSourceLink.href = currentQuestion.source;
    elements.nextQuestionButton.hidden = false;
    elements.startTestButton.hidden = true;
    elements.statusText.textContent = selectedChoice?.isCorrect
      ? 'Correct. Move to the next question when ready.'
      : 'Review the explanation, then continue to the next question.';
  } else {
    elements.testFeedback.hidden = true;
    elements.nextQuestionButton.hidden = true;
    elements.startTestButton.hidden = false;
    elements.startTestButton.textContent = 'Restart practice test';
    elements.statusText.textContent = 'Select the best answer or use keys 1-4.';
  }
}

function getFilteredDeck() {
  if (state.filter === 'all') {
    return state.deck;
  }
  return state.deck.filter((card) => card.shortDomain === state.filter);
}

function getCurrentTestQuestion() {
  return state.test.questions[state.test.currentIndex] || null;
}

function shuffleArray(items) {
  const clone = items.slice();
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function getCurrentCard() {
  return state.deck.find((card) => card.id === state.currentCardId) || null;
}

function ensureProgressShape() {
  state.deck.forEach((card) => {
    getCardProgress(card);
  });
  saveProgress();
}

function getCardProgress(card) {
  if (!state.progress[card.id]) {
    state.progress[card.id] = {
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      gotItStreak: 0,
      attempts: 0,
      nextDue: 0,
      lastGrade: 'new',
      lastSeen: 0
    };
  }
  return state.progress[card.id];
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.progress)) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state.progress));
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.dataset.theme = savedTheme;
  }
  syncThemeButton();

  elements.themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
    syncThemeButton();
  });
}

function syncThemeButton() {
  const currentTheme = document.documentElement.dataset.theme || 'system';
  elements.themeToggle.textContent = currentTheme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode';
}
