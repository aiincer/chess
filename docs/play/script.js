const gameMode = JSON.parse(
        sessionStorage.getItem("gameDetails") || 
        '{"color":0,"time":"60:60","gameMode":"standard","mode":"lokal","vs":""}'
    ).gameMode;
const isBlind = gameMode === "blind";
const isBlindPlus = gameMode === "blind+";
const isStandard = gameMode === "standard";


// ♟️ Figuren
const boardMatrix = [
["t","s","l","d","k","l","s","t"],
["b","b","b","b","b","b","b","b"],
["","","","","","","",""],
["","","","","","","",""],
["","","","","","","",""],
["","","","","","","",""],
["B","B","B","B","B","B","B","B"],
["T","S","L","D","K","L","S","T"]
];


// 🎨 Farben
function initColors(){
    let runnerMatrix = [];
    for(let y=0;y<8;y++){
        runnerMatrix[y] = [];
        for(let x=0;x<8;x++){
            runnerMatrix[y][x] = (x+y)%2===0 ? "L" : "l";
        }
    }
    return runnerMatrix;
}
let colorMatrix = initColors();
let baseColorMatrix = initColors();


const board = document.getElementById("board");

let selected = null;
let activePlayer = "white";
let winner = null;
let lastMove = null;
let promotionPending = false;
const moveHistory = [];

// 🖼️ Render
function drawBoard(){

    board.innerHTML = "";

    for(let y=0;y<8;y++){
        for(let x=0;x<8;x++){

            const square = document.createElement("div");
            square.className = "square";
            if (isStandard) {
                square.style.background = style.board[colorMatrix[y][x]];
            } else {
                square.style.background = style.board[baseColorMatrix[y][x]];
            }

            const piece = boardMatrix[y][x];
            if (piece && isStandard) {
                const img = document.createElement("img");
                img.src = style.pieces[piece];
                square.appendChild(img);
            }
            // Zahlen links
            if (x === 0) {
                const rank = document.createElement("span");
                rank.className = "rankLabel";
                rank.textContent = 8 - y;
                square.appendChild(rank);
            }
            // Buchstaben unten
            if (y === 7) {
                const file = document.createElement("span");
                file.className = "fileLabel";
                file.textContent = "ABCDEFGH"[x];
                square.appendChild(file);
            }
            // 🖱️ CLICK
            square.onclick = () => handleClick(x, y);

            board.appendChild(square);
        }
    }
}


// 🧠 Click Handler
function handleClick(x, y){

    if(selected === null){

        if(boardMatrix[y][x] !== ""){
            selected = {x, y};
            move(x, y);
            drawBoard();
        }

    } else {

        const from = selected;

        const c = colorMatrix[y][x];

        if(c === "m" || c === "M" || c === "t" || c === "T"){

            boardMatrix[y][x] = boardMatrix[from.y][from.x];
            boardMatrix[from.y][from.x] = "";

        }

        selected = null;
        resetColors();
        drawBoard();
    }
}


// 🔄 Reset Colors
function resetColors(){
    colorMatrix = initColors();
}
const hasMoved = [];

function initHasMoved(){
    for(let y=0;y<8;y++){
        hasMoved[y] = [];
        for(let x=0;x<8;x++){
            hasMoved[y][x] = false;
        }
    }
}

initHasMoved();

function isWhitePiece(piece){
    return piece !== "" && piece === piece.toUpperCase();
}

function pieceColor(piece){
    return isWhitePiece(piece) ? "white" : "black";
}

function opponent(color){
    return color === "white" ? "black" : "white";
}

function setMoved(from, to){
    hasMoved[to.y][to.x] = true;
    hasMoved[from.y][from.x] = false;
}

function switchTurn(){
    activePlayer = opponent(activePlayer);
    updateClockDisplay();
}

function formatTime(totalSeconds){
    const safe = Math.max(0, totalSeconds);
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateClockDisplay(){
    const whiteClock = document.querySelector(".whiteClock");
    const blackClock = document.querySelector(".blackClock");

    if(whiteClock){
        whiteClock.textContent = formatTime(window.clocks.white);
        whiteClock.classList.toggle("activeClock", activePlayer === "white" && !winner);
    }

    if(blackClock){
        blackClock.textContent = formatTime(window.clocks.black);
        blackClock.classList.toggle("activeClock", activePlayer === "black" && !winner);
    }
}

let clockInterval = null;

function startClock(){
    clearInterval(clockInterval);

    clockInterval = setInterval(() => {
        if (winner) return;
        
        if (activePlayer === "white") {
            window.clocks["white"]--;
        } else {
            window.clocks["black"]--;
        }
        if (window.clocks[activePlayer] <= 0) {
            window.clocks[activePlayer] = 0;
            winner = opponent(activePlayer);
            updateGameStatus(`${winner === "white" ? "Weiss" : "Schwarz"} gewinnt auf Zeit`);
            clearInterval(clockInterval);
        }

        updateClockDisplay();
    }, 1000);
}

function updateGameStatus(text){
    let status = document.getElementById("gameStatus");
    if(!status){
        status = document.createElement("div");
        status.id = "gameStatus";
        document.getElementById("panel").prepend(status);
    }
    status.textContent = text;
}

// 🚀 START
drawBoard();
updateClockDisplay();
startClock();
