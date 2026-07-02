const style = {

    board: {
        l: "#b58863",
        L: "#f0d9b5",
        m: "#2e7d32",
        M: "#66bb6a",
        t: "#b71c1c",
        T: "#ef5350"
    },

  pieces: {

    // ♟️ black
    b: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt60.png",
    t: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt60.png",
    s: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt60.png",
    l: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt60.png",
    d: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt60.png",
    k: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt60.png",

    // ♟️ white
    B: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt60.png",
    T: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt60.png",
    S: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt60.png",
    L: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt60.png",
    D: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt60.png",
    K: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt60.png"
}
};


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
const colorMatrix = [];

function initColors(){
    for(let y=0;y<8;y++){
        colorMatrix[y] = [];
        for(let x=0;x<8;x++){
            colorMatrix[y][x] = (x+y)%2===0 ? "L" : "l";
        }
    }
}

initColors();


const board = document.getElementById("board");

let selected = null;


// 🖼️ Render
function drawBoard(){

    board.innerHTML = "";

    for(let y=0;y<8;y++){
        for(let x=0;x<8;x++){

            const square = document.createElement("div");
            square.className = "square";

            square.style.background = style.board[colorMatrix[y][x]];

            const piece = boardMatrix[y][x];

            if(piece){
                const img = document.createElement("img");
                img.src = style.pieces[piece];
                square.appendChild(img);
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
    initColors();
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

// 🚀 START
drawBoard();
