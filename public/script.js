const socket = io("https://dama-online-za71.onrender.com");

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");

let board = [];
let selected = null;
let room = null;
let myColor = null;
let currentTurn = null;

socket.on("waiting", () => {
    statusEl.innerText = "Aguardando outro jogador...";
});

socket.on("start", (data) => {
    room = data.room;
    myColor = data.players[socket.id];
    currentTurn = data.turn;

    statusEl.innerText = "Você é: " + myColor;

    initBoard();
});

socket.on("move", ({ move, player }) => {
    applyMove(move);
    currentTurn = player === "red" ? "blue" : "red";
    draw();
});

function initBoard() {
    for (let r = 0; r < 8; r++) {
        board[r] = [];
        for (let c = 0; c < 8; c++) {
            board[r][c] = null;

            if ((r + c) % 2) {
                if (r < 3) board[r][c] = { color: "blue" };
                if (r > 4) board[r][c] = { color: "red" };
            }
        }
    }
    draw();
}

function draw() {
    boardEl.innerHTML = "";

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement("div");
            cell.className = "cell " + ((r + c) % 2 ? "dark" : "light");

            cell.onclick = () => click(r, c);

            if (board[r][c]) {
                const p = document.createElement("div");
                p.className = "piece " + board[r][c].color;
                cell.appendChild(p);
            }

            boardEl.appendChild(cell);
        }
    }
}

function click(r, c) {
    if (currentTurn !== myColor) return;

    if (!selected) {
        if (board[r][c] && board[r][c].color === myColor) {
            selected = { r, c };
        }
    } else {
        const move = { from: selected, to: { r, c } };

        applyMove(move);
        socket.emit("move", { room, move, player: myColor });

        currentTurn = myColor === "red" ? "blue" : "red";
        selected = null;
    }
}

function applyMove(move) {
    const { from, to } = move;
    board[to.r][to.c] = board[from.r][from.c];
    board[from.r][from.c] = null;
}
