(() => {

    const dataRaw = sessionStorage.getItem("gameDetails");

    if (!dataRaw) {
        console.warn("Keine gameDetails gefunden");
        return;
    }
    
    const data = JSON.parse(dataRaw);
    console.log(data)
    // ZEIT PARSEN ("10:10")
    let timeStr = data.time || "10:10";

    const parts = timeStr.split(":").map(Number);

    let baseSeconds = 600; // fallback 10 min

    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const minutes = parts[0];
        const increment = parts[1]; // aktuell nicht genutzt, aber vorhanden
        baseSeconds = minutes * 60;
    }

    // SCRIPT LOADER
    function loadScript(src) {
        const script = document.createElement("script");
        script.src = src;
        script.type = "module";
        document.body.appendChild(script);
    }

    // MODE HANDLING
    switch (data.mode) {

        case "lokal":
            setClocks(baseSeconds);
            loadScript("./code/local.js");
            break;

        case "ai":
            setClocks(baseSeconds);
            loadScript("./code/ai/run-ran1.js");
            break;

        case "online":
            setClocks(baseSeconds);
            loadScript("./code/online.js");
            break;

        default:
            console.warn("Unbekannter Mode:", data.mode);
            setClocks(baseSeconds);
            loadScript("./code/local.js");
            break;
    }

    
    // CLOCK SETZEN
    function setClocks(seconds) {
        window.clocks = {
            white: seconds,
            black: seconds
        };
    }
})(); 
