function loadProfile(id, pre) {
    //session-storage
    const profilePicData = JSON.parse(sessionStorage.getItem("profile-picture"));
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
}