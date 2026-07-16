const skinData = JSON.parse(
    sessionStorage.getItem("skin") ||
    '{"set":"standard","color":{}}'
);
const pieceSet = skinData.set || "standard";
const boardColors = skinData.color || {};
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
    // ♟️ black
    b: `../src/img/sets/${pieceSet}/black/b.png`,
    t: `../src/img/sets/${pieceSet}/black/t.png`,
    s: `../src/img/sets/${pieceSet}/black/s.png`,
    l: `../src/img/sets/${pieceSet}/black/l.png`,
    d: `../src/img/sets/${pieceSet}/black/d.png`,
    k: `../src/img/sets/${pieceSet}/black/k.png`,
    // ♟️ white
    B: `../src/img/sets/${pieceSet}/white/b.png`,
    T: `../src/img/sets/${pieceSet}/white/t.png`,
    S: `../src/img/sets/${pieceSet}/white/s.png`,
    L: `../src/img/sets/${pieceSet}/white/l.png`,
    D: `../src/img/sets/${pieceSet}/white/d.png`,
    K: `../src/img/sets/${pieceSet}/white/k.png`
}
};