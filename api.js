// ======================================================
// ⚽ PREZISCORE — SPORTScore API
// API.JS — PATI 1/4
// CONFIG • REQUEST • HELPERS
// ======================================================


// ======================================================
// 🌐 API
// ======================================================

const SPORT_SCORE_API =
    "https://sportscore.com/api/widget";


// ======================================================
// 🌍 GLOBAL DATA
// ======================================================

let preziMatches = [];


// ======================================================
// 🌐 API REQUEST
// ======================================================

async function sportScoreRequest(endpoint) {

    try {

        const response = await fetch(
            SPORT_SCORE_API + endpoint,
            {
                method: "GET",

                headers: {
                    "Accept": "application/json"
                }
            }
        );


        console.log(
            "🌐 SportScore:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "✅ SportScore DATA:",
            data
        );


        return data;

    }

    catch (error) {

        console.error(
            "❌ SportScore ERROR:",
            error
        );


        return null;

    }

}


// ======================================================
// 🧩 ELEMENT
// ======================================================

function getElement(id) {

    return document.getElementById(id);

}


// ======================================================
// 🔒 SECURITY
// ======================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ======================================================
// 📦 EXTRACT MATCHES
// ======================================================

function extractMatches(data) {

    if (!data) {

        return [];

    }


    if (Array.isArray(data)) {

        return data;

    }


    if (Array.isArray(data.matches)) {

        return data.matches;

    }


    if (Array.isArray(data.data)) {

        return data.data;

    }


    if (Array.isArray(data.results)) {

        return data.results;

    }


    return [];

}


// ======================================================
// 🆔 MATCH SLUG / ID
// ======================================================

function getMatchSlug(match) {

    return (
        match?.slug ||
        match?.id ||
        match?.match_id ||
        ""
    );

}


// ======================================================
// ⚽ TEAM
// ======================================================

function getTeam(match, side) {

    const team =
        match?.[side] ||
        match?.teams?.[side] ||
        match?.[`${side}_team`] ||
        null;


    return team;

}


// ======================================================
// 🏠 TEAM NAME
// ======================================================

function getTeamName(match, side) {

    const team =
        getTeam(
            match,
            side
        );


    if (typeof team === "string") {

        return team;

    }


    return (
        team?.name ||
        team?.title ||
        team?.short_name ||
        team?.short_code ||
        "Équipe"
    );

}


// ======================================================
// 🔢 TEAM ID
// ======================================================

function getTeamId(match, side) {

    const team =
        getTeam(
            match,
            side
        );


    if (typeof team === "string") {

        return null;

    }


    return (
        team?.id ||
        team?.team_id ||
        null
    );

}


// ======================================================
// 📅 MATCH DATE
// ======================================================

function getMatchDate(match) {

    return (
        match?.starting_at ||
        match?.start_time ||
        match?.date ||
        match?.datetime ||
        match?.timestamp ||
        ""
    );

}


// ======================================================
// 📊 STATUS
// ======================================================

function getMatchStatus(match) {

    return (
        match?.status ||
        match?.state ||
        match?.match_status ||
        match?.status_name ||
        ""
    );

}


// ======================================================
// 🔄 NORMALIZE STATUS
// ======================================================

function normalizedStatus(match) {

    const status =
        getMatchStatus(match);


    if (
        typeof status === "object"
    ) {

        return String(
            status?.name ||
            status?.short_name ||
            status?.type ||
            ""
        )
        .toUpperCase()
        .trim();

    }


    return String(status)
        .toUpperCase()
        .trim();

}


// ======================================================
// 📅 FORMAT DATE
// ======================================================

function formatDate(value) {

    if (!value) {

        return "";

    }


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleString(
        "fr-FR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


// ======================================================
// ⚽ SCORE
// ======================================================

function getScore(match, side) {

    const team =
        getTeam(
            match,
            side
        );


    if (typeof team === "object") {

        return (
            team?.score ??
            team?.goals ??
            0
        );

    }


    const scores =
        match?.scores ||
        match?.score ||
        {};


    if (
        typeof scores === "object"
    ) {

        return (
            scores?.[side] ??
            scores?.[`${side}_score`] ??
            0
        );

    }


    return 0;

}


// ======================================================
// 🏆 COMPETITION
// ======================================================

function getCompetition(match) {

    const competition =
        match?.competition ||
        match?.league ||
        match?.tournament ||
        "";


    if (
        typeof competition === "string"
    ) {

        return competition;

    }


    return (
        competition?.name ||
        competition?.title ||
        ""
    );

}


// ======================================================
// ⏱️ LIVE MINUTE
// ======================================================

function getLiveMinute(match) {

    return (
        match?.minute ||
        match?.match_minute ||
        match?.elapsed ||
        match?.time ||
        ""
    );

}


// ======================================================
// 🔴 LIVE
// ======================================================

function isLiveMatch(match) {

    const status =
        normalizedStatus(match);


    const liveStatuses = [

        "LIVE",
        "INPLAY",
        "IN_PLAY",
        "PLAYING",
        "1H",
        "2H",
        "HT",
        "ET",
        "BREAK",
        "HALFTIME"

    ];


    return liveStatuses.includes(
        status
    );

}


// ======================================================
// ✅ FINISHED
// ======================================================

function isFinishedMatch(match) {

    const status =
        normalizedStatus(match);


    const finishedStatuses = [

        "FT",
        "FINISHED",
        "ENDED",
        "END",
        "FULL TIME",
        "COMPLETED"

    ];


    return finishedStatuses.includes(
        status
    );

}


// ======================================================
// 📅 UPCOMING
// ======================================================

function isUpcomingMatch(match) {

    if (
        isLiveMatch(match)
    ) {

        return false;

    }


    if (
        isFinishedMatch(match)
    ) {

        return false;

    }


    const value =
        getMatchDate(match);


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    return (
        date.getTime() >
        Date.now()
    );

}


// ======================================================
// 🔗 OPEN MATCH
// ======================================================

function openMatch(slug) {

    if (!slug) {

        return;

    }


    window.location.href =
        "match-details.html?slug=" +
        encodeURIComponent(
            slug
        );

}


// ======================================================
// 🚀 READY
// ======================================================

console.log(
    "⚽ PreziScore API — PART 1 READY"
);

console.log(
    "🔴 Live | ✅ Finished | 📅 Upcoming"
);

// ======================================================
// ⚽ PREZISCORE — SPORTScore API
// API.JS — PATI 2/4
// MATCHS LIVE • TERMINÉS • À VENIR
// ======================================================


// ======================================================
// 🧩 EXTRAIRE MATCHS
// ======================================================

function extractMatches(data) {

    if (!data) return [];

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.matches)) {
        return data.matches;
    }

    if (Array.isArray(data.data)) {
        return data.data;
    }

    if (Array.isArray(data.results)) {
        return data.results;
    }

    return [];
}


// ======================================================
// 🔴 CHARGE TOUS MATCHS
// ======================================================

async function getFootballMatches() {

    const response = await sportScoreRequest(
        "/matches/?sport=football&limit=100"
    );

    return extractMatches(response);
}


// ======================================================
// 🔴 MATCHS LIVE
// ======================================================

async function loadLiveMatches(containerId) {

    const box = getElement(containerId);

    if (!box) return;

    box.innerHTML =
        "<p>🔄 Chargement des matchs live...</p>";

    const matches =
        await getFootballMatches();

    if (!matches.length) {

        box.innerHTML =
            "<p>🔴 Aucun match live actuellement.</p>";

        return;
    }

    const liveMatches =
        matches.filter(match =>
            isLiveMatch(match)
        );

    box.innerHTML = "";

    if (!liveMatches.length) {

        box.innerHTML =
            "<p>🔴 Aucun match live actuellement.</p>";

        return;
    }

    liveMatches.forEach(match => {

        renderMatchCard(
            box,
            match,
            "live"
        );

    });

}


// ======================================================
// ✅ MATCHS TERMINÉS
// ======================================================

async function loadFinishedMatches(containerId) {

    const box = getElement(containerId);

    if (!box) return;

    box.innerHTML =
        "<p>🔄 Chargement des résultats...</p>";

    const matches =
        await getFootballMatches();

    if (!matches.length) {

        box.innerHTML =
            "<p>⚠️ Aucun résultat reçu.</p>";

        return;
    }

    const finishedMatches =
        matches.filter(match =>
            isFinishedMatch(match)
        );

    box.innerHTML = "";

    if (!finishedMatches.length) {

        box.innerHTML =
            "<p>✅ Aucun match terminé trouvé.</p>";

        return;
    }

    finishedMatches.forEach(match => {

        renderMatchCard(
            box,
            match,
            "finished"
        );

    });

}


// ======================================================
// 📅 MATCHS À VENIR
// ======================================================

async function loadUpcomingMatches(containerId) {

    const box = getElement(containerId);

    if (!box) return;

    box.innerHTML =
        "<p>🔄 Chargement du calendrier...</p>";

    const matches =
        await getFootballMatches();

    if (!matches.length) {

        box.innerHTML =
            "<p>⚠️ Aucun calendrier reçu.</p>";

        return;
    }

    const upcomingMatches =
        matches

        .filter(match =>
            isUpcomingMatch(match)
        )

        .sort((a, b) => {

            return (
                new Date(getMatchDate(a)) -
                new Date(getMatchDate(b))
            );

        });

    box.innerHTML = "";

    if (!upcomingMatches.length) {

        box.innerHTML =
            "<p>📅 Aucun match à venir trouvé.</p>";

        return;
    }

    upcomingMatches
        .slice(0, 50)
        .forEach(match => {

            renderMatchCard(
                box,
                match,
                "upcoming"
            );

        });

}


// ======================================================
// 🔄 REFRESH LIVE
// ======================================================

function refreshLiveMatches() {

    if (getElement("liveMatches")) {

        loadLiveMatches(
            "liveMatches"
        );

    }

    if (getElement("homeLiveMatches")) {

        loadLiveMatches(
            "homeLiveMatches"
        );

    }

}


// ======================================================
// ⏱️ ACTUALISATION LIVE
// ======================================================

setInterval(
    refreshLiveMatches,
    30000
);


// ======================================================
// 🚀 READY
// ======================================================

console.log(
    "⚽ PreziScore API — PART 2 OK"
);

console.log(
    "🔴 LIVE | ✅ TERMINÉS | 📅 À VENIR"
);

// ======================================================
// ⚽ PREZISCORE — SPORTScore API
// API.JS — PATI 3/4
// STATISTIQUES • CLASSEMENT • BUTEURS
// ======================================================


// ======================================================
// 🏆 CHARGE CLASSEMENT
// ======================================================

async function loadStandings(
    leagueId,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box) return;


    box.innerHTML =
        "<p>🔄 Chargement du classement...</p>";


    const response =
        await sportScoreRequest(
            `/standings/?sport=football&league=${leagueId}`
        );


    const standings =
        extractMatches(response);


    box.innerHTML = "";


    if (!standings.length) {

        box.innerHTML =
            "<p>⚠️ Classement indisponible.</p>";

        return;
    }


    const table =
        document.createElement("div");

    table.className =
        "standings-table";


    standings.forEach((team, index) => {

        const name =
            escapeHTML(
                team.name ||
                team.team_name ||
                team.team?.name ||
                "Équipe"
            );


        const played =
            team.played ??
            team.matches ??
            team.games ??
            0;


        const wins =
            team.wins ??
            team.won ??
            0;


        const draws =
            team.draws ??
            team.draw ??
            0;


        const losses =
            team.losses ??
            team.lost ??
            0;


        const points =
            team.points ??
            team.pts ??
            0;


        table.innerHTML += `

            <div class="standing-row">

                <strong>
                    ${index + 1}
                </strong>

                <span class="standing-team">
                    ${name}
                </span>

                <span>
                    ${played} MJ
                </span>

                <span>
                    ${wins} V
                </span>

                <span>
                    ${draws} N
                </span>

                <span>
                    ${losses} D
                </span>

                <strong>
                    ${points} pts
                </strong>

            </div>

        `;

    });


    box.appendChild(table);

}


// ======================================================
// ⚽ STATISTIQUES D'UNE ÉQUIPE
// ======================================================

async function loadTeamStats(
    teamId,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box) return;


    box.innerHTML =
        "<p>🔄 Chargement des statistiques...</p>";


    const response =
        await sportScoreRequest(
            `/team/${teamId}/?sport=football`
        );


    if (!response) {

        box.innerHTML =
            "<p>⚠️ Statistiques indisponibles.</p>";

        return;
    }


    const data =
        response.data ||
        response.team ||
        response;


    const played =
        data.played ??
        data.matches ??
        data.games ??
        0;


    const wins =
        data.wins ??
        data.won ??
        0;


    const draws =
        data.draws ??
        data.draw ??
        0;


    const losses =
        data.losses ??
        data.lost ??
        0;


    const goals =
        data.goals ??
        data.goals_for ??
        0;


    box.innerHTML = `

        <div class="team-stats">

            <div class="stat-box">
                <strong>${played}</strong>
                <span>Matchs joués</span>
            </div>

            <div class="stat-box">
                <strong>${wins}</strong>
                <span>Victoires</span>
            </div>

            <div class="stat-box">
                <strong>${draws}</strong>
                <span>Nuls</span>
            </div>

            <div class="stat-box">
                <strong>${losses}</strong>
                <span>Défaites</span>
            </div>

            <div class="stat-box">
                <strong>${goals}</strong>
                <span>Buts</span>
            </div>

        </div>

    `;

}


// ======================================================
// 🥅 BUTEURS
// ======================================================

async function loadTopScorers(
    leagueId,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box) return;


    box.innerHTML =
        "<p>🔄 Chargement des buteurs...</p>";


    const response =
        await sportScoreRequest(
            `/topscorers/?sport=football&league=${leagueId}`
        );


    const scorers =
        extractMatches(response);


    box.innerHTML = "";


    if (!scorers.length) {

        box.innerHTML =
            "<p>⚠️ Buteurs indisponibles.</p>";

        return;
    }


    scorers
        .slice(0, 20)
        .forEach((player, index) => {

            const name =
                escapeHTML(
                    player.name ||
                    player.player?.name ||
                    player.player_name ||
                    "Joueur"
                );


            const team =
                escapeHTML(
                    player.team?.name ||
                    player.team_name ||
                    ""
                );


            const goals =
                player.goals ??
                player.total_goals ??
                player.score ??
                0;


            box.innerHTML += `

                <div class="scorer-row">

                    <strong>
                        ${index + 1}
                    </strong>

                    <span>
                        ⚽ ${name}
                    </span>

                    <small>
                        ${team}
                    </small>

                    <strong>
                        ${goals} buts
                    </strong>

                </div>

            `;

        });

}


// ======================================================
// ⚔️ HISTORIQUE FACE À FACE
// ======================================================

async function loadHeadToHead(
    team1,
    team2,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box) return;


    box.innerHTML =
        "<p>🔄 Chargement des confrontations...</p>";


    const response =
        await sportScoreRequest(
            `/head-to-head/?sport=football&team1=${team1}&team2=${team2}`
        );


    const matches =
        extractMatches(response);


    box.innerHTML = "";


    if (!matches.length) {

        box.innerHTML =
            "<p>⚠️ Aucune confrontation trouvée.</p>";

        return;
    }


    let wins1 = 0;
    let wins2 = 0;
    let draws = 0;


    matches.forEach(match => {

        const home =
            getTeamId(match, "home");


        const away =
            getTeamId(match, "away");


        const homeScore =
            getScore(match, "home");


        const awayScore =
            getScore(match, "away");


        if (
            homeScore === awayScore
        ) {

            draws++;

        }

        else if (
            home === Number(team1) &&
            homeScore > awayScore
        ) {

            wins1++;

        }

        else if (
            away === Number(team1) &&
            awayScore > homeScore
        ) {

            wins1++;

        }

        else {

            wins2++;

        }

    });


    box.innerHTML = `

        <div class="h2h-stats">

            <div>
                <strong>${wins1}</strong>
                <span>Victoires équipe 1</span>
            </div>

            <div>
                <strong>${draws}</strong>
                <span>Nuls</span>
            </div>

            <div>
                <strong>${wins2}</strong>
                <span>Victoires équipe 2</span>
            </div>

        </div>

    `;

}


// ======================================================
// 🚀 PART 3 READY
// ======================================================

console.log(
    "⚽ PreziScore API — PART 3 OK"
);

console.log(
    "📊 Statistiques | 🏆 Classement | ⚽ Buteurs"
);

// ======================================================
// ⚽ PREZISCORE — SPORTScore API
// API.JS — PATI 4/4
// MATCH DETAILS • STATS • COMPOSITION • CLASSEMENT
// BUTEURS • HISTORIQUE
// ======================================================


// ======================================================
// 🔎 LOAD MATCH DETAILS
// ======================================================

async function loadMatchDetails(
    slug,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box || !slug) {
        return;
    }

    box.innerHTML = `
        <p>🔄 Chargement des informations du match...</p>
    `;

    const response =
        await sportScoreRequest(
            "/match/?sport=football&slug=" +
            encodeURIComponent(slug)
        );

    if (!response) {

        box.innerHTML = `
            <p>⚠️ Impossible de charger le match.</p>
        `;

        return;
    }

    const match =
        response.match ||
        response.data ||
        response;

    console.log(
        "⚽ MATCH DETAILS:",
        match
    );

    renderMatchDetails(
        box,
        match
    );
}


// ======================================================
// 📊 MATCH DETAILS
// ======================================================

function renderMatchDetails(
    box,
    match
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
        getScore(
            match,
            "home"
        );

    const awayScore =
        getScore(
            match,
            "away"
        );

    const status =
        escapeHTML(
            getMatchStatus(match)
        );

    box.innerHTML = `

        <div class="match-details">

            <div class="match-details-header">

                <span>
                    ⚽ MATCH
                </span>

                <span>
                    ${status}
                </span>

            </div>


            <div class="match-details-teams">

                <div class="details-team">

                    <h2>
                        ${home}
                    </h2>

                </div>


                <div class="details-score">

                    <strong>
                        ${homeScore}
                    </strong>

                    <span>
                        -
                    </span>

                    <strong>
                        ${awayScore}
                    </strong>

                </div>


                <div class="details-team">

                    <h2>
                        ${away}
                    </h2>

                </div>

            </div>

        </div>

    `;
}


// ======================================================
// 📊 MATCH STATISTICS
// ======================================================

async function loadMatchStatistics(
    slug,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box || !slug) {
        return;
    }

    box.innerHTML = `
        <p>🔄 Chargement des statistiques...</p>
    `;

    const response =
        await sportScoreRequest(
            "/match/?sport=football&slug=" +
            encodeURIComponent(slug)
        );

    if (!response) {

        box.innerHTML = `
            <p>⚠️ Statistiques indisponibles.</p>
        `;

        return;
    }

    const match =
        response.match ||
        response.data ||
        response;

    const statistics =
        match.statistics ||
        match.stats ||
        [];

    console.log(
        "📊 STATISTICS:",
        statistics
    );

    if (!statistics.length) {

        box.innerHTML = `
            <p>
                📊 Aucune statistique disponible
                pour ce match.
            </p>
        `;

        return;
    }

    box.innerHTML = `
        <div class="statistics-box">

            <h2>
                📊 Statistiques
            </h2>

            ${statistics.map(stat => {

                const name =
                    escapeHTML(
                        stat.name ||
                        stat.type ||
                        stat.label ||
                        "Statistique"
                    );

                const homeValue =
                    escapeHTML(
                        stat.home ??
                        stat.home_value ??
                        stat.values?.home ??
                        "-"
                    );

                const awayValue =
                    escapeHTML(
                        stat.away ??
                        stat.away_value ??
                        stat.values?.away ??
                        "-"
                    );

                return `

                    <div class="stat-row">

                        <strong>
                            ${homeValue}
                        </strong>

                        <span>
                            ${name}
                        </span>

                        <strong>
                            ${awayValue}
                        </strong>

                    </div>

                `;

            }).join("")}

        </div>
    `;
}


// ======================================================
// 👥 COMPOSITION / LINEUPS
// ======================================================

async function loadLineups(
    slug,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box || !slug) {
        return;
    }

    box.innerHTML = `
        <p>🔄 Chargement des compositions...</p>
    `;

    const response =
        await sportScoreRequest(
            "/match/?sport=football&slug=" +
            encodeURIComponent(slug)
        );

    if (!response) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger
                les compositions.
            </p>
        `;

        return;
    }

    const match =
        response.match ||
        response.data ||
        response;

    const lineups =
        match.lineups ||
        match.lineup ||
        [];

    console.log(
        "👥 LINEUPS:",
        lineups
    );

    if (!lineups.length) {

        box.innerHTML = `
            <p>
                👥 Composition non disponible.
            </p>
        `;

        return;
    }

    const homePlayers =
        lineups.filter(
            player =>
                player.team === "home" ||
                player.location === "home" ||
                player.side === "home"
        );

    const awayPlayers =
        lineups.filter(
            player =>
                player.team === "away" ||
                player.location === "away" ||
                player.side === "away"
        );

    function playersHTML(players) {

        if (!players.length) {

            return `
                <p>
                    Composition indisponible.
                </p>
            `;

        }

        return players.map(player => {

            const name =
                escapeHTML(
                    player.player?.name ||
                    player.name ||
                    "Joueur"
                );

            const number =
                escapeHTML(
                    player.number ??
                    player.jersey_number ??
                    ""
                );

            const position =
                escapeHTML(
                    player.position ||
                    ""
                );

            return `

                <div class="player-row">

                    <span>
                        ${number}
                    </span>

                    <strong>
                        ${name}
                    </strong>

                    <small>
                        ${position}
                    </small>

                </div>

            `;

        }).join("");

    }

    box.innerHTML = `

        <div class="lineups-box">

            <h2>
                👥 Composition des équipes
            </h2>


            <div class="lineups-grid">

                <div class="lineup-team">

                    <h3>
                        🏠 ${escapeHTML(
                            getTeamName(
                                match,
                                "home"
                            )
                        )}
                    </h3>

                    ${playersHTML(
                        homePlayers
                    )}

                </div>


                <div class="lineup-team">

                    <h3>
                        ✈️ ${escapeHTML(
                            getTeamName(
                                match,
                                "away"
                            )
                        )}
                    </h3>

                    ${playersHTML(
                        awayPlayers
                    )}

                </div>

            </div>

        </div>

    `;
}


// ======================================================
// 🏆 CLASSEMENT
// ======================================================

async function loadStandings(
    competitionSlug,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box || !competitionSlug) {
        return;
    }

    box.innerHTML = `
        <p>🔄 Chargement du classement...</p>
    `;

    const response =
        await sportScoreRequest(
            "/standings/?sport=football&slug=" +
            encodeURIComponent(
                competitionSlug
            )
        );

    if (!response) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger
                le classement.
            </p>
        `;

        return;
    }

    const standings =
        extractMatches(
            response.standings ||
            response
        );

    console.log(
        "🏆 STANDINGS:",
        standings
    );

    if (!standings.length) {

        box.innerHTML = `
            <p>
                Aucun classement disponible.
            </p>
        `;

        return;
    }

    box.innerHTML = `

        <div class="standings-box">

            <h2>
                🏆 Classement
            </h2>

            <div class="standing-header">

                <span>#</span>
                <span>Équipe</span>
                <span>MJ</span>
                <span>V</span>
                <span>N</span>
                <span>D</span>
                <span>PTS</span>

            </div>


            ${standings.map(
                (team, index) => {

                    const name =
                        escapeHTML(
                            team.team?.name ||
                            team.name ||
                            "Équipe"
                        );

                    const played =
                        team.played ??
                        team.matches_played ??
                        team.mp ??
                        0;

                    const wins =
                        team.wins ??
                        team.won ??
                        team.w ??
                        0;

                    const draws =
                        team.draws ??
                        team.draw ??
                        team.d ??
                        0;

                    const losses =
                        team.losses ??
                        team.lost ??
                        team.l ??
                        0;

                    const points =
                        team.points ??
                        team.pts ??
                        0;

                    return `

                        <div class="standing-row">

                            <span>
                                ${index + 1}
                            </span>

                            <strong>
                                ${name}
                            </strong>

                            <span>
                                ${played}
                            </span>

                            <span>
                                ${wins}
                            </span>

                            <span>
                                ${draws}
                            </span>

                            <span>
                                ${losses}
                            </span>

                            <strong>
                                ${points}
                            </strong>

                        </div>

                    `;

                }
            ).join("")}

        </div>

    `;
}


// ======================================================
// 🥇 BUTEURS
// ======================================================

async function loadTopScorers(
    competitionSlug,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box || !competitionSlug) {
        return;
    }

    box.innerHTML = `
        <p>🔄 Chargement des buteurs...</p>
    `;

    const response =
        await sportScoreRequest(
            "/topscorers/?sport=football&slug=" +
            encodeURIComponent(
                competitionSlug
            ) +
            "&limit=20&stat=goals"
        );

    if (!response) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger
                les buteurs.
            </p>
        `;

        return;
    }

    const scorers =
        extractMatches(
            response.topscorers ||
            response
        );

    console.log(
        "🥇 TOP SCORERS:",
        scorers
    );

    if (!scorers.length) {

        box.innerHTML = `
            <p>
                Aucun buteur disponible.
            </p>
        `;

        return;
    }

    box.innerHTML = `

        <div class="scorers-box">

            <h2>
                🥇 Meilleurs buteurs
            </h2>

            ${scorers.map(
                (player, index) => {

                    const name =
                        escapeHTML(
                            player.player?.name ||
                            player.name ||
                            "Joueur"
                        );

                    const team =
                        escapeHTML(
                            player.team?.name ||
                            player.team_name ||
                            ""
                        );

                    const goals =
                        player.goals ??
                        player.value ??
                        player.total ??
                        0;

                    return `

                        <div class="scorer-row">

                            <span>
                                ${index + 1}
                            </span>

                            <strong>
                                ${name}
                            </strong>

                            <small>
                                ${team}
                            </small>

                            <b>
                                ⚽ ${goals}
                            </b>

                        </div>

                    `;

                }
            ).join("")}

        </div>

    `;
}


// ======================================================
// 🔥 HISTORIQUE ÉQUIPE
// ======================================================

async function loadTeamHistory(
    teamSlug,
    containerId
) {

    const box =
        getElement(containerId);

    if (!box || !teamSlug) {
        return;
    }

    box.innerHTML = `
        <p>🔄 Chargement de l'historique...</p>
    `;

    const response =
        await sportScoreRequest(
            "/team/?sport=football&slug=" +
            encodeURIComponent(
                teamSlug
            ) +
            "&limit=30"
        );

    if (!response) {

        box.innerHTML = `
            <p>
                ⚠️ Historique indisponible.
            </p>
        `;

        return;
    }

    const matches =
        extractMatches(
            response.matches ||
            response
        );

    if (!matches.length) {

        box.innerHTML = `
            <p>
                Aucun match trouvé.
            </p>
        `;

        return;
    }

    let wins = 0;
    let draws = 0;
    let losses = 0;

    matches.forEach(
        match => {

            if (
                isFinishedMatch(match)
            ) {

                const homeScore =
                    getScore(
                        match,
                        "home"
                    );

                const awayScore =
                    getScore(
                        match,
                        "away"
                    );

                const home =
                    getTeamName(
                        match,
                        "home"
                    );

                const isHome =
                    home.toLowerCase() ===
                    teamSlug.toLowerCase();

                if (
                    homeScore ===
                    awayScore
                ) {

                    draws++;

                }

                else if (
                    isHome &&
                    homeScore > awayScore
                ) {

                    wins++;

                }

                else if (
                    !isHome &&
                    awayScore > homeScore
                ) {

                    wins++;

                }

                else {

                    losses++;

                }

            }

        }
    );

    box.innerHTML = `

        <div class="team-history">

            <h2>
                📊 Statistiques de l'équipe
            </h2>

            <div class="history-grid">

                <div>
                    <strong>
                        ${matches.length}
                    </strong>
                    <span>
                        Matchs
                    </span>
                </div>

                <div>
                    <strong>
                        ${wins}
                    </strong>
                    <span>
                        Victoires
                    </span>
                </div>

                <div>
                    <strong>
                        ${draws}
                    </strong>
                    <span>
                        Nuls
                    </span>
                </div>

                <div>
                    <strong>
                        ${losses}
                    </strong>
                    <span>
                        Défaites
                    </span>
                </div>

            </div>

        </div>

    `;
}


// ======================================================
// ⚽ PREZISCORE READY
// ======================================================

console.log(
    "⚽ PreziScore SportScore API — PART 4 loaded"
);

console.log(
    "📊 Stats | 👥 Composition | 🏆 Classement | 🥇 Buteurs"
);

console.log(
    "🔥 Historique équipe"
);
