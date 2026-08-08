// ======================================
// ⚽ PREZISCORE
// SPORTSRC API - PART 1
// ======================================

const API_URL = "https://sportsrc.org/api";


// ======================================
// API REQUEST
// ======================================

async function apiRequest(endpoint) {

    try {

        const response = await fetch(
            API_URL + endpoint,
            {
                method: "GET"
            }
        );


        console.log(
            "SPORTSRC STATUS:",
            response.status
        );


        const text =
            await response.text();


        console.log(
            "SPORTSRC RESPONSE:",
            text
        );


        if (!response.ok) {

            return {
                success: false,
                response: [],
                error: `HTTP ${response.status}`
            };

        }


        try {

            const data =
                JSON.parse(text);


            return {
                success: true,
                response:
                    data.response ||
                    data.data ||
                    data ||
                    []
            };

        } catch {

            return {
                success: false,
                response: [],
                error:
                    "Réponse API non JSON"
            };

        }

    } catch (error) {

        console.error(
            "SPORTSRC ERROR:",
            error
        );


        return {
            success: false,
            response: [],
            error:
                error.message
        };

    }

}


// ======================================
// 🔴 LIVE MATCHES
// ======================================

async function loadLiveMatches(containerId) {

    const box =
        document.getElementById(containerId);


    if (!box) return;


    box.innerHTML = `
        <p>
            🔄 Chargement des matchs en direct...
        </p>
    `;


    /*
       Endpoint de test.
       Si SportSRC utilise une autre route,
       nous la corrigerons après le test.
    */

    const data =
        await apiRequest(
            "/live"
        );


    if (!data.success) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger les données.
            </p>

            <small>
                ${data.error || ""}
            </small>
        `;

        return;
    }


    const matches =
        Array.isArray(data.response)
            ? data.response
            : [];


    if (matches.length === 0) {

        box.innerHTML = `
            <p>
                Aucun match en direct actuellement.
            </p>
        `;

        return;
    }


    box.innerHTML = "";


    matches
        .slice(0, 10)
        .forEach(match => {

            const home =
                match.homeTeam?.name ||
                match.home?.name ||
                match.teams?.home?.name ||
                "Équipe domicile";


            const away =
                match.awayTeam?.name ||
                match.away?.name ||
                match.teams?.away?.name ||
                "Équipe extérieure";


            const homeScore =
                match.homeScore ??
                match.goals?.home ??
                0;


            const awayScore =
                match.awayScore ??
                match.goals?.away ??
                0;


            const status =
                match.status?.name ||
                match.status ||
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
// 🚀 START
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadLiveMatches(
            "homeLiveMatches"
        );


        loadLiveMatches(
            "liveMatches"
        );

    }
);


console.log(
    "⚽ PreziScore SportSRC API loaded."
);

// ======================================
// ⚽ PREZISCORE
// SPORTSRC API - PART 2
// UPCOMING MATCHES
// ======================================


// ======================================
// 📅 MATCHS KAP VINI
// ======================================

async function loadUpcomingMatches(containerId) {

    const box =
        document.getElementById(containerId);


    if (!box) return;


    box.innerHTML = `
        <p>
            🔄 Chargement des prochains matchs...
        </p>
    `;


    // ==============================
    // API REQUEST
    // ==============================

    const data =
        await apiRequest(
            "/matches"
        );


    // ==============================
    // API ERROR
    // ==============================

    if (!data.success) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger les données.
            </p>

            <small>
                ${data.error || ""}
            </small>
        `;

        return;
    }


    // ==============================
    // GET MATCHES
    // ==============================

    const matches =
        Array.isArray(data.response)
            ? data.response
            : [];


    // ==============================
    // NO MATCHES
    // ==============================

    if (matches.length === 0) {

        box.innerHTML = `
            <p>
                Aucun match prévu.
            </p>
        `;

        return;
    }


    // ==============================
    // DISPLAY
    // ==============================

    box.innerHTML = "";


    matches
        .slice(0, 20)
        .forEach(match => {


            const home =
                match.homeTeam?.name ||
                match.home?.name ||
                match.teams?.home?.name ||
                "Équipe domicile";


            const away =
                match.awayTeam?.name ||
                match.away?.name ||
                match.teams?.away?.name ||
                "Équipe extérieure";


            const date =
                match.startTime ||
                match.date ||
                match.fixture?.date ||
                "";


            let formattedDate =
                "Date inconnue";


            if (date) {

                const parsedDate =
                    new Date(date);


                if (!isNaN(parsedDate)) {

                    formattedDate =
                        parsedDate.toLocaleString(
                            "fr-FR",
                            {
                                dateStyle: "short",
                                timeStyle: "short"
                            }
                        );

                }

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
                        📅 ${formattedDate}
                    </p>

                </div>

            `;

        });

}


// ======================================
// 🚀 START UPCOMING MATCHES
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        // 🏠 ACCUEIL

        if (
            document.getElementById(
                "homeUpcomingMatches"
            )
        ) {

            loadUpcomingMatches(
                "homeUpcomingMatches"
            );

        }


        // ⚽ PAGE MATCHS

        if (
            document.getElementById(
                "upcomingMatches"
            )
        ) {

            loadUpcomingMatches(
                "upcomingMatches"
            );

        }

    }
);


console.log(
    "📅 Upcoming Matches System Ready"
);

// ======================================
// ⚽ PREZISCORE
// SPORTSRC API - PART 3
// STATISTIQUES + COMPOSITIONS
// ======================================


// ======================================
// 📊 STATISTIQUES MATCH
// ======================================

async function loadMatchStatistics(
    matchId,
    containerId
) {

    const box =
        document.getElementById(containerId);


    if (!box) return;


    box.innerHTML = `
        <p>
            🔄 Chargement des statistiques...
        </p>
    `;


    const data =
        await apiRequest(
            `/matches/${matchId}/statistics`
        );


    if (!data.success) {

        box.innerHTML = `
            <p>
                ⚠️ Statistiques indisponibles.
            </p>
        `;

        return;
    }


    const statistics =
        Array.isArray(data.response)
            ? data.response
            : [];


    if (statistics.length === 0) {

        box.innerHTML = `
            <p>
                Statistiques indisponibles.
            </p>
        `;

        return;
    }


    box.innerHTML = "";


    statistics.forEach(team => {

        const teamName =
            team.team?.name ||
            team.name ||
            "Équipe";


        const stats =
            team.statistics ||
            team.stats ||
            [];


        box.innerHTML += `

            <div class="stats-card">

                <h3>
                    ${teamName}
                </h3>

                <div class="stats-list">

                    ${
                        Array.isArray(stats)
                        ?
                        stats.map(stat => `

                            <p>

                                <strong>
                                    ${
                                        stat.type ||
                                        stat.name ||
                                        "Stat"
                                    }
                                </strong>

                                :

                                ${
                                    stat.value ??
                                    stat.total ??
                                    0
                                }

                            </p>

                        `).join("")
                        :
                        "<p>Aucune statistique.</p>"
                    }

                </div>

            </div>

        `;

    });

}


// ======================================
// 👥 COMPOSITIONS
// ======================================

async function loadLineups(
    matchId,
    containerId
) {

    const box =
        document.getElementById(containerId);


    if (!box) return;


    box.innerHTML = `
        <p>
            🔄 Chargement des compositions...
        </p>
    `;


    const data =
        await apiRequest(
            `/matches/${matchId}/lineups`
        );


    if (!data.success) {

        box.innerHTML = `
            <p>
                ⚠️ Composition indisponible.
            </p>
        `;

        return;
    }


    const teams =
        Array.isArray(data.response)
            ? data.response
            : [];


    if (teams.length === 0) {

        box.innerHTML = `
            <p>
                Composition indisponible.
            </p>
        `;

        return;
    }


    box.innerHTML = "";


    teams.forEach(team => {


        const teamName =
            team.team?.name ||
            team.name ||
            "Équipe";


        const starters =
            team.startXI ||
            team.startingXI ||
            team.lineup ||
            [];


        const substitutes =
            team.substitutes ||
            team.bench ||
            [];


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
                        Array.isArray(starters)
                        ?
                        starters.map(player => `

                            <li>

                                ${
                                    player.player?.name ||
                                    player.name ||
                                    "Joueur"
                                }

                            </li>

                        `).join("")
                        :
                        "<li>Indisponible</li>"
                    }

                </ul>


                <h4>
                    🔄 Remplaçants
                </h4>


                <ul>

                    ${
                        Array.isArray(substitutes)
                        ?
                        substitutes.map(player => `

                            <li>

                                ${
                                    player.player?.name ||
                                    player.name ||
                                    "Joueur"
                                }

                            </li>

                        `).join("")
                        :
                        "<li>Indisponible</li>"
                    }

                </ul>

            </div>

        `;

    });

}


// ======================================
// 🔎 MATCH DETAIL
// ======================================

async function loadMatchDetails(
    matchId,
    containerId
) {

    const box =
        document.getElementById(containerId);


    if (!box) return;


    box.innerHTML = `
        <p>
            🔄 Chargement du match...
        </p>
    `;


    const data =
        await apiRequest(
            `/matches/${matchId}`
        );


    if (!data.success) {

        box.innerHTML = `
            <p>
                ⚠️ Informations du match indisponibles.
            </p>
        `;

        return;
    }


    const match =
        Array.isArray(data.response)
            ? data.response[0]
            : data.response;


    if (!match) {

        box.innerHTML = `
            <p>
                Match introuvable.
            </p>
        `;

        return;
    }


    const home =
        match.homeTeam?.name ||
        match.home?.name ||
        match.teams?.home?.name ||
        "Équipe domicile";


    const away =
        match.awayTeam?.name ||
        match.away?.name ||
        match.teams?.away?.name ||
        "Équipe extérieure";


    const homeScore =
        match.homeScore ??
        match.goals?.home ??
        "-";


    const awayScore =
        match.awayScore ??
        match.goals?.away ??
        "-";


    box.innerHTML = `

        <div class="match-detail-card">

            <h2>
                ${home}
            </h2>

            <div class="match-score">

                ${homeScore}

                -

                ${awayScore}

            </div>

            <h2>
                ${away}
            </h2>

        </div>

    `;

}


// ======================================
// 📌 GLOBAL FUNCTIONS
// ======================================

window.PreziScore = {

    loadMatchStatistics,

    loadLineups,

    loadMatchDetails

};


console.log(
    "📊 Statistics + 👥 Lineups Ready"
);
