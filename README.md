# Mancala AI Agent

A game playing AI for the Mancala board game, built using the Minimax algorithm with Alpha-Beta pruning. 

## Overview

Mancala is a two-player turn-based strategy game. This AI agent plays optimally against a human or another agent by searching the game tree to a configurable depth, pruning branches that cannot influence the outcome, and selecting the move with the best evaluation score.


## How It Works

Minimax with Alpha-Beta Pruning

The agent uses Minimax, an algorithm that assumes both players play optimally. The maximising player (AI) tries to maximise the evaluation score; the minimising player (opponent) tries to minimise it.

Alpha-Beta pruning eliminates branches of the game tree that cannot affect the final decision, significantly reducing the number of nodes evaluated without changing the result.

```
minimax(state, depth, alpha, beta, maximising)
  if depth == 0 or terminal state:
      return evaluate(state)
  if maximising:
      for each move:
          value = minimax(child, depth-1, alpha, beta, False)
          alpha = max(alpha, value)
          if beta <= alpha: break  # prune
  else:
      for each move:
          value = minimax(child, depth-1, alpha, beta, True)
          beta = min(beta, value)
          if beta <= alpha: break  # prune
```
## Evaluation Function

The heuristic evaluates board states by considering:
- Seed count in the AI's store vs opponent's store
- Number of seeds on the AI's side vs opponent's side
- Bonus weighting for capturing moves and extra turns



## Features


-Minimax search with configurable depth
- Alpha-Beta pruning for efficient tree traversal
-Custom evaluation function balancing offensive and defensive play
- Human vs AI and AI vs AI modes
- Command-line interface



## Tech Stack


- Language: Python 3


## Getting Started
```
bash# Clone the repository
git clone https://github.com/Anoor1174/mancala-ai.git
cd mancala-ai

Run the game

python main.py

## Configuration

In main.py, adjust the search depth to control AI difficulty:

pythonDEPTH = 6  # Higher = stronger but slower (recommend 4–8)

```
## Project Structure
```
├── main.py          # Entry point — game loop and UI
├── board.py         # Board state, move validation, game rules
├── ai.py            # Minimax + Alpha-Beta pruning logic
└── evaluate.py      # Heuristic evaluation function
```

## Game Rules

Mancala is played on a board with 6 pits per player and one store each. On each turn, a player picks up all seeds from one of their pits and distributes them counter-clockwise, one per pit. Rules applied:
- Seeds landing in your store score a point
- Landing in your store on the last seed grants a bonus turn
- Landing in an empty pit on your side captures opponent's opposite seeds
- Game ends when one side is completely empty; remaining seeds go to the opponent's store
