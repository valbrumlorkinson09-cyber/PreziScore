// ======================================================
// ⚽ PREZISCORE — SPORTMONKS API
// API.JS — PARTIE 1/4
// CONFIG • REQUEST • HELPERS • LIVE
// ======================================================


// ======================================================
// 🔐 API CONFIG
// ======================================================

// Mete nouvo token Sportmonks ou isit la
const API_TOKEN = "T9KHvE4ohaSj4w1gXYTRya9aiyNyWhYtZXu2ZD6PX5AFds8pWBwYN3jPL8KW";

const API_BASE =
    "https://api.sportmonks.com/v3/football";


// ======================================================
// 🌍 GLOBAL
// ======================================================

let preziMatches = [];


// ======================================================
// 🌐 API REQUEST
// ======================================================

async function sportMonksRequest(endpoint) {

    try {

        const response = await fetch(
            API_BASE + endpoint,
            {
                method: "GET",

                headers: {
                    "Authorization": API_TOKEN,
                    "Accept": "application/json"
                }
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "❌ Sportmonks:",
                response.status,
                errorText
            );

            throw new Error(
                "HTTP " + response.status
            );

        }


        const json =
            await response.json();


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
// 🔒 ESCAPE HTML
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
// 🆔 MATCH ID
// ======================================================

function getMatchId(match) {

    return match?.id || "";

}


// ======================================================
// 👕 TEAMS
// ======================================================

function getTeam(
    match,
    side
) {

    const participants =
        Array.isArray(match?.participants)
            ? match.participants
            : [];


    return participants.find(
        team => {

            return (
                team?.meta?.location === side ||
                team?.location === side
            );

        }
    ) || null;

}


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
// 📅 DATE
// ======================================================

function getMatchDate(match) {

    return (
        match?.starting_at ||
        match?.date ||
        ""
    );

}


function formatDate(value) {

    if (!value) return "";

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
// 📊 STATUS
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
        Array.isArray(match?.scores)
            ? match.scores
            : [];


    const teamId =
        getTeamId(
            match,
            side
        );


    const current =
        scores.find(
            score => {

                return (
                    score?.participant_id === teamId &&
                    score?.description === "CURRENT"
                );

            }
        );


    const fullTime =
        scores.find(
            score => {

                return (
                    score?.participant_id === teamId &&
                    score?.description === "FT"
                );

            }
        );


    return (
        current?.goals ??
        fullTime?.goals ??
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
// 🔴 LIVE STATUS
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
        "PEN_LIVE",
        "PENALTIES",
        "PENALTY"

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
// 🔗 OPEN MATCH
// ======================================================

function openMatch(matchId) {

    if (!matchId) {

        return;

    }


    window.location.href =
        "match.html?id=" +
        encodeURIComponent(
            matchId
        );

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


    if (!box) return;


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


    liveMatches
        .forEach(
            match => {

                renderMatchCard(
                    box,
                    match,
                    "live"
                );

            }
        );

}


console.log(
    "⚽ PreziScore API — PART 1 READY"
);// ======================================================
// ⚽ PREZISCORE — SPORTMONKS FOOTBALL API
// API.JS — PATI 2/4
// MATCH CARDS • LIVE • UPCOMING • FINISHED
// ======================================================


// ======================================================
// 🧩 RENDER MATCH CARD
// ======================================================

function renderMatchCard(box, match, type) {

    if (!box || !match) {
        return;
    }


    const id = getMatchId(match);

    const home = escapeHTML(
        getTeamName(match, "home")
    );

    const away = escapeHTML(
        getTeamName(match, "away")
    );

    const competition = escapeHTML(
        getCompetition(match)
    );

    const homeScore = getScore(
        match,
        "home"
    );

    const awayScore = getScore(
        match,
        "away"
    );

    const status = escapeHTML(
        getMatchStatus(match)
    );

    const minute = getLiveMinute(
        match
    );


    let badge = "";
    let scoreHTML = "";
    let statusHTML = "";


    // ==================================================
    // 🔴 LIVE
    // ==================================================

    if (type === "live") {

        badge = `
            <div class="live-badge">
                🔴 LIVE
            </div>
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


        let liveText = "LIVE";


        if (status) {

            liveText = status;

        }


        if (minute !== "") {

            liveText +=
                " • " +
                escapeHTML(minute) +
                "'";

        }


        statusHTML = `
            <div class="match-live-status">
                🔴 ${liveText}
            </div>
        `;

    }


    // ==================================================
    // 📅 UPCOMING
    // ==================================================

    else if (type === "upcoming") {

        badge = `
            <div class="upcoming-badge">
                📅 À VENIR
            </div>
        `;


        scoreHTML = `
            <div class="match-score upcoming-score">
                VS
            </div>
        `;


        statusHTML = `
            <div class="match-date">
                📅 ${formatDate(
                    getMatchDate(match)
                )}
            </div>
        `;

    }


    // ==================================================
    // ✅ FINISHED
    // ==================================================

    else if (type === "finished") {

        badge = `
            <div class="finished-badge">
                ✅ TERMINÉ
            </div>
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


        statusHTML = `
            <div class="match-status">
                Match terminé
            </div>
        `;

    }


    // ==================================================
    // 🖥️ CARD
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

                    ${scoreHTML}

                </div>


                <div class="team">

                    <h3>
                        ${away}
                    </h3>

                </div>

            </div>


            ${statusHTML}


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


            <button
                class="match-button"
                onclick="event.stopPropagation(); openMatch(${id})"
            >
                Voir le match →
            </button>

        </article>

    `;

}



// ======================================================
// 🔴 LOAD LIVE MATCHES
// ======================================================

async function loadLiveMatches(containerId) {

    const box = getElement(
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


    preziMatches = matches;


    const liveMatches =
        matches.filter(
            match => isLiveMatch(match)
        );


    box.innerHTML = "";


    if (liveMatches.length === 0) {

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


    console.log(
        "🔴 Matchs LIVE:",
        liveMatches.length
    );

}



// ======================================================
// 📅 LOAD UPCOMING MATCHES
// ======================================================

async function loadUpcomingMatches(
    containerId
) {

    const box = getElement(
        containerId
    );


    if (!box) {
        return;
    }


    box.innerHTML = `
        <p>
            🔄 Chargement des matchs à venir...
        </p>
    `;


    const now = new Date();


    const today =
        now
            .toISOString()
            .split("T")[0];


    const futureDate =
        new Date(
            now.getTime() +
            7 * 24 * 60 * 60 * 1000
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
                        ).getTime()
                        -
                        new Date(
                            getMatchDate(b)
                        ).getTime()
                    );

                }
            );


    box.innerHTML = "";


    if (upcomingMatches.length === 0) {

        box.innerHTML = `
            <p>
                Aucun match prévu.
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


    console.log(
        "📅 Matchs à venir:",
        upcomingMatches.length
    );

}



// ======================================================
// ✅ LOAD FINISHED MATCHES
// ======================================================

async function loadFinishedMatches(
    containerId
) {

    const box = getElement(
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


    const now = new Date();


    const yesterdayDate =
        new Date(
            now.getTime() -
            24 * 60 * 60 * 1000
        );


    const yesterday =
        yesterdayDate
            .toISOString()
            .split("T")[0];


    const today =
        now
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
        matches
            .filter(
                match =>
                    isFinishedMatch(match)
            )
            .sort(
                (a, b) => {

                    return (
                        new Date(
                            getMatchDate(b)
                        ).getTime()
                        -
                        new Date(
                            getMatchDate(a)
                        ).getTime()
                    );

                }
            );


    box.innerHTML = "";


    if (finishedMatches.length === 0) {

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


    console.log(
        "✅ Matchs terminés:",
        finishedMatches.length
    );

}



// ======================================================
// 🔄 REFRESH LIVE
// ======================================================

async function refreshLiveMatches() {

    const liveBox =
        getElement(
            "liveMatches"
        );


    if (liveBox) {

        await loadLiveMatches(
            "liveMatches"
        );

    }


    const homeLiveBox =
        getElement(
            "homeLiveMatches"
        );


    if (homeLiveBox) {

        await loadLiveMatches(
            "homeLiveMatches"
        );

    }

}



// ======================================================
// 🚀 AUTO REFRESH LIVE
// ======================================================

setInterval(
    refreshLiveMatches,
    30000
);



// ======================================================
// 🌍 EXPORT GLOBAL
// ======================================================

window.PreziScore = {

    ...window.PreziScore,

    loadLiveMatches,

    loadUpcomingMatches,

    loadFinishedMatches,

    refreshLiveMatches,

    renderMatchCard

};



// ======================================================
// ✅ PART 2 READY
// ======================================================

console.log(
    "⚽ PreziScore API — PART 2/4 loaded"
);

console.log(
    "🔴 LIVE • 📅 UPCOMING • ✅ FINISHED"
    
);

// ======================================================
// ⚽ PREZISCORE — SPORTMONKS FOOTBALL API
// API.JS — PATI 3/4
// MATCH CENTER • DETAILS • EVENTS • STATISTICS
// ======================================================


// ======================================================
// 🔎 GET SINGLE MATCH
// ======================================================

async function getMatchDetails(matchId) {

    if (!matchId) {
        return null;
    }


    const data =
        await sportMonksRequest(
            `/fixtures/${encodeURIComponent(
                matchId
            )}?include=participants;scores;state;league;events;statistics;lineups`
        );


    if (!data) {

        console.error(
            "❌ Impossible de récupérer le match:",
            matchId
        );

        return null;

    }


    return data;
}



// ======================================================
// 🧩 FIND TEAM BY ID
// ======================================================

function findTeamById(match, teamId) {

    if (!match || !teamId) {
        return null;
    }


    const participants =
        Array.isArray(
            match.participants
        )
        ?
        match.participants
        :
        [];


    return participants.find(
        team =>
            Number(team?.id) ===
            Number(teamId)
    ) || null;

}



// ======================================================
// 📊 GET STATISTICS DATA
// ======================================================

function getStatisticsData(match) {

    if (!match) {
        return [];
    }


    if (
        Array.isArray(
            match.statistics
        )
    ) {

        return match.statistics;

    }


    if (
        Array.isArray(
            match.stats
        )
    ) {

        return match.stats;

    }


    return [];

}



// ======================================================
// ⚽ GET EVENTS DATA
// ======================================================

function getEventsData(match) {

    if (!match) {
        return [];
    }


    if (
        Array.isArray(
            match.events
        )
    ) {

        return match.events;

    }


    if (
        Array.isArray(
            match.timeline
        )
    ) {

        return match.timeline;

    }


    if (
        Array.isArray(
            match.incidents
        )
    ) {

        return match.incidents;

    }


    return [];

}



// ======================================================
// 👥 GET LINEUPS DATA
// ======================================================

function getLineupsData(match) {

    if (!match) {
        return [];
    }


    if (
        Array.isArray(
            match.lineups
        )
    ) {

        return match.lineups;

    }


    if (
        Array.isArray(
            match.lineup
        )
    ) {

        return match.lineup;

    }


    return [];

}



// ======================================================
// 📝 EVENT TYPE
// ======================================================

function getEventType(event) {

    return (
        event?.type?.name ||
        event?.type ||
        event?.sub_type ||
        event?.name ||
        event?.event_type ||
        "Événement"
    );

}



// ======================================================
// 👤 EVENT PLAYER
// ======================================================

function getEventPlayer(event) {

    return (
        event?.player?.name ||
        event?.player_name ||
        event?.player?.display_name ||
        ""
    );

}



// ======================================================
// 🏆 EVENT TEAM
// ======================================================

function getEventTeam(event) {

    return (
        event?.participant?.name ||
        event?.team?.name ||
        event?.team_name ||
        ""
    );

}



// ======================================================
// ⏱️ EVENT MINUTE
// ======================================================

function getEventMinute(event) {

    return (
        event?.minute ??
        event?.time?.minute ??
        event?.period?.minute ??
        event?.minute_number ??
        ""
    );

}



// ======================================================
// 🎨 EVENT ICON
// ======================================================

function getEventIcon(event) {

    const type =
        String(
            getEventType(event)
        )
        .toLowerCase();


    if (
        type.includes("goal") ||
        type.includes("but")
    ) {

        return "⚽";

    }


    if (
        type.includes("yellow") ||
        type.includes("jaune")
    ) {

        return "🟨";

    }


    if (
        type.includes("red") ||
        type.includes("rouge")
    ) {

        return "🟥";

    }


    if (
        type.includes("substitution") ||
        type.includes("remplacement")
    ) {

        return "🔄";

    }


    if (
        type.includes("penalty")
    ) {

        return "⚽";

    }


    return "📌";

}



// ======================================================
// ⚽ RENDER MATCH DETAILS
// ======================================================

function renderMatchDetails(
    box,
    match
) {

    if (!box || !match) {
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
            getMatchStatus(
                match
            )
        );


    const competition =
        escapeHTML(
            getCompetition(
                match
            )
        );


    const date =
        formatDate(
            getMatchDate(
                match
            )
        );


    box.innerHTML = `

        <div class="match-detail-card">

            <div class="match-detail-header">

                ${
                    competition
                    ?
                    `
                    <p>
                        🏆 ${competition}
                    </p>
                    `
                    :
                    ""
                }

            </div>


            <div class="detail-teams">

                <div class="detail-team">

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


                <div class="detail-team">

                    <h2>
                        ${away}
                    </h2>

                </div>

            </div>


            <div class="detail-status">

                ${
                    isLiveMatch(match)
                    ?
                    `🔴 ${status || "LIVE"}`
                    :
                    isFinishedMatch(match)
                    ?
                    `✅ ${status || "TER

           // ======================================================
// ⚽ PREZISCORE — SPORTMONKS FOOTBALL API
// API.JS — PATI 4/4
// MATCH DETAILS • AUTO REFRESH • PAGE CONNECTION
// ======================================================


// ======================================================
// 🔗 GET MATCH ID FROM URL
// ======================================================

function getMatchIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get("id") ||
        params.get("match_id") ||
        ""
    );

}



// ======================================================
// 📄 START MATCH DETAILS PAGE
// ======================================================

async function startMatchDetailsPage() {

    const matchId =
        getMatchIdFromURL();


    if (!matchId) {

        const detailsBox =
            getElement(
                "matchDetails"
            );


        if (detailsBox) {

            detailsBox.innerHTML = `

                <div class="error-box">

                    <h2>
                        ⚠️ Aucun match sélectionné
                    </h2>


                    <p>
                        Retournez à la page des matchs
                        et sélectionnez un match.
                    </p>


                    <a
                        href="matches.html"
                        class="btn"
                    >
                        ← Retour aux matchs
                    </a>

                </div>

            `;

        }


        return;

    }


    console.log(
        "⚽ Match sélectionné:",
        matchId
    );


    await loadMatchCenter(
        matchId
    );

}



// ======================================================
// 🔄 REFRESH MATCH DETAILS
// ======================================================

async function refreshMatchDetails() {

    const matchId =
        getMatchIdFromURL();


    if (!matchId) {
        return;
    }


    console.log(
        "🔄 Actualisation du match:",
        matchId
    );


    await loadMatchCenter(
        matchId
    );

}



// ======================================================
// ⏱️ AUTO REFRESH MATCH CENTER
// ======================================================

function startMatchAutoRefresh() {

    const detailsPage =
        getElement(
            "matchDetails"
        );


    if (!detailsPage) {
        return;
    }


    setInterval(
        async function () {

            await refreshMatchDetails();

        },
        30000
    );

}



// ======================================================
// 🏠 AUTO START GENERAL PAGES
// ======================================================

function startPreziScore() {

    // ================================================
    // 🔴 LIVE
    // ================================================

    if (
        getElement(
            "liveMatches"
        )
    ) {

        loadLiveMatches(
            "liveMatches"
        );

    }


    // ================================================
    // 🏠 HOME LIVE
    // ================================================

    if (
        getElement(
            "homeLiveMatches"
        )
    ) {

        loadLiveMatches(
            "homeLiveMatches"
        );

    }


    // ================================================
    // 📅 UPCOMING
    // ================================================

    if (
        getElement(
            "upcomingMatches"
        )
    ) {

        loadUpcomingMatches(
            "upcomingMatches"
        );

    }


    // ================================================
    // 🏠 HOME UPCOMING
    // ================================================

    if (
        getElement(
            "homeUpcomingMatches"
        )
    ) {

        loadUpcomingMatches(
            "homeUpcomingMatches"
        );

    }


    // ================================================
    // ✅ FINISHED
    // ================================================

    if (
        getElement(
            "finishedMatches"
        )
    ) {

        loadFinishedMatches(
            "finishedMatches"
        );

    }


    // ================================================
    // ⚽ MATCH CENTER
    // ================================================

    if (
        getElement(
            "matchDetails"
        )
    ) {

        startMatchDetailsPage();

        startMatchAutoRefresh();

    }

}



// ======================================================
// 🌐 DOM READY
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        startPreziScore();

    }
);



// ======================================================
// 🌍 FINAL PUBLIC API
// ======================================================

window.PreziScore = {

    ...window.PreziScore,

    getMatchIdFromURL,

    startMatchDetailsPage,

    refreshMatchDetails,

    startMatchAutoRefresh,

    startPreziScore

};



// ======================================================
// 🛡️ GLOBAL ERROR HANDLER
// ======================================================

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "❌ PreziScore Error:",
            event.error ||
            event.message
        );

    }
);



// ======================================================
// 📡 NETWORK ERROR
// ======================================================

window.addEventListener(
    "unhandledrejection",
    function (event) {

        console.error(
            "❌ PreziScore Network Error:",
            event.reason
        );

    }
);



// ======================================================
// ⚽ PREZISCORE API ENGINE READY
// ======================================================

console.log(
    "======================================"
);

console.log(
    "⚽ PREZISCORE API ENGINE READY"
);

console.log(
    "🔴 LIVE"
);

console.log(
    "📅 UPCOMING"
);

console.log(
    "✅ FINISHED"
);

console.log(
    "📊 STATISTICS"
);

console.log(
    "⚽ EVENTS"
);

console.log(
    "👥 LINEUPS"
);

console.log(
    "🔄 AUTO REFRESH"
);

console.log(
    "======================================"
);              
