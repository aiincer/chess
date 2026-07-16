const SUPABASE_URL = "https://uftyuhenbrwefwywgvlf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdHl1aGVuYnJ3ZWZ3eXdndmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MzIyNzUsImV4cCI6MjA5OTAwODI3NX0.Tvg_kz_5-Qb3KWs0HmdxGoLJ3Yj4_rmGCiwRf2Vq97U";
const client = window.supabase.createClient(
	SUPABASE_URL,
	SUPABASE_KEY
);

function setStatus(color) {
	const status = document.getElementById("status");
	if (status) {
		status.style.background = color;
	}
}

async function joinRoom() {
	const params = new URLSearchParams(window.location.search);
	const roomCode = params.get("code");
	if (!roomCode) {
		console.error("Kein Raumcode gefunden");
        setStatus("red");
		return;
	}
	console.log("Beitreten zu:", roomCode);
	const { data, error } = await client
		.from("rooms")
		.update({
			opponent: true
		})
		.eq("code", roomCode)
		.select();
	if (error) {
		console.error("Fehler beim Beitreten:", error);
        setStatus("red");
		return;
	}
	if (data.length === 0) {
		console.error("Raum nicht gefunden");
		return;
	}
	console.log("Erfolgreich beigetreten:", data[0].code);
    setStatus("green");
}

joinRoom();