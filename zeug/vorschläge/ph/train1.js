const START_BOARD = [
 ["r","n","b","q","k","b","n","r"],
 ["p","p","p","p","p","p","p","p"],
 Array(8).fill(null),
 Array(8).fill(null),
 Array(8).fill(null),
 Array(8).fill(null),
 ["P","P","P","P","P","P","P","P"],
 ["R","N","B","Q","K","B","N","R"]
];

// ==========================
// LEARNING MEMORY
// ==========================
const moveScores = new Map();

// ==========================
// HELPERS
// ==========================
function cloneBoard(b) {
 return b.map(r => [...r]);
}

function isWhite(p){ return p && p === p.toUpperCase(); }
function isBlack(p){ return p && p === p.toLowerCase(); }

function inBounds(x,y){ return x>=0 && x<8 && y>=0 && y<8; }

// ==========================
// MOVE GENERATION
// ==========================
function getMoves(board, x, y) {
 const piece = board[y][x];
 if (!piece) return [];

 const white = isWhite(piece);
 const p = piece.toLowerCase();
 const moves = [];

 function add(nx, ny) {
   if (!inBounds(nx, ny)) return;
   const t = board[ny][nx];
   if (!t || (white ? isBlack(t) : isWhite(t))) {
     moves.push({from:[x,y], to:[nx,ny]});
   }
 }

 // PAWN
 if (p === "p") {
   const dir = white ? -1 : 1;
   const start = white ? 6 : 1;

   if (inBounds(x, y+dir) && !board[y+dir][x]) {
     moves.push({from:[x,y], to:[x,y+dir]});

     if (y === start && !board[y+2*dir][x]) {
       moves.push({from:[x,y], to:[x,y+2*dir]});
     }
   }

   for (let dx of [-1,1]) {
     const nx = x + dx, ny = y + dir;
     if (inBounds(nx,ny)) {
       const t = board[ny][nx];
       if (t && (white ? isBlack(t) : isWhite(t))) {
         moves.push({from:[x,y], to:[nx,ny]});
       }
     }
   }
 }

 // KNIGHT
 else if (p === "n") {
   const jumps = [
     [1,2],[2,1],[2,-1],[1,-2],
     [-1,-2],[-2,-1],[-2,1],[-1,2]
   ];
   for (const [dx,dy] of jumps) add(x+dx,y+dy);
 }

 // BISHOP / ROOK / QUEEN
 else if (["b","r","q"].includes(p)) {
   let dirs = [];

   if (p === "b" || p === "q")
     dirs.push([1,1],[-1,1],[1,-1],[-1,-1]);

   if (p === "r" || p === "q")
     dirs.push([1,0],[-1,0],[0,1],[0,-1]);

   for (const [dx,dy] of dirs) {
     let nx = x + dx, ny = y + dy;

     while (inBounds(nx,ny)) {
       const t = board[ny][nx];

       if (!t) {
         moves.push({from:[x,y], to:[nx,ny]});
       } else {
         if (white ? isBlack(t) : isWhite(t)) {
           moves.push({from:[x,y], to:[nx,ny]});
         }
         break;
       }

       nx += dx;
       ny += dy;
     }
   }
 }

 // KING
 else if (p === "k") {
   for (let dx=-1; dx<=1; dx++) {
     for (let dy=-1; dy<=1; dy++) {
       if (dx || dy) add(x+dx, y+dy);
     }
   }
 }

 return moves;
}

// ==========================
// ALL MOVES
// ==========================
function getAllMoves(board, color) {
 const moves = [];

 for (let y=0;y<8;y++) {
   for (let x=0;x<8;x++) {
     const p = board[y][x];
     if (!p) continue;

     if (color === "white" && !isWhite(p)) continue;
     if (color === "black" && !isBlack(p)) continue;

     moves.push(...getMoves(board,x,y));
   }
 }

 return moves;
}

// ==========================
// APPLY MOVE + KING CAPTURE WIN
// ==========================
function applyMove(board, move) {
 const [fx,fy] = move.from;
 const [tx,ty] = move.to;

 const captured = board[ty][tx];

 board[ty][tx] = board[fy][fx];
 board[fy][fx] = null;

 if (captured && captured.toLowerCase() === "k") {
   return "win";
 }

 return null;
}

// ==========================
// LEARNING MOVE PICKER
// ==========================
function moveKey(m) {
 return JSON.stringify(m);
}

function chooseMove(moves) {
 if (moves.length === 0) return null;

 const weights = moves.map(m => {
   return (moveScores.get(moveKey(m)) || 0) + 1;
 });

 const total = weights.reduce((a,b)=>a+b,0);
 let r = Math.random() * total;

 for (let i=0;i<moves.length;i++) {
   r -= weights[i];
   if (r <= 0) return moves[i];
 }

 return moves[0];
}

// ==========================
// SINGLE GAME
// ==========================
function playGame() {
 const board = cloneBoard(START_BOARD);

 let turn = "white";
 const history = [];
 const maxMoves = 200;

 for (let i=0;i<maxMoves;i++) {
   const moves = getAllMoves(board, turn);
   if (moves.length === 0) {
     return {winner: turn === "white" ? "black" : "white", length: i, history};
   }

   const move = chooseMove(moves);
   history.push({turn, move});

   const result = applyMove(board, move);
   if (result === "win") {
     return {winner: turn, length: i, history};
   }

   turn = turn === "white" ? "black" : "white";
 }

 return {winner:"draw", length:maxMoves, history};
}

// ==========================
// TRAINING LOOP (RETROSPECTIVE LEARNING)
// ==========================
function train(games=20) {
 for (let g=0; g<games; g++) {
   const game = playGame();

   let reward = game.length;

   if (game.winner === "white" || game.winner === "black") {
     reward *= 1.2;
   } else {
     reward *= 0.5;
   }

   for (const step of game.history) {
     const key = moveKey(step.move);
     moveScores.set(key, (moveScores.get(key)||0) + reward * 0.01);
   }

   console.log(`Game ${g+1}: winner=${game.winner}, length=${game.length}`);
 }
}

// ==========================
// RUN
// ==========================
train(20);
