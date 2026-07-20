function loadProfile(id) {
    const profilePicData = JSON.parse(sessionStorage.getItem("profile-picture"));

    const div = document.getElementById(id);
    if (!div) return;

    const images = {
        "txt-prof": "https://aiincer.github.io/favicon.ico"
    };
    const image = images[profilePicData.picture];

    div.style.backgroundImage = `url(${image})`;
    div.style.backgroundSize = "cover";
    div.style.backgroundPosition = "center";
    div.style.backgroundRepeat = "no-repeat";
}