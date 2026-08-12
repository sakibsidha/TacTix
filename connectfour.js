const rows = 6;
const cols = 7;
let board = [];
let currentPlayer = 'red';
let gameOver = false;

const boardEl = document.getElementById('board');
const msgContainer = document.querySelector('.msg-container');
const msg = document.getElementById('msg');
const resetBtn = document.getElementById('reset-btn');
const newBtn = document.getElementById('new-btn');
const scoreboard = document.getElementById('scoreboard');

const STATS_KEY = 'tactix_c4_pvp_stats';
let stats = loadStats(STATS_KEY, { red: 0, yellow: 0, draws: 0 });

function renderScoreboard() {
  scoreboard.textContent = `Red: ${stats.red}  |  Yellow: ${stats.yellow}  |  Draws: ${stats.draws}`;
}

function createBoard() {
  board = Array.from({ length: rows }, () => Array(cols).fill(null));
  boardEl.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.classList.add('cell');
      cell.dataset.col = c;
      cell.setAttribute('aria-label', `Column ${c + 1}`);
      boardEl.appendChild(cell);
    }
  }
}

function dropDisc(col) {
  if (gameOver) return;
  for (let r = rows - 1; r >= 0; r--) {
    if (!board[r][col]) {
      board[r][col] = currentPlayer;
      const cellIndex = r * cols + col;
      boardEl.children[cellIndex].classList.add(currentPlayer);
      if (checkWin(r, col)) {
        showWinner(`${currentPlayer.toUpperCase()} Wins!`);
        gameOver = true;
        stats[currentPlayer]++;
        saveStats(STATS_KEY, stats);
        renderScoreboard();
      } else if (board.flat().every(cell => cell)) {
        showWinner("It's a Draw!");
        gameOver = true;
        stats.draws++;
        saveStats(STATS_KEY, stats);
        renderScoreboard();
      } else {
        currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
      }
      break;
    }
  }
}

function checkWin(r, c) {
  const directions = [
    [[0,1], [0,-1]], // horizontal
    [[1,0], [-1,0]], // vertical
    [[1,1], [-1,-1]], // diagonal down-right
    [[1,-1], [-1,1]]  // diagonal down-left
  ];
  return directions.some(dir => {
    let count = 1;
    dir.forEach(([dr, dc]) => {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === currentPlayer) {
        count++;
        nr += dr;
        nc += dc;
      }
    });
    return count >= 4;
  });
}

function showWinner(text) {
  msg.innerText = text;
  msgContainer.classList.remove('hide');
}

function resetGame() {
  gameOver = false;
  currentPlayer = 'red';
  msgContainer.classList.add('hide');
  createBoard();
}

// Event delegation for clicking columns
boardEl.addEventListener('click', (e) => {
  const col = e.target.dataset.col;
  if (col !== undefined) {
    dropDisc(parseInt(col));
  }
});

resetBtn.addEventListener('click', resetGame);
newBtn.addEventListener('click', resetGame);

initHomeButton();
initMusicToggle();

// Init
createBoard();
renderScoreboard();
