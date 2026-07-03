// ./code/ai/ran1.js

function isWhite(p){
    return p && p === p.toUpperCase();
}

function isBlack(p){
    return p && p === p.toLowerCase();
}

function inBounds(x, y){
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}

function getMovesForPiece(board, x, y){

    const piece = board[y][x];
    if(!piece) return [];

    const moves = [];
    const white = isWhite(piece);
    const p = piece.toLowerCase();

    const addMove = (nx, ny) => {

        if(!inBounds(nx, ny)) return;

        const target = board[ny][nx];

        if(!target || (white ? isBlack(target) : isWhite(target))){
            moves.push({
                from:[x,y],
                to:[nx,ny]
            });
        }
    };

    // Bauer
    if(p === "b"){

        const dir = white ? -1 : 1;

        if(inBounds(x, y + dir) && !board[y + dir][x]){

            moves.push({
                from:[x,y],
                to:[x,y + dir]
            });

            const start = white ? 6 : 1;

            if(y === start && !board[y + 2 * dir][x]){

                moves.push({
                    from:[x,y],
                    to:[x,y + 2 * dir]
                });

            }
        }

        for(const dx of [-1,1]){

            const nx = x + dx;
            const ny = y + dir;

            if(inBounds(nx, ny)
                && board[ny][nx]
                && (white ? isBlack(board[ny][nx]) : isWhite(board[ny][nx]))){

                moves.push({
                    from:[x,y],
                    to:[nx,ny]
                });

            }

        }

    }

    // Springer
    if(p === "s"){

        const jumps = [
            [1,2],[2,1],[2,-1],[1,-2],
            [-1,-2],[-2,-1],[-2,1],[-1,2]
        ];

        for(const [dx,dy] of jumps){
            addMove(x+dx,y+dy);
        }

    }

    // Läufer
    if(p === "l"){

        const dirs = [
            [1,1],[-1,1],[1,-1],[-1,-1]
        ];

        for(const [dx,dy] of dirs){

            let nx = x + dx;
            let ny = y + dy;

            while(inBounds(nx,ny)){

                if(board[ny][nx]){

                    if(white ? isBlack(board[ny][nx]) : isWhite(board[ny][nx])){

                        moves.push({
                            from:[x,y],
                            to:[nx,ny]
                        });

                    }

                    break;

                }

                moves.push({
                    from:[x,y],
                    to:[nx,ny]
                });

                nx += dx;
                ny += dy;

            }

        }

    }

    // Turm
    if(p === "t"){

        const dirs = [
            [1,0],[-1,0],[0,1],[0,-1]
        ];

        for(const [dx,dy] of dirs){

            let nx = x + dx;
            let ny = y + dy;

            while(inBounds(nx,ny)){

                if(board[ny][nx]){

                    if(white ? isBlack(board[ny][nx]) : isWhite(board[ny][nx])){

                        moves.push({
                            from:[x,y],
                            to:[nx,ny]
                        });

                    }

                    break;

                }

                moves.push({
                    from:[x,y],
                    to:[nx,ny]
                });

                nx += dx;
                ny += dy;

            }

        }

    }

    // Dame
    if(p === "d"){

        const dirs = [
            [1,0],[-1,0],[0,1],[0,-1],
            [1,1],[-1,1],[1,-1],[-1,-1]
        ];

        for(const [dx,dy] of dirs){

            let nx = x + dx;
            let ny = y + dy;

            while(inBounds(nx,ny)){

                if(board[ny][nx]){

                    if(white ? isBlack(board[ny][nx]) : isWhite(board[ny][nx])){

                        moves.push({
                            from:[x,y],
                            to:[nx,ny]
                        });

                    }

                    break;

                }

                moves.push({
                    from:[x,y],
                    to:[nx,ny]
                });

                nx += dx;
                ny += dy;

            }

        }

    }

    // König
    if(p === "k"){

        for(let dx=-1; dx<=1; dx++){

            for(let dy=-1; dy<=1; dy++){

                if(dx || dy){

                    addMove(x+dx,y+dy);

                }

            }

        }

    }

    return moves;

}

function getAllMoves(color, board){

    const moves = [];

    for(let y=0; y<8; y++){

        for(let x=0; x<8; x++){

            const piece = board[y][x];

            if(!piece) continue;

            if(color === "white" && !isWhite(piece)) continue;
            if(color === "black" && !isBlack(piece)) continue;

            moves.push(...getMovesForPiece(board,x,y));

        }

    }

    return moves;

}

export function getRandomMove(board, color = "black"){

    const moves = getAllMoves(color, board);

    if(moves.length === 0){
        return null;
    }

    return moves[Math.floor(Math.random() * moves.length)];

}
