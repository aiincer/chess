fetch("../../api/ips.json")
    .then(res => res.json())
    .then(api => {
        const ptp = api.ptp;
        return fetch(ptp + "/rooms/friends", {
            method: "POST"
        });
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) {
            console.log("Raum erstellt:", data.code);
        } else {
            console.error("Fehler beim Erstellen");
        }
    })
    .catch(err => {
        console.error(err);
    });