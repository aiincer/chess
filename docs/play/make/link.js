// supabase.js
const SUPABASE_URL = "https://uftyuhenbrwefwywgvlf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdHl1aGVuYnJ3ZWZ3eXdndmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MzIyNzUsImV4cCI6MjA5OTAwODI3NX0.Tvg_kz_5-Qb3KWs0HmdxGoLJ3Yj4_rmGCiwRf2Vq97U";
const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// Erstellt einen zufälligen Raumcode
function createCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// Erstellt einen neuen Raum
async function createRoom() {
    const code = createCode();
    const { data, error } = await client
        .from("rooms")
        .insert([
            {
                code: code
            }
        ])
        .select();
    if (error) {
        console.error("Fehler beim Erstellen:", error);
        return {
            ok: false
        };
    }
    console.log("Raum erstellt:", data[0].code);
    return {
        ok: true,
        code: data[0].code
    };
}

// Test
createRoom()
.then(result => {
    if (result.ok) {
        console.log("Dein Raumcode:", result.code);
    }
});