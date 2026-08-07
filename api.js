// ======================================
// ⚽ PREZISCORE API ENGINE
// PART 1/4
// API CONNECTION + ERROR SYSTEM
// ======================================


// ======================================
// API CONFIGURATION
// ======================================

const API_KEY =
    "47f671279defefb2b169097f1062a2a6";

const API_URL =
    "https://v3.football.api-sports.io";


// ======================================
// GLOBAL API REQUEST
// ======================================

async function apiRequest(endpoint) {

    try {

        console.log("📡 API REQUEST:", endpoint);


        const response = await fetch(
            API_URL + endpoint,
            {
                method: "GET",

                headers: {
                    "x-apisports-key": API_KEY
                }
            }
        );


        // ==============================
        // HTTP ERROR
        // ==============================

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "❌ API HTTP ERROR:",
                response.status,
                errorText
            );


            return {
                success: false,
                response: [],
                errors: {
                    http: response.status,
                    message: errorText
                }
            };

        }


        // ==============================
        // JSON RESPONSE
        // ==============================

        const data =
            await response.json();


        console.log(
            "✅ API RESPONSE:",
            data
        );


        // ==============================
        // API ERROR
        // ==============================

        if (
            data.errors &&
            Object.keys(data.errors).length > 0
        ) {

            console.error(
                "❌ API ERRORS:",
                data.errors
            );


            return {
                success: false,
                response: data.response || [],
                errors: data.errors
            };

        }


        // ==============================
        // SUCCESS
        // ==============================

        return {
            success: true,
            response: data.response || [],
            errors: {}
        };


    } catch (error) {


        console.error(
            "❌ NETWORK ERROR:",
            error
        );


        return {
            success: false,
            response: [],
            errors: {
                network: error.message
            }
        };

    }

}


// ======================================
// ELEMENT HELPER
// ======================================

function getElement(id) {

    return document.getElementById(id);

}


// ======================================
// LOADING
// ======================================

function loading(id, text) {

    const box =
        getElement(id);


    if (box) {

        box.innerHTML =
            `<p>${text}</p>`;

    }

}


// ======================================
// API ERROR DISPLAY
// ======================================

function showApiError(id, data) {

    const box =
        getElement(id);


    if (!box) return;


    console.error(
        "PreziScore API Error:",
        data.errors
    );


    let message =
        "Impossible de charger les données.";


    if (data.errors?.http) {

        message =
            `Erreur API HTTP ${data.errors.http}`;

    }


    if (data.errors?.message) {

        message =
            `Erreur API : ${data.errors.message}`;

    }


    if (data.errors?.network) {

        message =
            `Erreur réseau : ${data.errors.network}`;

    }


    box.innerHTML = `
        <div class="api-error">
            <p>⚠️ ${message}</p>
            <small>
                Vérifiez la connexion API.
            </small>
        </div>
    `;

}


// ======================================
// SYSTEM STATUS
// ======================================

console.log(
    "⚽ PreziScore API Engine loaded."
);

// ======================================
// ⚽ PREZISCORE API ENGINE
// PART 2/4
// LIVE + UPCOMING MATCHES
// ======================================


// ======================================
// 🔴 LIVE MATCHES
// ======================================

async function loadLiveMatches(containerId) {

    const box =
        getElement(containerId);

    if (!box) return;


    loading(
        containerId,
        "Chargement des matchs en direct..."
    );


    const data =
        await apiRequest(
            "/fixtures?live=all"
        );


    // ==============================
    // API ERROR
    // ==============================

    if (!data.success) {

        showApiError(
            containerId,
            data
        );

        return;
    }


    // ==============================
    // NO LIVE MATCH
    // ==============================

    if (
        !data.response ||
        data.response.length === 0
    ) {

        box.innerHTML = `
            <p>
                Aucun match en direct actuellement.
            </p>
        `;

        return;
    }


    // ==============================
    // DISPLAY MATCHES
    // ==============================

    box.innerHTML = "";


    data.response
        .slice(0, 20)
        .forEach(match => {


            const home =
                match.teams?.home?.name ||
                "Équipe";


            const away =
                match.teams?.away?.name ||
                "Équipe";


            const homeScore =
                match.goals?.home ?? 0;


            const awayScore =
                match.goals?.away ?? 0;


            const status =
                match.fixture?.status?.long ||
                "Live";


            box.innerHTML += `

                <div class="match-card">

                    <h3>
                        ${home}
                    </h3>

                    <h2>
                        ${homeScore}
                        -
                        ${awayScore}
                    </h2>

                    <h3>
                        ${away}
                    </h3>

                    <p>
                        🔴 ${status}
                    </p>

                </div>

            `;

        });

}


// ======================================
// 📅 UPCOMING MATCHES
// ======================================

async function loadUpcomingMatches(containerId) {

    const box =
        getElement(containerId);

    if (!box) return;


    loading(
        containerId,
        "Chargement du calendrier..."
    );


    // ==============================
    // TODAY
    // ==============================

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const data =
        await apiRequest(
            `/fixtures?date=${today}`
        );


    // ==============================
    // API ERROR
    // ==============================

    if (!data.success) {

        showApiError(
            containerId,
            data
        );

        return;
    }


    // ==============================
    // NO MATCH
    // ==============================

    if (
        !data.response ||
        data.response.length === 0
    ) {

        box.innerHTML = `
            <p>
                Aucun match prévu aujourd'hui.
            </p>
        `;

        return;
    }


    // ==============================
    // DISPLAY MATCHES
    // ==============================

    box.innerHTML = "";


    data.response
        .slice(0, 20)
        .forEach(match => {


            const home =
                match.teams?.home?.name ||
                "Équipe";


            const away =
                match.teams?.away?.name ||
                "Équipe";


            const date =
                match.fixture?.date;


            let matchDate =
                "Date inconnue";


            if (date) {

                matchDate =
                    new Date(date)
                        .toLocaleString(
                            "fr-FR"
                        );

            }


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
                        📅 ${matchDate}
                    </p>

                </div>

            `;

        });

}


// ======================================
// SYSTEM STATUS
// ======================================

console.log(
    "🔴 Live Matches System ready."
);


console.log(
    "📅 Upcoming Matches System ready."
);

// ======================================
// ⚽ PREZISCORE API ENGINE
// PART 3/4
// STATISTICS + LINEUPS
// ======================================


// ======================================
// 📊 MATCH STATISTICS
// ======================================

async function loadMatchStatistics(
    fixtureId,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box) return;


    loading(
        containerId,
        "Chargement des statistiques..."
    );


    // ==============================
    // API REQUEST
    // ==============================

    const data =
        await apiRequest(
            `/fixtures/statistics?fixture=${fixtureId}`
        );


    // ==============================
    // ERROR
    // ==============================

    if (!data.success) {

        showApiError(
            containerId,
            data
        );

        return;
    }


    // ==============================
    // NO DATA
    // ==============================

    if (
        !data.response ||
        data.response.length === 0
    ) {

        box.innerHTML = `
            <p>
                Statistiques indisponibles.
            </p>
        `;

        return;
    }


    // ==============================
    // DISPLAY
    // ==============================

    box.innerHTML = "";


    data.response.forEach(team => {


        const teamName =
            team.team?.name ||
            "Équipe";


        box.innerHTML += `

            <div class="stats-card">

                <h3>
                    ${teamName}
                </h3>

                <div class="stats-list">

                    ${
                        (team.statistics || [])
                        .map(stat => `

                            <div class="stat-row">

                                <span>
                                    ${stat.type}
                                </span>

                                <strong>
                                    ${stat.value ?? 0}
                                </strong>

                            </div>

                        `)
                        .join("")
                    }

                </div>

            </div>

        `;

    });

}


// ======================================
// 👥 COMPOSITION DES ÉQUIPES
// ======================================

async function loadLineups(
    fixtureId,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box) return;


    loading(
        containerId,
        "Chargement des compositions..."
    );


    // ==============================
    // API REQUEST
    // ==============================

    const data =
        await apiRequest(
            `/fixtures/lineups?fixture=${fixtureId}`
        );


    // ==============================
    // ERROR
    // ==============================

    if (!data.success) {

        showApiError(
            containerId,
            data
        );

        return;
    }


    // ==============================
    // NO DATA
    // ==============================

    if (
        !data.response ||
        data.response.length === 0
    ) {

        box.innerHTML = `
            <p>
                Composition indisponible.
            </p>
        `;

        return;
    }


    // ==============================
    // DISPLAY TEAMS
    // ==============================

    box.innerHTML = "";


    data.response.forEach(team => {


        const teamName =
            team.team?.name ||
            "Équipe";


        const startXI =
            team.startXI || [];


        const substitutes =
            team.substitutes || [];


        box.innerHTML += `

            <div class="lineup-card">

                <h3>
                    ${teamName}
                </h3>


                <h4>
                    👕 Titulaires
                </h4>

                <ul>

                    ${
                        startXI
                        .map(player => `

                            <li>
                                ${
                                    player.player?.name ||
                                    "Joueur"
                                }
                            </li>

                        `)
                        .join("")
                    }

                </ul>


                <h4>
                    🔄 Remplaçants
                </h4>

                <ul>

                    ${
                        substitutes
                        .map(player => `

                            <li>
                                ${
                                    player.player?.name ||
                                    "Joueur"
                                }
                            </li>

                        `)
                        .join("")
                    }

                </ul>

            </div>

        `;

    });

}


// ======================================
// SYSTEM STATUS
// ======================================

console.log(
    "📊 Statistics System ready."
);


console.log(
    "👥 Lineups System ready."
);

// ======================================
// ⚽ PREZISCORE API ENGINE
// PART 4/4
// COMPETITIONS + AUTO START
// ======================================


// ======================================
// 🏆 COMPETITIONS
// ======================================

const PREZISCORE_LEAGUES = {

    premierLeague: 39,

    laLiga: 140,

    ligue1: 61,

    serieA: 135,

    bundesliga: 78,

    championsLeague: 2

};


// ======================================
// 📊 LOAD STANDINGS
// ======================================

async function loadStandings(
    leagueId,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box) return;


    loading(
        containerId,
        "Chargement du classement..."
    );


    // ==============================
    // CURRENT SEASON
    // ==============================

    const currentYear =
        new Date().getFullYear();


    // ==============================
    // API REQUEST
    // ==============================

    const data =
        await apiRequest(
            `/standings?league=${leagueId}&season=${currentYear}`
        );


    // ==============================
    // API ERROR
    // ==============================

    if (!data.success) {

        showApiError(
            containerId,
            data
        );

        return;
    }


    // ==============================
    // NO DATA
    // ==============================

    if (
        !data.response ||
        data.response.length === 0
    ) {

        box.innerHTML = `
            <p>
                Classement indisponible.
            </p>
        `;

        return;
    }


    // ==============================
    // GET STANDINGS
    // ==============================

    const league =
        data.response[0]?.league;


    const standings =
        league?.standings?.[0];


    if (!standings) {

        box.innerHTML = `
            <p>
                Classement indisponible.
            </p>
        `;

        return;
    }


    // ==============================
    // DISPLAY
    // ==============================

    box.innerHTML = "";


    standings.forEach(team => {


        const rank =
            team.rank ?? "-";


        const name =
            team.team?.name ||
            "Équipe";


        const points =
            team.points ?? 0;


        const played =
            team.all?.played ?? 0;


        box.innerHTML += `

            <div class="standing-card">

                <span class="standing-rank">
                    ${rank}
                </span>


                <strong class="standing-team">
                    ${name}
                </strong>


                <span class="standing-played">
                    ${played} matchs
                </span>


                <span class="standing-points">
                    ${points} pts
                </span>

            </div>

        `;

    });

}


// ======================================
// 🚀 AUTO START
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        console.log(
            "🚀 PreziScore system starting..."
        );


        // ==============================
        // 🏠 HOME PAGE
        // ==============================

        if (
            getElement("homeLiveMatches")
        ) {

            loadLiveMatches(
                "homeLiveMatches"
            );

        }


        if (
            getElement("homeUpcomingMatches")
        ) {

            loadUpcomingMatches(
                "homeUpcomingMatches"
            );

        }


        // ==============================
        // ⚽ MATCHES PAGE
        // ==============================

        if (
            getElement("liveMatches")
        ) {

            loadLiveMatches(
                "liveMatches"
            );

        }


        if (
            getElement("upcomingMatches")
        ) {

            loadUpcomingMatches(
                "upcomingMatches"
            );

        }


        // ==============================
        // 🏆 COMPETITIONS PAGE
        // ==============================

        if (
            getElement("standings")
        ) {

            loadStandings(
                PREZISCORE_LEAGUES.premierLeague,
                "standings"
            );

        }


        if (
            getElement("premierLeague")
        ) {

            loadStandings(
                PREZISCORE_LEAGUES.premierLeague,
                "premierLeague"
            );

        }


        if (
            getElement("laLiga")
        ) {

            loadStandings(
                PREZISCORE_LEAGUES.laLiga,
                "laLiga"
            );

        }


        if (
            getElement("ligue1")
        ) {

            loadStandings(
                PREZISCORE_LEAGUES.ligue1,
                "ligue1"
            );

        }


        if (
            getElement("serieA")
        ) {

            loadStandings(
                PREZISCORE_LEAGUES.serieA,
                "serieA"
            );

        }


        if (
            getElement("bundesliga")
        ) {

            loadStandings(
                PREZISCORE_LEAGUES.bundesliga,
                "bundesliga"
            );

        }


        if (
            getElement("championsLeague")
        ) {

            loadStandings(
                PREZISCORE_LEAGUES.championsLeague,
                "championsLeague"
            );

        }


    }
);


// ======================================
// FINAL STATUS
// ======================================

console.log(
    "⚽ PreziScore API Engine ready."
);

console.log(
    "🔴 Live Matches: READY"
);

console.log(
    "📅 Upcoming Matches: READY"
);

console.log(
    "📊 Statistics: READY"
);

console.log(
    "👥 Lineups: READY"
);

console.log(
    "🏆 Competitions: READY"
);

console.log(
    "🚀 PreziScore Global System Loaded!"
);
