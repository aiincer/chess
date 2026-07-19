/* Wheel Animation */
const words = document.querySelectorAll(".design-wheel span");
let offset = 0;
const radius = 40;
function update() {
    words.forEach((word, i) => {
        const angle = ((i + offset) * 360 / words.length) * Math.PI / 180;
        const y = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const scale = 0.7 + (z + radius) / (2 * radius) * 0.3;
        const opacity = 0.3 + (z + radius) / (2 * radius) * 0.7;
        word.style.transform =
            `translateY(${y}px) scale(${scale})`;
        word.style.opacity = opacity;
        word.style.zIndex = Math.round(z);
    });
}
update();
setInterval(() => {
    offset++;
    update();
}, 1000);

/* SET CARD WHEEL */
const setWheel = document.getElementById("setWheel");
let sets = [];
let cards = [];
let rotation = 0;
let speed = 0.25;
let currentSet = 0;
async function loadSetWheel(){
    const res = await fetch("./api/sets.json");
    const data = await res.json();
    sets = Object.keys(data).map(id => ({
        id:id,
        ...data[id]
    }));
    createCards();
    animate();
}
function createCards(){
    setWheel.innerHTML="";
    cards=[];
    for(let i=0;i<10;i++){
        const card=document.createElement("div");
        card.className="set-card-wheel";
        card.dataset.lastAngle="";
        card.dataset.set="";
        setWheel.appendChild(card);
        cards.push(card);
    }
}
function renderCard(card,set){
    card.classList.remove("set-card-back");
    card.innerHTML=`
        <img src="./src/img/sets/${set.id}/icon.png">
        <div class="wheel-content">
            <h3>
                ${set.name ?? set.id}
            </h3>
            <p>
                ${set.desc ?? ""}
            </p>
        </div>
    `;
    card.dataset.set=set.id;
}
function renderBack(card){
    card.classList.add("set-card-back");
    card.innerHTML="";
}
function animate(){
    rotation += speed;
    cards.forEach((card,index)=>{
        const count = cards.length;
        let angle =
            (index * 360 / count) + rotation;
        let rad = angle * Math.PI / 180;
        let x = Math.sin(rad) * 500;
        let z = Math.cos(rad) * 500;
        card.style.transform =
        `
        translateX(${x}px)
        translateZ(${z}px)
        rotateY(${angle}deg)
        `;
        let front =
            Math.cos(rad);
        if(front > 0){
            card.style.opacity = 1;
            card.style.zIndex = Math.floor(z+600);
            if(card.dataset.loaded !== "true"){
                let set =
                sets[currentSet % sets.length];
                renderCard(card,set);
                currentSet++;
                card.dataset.loaded="true";
            }
        }
        else{
            card.style.opacity = 0.4;
            card.style.zIndex=0;
            renderBack(card);
            card.dataset.loaded="false";
        }
    });
    requestAnimationFrame(animate);
}
loadSetWheel();