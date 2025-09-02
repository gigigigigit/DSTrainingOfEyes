import { createOddOneOut } from './modules/oddOneOut.js';
import { createTracking } from './modules/tracking.js';

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const menuEl = document.getElementById('menu');
const gameEl = document.getElementById('game');
const gameRoot = document.getElementById('game-root');
const backBtn = document.getElementById('backBtn');
const retryBtn = document.getElementById('retryBtn');

let state = {
  score: 0,
  level: 1,
  current: null,
};

const games = {
  oddOneOut: {
    title: '識別: まぎれもの探し',
    factory: createOddOneOut,
  },
  tracking: {
    title: '追跡: シャッフル追跡',
    factory: createTracking,
  }
};

function setScore(v) {
  state.score = Math.max(0, v|0);
  scoreEl.textContent = state.score;
}
function setLevel(v) {
  state.level = Math.min(5, Math.max(1, v|0));
  levelEl.textContent = state.level;
}

function showMenu() {
  teardownGame();
  menuEl.classList.remove('hidden');
  gameEl.classList.add('hidden');
}
function showGame() {
  menuEl.classList.add('hidden');
  gameEl.classList.remove('hidden');
}

function teardownGame() {
  if (state.current && state.current.destroy) {
    try { state.current.destroy(); } catch {}
  }
  state.current = null;
  gameRoot.innerHTML = '';
}

function startGame(key) {
  const meta = games[key];
  if (!meta) return;
  showGame();
  gameRoot.innerHTML = `<h3>${meta.title}</h3>`;
  const container = document.createElement('div');
  gameRoot.appendChild(container);

  const api = meta.factory({
    mount: container,
    level: state.level,
    onScore: (delta) => setScore(state.score + delta),
    onFinishedRound: (result) => {
      // noop for now; hooks for future session logic
    },
  });
  state.current = api;
}

// Menu wiring
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => startGame(btn.dataset.game));
});
document.querySelectorAll('.level-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setLevel(parseInt(btn.dataset.level, 10));
  });
});
// Default level button
document.querySelector('.level-btn[data-level="1"]').classList.add('active');

backBtn.addEventListener('click', showMenu);
retryBtn.addEventListener('click', () => {
  if (!state.current || !state.current.restart) return;
  state.current.restart();
});

// Init
setScore(0);
setLevel(1);
showMenu();

