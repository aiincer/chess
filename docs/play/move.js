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

            // 1 Schritt
            if(inBounds(x, y + dir) && isEmpty(x, y + dir)){
                mark(x, y + dir);

                // 2 Schritte (nur wenn noch nie bewegt)
                if(!hasMoved[y][x] && isEmpty(x, y + 2*dir)){
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
            break;
    }
}
