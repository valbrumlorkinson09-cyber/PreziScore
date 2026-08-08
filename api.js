// ======================================================
// ⚽ PREZISCORE — SPORTMONKS FOOTBALL API V3
// LIVE • TERMINÉS • À VENIR • MATCH CENTER
// ======================================================


// ======================================================
// 🔐 API CONFIG
// ======================================================

const API_TOKEN = "T9KHvE4ohaSj4w1gXYTRya9aiyNyWhYtZXu2ZD6PX5AFds8pWBwYN3jPL8KW:;

const API_BASE =
    "https://api.sportmonks.com/v3/football";


// ======================================================
// GLOBAL
// ======================================================

let preziMatches = [];


// ======================================================
// 🌐 API REQUEST
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
                "❌ API ERROR:",
                text
            );

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const json =
            JSON.parse(text);


        return json.data ?? null;

    }

    catch (error) {

        console.error(
            "🚨 Sportmonks:",
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
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ======================================================
// PARTICIPANT
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
        team =>
            team?.meta?.location === side ||
            team?.location === side
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
// MATCH ID
// ======================================================

function getMatchId(match) {

    return match?.id || "";

}


// ======================================================
// DATE
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
// MINUTE
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


    const score =
        scores.find(
            item =>
                item?.participant_id === teamId &&
                (
                    item?.description === "CURRENT" ||
                    item?.description === "FT"
                )
        );


    return score?.goals ?? 0;

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
// STATUS NORMALIZE
// ======================================================

function normalizedStatus(match) {

    return String(
        getMatchStatus(match)
    )
    .toUpperCase()
    .trim();

}


// ======================================================
// 🔴 LIVE
// ======================================================

function isLiveMatch(match) {

    const status =
        normalizedStatus(match);


    return [
        "LIVE",
        "1H",
        "2H",
        "HT",
        "ET",
        "BREAK",
        "PEN_LIVE"
    ].includes(status);

}


// ======================================================
// ✅ FINISHED
// ======================================================

function isFinishedMatch(match) {

    const status =
        normalizedStatus(match);


    return [
        "FT",
        "AET",
        "FT_PEN",
        "FINISHED",
        "ENDED"
    ].includes(status);

}


// ======================================================
// 📅 UPCOMING
// ======================================================

function isUpcomingMatch(match) {

    if (
        isLiveMatch(match) ||
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
        date.getTime() > Date.now()
    );

}


// ======================================================
// DATE FORMAT
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
// 🔗 OPEN MATCH
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


    const status =
        escapeHTML(
            getMatchStatus(match)
        );


    let badge = "";

    let score = "";

    let info = "";


    // ==================================================
    // 🔴 LIVE
    // ==================================================

    if (
        type === "live"
    ) {

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
    // 📅 UPCOMING
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
                📅 ${formatDate(
                    getMatchDate(match)
                )}
            </div>
        `;

    }


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
// 🔴 LOAD LIVE
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


    box.innerHTML =
        "<p>🔄 Chargement des matchs en direct...</p>";


    const matches =
        await sportMonksRequest(
            "/livescores/inplay?include=scores;events;participants;periods;state;league"
        );


    if (!matches) {

        box.innerHTML =
            "<p>⚠️ Impossible de charger les matchs live.</p>";

        return;

    }


    preziMatches =
        matches;


    const live =
        matches.filter(
            isLiveMatch
        );


    box.innerHTML = "";


    if (!live.length) {

        box.innerHTML =
            "<p>Aucun match en direct actuellement.</p>";

        return;

    }


    live.forEach(
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
// 📅 LOAD UPCOMING
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


    box.innerHTML =
        "<p>🔄 Chargement des prochains matchs...</p>";


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const future =
        new Date(
            Date.now() +
            (3 * 86400000)
        );


    const futureDate =
        future
            .toISOString()
            .split("T")[0];


    const matches =
        await sportMonksRequest(
            `/fixtures/between/${today}/${futureDate}?include=participants;scores;state;league`
        );


    if (!matches) {

        box.innerHTML =
            "<p>⚠️ Impossible de charger les matchs à venir.</p>";

        return;

    }


    const upcoming =
        matches
            .filter(
                isUpcomingMatch
            )
            .sort(
                (a, b) =>
                    new Date(
                        getMatchDate(a)
                    ) -
                    new Date(
                        getMatchDate(b)
                    )
            );


    box.innerHTML = "";


    if (!upcoming.length) {

        box.innerHTML =
            "<p>Aucun match à venir.</p>";

        return;

    }


    upcoming
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
// ✅ LOAD FINISHED
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


    box.innerHTML =
        "<p>🔄 Chargement des matchs terminés...</p>";


    const yesterday =
        new Date(
            Date.now() -
            86400000
        );


    const today =
        new Date();


    const start =
        yesterday
            .toISOString()
            .split("T")[0];


    const end =
        today
            .toISOString()
            .split("T")[0];


    const matches =
        await sportMonksRequest(
            `/fixtures/between/${start}/${end}?include=participants;scores;state;league`
        );


    if (!matches) {

        box.innerHTML =
            "<p>⚠️ Impossible de charger les matchs terminés.</p>";

        return;

    }


    const finished =
        matches
            .filter(
                isFinishedMatch
            )
            .sort(
                (a, b) =>
                    new Date(
                        getMatchDate(b)
                    ) -
                    new Date(
                        getMatchDate(a)
                    )
            );


    box.innerHTML = "";


    if (!finished.length) {

        box.innerHTML =
            "<p>Aucun match terminé.</p>";

        return;

    }


    finished
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
// 📊 MATCH CENTER
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


    box.innerHTML =
        "<p>🔄 Chargement du match...</p>";


    const match =
        await sportMonksRequest(
            `/fixtures/${matchId}?include=participants;scores;state;league;events.type;events.player;statistics.type;lineups.player;lineups.position`
        );


    if (!match) {

        box.innerHTML =
            "<p>⚠️ Match introuvable.</p>";

        return null;

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


    box.innerHTML = `

        <div class="match-detail-card">

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

                    <span>-</span>

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


            <div class="match-status">

                ${
                    isLiveMatch(match)
                    ?
                    `🔴 LIVE ${getLiveMinute(match)}'`
                    :
                    escapeHTML(
                        getMatchStatus(match)
                    )
                }

            </div>

        </div>

    `;


    return match;

}


// ======================================================
// 📊 STATISTICS
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


    box.innerHTML =
        "<p>🔄 Chargement des statistiques...</p>";


    const match =
        await sportMonksRequest(
            `/fixtures/${matchId}?include=statistics.type`
        );


    if (
        !match ||
        !Array.isArray(
            match.statistics
        ) ||
        !match.statistics.length
    ) {

        box.innerHTML =
            "<p>📊 Statistiques indisponibles.</p>";

        return;

    }


    box.innerHTML = "";


    match.statistics.forEach(
        stat => {

            const name =
                stat.type?.name ||
                stat.name ||
                "Statistique";


      
