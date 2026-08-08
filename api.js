// ======================================================
// ⚽ PREZISCORE — SPORTMONKS FOOTBALL API V3
// LIVE • TERMINÉS • À VENIR • MATCH CENTER
// ======================================================

const API_TOKEN = "oaP2ACwS4QvpjWx7rHQUE4VQxA4LDu0s6OV4DW7omnDHz4oszwYyrwqk47Vm";

const API_BASE =
    "https://api.sportmonks.com/v3/football";

let preziMatches = [];


// ======================================================
// API REQUEST
// ======================================================

async function sportMonksRequest(endpoint) {

    try {

        const url =
            API_BASE + endpoint;

        console.log("🌐 Sportmonks request:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": API_TOKEN,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        const text = await response.text();

        console.log(
            "📡 Sportmonks HTTP:",
            response.status
        );

        if (!response.ok) {

            console.error(
                "❌ Sportmonks response:",
                text
            );

            throw new Error(
                "Sportmonks HTTP " +
                response.status +
                ": " +
                text
            );

        }

        const json =
            JSON.parse(text);

        console.log(
            "✅ Sportmonks data:",
            json
        );

        return json.data || [];

    }

    catch (error) {

        console.error(
            "🚨 SPORTMONKS API ERROR:",
            error
        );

        return null;

    }

}


// ======================================================
// HELPERS
// ======================================================

function getElement(id) {

    return document.getElementById(id);

}


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
// TEAM NAME
// ======================================================

function getTeamName(match, side) {

    const participants =
        match.participants || [];

    const team =
        participants.find(
            item =>
                item.meta?.location === side
        ) ||
        participants.find(
            item =>
                item.location === side
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

function getTeamId(match, side) {

    const participants =
        match.participants || [];

    const team =
        participants.find(
            item =>
                item.meta?.location === side
        ) ||
        participants.find(
            item =>
                item.location === side
        );

    return team?.id || null;

}


// ======================================================
// MATCH ID
// ======================================================

function getMatchId(match) {

    return match.id || "";

}


// ======================================================
// STATUS
// ======================================================

function getMatchStatus(match) {

    return (
        match.state?.short_name ||
        match.state?.name ||
        match.status?.short_name ||
        match.status?.name ||
        ""
    );

}


// ======================================================
// LIVE MINUTE
// ======================================================

function getLiveMinute(match) {

    return (
        match.periods?.[0]?.minutes ||
        match.state?.minute ||
        match.minute ||
        ""
    );

}


// ======================================================
// DATE
// ======================================================

function getMatchDate(match) {

    return (
        match.starting_at ||
        match.date ||
        ""
    );

}


// ======================================================
// SCORE
// ======================================================

function getScore(match, side) {

    const scores =
        match.scores || [];

    const participantId =
        getTeamId(
            match,
            side
        );

    const score =
        scores.find(
            item =>
                item.participant_id ===
                participantId &&
                (
                    item.description ===
                    "CURRENT" ||
                    item.description ===
                    "FT"
                )
        );

    return (
        score?.goals ??
        0
    );

}


// ======================================================
// LEAGUE
// ======================================================

function getCompetition(match) {

    return (
        match.league?.name ||
        match.competition?.name ||
        ""
    );

}


// ======================================================
// STATUS NORMALIZATION
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
        "PEN_LIVE",
        "BREAK"

    ].includes(status);

}


// ======================================================
// ✅ TERMINÉ
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
// 📅 À VENIR
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
        date.getTime() >
        Date.now()
    );

}


// ======================================================
// DATE FORMAT
// ======================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date =
        new Date(dateValue);

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
            getCompetition(
                match
            )
        );

    const status =
        escapeHTML(
            getMatchStatus(
                match
            )
        );

    const minute =
        escapeHTML(
            getLiveMinute(
                match
            )
        );

    let badge;
    let score;
    let bottom;


    // ==================================================
    // LIVE
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

        bottom = `
            <div class="match-live-status">

                ${
                    minute
                    ? minute + "'"
                    : status || "LIVE"
                }

            </div>
        `;

    }


    // ==================================================
    // FINISHED
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

        bottom = `
            <div class="match-status">
                Match terminé
            </div>
        `;

    }


    // ==================================================
    // UPCOMING
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

        bottom = `
            <div class="match-date">

                ${formatDate(
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


            ${bottom}


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
// 🔴 LIVE MATCHES
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
        "<p>🔄 Chargement...</p>";


    const matches =
        await sportMonksRequest(
            "/livescores/inplay?include=participants;scores;state;league"
        );


    if (!matches) {

        box.innerHTML =
            "<p>⚠️ API indisponible.</p>";

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
            "<p>Aucun match en direct.</p>";

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
// 📅 UPCOMING
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
        "<p>🔄 Chargement...</p>";


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const tomorrowDate =
        new Date(
            Date.now() +
            86400000
        );


    const tomorrow =
        tomorrowDate
            .toISOString()
            .split("T")[0];


    const matches =
        await sportMonksRequest(
            `/fixtures/between/${today}/${tomorrow}?include=participants;scores;state;league`
        );


    if (!matches) {

        box.innerHTML =
            "<p>⚠️ API indisponible.</p>";

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
// ✅ FINISHED
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
        "<p>🔄 Chargement...</p>";


    const yesterdayDate =
        new Date(
            Date.now() -
            86400000
        );


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const yesterday =
        yesterdayDate
            .toISOString()
            .split("T")[0];


    const matches =
        await sportMonksRequest(
            `/fixtures/between/${yesterday}/${today}?include=participants;scores;state;league`
        );


    if (!matches) {

        box.innerHTML =
            "<p>⚠️ API indisponible.</p>";

        return;

    }


    const finished =
        matches.filter(
            isFinishedMatch
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
// 🔄 LIVE REFRESH
// ======================================================

setInterval(
    () => {

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

    },
    30000
);


// ======================================================
// ⚽ MATCH CENTER
// ======================================================

const PreziScore = {

    async loadMatchDetails(
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


        const match =
            await sportMonksRequest(
                `/fixtures/${matchId}?include=participants;scores;state;league;events.type;statistics.type;lineups.player`
            );


        if (!match) {

            box.innerHTML = `
                <p>
                    ⚠️ Match introuvable.
                </p>
            `;

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

            </div>

        `;


        return match;

    },


    async loadMatchStatistics(
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


        const match =
            await sportMonksRequest(
                `/fixtures/${matchId}?include=statistics.type`
            );


        if (
            !match ||
            !match.statistics
        ) {

            box.innerHTML =
                "<p>📊 Statistiques indisponibles.</p>";

            return;

        }


        box.innerHTML = "";


        match.statistics.forEach(
            stat => {

                box.innerHTML += `

                    <div class="stat-row">

                        <span>
                            ${
                                stat.type?.name ||
                                "Stat"
                            }
                        </span>

                        <strong>
                            ${
                                stat.data?.value ??
                                "-"
                            }
                        </strong>

                    </div>

                `;

            }
        );

    },


    async loadLineups(
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


        const match =
            await sportMonksRequest(
                `/fixtures/${matchId}?include=lineups.player`
            );


        if (
            !match ||
            !match.lineups
        ) {

            box.innerHTML =
                "<p>👥 Compositions indisponibles.</p>";

            return;

        }


        bo
