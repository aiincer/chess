// gamemode
const gameDetails = JSON.parse(
    sessionStorage.getItem("gameDetails") ||
    '{"color":0,"time":"60:60","gameMode":"standard","mode":"lokal","vs":""}'
);
const gameMode = gameDetails.gameMode;
const playingAgainst = gameDetails.mode;
const playingColor = gameDetails.color;
const opponentSet = sessionStorage.getItem("opponent-set") || "standard";
const isBlind = gameMode === "blind";
const isBlindPlus = gameMode === "blind+";
const isStandard = gameMode === "standard";
// design
const skinData = JSON.parse(
    sessionStorage.getItem("skin") ||
    '{"set":"standard","color":{}}'
);
const pieceSet = skinData.set || "standard";
const boardColors = skinData.color || {};
let whiteSet = pieceSet;
let blackSet = pieceSet;
if (playingAgainst === "online") {
    if (playingColor === 1) {
        whiteSet = pieceSet;
        blackSet = opponentSet;
    } else {
        whiteSet = opponentSet;
        blackSet = pieceSet;
    }
}
const style = {
    board: {
        l: boardColors.l || "#b58863",
        L: boardColors.L || "#f0d9b5",
        m: boardColors.m || "#2e7d32",
        M: boardColors.M || "#66bb6a",
        t: boardColors.t || "#b71c1c",
        T: boardColors.T || "#ef5350"
    },
    pieces: {
        // ♟️ Schwarz
        b: `../src/img/sets/${blackSet}/black/b.png`,
        t: `../src/img/sets/${blackSet}/black/t.png`,
        s: `../src/img/sets/${blackSet}/black/s.png`,
        l: `../src/img/sets/${blackSet}/black/l.png`,
        d: `../src/img/sets/${blackSet}/black/d.png`,
        k: `../src/img/sets/${blackSet}/black/k.png`,
        // ♟️ Weiß
        B: `../src/img/sets/${whiteSet}/white/b.png`,
        T: `../src/img/sets/${whiteSet}/white/t.png`,
        S: `../src/img/sets/${whiteSet}/white/s.png`,
        L: `../src/img/sets/${whiteSet}/white/l.png`,
        D: `../src/img/sets/${whiteSet}/white/d.png`,
        K: `../src/img/sets/${whiteSet}/white/k.png`
    }
};
//render-settings
let boardRotated;
if (playingColor === 0) {
    boardRotated = true;
} else {
    boardRotated = false;
}
const boardObject = document.getElementById("board");
if (boardRotated) {
    boardObject.classList.add("boardRotated");
} else {
    boardObject.classList.remove("boardRotated");
}