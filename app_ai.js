let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let scoreboard = document.querySelector("#scoreboard");
let turn0 = true; // human = O, computer = X
let gameOver = false;

const STATS_KEY = "tactix_ttt_ai_stats";
let stats = loadStats(STATS_KEY, { you: 0, ai: 0, draws: 0 });

const renderScoreboard = () => {
  scoreboard.textContent = `You: ${stats.you}  |  AI: ${stats.ai}  |  Draws: ${stats.draws}`;
};

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const disableBoxes = () => boxes.forEach(box => box.disabled = true);
const enableBoxes = () => boxes.forEach(box => {
  if (box.innerText === "") box.disabled = false;
});

const resetGame = () => {
  turn0 = true;
  gameOver = false;
  boxes.forEach(box => {
    box.innerText = "";
    box.disabled = false;
  });
  msgContainer.classList.add("hide");
};
const getWinner = (board) => {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell !== "")) return "Draw";
  return null;
};

const checkWinnerAndDisplay = () => {
  const board = Array.from(boxes).map(box => box.innerText);
  const result = getWinner(board);
  if (result === "X" || result === "O") {
    showWinner(result);
    return true;
  } else if (result === "Draw") {
    msg.innerText = "It's a Draw!";
    msgContainer.classList.remove("hide");
    gameOver = true;
    stats.draws++;
    saveStats(STATS_KEY, stats);
    renderScoreboard();
    return true;
  }
  return false;
};

const showWinner = (winner) => {
  if (winner == "X") {
    msg.innerText = `Ooops, AI Won !!!`;
    stats.ai++;
  } else {
    msg.innerText = `Congratulations, you won!`;
    stats.you++;
  }
  msgContainer.classList.remove("hide");
  disableBoxes();
  gameOver = true;
  saveStats(STATS_KEY, stats);
  renderScoreboard();
};

const computerMove = () => {
  const board = Array.from(boxes).map(box => box.innerText);
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "X";
      let score = minimax(board, 0, false, -Infinity, Infinity);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  if (move !== -1) {
    boxes[move].innerText = "X";
    boxes[move].disabled = true;
    if (!checkWinnerAndDisplay()) turn0 = true;
  }
};

const minimax = (board, depth, isMax, alpha, beta) => {
  const result = getWinner(board);
  if (result !== null) {
    if (result === "X") return 10 - depth;
    else if (result === "O") return depth - 10;
    else return 0;
  }

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        let score = minimax(board, depth + 1, false, alpha, beta);
        board[i] = "";
        best = Math.max(best, score);
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, depth + 1, true, alpha, beta);
        board[i] = "";
        best = Math.min(best, score);
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
};

boxes.forEach((box, index) => {
  box.addEventListener("click", () => {
    if (box.innerText === "" && turn0 && !gameOver) {
      box.innerText = "O";
      box.disabled = true;
      if (!checkWinnerAndDisplay()) {
        turn0 = false;
        setTimeout(() => {
          if (!gameOver) computerMove();
        }, 400);
      }
    }
  });
});

resetBtn.addEventListener("click", resetGame);
newGameBtn.addEventListener("click", resetGame);

initHomeButton();
initMusicToggle();
renderScoreboard();
