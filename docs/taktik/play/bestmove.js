const PUZZLE_CSV_PATH = "../../src/db/bestmove/puzzles_0001.csv";
const PUZZLE_OPPONENT_DELAY = 500;
const PUZZLE_NEXT_DELAY = 1000;
const AUTO_LOAD_NEXT_PUZZLE = true;
const BOARD_FILES = "abcdefgh";
const UCI_PATTERN = /^[a-h][1-8][a-h][1-8][qrbn]?$/i;

let puzzles = [];
let currentPuzzle = null;
let puzzleSolution = [];
let puzzleStep = 0;
let puzzleMode = false;
let puzzlesLoaded = false;
let puzzlesLoading = false;
let puzzleInputLocked = false;
let puzzleTimer = null;
let lastPuzzleId = null;
let puzzleEnPassantSquare = null;
let puzzlePlayerTurnSnapshot = null;
let puzzlePlayerTurnEnPassant = null;

async function runBestmove() {
    if (puzzlesLoading) {
        showPuzzleMessage("Die Schachaufgaben werden bereits geladen.", "info");
        return false;
    }

    clearPuzzleTimer();

    try {
        if (!puzzlesLoaded) {
            puzzlesLoading = true;
            puzzleInputLocked = true;
            showPuzzleMessage("Schachaufgaben werden geladen …", "info");

            const response = await fetch(PUZZLE_CSV_PATH);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const csv = await response.text();
            puzzles = parseCSV(csv);

            if (puzzles.length === 0) {
                throw new Error("Die CSV-Datei enthält keine gültigen Puzzles.");
            }

            puzzlesLoaded = true;
        }

        return loadRandomPuzzle();
    } catch (error) {
        puzzleMode = false;
        puzzleInputLocked = false;
        console.error("CSV konnte nicht geladen werden:", error);
        showPuzzleMessage("Die Schachaufgaben konnten nicht geladen werden.", "error");
        return false;
    } finally {
        puzzlesLoading = false;
    }
}

function parseCSV(csv) {
    if (typeof csv !== "string" || csv.trim() === "") {
        return [];
    }

    const result = Papa.parse(csv, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: header => header.trim()
    });

    if (!Array.isArray(result.data)) {
        return [];
    }

    return result.data
        .map(row => {
            const id = String(row.PuzzleId ?? "").trim();
            const fen = String(row.FEN ?? "").trim();
            const moves = String(row.Moves ?? "").trim();
            const solution = moves
                .split(/\s+/)
                .map(normalizeUCIMove)
                .filter(Boolean);

            return { id, fen, moves, solution };
        })
        .filter(puzzle => {
            return puzzle.fen &&
                puzzle.solution.length > 0 &&
                puzzle.solution.every(isValidUCIMove);
        });
}

function loadRandomPuzzle() {
    clearPuzzleTimer();

    if (!puzzlesLoaded || puzzles.length === 0) {
        showPuzzleMessage("Es sind keine Schachaufgaben verfügbar.", "error");
        return false;
    }

    currentPuzzle = selectRandomPuzzle();

    if (!currentPuzzle) {
        showPuzzleMessage("Es konnte kein Puzzle ausgewählt werden.", "error");
        return false;
    }

    lastPuzzleId = currentPuzzle.id;
    puzzleSolution = [...currentPuzzle.solution];
    puzzleStep = 0;
    puzzleMode = true;
    puzzleInputLocked = true;
    puzzleEnPassantSquare = getEnPassantSquareFromFEN(currentPuzzle.fen);
    puzzlePlayerTurnSnapshot = null;
    puzzlePlayerTurnEnPassant = null;

    try {
        loadFEN(currentPuzzle.fen);
        drawBoard();
    } catch (error) {
        console.error("Die Puzzle-Stellung konnte nicht geladen werden:", error);
        abortPuzzle("Die Puzzle-Stellung konnte nicht geladen werden.");
        return false;
    }

    showPuzzleMessage("Puzzle gestartet. Der Gegner zieht zuerst.", "info");

    puzzleTimer = window.setTimeout(() => {
        playOpponentMove();
    }, PUZZLE_OPPONENT_DELAY);

    return true;
}

function selectRandomPuzzle() {
    if (puzzles.length === 0) {
        return null;
    }

    if (puzzles.length === 1) {
        return puzzles[0];
    }

    let selected = null;
    let attempts = 0;

    do {
        selected = puzzles[Math.floor(Math.random() * puzzles.length)];
        attempts++;
    } while (selected.id === lastPuzzleId && attempts < 20);

    return selected;
}

function playOpponentMove() {
    clearPuzzleTimer();

    if (!puzzleMode) {
        return false;
    }

    if (puzzleStep >= puzzleSolution.length) {
        finishPuzzle();
        return true;
    }

    puzzleInputLocked = true;

    const move = puzzleSolution[puzzleStep];

    if (!applyMoveToBoard(move)) {
        abortPuzzle(`Der Gegnerzug ${move} konnte nicht ausgeführt werden.`);
        return false;
    }

    puzzleStep++;

    if (puzzleStep >= puzzleSolution.length) {
        finishPuzzle();
        return true;
    }

    puzzlePlayerTurnSnapshot = cloneBoardMatrix();
    puzzlePlayerTurnEnPassant = puzzleEnPassantSquare
        ? { ...puzzleEnPassantSquare }
        : null;
    puzzleInputLocked = false;
    showPuzzleMessage("Du bist am Zug.", "info");
    return true;
}

function checkPuzzleMove(move) {
    if (!puzzleMode) {
        return false;
    }

    if (puzzleInputLocked) {
        showPuzzleMessage("Bitte warte auf den Gegnerzug.", "info");
        return false;
    }

    const normalizedMove = normalizeUCIMove(move);

    if (!isValidUCIMove(normalizedMove)) {
        rollbackWrongPuzzleMove();
        showPuzzleMessage("Ungültiger Zug.", "error");
        return false;
    }

    if (puzzleStep >= puzzleSolution.length) {
        finishPuzzle();
        return false;
    }

    const correctMove = puzzleSolution[puzzleStep];

    restorePlayerTurnPosition();

    if (normalizedMove !== correctMove) {
        rollbackWrongPuzzleMove();
        showPuzzleMessage("Falscher Zug! Der Zug wurde zurückgenommen.", "error");
        return false;
    }

    puzzleInputLocked = true;

    if (!applyMoveToBoard(correctMove)) {
        puzzleInputLocked = false;
        restorePlayerTurnPosition();
        drawBoard();
        showPuzzleMessage("Der Zug konnte nicht ausgeführt werden.", "error");
        return false;
    }

    puzzleStep++;
    puzzlePlayerTurnSnapshot = null;
    puzzlePlayerTurnEnPassant = null;
    showPuzzleMessage("Richtiger Zug!", "success");

    if (puzzleStep >= puzzleSolution.length) {
        finishPuzzle();
        return true;
    }

    puzzleTimer = window.setTimeout(() => {
        playOpponentMove();
    }, PUZZLE_OPPONENT_DELAY);

    return true;
}

function restorePlayerTurnPosition() {
    if (!puzzlePlayerTurnSnapshot) {
        return false;
    }

    restoreBoardMatrix(puzzlePlayerTurnSnapshot);
    puzzleEnPassantSquare = puzzlePlayerTurnEnPassant
        ? { ...puzzlePlayerTurnEnPassant }
        : null;

    return true;
}

function rollbackWrongPuzzleMove() {
    const restore = () => {
        if (restorePlayerTurnPosition()) {
            drawBoard();
        }
    };

    restore();

    if (typeof queueMicrotask === "function") {
        queueMicrotask(restore);
    } else {
        Promise.resolve().then(restore);
    }

    window.requestAnimationFrame(restore);
}

function applyMoveToBoard(move) {
    const parsedMove = parseUCIMove(move);

    if (!parsedMove || !isBoardMatrixValid()) {
        return false;
    }

    const { fromX, fromY, toX, toY, promotion } = parsedMove;
    const movingPiece = boardMatrix[fromY][fromX];
    const targetPiece = boardMatrix[toY][toX];

    if (isEmptySquare(movingPiece)) {
        return false;
    }

    const movingPieceType = getPieceType(movingPiece);
    const movingPieceColor = getPieceColor(movingPiece);

    if (!movingPieceType || !movingPieceColor) {
        return false;
    }

    if (!isEmptySquare(targetPiece) && getPieceColor(targetPiece) === movingPieceColor) {
        return false;
    }

    const snapshot = cloneBoardMatrix();
    const previousEnPassant = puzzleEnPassantSquare
        ? { ...puzzleEnPassantSquare }
        : null;

    const isEnPassantMove =
        movingPieceType === "p" &&
        fromX !== toX &&
        isEmptySquare(targetPiece) &&
        puzzleEnPassantSquare !== null &&
        puzzleEnPassantSquare.x === toX &&
        puzzleEnPassantSquare.y === toY;

    if (isEnPassantMove) {
        const capturedPawnY = movingPieceColor === "white" ? toY + 1 : toY - 1;

        if (!isInsideBoard(toX, capturedPawnY)) {
            return false;
        }

        const capturedPawn = boardMatrix[capturedPawnY][toX];

        if (
            getPieceType(capturedPawn) !== "p" ||
            getPieceColor(capturedPawn) === movingPieceColor
        ) {
            return false;
        }

        boardMatrix[capturedPawnY][toX] = "";
    }

    boardMatrix[toY][toX] = movingPiece;
    boardMatrix[fromY][fromX] = "";

    if (movingPieceType === "k" && Math.abs(toX - fromX) === 2) {
        const castlingApplied = applyCastlingRookMove({
            kingFromX: fromX,
            kingToX: toX,
            row: fromY,
            color: movingPieceColor
        });

        if (!castlingApplied) {
            restoreBoardMatrix(snapshot);
            puzzleEnPassantSquare = previousEnPassant;
            return false;
        }
    }

    if (promotion) {
        const promotionRow = movingPieceColor === "white" ? 0 : 7;

        if (movingPieceType !== "p" || toY !== promotionRow) {
            restoreBoardMatrix(snapshot);
            puzzleEnPassantSquare = previousEnPassant;
            return false;
        }

        boardMatrix[toY][toX] = createPromotionPiece(promotion, movingPieceColor);
    }

    puzzleEnPassantSquare = null;

    if (movingPieceType === "p" && Math.abs(toY - fromY) === 2) {
        puzzleEnPassantSquare = {
            x: fromX,
            y: (fromY + toY) / 2
        };
    }

    drawBoard();
    return true;
}

function applyCastlingRookMove({ kingFromX, kingToX, row, color }) {
    const kingSide = kingToX > kingFromX;
    const rookFromX = kingSide ? 7 : 0;
    const rookToX = kingSide ? kingToX - 1 : kingToX + 1;
    const rook = boardMatrix[row][rookFromX];

    if (getPieceType(rook) !== "r" || getPieceColor(rook) !== color) {
        return false;
    }

    if (!isEmptySquare(boardMatrix[row][rookToX])) {
        return false;
    }

    boardMatrix[row][rookToX] = rook;
    boardMatrix[row][rookFromX] = "";
    return true;
}

function finishPuzzle() {
    clearPuzzleTimer();

    if (!puzzleMode) {
        return;
    }

    puzzleMode = false;
    puzzleInputLocked = true;
    showPuzzleMessage("Puzzle gelöst!", "success");

    if (!AUTO_LOAD_NEXT_PUZZLE) {
        puzzleInputLocked = false;
        return;
    }

    puzzleTimer = window.setTimeout(() => {
        loadRandomPuzzle();
    }, PUZZLE_NEXT_DELAY);
}

function abortPuzzle(reason) {
    clearPuzzleTimer();
    puzzleMode = false;
    puzzleInputLocked = false;
    console.error(reason);
    showPuzzleMessage(reason, "error");
}

function stopPuzzleMode() {
    clearPuzzleTimer();
    puzzleMode = false;
    puzzleInputLocked = false;
    currentPuzzle = null;
    puzzleSolution = [];
    puzzleStep = 0;
    puzzleEnPassantSquare = null;
    puzzlePlayerTurnSnapshot = null;
    puzzlePlayerTurnEnPassant = null;
    showPuzzleMessage("Puzzle-Modus beendet.", "info");
}

function normalizeUCIMove(move) {
    return String(move ?? "").trim().toLowerCase();
}

function isValidUCIMove(move) {
    return UCI_PATTERN.test(normalizeUCIMove(move));
}

function parseUCIMove(move) {
    const normalizedMove = normalizeUCIMove(move);

    if (!isValidUCIMove(normalizedMove)) {
        return null;
    }

    const fromX = BOARD_FILES.indexOf(normalizedMove[0]);
    const fromY = 8 - Number(normalizedMove[1]);
    const toX = BOARD_FILES.indexOf(normalizedMove[2]);
    const toY = 8 - Number(normalizedMove[3]);
    const promotion = normalizedMove[4] ?? "";

    if (!isInsideBoard(fromX, fromY) || !isInsideBoard(toX, toY)) {
        return null;
    }

    return { fromX, fromY, toX, toY, promotion };
}

function createUCIMove(fromX, fromY, toX, toY, promotion = "") {
    if (!isInsideBoard(fromX, fromY) || !isInsideBoard(toX, toY)) {
        return null;
    }

    const normalizedPromotion = String(promotion ?? "").trim().toLowerCase();

    if (normalizedPromotion && !/^[qrbn]$/.test(normalizedPromotion)) {
        return null;
    }

    return (
        BOARD_FILES[fromX] +
        String(8 - fromY) +
        BOARD_FILES[toX] +
        String(8 - toY) +
        normalizedPromotion
    );
}

function getEnPassantSquareFromFEN(fen) {
    if (typeof fen !== "string") {
        return null;
    }

    const parts = fen.trim().split(/\s+/);
    const square = parts[3];

    if (!square || square === "-" || !/^[a-h][1-8]$/.test(square)) {
        return null;
    }

    return {
        x: BOARD_FILES.indexOf(square[0]),
        y: 8 - Number(square[1])
    };
}

function createPromotionPiece(promotion, color) {
    const normalizedPromotion = String(promotion).toLowerCase();

    if (!/^[qrbn]$/.test(normalizedPromotion)) {
        return color === "white" ? "Q" : "q";
    }

    return color === "white"
        ? normalizedPromotion.toUpperCase()
        : normalizedPromotion;
}

function getPieceType(piece) {
    if (typeof piece !== "string" || piece.length === 0) {
        return null;
    }

    const normalizedPiece = piece.toLowerCase();

    if (!/^[pnbrqk]$/.test(normalizedPiece)) {
        return null;
    }

    return normalizedPiece;
}

function getPieceColor(piece) {
    if (typeof piece !== "string" || piece.length === 0) {
        return null;
    }

    if (/^[PNBRQK]$/.test(piece)) {
        return "white";
    }

    if (/^[pnbrqk]$/.test(piece)) {
        return "black";
    }

    return null;
}

function isEmptySquare(square) {
    return square === "" || square === null || square === undefined;
}

function isInsideBoard(x, y) {
    return Number.isInteger(x) &&
        Number.isInteger(y) &&
        x >= 0 &&
        x < 8 &&
        y >= 0 &&
        y < 8;
}

function isBoardMatrixValid() {
    return Array.isArray(boardMatrix) &&
        boardMatrix.length === 8 &&
        boardMatrix.every(row => Array.isArray(row) && row.length === 8);
}

function cloneBoardMatrix() {
    return boardMatrix.map(row => [...row]);
}

function restoreBoardMatrix(snapshot) {
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            boardMatrix[y][x] = snapshot[y][x];
        }
    }
}

function clearPuzzleTimer() {
    if (puzzleTimer !== null) {
        window.clearTimeout(puzzleTimer);
        puzzleTimer = null;
    }
}

function showPuzzleMessage(message, type = "info") {
    const element = document.getElementById("puzzle-message");

    if (element) {
        element.textContent = message;
        element.dataset.type = type;
    }

    if (type === "error") {
        console.error(message);
    } else {
        console.log(message);
    }
}