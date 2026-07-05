// board.js
// Direct port of the `Mancala` class from mancala.ipynb.
// Holds the rules: starting position, legal moves, sowing, captures, and game-end scoring.
// No AI and no DOM code lives here on purpose, so this file matches board/game-state
// logic only, same as it was separated out conceptually in the notebook.

// A "state" is a plain object instead of Python's namedtuple:
// { pits: number[12], stores: [number, number], toMove: 0 | 1 }
// pits[0..5]  = player 0's pits, pits[6..11] = player 1's pits
// stores[0]   = player 0's store, stores[1] = player 1's store

class Mancala {
  constructor() {
    this.initial = {
      pits: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      stores: [0, 0],
      toMove: 0,
    };
    this.nodesExplored = 0; // used by ai.js to report search size, mirrors Python attribute
  }

  // Returns the list of legal pit indices for the player to move.
  actions(state) {
    if (this.isTerminal(state)) return [];

    if (state.toMove === 0) {
      return [0, 1, 2, 3, 4, 5].filter((i) => state.pits[i] > 0);
    }
    return [6, 7, 8, 9, 10, 11].filter((i) => state.pits[i] > 0);
  }

  // Plays `action` (a pit index) from `state` and returns the resulting new state.
  // This mirrors Python's result() one-to-one: sow stones, handle store landings,
  // apply the capture rule, then decide who moves next (extra turn on own-store landing).
  result(state, action) {
    const pits = state.pits.slice();
    const stores = state.stores.slice();
    const player = state.toMove;

    let stones = pits[action];
    pits[action] = 0;
    let position = action;
    let lastLanding = null;

    while (stones > 0) {
      position = (position + 1) % 12;

      if (position === 6 && player === 0) {
        stores[0] += 1;
        stones -= 1;
        lastLanding = "store0";
        if (stones === 0) break;
        continue;
      }

      if (position === 0 && player === 1) {
        stores[1] += 1;
        stones -= 1;
        lastLanding = "store1";
        if (stones === 0) break;
        continue;
      }

      pits[position] += 1;
      stones -= 1;
      lastLanding = position;
    }

    // Capture rule: last stone lands in an empty pit on your own side.
    if (typeof lastLanding === "number") {
      const ownSide = player === 0 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
      if (ownSide.includes(lastLanding) && pits[lastLanding] === 1) {
        const opposite = 11 - lastLanding;
        if (pits[opposite] > 0) {
          stores[player] += pits[lastLanding] + pits[opposite];
          pits[lastLanding] = 0;
          pits[opposite] = 0;
        }
      }
    }

    const extraTurn =
      (lastLanding === "store0" && player === 0) ||
      (lastLanding === "store1" && player === 1);
    const nextPlayer = extraTurn ? player : 1 - player;

    let newState = { pits, stores, toMove: nextPlayer };

    if (this.isTerminal(newState)) {
      newState = this._collectRemaining(newState);
    }

    return newState;
  }

  // Sweeps any stones left on a side into that side's store once the game has ended.
  _collectRemaining(state) {
    const pits = state.pits.slice();
    const stores = state.stores.slice();

    for (let i = 0; i < 6; i++) {
      stores[0] += pits[i];
      pits[i] = 0;
    }
    for (let i = 6; i < 12; i++) {
      stores[1] += pits[i];
      pits[i] = 0;
    }

    return { pits, stores, toMove: state.toMove };
  }

  isTerminal(state) {
    const p0Empty = [0, 1, 2, 3, 4, 5].every((i) => state.pits[i] === 0);
    const p1Empty = [6, 7, 8, 9, 10, 11].every((i) => state.pits[i] === 0);
    return p0Empty || p1Empty;
  }

  // Score of `player` minus opponent, from `player`'s point of view.
  // Used both as the terminal score and as the heuristic value at search cutoff.
  utility(state, player) {
    if (this.isTerminal(state)) {
      const final = this._collectRemaining(state);
      return final.stores[player] - final.stores[1 - player];
    }
    return state.stores[player] - state.stores[1 - player];
  }
}