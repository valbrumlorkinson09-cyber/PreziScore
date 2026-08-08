// ======================================================
// ⚽ PREZISCORE — SPORTMONKS FOOTBALL API
// API.JS — PATI 1/4
// CONFIG • REQUEST • HELPERS • STATUS
// ======================================================


// ======================================================
// 🔐 API CONFIG
// ======================================================

const API_TOKEN = "T9KHvE4ohaSj4w1gXYTRya9aiyNyWhYtZXu2ZD6PX5AFds8pWBwYN3jPL8KW";

const API_BASE =
    "https://api.sportmonks.com/v3/football";


// ======================================================
// 🌍 GLOBAL DATA
// ======================================================

let preziMatches = [];


// ======================================================
// 🌐 SPORTMONKS REQUEST
// ======================================================

async function sportMonksRequest(endpoint) {

    try {

        const url =
            API_BASE + endpoint;

        console.log(
            "🌐 Sportmonks:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "Authorization": API_TOKEN,
                        "Accept": "application/json"
                    }
                }
            );


        const text =
            await response.text();


        console.log(
            "📡 HTTP:",
            response.status
        );


        if (!response.ok) {

            console.error(
                "❌ Sportmonks ERROR:",
                text
            );

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const json =
            JSON.parse(text);


        console.log(
            "✅ Sportmonks DATA:",
            json
        );


        return json.data || [];

    }

    catch (error) {

        console.error(
            "🚨 API ERROR:",
            error
        );

        return null;

    }

}


// ======================================================
// 🧩 GET ELEMENT
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

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================================
// 🆔 MATCH ID
// ======================================================

function getMatchId(match) {

    return match?.id || "";

}


// ======================================================
// ⚽ GET TEAM
// ======================================================

function getTeam(
    match,
    side
) {

    const participants =
        Array.isArray(
            match?.participants
        )
        ?
        match.participants
        :
        [];


    return participants.find(
        team => {

            return (
                team?.meta?.location === side ||
                team?.location === side
            );

        }
    ) || null;

}


// ======================================================
// 🏠 / ✈️ TEAM NAME
// ======================================================

function getTeamName(
    match,
    side
) {

    const team =
        getTeam(
            match,
            side
        );


    return (
        team?.name ||
        team?.short_code ||
        "Équipe"
    );

}


// ======================================================
// 🆔 TEAM ID
// ======================================================

function getTeamId(
    match,
    side
) {

    const team =
        getTeam(
            match,
            side
        );


    return team?.id || null;

}


// ======================================================
// 📅 MATCH DATE
// ======================================================

function getMatchDate(match) {

    return (
        match?.starting_at ||
        match?.date ||
        ""
    );

}


// ======================================================
// 📊 MATCH STATUS
// ======================================================

function getMatchStatus(match) {

    return (
        match?.state?.short_name ||
        match?.state?.name ||
        match?.status?.short_name ||
        match?.status?.name ||
        ""
    );

}


// ======================================================
// 🔄 NORMALIZE STATUS
// ======================================================

function normalizedStatus(match) {

    return String(
        getMatchStatus(match)
    )
    .toUpperCase()
    .trim();

}


// ======================================================
// ⚽ SCORE
// ======================================================

function getScore(
    match,
    side
) {

    const scores =
        Array.isArray(
            match?.scores
        )
        ?
        match.scores
        :
        [];


    const teamId =
        getTeamId(
            match,
            side
        );


    const score =
        scores.find(
            item => {

                return (
                    item?.participant_id === teamId
                    &&
                    (
                        item?.description === "CURRENT"
                        ||
                        item?.description === "FT"
                    )
                );

            }
        );


    return (
        score?.goals ??
        0
    );

}


// ======================================================
// 🏆 COMPETITION
// ======================================================

function getCompetition(match) {

    return (
        match?.league?.name ||
        match?.competition?.name ||
        match?.tournament?.name ||
        ""
    );

}


// ======================================================
// ⏱️ LIVE MINUTE
// ======================================================

function getLiveMinute(match) {

    return (
        match?.state?.minute ??
        match?.periods?.[0]?.minutes ??
        match?.minute ??
        ""
    );

}


// ======================================================
// 🔴 LIVE MATCH
// ======================================================

function isLiveMatch(match) {

    const status =
        normalizedStatus(match);


    const liveStatuses = [

        "LIVE",
        "1H",
        "2H",
        "HT",
        "ET",
        "BREAK",
        "PEN_LIVE"

    ];


    return liveStatuses.includes(
        status
    );

}


// ======================================================
// ✅ FINISHED MATCH
// ======================================================

function isFinishedMatch(match) {

    const status =
        normalizedStatus(match);


    const finishedStatuses = [

        "FT",
        "AET",
        "FT_PEN",
        "FINISHED",
        "ENDED"

    ];


    return finishedStatuses.includes(
        status
    );

}


// ======================================================
// 📅 UPCOMING MATCH
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


    const date =
        new Date(
            getMatchDate(match)
        );


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
// 🕐 FORMAT DATE
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
// 🔗 OPEN MATCH CENTER
// ======================================================

function openMatch(matchId) {

    if (!matchId) {

        return;

    }


    window.location.href =
        "match-details.html?id=" +
        encodeURIComponent(
            matchId
        );

}


// ======================================================
// 🚀 API READY
// ======================================================

console.log(
    "⚽ PreziScore Sportmonks API — PART 1 loaded"
);

console.log(
    "🔴 Live • ✅ Finished • 📅 Upcoming"
);

// ======================================================
// ⚽ PREZISCORE — SPORTMONKS FOOTBALL API
// API.JS — PATI 2/4
// MATCH CARDS • LIVE • TERMINÉS • À VENIR
// ======================================================


// ======================================================
// 🧩 MATCH CARD
// ======================================================

function renderMatchCard(
    box,
    match,
    type
) {

    if (!box || !match) {
        return;
    }


    const id =
        getMatchId(match);


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


    const competition =
        escapeHTML(
            getCompetition(match)
        );


    const minute =
        getLiveMinute(match);


    let badge = "";
    let score = "";
    let info = "";


    // ==================================================
    // 🔴 LIVE
    // ==================================================

    if (type === "live") {

        badge = `
            <span class="live-badge">
                🔴 LIVE
            </span>
        `;


        score = `
            <div class="match-score">

                <strong>
                    ${homeScore}
                </strong>

                <span>-</span>

                <strong>
                    ${awayScore}
                </strong>

            </div>
        `;


        info = `
            <div class="match-live-status">

                ⏱️ ${
                    minute !== ""
                    ?
                    escapeHTML(minute) + "'"
                    :
                    "LIVE"
                }

            </div>
        `;

    }


    // ==================================================
    // ✅ TERMINÉ
    // ==================================================

    else if (type === "finished") {

        badge = `
            <span class="finished-badge">
                ✅ TERMINÉ
            </span>
        `;


        score = `
            <div class="match-score">

                <strong>
                    ${homeScore}
                </strong>

                <span>-</span>

                <strong>
                    ${awayScore}
                </strong>

            </div>
        `;


        info = `
            <div class="match-status">
                Match terminé
            </div>
        `;

    }


    // ==================================================
    // 📅 À VENIR
    // ==================================================

    else {

        badge = `
            <span class="upcoming-badge">
                📅 À VENIR
            </span>
        `;


        score = `
            <div class="match-score upcoming-score">
                VS
            </div>
        `;


        info = `
            <div class="match-date">

                📅
                ${formatDate(
                    getMatchDate(match)
                )}

            </div>
        `;

    }


    // ==================================================
    // CARD HTML
    // ==================================================

    box.innerHTML += `

        <article
            class="match-card"
            onclick="openMatch(${id})"
        >

            <div class="match-header">

                ${badge}

            </div>


            <div class="match-teams">

                <div class="team">

                    <h3>
                        ${home}
                    </h3>

                </div>


                <div class="score-area">

                    ${score}

                </div>


                <div class="team">

                    <h3>
                        ${away}
                    </h3>

                </div>

            </div>


            ${info}


            ${
                competition
                ?
                `
                <div class="match-competition">

                    🏆 ${competition}

                </div>
                `
                :
                ""
            }

        </article>

    `;

}


// ======================================================
// 🔴 LOAD LIVE MATCHES
// ======================================================

async function loadLiveMatches(
    containerId
) {

    const box =
        getElement(
            containerId
        );


    if (!box) {
        return;
    }


    box.innerHTML = `
        <p>
            🔄 Chargement des matchs en direct...
        </p>
    `;


    const matches =
        await sportMonksRequest(
            "/livescores/inplay?include=participants;scores;state;league"
        );


    if (!matches) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger les matchs live.
            </p>
        `;

        return;

    }


    preziMatches =
        matches;


    const liveMatches =
        matches.filter(
            match =>
                isLiveMatch(match)
        );


    console.log(
        "🔴 LIVE:",
        liveMatches
    );


    box.innerHTML = "";


    if (
        liveMatches.length === 0
    ) {

        box.innerHTML = `
            <p>
                Aucun match en direct actuellement.
            </p>
        `;

        return;

    }


    liveMatches.forEach(
        match => {

            renderMatchCard(
                box,
                match,
                "live"
            );

        }
    );

}


// ======================================================
// 📅 LOAD UPCOMING MATCHES
// ======================================================

async function loadUpcomingMatches(
    containerId
) {

    const box =
        getElement(
            containerId
        );


    if (!box) {
        return;
    }


    box.innerHTML = `
        <p>
            🔄 Chargement des prochains matchs...
        </p>
    `;


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const futureDate =
        new Date(
            Date.now() +
            2 * 86400000
        );


    const future =
        futureDate
            .toISOString()
            .split("T")[0];


    const matches =
        await sportMonksRequest(
            `/fixtures/between/${today}/${future}?include=participants;scores;state;league`
        );


    if (!matches) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger les matchs à venir.
            </p>
        `;

        return;

    }


    const upcomingMatches =
        matches
            .filter(
                match =>
                    isUpcomingMatch(match)
            )
            .sort(
                (a, b) => {

                    return (
                        new Date(
                            getMatchDate(a)
                        ) -
                        new Date(
                            getMatchDate(b)
                        )
                    );

                }
            );


    console.log(
        "📅 UPCOMING:",
        upcomingMatches
    );


    box.innerHTML = "";


    if (
        upcomingMatches.length === 0
    ) {

        box.innerHTML = `
            <p>
                Aucun match à venir.
            </p>
        `;

        return;

    }


    upcomingMatches
        .slice(0, 50)
        .forEach(
            match => {

                renderMatchCard(
                    box,
                    match,
                    "upcoming"
                );

            }
        );

}


// ======================================================
// ✅ LOAD FINISHED MATCHES
// ======================================================

async function loadFinishedMatches(
    containerId
) {

    const box =
        getElement(
            containerId
        );


    if (!box) {
        return;
    }


    box.innerHTML = `
        <p>
            🔄 Chargement des matchs terminés...
        </p>
    `;


    const yesterdayDate =
        new Date(
            Date.now() -
            86400000
        );


    const yesterday =
        yesterdayDate
            .toISOString()
            .split("T")[0];


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const matches =
        await sportMonksRequest(
            `/fixtures/between/${yesterday}/${today}?include=participants;scores;state;league`
        );


    if (!matches) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger les matchs terminés.
            </p>
        `;

        return;

    }


    const finishedMatches =
        matches.filter(
            match =>
                isFinishedMatch(match)
        );


    console.log(
        "✅ FINISHED:",
        finishedMatches
    );


    box.innerHTML = "";


    if (
        finishedMatches.length === 0
    ) {

        box.innerHTML = `
            <p>
                Aucun match terminé.
            </p>
        `;

        return;

    }


    finishedMatches
        .slice(0, 50)
        .forEach(
            match => {

                renderMatchCard(
                    box,
                    match,
                    "finished"
                );

            }
        );

}


// ======================================================
// 🔄 AUTO REFRESH LIVE
// ======================================================

function refreshLiveMatches() {

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
            "homeLiveMatches"
        )
    ) {

        loadLiveMatches(
            "homeLiveMatches"
        );

    }

}


// ======================================================
// ⏱️ REFRESH EVERY 30 SECONDS
// ======================================================

setInterval(
    refreshLiveMatches,
    30000
);


// ======================================================
// ⚽ PART 2 READY
// ======================================================

console.log(
    "⚽ PreziScore API — PART 2 loaded"
);

console.log(
    "🔴 LIVE • ✅ TERMINÉS • 📅 À VENIR"
);

// ======================================================
// ⚽ PREZISCORE — SPORTMONKS FOOTBALL API V3
// PART 3/4
// MATCH CENTER • STATISTIQUES • ÉVÉNEMENTS • LINEUPS
// ======================================================


// ======================================================
// 📊 MATCH STATISTICS
// ======================================================

async function loadMatchStatistics(matchId, containerId) {

    const box = getElement(containerId);

    if (!box) return;

    box.innerHTML = `
        <p>🔄 Chargement des statistiques...</p>
    `;

    const match = await sportMonksRequest(
        `/fixtures/${matchId}?include=participants;scores;state;league;statistics.type`
    );

    if (!match || !Array.isArray(match.statistics)) {

        box.innerHTML = `
            <p>📊 Statistiques indisponibles.</p>
        `;

        return;
    }

    if (match.statistics.length === 0) {

        box.innerHTML = `
            <p>📊 Aucune statistique disponible pour ce match.</p>
        `;

        return;
    }

    box.innerHTML = "";

    match.statistics.forEach(stat => {

        const name =
            stat.type?.name ||
            stat.name ||
            "Statistique";

        const value =
            stat.data?.value ??
            stat.value ??
            "-";

        box.innerHTML += `

            <div class="stat-row">

                <span>
                    ${escapeHTML(name)}
                </span>

                <strong>
                    ${escapeHTML(value)}
                </strong>

            </div>

        `;

    });

}


// ======================================================
// ⚽ MATCH EVENTS
// ======================================================

async function loadMatchEvents(matchId, containerId) {

    const box = getElement(containerId);

    if (!box) return;

    box.innerHTML = `
        <p>🔄 Chargement des événements...</p>
    `;

    const match = await sportMonksRequest(
        `/fixtures/${matchId}?include=participants;scores;state;events.type;events.player;events.period`
    );

    if (!match) {

        box.innerHTML = `
            <p>⚽ Événements indisponibles.</p>
        `;

        return;
    }

    const events =
        Array.isArray(match.events)
            ? match.events
            : [];

    if (events.length === 0) {

        box.innerHTML = `
            <p>
                ⚽ Aucun événement disponible pour ce match.
            </p>
        `;

        return;
    }

    box.innerHTML = "";

    events.forEach(event => {

        const minute =
            event.minute ??
            event.minutes ??
            event.time?.minute ??
            "";

        const type =
            event.type?.name ||
            event.type?.short_name ||
            event.name ||
            event.event ||
            "Événement";

        const player =
            event.player?.display_name ||
            event.player?.name ||
            "";

        const team =
            event.participant?.name ||
            event.team?.name ||
            "";

        box.innerHTML += `

            <div class="event-card">

                <div class="event-minute">

                    ${
                        minute !== ""
                            ? `${escapeHTML(minute)}'`
                            : "•"
                    }

                </div>

                <div class="event-info">

                    <strong>
                        ${escapeHTML(type)}
                    </strong>

                    ${
                        player
                            ? `
                                <p>
                                    ${escapeHTML(player)}
                                </p>
                              `
                            : ""
                    }

                    ${
                        team
                            ? `
                                <small>
                                    ${escapeHTML(team)}
                                </small>
                              `
                            : ""
                    }

                </div>

            </div>

        `;

    });

}


// ======================================================
// 👥 LINEUPS / COMPOSITIONS
// ======================================================

async function loadLineups(matchId, containerId) {

    const box = getElement(containerId);

    if (!box) return;

    box.innerHTML = `
        <p>🔄 Chargement des compositions...</p>
    `;

    const match = await sportMonksRequest(
        `/fixtures/${matchId}?include=participants;lineups.player;lineups.position`
    );

    if (!match || !Array.isArray(match.lineups)) {

        box.innerHTML = `
            <p>👥 Compositions indisponibles.</p>
        `;

        return;
    }

    const lineups = match.lineups;

    if (lineups.length === 0) {

        box.innerHTML = `
            <p>
                👥 Aucune composition disponible.
            </p>
        `;

        return;
    }

    box.innerHTML = "";

    lineups.forEach(player => {

        const name =
            player.player?.display_name ||
            player.player?.name ||
            "Joueur";

        const position =
            player.position?.name ||
            player.position?.short_name ||
            "";

        const number =
            player.jersey_number ??
            player.number ??
            "";

        box.innerHTML += `

            <div class="lineup-card">

                ${
                    number !== ""
                        ? `
                            <span class="player-number">
                                ${escapeHTML(number)}
                            </span>
                          `
                        : ""
                }

                <div>

                    <strong>
                        ${escapeHTML(name)}
                    </strong>

                    ${
                        position
                            ? `
                                <small>
                                    ${escapeHTML(position)}
                                </small>
                              `
                            : ""
                    }

                </div>

            </div>

        `;

    });

}


// ======================================================
// ⚽ MATCH DETAILS
// ======================================================

async function loadMatchDetails(
    matchId,
    containerId
) {

    const box = getElement(containerId);

    if (!box) return null;

    box.innerHTML = `
        <p>🔄 Chargement du match...</p>
    `;

    if (!matchId) {

        box.innerHTML = `
            <p>⚠️ Aucun match sélectionné.</p>
        `;

        return null;
    }

    const match = await sportMonksRequest(
        `/fixtures/${matchId}?include=participants;scores;state;league;events.type;events.player;statistics.type;lineups.player;lineups.position`
    );

    if (!match) {

        box.innerHTML = `
            <p>⚠️ Match introuvable.</p>
        `;

        return null;
    }


    // ==================================================
    // TEAMS
    // ==================================================

    const home =
        escapeHTML(
            getTeamName(match, "home")
        );

    const away =
        escapeHTML(
            getTeamName(match, "away")
        );


    // ==================================================
    // SCORE
    // ==================================================

    const homeScore =
        getScore(match, "home");

    const awayScore =
        getScore(match, "away");


    // ==================================================
    // STATUS
    // ==================================================

    const status =
        escapeHTML(
            getMatchStatus(match)
        );


    // ==================================================
    // MINUTE
    // ==================================================

    const minute =
        getLiveMinute(match);


    // ==================================================
    // DATE
    // ==================================================

    const date =
        formatDate(
            getMatchDate(match)
        );


    // ==================================================
    // COMPETITION
    // ==================================================

    const competition =
        escapeHTML(
            getCompetition(match)
        );


    // ==================================================
    // LIVE STATUS
    // ==================================================

    let statusHTML = "";

    if (isLiveMatch(match)) {

        statusHTML = `
            <div class="match-center-live">
                🔴 LIVE
                ${
                    minute !== ""
                        ? ` • ${escapeHTML(minute)}'`
                        : ""
                }
            </div>
        `;

    }
    else if (isFinishedMatch(match)) {

        statusHTML = `
            <div class="match-center-finished">
                ✅ TERMINÉ
            </div>
        `;

    }
    else {

        statusHTML = `
            <div class="match-center-upcoming">
                📅 ${escapeHTML(date)}
            </div>
        `;

    }


    // ==================================================
    // MATCH CENTER CARD
    // ==================================================

    box.innerHTML = `

        <div class="match-detail-card">

            ${
                competition
                    ? `
                        <div class="match-detail-league">
                            🏆 ${competition}
                        </div>
                      `
                    : ""
            }

            ${statusHTML}

            <div class="match-detail-teams">

                <div class="team">

                    <h2>
                        ${home}
                    </h2>

                </div>


                <div class="detail-score">

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


                <div class="team">

                    <h2>
                        ${away}
                    </h2>

                </div>

            </div>

        </div>

    `;


    return match;

}


// ======================================================
// 🔄 AUTO UPDATE MATCH CENTER
// ======================================================

function refreshMatchCenter(matchId) {

    if (!matchId) return;

    const detailsBox =
        getElement("matchDetails");

    if (detailsBox) {

        loadMatchDetails(
            matchId,
            "matchDetails"
        );

    }

    const statsBox =
        getElement("matchStatistics");

    if (statsBox) {

        loadMatchStatistics(
            matchId,
            "matchStatistics"
        );

    }

    const eventsBox =
        getElement("matchEvents");

    if (eventsBox) {

        loadMatchEvents(
            matchId,
            "matchEvents"
        );

    }

}


// ======================================================
// 🔄 MATCH CENTER REFRESH
// ======================================================

setInterval(() => {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const matchId =
        params.get("id");

    if (
        matchId &&
        document.getElementById("matchDetails")
    ) {

        refreshMatchCenter(matchId);

    }

}, 30000);


// ======================================================
// 🚀 PREZISCORE MATCH CENTER READY
// ======================================================

console.log(
    "⚽ PreziScore Match Center loaded!"
);
