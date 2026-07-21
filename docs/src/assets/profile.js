/* test
const profile = {
    picture: "txt-prof",
    color: "#ff00ea",
    border: 'gradient;["top","red","blue"]'
};
sessionStorage.setItem("profile-picture", JSON.stringify(profile));
*/

export function loadProfile(id, pre) {
    //session-storage
    const profilePicData = JSON.parse(
        sessionStorage.getItem("profile-picture")
        || '{"picture":"txt-prof","color":"#ff00ea","border":"none"}'
    );
    //select
    const div = document.getElementById(id);
    if (!div) return;
    //Bild
    const images = {
        "txt-prof": "standard.png"
    };
    const image = "src/img/profilePics/" + images[profilePicData.picture];
    div.style.backgroundImage = `url(${pre}${image})`;
    div.style.backgroundSize = "cover";
    div.style.backgroundPosition = "center";
    div.style.backgroundRepeat = "no-repeat";
    //hintergrund
    div.style.backgroundColor = profilePicData.color;
    //rahmen
    applyBorder(div, profilePicData.border);
}

function applyBorder(div, borderString) {
    if (!borderString) return;
    const i = borderString.indexOf(";");
    const type = borderString.substring(0, i);
    const param = borderString.substring(i + 1);
    // Alten Rahmen entfernen
    const old = div.querySelector(".profile-border");
    if (old) old.remove();
    div.style.position = "relative";
    div.style.overflow = "visible";
    const border = document.createElement("div");
    border.className = "profile-border";
    Object.assign(border.style, {
        position: "absolute",
        inset: "-4%",
        borderRadius: "50%",
        zIndex: "-1",
        pointerEvents: "none"
    });
    switch (type) {
        case "basic":
            border.style.background = param;
            break;
        case "gradient": {
            const [dir, ...colors] = JSON.parse(param);
            const dirs = {
                top: "to top",
                left: "to left",
                topleft: "to top left",
                topright: "to top right"
            };
            border.style.background =
                `linear-gradient(${dirs[dir] || "to right"}, ${colors.join(",")})`;
            break;
        }
        default:
            return;
    }
    div.appendChild(border);
};