
// ======================================================
// ⚽ PREZISCORE — SPORTMONKS TEST
// ======================================================

const API_TOKEN = "METE_TOKEN_SPORTMONKS_OU_LA";

const API_BASE =
    "https://api.sportmonks.com/v3/football";

async function sportMonksRequest(endpoint) {

    try {

        const url =
            API_BASE + endpoint;

        console.log("🌐 REQUEST:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": API_TOKEN,
                "Accept": "application/json"
            }
        });

        const text =
            await response.text();

        console.log(
            "📡 STATUS:",
            response.status
        );

        console.log(
            "📦 RESPONSE:",
            text
        );

        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status +
                " → " +
                text
            );

        }

        const json =
            JSON.parse(text);

        return json.data || [];

    }

    catch (error) {

        console.error(
            "❌ SPORTMONKS ERROR:",
            error
        );

        return null;

    }

}

// ======================================================
// ELEMENT
// ======================================================

function getElement(id) {

    return document.getElementById(id);

}


// ======================================================
// SECURITY
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
// MATCH ID
// ======================================================

function getMatchId(match) {

    return match?.id || "";

}


// ======================================================
// TEAM
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
// TEAM NAME
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
// TEAM ID
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
// MATCH DATE
// ======================================================

function getMatchDate(match) {

    return (
        match?.starting_at ||
        match?.date ||
        ""
    );

}


// ======================================================
// STATUS
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
// NORMALIZED STATUS
// ======================================================

function normalizedStatus(match) {

    return String(
        getMatchStatus(match)
    )
    .toUpperCase()
    .trim();

}


// ======================================================
// SCORE
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


    const currentScore =
        scores.find(
            score => {

                return (
                    score?.participant_id ===
                    teamId
                    &&
                    (
                        score?.description ===
                        "CURRENT"
                        ||
                        score?.description ===
                        "FT"
                    )
                );

            }
        );


    return (
        currentScore?.goals ??
        0
    );

}


// ======================================================
// COMPETITION
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
// LIVE MINUTE
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
// 🔴 LIVE
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
// ✅ FINISHED
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
// DATE FORMAT
// ======================================================

function formatDate(
    value
) {

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
// 🔗 OPEN MATCH
// ======================================================

function openMatch(
    matchId
) {

    if (!matchId) {

        return;

    }


    window.location.href =
        "match-details.html?id=" +
        encodeURIComponent(
            matchId
        );

}


console.log(
    "⚽ PreziScore API PART 1 loaded"

    // ======================================================
// ⚽ PREZISCORE — SPORTMONKS FOOTBALL API V3
// PART 2/4
// 🔴 LIVE • ✅ TERMINÉS • 📅 À VENIR
// ======================================================


// ======================================================
// 🧩 RENDER MATCH CARD
// ======================================================

function renderMatchCard(
    box,
    match,
    type
) {

    if (!box || !match) {

        return;

    }


    // ==================================================
    // DATA
    // ==================================================

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


    const status =
        escapeHTML(
            getMatchStatus(match)
        );


    const minute =
        getLiveMinute(match);


    // ==================================================
    // VARIABLES
    // ==================================================

    let badgeHTML = "";

    let scoreHTML = "";

    let infoHTML = "";


    // ==================================================
    // 🔴 LIVE
    // ==================================================

    if (
        type === "live"
    ) {

        badgeHTML = `

            <span class="live-badge">
                🔴 LIVE
            </span>

        `;


        scoreHTML = `

            <div class="match-score">

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

        `;


        infoHTML = `

            <div class="match-live-status">

                ${
                    minute !== ""
                    ?
                    `⏱️ ${escapeHTML(minute)}'`
                    :
                    `🔴 ${status || "LIVE"}`
                }

            </div>

        `;

    }


    // ==================================================
    // ✅ TERMINÉ
    // ==================================================

    else if (
        type === "finished"
    ) {

        badgeHTML = `

            <span class="finished-badge">
                ✅ TERMINÉ
            </span>

        `;


        scoreHTML = `

            <div class="match-score">

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

        `;


        infoHTML = `

            <div class="match-status">

                Match terminé

            </div>

        `;

    }


    // ==================================================
    // 📅 À VENIR
    // ==================================================

    else {

        badgeHTML = `

            <span class="upcoming-badge">
                📅 À VENIR
            </span>

        `;


        scoreHTML = `

            <div class="match-score upcoming-score">

                VS

            </div>

        `;


        infoHTML = `

            <div class="match-date">

                📅
                ${formatDate(
                    getMatchDate(match)
                )}

            </div>

        `;

    }


    // ==================================================
    // CARD
    // ==================================================

    box.innerHTML += `

        <article
            class="match-card"
            onclick="openMatch(${id})"
        >

            <div class="match-header">

                ${badgeHTML}

            </div>


            <div class="match-teams">

                <div class="

                
);// ======================================================
// ⚽ PREZISCORE — SPORTMONKS FOOTBALL API V3
// PART 3/4
// MATCH CENTER • STATISTIQUES • ÉVÉNEMENTS • COMPOSITIONS
// ======================================================


// ======================================================
// 📊 MATCH STATISTICS
// ======================================================

async function loadMatchStatistics(
    matchId,
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
            🔄 Chargement des statistiques...
        </p>

    `;


    const match =
        await sportMonksRequest(
            `/fixtures/${matchId}?include=participants;scores;state;league;statistics.type`
        );


    if (
        !match ||
        !Array.isArray(
            match.statistics
        )
    ) {

        box.innerHTML = `

            <p>
                📊 Statistiques indisponibles.
            </p>

        `;

        return;

    }


    const statistics =
        match.statistics;


    if (
        statistics.length === 0
    ) {

        box.innerHTML = `

            <p>
                📊 Aucune statistique disponible
                pour ce match.
            </p>

        `;

        return;

    }


    box.innerHTML = "";


    statistics.forEach(
        stat => {

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

        }
    );

}


// ======================================================
// ⚽ MATCH EVENTS
// ======================================================

async function loadMatchEvents(
    matchId,
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
            🔄 Chargement des événements...
        </p>

    `;


    const match =
        await sportMonksRequest(
            `/fixtures/${matchId}?include=participants;scores;state;events.type;events.player;events.period`
        );


    if (
        !match
    ) {

        box.innerHTML = `

            <p>
                ⚽ Événements indisponibles.
            </p>

        `;

        return;

    }


    const events =
        Array.isArray(
            match.events
        )
        ?
        match.events
        :
        [];


    if (
        events.length === 0
    ) {

        box.innerHTML = `

            <p>
                ⚽ Aucun événement disponible
                pour ce match.
            </p>

        `;

        return;

    }


    box.innerHTML = "";


    events.forEach(
        event => {

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
                            ?
                            `${escapeHTML(minute)}'`
                            :
                            "•"
                        }

                    </div>


                    <div class="event-info">

                        <strong>
                            ${escapeHTML(type)}
                        </strong>


                        ${
                            player
                            ?
                            `
                            <p>
                                ${escapeHTML(player)}
                            </p>
                            `
                            :
                            ""
                        }


                        ${
                            team
                            ?
                            `
                            <small>
                                ${escapeHTML(team)}
                            </small>
                            `
                            :
                            ""
                        }

                    </div>

                </div>

            `;

        }
    );

}


// ======================================================
// 👥 LINEUPS
// ======================================================

async function loadLineups(
    matchId,
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
            🔄 Chargement des compositions...
        </p>

    `;


    const match =
        await sportMonksRequest(
            `/fixtures/${matchId}?include=participants;lineups.player;lineups.position`
        );


    if (
        !match ||
        !Array.isArray(
            match.lineups
        )
    ) {

        box.innerHTML = `

            <p>
                👥 Compositions indisponibles.
            </p>

        `;

        return;

    }


    const lineups =
        match.lineups;


    if (
        lineups.length === 0
    ) {

        box.innerHTML = `

            <p>
                👥 Aucune composition disponible.
            </p>

        `;

        return;

    }


    box.innerHTML = "";


    lineups.forEach(
        player => {

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
                        ?
                        `
                        <span class="player-number">
                            ${escapeHTML(number)}
                        </span>
                        `
                        :
                        ""
                    }


                    <div>

                        <strong>
                            ${escapeHTML(name)}
                        </strong>


                        ${
                            position
                            ?
                            `
                            <small>
                                ${escapeHTML(position)}
                            </small>
                            `
                            :
                            ""
                        }

                    </div>

                </div>

            `;

        }
    );

}


// ======================================================
// 🏟️ MATCH CENTER
// ======================================================

async function loadMatchDetails(
    matchId,
    containerId
) {

    const box =
        getElement(
            containerId
        );


    if (!box) {

        return null;

    }


    box.innerHTML = `

        <p>
            🔄 Chargement du match...
        </p>

    `;


    const match =
        await sportMonksRequest(
            `/fixtures/${matchId}?include=participants;scores;state;league`
        );


    if (!match) {

        box.innerHTML = `

            <div class="error-box">

                <h2>
                    ⚠️ Match introuvable
                </h2>

                <p>
                    Impossible de récupérer
                    les informations du match.
                </p>

            </div>

        `;

        return null;

    }


    const home =
        escape
        // ======================================================
// ⚽ PREZISCORE — SPORTMONKS FOOTBALL API V3
// PART 4/4
// AUTO LOAD • HOME • MATCHES • MATCH CENTER
// ======================================================


// ======================================================
// 🚀 PAGE INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🚀 PreziScore page initialized"
        );


        // ==================================================
        // MATCHES PAGE — LIVE
        // ==================================================

        const liveBox =
            getElement(
                "liveMatches"
            );


        if (liveBox) {

            loadLiveMatches(
                "liveMatches"
            );

        }


        // ==================================================
        // MATCHES PAGE — FINISHED
        // ==================================================

        const finishedBox =
            getElement(
                "finishedMatches"
            );


        if (finishedBox) {

            loadFinishedMatches(
                "finishedMatches"
            );

        }


        // ==================================================
        // MATCHES PAGE — UPCOMING
        // ==================================================

        const upcomingBox =
            getElement(
                "upcomingMatches"
            );


        if (upcomingBox) {

            loadUpcomingMatches(
                "upcomingMatches"
            );

        }


        // ==================================================
        // HOME PAGE — LIVE
        // ==================================================

        const homeLiveBox =
            getElement(
                "homeLiveMatches"
            );


        if (homeLiveBox) {

            loadLiveMatches(
                "homeLiveMatches"
            );

        }


        // ==================================================
        // HOME PAGE — UPCOMING
        // ==================================================

        const homeUpcomingBox =
            getElement(
                "homeUpcomingMatches"
            );


        if (homeUpcomingBox) {

            loadUpcomingMatches(
                "homeUpcomingMatches"
            );

        }


        // ==================================================
        // MATCH DETAILS PAGE
        // ==================================================

        const matchDetailsBox =
            getElement(
                "matchDetails"
            );


        if (matchDetailsBox) {

            const params =
                new URLSearchParams(
                    window.location.search
                );


            const matchId =
                params.get("id");


            if (!matchId) {

                matchDetailsBox.innerHTML = `

                    <div class="error-box">

                        <h2>
                            ⚠️ Aucun match sélectionné
                        </h2>

                        <p>
                            Retournez à la page
                            des matchs.
                        </p>


                        <a
                            href="matches.html"
                            class="btn"
                        >
                            ← Retour aux matchs
                        </a>

                    </div>

                `;

                return;

            }


            loadFullMatchCenter(
                matchId
            );

        }

    }
);


// ======================================================
// 🔄 AUTO REFRESH LIVE
// ======================================================

setInterval(
    function () {

        console.log(
            "🔄 Refresh LIVE..."
        );


        // MATCHES PAGE

        const liveBox =
            getElement(
                "liveMatches"
            );


        if (liveBox) {

            loadLiveMatches(
                "liveMatches"
            );

        }


        // HOME PAGE

        const homeLiveBox =
            getElement(
                "homeLiveMatches"
            );


        if (homeLiveBox) {

            loadLiveMatches(
                "homeLiveMatches"
            );

        }

    },
    30000
);


// ======================================================
// 🕐 UPDATE CURRENT YEAR
// ======================================================

function updateFooterYear() {

    const year =
        new Date()
            .getFullYear();


    const footerTexts =
        document.querySelectorAll(
            "footer p"
        );


    footerTexts.forEach(
        paragraph => {

            if (
                paragraph.textContent
                    .includes("Tous droits réservés")
            ) {

                paragraph.innerHTML =
                    `© ${year} PreziScore - Tous droits réservés.`;

            }

        }
    );

}


document.addEventListener(
    "DOMContentLoaded",
    updateFooterYear
);


// ======================================================
// 🔗 NAVIGATION LOG
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const links =
            document.querySelectorAll(
                "nav a"
            );


        links.forEach(
            link => {

                link.addEventListener(
                    "click",
                    function () {

                        console.log(
                            "➡️ Opening:",
                            link.href
                        );

                    }
                );

            }
        );

    }
);


// ======================================================
// 🏠 HERO BUTTON
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const button =
            document.querySelector(
                ".hero .btn"
            );


        if (!button) {

            return;

        }


        button.addEventListener(
            "click",
            function () {

                console.log(
                    "⚽ Opening matches..."
                );

            }
        );

    }
);


// ======================================================
// 🛡️ GLOBAL ERROR HANDLER
// ======================================================

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "🚨 PreziScore JavaScript ERROR:",
            event.error ||
            event.message
        );

    }
);


// ======================================================
// ⚽ API READY
// ======================================================

console.log(
    "======================================"
);

console.log(
    "⚽ PREZISCORE"
);

console.log(
    "🚀 SPORTMONKS API READY"
);

console.log(
    "🔴 LIVE"
);

console.log(
    "✅ TERMINÉS"
);

console.log(
    "📅 À VENIR"
);

console.log(
    "📊 MATCH CENTER"
);

console.log(
    "======================================"
);
