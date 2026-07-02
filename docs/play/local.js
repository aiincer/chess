function initLocalControls(){

    const squares = document.querySelectorAll(".square");

    squares.forEach((square, index) => {

        const x = index % 8;
        const y = Math.floor(index / 8);

        square.onclick = () => {

            // 🟡 Wenn kein Move aktiv → Figur auswählen
            if(selected === null){

                if(boardMatrix[y][x] !== ""){
                    selected = {x, y};
                    move(x, y);
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

                    boardMatrix[y][x] = boardMatrix[from.y][from.x];
                    boardMatrix[from.y][from.x] = "";

                    selected = null;

                    resetColors();
                    drawBoard();
                    initLocalControls();

                } else {

                    // neue Auswahl
                    selected = null;
                    resetColors();
                    drawBoard();
                    initLocalControls();

                    if(boardMatrix[y][x] !== ""){
                        selected = {x, y};
                        move(x, y);
                    }
                }
            }
        };
    });
}
