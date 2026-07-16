// =====================================================
// SUPABASE CLIENT
// =====================================================
const SUPABASE_URL = "https://uftyuhenbrwefwywgvlf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdHl1aGVuYnJ3ZWZ3eXdndmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MzIyNzUsImV4cCI6MjA5OTAwODI3NX0.Tvg_kz_5-Qb3KWs0HmdxGoLJ3Yj4_rmGCiwRf2Vq97U";
const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
// =====================================================
// ONLINE DATEN
// =====================================================
let chessChannel = null;
const roomCode =
    sessionStorage.getItem("roomCode");
const gameDetails = JSON.parse(
    sessionStorage.getItem("gameDetails")
);
const playerColor =
    gameDetails.color === 0
    ? "white"
    : "black";
// =====================================================
// REALTIME VERBINDUNG
// =====================================================
function initOnlineGame(){
    if(!roomCode){
        console.log(
            "Kein roomCode"
        );
        return;
    }
    chessChannel =
        supabaseClient.channel(
            "chess-room-" + roomCode
        );
    chessChannel
    .on(
        "broadcast",
        {
            event:"move"
        },
        data=>{
            receiveRemoteMove(
                data.payload
            );
        }
    )
    .subscribe(status=>{
        console.log(
            "Realtime:",
            status
        );
    });
}
// =====================================================
// ZUG SENDEN
// =====================================================
function sendOnlineMove(entry){
    if(!chessChannel)
        return;
    chessChannel.send({
        type:"broadcast",
        event:"move",
        payload:entry
    });
}
// =====================================================
// GEGNERISCHEN ZUG AUSFÜHREN
// =====================================================
function receiveRemoteMove(entry){
    const piece =
        boardMatrix[
            entry.from.y
        ][
            entry.from.x
        ];
    // En Passant
    if(entry.enPassant){
        boardMatrix[
            entry.from.y
        ][
            entry.to.x
        ] = "";
    }
    // Rochade
    if(entry.castle){
        const rookFrom =
            entry.castle === "king"
            ? 7
            : 0;
        const rookTo =
            entry.castle === "king"
            ? 5
            : 3;
        boardMatrix[
            entry.to.y
        ][
            rookTo
        ] =
        boardMatrix[
            entry.to.y
        ][
            rookFrom
        ];
        boardMatrix[
            entry.to.y
        ][
            rookFrom
        ]="";
    }
    boardMatrix[
        entry.to.y
    ][
        entry.to.x
    ] = piece;
    boardMatrix[
        entry.from.y
    ][
        entry.from.x
    ]="";
    // Promotion
    if(entry.promotion){
        boardMatrix[
            entry.to.y
        ][
            entry.to.x
        ] =
        entry.promotion;
    }
    setMoved(
        entry.from,
        entry.to
    );
    moveHistory.push(entry);
    lastMove=entry;
    if(
        entry.captured &&
        entry.captured.toLowerCase()==="k"
    ){
        winner =
        pieceColor(entry.piece);
        updateGameStatus(
            winner==="white"
            ? "Weiss gewinnt"
            : "Schwarz gewinnt"
        );
    }
    else{
        switchTurn();
    }
    drawBoard();
    updateGameInfo();
    initLocalControls();
}
// =====================================================
// SPIELSTEUERUNG
// =====================================================
function initLocalControls(){
const squares =
document.querySelectorAll(".square");
squares.forEach((square,index)=>{
const x=index%8;
const y=Math.floor(index/8);
square.onclick=()=>{
if(
    winner ||
    promotionPending
)
return;
// falscher Spieler
if(
    activePlayer !== playerColor
)
return;
if(selected===null){
    if(
        boardMatrix[y][x]!=="" &&
        pieceColor(
            boardMatrix[y][x]
        )===activePlayer
    ){
        selected={
            x,
            y
        };
        move(x,y);
        drawBoard();
        initLocalControls();
    }
}
else{
const from=selected;
if(
    from.x===x &&
    from.y===y
){
selected=null;
resetColors();
drawBoard();
initLocalControls();
return;
}
const color =
colorMatrix[y][x];
if(
color==="m" ||
color==="M" ||
color==="t" ||
color==="T"
){
const waits =
executeLocalMove(
    from,
    {
        x,
        y
    }
);
selected=null;
resetColors();
drawBoard();
initLocalControls();
if(waits)
return;
}
else{
selected=null;
resetColors();
drawBoard();
initLocalControls();
if(
boardMatrix[y][x]!=="" &&
pieceColor(
boardMatrix[y][x]
)===activePlayer
){
selected={
x,
y
};
move(x,y);
drawBoard();
initLocalControls();
}
}
}
};
});
}
// =====================================================
// ZUG AUSFÜHREN
// =====================================================
function executeLocalMove(from,to){
const piece =
boardMatrix[from.y][from.x];
let captured =
boardMatrix[to.y][to.x];
let castle=null;
let enPassant=false;
if(
piece.toLowerCase()==="b" &&
to.x!==from.x &&
captured===""
){
enPassant=true;
captured =
boardMatrix[from.y][to.x];
boardMatrix[from.y][to.x]="";
}
if(
piece.toLowerCase()==="k" &&
Math.abs(to.x-from.x)===2
){
castle =
to.x>from.x
? "king"
: "queen";
const rookFrom =
castle==="king"
?7
:0;
const rookTo =
castle==="king"
?5
:3;
boardMatrix[to.y][rookTo]=
boardMatrix[to.y][rookFrom];
boardMatrix[to.y][rookFrom]="";
}
boardMatrix[to.y][to.x]=piece;
boardMatrix[from.y][from.x]="";
setMoved(from,to);
const entry={
piece,
from:{...from},
to:{...to},
captured,
castle,
enPassant
};
if(
piece.toLowerCase()==="b" &&
(to.y===0 || to.y===7)
){
promotionPending=true;
showPromotionWindow(
pieceColor(piece),
promoted=>{
boardMatrix[to.y][to.x]=promoted;
entry.promotion=promoted;
finishLocalMove(entry);
promotionPending=false;
resetColors();
drawBoard();
initLocalControls();
}
);
return true;
}
finishLocalMove(entry);
return false;
}
// =====================================================
// ZUG BEENDET
// =====================================================
function finishLocalMove(entry){
moveHistory.push(entry);
lastMove=entry;
// ONLINE SENDEN
sendOnlineMove(entry);
if(
entry.captured &&
entry.captured.toLowerCase()==="k"
){
winner =
pieceColor(entry.piece);
updateGameStatus(
winner==="white"
? "Weiss gewinnt"
: "Schwarz gewinnt"
);
}
else{
switchTurn();
}
updateGameInfo();
}
// =====================================================
// PROMOTION
// =====================================================
function showPromotionWindow(color,onChoose){
const existing =
document.getElementById(
"promotionOverlay"
);
if(existing)
existing.remove();
const overlay =
document.createElement("div");
overlay.id="promotionOverlay";
const box =
document.createElement("div");
box.id="promotionBox";
const title =
document.createElement("div");
title.id="promotionTitle";
title.textContent=
"Bauer umwandeln";
box.appendChild(title);
const options =
color==="white"
?["D","T","L","S"]
:["d","t","l","s"];
options.forEach(piece=>{
const button =
document.createElement("button");
button.className=
"promotionOption";
const img =
document.createElement("img");
img.src=
style.pieces[piece];
button.appendChild(img);
button.onclick=()=>{
overlay.remove();
onChoose(piece);
};
box.appendChild(button);
});
overlay.appendChild(box);
document.body.appendChild(overlay);
}
// START
initOnlineGame();
initLocalControls();