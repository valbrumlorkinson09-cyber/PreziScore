// ======================================================
// ⚽ PREZISCORE — NEW API ENGINE
// LIVE / TERMINÉS / À VENIR
// ======================================================

const SPORT_SCORE_API =
    "https://sportscore.com/api/widget";

let preziMatches = [];


// ======================================================
// GET ELEMENT
// ======================================================

function getElement(id) {
    return document.getElementById(id);
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
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
// API REQUEST
// ======================================================

async function sportScoreRequest() {

    try {

        const response = await fetch(
            SPORT_SCORE_API +
            "/matches/?sport=football&limit=100"
        );

        if (!response.ok) {
            throw new Error(
                "HTTP " + response.status
            );
        }

        const data = await response.json();

        return Array.isArray(data.matches)
            ? data.matches
            : [];

    } catch (error) {

        console.error(
            "❌ SportScore API ERROR:",
            error
        );

        return [];

    }

}


// ======================================================
// TEAM NAME
// ======================================================

function getTeamName(match, side) {

    if (side === "home") {

        return (
            match.home?.name ||
            match.home_team ||
            match.homeTeam ||
            match.teams?.home?.name ||
            match.home?.team?.name ||
            match.home ||
            "Équipe"
        );

    }

    return (
        match.away?.name ||
        match.away_team ||
        match.awayTeam ||
        match.teams?.away?.name ||
        match.away?.team?.name ||
        match.away ||
        "Équipe"
    );

}


// ======================================================
// MATCH STATUS
// ======================================================

function getMatchStatus(match) {

    return String(
        match.status?.short ||
        match.status?.type ||
        match.status?.name ||
        match.status?.text ||
        match.status_text ||
        match.status ||
        ""
    ).trim();

}


// ======================================================
// DATE
// ======================================================

function getMatchDate(match) {

    return (
        match.time ||
        match.start_time ||
        match.date ||
        match.start_at ||
        match.fixture?.date ||
        ""
    );

}


// ======================================================
// SCORE
// ======================================================

function getHomeScore(match) {

    return (
        match.home_score ??
        match.homeScore ??
        match.goals?.home ??
        match.scores?.home ??
        match.home?.score ??
        0
    );

}


function getAwayScore(match) {

    return (
        match.away_score ??
        match.awayScore ??
        match.goals?.away ??
        match.scores?.away ??
        match.away?.score ??
        0
    );

}


// ======================================================
// COMPETITION
// ======================================================

function getCompetition(match) {

    return (
        match.competition?.name ||
        match.competition ||
        match.league?.name ||
        match.league ||
        match.tournament?.name ||
        match.tournament ||
        match.competition_name ||
        match.league_name ||
        ""
    );

}


// ======================================================
// MATCH ID
// ======================================================

function getMatchId(match) {

    return (
        match.id ||
        match.match_id ||
        match.fixture_id ||
        match.fixture?.id ||
        match.slug ||
        ""
    );

}


// ======================================================
// NORMALIZE STATUS
// ======================================================

function normalizeStatus(status) {

    return String(status)
        .toLowerCase()
        .trim()
        .replace(/_/g, " ")
        .replace(/-/g, " ");

}


// ======================================================
// 🔴 LIVE STATUS
// ======================================================

function isLiveMatch(match) {

    const status =
        normalizeStatus(
            getMatchStatus(match)
        );


    // IMPORTANT:
    // FINISHED STATUS ALWAYS HAS PRIORITY

    if (isFinishedMatch(match)) {
        return false;
    }


    const liveStatuses = [

        "live",
        "inplay",
        "in play",

        "1h",
        "1st half",
        "first half",

        "ht",
        "half time",
        "halftime",

        "2h",
        "2nd half",
        "second half",

        "et",
        "extra time",
        "extra-time",

        "overtime",

        "penalties",
        "penalty"

    ];


    return liveStatuses.some(
        liveStatus =>
            status === liveStatus ||
            status.includes(liveStatus)
    );

}


// ======================================================
// ✅ FINISHED STATUS
// ======================================================

function isFinishedMatch(match) {

    const status =
        normalizeStatus(
            getMatchStatus(match)
        );


    const finishedStatuses = [

        "ft",
        "finished",
        "finish",
        "ended",
        "end",
        "complete",
        "completed",
        "final",
        "aet",
        "after extra time",
        "pen",
        "penalties finished",
        "cancelled",
        "canceled",
        "abandoned",
        "postponed",
        "walkover",
        "awarded"

    ];


    return finishedStatuses.some(
        finishedStatus =>
            status === finishedStatus ||
            status.includes(finishedStatus)
    );

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


    const dateValue =
        getMatchDate(match);


    if (!dateValue) {
        return false;
    }


    const date =
        new Date(dateValue);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    return date.getTime() > Date.now();

}


// ======================================================
// DATE FORMAT
// ======================================================

function formatMatchDate(dateValue) {

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
// MATCH CARD
// ======================================================

function renderMatchCard(
    box,
    match,
    type
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


    const competition =
        escapeHTML(
            getCompetition(match)
        );


    const status =
        escapeHTML(
            getMatchStatus(match)
        );


    const date =
        formatMatchDate(
            getMatchDate(match)
        );


    const homeScore =
        escapeHTML(
            getHomeScore(match)
        );


    const awayScore =
        escapeHTML(
            getAwayScore(match)
        );


    let badge = "";
    let score = "";
    let information = "";


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
                <span>${homeScore}</span>
                <b>-</b>
                <span>${awayScore}</span>
            </div>
        `;

        information = `
            <div class="match-live-status">
                🔴 ${status || "LIVE"}
            </div>
        `;

    }


    // ==================================================
    // ✅ FINISHED
    // ==================================================

    else if (type === "finished") {

        badge = `
            <span class="finished-badge">
                ✅ TERMINÉ
            </span>
        `;

        score = `
            <div class="match-score">
                <span>${homeScore}</span>
                <b>-</b>
                <span>${awayScore}</span>
            </div>
        `;

        information = `
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

        information = `
            <div class="match-date">
                📅 ${date}
            </div>
        `;

    }


    box.innerHTML += `

        <article class="match-card">

            <div class="match-header">
                ${badge}
            </div>

            <div class="match-teams">

                <div class="team home-team">
                    <h3>${home}</h3>
                </div>

                <div class="score-area">
                    ${score}
                </div>

                <div class="team away-team">
                    <h3>${away}</h3>
                </div>

            </div>

            ${information}

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

async function loadLiveMatches(containerId) {

    const box =
        getElement(containerId);


    if (!box) {
        return;
    }


    box.innerHTML = `
        <p>🔄 Chargement des matchs en direct...</p>
    `;


    const matches =
        await sportScoreRequest();


    preziMatches =
        matches;


    const liveMatches =
        matches.filter(
            isLiveMatch
        );


    console.log(
        "🔴 LIVE:",
        liveMatches.length
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
        .slice(0, 30)
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


// ======================================================
// ✅ LOAD FINISHED
// ======================================================

async function loadFinishedMatches(containerId) {

    const box =
        getElement(containerId);


    if (!box) {
        return;
    }


    box.innerHTML = `
        <p>🔄 Chargement des matchs terminés...</p>
    `;


    const matches =
        await sportScoreRequest();


    const finishedMatches =
        matches.filter(
            isFinishedMatch
        );


    console.log(
        "✅ FINISHED:",
        finishedMatches.length
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
        .slice(0, 30)
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
// 📅 LOAD UPCOMING
// ======================================================

async function loadUpcomingMatches(
    containerId
) {

    const box =
        getElement(containerId);


    if (!box) {
        return;
    }


    box.innerHTML = `
        <p>🔄 Chargement des prochains matchs...</p>
    `;


    const matches =
        await sportScoreRequest();


    const upcomingMatches =
        matches
            .filter(
                isUpcomingMatch
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


    console.log(
        "📅 UPCOMING:",
        upcomingMatches.length
    );


    box.innerHTML = "";


    if (
        upcomingMatches.length === 0
    ) {

        box.innerHTML = `
            <p>
                Aucun match prévu.
            </p>
        `;

        return;

    }


    upcomingMatches
        .slice(0, 30)
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
// 🔄 AUTO REFRESH
// ======================================================

setInterval(
    () => {

        const liveBox =
            getElement(
                "liveMatches"
            );


        if (liveBox) {

            loadLiveMatches(
                "liveMatches"
            );

        }


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
// 🚀 READY
// ======================================================

console.log(
    "⚽ PreziScore NEW API Engine loaded!"
);

console.log(
    "🔴 Live / ✅ Terminé / 📅 À venir"
);
