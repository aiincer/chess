function loadProfile(id) {
    const div = document.getElementById(id);
    if (!div) return;

    div.style.backgroundImage = "url('https://aiincer.github.io/favicon.ico')";
    div.style.backgroundSize = "cover";
    div.style.backgroundPosition = "center";
    div.style.backgroundRepeat = "no-repeat";
}