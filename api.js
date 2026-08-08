// ======================================================
// ⚽ PREZISCORE — API ENGINE
// REAL FOOTBALL DATA ONLY
// ======================================================


// ======================================================
// API CONFIG
// ======================================================

const SPORT_SCORE_API =
    "https://sportscore.com/api/widget";


// ======================================================
// GLOBAL DATA
// ======================================================

let preziMatches = [];


// ======================================================
// API REQUEST
// ======================================================

async function sportScoreRequest(endpoint) {

    try {

        const response = await fetch(
            SPORT_SCORE_API + endpoint
        );


        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }


        const data =
            await response.json();


        return data;

    }

    catch (error) {

        console.error(
            "SportScore API ERROR:",
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
            match.home?.name ||
            match.home?.team?.name ||
            "Équipe"
        );

    }


    return (
        match.away ||
        match.away_team ||
        match.awayTeam ||
        match.teams?.away?.name ||
        match.away?.name ||
        match.away?.team?.name ||
        "Équipe"
    );

}


// ======================================================
// MATCH ID / SLUG
// ======================================================

function getMatchSlug(match) {

    return (
        match.slug ||
        match.match_slug ||
        match.match_id ||
        match.id ||
        match.fixture_id ||
        match.fixture?.id ||
        ""
    );

}


// ======================================================
// MATCH STATUS
// ======================================================

function getMatchStatus(match) {

    return (
        match.status_text ||
        match.status?.text ||
        match.status?.name ||
        match.status?.type ||
        match.status?.short ||
        match.status?.long ||
        match.status ||
        ""
    );

}


// ======================================================
// MATCH DATE
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
        "-"
    );

}


function getAwayScore(match) {

    return (
        match.away_score ??
        match.awayScore ??
        match.goals?.away ??
        match.scores?.away ??
        match.away?.score ??
        "-"
    );

}


// ======================================================
// COMPETITION
// ======================================================

function getCompetition(match) {

    return (
        match.competition ||
        match.league ||
        match.tournament ||
        match.competition_name ||
        match.league_name ||
        match.tournament_name ||
        ""
    );

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
// STATUS HELPERS
// ======================================================

function isFinishedMatch(match) {

    const status =
        String(
            getMatchStatus(match)
        ).toLowerCase();


    return (
        status.includes("finished") ||
        status.includes("ended") ||
        status.includes("complete") ||
        status === "ft" ||
        status.includes("final")
    );

}


function isUpcomingMatch(match) {

    const dateValue =
        getMatchDate(match);


    if (!dateValue) {

        return false;

    }


    const date =
        new Date(
            dateValue
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    if (
        date.getTime() <=
        Date.now()
    ) {

        return false;

    }


    if (
        isFinishedMatch(match)
    ) {

        return false;

    }


    return true;

}


// ======================================================
// DEBUG
// ======================================================

console.log(
    "⚽ PreziScore API Engine starting..."
);

console.log(
    "🌍 Real football data only"
);
// ======================================================
// ⚽ PREZISCORE — API ENGINE
// PATI 2/4
// LIVE + UPCOMING MATCHES
// ======================================================


// ======================================================
// 🔴 DETECT LIVE MATCH
// ======================================================

function isLiveMatch(match) {

    const status =
        String(
            getMatchStatus(match)
        ).toLowerCase()
        .trim();


    // Statut explicitement live
    const liveStatuses = [

        "live",
        "inplay",
        "in-play",

        "1st half",
        "first half",
        "1h",

        "2nd half",
        "second half",
        "2h",

        "half time",
        "halftime",

        "extra time",
        "extra-time",

        "overtime",

        "penalties",
        "penalty"

    ];


    // Vérification du statut
    if (
        liveStatuses.some(
            liveStatus =>
                status.includes(
                    liveStatus
                )
        )
    ) {

        return true;

    }


    // ==================================================
    // API KA GEN MINIT MATCH LA
    // ==================================================

    const minute =
        match.minute ??
        match.minutes ??
        match.elapsed ??
        match.match_time ??
        match.status?.minute ??
        null;


    if (
        minute !== null &&
        minute !== undefined &&
        minute !== ""
    ) {

        const number =
            parseInt(
                String(
                    minute
                ).replace(
                    /[^0-9]/g,
                    ""
                )
            );


        if (
            !isNaN(number) &&
            number >= 0 &&
            number <= 150
        ) {

            if (
                !isFinishedMatch(
                    match
                )
            ) {

                return true;

            }

        }

    }


    return false;

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
        Array.isArray(
            data.matches
        )
        ?
        data.matches
        :
        [];


    // Sauvegarde globale
    preziMatches =
        matches;


    // ==================================================
    // FILTRE LIVE
    // ==================================================

    const liveMatches =
        matches.filter(
            match =>
                isLiveMatch(
                    match
                )
        );


    console.log(
        "🔴 Live matches:",
        liveMatches
    );


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


    box.innerHTML = "";


    liveMatches
        .slice(
            0,
            30
        )
        .forEach(
            match => {

                renderMatchCard(
                    box,
                    match,
                    true
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
        Array.isArray(
            data.matches
        )
        ?
        data.matches
        :
        [];


    preziMatches =
        matches;


    // ==================================================
    // FILTRE MATCHS À VENIR
    // ==================================================

    const upcomingMatches =
        matches
            .filter(
                match =>
                    isUpcomingMatch(
                        match
                    )
            )
            .sort(
                (
                    first,
                    second
                ) => {

                    const firstDate =
                        new Date(
                            getMatchDate(
                                first
                            )
                        ).getTime();


                    const secondDate =
                        new Date(
                            getMatchDate(
                                second
                            )
                        ).getTime();


                    return (
                        firstDate -
                        secondDate
                    );

                }
            );


    console.log(
        "📅 Upcoming matches:",
        upcomingMatches
    );


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


    box.innerHTML = "";


    upcomingMatches
        .slice(
            0,
            30
        )
        .forEach(
            match => {

                renderMatchCard(
                    box,
                    match,
                    false
                );

            }
        );

}


// ======================================================
// 🔄 REFRESH LIVE MATCHES
// ======================================================

function refreshLiveMatches(
    containerId
) {

    loadLiveMatches(
        containerId
    );

}


// ======================================================
// AUTO REFRESH
// ======================================================

// Actualise les matchs live toutes les 30 secondes.

setInterval(
    function () {

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
// FIN PARTIE 2
// ======================================================
// ======================================================
// ⚽ PREZISCORE — API ENGINE
// PATI 3/4
// MATCH CARDS + MATCH NAVIGATION
// ======================================================


// ======================================================
// 🧩 RENDER MATCH CARD
// ======================================================

function renderMatchCard(
    box,
    match,
    isLive
) {

    if (!box || !match) {

        return;

    }


    // ==================================================
    // TEAMS
    // ==================================================

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


    // ==================================================
    // SCORE
    // ==================================================

    const homeScore =
        getHomeScore(
            match
        );


    const awayScore =
        getAwayScore(
            match
        );


    // ==================================================
    // STATUS
    // ==================================================

    const status =
        escapeHTML(
            getMatchStatus(
                match
            )
        );


    // ==================================================
    // COMPETITION
    // ==================================================

    const competition =
        escapeHTML(
            getCompetition(
                match
            )
        );


    // ==================================================
    // DATE
    // ==================================================

    const dateValue =
        getMatchDate(
            match
        );


    const dateText =
        formatMatchDate(
            dateValue
        );


    // ==================================================
    // REAL MATCH ID / SLUG
    // ==================================================

    const slug =
        getMatchSlug(
            match
        );


    // ==================================================
    // MATCH BUTTON
    // ==================================================

    let buttonHTML = "";


    if (slug) {

        buttonHTML = `

            <button
                class="match-button"
                onclick="
                    openMatch(
                        '${encodeURIComponent(
                            slug
                        )}'
                    )
                "
            >
                Voir le match →
            </button>

        `;

    }


    // ==================================================
    // STATUS / DATE
    // ==================================================

    let informationHTML = "";


    if (isLive) {

        informationHTML = `

            <div
                class="match-live-status"
            >

                <span>
                    🔴
                </span>

                <strong>
                    ${status || "LIVE"}
                </strong>

            </div>

        `;

    }

    else {

        informationHTML = `

            <div
                class="match-date"
            >

                📅
                ${
                    dateText ||
                    "Date indisponible"
                }

            </div>

        `;

    }


    // ==================================================
    // COMPETITION
    // ==================================================

    let competitionHTML = "";


    if (competition) {

        competitionHTML = `

            <div
                class="match-competition"
            >

                🏆
                ${competition}

            </div>

        `;

    }


    // ==================================================
    // SCORE / VS
    // ==================================================

    let scoreHTML = "";


    if (isLive) {

        scoreHTML = `

            <div
                class="match-score"
            >

                <span>
                    ${homeScore}
                </span>

                <b>
                    -
                </b>

                <span>
                    ${awayScore}
                </span>

            </div>

        `;

    }

    else {

        scoreHTML = `

            <div
                class="match-score upcoming-score"
            >

                VS

            </div>

        `;

    }


    // ==================================================
    // CARD
    // ==================================================

    box.innerHTML += `

        <article
            class="match-card"
        >


            <div
                class="match-header"
            >

                ${
                    isLive
                    ?
                    `
                        <span
                            class="live-badge"
                        >
                            🔴 LIVE
                        </span>
                    `
                    :
                    `
                        <span
                            class="upcoming-badge"
                        >
                            📅 À VENIR
                        </span>
                    `
                }

            </div>


            <div
                class="match-teams"
            >

                <div
                    class="team home-team"
                >

                    <h3>
                        ${home}
                    </h3>

                </div>


                <div
                    class="score-area"
                >

                    ${scoreHTML}

                </div>


                <div
                    class="team away-team"
                >

                    <h3>
                        ${away}
                    </h3>

                </div>

            </div>


            ${informationHTML}


            ${competitionHTML}


            ${
                buttonHTML
                ?
                `
                    <div
                        class="match-action"
                    >

                        ${buttonHTML}

                    </div>
                `
                :
                ""
            }


        </article>

    `;

}


// ======================================================
// 🔗 OPEN MATCH
// ======================================================

function openMatch(
    slug
) {

    if (!slug) {

        console.warn(
            "⚠️ Match slug manquant."
        );

        return;

    }


    const encodedSlug =
        encodeURIComponent(
            decodeURIComponent(
                slug
            )
        );


    window.location.href =
        `match.html?slug=${encodedSlug}`;

}


// ======================================================
// 🔎 GET SELECTED MATCH FROM URL
// ======================================================

function getSelectedMatchSlug() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get("slug") ||
        params.get("id") ||
        ""
    );

}


// ======================================================
// 📌 FORMAT STATUS FOR DISPLAY
// ======================================================

function formatMatchStatus(
    match
) {

    const status =
        getMatchStatus(
            match
        );


    if (!status) {

        return "";

    }


    return escapeHTML(
        status
    );

}


// ======================================================
// 📊 SIMPLE MATCH INFO
// ======================================================

function getMatchInfo(
    match
) {

    if (!match) {

        return null;

    }


    return {

        slug:
            getMatchSlug(
                match
            ),

        home:
            getTeamName(
                match,
                "home"
            ),

        away:
            getTeamName(
                match,
                "away"
            ),

        homeScore:
            getHomeScore(
                match
            ),

        awayScore:
            getAwayScore(
                match
            ),

        status:
            getMatchStatus(
                match
            ),

        competition:
            getCompetition(
                match
            ),

        date:
            getMatchDate(
                match
            )

    };

}


// ======================================================
// 🔍 FIND MATCH IN CURRENT DATA
// ======================================================

function findPreziMatch(
    slug
) {

    if (!slug) {

        return null;

    }


    const decoded =
        decodeURIComponent(
            slug
        );


    return (
        preziMatches.find(
            match => {

                const matchSlug =
                    String(
                        getMatchSlug(
                            match
                        )
                    );


                return (
                    matchSlug ===
                    decoded
                );

            }
        )
        ||
        null
    );

}


// ======================================================
// FIN PARTIE 3
// ======================================================

// ======================================================
// ⚽ PREZISCORE — API ENGINE
// PATI 4/4
// MATCH DETAILS + STATISTICS + LINEUPS + AUTO START
// ======================================================


// ======================================================
// 🔎 MATCH DETAILS
// ======================================================

async function loadMatchDetails(
    slug,
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


    const data =
        await sportScoreRequest(
            `/match/?sport=football&slug=${encodeURIComponent(
                slug
            )}`
        );


    if (!data) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger le match.
            </p>
        `;

        return null;

    }


    const match =
        data.match ||
        data.data ||
        data;


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
        getHomeScore(
            match
        );


    const awayScore =
        getAwayScore(
            match
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
        formatMatchDate(
            getMatchDate(
                match
            )
        );


    box.innerHTML = `

        <div
            class="match-detail-card"
        >

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


            <div
                class="detail-teams"
            >

                <h2>
                    ${home}
                </h2>


                <div
                    class="detail-score"
                >

                    ${homeScore}

                    -

                    ${awayScore}

                </div>


                <h2>
                    ${away}
                </h2>

            </div>


            ${
                status
                ?
                `
                    <p>
                        🔴 ${status}
                    </p>
                `
                :
                ""
            }


            ${
                date
                ?
                `
                    <p>
                        📅 ${date}
                    </p>
                `
                :
                ""
            }

        </div>

    `;


    return match;

}


// ======================================================
// 📊 STATISTICS
// ======================================================

async function loadMatchStatistics(
    slug,
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


    const data =
        await sportScoreRequest(
            `/match/?sport=football&slug=${encodeURIComponent(
                slug
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
        data.data ||
        data;


    const statistics =
        match.statistics ||
        match.stats ||
        [];


    if (
        !Array.isArray(
            statistics
        ) ||
        statistics.length === 0
    ) {

        box.innerHTML = `
            <p>
                📊 Statistiques indisponibles
                pour ce match.
            </p>
        `;

        return;

    }


    box.innerHTML = "";


    statistics.forEach(
        stat => {

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

                <div
                    class="stats-row"
                >

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

        }
    );

}


// ======================================================
// 👥 LINEUPS
// ======================================================

async function loadLineups(
    slug,
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


    const data =
        await sportScoreRequest(
            `/match/?sport=football&slug=${encodeURIComponent(
                slug
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
        data.data ||
        data;


    const lineups =
        match.lineups ||
        match.lineup ||
        [];


    if (
        !Array.isArray(
            lineups
        ) ||
        lineups.length === 0
    ) {

        box.innerHTML = `
            <p>
                👥 Compositions indisponibles
                pour ce match.
            </p>
        `;

        return;

    }


    box.innerHTML = "";


    lineups.forEach(
        team => {

            const teamName =
                escapeHTML(
                    team.team?.name ||
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

                <div
                    class="lineup-card"
                >

                    <h3>
                        ${teamName}
                    </h3>


                    <ul>

                        ${
                            Array.isArray(
                                players
                            )
                            ?
                            players
                                .map(
                                    player => `
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
                                    `
                                )
                                .join("")
                            :
                            `
                                <li>
                                    Données indisponibles
                                </li>
                            `
                        }

                    </ul>

                </div>

            `;

        }
    );

}


// ======================================================
// 🌍 PUBLIC PREZISCORE API
// ======================================================

window.PreziScore = {

    loadLiveMatches:
        loadLiveMatches,

    loadUpcomingMatches:
        loadUpcomingMatches,

    loadMatchDetails:
        loadMatchDetails,

    loadMatchStatistics:
        loadMatchStatistics,

    loadLineups:
        loadLineups,

    openMatch:
        openMatch

};


// ======================================================
// 🚀 AUTO START
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        // ==============================================
        // 🏠 ACCUEIL — LIVE
        // ==============================================

        if (
            getElement(
                "homeLiveMatches"
            )
        ) {

            loadLiveMatches(
                "homeLiveMatches"
            );

        }


        // ==============================================
        // 🏠 ACCUEIL — UPCOMING
        // ==============================================

        if (
            getElement(
                "homeUpcomingMatches"
            )
        ) {

            loadUpcomingMatches(
                "homeUpcomingMatches"
            );

        }


        // ==============================================
        // ⚽ PAGE MATCHS — LIVE
        // ==============================================

        if (
            getElement(
                "liveMatches"
            )
        ) {

            loadLiveMatches(
                "liveMatches"
            );

        }


        // ==============================================
        // 📅 PAGE MATCHS — UPCOMING
        // ==============================================

        if (
            getElement(
                "upcomingMatches"
            )
        ) {

            loadUpcomingMatches(
                "upcomingMatches"
            );

        }


        console.log(
            "🚀 PreziScore Global System Loaded"
        );

    }
);


// ======================================================
// API ENGINE READY
// ======================================================

console.log(
    "⚽ PreziScore API Engine Ready"
);

console.log(
    "🔴 Live system ready"
);

console.log(
    "📅 Upcoming system ready"
);

console.log(
    "📊 Statistics system ready"
);

console.log(
    "👥 Lineups system ready"
);


// ======================================================
// FIN API.JS
// ======================================================
