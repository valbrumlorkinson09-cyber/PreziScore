// ==========================================
// ⚽ PREZISCORE
// SPORTScore API ENGINE
// ==========================================

const API_URL =
    "https://sportscore.com/api/widget";


// ==========================================
// API REQUEST
// ==========================================

async function apiRequest(endpoint) {

    try {

        const response = await fetch(
            API_URL + endpoint
        );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const data =
            await response.json();

        return data;

    } catch (error) {

        console.error(
            "❌ SportScore API Error:",
            error
        );

        return null;

    }

}


// ==========================================
// HELPERS
// ==========================================

function getElement(id) {

    return document.getElementById(id);

}


function showError(id) {

    const box =
        getElement(id);

    if (!box) return;

    box.innerHTML = `
        <p>
            ⚠️ Impossible de charger les données.
        </p>
    `;

}


// ==========================================
// 🔴 MATCHS LIVE + RÉSULTATS
// ==========================================

async function loadMatches(containerId) {

    const box =
        getElement(containerId);

    if (!box) return;


    box.innerHTML = `
        <p>
            🔄 Chargement des matchs...
        </p>
    `;


    const data =
        await apiRequest(
            "/matches/?sport=football&limit=50"
        );


    if (!data || !Array.isArray(data.matches)) {

        showError(containerId);

        return;

    }


    const matches =
        data.matches;


    const liveMatches =
        matches.filter(match => {

            const status =
                String(
                    match.status || ""
                ).toLowerCase();

            return (
                status === "live" ||
                status === "inplay" ||
                status === "1st half" ||
                status === "2nd half" ||
                status.includes("half") ||
                status.includes("live")
            );

        });


    if (liveMatches.length === 0) {

        box.innerHTML = `
            <p>
                Aucun match en direct actuellement.
            </p>
        `;

        return;

    }


    box.innerHTML = "";


    liveMatches
        .slice(0, 20)
        .forEach(match => {

            const home =
                match.home || "Équipe";

            const away =
                match.away || "Équipe";


            const homeScore =
                match.home_score ?? "-";

            const awayScore =
                match.away_score ?? "-";


            const status =
                match.status_text ||
                match.status ||
                "Live";


            const competition =
                match.competition ||
                "";


            box.innerHTML += `

                <div class="match-card">

                    <div class="match-teams">

                        <h3>
                            ${home}
                        </h3>

                        <strong>
                            ${homeScore}
                            -
                            ${awayScore}
                        </strong>

                        <h3>
                            ${away}
                        </h3>

                    </div>

                    <p>
                        🔴 ${status}
                    </p>

                    <small>
                        ${competition}
                    </small>

                </div>

            `;

        });

}


// ==========================================
// 📅 MATCHS À VENIR
// ==========================================

async function loadUpcomingMatches(
    containerId
) {

    const box =
        getElement(containerId);

    if (!box) return;


    box.innerHTML = `
        <p>
            🔄 Chargement des prochains matchs...
        </p>
    `;


    const data =
        await apiRequest(
            "/matches/?sport=football&limit=50"
        );


    if (!data || !Array.isArray(data.matches)) {

        showError(containerId);

        return;

    }


    const now =
        new Date();


    const upcoming =
        data.matches
            .filter(match => {

                const date =
                    new Date(match.time);

                return (
                    !isNaN(date) &&
                    date > now &&
                    match.status !== "finished"
                );

            })
            .sort(
                (a, b) =>
                    new Date(a.time) -
                    new Date(b.time)
            );


    if (upcoming.length === 0) {

        box.innerHTML = `
            <p>
                Aucun match prévu.
            </p>
        `;

        return;

    }


    box.innerHTML = "";


    upcoming
        .slice(0, 20)
        .forEach(match => {

            const home =
                match.home || "Équipe";

            const away =
                match.away || "Équipe";


            const date =
                new Date(match.time);


            const formattedDate =
                date.toLocaleString(
                    "fr-FR",
                    {
                        dateStyle: "short",
                        timeStyle: "short"
                    }
                );


            box.innerHTML += `

                <div class="match-card">

                    <h3>
                        ${home}
                    </h3>

                    <h2>
                        VS
                    </h2>

                    <h3>
                        ${away}
                    </h3>

                    <p>
                        📅 ${formattedDate}
                    </p>

                    <small>
                        ${match.competition || ""}
                    </small>

                </div>

            `;

        });

}


// ==========================================
// 🚀 INITIALISATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadMatches(
            "homeLiveMatches"
        );


        loadUpcomingMatches(
            "homeUpcomingMatches"
        );


        loadMatches(
            "liveMatches"
        );


        loadUpcomingMatches(
            "upcomingMatches"
        );

    }
);


console.log(
    "⚽ PreziScore - SportScore API Ready"
);

