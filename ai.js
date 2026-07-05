// ai.js
// Direct port of alphabeta_search() and ai_player() from mancala.ipynb.
// Kept separate from board.js (rules) and main.js (page/UI), same separation
// of concerns the notebook had between game logic and search logic.

// Runs minimax with alpha-beta pruning from `state`, down to `maxDepth` ply.
// Returns [value, move] where `value` is the search score and `move` is the
// best pit index found for the player to move at the root.
function alphabetaSearch(game, state, maxDepth = 6) {
  const player = state.toMove;
  game.nodesExplored = 0;

  function maxValue(s, alpha, beta, depth) {
    game.nodesExplored += 1;

    if (game.isTerminal(s) || depth >= maxDepth) {
      return [game.utility(s, player), null];
    }

    let v = -Infinity;
    let move = null;
    for (const a of game.actions(s)) {
      const [v2] = minValue(game.result(s, a), alpha, beta, depth + 1);
      if (v2 > v) {
        v = v2;
        move = a;
        alpha = Math.max(alpha, v);
      }
      if (v >= beta) return [v, move];
    }
    return [v, move];
  }

  function minValue(s, alpha, beta, depth) {
    game.nodesExplored += 1;

    if (game.isTerminal(s) || depth >= maxDepth) {
      return [game.utility(s, player), null];
    }

    let v = Infinity;
    let move = null;
    for (const a of game.actions(s)) {
      const [v2] = maxValue(game.result(s, a), alpha, beta, depth + 1);
      if (v2 < v) {
        v = v2;
        move = a;
        beta = Math.min(beta, v);
      }
      if (v <= alpha) return [v, move];
    }
    return [v, move];
  }

  return maxValue(state, -Infinity, Infinity, 0);
}

// Factory matching Python's ai_player(max_depth): returns a function that
// picks the AI's move for a given game/state.
function aiPlayer(maxDepth = 6) {
  return function (game, state) {
    const [, move] = alphabetaSearch(game, state, maxDepth);
    return move;
  };
}