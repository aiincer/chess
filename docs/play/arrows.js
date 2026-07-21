let arrowMode = false;
let arrowStart = null;
let arrows = [];


window.addEventListener("DOMContentLoaded",()=>{


const board =
document.getElementById("board");

const wrapper =
document.getElementById("boardWrapper");

const controls =
document.getElementById("arrowControls");

const button =
document.getElementById("arrowButton");

const color =
document.getElementById("arrowColor");



// sichtbar nur nicht lokal

const data =
JSON.parse(
sessionStorage.getItem("gameDetails")
);


if(data && data.mode !== "lokal"){
    controls.style.display="flex";
}



// Button

button.onclick=()=>{

    arrowMode=!arrowMode;

    button.textContent =
    arrowMode
    ?
    "Pfeile aktiv"
    :
    "Pfeile";

    clearStart();

};



// GLOBALER BLOCKER

board.addEventListener(
"click",
(e)=>{


if(!arrowMode)
return;


e.stopImmediatePropagation();
e.preventDefault();


const square =
e.target.closest(".square");


if(!square)
return;



const squares =
[...document.querySelectorAll(".square")];


const index =
squares.indexOf(square);


const x =
index % 8;


const y =
Math.floor(index/8);



arrowClick(x,y);


},
true
);




// Feld klick

function arrowClick(x,y){


    // Startfeld braucht Figur
    if(!arrowStart){

        if(!boardMatrix[y][x])
            return;


        arrowStart={
            x,
            y
        };


        drawCircle(x,y);


        return;
    }



    // gleiches Feld löschen

    if(
        arrowStart.x===x &&
        arrowStart.y===y
    ){

        clearStart();
        return;

    }



    createArrow(
        arrowStart.x,
        arrowStart.y,
        x,
        y,
        color.value
    );


    arrowStart=null;
    removeCircle();

}





// Kreis

function drawCircle(x,y){

    removeCircle();


    const size =
        board.clientWidth / 8;


    const c =
        document.createElement("div");


    c.id="arrowCircle";

    c.className="arrowCircle";


    c.style.width =
        size*0.45+"px";


    c.style.height =
        size*0.45+"px";


let drawX = x;
let drawY = y;


// schwarze Perspektive
if(board.classList.contains("boardRotated")){
    drawX = 7 - x;
    drawY = 7 - y;
}


c.style.left =
    drawX * size +
    size * 0.275 +
    "px";


c.style.top =
    drawY * size +
    size * 0.275 +
    "px";


    c.style.borderColor =
        color.value;



    // Drehung übernehmen
    if(board.classList.contains("boardRotated")){
        
        c.style.transformOrigin =
            "center";

    }


    wrapper.appendChild(c);

}



function removeCircle(){

const c =
document.getElementById(
"arrowCircle"
);


if(c)
c.remove();

}



function clearStart(){

arrowStart=null;

removeCircle();

}




// Pfeil speichern

function createArrow(
x1,y1,x2,y2,c
){

arrows.push({

from:{x:x1,y:y1},

to:{x:x2,y:y2},

color:c

});


drawArrows();

}





// Zeichnen

function drawArrows(){


const old =
document.getElementById("arrowSVG");


if(old)
old.remove();



const svg =
document.createElementNS(
"http://www.w3.org/2000/svg",
"svg"
);


svg.id="arrowSVG";



// Rotation übernehmen

if(
board.classList.contains(
"boardRotated"
)
){

svg.classList.add(
"boardRotated"
);

}




svg.innerHTML="";



const size =
board.clientWidth/8;

const shorten = size * 0.15;

arrows.forEach(
(a,index)=>{

const markerId =
"arrowHead"+index;


const defs =
svg.querySelector("defs")
||
document.createElementNS(
"http://www.w3.org/2000/svg",
"defs"
);


if(!svg.querySelector("defs")){
    svg.appendChild(defs);
}


const marker =
document.createElementNS(
"http://www.w3.org/2000/svg",
"marker"
);


marker.id =
markerId;


marker.setAttribute(
    "markerWidth",
    "10"
);

marker.setAttribute(
    "markerHeight",
    "6"
);

marker.setAttribute(
    "refX",
    "7"
);

marker.setAttribute(
    "refY",
    "2"
);


marker.setAttribute(
"orient",
"auto"
);



const polygon =
document.createElementNS(
"http://www.w3.org/2000/svg",
"polygon"
);


polygon.setAttribute(
"points",
"4 0, 10 2, 4 4"
);


polygon.setAttribute(
"fill",
a.color
);


polygon.setAttribute(
"opacity",
"1"
);



marker.appendChild(polygon);

defs.appendChild(marker);
const line =
document.createElementNS(
"http://www.w3.org/2000/svg",
"line"
);



line.setAttribute(
"x1",
a.from.x*size+size/2
);


line.setAttribute(
"y1",
a.from.y*size+size/2
);



let dx =
(a.to.x*size+size/2) -
(a.from.x*size+size/2);


let dy =
(a.to.y*size+size/2) -
(a.from.y*size+size/2);


let length =
Math.sqrt(dx*dx+dy*dy);


line.setAttribute(
"x2",
a.to.x*size+size/2 -
(dx/length)*shorten
);


line.setAttribute(
"y2",
a.to.y*size+size/2 -
(dy/length)*shorten
);



line.setAttribute(
"stroke",
a.color
);


line.setAttribute(
"stroke-width",
size*0.08
);


line.setAttribute(
"marker-end",
`url(#${markerId})`
);


line.setAttribute(
"opacity",
"0.5"
);


line.style.color =
a.color;



line.classList.add(
"arrowLine"
);



// Pfeil löschen

line.onclick=(e)=>{

e.stopPropagation();

arrows.splice(index,1);

drawArrows();

};



svg.appendChild(line);


});



wrapper.appendChild(svg);


}






// Ungültige Startfelder entfernen

window.validateArrows=function(){


arrows =
arrows.filter(a=>{


return !!boardMatrix
[a.from.y]
[a.from.x];


});


drawArrows();

};



});