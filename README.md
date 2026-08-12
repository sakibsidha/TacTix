# TacTix

A small browser-based arcade of classic games — Tic Tac Toe, Connect Four, and a reflex-testing Click Target game — built with plain HTML, CSS, and JavaScript (no frameworks, no build step). Both board games can be played against a friend or against an AI opponent powered by minimax with alpha-beta pruning.

**Play it live:** https://sakibsidha.github.io/TacTix/

## Features

- **Tic Tac Toe** — Player vs Player and Player vs AI modes
- **Connect Four** — Player vs Player and Player vs AI modes, AI uses iterative-deepening minimax with alpha-beta pruning and a heuristic board evaluator (not just a fixed-depth search)
- **Click Target** — a 30-second reflex mini-game
- Persistent scoreboards (wins/losses/draws, and best score for Click Target) saved to `localStorage`, so your stats survive a page refresh
- Background music per game, with an autoplay-safe toggle that respects browser autoplay policies
- Keyboard-accessible game boards (every cell/column is a real `<button>`, focusable and operable without a mouse)
- Responsive layout that scales down for mobile screens

## Tech stack

Vanilla HTML5, CSS3, and JavaScript (ES6+) — no frameworks or bundlers. Fonts and icons are pulled from Google Fonts (Pixelify Sans) and Font Awesome via CDN. Deployed as a static site on GitHub Pages.

## Project structure

```
TacTix/
├── index.html              # Landing page / game picker
├── shared.js                # Shared home-button, music-toggle, and localStorage stat helpers
├── style.css                 # Landing page styles
│
├── tictactoe.html / .css / app.js          # Tic Tac Toe (PvP)
├── tictactoe_ai.html / .css / app_ai.js    # Tic Tac Toe (vs AI)
│
├── connectfour.html / .css / connectfour.js       # Connect Four (PvP)
├── connectfour_ai.html / .css / connectfour_ai.js # Connect Four (vs AI)
│
├── click_target.html / click_target.css   # Click Target reflex game
└── *.mp3, *.png             # Audio and background art
```

## Running locally

No build tools or dependencies required — it's static HTML/CSS/JS. Any local static server works, for example:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500` in your browser. (Opening `index.html` directly as a `file://` URL also works, though some browsers restrict audio autoplay more aggressively over `file://`.)

## How the AI works

Both AI opponents use **minimax search with alpha-beta pruning**:

- **Tic Tac Toe AI** searches the full game tree (the board is small enough to solve exhaustively) and never loses.
- **Connect Four AI** uses **iterative deepening** within a time budget, combined with a heuristic evaluation function (scoring center control and 2/3-in-a-row windows) since the full game tree is too large to search exhaustively in real time. It also checks for immediate winning or blocking moves before falling back to search.

## License

Not currently licensed for reuse — all rights reserved by default. Reach out if you'd like to use this code.
