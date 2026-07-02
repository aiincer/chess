function initLocalControls(){

    const squares = document.querySelectorAll(".square");

    squares.forEach((square, index) => {

        const x = index % 8;
        const y = Math.floor(index / 8);

        square.onclick = () => {
            if(winner || promotionPending) return;

            // 🟡 Wenn kein Move aktiv → Figur auswählen
            if(selected === null){

                if(boardMatrix[y][x] !== "" && pieceColor(boardMatrix[y][x]) === activePlayer){
                    selected = {x, y};
                    move(x, y);
                    drawBoard();
                    initLocalControls();
                } 

            } else {

                const from = selected;

                // gleiche Figur → deselect
                if(from.x === x && from.y === y){
                    selected = null;
                    resetColors();
                    drawBoard();
                    initLocalControls();
                    return;
                }

                const color = colorMatrix[y][x];

                // 🟢 gültiger Move
                if(color === "m" || color === "M" || color === "t" || color === "T"){
                    const waitsForPromotion = executeLocalMove(from, {x, y});

                    selected = null;

                    resetColors();
                    drawBoard();
                    initLocalControls();
                    if(waitsForPromotion) return;

                } else {

                    // neue Auswahl
                    selected = null;
                    resetColors();
                    drawBoard();
                    initLocalControls();

                    if(boardMatrix[y][x] !== "" && pieceColor(boardMatrix[y][x]) === activePlayer){
                        selected = {x, y};
                        move(x, y);
                        drawBoard();
                        initLocalControls();
                    }
                }
            }
        };
    });
}

function executeLocalMove(from, to){
    const piece = boardMatrix[from.y][from.x];
    let captured = boardMatrix[to.y][to.x];
    let castle = null;
    let enPassant = false;

    if(piece.toLowerCase() === "b" && to.x !== from.x && captured === ""){
        enPassant = true;
        captured = boardMatrix[from.y][to.x];
        boardMatrix[from.y][to.x] = "";
        hasMoved[from.y][to.x] = false;
    }

    if(piece.toLowerCase() === "k" && Math.abs(to.x - from.x) === 2){
        castle = to.x > from.x ? "king" : "queen";
        const rookFromX = castle === "king" ? 7 : 0;
        const rookToX = castle === "king" ? 5 : 3;
        boardMatrix[to.y][rookToX] = boardMatrix[to.y][rookFromX];
        boardMatrix[to.y][rookFromX] = "";
        hasMoved[to.y][rookToX] = true;
        hasMoved[to.y][rookFromX] = false;
    }

    boardMatrix[to.y][to.x] = piece;
    boardMatrix[from.y][from.x] = "";
    setMoved(from, to);

    const entry = {
        piece,
        from: {...from},
        to: {...to},
        captured,
        castle,
        enPassant
    };

    if(piece.toLowerCase() === "b" && (to.y === 0 || to.y === 7)){
        promotionPending = true;
        showPromotionWindow(pieceColor(piece), promotedPiece => {
            boardMatrix[to.y][to.x] = promotedPiece;
            entry.promotion = promotedPiece;
            finishLocalMove(entry);
            promotionPending = false;
            resetColors();
            drawBoard();
            initLocalControls();
        });
        return true;
    }

    finishLocalMove(entry);
    return false;
}

function finishLocalMove(entry){
    moveHistory.push(entry);
    lastMove = entry;

    if(entry.captured && entry.captured.toLowerCase() === "k"){
        winner = pieceColor(entry.piece);
        updateGameStatus(`${winner === "white" ? "Weiss" : "Schwarz"} gewinnt`);
    } else {
        switchTurn();
    }

    updateGameInfo();
}

function showPromotionWindow(color, onChoose){
    const existing = document.getElementById("promotionOverlay");
    if(existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "promotionOverlay";

    const box = document.createElement("div");
    box.id = "promotionBox";

    const title = document.createElement("div");
    title.id = "promotionTitle";
    title.textContent = "Bauer umwandeln";
    box.appendChild(title);

    const options = color === "white" ? ["D", "T", "L", "S"] : ["d", "t", "l", "s"];

    options.forEach(piece => {
        const button = document.createElement("button");
        button.className = "promotionOption";
        button.type = "button";

        const img = document.createElement("img");
        img.src = style.pieces[piece];
        img.alt = piece;
        button.appendChild(img);

        button.onclick = () => {
            overlay.remove();
            onChoose(piece);
        };

        box.appendChild(button);
    });

    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

initLocalControls();
