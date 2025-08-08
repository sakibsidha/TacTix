// Connect Four vs AI (Minimax with alpha-beta, iterative deepening with time limit)
// Human = 'red', AI = 'yellow'

const rows = 6;
const cols = 7;
let board = [];
let currentPlayer = 'red';
let gameOver = false;
let isAITurn = false;

const boardEl = document.getElementById('board');
const msgContainer = document.querySelector('.msg-container');
const msg = document.getElementById('msg');
const resetBtn = document.getElementById('reset-btn');
const newBtn = document.getElementById('new-btn');

const HOME_BTN = document.getElementById('home-btn');
const musicBtn = document.getElementById('music-btn');
const audio = document.getElementById('bg-music');
let isPlaying = true;

// --- init UI handlers
HOME_BTN.addEventListener('click', () => window.location.href = 'index.html');
musicBtn.addEventListener('click', () => {
  if (isPlaying) audio.pause(); else audio.play();
  isPlaying = !isPlaying;
  musicBtn.querySelector('i').className = isPlaying ? "fas fa-music" : "fas fa-volume-mute";
});

// --- Board creation & helper
function createBoard() {
  board = Array.from({ length: rows }, () => Array(cols).fill(null));
  boardEl.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      boardEl.appendChild(cell);
    }
  }
}

// Return list of valid columns (0..6) that are not full
function getValidColumns(bd = board) {
  const valid = [];
  for (let c = 0; c < cols; c++) {
    if (!bd[0][c]) valid.push(c);
  }
  return valid;
}

function dropDiscInBoard(bd, col, player) {
  for (let r = rows - 1; r >= 0; r--) {
    if (!bd[r][col]) {
      bd[r][col] = player;
      return r; // row index where placed
    }
  }
  return -1;
}

function undoDropInBoard(bd, col) {
  for (let r = 0; r < rows; r++) {
    if (bd[r][col]) {
      bd[r][col] = null;
      return;
    }
  }
}

// Render board -> DOM classes
function renderBoard() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const el = boardEl.children[idx];
      el.classList.remove('red', 'yellow');
      if (board[r][c]) el.classList.add(board[r][c]);
    }
  }
}

// Checks if a player wins after placing at (r,c)
function checkWinOnBoard(bd, r, c, player) {
  if (!player) return false;
  const directions = [
    [[0,1],[0,-1]], // horiz
    [[1,0],[-1,0]], // vert
    [[1,1],[-1,-1]], // diag down-right
    [[1,-1],[-1,1]]  // diag down-left
  ];
  return directions.some(dir => {
    let count = 1;
    dir.forEach(([dr,dc]) => {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < rows && nc >= 0 && nc < cols && bd[nr][nc] === player) {
        count++; nr += dr; nc += dc;
      }
    });
    return count >= 4;
  });
}

// Full-board draw
function isBoardFull(bd) {
  return bd[0].every(cell => cell !== null);
}

// Message & reset control
function showWinner(text) {
  msg.innerText = text;
  msgContainer.classList.remove('hide');
}

function resetGame() {
  gameOver = false;
  isAITurn = false;
  currentPlayer = 'red';
  msgContainer.classList.add('hide');
  createBoard();
  renderBoard();
}

// --- Heuristic evaluation for a board from perspective of 'yellow' (AI)
function evaluateWindow(windowArr, player) {
  const opponent = player === 'yellow' ? 'red' : 'yellow';
  let score = 0;
  const countPlayer = windowArr.filter(x => x === player).length;
  const countOpp = windowArr.filter(x => x === opponent).length;
  const countEmpty = windowArr.filter(x => x === null).length;

  if (countPlayer === 4) score += 100000;
  else if (countPlayer === 3 && countEmpty === 1) score += 500;
  else if (countPlayer === 2 && countEmpty === 2) score += 50;

  if (countOpp === 3 && countEmpty === 1) score -= 800;
  else if (countOpp === 2 && countEmpty === 2) score -= 50;

  return score;
}

function evaluateBoard(bd) {
  let score = 0;
  const centerCol = Math.floor(cols / 2);
  let centerCount = 0;
  for (let r = 0; r < rows; r++) if (bd[r][centerCol] === 'yellow') centerCount++;
  score += centerCount * 6;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const windowArr = [bd[r][c], bd[r][c+1], bd[r][c+2], bd[r][c+3]];
      score += evaluateWindow(windowArr, 'yellow');
    }
  }
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 3; r++) {
      const windowArr = [bd[r][c], bd[r+1][c], bd[r+2][c], bd[r+3][c]];
      score += evaluateWindow(windowArr, 'yellow');
    }
  }
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const windowArr = [bd[r][c], bd[r+1][c+1], bd[r+2][c+2], bd[r+3][c+3]];
      score += evaluateWindow(windowArr, 'yellow');
    }
  }
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 3; c < cols; c++) {
      const windowArr = [bd[r][c], bd[r+1][c-1], bd[r+2][c-2], bd[r+3][c-3]];
      score += evaluateWindow(windowArr, 'yellow');
    }
  }
  return score;
}

// Terminal test: return 'yellow' | 'red' | 'draw' | null
function terminalState(bd) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p = bd[r][c];
      if (p && checkWinOnBoard(bd, r, c, p)) return p;
    }
  }
  if (isBoardFull(bd)) return 'draw';
  return null;
}

// Minimax with alpha-beta and depth limit
function minimax(bd, depth, alpha, beta, maximizingPlayer) {
  const term = terminalState(bd);
  if (depth === 0 || term !== null) {
    if (term === 'yellow') return {score: 1000000};
    else if (term === 'red') return {score: -1000000};
    else if (term === 'draw') return {score: 0};
    else return {score: evaluateBoard(bd)};
  }

  const validCols = getValidColumns(bd);
  // Move ordering: center-first
  validCols.sort((a, b) => Math.abs(b - Math.floor(cols/2)) - Math.abs(a - Math.floor(cols/2)));

  if (maximizingPlayer) {
    let value = -Infinity;
    let bestCol = validCols[0];
    for (const col of validCols) {
      const row = dropDiscInBoard(bd, col, 'yellow');
      const result = minimax(bd, depth - 1, alpha, beta, false);
      undoDropInBoard(bd, col);
      if (result.score > value) {
        value = result.score;
        bestCol = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return {score: value, column: bestCol};
  } else {
    let value = Infinity;
    let bestCol = validCols[0];
    for (const col of validCols) {
      const row = dropDiscInBoard(bd, col, 'red');
      const result = minimax(bd, depth - 1, alpha, beta, true);
      undoDropInBoard(bd, col);
      if (result.score < value) {
        value = result.score;
        bestCol = col;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return {score: value, column: bestCol};
  }
}

// Iterative deepening with time limit (ms)
function iterativeDeepening(bd, timeLimit = 1000) {
  const startTime = performance.now();
  let bestMove = null;
  let depth = 1;

  while (true) {
    if (performance.now() - startTime > timeLimit) break;
    const result = minimax(bd, depth, -Infinity, Infinity, true);
    if (performance.now() - startTime > timeLimit) break;
    if (result && typeof result.column !== 'undefined') bestMove = result;
    depth++;
  }

  return bestMove;
}

// AI move wrapper with async delay to prevent freezing
function aiMove() {
  if (gameOver) return;
  const valid = getValidColumns();
  if (valid.length === 0) return;

  // immediate winning move
  for (const col of valid) {
    const r = dropDiscInBoard(board, col, 'yellow');
    if (checkWinOnBoard(board, r, col, 'yellow')) {
      renderBoard(); 
      gameOver = true; 
      showWinner('AI (YELLOW) Wins!');
      return;
    }
    undoDropInBoard(board, col);
  }

  // immediate block opponent
  for (const col of valid) {
    const r = dropDiscInBoard(board, col, 'red');
    const oppWin = checkWinOnBoard(board, r, col, 'red');
    undoDropInBoard(board, col);
    if (oppWin) {
      const rr = dropDiscInBoard(board, col, 'yellow');
      renderBoard();
      if (checkWinOnBoard(board, rr, col, 'yellow')) {
        gameOver = true; 
        showWinner('AI (YELLOW) Wins!');
      }
      currentPlayer = 'red';
      isAITurn = false;
      return;
    }
  }

  // Run iterative deepening minimax asynchronously
  setTimeout(() => {
    const start = performance.now();
    const result = iterativeDeepening(board, 1000); // 1 second limit
    const chosenCol = (result && typeof result.column !== 'undefined') ? result.column : valid[Math.floor(Math.random() * valid.length)];
    const rr = dropDiscInBoard(board, chosenCol, 'yellow');
    renderBoard();

    if (checkWinOnBoard(board, rr, chosenCol, 'yellow')) {
      gameOver = true;
      showWinner('AI (YELLOW) Wins!');
    } else if (isBoardFull(board)) {
      gameOver = true;
      showWinner("It's a Draw!");
    } else {
      currentPlayer = 'red';
      isAITurn = false;
    }
    const end = performance.now();
    // console.log(`AI iterative deepening done in ${(end - start).toFixed(0)}ms`);
  }, 50);
}

// Player action
boardEl.addEventListener('click', (e) => {
  if (gameOver || isAITurn) return;
  const col = parseInt(e.target.dataset.col);
  if (isNaN(col)) return;
  const row = dropDiscInBoard(board, col, currentPlayer);
  if (row === -1) return; // column full
  renderBoard();

  if (checkWinOnBoard(board, row, col, currentPlayer)) {
    gameOver = true;
    showWinner(`Player (${currentPlayer.toUpperCase()}) Wins!`);
    return;
  } else if (isBoardFull(board)) {
    gameOver = true;
    showWinner("It's a Draw!");
    return;
  }

  // Switch to AI turn
  currentPlayer = 'yellow';
  isAITurn = true;
  aiMove();
});

// Reset button
resetBtn.addEventListener('click', () => {
  resetGame();
});

// New button (optional, same as reset)
newBtn.addEventListener('click', () => {
  resetGame();
});

// Initialize game on page load
resetGame();
