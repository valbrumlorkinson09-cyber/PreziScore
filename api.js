// =====================================================
// ⚽ PREZISCORE — API ENGINE
// =====================================================
// REAL FOOTBALL DATA ONLY
// No fake matches
// No API key
// =====================================================


const SPORT_SCORE_API =
    "https://sportscore.com/api/widget";


// =====================================================
// GLOBAL STATE
// =====================================================

let preziMatches = [];


// =====================================================
// API REQUEST
// =====================================================

async function sportScoreRequest(endpoint) {

    try {

        const response = await fetch(
            SPORT_SCORE_API + endpoint
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        return await response.json();

    }

    catch (error) {

        console.error(
            "SportScore API:",
            error
        );


        return null;

    }

}


// =====================================================
// HELPERS
// =====================================================

function getElement(id) {

    return document.getElementById(id);

}


function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function getTeamName(
    match,
    side
) {

    if (side === "home") {

        return (
            match.home ||
            match.home_team ||
            match.homeTeam ||
            match.teams?.home?.name ||
            "Équipe"
        );

    }


    return (
        match.away ||
        match.away_team ||
        match.awayTeam ||
        match.teams?.away?.name ||
        "Équipe"
    );

}


function getMatchId(match) {

    return (
        match.slug ||
        match.id ||
        match.match_id ||
        match.fixture_id ||
        ""
    );

}


// =====================================================
// 🔴 LIVE MATCHES
// =====================================================

async function loadLiveMatches(
    containerId
) {

    const box =
        getElement(containerId);


    if (!box) return;


    box.innerHTML = `
        <p>
            🔄 Chargement des matchs en direct...
        </p>
    `;


    const data =
        await sportScoreRequest(
            "/matches/?sport=football&limit=100"
        );


    if (!data) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger les données.
            </p>
        `;

        return;

    }


    const matches =
        Array.isArray(data.matches)
            ? data.matches
            : [];


    preziMatches = matches;


    const live =
        matches.filter(match => {

            const status =
                String(
                    match.status_text ||
                    match.status ||
                    ""
                ).toLowerCase();


            return (
                status.includes("live") ||
                status.includes("half") ||
                status.includes("1st") ||
                status.includes("2nd") ||
                status.includes("extra")
            );

        });


    if (live.length === 0) {

        box.innerHTML = `
            <p>
                Aucun match en direct actuellement.
            </p>
        `;

        return;

    }


    box.innerHTML = "";


    live.slice(0, 30)
        .forEach(match => {

            renderMatchCard(
                box,
                match,
                true
            );

        });

}


// =====================================================
// 📅 UPCOMING MATCHES
// =====================================================

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
        await sportScoreRequest(
            "/matches/?sport=football&limit=100"
        );


    if (!data) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger les données.
            </p>
        `;

        return;

    }


    const matches =
        Array.isArray(data.matches)
            ? data.matches
            : [];


    preziMatches = matches;


    const now =
        Date.now();


    const upcoming =
        matches
            .filter(match => {

                const time =
                    new Date(
                        match.time ||
                        match.start_time ||
                        match.date
                    ).getTime();


                const status =
                    String(
                        match.status_text ||
                        match.status ||
                        ""
                    ).toLowerCase();


                return (
                    !isNaN(time) &&
                    time > now &&
                    !status.includes("finished") &&
                    !status.includes("ended")
                );

            })
            .sort((a, b) => {

                const timeA =
                    new Date(
                        a.time ||
                        a.start_time ||
                        a.date
                    ).getTime();


                const timeB =
                    new Date(
                        b.time ||
                        b.start_time ||
                        b.date
                    ).getTime();


                return timeA - timeB;

            });


    if (upcoming.length === 0) {

        box.innerHTML = `
            <p>
                Aucun match prévu.
            </p>
        `;

        return;

    }


    box.innerHTML = "";


    upcoming.slice(0, 30)
        .forEach(match => {

            renderMatchCard(
                box,
                match,
                false
            );

        });

}


// =====================================================
// 🧩 MATCH CARD
// =====================================================

function renderMatchCard(
    box,
    match,
    isLive
) {

    const home =
        escapeHTML(
            getTeamName(
                match,
                "home"
            )
        );


    const away =
        escapeHTML(
            getTeamName(
                match,
                "away"
            )
        );


    const homeScore =
        match.home_score ??
        match.homeScore ??
        match.goals?.home ??
        "-";


    const awayScore =
        match.away_score ??
        match.awayScore ??
        match.goals?.away ??
        "-";


    const status =
        escapeHTML(
            match.status_text ||
            match.status ||
            ""
        );


    const competition =
        escapeHTML(
            match.competition ||
            match.league ||
            ""
        );


    const matchId =
        getMatchId(match);


    const time =
        match.time ||
        match.start_time ||
        match.date ||
        "";


    let dateText = "";


    if (time) {

        const date =
            new Date(time);


        if (!isNaN(date)) {

            dateText =
                date.toLocaleString(
                    "fr-FR",
                    {
                        dateStyle: "short",
                        timeStyle: "short"
                    }
                );

        }

    }


    const clickable =
        matchId
            ? `onclick="openMatch('${encodeURIComponent(
                matchId
            )}')"`
            : "";


    box.innerHTML += `

        <article
            class="match-card"
            ${clickable}
            style="
                cursor:${matchId
                    ? "pointer"
                    : "default"};
            "
        >

            <div class="match-teams">

                <h3>
                    ${home}
                </h3>

                <strong>

                    ${
                        isLive
                        ? `${homeScore} - ${awayScore}`
                        : "VS"
                    }

                </strong>

                <h3>
                    ${away}
                </h3>

            </div>


            ${
                isLive
                ?
                `
                    <p>
                        🔴 ${status}
                    </p>
                `
                :
                `
                    <p>
                        📅 ${dateText}
                    </p>
                `
            }


            ${
                competition
                ?
                `
                    <small>
                        ${competition}
                    </small>
                `
                :
                ""
            }


            ${
                matchId
                ?
                `
                    <div class="match-link">
                        Voir les détails →
                    </div>
                `
                :
                ""
            }

        </article>

    `;

}


// =====================================================
// 🔎 MATCH DETAILS
// =====================================================

async function loadMatchDetails(
    matchId,
    containerId
) {

    const box =
        getElement(containerId);


    if (!box) return;


    box.innerHTML = `
        <p>
            🔄 Chargement du match...
        </p>
    `;


    const data =
        await sportScoreRequest(
            `/match/?sport=football&slug=${encodeURIComponent(
                matchId
            )}`
        );


    if (!data) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger le match.
            </p>
        `;

        return;

    }


    const match =
        data.match ||
        data;


    if (!match) {

        box.innerHTML = `
            <p>
                Match introuvable.
            </p>
        `;

        return;

    }


    const home =
        escapeHTML(
            getTeamName(
                match,
                "home"
            )
        );


    const away =
        escapeHTML(
            getTeamName(
                match,
                "away"
            )
        );


    const homeScore =
        match.home_score ??
        match.homeScore ??
        "-";


    const awayScore =
        match.away_score ??
        match.awayScore ??
        "-";


    const status =
        escapeHTML(
            match.status_text ||
            match.status ||
            ""
        );


    const competition =
        escapeHTML(
            match.competition ||
            match.league ||
            ""
        );


    box.innerHTML = `

        <div class="match-detail-card">

            <p>
                ${competition}
            </p>


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


            <p>
                ${status}
            </p>

        </div>

    `;


    return match;

}


// =====================================================
// 📊 STATISTICS
// =====================================================

async function loadMatchStatistics(
    matchId,
    containerId
) {

    const box =
        getElement(containerId);


    if (!box) return;


    box.innerHTML = `
        <p>
            🔄 Chargement des statistiques...
        </p>
    `;


    const data =
        await sportScoreRequest(
            `/match/?sport=football&slug=${encodeURIComponent(
                matchId
            )}`
        );


    if (!data) {

        box.innerHTML = `
            <p>
                📊 Statistiques indisponibles.
            </p>
        `;

        return;

    }


    const match =
        data.match ||
        data;


    const statistics =
        match.statistics ||
        match.stats ||
        [];


    if (
        !Array.isArray(statistics) ||
        statistics.length === 0
    ) {

        box.innerHTML = `
            <p>
                📊 Statistiques indisponibles.
            </p>
        `;

        return;

    }


    box.innerHTML = "";


    statistics.forEach(stat => {

        const name =
            escapeHTML(
                stat.name ||
                stat.type ||
                "Statistique"
            );


        const home =
            stat.home ??
            stat.home_value ??
            "-";


        const away =
            stat.away ??
            stat.away_value ??
            "-";


        box.innerHTML += `

            <div class="stats-row">

                <span>
                    ${home}
                </span>

                <strong>
                    ${name}
                </strong>

                <span>
                    ${away}
                </span>

            </div>

        `;

    });

}


// =====================================================
// 👥 LINEUPS
// =====================================================

async function loadLineups(
    matchId,
    containerId
) {

    const box =
        getElement(containerId);


    if (!box) return;


    box.innerHTML = `
        <p>
            🔄 Chargement des compositions...
        </p>
    `;


    const data =
        await sportScoreRequest(
            `/match/?sport=football&slug=${encodeURIComponent(
                matchId
            )}`
        );


    if (!data) {

        box.innerHTML = `
            <p>
                👥 Compositions indisponibles.
            </p>
        `;

        return;

    }


    const match =
        data.match ||
        data;


    const lineups =
        match.lineups ||
        match.lineup ||
        [];


    if (
        !Array.isArray(lineups) ||
        lineups.length === 0
    ) {

        box.innerHTML = `
            <p>
                👥 Compositions indisponibles.
            </p>
        `;

        return;

    }


    box.innerHTML = "";


    lineups.forEach(team => {

        const teamName =
            escapeHTML(
                team.team ||
                team.name ||
                team.team_name ||
                "Équipe"
            );


        const players =
            team.players ||
            team.lineup ||
            team.startXI ||
            [];


        box.innerHTML += `

            <div class="lineup-card">

                <h3>
                    ${teamName}
                </h3>

                <ul>

                    ${
                        Array.isArray(players)
                        ?
                        players.map(player => `

                            <li>
                                ${
                                    escapeHTML(
                                        player.name ||
                                        player.player?.name ||
                                        player.player ||
                                        "Joueur"
                                    )
                                }
                            </li>

                        `).join("")
                        :
                        "<li>Données indisponibles</li>"
                    }

                </ul>

            </div>

        `;

    });

}


// =====================================================
// 🔗 OPEN MATCH
// =====================================================

function openMatch(matchId) {

    if (!matchId) {

        return;

    }


    window.location.href =
        `match.html?id=${matchId}`;

}


// =====================================================
// 🌍 PUBLIC API
// =====================================================

window.PreziScore = {

    loadLiveMatches,
    loadUpcomingMatches,
    loadMatchDetails,
    loadMatchStatistics,
    loadLineups

};


// =====================================================
// 🚀 INITIALIZATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            getElement(
                "homeLiveMatches"
            )
        ) {

            loadLiveMatches(
                "homeLiveMatches"
            );

        }


        if (
            getElement(
                "homeUpcomingMatches"
            )
        ) {

            loadUpcomingMatches(
                "homeUpcomingMatches"
            );

        }


        if (
            getElement(
                "liveMatches"
            )
        ) {

            loadLiveMatches(
                "liveMatches"
            );

        }


        if (
            getElement(
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
    "⚽ PreziScore API Engine Ready"
);
