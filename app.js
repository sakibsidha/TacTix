let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let scoreboard = document.querySelector("#scoreboard");
let turn0 = true;

const STATS_KEY = "tactix_ttt_pvp_stats";
let stats = loadStats(STATS_KEY, { O: 0, X: 0, draws: 0 });

const winPatterns = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8]
];


const disableBoxes = () => {
  for (let box of boxes) {
    box.disabled = true;
  }
}

const enableBoxes = () => {
  for (let box of boxes) {
    box.disabled = false;
  }
}

const resetGame = () => {
  turn0 = true;
  enableBoxes();
  msgContainer.classList.add("hide");
  for (let box of boxes) {
    box.innerText = "";
  }
}

const renderScoreboard = () => {
  scoreboard.textContent = `O: ${stats.O}  |  X: ${stats.X}  |  Draws: ${stats.draws}`;
};

const showWinner = (winner) => {
  msg.innerText = `Congratulations, Winner is ${winner} !!!`;
  msgContainer.classList.remove("hide");
  disableBoxes();
  stats[winner]++;
  saveStats(STATS_KEY, stats);
  renderScoreboard();
};


const checkWinner = () => {
  let winnerFound = false;

  for (let pattern of winPatterns) {
    let pos1 = boxes[pattern[0]].innerText;
    let pos2 = boxes[pattern[1]].innerText;
    let pos3 = boxes[pattern[2]].innerText;

    if (pos1 !== "" && pos1 === pos2 && pos2 === pos3) {
      showWinner(pos1);
      winnerFound = true;
      return;
    }
  }

  let allFilled = [...boxes].every(box => box.innerText !== "");
  if (allFilled && !winnerFound) {
    msg.innerText = "It's a Draw!";
    msgContainer.classList.remove("hide");
    disableBoxes();
    stats.draws++;
    saveStats(STATS_KEY, stats);
    renderScoreboard();
  }
};


boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (turn0) {
      box.innerText = "O";
      turn0 = false;
    } else {
      box.innerText = "X";
      turn0 = true;
    }
    box.disabled = true;
    checkWinner();
  });
});

newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);

initHomeButton();
initMusicToggle();
renderScoreboard();