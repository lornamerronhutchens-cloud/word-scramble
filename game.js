const WORDS = {
  easy: [
    { word: 'TIME',  hint: 'What a clock measures' },
    { word: 'JUMP',  hint: 'Leap into the air' },
    { word: 'LAMP',  hint: 'Gives you light' },
    { word: 'FROG',  hint: 'Green amphibian' },
    { word: 'CAKE',  hint: 'Birthday treat' },
    { word: 'DRUM',  hint: 'Beat this instrument' },
    { word: 'SNOW',  hint: 'Falls in winter' },
    { word: 'SHIP',  hint: 'Sails the ocean' },
    { word: 'GLUE',  hint: 'Sticks things together' },
    { word: 'FISH',  hint: 'Lives underwater' },
    { word: 'PLUM',  hint: 'Purple stone fruit' },
    { word: 'GLOW',  hint: 'Soft radiant light' },
    { word: 'BRICK', hint: 'Used to build walls' },
    { word: 'CRANE', hint: 'Tall construction machine or bird' },
    { word: 'FROST', hint: 'Thin layer of ice' },
  ],
  medium: [
    { word: 'PLANET',  hint: 'Orbits a star' },
    { word: 'BRIDGE',  hint: 'Spans a gap or river' },
    { word: 'JUNGLE',  hint: 'Dense tropical forest' },
    { word: 'CANDLE',  hint: 'Wax and a wick' },
    { word: 'FLIGHT',  hint: 'Birds and planes do this' },
    { word: 'GRAVEL',  hint: 'Small stones underfoot' },
    { word: 'CASTLE',  hint: 'Medieval fortress' },
    { word: 'SILVER',  hint: 'Shiny precious metal' },
    { word: 'PYTHON',  hint: 'A snake or a programming language' },
    { word: 'FRESCO',  hint: 'Painting done on wet plaster' },
    { word: 'MARBLE',  hint: 'Stone or a small glass ball' },
    { word: 'NEEDLE',  hint: 'Used for sewing' },
    { word: 'PARROT',  hint: 'Colorful bird that mimics speech' },
    { word: 'WALLET',  hint: 'Holds your cards and cash' },
    { word: 'BLANKET', hint: 'Keeps you warm at night' },
  ],
  hard: [
    { word: 'ALCHEMY',   hint: 'Medieval pseudo-science of transformation' },
    { word: 'LABYRINTH',  hint: 'A complex maze' },
    { word: 'SPECTRUM',   hint: 'Range of colors in light' },
    { word: 'BLIZZARD',   hint: 'Severe snowstorm' },
    { word: 'CARNIVAL',   hint: 'Traveling fair with rides' },
    { word: 'DUNGEON',    hint: 'Underground prison' },
    { word: 'FRAGMENT',   hint: 'A broken-off piece' },
    { word: 'CHRONICLE',  hint: 'A detailed account of events' },
    { word: 'SCULPTOR',   hint: 'Artist who carves or shapes' },
    { word: 'TWILIGHT',   hint: 'The hour between sunset and dark' },
    { word: 'PHANTOM',    hint: 'A ghost or illusion' },
    { word: 'SOLSTICE',   hint: 'Longest or shortest day of the year' },
    { word: 'ABSTRACT',   hint: 'Existing in thought, not concrete' },
    { word: 'VERTIGO',    hint: 'Dizziness from heights' },
    { word: 'MONARCHY',   hint: 'Rule by a king or queen' },
  ],
};

const SETTINGS = {
  easy:   { time: 30, points: 1 },
  medium: { time: 20, points: 2 },
  hard:   { time: 15, points: 3 },
};

// DOM refs
const scrambledEl   = document.getElementById('scrambled-word');
const hintEl        = document.getElementById('hint-text');
const answerInput   = document.getElementById('answer-input');
const submitBtn     = document.getElementById('submit-btn');
const hintBtn       = document.getElementById('hint-btn');
const skipBtn       = document.getElementById('skip-btn');
const startBtn      = document.getElementById('start-btn');
const feedbackEl    = document.getElementById('feedback');
const timerBar      = document.getElementById('timer-bar');
const gameCard      = document.getElementById('game-card');
const scoreEl       = document.getElementById('score');
const bestEl        = document.getElementById('best');
const streakEl      = document.getElementById('streak');
const historyEl     = document.getElementById('history');
const difficultyEl  = document.getElementById('difficulty');

let score = 0, best = +localStorage.getItem('wsb') || 0, streak = 0;
let currentWord = '', currentHint = '', timeLeft = 0, totalTime = 0;
let timer = null, usedIndices = [];

bestEl.textContent = best;

function scramble(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Re-scramble if identical to original
  const result = arr.join('');
  return result === word && word.length > 1 ? scramble(word) : result;
}

function pickWord() {
  const diff = difficultyEl.value;
  const pool = WORDS[diff];
  if (usedIndices.length === pool.length) usedIndices = [];
  let idx;
  do { idx = Math.floor(Math.random() * pool.length); }
  while (usedIndices.includes(idx));
  usedIndices.push(idx);
  return pool[idx];
}

function startRound() {
  clearInterval(timer);
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  hintEl.textContent = '';
  answerInput.value = '';
  answerInput.className = '';
  answerInput.disabled = false;

  const diff = difficultyEl.value;
  const { time } = SETTINGS[diff];
  const entry = pickWord();
  currentWord = entry.word;
  currentHint = entry.hint;
  totalTime = time;
  timeLeft = time;

  scrambledEl.textContent = scramble(currentWord).split('').join(' ');
  timerBar.style.width = '100%';
  timerBar.classList.remove('warning');

  gameCard.classList.add('active');
  startBtn.textContent = 'New Word';
  difficultyEl.disabled = true;
  answerInput.focus();

  timer = setInterval(() => {
    timeLeft--;
    const pct = (timeLeft / totalTime) * 100;
    timerBar.style.width = pct + '%';
    if (pct < 30) timerBar.classList.add('warning');

    if (timeLeft <= 0) {
      clearInterval(timer);
      endRound(false, 'timeout');
    }
  }, 1000);
}

function endRound(won, reason) {
  clearInterval(timer);
  answerInput.disabled = true;

  if (won) {
    const pts = SETTINGS[difficultyEl.value].points;
    score += pts;
    streak++;
    scoreEl.textContent = score;
    streakEl.textContent = streak;
    if (score > best) { best = score; bestEl.textContent = best; localStorage.setItem('wsb', best); }
    feedbackEl.textContent = `Correct! +${pts} point${pts > 1 ? 's' : ''}`;
    feedbackEl.className = 'feedback correct';
    answerInput.className = 'correct';
    addHistory(true, currentWord);
  } else {
    streak = 0;
    streakEl.textContent = 0;
    if (reason === 'timeout') {
      feedbackEl.textContent = `Time's up! The word was ${currentWord}`;
      feedbackEl.className = 'feedback timeout';
    } else {
      feedbackEl.textContent = `The word was ${currentWord}`;
      feedbackEl.className = 'feedback wrong';
    }
    addHistory(false, currentWord);
  }
}

function addHistory(won, word) {
  const item = document.createElement('div');
  item.className = `history-item ${won ? 'win' : 'lose'}`;
  item.innerHTML = `<span>${word}</span><span>${won ? '✓' : '✗'}</span>`;
  historyEl.prepend(item);
}

function checkAnswer() {
  const val = answerInput.value.trim().toUpperCase();
  if (!val) return;
  if (val === currentWord) {
    endRound(true);
  } else {
    answerInput.classList.remove('shake');
    void answerInput.offsetWidth; // reflow to restart animation
    answerInput.classList.add('shake');
    feedbackEl.textContent = 'Not quite — try again';
    feedbackEl.className = 'feedback wrong';
  }
}

submitBtn.addEventListener('click', checkAnswer);

answerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkAnswer();
});

hintBtn.addEventListener('click', () => {
  hintEl.textContent = `Hint: ${currentHint}`;
});

skipBtn.addEventListener('click', () => {
  endRound(false, 'skip');
});

startBtn.addEventListener('click', () => {
  score = 0; streak = 0;
  scoreEl.textContent = 0; streakEl.textContent = 0;
  usedIndices = [];
  historyEl.innerHTML = '';
  startRound();
});
