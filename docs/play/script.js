const style = {

    board:{
        white:"#f0d9b5",
        black:"#b58863"
    },

    clock:{
        white:"#ffffff",
        black:"#000000"
    },

    pieces:{
        wp:"pieces/wp.png",
        wr:"pieces/wr.png",
        wn:"pieces/wn.png",
        wb:"pieces/wb.png",
        wq:"pieces/wq.png",
        wk:"pieces/wk.png",

        bp:"pieces/bp.png",
        br:"pieces/br.png",
        bn:"pieces/bn.png",
        bb:"pieces/bb.png",
        bq:"pieces/bq.png",
        bk:"pieces/bk.png"
    }

};


const boardMatrix = [

["br","bn","bb","bq","bk","bb","bn","br"],
["bp","bp","bp","bp","bp","bp","bp","bp"],
["","","","","","","",""],
["","","","","","","",""],
["","","","","","","",""],
["","","","","","","",""],
["wp","wp","wp","wp","wp","wp","wp","wp"],
["wr","wn","wb","wq","wk","wb","wn","wr"]

];


const board = document.getElementById("board");


function drawBoard(){

    board.innerHTML="";

    for(let y=0;y<8;y++){

        for(let x=0;x<8;x++){

            const square=document.createElement("div");

            square.className="square";

            square.style.background=
                (x+y)%2===0
                ?style.board.white
                :style.board.black;

            const piece=boardMatrix[y][x];

            if(piece){

                const img=document.createElement("img");

                img.src=style.pieces[piece];

                square.appendChild(img);

            }

            board.appendChild(square);

        }

    }

}


drawBoard(); 
