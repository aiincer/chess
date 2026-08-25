// ==========================
// PIECE VALUES
// ==========================

const pieceValue = {
    b: 100,   // Bauer
    s: 320,   // Springer
    l: 330,   // Läufer
    t: 500,   // Turm
    d: 900,   // Dame
    k: 20000  // König
};


// ==========================
// HELPERS
// ==========================

function cloneBoard(board) {
    return board.map(row => [...row]);
}

function isWhite(p) {
    return p && p === p.toUpperCase();
}

function isBlack(p) {
    return p && p === p.toLowerCase();
}

function inBounds(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}

function oppositeColor(color) {
    return color === "white" ? "black" : "white";
}


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

        const target = board[ny][nx];

        if (
            !target ||
            (white ? isBlack(target) : isWhite(target))
        ) {
            moves.push({
                from: [x, y],
                to: [nx, ny]
            });
        }
    }


    // ==========================
    // BAUER
    // ==========================

    if (p === "b") {

        const dir = white ? -1 : 1;
        const start = white ? 6 : 1;

        // Ein Feld
        if (
            inBounds(x, y + dir) &&
            !board[y + dir][x]
        ) {

            moves.push({
                from: [x, y],
                to: [x, y + dir]
            });

            // Zwei Felder
            if (
                y === start &&
                !board[y + 2 * dir][x]
            ) {
                moves.push({
                    from: [x, y],
                    to: [x, y + 2 * dir]
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
                (white ? isBlack(target) : isWhite(target))
            ) {
                moves.push({
                    from: [x, y],
                    to: [nx, ny]
                });
            }
        }
    }


    // ==========================
    // SPRINGER
    // ==========================

    else if (p === "s") {

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


    // ==========================
    // LÄUFER / TURM / DAME
    // ==========================

    else if (["l", "t", "d"].includes(p)) {

        const dirs = [];

        if (p === "l" || p === "d") {
            dirs.push(
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1]
            );
        }

        if (p === "t" || p === "d") {
            dirs.push(
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1]
            );
        }

        for (const [dx, dy] of dirs) {

            let nx = x + dx;
            let ny = y + dy;

            while (inBounds(nx, ny)) {

                const target = board[ny][nx];

                if (!target) {

                    moves.push({
                        from: [x, y],
                        to: [nx, ny]
                    });

                } else {

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


    // ==========================
    // KÖNIG
    // ==========================

    else if (p === "k") {

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {

                if (dx === 0 && dy === 0) continue;

                add(x + dx, y + dy);
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

    for (let y = 0; y < 8; y++) {

        for (let x = 0; x < 8; x++) {

            const piece = board[y][x];

            if (!piece) continue;

            if (
                color === "white" &&
                !isWhite(piece)
            ) continue;

            if (
                color === "black" &&
                !isBlack(piece)
            ) continue;

            moves.push(
                ...getMoves(board, x, y)
            );
        }
    }

    return moves;
}


// ==========================
// APPLY MOVE
// ==========================

function applyMove(board, move) {

    const [fx, fy] = move.from;
    const [tx, ty] = move.to;

    const captured = board[ty][tx];

    board[ty][tx] = board[fy][fx];
    board[fy][fx] = "";

    return {
        captured,
        winner:
            captured &&
            captured.toLowerCase() === "k"
                ? (isWhite(board[ty][tx])
                    ? "white"
                    : "black")
                : null
    };
}


// ==========================
// POSITION EVALUATION
// ==========================

function evaluateBoard(board, aiColor) {

    let score = 0;

    for (let y = 0; y < 8; y++) {

        for (let x = 0; x < 8; x++) {

            const piece = board[y][x];

            if (!piece) continue;

            const value =
                pieceValue[piece.toLowerCase()] || 0;

            if (
                (aiColor === "white" && isWhite(piece)) ||
                (aiColor === "black" && isBlack(piece))
            ) {
                score += value;
            } else {
                score -= value;
            }
        }
    }

    return score;
}


// ==========================
// MOVE ORDERING
// ==========================

function orderMoves(board, moves) {

    return moves.sort((a, b) => {

        const aTarget = board[a.to[1]][a.to[0]];
        const bTarget = board[b.to[1]][b.to[0]];

        const aValue = aTarget
            ? pieceValue[aTarget.toLowerCase()]
            : 0;

        const bValue = bTarget
            ? pieceValue[bTarget.toLowerCase()]
            : 0;

        return bValue - aValue;
    });
}


// ==========================
// MINIMAX + ALPHA BETA
// ==========================

function minimax(
    board,
    depth,
    alpha,
    beta,
    maximizing,
    aiColor
) {

    // Ende der Suche
    if (depth === 0) {
        return evaluateBoard(board, aiColor);
    }


    const currentColor =
        maximizing
            ? aiColor
            : oppositeColor(aiColor);

    const moves = getAllMoves(board, currentColor);

    if (moves.length === 0) {
        return evaluateBoard(board, aiColor);
    }


    const orderedMoves =
        orderMoves(board, moves);


    // ==========================
    // MAX
    // ==========================

    if (maximizing) {

        let best = -Infinity;

        for (const move of orderedMoves) {

            const newBoard =
                cloneBoard(board);

            const result =
                applyMove(newBoard, move);


            // König geschlagen
            if (result.winner === aiColor) {
                return 100000;
            }

            if (
                result.winner ===
                oppositeColor(aiColor)
            ) {
                continue;
            }


            const score = minimax(
                newBoard,
                depth - 1,
                alpha,
                beta,
                false,
                aiColor
            );

            best = Math.max(best, score);

            alpha = Math.max(alpha, best);

            if (beta <= alpha) {
                break;
            }
        }

        return best;
    }


    // ==========================
    // MIN
    // ==========================

    else {

        let best = Infinity;

        for (const move of orderedMoves) {

            const newBoard =
                cloneBoard(board);

            const result =
                applyMove(newBoard, move);


            if (
                result.winner ===
                oppositeColor(aiColor)
            ) {
                return -100000;
            }

            if (result.winner === aiColor) {
                continue;
            }


            const score = minimax(
                newBoard,
                depth - 1,
                alpha,
                beta,
                true,
                aiColor
            );

            best = Math.min(best, score);

            beta = Math.min(beta, best);

            if (beta <= alpha) {
                break;
            }
        }

        return best;
    }
}


// ==========================
// NEUE KI
// ==========================
//
// Tiefe 3:
// KI-Zug
//   -> Gegnerzug
//      -> KI-Zug
//
// Danach wird die Stellung bewertet.
//

export function getRandomMove(
    board,
    aiColor,
    skill = 3
) {

    const moves =
        getAllMoves(board, aiColor);

    if (!moves.length) {
        return null;
    }


    // ==========================
    // SKILL
    // ==========================

    let depth = 10;

    if (typeof skill === "number") {

        if (skill <= 1) depth = 1;
        else if (skill === 2) depth = 2;
        else depth = 10;
    }


    // ==========================
    // ZÜGE MISCHEN
    // ==========================

    // Dadurch entscheidet die KI bei
    // gleich guten Zügen nicht immer gleich.

    const shuffled =
        [...moves].sort(() => Math.random() - 0.5);


    let bestMove = shuffled[0];
    let bestScore = -Infinity;


    // ==========================
    // ALLE ZÜGE TESTEN
    // ==========================

    for (const move of shuffled) {

        const newBoard =
            cloneBoard(board);

        const result =
            applyMove(newBoard, move);


        // König sofort schlagen
        if (result.winner === aiColor) {
            return move;
        }


        const score = minimax(
            newBoard,

            // eigener Zug war schon Ebene 1
            depth - 1,

            -Infinity,
            Infinity,

            false,
            aiColor
        );


        if (score > bestScore) {

            bestScore = score;
            bestMove = move;
        }
    }


    return bestMove;
}
