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