// ======================================================
// ⚽ PREZISCORE — SPORTScore
// API.JS — PATI 1/4
// API BASE + REQUEST + HELPERS
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

async function sportScoreRequest(
    endpoint
) {

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
            SPORT_SCORE_API + endpoint
        );

        console.log(
            "📡 HTTP:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }


        const json =
            await response.json();


        console.log(
            "✅ SportScore DATA:",
            json
        );


        return json;

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
// 🧩 GET ELEMENT
// ======================================================

function getElement(id) {

    return document.getElementById(id);

}


// ======================================================
// 🔐 ESCAPE HTML
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
// 🧩 EXTRACT MATCHES
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


    return [];

}


// ======================================================
// 🏠 TEAM NAME
// ======================================================

function getTeamName(
    match,
    side
) {

    const team =
        match?.[side] ||
        match?.teams?.[side] ||
        match?.[`${side}_team`] ||
        null;


    if (typeof team === "string") {

        return team;

    }


    return (
        team?.name ||
        team?.short_name ||
        team?.shortName ||
        "Équipe"
    );

}


// ======================================================
// ⚽ SCORE
// ======================================================

function getScore(
    match,
    side
) {

    const team =
        match?.[side] ||
        match?.teams?.[side] ||
        null;


    if (typeof team === "object") {

        return (
            team?.score ??
            team?.goals ??
            0
        );

    }


    return (
        match?.score?.[side] ??
        match?.scores?.[side] ??
        match?.[`${side}_score`] ??
        0
    );

}


// ======================================================
// 📅 MATCH DATE
// ======================================================

function getMatchDate(match) {

    return (
        match?.starting_at ||
        match?.start_time ||
        match?.startTime ||
        match?.date ||
        match?.timestamp ||
        ""
    );

}


// ======================================================
// 📊 STATUS
// ======================================================

function getMatchStatus(match) {

    return (
        match?.status?.name ||
        match?.status ||
        match?.state?.name ||
        match?.state ||
        ""
    );

}


// ======================================================
// 🏆 COMPETITION
// ======================================================

function getCompetition(match) {

    return (
        match?.competition?.name ||
        match?.league?.name ||
        match?.tournament?.name ||
        ""
    );

}


// ======================================================
// 🆔 MATCH SLUG
// ======================================================

function getMatchSlug(match) {

    return (
        match?.slug ||
        match?.match_slug ||
        match?.id ||
        ""
    );

}


// ======================================================
// ⏱️ LIVE MINUTE
// ======================================================

function getLiveMinute(match) {

    return (
        match?.minute ??
        match?.clock ??
        match?.time ??
        ""
    );

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
// 🚀 API READY
// ======================================================

console.log(
    "⚽ PreziScore SportScore — PART 1 READY"
);

console.log(
    "🌐 API sans clé"
);

console.log(
    "🔴 LIVE | ✅ FINISHED | 📅 UPCOMING"
);

// ======================================================
// ⚽ PREZISCORE — SPORTScore
// API.JS — PATI 2/4
// LIVE • TERMINÉS • À VENIR
// ======================================================


// ======================================================
// 📊 NORMALIZE STATUS
// ======================================================

function normalizedStatus(match) {

    return String(
        getMatchStatus(match)
    )
    .toLowerCase()
    .trim();

}


// ======================================================
// 🔴 LIVE MATCH
// ======================================================

function isLiveMatch(match) {

    const status =
        normalizedStatus(match);


    const liveWords = [
        "live",
        "inplay",
        "in play",
        "1h",
        "2h",
        "ht",
        "half time",
        "halftime",
        "et",
        "extra time",
        "pen",
        "playing"
    ];


    return liveWords.some(
        word =>
            status.includes(word)
    );

}


// ======================================================
// ✅ FINISHED MATCH
// ======================================================

function isFinishedMatch(match) {

    const status =
        normalizedStatus(match);


    const finishedWords = [
        "finished",
        "ft",
        "full time",
        "ended",
        "complete",
        "completed",
        "after extra time",
        "after penalties"
    ];


    return finishedWords.some(
        word =>
            status.includes(word)
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


    const value =
        getMatchDate(match);


    if (!value) {
        return false;
    }


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
// 🧩 GET ALL MATCHES
// ======================================================

async function getFootballMatches() {

    const response =
        await sportScoreRequest(
            "/matches/?sport=football&limit=100"
        );


    if (!response) {

        return [];

    }


    const matches =
        extractMatches(response);


    preziMatches =
        matches;


    console.log(
        "⚽ MATCHES:",
        matches
    );


    return matches;

}


// ======================================================
// 🔴 LOAD LIVE
// ======================================================

async function loadLiveMatches(
    containerId
) {

    const box =
        getElement(containerId);


    if (!box) {
        return;
    }


    box.innerHTML = `
        <p>
            🔄 Chargement des matchs live...
        </p>
    `;


    const matches =
        await getFootballMatches();


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
        .slice(0, 50)
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
        <p>
            🔄 Chargement des matchs à venir...
        </p>
    `;


    const matches =
        await getFootballMatches();


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
                        )
                        -
                        new Date(
                            getMatchDate(b)
                        )
                    );

                }
            );


    box.innerHTML = "";


    if (
        upcomingMatches.length === 0
    ) {

        box.innerHTML = `
            <p>
                📅 Aucun match à venir trouvé.
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
// ✅ LOAD FINISHED
// ======================================================

async function loadFinishedMatches(
    containerId
) {

    const box =
        getElement(containerId);


    if (!box) {
        return;
    }


    box.innerHTML = `
        <p>
            🔄 Chargement des matchs terminés...
        </p>
    `;


    const matches =
        await getFootballMatches();


    const finishedMatches =
        matches.filter(
            match =>
                isFinishedMatch(match)
        );


    box.innerHTML = "";


    if (
        finishedMatches.length === 0
    ) {

        box.innerHTML = `
            <p>
                Aucun match terminé trouvé.
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

    const live =
        getElement("liveMatches");


    const homeLive =
        getElement(
            "homeLiveMatches"
        );


    if (live) {

        loadLiveMatches(
            "liveMatches"
        );

    }


    if (homeLive) {

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
// 🚀 PART 2 READY
// ======================================================

console.log(
    "⚽ PreziScore — PART 2 READY"
);

console.log(
    "🔴 LIVE"
);

console.log(
    "✅ FINISHED"
);

console.log(
    "📅 UPCOMING"
);

// ======================================================
// ⚽ PREZISCORE — SPORTScore
// API.JS — PATI 3/4
// MATCH CARDS • SCORE • STATISTIQUES DE BASE
// ======================================================


// ======================================================
// 🧩 GET TEAM OBJECT
// ======================================================

function getTeamObject(match, side) {

    const team =
        match?.[side] ||
        match?.teams?.[side] ||
        match?.[`${side}_team`] ||
        null;

    return team;
}


// ======================================================
// 🖼️ TEAM LOGO
// ======================================================

function getTeamLogo(match, side) {

    const team =
        getTeamObject(match, side);

    return (
        team?.logo ||
        team?.logo_url ||
        team?.image ||
        team?.image_url ||
        ""
    );
}


// ======================================================
// 🏆 MATCH CARD
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


    const date =
        formatDate(
            getMatchDate(match)
        );


    const homeLogo =
        getTeamLogo(
            match,
            "home"
        );


    const awayLogo =
        getTeamLogo(
            match,
            "away"
        );


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

                🔴 ${
                    status || "LIVE"
                }

                ${
                    minute !== ""
                    ?
                    ` • ${escapeHTML(minute)}'`
                    :
                    ""
                }

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
                ${status || "Finished"}
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
                📅 ${date}
            </div>
        `;

    }


    // ==================================================
    // 🖼️ LOGO HOME
    // ==================================================

    const homeImage =
        homeLogo
        ?
        `
        <img
            src="${escapeHTML(homeLogo)}"
            alt="${home}"
            class="team-logo"
        >
        `
        :
        `
        <div class="team-logo-placeholder">
            ⚽
        </div>
        `;


    // ==================================================
    // 🖼️ LOGO AWAY
    // ==================================================

    const awayImage =
        awayLogo
        ?
        `
        <img
            src="${escapeHTML(awayLogo)}"
            alt="${away}"
            class="team-logo"
        >
        `
        :
        `
        <div class="team-logo-placeholder">
            ⚽
        </div>
        `;


    // ==================================================
    // 🆔 MATCH ID
    // ==================================================

    const slug =
        getMatchSlug(match);


    const matchButton =
        slug
        ?
        `
        <button
            type="button"
            class="match-button"
            onclick="openMatch('${encodeURIComponent(slug)}')"
        >
            Voir détails →
        </button>
        `
        :
        "";


    // ==================================================
    // CARD
    // ==================================================

    box.innerHTML += `

        <article class="match-card">

            <div class="match-header">

                ${badge}

            </div>


            <div class="match-teams">


                <!-- HOME -->

                <div class="team">

                    ${homeImage}

                    <h3>
                        ${home}
                    </h3>

                </div>


                <!-- SCORE -->

                <div class="score-area">

                    ${score}

                </div>


                <!-- AWAY -->

                <div class="team">

                    ${awayImage}

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


            ${matchButton}

        </article>

    `;

}


// ======================================================
// 📊 BASIC MATCH STATISTICS
// ======================================================

function getMatchStatistics(match) {

    return {

        homeScore:
            Number(
                getScore(
                    match,
                    "home"
                )
            ) || 0,

        awayScore:
            Number(
                getScore(
                    match,
                    "away"
                )
            ) || 0,

        status:
            getMatchStatus(match),

        competition:
            getCompetition(match),

        date:
            getMatchDate(match)

    };

}


// ======================================================
// 🏆 MATCH RESULT
// ======================================================

function getMatchResult(match) {

    const home =
        Number(
            getScore(
                match,
                "home"
            )
        ) || 0;


    const away =
        Number(
            getScore(
                match,
                "away"
            )
        ) || 0;


    if (home > away) {
        return "HOME_WIN";
    }


    if (away > home) {
        return "AWAY_WIN";
    }


    return "DRAW";

}


// ======================================================
// 📈 TEAM RESULT
// ======================================================

function getTeamResult(
    match,
    teamSide
) {

    const result =
        getMatchResult(match);


    if (
        result === "DRAW"
    ) {

        return "DRAW";

    }


    if (
        teamSide === "home"
        &&
        result === "HOME_WIN"
    ) {

        return "WIN";

    }


    if (
        teamSide === "away"
        &&
        result === "AWAY_WIN"
    ) {

        return "WIN";

    }


    return "LOSS";

}


// ======================================================
// 📊 HEAD TO HEAD
// ======================================================

function calculateHeadToHead(
    matches,
    homeTeam,
    awayTeam
) {

    const result = {

        matches: 0,

        homeWins: 0,

        awayWins: 0,

        draws: 0

    };


    if (
        !Array.isArray(matches)
    ) {

        return result;

    }


    matches.forEach(
        match => {

            const home =
                getTeamName(
                    match,
                    "home"
                )
                .toLowerCase();


            const away =
                getTeamName(
                    match,
                    "away"
                )
                .toLowerCase();


            const h =
                String(
                    homeTeam
                )
                .toLowerCase();


            const a =
                String(
                    awayTeam
                )
                .toLowerCase();


            const sameTeams =
                (
                    home === h &&
                    away === a
                )
                ||
                (
                    home === a &&
                    away === h
                );


            if (!sameTeams) {
                return;
            }


            result.matches++;


            const matchResult =
                getMatchResult(
                    match
                );


            if (
                matchResult === "DRAW"
            ) {

                result.draws++;

            }

            else if (
                home === h
                &&
                matchResult === "HOME_WIN"
            ) {

                result.homeWins++;

            }

            else if (
                away === h
                &&
                matchResult === "AWAY_WIN"
            ) {

                result.homeWins++;

            }

            else {

                result.awayWins++;

            }

        }
    );


    return result;

}


// ======================================================
// 🧮 TEAM SUMMARY
// ======================================================

function calculateTeamSummary(
    matches,
    teamName
) {

    const summary = {

        matches: 0,

        wins: 0,

        draws: 0,

        losses: 0,

        goalsFor: 0,

        goalsAgainst: 0

    };


    if (
        !Array.isArray(matches)
    ) {

        return summary;

    }


    const name =
        String(
            teamName
        )
        .toLowerCase();


    matches.forEach(
        match => {

            const home =
                getTeamName(
                    match,
                    "home"
                )
                .toLowerCase();


            const away =
                getTeamName(
                    match,
                    "away"
                )
                .toLowerCase();


            const isHome =
                home === name;


            const isAway =
                away === name;


            if (
                !isHome &&
                !isAway
            ) {

                return;

            }


            const homeScore =
                Number(
                    getScore(
                        match,
                        "home"
                    )
                ) || 0;


            const awayScore =
                Number(
                    getScore(
                        match,
                        "away"
                    )
                ) || 0;


            summary.matches++;


            if (isHome) {

                summary.goalsFor +=
                    homeScore;

                summary.goalsAgainst +=
                    awayScore;


                if (
                    homeScore > awayScore
                ) {

                    summary.wins++;

                }

                else if (
                    homeScore === awayScore
                ) {

                    summary.draws++;

                }

                else {

                    summary.losses++;

                }

            }


            if (isAway) {

                summary.goalsFor +=
                    awayScore;

                summary.goalsAgainst +=
                    homeScore;


                if (
                    awayScore > homeScore
                ) {

                    summary.wins++;

                }

                else if (
                    awayScore === homeScore
                ) {

                    summary.draws++;

                }

                else {

                    summary.losses++;

                }

            }

        }
    );


    return summary;

}


// ======================================================
// 🚀 PART 3 READY
// ======================================================

console.log(
    "⚽ PreziScore — PART 3 READY"
);

console.log(
    "🎴 Match Cards"
);

console.log(
    "📊 Statistiques"
);

console.log(
    "🏆 Head To Head"
);

// ======================================================
// ⚽ PREZISCORE — SPORTScore
// API.JS — PATI 4/4
// CONNEXION • MATCH DETAILS • H2H • COMPOSITION
// ======================================================


// ======================================================
// 🔗 OPEN MATCH DETAILS
// ======================================================

function openMatch(slug) {

    if (!slug) {
        return;
    }


    window.location.href =
        "match-details.html?slug=" +
        encodeURIComponent(slug);

}


// ======================================================
// 📊 SHOW TEAM SUMMARY
// ======================================================

function renderTeamSummary(
    box,
    matches,
    teamName
) {

    if (!box) {
        return;
    }


    const summary =
        calculateTeamSummary(
            matches,
            teamName
        );


    box.innerHTML = `

        <div class="team-summary">

            <h3>
                ${escapeHTML(teamName)}
            </h3>

            <div class="summary-grid">

                <div>
                    <strong>
                        ${summary.matches}
                    </strong>
                    <span>Matchs</span>
                </div>

                <div>
                    <strong>
                        ${summary.wins}
                    </strong>
                    <span>Victoires</span>
                </div>

                <div>
                    <strong>
                        ${summary.draws}
                    </strong>
                    <span>Nuls</span>
                </div>

                <div>
                    <strong>
                        ${summary.losses}
                    </strong>
                    <span>Défaites</span>
                </div>

                <div>
                    <strong>
                        ${summary.goalsFor}
                    </strong>
                    <span>Buts marqués</span>
                </div>

                <div>
                    <strong>
                        ${summary.goalsAgainst}
                    </strong>
                    <span>Buts encaissés</span>
                </div>

            </div>

        </div>

    `;

}


// ======================================================
// 🤝 HEAD TO HEAD
// ======================================================

function renderHeadToHead(
    box,
    matches,
    homeTeam,
    awayTeam
) {

    if (!box) {
        return;
    }


    const h2h =
        calculateHeadToHead(
            matches,
            homeTeam,
            awayTeam
        );


    box.innerHTML = `

        <div class="head-to-head">

            <h3>
                🤝 Face à face
            </h3>

            <div class="summary-grid">

                <div>
                    <strong>
                        ${h2h.matches}
                    </strong>
                    <span>
                        Matchs
                    </span>
                </div>

                <div>
                    <strong>
                        ${h2h.homeWins}
                    </strong>
                    <span>
                        ${escapeHTML(homeTeam)}
                    </span>
                </div>

                <div>
                    <strong>
                        ${h2h.draws}
                    </strong>
                    <span>
                        Nuls
                    </span>
                </div>

                <div>
                    <strong>
                        ${h2h.awayWins}
                    </strong>
                    <span>
                        ${escapeHTML(awayTeam)}
                    </span>
                </div>

            </div>

        </div>

    `;

}


// ======================================================
// 👥 COMPOSITION / LINEUPS
// ======================================================

function getLineups(match) {

    return (
        match?.lineups ||
        match?.lineup ||
        match?.formations ||
        []
    );

}


function renderLineups(
    box,
    match
) {

    if (!box || !match) {
        return;
    }


    const lineups =
        getLineups(match);


    if (
        !Array.isArray(lineups) ||
        lineups.length === 0
    ) {

        box.innerHTML = `
            <p>
                👥 Composition non disponible.
            </p>
        `;

        return;

    }


    box.innerHTML = "";


    lineups.forEach(
        player => {

            const name =
                escapeHTML(
                    player?.player?.name ||
                    player?.name ||
                    player?.player_name ||
                    "Joueur"
                );


            const number =
                player?.jersey_number ||
                player?.number ||
                "";


            const position =
                escapeHTML(
                    player?.position?.name ||
                    player?.position ||
                    ""
                );


            box.innerHTML += `

                <div class="player-row">

                    <strong>
                        ${number}
                    </strong>

                    <span>
                        ${name}
                    </span>

                    <small>
                        ${position}
                    </small>

                </div>

            `;

        }
    );

}


// ======================================================
// 📊 MATCH DETAILS
// ======================================================

function renderMatchDetails(
    box,
    match
) {

    if (!box || !match) {
        return;
    }


    const home =
        getTeamName(
            match,
            "home"
        );


    const away =
        getTeamName(
            match,
            "away"
        );


    const stats =
        getMatchStatistics(
            match
        );


    box.innerHTML = `

        <div class="match-details">

            <h2>
                ${escapeHTML(home)}
                ${stats.homeScore}
                -
                ${stats.awayScore}
                ${escapeHTML(away)}
            </h2>

            <p>
                🏆
                ${escapeHTML(
                    stats.competition
                )}
            </p>

            <p>
                📅
                ${formatDate(
                    stats.date
                )}
            </p>

            <p>
                📊
                ${escapeHTML(
                    stats.status
                )}
            </p>

        </div>

    `;

}


// ======================================================
// 🔎 FIND MATCH BY SLUG
// ======================================================

function findMatchBySlug(
    slug
) {

    if (!slug) {
        return null;
    }


    return preziMatches.find(
        match =>
            String(
                getMatchSlug(match)
            ) === String(slug)
    ) || null;

}


// ======================================================
// 🔄 LOAD MATCH DETAILS
// ======================================================

async function loadMatchDetails(
    containerId,
    slug
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
            🔄 Chargement du match...
        </p>
    `;


    let match =
        findMatchBySlug(
            slug
        );


    if (!match) {

        const matches =
            await getFootballMatches();


        match =
            matches.find(
                item =>
                    String(
                        getMatchSlug(item)
                    ) === String(slug)
            );

    }


    if (!match) {

        box.innerHTML = `
            <p>
                ⚠️ Match introuvable.
            </p>
        `;

        return;

    }


    renderMatchDetails(
        box,
        match
    );


    const home =
        getTeamName(
            match,
            "home"
        );


    const away =
        getTeamName(
            match,
            "away"
        );


    const h2hBox =
        getElement(
            "headToHead"
        );


    if (h2hBox) {

        renderHeadToHead(
            h2hBox,
            preziMatches,
            home,
            away
        );

    }


    const lineupBox =
        getElement(
            "lineups"
        );


    if (lineupBox) {

        renderLineups(
            lineupBox,
            match
        );

    }

}


// ======================================================
// 🚀 INITIALIZE PREZISCORE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "⚽ PreziScore initializing..."
        );


        // -------------------------------
        // HOME LIVE
        // -------------------------------

        if (
            getElement(
                "homeLiveMatches"
            )
        ) {

            loadLiveMatches(
                "homeLiveMatches"
            );

        }


        // -------------------------------
        // HOME UPCOMING
        // -------------------------------

        if (
            getElement(
                "homeUpcomingMatches"
            )
        ) {

            loadUpcomingMatches(
                "homeUpcomingMatches"
            );

        }


        // -------------------------------
        // MATCHES PAGE
        // -------------------------------

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
                "finishedMatches"
            )
        ) {

            loadFinishedMatches(
                "finishedMatches"
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


        // -------------------------------
        // MATCH DETAILS
        // -------------------------------

        const params =
            new URLSearchParams(
                window.location.search
            );


        const slug =
            params.get(
                "slug"
            );


        if (
            slug &&
            getElement(
                "matchDetails"
            )
        ) {

            loadMatchDetails(
                "matchDetails",
                slug
            );

        }

    }
);


// ======================================================
// 🔄 LIVE REFRESH
// ======================================================

setInterval(
    function () {

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
// 🚀 FINAL
// ======================================================

console.log(
    "======================================"
);

console.log(
    "⚽ PREZISCORE API COMPLETE"
);

console.log(
    "🔴 LIVE"
);

console.log(
    "✅ FINISHED"

);

console.log(
    "📅 UPCOMING"
);

console.log(
    "📊 STATISTICS"
);

console.log(
    "🤝 HEAD TO HEAD"
);

console.log(
    "👥 LINEUPS"
);

console.log(
    "======================================"
);
