function move(x, y){

    resetColors();

    const piece = boardMatrix[y][x];
    if(!piece) return;

    const isWhite = piece === piece.toUpperCase();

    function inBounds(nx, ny){
        return nx >= 0 && nx < 8 && ny >= 0 && ny < 8;
    }

    function isEnemy(nx, ny){
        const target = boardMatrix[ny][nx];
        return target !== "" && (target === target.toUpperCase()) !== isWhite;
    }

    function isEmpty(nx, ny){
        return boardMatrix[ny][nx] === "";
    }

    function mark(nx, ny){
        if(!inBounds(nx, ny)) return;

        if(isEmpty(nx, ny)){
            colorMatrix[ny][nx] = (nx+ny)%2===0 ? "M" : "m";
        } 
        else if(isEnemy(nx, ny)){
            colorMatrix[ny][nx] = (nx+ny)%2===0 ? "T" : "t";
        }
    }

    function markCastle(nx, ny){
        if(!inBounds(nx, ny)) return;
        colorMatrix[ny][nx] = (nx+ny)%2===0 ? "M" : "m";
    }

    function ray(dx, dy){
        let nx = x + dx;
        let ny = y + dy;

        while(inBounds(nx, ny)){

            if(isEmpty(nx, ny)){
                colorMatrix[ny][nx] = (nx+ny)%2===0 ? "M" : "m";
            } 
            else {
                if(isEnemy(nx, ny)){
                    colorMatrix[ny][nx] = (nx+ny)%2===0 ? "T" : "t";
                }
                break;
            }

            nx += dx;
            ny += dy;
        }
    }


    switch(piece.toLowerCase()){

        // ♟️ PAWN (korrekt)
        case "b": {

            let dir = isWhite ? -1 : 1;
            let startRow = isWhite ? 6 : 1;

            // 1 Schritt
            if(inBounds(x, y + dir) && isEmpty(x, y + dir)){
                mark(x, y + dir);

                // 2 Schritte nur vom Startfeld und nur vor dem ersten Zug
                if(y === startRow && !hasMoved[y][x] && inBounds(x, y + 2*dir) && isEmpty(x, y + 2*dir)){
                    mark(x, y + 2*dir);
                }
            }

            // Schlagen
            [-1, 1].forEach(dx => {
                let nx = x + dx;
                let ny = y + dir;

                if(inBounds(nx, ny) && isEnemy(nx, ny)){
                    mark(nx, ny);
                }
            });

            // En passant
            if(lastMove && lastMove.piece.toLowerCase() === "b" && Math.abs(lastMove.to.y - lastMove.from.y) === 2){
                const enemyPawnNextToUs = lastMove.to.y === y && Math.abs(lastMove.to.x - x) === 1;
                if(enemyPawnNextToUs){
                    mark(lastMove.to.x, y + dir);
                }
            }

            break;
        }


        // ♜ ROOK
        case "t":
            [[1,0],[-1,0],[0,1],[0,-1]].forEach(d => ray(d[0], d[1]));
            break;

        // ♝ BISHOP
        case "l":
            [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(d => ray(d[0], d[1]));
            break;

        // ♛ QUEEN
        case "d":
            [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]
                .forEach(d => ray(d[0], d[1]));
            break;

        // ♞ KNIGHT
        case "s":
            [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]]
                .forEach(d => mark(x+d[0], y+d[1]));
            break;

        // ♚ KING
        case "k":
            [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]
                .forEach(d => mark(x+d[0], y+d[1]));

            // Rochade: Koenig und Turm ungezogen, Felder dazwischen frei
            if(!hasMoved[y][x]){
                if(boardMatrix[y][7] && boardMatrix[y][7].toLowerCase() === "t" && !hasMoved[y][7] && isEmpty(5, y) && isEmpty(6, y)){
                    markCastle(6, y);
                }
                if(boardMatrix[y][0] && boardMatrix[y][0].toLowerCase() === "t" && !hasMoved[y][0] && isEmpty(1, y) && isEmpty(2, y) && isEmpty(3, y)){
                    markCastle(2, y);
                }
            }
            break;
    }
}

function pieceName(piece){
    const names = {
        b: "",
        t: "T",
        s: "S",
        l: "L",
        d: "D",
        k: "K"
    };
    return names[piece.toLowerCase()] || "";
}

function squareName(x, y){
    return `${"abcdefgh"[x]}${8 - y}`;
}

function updateMaterial(){
    const values = {b: 1, s: 3, l: 3, t: 5, d: 9, k: 0};
    let white = 0;
    let black = 0;

    for(let y=0;y<8;y++){
        for(let x=0;x<8;x++){
            const piece = boardMatrix[y][x];
            if(!piece) continue;

            if(isWhitePiece(piece)){
                white += values[piece.toLowerCase()] || 0;
            } else {
                black += values[piece.toLowerCase()] || 0;
            }
        }
    }

    const diff = white - black;
    const whiteMaterial = document.querySelector(".whiteClock + .material");
    const blackMaterial = document.querySelector(".blackClock + .material");

    if(whiteMaterial) whiteMaterial.textContent = diff > 0 ? `+${diff}` : "+0";
    if(blackMaterial) blackMaterial.textContent = diff < 0 ? `+${Math.abs(diff)}` : "+0";
}

function moveNotation(entry){
    if(entry.castle === "king") return "O-O";
    if(entry.castle === "queen") return "O-O-O";

    const piece = pieceName(entry.piece);
    const capture = entry.captured ? "x" : "";
    const fromFile = entry.piece.toLowerCase() === "b" && capture ? "abcdefgh"[entry.from.x] : "";
    const promotion = entry.promotion ? `=${pieceName(entry.promotion)}` : "";
    return `${piece}${fromFile}${capture}${squareName(entry.to.x, entry.to.y)}${promotion}`;
}

function updateMoveList(){
    const movesEl = document.getElementById("moves");
    if(!movesEl) return;

    movesEl.innerHTML = "";

    for(let i=0;i<moveHistory.length;i+=2){
        const numberEl = document.createElement("div");
        numberEl.className = "moveNumber";
        numberEl.textContent = `${Math.floor(i / 2) + 1}.`;

        const moveEl = document.createElement("div");
        moveEl.className = "move";
        const whiteMove = moveNotation(moveHistory[i]);
        const blackMove = moveHistory[i + 1] ? moveNotation(moveHistory[i + 1]) : "";
        moveEl.textContent = `${whiteMove}${blackMove ? "  " + blackMove : ""}`;

        movesEl.appendChild(numberEl);
        movesEl.appendChild(moveEl);
    }

    movesEl.scrollTop = movesEl.scrollHeight;
}

function updateGameInfo(){
    updateMaterial();
    updateMoveList();
}

updateGameInfo();
