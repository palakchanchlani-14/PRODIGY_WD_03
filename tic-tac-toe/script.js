const cells = document.querySelectorAll(".cell");
const resetButton = document.getElementById("reset");
const modeSelector = document.getElementById("mode");
const scoreDisplay = document.getElementById("scoreboard");
let currentPlayer = localStorage.getItem("currentPlayer") || "X";
let boardState = JSON.parse(localStorage.getItem("boardState")) || Array(9).fill("");
let scores = JSON.parse(localStorage.getItem("scores")) || { X: 0, O: 0 };
let gameMode = localStorage.getItem("gameMode") || "Human"; 

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// 🏆 **Restore Game State Correctly**
function restoreGameState() {
    boardState.forEach((val, index) => {
        cells[index].textContent = val;
    });
    scoreDisplay.innerHTML = `X: ${scores.X} | O: ${scores.O}`;
}
restoreGameState();

modeSelector.value = gameMode;
modeSelector.addEventListener("change", () => {
    gameMode = modeSelector.value;
    localStorage.setItem("gameMode", gameMode);
    resetGame();
});

cells.forEach(cell => {
    cell.addEventListener("click", () => {
        const index = cell.dataset.index;

        if (!boardState[index]) {
            boardState[index] = currentPlayer;
            cell.textContent = currentPlayer;
            localStorage.setItem("boardState", JSON.stringify(boardState));

            if (checkWinner()) return;

            currentPlayer = currentPlayer === "X" ? "O" : "X";
            localStorage.setItem("currentPlayer", currentPlayer);

            // 🧠 **AI Move in AI Mode**
            if (gameMode === "AI" && currentPlayer === "O") {
                setTimeout(() => {
                    let bestMove = findBestMove();
                    boardState[bestMove] = currentPlayer;
                    cells[bestMove].textContent = currentPlayer;
                    localStorage.setItem("boardState", JSON.stringify(boardState));

                    checkWinner();
                    currentPlayer = "X";
                    localStorage.setItem("currentPlayer", currentPlayer);
                }, 500);
            }
        }
    });
});

// 🏆 **Check Winner & Apply Animation**
function checkWinner() {
    let winnerFound = false;
    
    winningCombinations.forEach(combination => {
        if (combination.every(index => boardState[index] === currentPlayer)) {
            winnerFound = true;
            combination.forEach(index => cells[index].classList.add("winning"));
        }
    });

    if (winnerFound) {
        scores[currentPlayer]++;
        localStorage.setItem("scores", JSON.stringify(scores));
        showWinnerMessage(`${currentPlayer} has won! 🎉`);
        return true;
    }

    if (!boardState.includes("")) {
        showWinnerMessage("It's a Draw! 🤝");
        return true;
    }

    return false;
}

// 🔥 **AI Move Logic (Minimax Algorithm)**
function findBestMove() {
    let bestScore = -Infinity;
    let move;

    boardState.forEach((cell, index) => {
        if (cell === "") {
            boardState[index] = "O"; // AI’s possible move
            let score = minimax(boardState, 0, false);
            boardState[index] = ""; // Undo move

            if (score > bestScore) {
                bestScore = score;
                move = index;
            }
        }
    });

    return move;
}

function minimax(board, depth, isMaximizing) {
    let result = evaluateBoard();
    if (result !== null) return result;

    if (isMaximizing) {
        let bestScore = -Infinity;
        board.forEach((cell, index) => {
            if (cell === "") {
                board[index] = "O";
                bestScore = Math.max(bestScore, minimax(board, depth + 1, false));
                board[index] = "";
            }
        });
        return bestScore;
    } else {
        let bestScore = Infinity;
        board.forEach((cell, index) => {
            if (cell === "") {
                board[index] = "X";
                bestScore = Math.min(bestScore, minimax(board, depth + 1, true));
                board[index] = "";
            }
        });
        return bestScore;
    }
}

function evaluateBoard() {
    if (winningCombinations.some(combo => combo.every(i => boardState[i] === "O"))) return 10;
    if (winningCombinations.some(combo => combo.every(i => boardState[i] === "X"))) return -10;
    if (!boardState.includes("")) return 0;
    return null;
}

// 🔥 **Show Winner Message with Animation**
function showWinnerMessage(message) {
    let winnerDiv = document.createElement("div");
    winnerDiv.classList.add("winner-banner");
    winnerDiv.textContent = message;
    document.body.appendChild(winnerDiv);

    setTimeout(() => {
        winnerDiv.remove();
        resetGame();
    }, 2500);
}

// 🛠 **Proper Reset (Preserves Scores & Mode)**
function resetGame() {
    boardState.fill("");
    localStorage.setItem("boardState", JSON.stringify(boardState));
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("winning");
    });
    currentPlayer = "X";
    localStorage.setItem("currentPlayer", currentPlayer);
    scoreDisplay.innerHTML = `X: ${scores.X} | O: ${scores.O}`;
}
// 🛠 **Proper Reset (Preserves Scores & Mode)**
function resetGame() {
    boardState.fill("");
    localStorage.setItem("boardState", JSON.stringify(boardState));
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("winning");
    });
    currentPlayer = "X";
    localStorage.setItem("currentPlayer", currentPlayer);
    scoreDisplay.innerHTML = `X: ${scores.X} | O: ${scores.O}`;
}

// 🏆 **Attach Reset Event Listener**
resetButton.addEventListener("click", resetGame);
