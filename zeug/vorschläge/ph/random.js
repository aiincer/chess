let board = [
 ["r","n","b","q","k","b","n","r"],
 ["p","p","p","p","p","p","p","p"],
 [null,null,null,null,null,null,null,null],
 [null,null,null,null,null,null,null,null],
 [null,null,null,null,null,null,null,null],
 [null,null,null,null,null,null,null,null],
 ["P","P","P","P","P","P","P","P"],
 ["R","N","B","Q","K","B","N","R"]
];

function isWhite(p) { return p && p === p.toUpperCase(); }
function isBlack(p) { return p && p === p.toLowerCase(); }
function inBounds(x,y){ return x>=0 && x<8 && y>=0 && y<8; }

function cloneBoard(b) {
 return b.map(row => row.slice());
}
function applyMove(b, move) {
 const [fx, fy] = move.from;
 const [tx, ty] = move.to;
 b[ty][tx] = b[fy][fx];
 b[fy][fx] = null;
}


function getMovesForPiece(b, x, y) {
 const piece = b[y][x];
 if (!piece) return [];

 const moves = [];
 const white = isWhite(piece);
 const p = piece.toLowerCase();

 const addMove = (nx, ny) => {
   if (!inBounds(nx, ny)) return;
   const target = b[ny][nx];
   if (!target || (white ? isBlack(target) : isWhite(target))) {
     moves.push({ from:[x,y], to:[nx,ny] });
   }
 };

 // =======================
 // PAWN
 // =======================
 if (p === "p") {
   const dir = white ? -1 : 1;

   if (inBounds(x, y+dir) && !b[y+dir][x]) {
     moves.push({from:[x,y], to:[x,y+dir]});

     // double move
     const startRow = white ? 6 : 1;
     if (y === startRow && !b[y+2*dir][x]) {
       moves.push({from:[x,y], to:[x,y+2*dir]});
     }
   }

   for (let dx of [-1,1]) {
     const nx = x + dx, ny = y + dir;
     if (inBounds(nx,ny) && b[ny][nx] &&
         (white ? isBlack(b[ny][nx]) : isWhite(b[ny][nx]))) {
       moves.push({from:[x,y], to:[nx,ny]});
     }
   }
 }

 
 // KNIGHT
 if (p === "n") {
   const jumps = [
     [1,2],[2,1],[2,-1],[1,-2],
     [-1,-2],[-2,-1],[-2,1],[-1,2]
   ];
   for (const [dx,dy] of jumps) addMove(x+dx,y+dy);
 }

 
 // BISHOP
 if (p === "b") {
   const dirs = [[1,1],[-1,1],[1,-1],[-1,-1]];
   for (const [dx,dy] of dirs) {
     let nx=x+dx, ny=y+dy;
     while (inBounds(nx,ny)) {
       if (b[ny][nx]) {
         if (white ? isBlack(b[ny][nx]) : isWhite(b[ny][nx]))
           moves.push({from:[x,y], to:[nx,ny]});
         break;
       }
       moves.push({from:[x,y], to:[nx,ny]});
       nx+=dx; ny+=dy;
     }
   }
 }

 
 // ROOK
 
 if (p === "r") {
   const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
   for (const [dx,dy] of dirs) {
     let nx=x+dx, ny=y+dy;
     while (inBounds(nx,ny)) {
       if (b[ny][nx]) {
         if (white ? isBlack(b[ny][nx]) : isWhite(b[ny][nx]))
           moves.push({from:[x,y], to:[nx,ny]});
         break;
       }
       moves.push({from:[x,y], to:[nx,ny]});
       nx+=dx; ny+=dy;
     }
   }
 }

 
 // QUEEN
 
 if (p === "q") {
   const dirs = [
     [1,0],[-1,0],[0,1],[0,-1],
     [1,1],[-1,1],[1,-1],[-1,-1]
   ];
   for (const [dx,dy] of dirs) {
     let nx=x+dx, ny=y+dy;
     while (inBounds(nx,ny)) {
       if (b[ny][nx]) {
         if (white ? isBlack(b[ny][nx]) : isWhite(b[ny][nx]))
           moves.push({from:[x,y], to:[nx,ny]});
         break;
       }
       moves.push({from:[x,y], to:[nx,ny]});
       nx+=dx; ny+=dy;
     }
   }
 }

 
 // KING (no castling)
 
 if (p === "k") {
   for (let dx=-1; dx<=1; dx++) {
     for (let dy=-1; dy<=1; dy++) {
       if (dx || dy) addMove(x+dx,y+dy);
     }
   }
 }

 return moves;
}

// Get all moves for a color
function getAllMoves(color, b) {
 const moves = [];

 for (let y=0;y<8;y++) {
   for (let x=0;x<8;x++) {
     const p = b[y][x];
     if (!p) continue;

     if (color === "white" && !isWhite(p)) continue;
     if (color === "black" && !isBlack(p)) continue;

     moves.push(...getMovesForPiece(b,x,y));
   }
 }

 return moves;
}


// RANDOM PLAY ENGINE

function randomMove(color) {
 const moves = getAllMoves(color, board);

 if (moves.length === 0) {
   console.log(color + " has no moves. Game over.");
   return false;
 }

 const move = moves[Math.floor(Math.random()*moves.length)];
 applyMove(board, move);

 return move;
}


// SELF-PLAY LOOP


function printBoard() {
 console.log(board.map(r =>
   r.map(p => p ? p : ".").join(" ")
 ).join("\n"));
 console.log("\n");
}

let turn = "white";

for (let i=0; i<50; i++) {
 const move = randomMove(turn);
 if (!move) break;

 console.log(turn, move);

 turn = (turn === "white") ? "black" : "white";
}

printBoard();
