// main.js
// Glues board.js (rules) and ai.js (search) to the page. No game rules live
// here — this file only renders state and reacts to clicks/turns.

const HUMAN = 0;
const AI = 1;

const game = new Mancala();
let state = game.initial;
let aiThinking = false;

const rowTopEl = document.getElementById("row-top");
const rowBottomEl = document.getElementById("row-bottom");
const storeP0CountEl = document.getElementById("store-p0-count");
const storeP1CountEl = document.getElementById("store-p1-count");
const statusEl = document.getElementById("status-text");
const difficultyEl = document.getElementById("difficulty");
const newGameBtn = document.getElementById("new-game");

// Top row is player 1's pits, shown right-to-left (11 -> 6) so the board
// reads as one continuous counter-clockwise loop between the two stores.
const TOP_ROW_ORDER = [11, 10, 9, 8, 7, 6];
const BOTTOM_ROW_ORDER = [0, 1, 2, 3, 4, 5];

function buildPits() {
  rowTopEl.innerHTML = "";
  rowBottomEl.innerHTML = "";

  for (const i of TOP_ROW_ORDER) rowTopEl.appendChild(makePitEl(i));
  for (const i of BOTTOM_ROW_ORDER) rowBottomEl.appendChild(makePitEl(i));
}

function makePitEl(index) {
  const pit = document.createElement("div");
  pit.className = "pit";
  pit.dataset.index = String(index);

  const cluster = document.createElement("div");
  cluster.className = "seed-cluster";
  pit.appendChild(cluster);

  const count = document.createElement("span");
  count.className = "pit-count";
  pit.appendChild(count);

  pit.addEventListener("click", () => onPitClick(index));
  return pit;
}

function render() {
  for (const el of document.querySelectorAll(".pit")) {
    const i = Number(el.dataset.index);
    const n = state.pits[i];

    const cluster = el.querySelector(".seed-cluster");
    cluster.innerHTML = "";
    const visible = Math.min(n, 12);
    for (let s = 0; s < visible; s++) {
      const seed = document.createElement("span");
      seed.className = "seed";
      cluster.appendChild(seed);
    }
    el.querySelector(".pit-count").textContent = n > 12 ? String(n) : "";

    const isHumanPit = i >= 0 && i <= 5;
    const playable =
      !aiThinking &&
      state.toMove === HUMAN &&
      isHumanPit &&
      game.actions(state).includes(i);
    el.classList.toggle("playable", playable);
  }

  updateStore(storeP0CountEl, state.stores[0]);
  updateStore(storeP1CountEl, state.stores[1]);
}

function updateStore(el, value) {
  const changed = el.textContent !== String(value);
  el.textContent = value;
  if (changed) {
    el.classList.remove("bump");
    void el.offsetWidth; // restart animation
    el.classList.add("bump");
  }
}

function setStatus(text) {
  statusEl.textContent = text;
}

function onPitClick(index) {
  if (aiThinking) return;
  if (state.toMove !== HUMAN) return;
  if (!game.actions(state).includes(index)) return;

  const turnBefore = state.toMove;
  state = game.result(state, index);
  render();

  if (game.isTerminal(state)) {
    announceWinner();
    return;
  }

  if (state.toMove === turnBefore) {
    setStatus("You landed in your store — go again.");
    render();
    return;
  }

  setStatus("AI is thinking...");
  window.setTimeout(runAiTurn, 350);
}

function runAiTurn() {
  if (game.isTerminal(state)) {
    announceWinner();
    return;
  }
  if (state.toMove !== AI) {
    setStatus("Your turn — pick a pit on your row.");
    render();
    return;
  }

  aiThinking = true;
  render();

  const depth = Number(difficultyEl.value);
  // Small delay so back-to-back AI extra-turns still feel like discrete moves.
  window.setTimeout(() => {
    const [, move] = alphabetaSearch(game, state, depth);
    state = game.result(state, move);
    aiThinking = false;
    render();

    if (game.isTerminal(state)) {
      announceWinner();
    } else if (state.toMove === AI) {
      setStatus("AI landed in its store — it goes again.");
      window.setTimeout(runAiTurn, 500);
    } else {
      setStatus("Your turn — pick a pit on your row.");
    }
  }, 400);
}

function announceWinner() {
  const finalState = game._collectRemaining(state);
  state = finalState;
  render();

  const you = finalState.stores[0];
  const ai = finalState.stores[1];

  if (you > ai) setStatus(`You win, ${you} to ${ai}!`);
  else if (ai > you) setStatus(`AI wins, ${ai} to ${you}. Try again?`);
  else setStatus(`Draw, ${you} to ${ai}.`);
}

function newGame() {
  state = game.initial;
  aiThinking = false;
  setStatus("Your turn — pick a pit on your row.");
  render();
}

newGameBtn.addEventListener("click", newGame);

buildPits();
render();
setStatus("Your turn — pick a pit on your row.");