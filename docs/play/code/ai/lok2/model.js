//
// model.js
// KI mit bis zu 10 Halbzügen Suchttiefe
//
// Kompatibel mit:
// getRandomMove(boardMatrix, aiColor, gameDetails.skill)
//


// ============================================================
// FIGURENWERTE
// ============================================================

const pieceValue = {
    b: 100,       // Bauer
    s: 320,       // Springer
    l: 330,       // Läufer
    t: 500,       // Turm
    d: 900,       // Dame
    k: 20000      // König
};


// ============================================================
// EINSTELLUNGEN
// ============================================================

const MAX_DEPTH = 10;

// Begrenzung gegen extrem lange Berechnungen.
// 0 = keine Begrenzung.
const MAX_NODES = 250000;

let searchedNodes = 0;


// ============================================================
// TRANSPOSITION TABLE
// ============================================================

const transpositionTable = new Map();


// ============================================================
// HELPERS
// ============================================================

function cloneBoard(board) {
    return board.map(row => [...row]);
}


function isWhite(piece) {
    return piece && piece === piece.toUpperCase();
}


function isBlack(piece) {
    return piece && piece === piece.toLowerCase();
}


function inBounds(x, y) {
    return (
        x >= 0 &&
        x < 8 &&
        y >= 0 &&
        y < 8
    );
}


function oppositeColor(color) {
    return color === "white"
        ? "black"
        : "white";
}


// ============================================================
// BOARD KEY
// ============================================================

function boardKey(board, depth, color) {

    let key = "";

    for (let y = 0; y < 8; y++) {
        key += board[y].join(".");
        key += "/";
    }

    return key + "|" + depth + "|" + color;
}


// ============================================================
// MOVE GENERATION
// ============================================================

function getMoves(board, x, y) {

    const piece = board[y][x];

    if (!piece) return [];

    const white = isWhite(piece);
    const type = piece.toLowerCase();

    const moves = [];


    // --------------------------------------------------------
    // Hilfsfunktion
    // --------------------------------------------------------

    function add(nx, ny) {

        if (!inBounds(nx, ny)) return;

        const target = board[ny][nx];

        if (
            !target ||
            (white
                ? isBlack(target)
                : isWhite(target))
        ) {

            moves.push({
                from: [x, y],
                to: [nx, ny]
            });
        }
    }


    // ========================================================
    // BAUER
    // ========================================================

    if (type === "b") {

        const dir = white ? -1 : 1;
        const startRow = white ? 6 : 1;


        // Ein Feld vorwärts

        const oneY = y + dir;

        if (
            inBounds(x, oneY) &&
            !board[oneY][x]
        ) {

            moves.push({
                from: [x, y],
                to: [x, oneY]
            });


            // Zwei Felder vom Start

            const twoY = y + dir * 2;

            if (
                y === startRow &&
                inBounds(x, twoY) &&
                !board[twoY][x]
            ) {

                moves.push({
                    from: [x, y],
                    to: [x, twoY]
                });
            }
        }


        // Schlagen

        for (const dx of [-1, 1]) {

            const nx = x + dx;
            const ny = y + dir;

            if (!inBounds(nx, ny)) continue;

            const target = board[ny][nx];

            if (
                target &&
                (white
                    ? isBlack(target)
                    : isWhite(target))
            ) {

                moves.push({
                    from: [x, y],
                    to: [nx, ny]
                });
            }
        }
    }


    // ========================================================
    // SPRINGER
    // ========================================================

    else if (type === "s") {

        const jumps = [
            [1, 2],
            [2, 1],
            [2, -1],
            [1, -2],
            [-1, -2],
            [-2, -1],
            [-2, 1],
            [-1, 2]
        ];

        for (const [dx, dy] of jumps) {
            add(x + dx, y + dy);
        }
    }


    // ========================================================
    // LÄUFER / TURM / DAME
    // ========================================================

    else if (
        type === "l" ||
        type === "t" ||
        type === "d"
    ) {

        const directions = [];


        // Diagonal

        if (
            type === "l" ||
            type === "d"
        ) {

            directions.push(
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1]
            );
        }


        // Gerade

        if (
            type === "t" ||
            type === "d"
        ) {

            directions.push(
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1]
            );
        }


        for (const [dx, dy] of directions) {

            let nx = x + dx;
            let ny = y + dy;

            while (inBounds(nx, ny)) {

                const target = board[ny][nx];


                // Freies Feld

                if (!target) {

                    moves.push({
                        from: [x, y],
                        to: [nx, ny]
                    });
                }


                // Figur getroffen

                else {

                    if (
                        white
                            ? isBlack(target)
                            : isWhite(target)
                    ) {

                        moves.push({
                            from: [x, y],
                            to: [nx, ny]
                        });
                    }

                    break;
                }


                nx += dx;
                ny += dy;
            }
        }
    }


    // ========================================================
    // KÖNIG
    // ========================================================

    else if (type === "k") {

        for (let dx = -1; dx <= 1; dx++) {

            for (let dy = -1; dy <= 1; dy++) {

                if (
                    dx === 0 &&
                    dy === 0
                ) {
                    continue;
                }

                add(
                    x + dx,
                    y + dy
                );
            }
        }
    }


    return moves;
}


// ============================================================
// ALLE ZÜGE
// ============================================================

function getAllMoves(board, color) {

    const moves = [];

    for (let y = 0; y < 8; y++) {

        for (let x = 0; x < 8; x++) {

            const piece = board[y][x];

            if (!piece) continue;


            if (
                color === "white" &&
                !isWhite(piece)
            ) {
                continue;
            }


            if (
                color === "black" &&
                !isBlack(piece)
            ) {
                continue;
            }


            moves.push(
                ...getMoves(
                    board,
                    x,
                    y
                )
            );
        }
    }

    return moves;
}


// ============================================================
// ZUG AUSFÜHREN
// ============================================================

function applyMove(board, move) {

    const [fx, fy] = move.from;
    const [tx, ty] = move.to;

    const movingPiece =
        board[fy][fx];

    const captured =
        board[ty][tx];


    board[ty][tx] = movingPiece;
    board[fy][fx] = "";


    let winner = null;


    if (
        captured &&
        captured.toLowerCase() === "k"
    ) {

        winner =
            isWhite(movingPiece)
                ? "white"
                : "black";
    }


    return {
        captured,
        winner
    };
}


// ============================================================
// POSITION BEWERTEN
// ============================================================

function evaluateBoard(board, aiColor) {

    let score = 0;


    for (let y = 0; y < 8; y++) {

        for (let x = 0; x < 8; x++) {

            const piece = board[y][x];

            if (!piece) continue;


            const value =
                pieceValue[
                    piece.toLowerCase()
                ] || 0;


            const own =
                (
                    aiColor === "white" &&
                    isWhite(piece)
                ) ||
                (
                    aiColor === "black" &&
                    isBlack(piece)
                );


            if (own) {
                score += value;
            } else {
                score -= value;
            }
        }
    }


    return score;
}


// ============================================================
// ZUGWERT
// ============================================================

function moveOrderValue(board, move) {

    const target =
        board[
            move.to[1]
        ][
            move.to[0]
        ];


    if (!target) {
        return 0;
    }


    const capturedValue =
        pieceValue[
            target.toLowerCase()
        ] || 0;


    const attacker =
        board[
            move.from[1]
        ][
            move.from[0]
        ];


    const attackerValue =
        pieceValue[
            attacker.toLowerCase()
        ] || 0;


    // MVV-LVA:
    // wertvolle Figur schlagen
    // mit möglichst billiger Figur

    return (
        capturedValue * 10 -
        attackerValue
    );
}


// ============================================================
// ZÜGE SORTIEREN
// ============================================================

function orderMoves(board, moves) {

    return moves.sort(
        (a, b) =>
            moveOrderValue(board, b) -
            moveOrderValue(board, a)
    );
}


// ============================================================
// MINIMAX
// ALPHA-BETA
// ============================================================

function minimax(
    board,
    depth,
    alpha,
    beta,
    maximizing,
    aiColor
) {

    searchedNodes++;


    // Sicherheitslimit

    if (
        MAX_NODES > 0 &&
        searchedNodes >= MAX_NODES
    ) {

        return evaluateBoard(
            board,
            aiColor
        );
    }


    // Tiefe erreicht

    if (depth <= 0) {

        return evaluateBoard(
            board,
            aiColor
        );
    }


    const currentColor =
        maximizing
            ? aiColor
            : oppositeColor(aiColor);


    const key =
        boardKey(
            board,
            depth,
            currentColor
        );


    // Schon berechnet?

    if (
        transpositionTable.has(key)
    ) {

        return transpositionTable.get(key);
    }


    let moves =
        getAllMoves(
            board,
            currentColor
        );


    // Keine Züge

    if (!moves.length) {

        const score =
            evaluateBoard(
                board,
                aiColor
            );

        transpositionTable.set(
            key,
            score
        );

        return score;
    }


    // Gute Züge zuerst

    moves =
        orderMoves(
            board,
            moves
        );


    // ========================================================
    // MAX
    // ========================================================

    if (maximizing) {

        let best = -Infinity;


        for (const move of moves) {

            const newBoard =
                cloneBoard(board);


            const result =
                applyMove(
                    newBoard,
                    move
                );


            // KI schlägt König

            if (
                result.winner === aiColor
            ) {

                best = 100000;

                break;
            }


            const score =
                minimax(
                    newBoard,
                    depth - 1,
                    alpha,
                    beta,
                    false,
                    aiColor
                );


            best =
                Math.max(
                    best,
                    score
                );


            alpha =
                Math.max(
                    alpha,
                    best
                );


            // Alpha-Beta Cutoff

            if (beta <= alpha) {
                break;
            }
        }


        transpositionTable.set(
            key,
            best
        );


        return best;
    }


    // ========================================================
    // MIN
    // ========================================================

    else {

        let best = Infinity;


        for (const move of moves) {

            const newBoard =
                cloneBoard(board);


            const result =
                applyMove(
                    newBoard,
                    move
                );


            // Gegner schlägt König

            if (
                result.winner ===
                oppositeColor(aiColor)
            ) {

                best = -100000;

                break;
            }


            const score =
                minimax(
                    newBoard,
                    depth - 1,
                    alpha,
                    beta,
                    true,
                    aiColor
                );


            best =
                Math.min(
                    best,
                    score
                );


            beta =
                Math.min(
                    beta,
                    best
                );


            // Beta Cutoff

            if (beta <= alpha) {
                break;
            }
        }


        transpositionTable.set(
            key,
            best
        );


        return best;
    }
}


// ============================================================
// BESTEN ZUG FINDEN
// ============================================================

export function getRandomMove(
    board,
    aiColor,
    skill = 3
) {

    const moves =
        getAllMoves(
            board,
            aiColor
        );


    if (!moves.length) {
        return null;
    }


    // Alte Berechnungen löschen

    transpositionTable.clear();

    searchedNodes = 0;


    // ========================================================
    // SKILL → TIEFE
    // ========================================================

    let depth;


    if (typeof skill === "number") {

        if (skill <= 1) {
            depth = 3;
        }

        else if (skill === 2) {
            depth = 5;
        }

        else if (skill === 3) {
            depth = 7;
        }

        else if (skill === 4) {
            depth = 8;
        }

        else {
            depth = MAX_DEPTH;
        }

    } else {

        depth = MAX_DEPTH;
    }


    // Sicherheit

    depth =
        Math.min(
            depth,
            MAX_DEPTH
        );


    // ========================================================
    // ZÜGE SORTIEREN
    // ========================================================

    const ordered =
        orderMoves(
            board,
            [...moves]
        );


    let bestMove = ordered[0];
    let bestScore = -Infinity;


    // ========================================================
    // ROOT SEARCH
    // ========================================================

    for (const move of ordered) {

        // Bei bereits gefundenem König
        // sofort zurückgeben

        const target =
            board[
                move.to[1]
            ][
                move.to[0]
            ];


        if (
            target &&
            target.toLowerCase() === "k"
        ) {

            return move;
        }


        const newBoard =
            cloneBoard(board);


        const result =
            applyMove(
                newBoard,
                move
            );


        if (
            result.winner === aiColor
        ) {

            return move;
        }


        const score =
            minimax(
                newBoard,

                // Root-Zug zählt als
                // erste Ebene
                depth - 1,

                -Infinity,
                Infinity,

                false,

                aiColor
            );


        if (
            score > bestScore
        ) {

            bestScore = score;
            bestMove = move;
        }
    }


    console.log(
        "KI:",
        "Tiefe =", depth,
        "| Bewertung =", bestScore,
        "| untersuchte Knoten =", searchedNodes
    );


    return bestMove;
}
