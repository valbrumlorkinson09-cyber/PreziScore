// ======================================================
// ⚽ PREZISCORE — SPORTScore API
// API.JS — PATI 1/4
// CONFIG • REQUEST • HELPERS • MATCH DATA
// ======================================================


// ======================================================
// 🌐 SPORTScore API
// ======================================================

const SPORT_SCORE_API =
    "https://sportscore.com/api/widget";


// ======================================================
// 🌍 GLOBAL
// ======================================================

let preziMatches = [];


// ======================================================
// 🌐 API REQUEST
// ======================================================

async function sportScoreRequest(endpoint) {

    try {

        const url =
            SPORT_SCORE_API + endpoint;


        console.log(
            "🌐 SportScore:",
            url
        );


        const response =
            await fetch(url, {

                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                }

            });


        console.log(
            "📡 HTTP:",
            response.status
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "❌ SportScore ERROR:",
                errorText
            );

            throw new Error(
                "HTTP " +
                response.status
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
            "🚨 SPORTScore API ERROR:",
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
// 🆔 MATCH ID / SLUG
// ======================================================

function getMatchSlug(match) {

    return (
        match?.slug ||
        match?.match_slug ||
        match?.id ||
        match?.match_id ||
        ""
    );

}


// ======================================================
// ⚽ TEAM NAME
// ======================================================

function getTeamName(
    match,
    side
) {

    if (
        side === "home"
    ) {

        return (

            match?.home ||
            match?.home_team ||
            match?.homeTeam ||
            match?.teams?.home?.name ||
            match?.home?.name ||
            "Équipe"

        );

    }


    return (

        match?.away ||
        match?.away_team ||
        match?.awayTeam ||
        match?.teams?.away?.name ||
        match?.away?.name ||
        "Équipe"

    );

}


// ======================================================
// ⚽ TEAM LOGO
// ======================================================

function getTeamLogo(
    match,
    side
) {

    if (
        side === "home"
    ) {

        return (

            match?.home_logo ||
            match?.home?.logo ||
            match?.teams?.home?.logo ||
            ""

        );

    }


    return (

        match?.away_logo ||
        match?.away?.logo ||
        match?.teams?.away?.logo ||
        ""

    );

}


// ======================================================
// ⚽ SCORE
// ======================================================

function getScore(
    match,
    side
) {

    if (
        side === "home"
    ) {

        return (

            match?.home_score ??
            match?.homeScore ??
            match?.scores?.home ??
            match?.goals?.home ??
            0

        );

    }


    return (

        match?.away_score ??
        match?.awayScore ??
        match?.scores?.away ??
        match?.goals?.away ??
        0

    );

}


// ======================================================
// 📊 STATUS
// ======================================================

function getMatchStatus(match) {

    return (

        match?.status_text ||
        match?.status ||
        match?.state?.name ||
        match?.state?.short_name ||
        ""

    );

}


// ======================================================
// ⏱️ MINUTE
// ======================================================

function getLiveMinute(match) {

    return (

        match?.minute ??
        match?.state?.minute ??
        match?.timer?.minute ??
        ""

    );

}


// ======================================================
// 🏆 COMPETITION
// ======================================================

function getCompetition(match) {

    return (

        match?.competition ||
        match?.league ||
        match?.tournament ||
        match?.competition?.name ||
        match?.league?.name ||
        ""

    );

}


// ======================================================
// 📅 DATE
// ======================================================

function getMatchDate(match) {

    return (

        match?.time ||
        match?.start_time ||
        match?.starting_at ||
        match?.date ||
        match?.start_at ||
        ""

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
            dateStyle:
                "short",

            timeStyle:
                "short"
        }
    );

}


// ======================================================
// 🔴 DETECT LIVE
// ======================================================

function isLiveMatch(match) {

    const status =
        String(
            getMatchStatus(match)
        )
        .toLowerCase();


    return (

        status.includes("live") ||
        status.includes("1st") ||
        status.includes("2nd") ||
        status.includes("half") ||
        status.includes("extra") ||
        status.includes("penalty") ||
        status.includes("inplay") ||
        status.includes("in-play")

    );

}


// ======================================================
// ✅ DETECT FINISHED
// ======================================================

function isFinishedMatch(match) {

    const status =
        String(
            getMatchStatus(match)
        )
        .toLowerCase();


    return (

        status.includes("finished") ||
        status.includes("ended") ||
        status.includes("full time") ||
        status === "ft" ||
        status === "aet" ||
        status.includes("final")

    );

}


// ======================================================
// 📅 DETECT UPCOMING
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
// 🚀 API READY
// ======================================================

console.log(
    "⚽ PreziScore SportScore API — PART 1 loaded"
);

console.log(
    "🔴 LIVE | ✅ FINISHED | 📅 UPCOMING"
);

// ======================================================
// ⚽ PREZISCORE — SPORTScore API
// API.JS — PATI 2/4
// LIVE • TERMINÉS • À VENIR • MATCH CARDS
// ======================================================


// ======================================================
// 🧩 EXTRACT MATCH ARRAY
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
// 🧩 MATCH CARD
// ======================================================

function renderMatchCard(
    box,
    match,
    type
) {

    if (
        !box ||
        !match
    ) {

        return;

    }


    const slug =
        getMatchSlug(match);


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

                <span>
                    -
                </span>

                <strong>
                    ${awayScore}
                </strong>

            </div>
        `;


        info = `
            <div class="match-live-status">

                🔴 ${
                    status ||
                    "LIVE"
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

                <span>
                    -
                </span>

                <strong>
                    ${awayScore}
                </strong>

            </div>
        `;


        info = `
            <div class="match-status">

                ${status || "Match terminé"}

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

                📅 ${date}

            </div>
        `;

    }


    // ==================================================
    // 🔘 BUTTON
    // ==================================================

    const button =
        slug
        ?
        `
        <button
            class="match-button"
            type="button"
            onclick="openMatch('${encodeURIComponent(slug)}')"
        >
            Voir le match →
        </button>
        `
        :
        "";


    // ==================================================
    // CARD
    // ==================================================

    box.innerHTML += `

        <article
            class="match-card"
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


            ${button}

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


    const response =
        await sportScoreRequest(
            "/matches/?sport=football&limit=100"
        );


    if (!response) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger
                les matchs live.
            </p>
        `;

        return;

    }


    const matches =
        extractMatches(
            response
        );


    preziMatches =
        matches;


    const liveMatches =
        matches.filter(
            match =>
                isLiveMatch(match)
        );


    console.log(
        "🔴 PREZISCORE LIVE:",
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


    const response =
        await sportScoreRequest(
            "/matches/?sport=football&limit=100"
        );


    if (!response) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger
                les matchs à venir.
            </p>
        `;

        return;

    }


    const matches =
        extractMatches(
            response
        );


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


    console.log(
        "📅 PREZISCORE UPCOMING:",
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


    const response =
        await sportScoreRequest(
            "/matches/?sport=football&limit=100"
        );


    if (!response) {

        box.innerHTML = `
            <p>
                ⚠️ Impossible de charger
                les matchs terminés.
            </p>
        `;

        return;

    }


    const matches =
        extractMatches(
            response
        );


    const finishedMatches =
        matches.filter(
            match =>
                isFinishedMatch(match)
        );


    console.log(
        "✅ PREZISCORE FINISHED:",
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
// 🔄 REFRESH LIVE
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
// ⏱️ AUTO REFRESH
// ======================================================

setInterval(
    refreshLiveMatches,
    30000
);


// ======================================================
// 🚀 PART 2 READY
// ======================================================

console.log(
    "⚽ PreziScore SportScore API — PART 2 loaded"
);

console.log(
    "🔴 LIVE • ✅ TERMINÉS • 📅 À VENIR"
);

// ======================================================
// ⚽ PREZISCORE — SPORTScore API
// API.JS — PATI 3/4
// MATCH DETAILS • EVENTS • STATISTICS • LINEUPS
// ======================================================


// ======================================================
// 🆔 GET MATCH SLUG / ID
// ======================================================

function getMatchSlug(match) {

    if (!match) {
        return "";
    }

    return (
        match.slug ||
        match.match_slug ||
        match.id ||
        match.match_id ||
        ""
    );

}


// ======================================================
// 🔍 FIND MATCH
// ======================================================

function findPreziMatch(slug) {

    if (!slug) {
        return null;
    }

    const value =
        decodeURIComponent(
            String(slug)
        );

    return (
        preziMatches.find(
            match =>
                String(
                    getMatchSlug(match)
                ) === value
        )
        ||
        null
    );

}


// ======================================================
// 🧩 SAFE ARRAY
// ======================================================

function safeArray(value) {

    return Array.isArray(value)
        ? value
        : [];

}


// ======================================================
// 📊 GET STATISTICS
// ======================================================

function getStatistics(match) {

    if (!match) {
        return [];
    }

    return (
        match.statistics ||
        match.stats ||
        match.statistics_data ||
        []
    );

}


// ======================================================
// ⚽ GET EVENTS
// ======================================================

function getEvents(match) {

    if (!match) {
        return [];
    }

    return (
        match.events ||
        match.incidents ||
        match.timeline ||
        match.match_events ||
        []
    );

}


// ======================================================
// 👥 GET LINEUPS
// ======================================================

function getLineups(match) {

    if (!match) {
        return [];
    }

    return (
        match.lineups ||
        match.players ||
        match.squads ||
        []
    );

}


// ======================================================
// ⚽ EVENT ICON
// ======================================================

function getEventIcon(event) {

    const type =
        String(
            event?.type ||
            event?.event_type ||
            event?.name ||
            ""
        )
        .toLowerCase();


    if (
        type.includes("goal") ||
        type.includes("score")
    ) {
        return "⚽";
    }


    if (
        type.includes("yellow")
    ) {
        return "🟨";
    }


    if (
        type.includes("red")
    ) {
        return "🟥";
    }


    if (
        type.includes("sub")
    ) {
        return "🔄";
    }


    if (
        type.includes("penalty")
    ) {
        return "🎯";
    }


    return "•";

}


// ======================================================
// ⚽ RENDER EVENTS
// ======================================================

function renderMatchEvents(
    box,
    match
) {

    if (!box) {
        return;
    }


    const events =
        safeArray(
            getEvents(match)
        );


    if (
        events.length === 0
    ) {

        box.innerHTML = `
            <div class="empty-box">
                ⚽ Aucun événement disponible
                pour ce match.
            </div>
        `;

        return;
    }


    box.innerHTML = "";


    events.forEach(
        event => {

            const minute =
                event?.minute ??
                event?.time ??
                event?.match_time ??
                "";


            const type =
                escapeHTML(
                    event?.type ||
                    event?.event_type ||
                    event?.name ||
                    "Événement"
                );


            const player =
                escapeHTML(
                    event?.player?.name ||
                    event?.player_name ||
                    event?.player ||
                    ""
                );


            const team =
                escapeHTML(
                    event?.team?.name ||
                    event?.team_name ||
                    event?.team ||
                    ""
                );


            box.innerHTML += `

                <div class="event-card">

                    <div class="event-minute">

                        ${
                            minute !== ""
                            ?
                            escapeHTML(minute) + "'"
                            :
                            "•"
                        }

                    </div>


                    <div class="event-icon">

                        ${getEventIcon(event)}

                    </div>


                    <div class="event-info">

                        <strong>
                            ${type}
                        </strong>


                        ${
                            player
                            ?
                            `
                            <p>
                                ${player}
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
                                ${team}
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
// 📊 RENDER STATISTICS
// ======================================================

function renderMatchStatistics(
    box,
    match
) {

    if (!box) {
        return;
    }


    const statistics =
        safeArray(
            getStatistics(match)
        );


    if (
        statistics.length === 0
    ) {

        box.innerHTML = `
            <div class="empty-box">
                📊 Statistiques indisponibles
                pour ce match.
            </div>
        `;

        return;
    }


    box.innerHTML = "";


    statistics.forEach(
        stat => {

            const name =
                escapeHTML(
                    stat?.name ||
                    stat?.type ||
                    stat?.statistic ||
                    "Statistique"
                );


            const home =
                stat?.home ??
                stat?.home_value ??
                stat?.value_home ??
                "-";


            const away =
                stat?.away ??
                stat?.away_value ??
                stat?.value_away ??
                "-";


            box.innerHTML += `

                <div class="stat-row">

                    <div class="stat-value">
                        ${escapeHTML(home)}
                    </div>


                    <div class="stat-name">
                        ${name}
                    </div>


                    <div class="stat-value">
                        ${escapeHTML(away)}
                    </div>

                </div>

            `;

        }
    );

}


// ======================================================
// 👥 RENDER LINEUPS
// ======================================================

function renderLineups(
    box,
    match
) {

    if (!box) {
        return;
    }


    const lineups =
        safeArray(
            getLineups(match)
        );


    if (
        lineups.length === 0
    ) {

        box.innerHTML = `
            <div class="empty-box">
                👥 Compositions indisponibles
                pour ce match.
            </div>
        `;

        return;
    }


    box.innerHTML = "";


    const homePlayers =
        lineups.filter(
            player => {

                const location =
                    String(
                        player?.meta?.location ||
                        player?.location ||
                        player?.side ||
                        ""
                    )
                    .toLowerCase();


                return (
                    location === "home"
                );

            }
        );


    const awayPlayers =
        lineups.filter(
            player => {

                const location =
                    String(
                        player?.meta?.location ||
                        player?.location ||
                        player?.side ||
                        ""
                    )
                    .toLowerCase();


                return (
                    location === "away"
                );

            }
        );


    function renderPlayer(
        player
    ) {

        const name =
            escapeHTML(
                player?.player?.name ||
                player?.name ||
                player?.player_name ||
                "Joueur"
            );


        const number =
            escapeHTML(
                player?.jersey_number ||
                player?.number ||
                ""
            );


        return `

            <div class="player-card">

                <span class="player-number">

                    ${
                        number
                        ?
                        number
                        :
                        "⚽"
                    }

                </span>


                <span>

                    ${name}

                </span>

            </div>

        `;

    }


    box.innerHTML = `

        <div class="lineup-column">

            <h3>
                🏠 Équipe à domicile
            </h3>


            ${
                homePlayers.length
                ?
                homePlayers
                    .map(renderPlayer)
                    .join("")
                :
                `
                <p>
                    Joueurs indisponibles.
                </p>
                `
            }

        </div>


        <div class="lineup-column">

            <h3>
                ✈️ Équipe visiteuse
            </h3>


            ${
                awayPlayers.length
                ?
                awayPlayers
                    .map(renderPlayer)
                    .join("")
                :
                `
                <p>
                    Joueurs indisponibles.
                </p>
                `
            }

        </div>

    `;

}


// ======================================================
// 🔍 LOAD MATCH DETAILS
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


    let match =
        findPreziMatch(
            slug
        );


    // ==================================================
    // API MATCH DETAILS
    // ==================================================

    if (!match) {

        const encoded =
            encodeURIComponent(
                decodeURIComponent(
                    String(slug)
                )
            );


        const response =
            await sportScoreRequest(
                "/matches/" +
                encoded
            );


        const data =
            extractMatches(
                response
            );


        if (
            data.length > 0
        ) {

            match =
                data[0];

        }

        else if (
            response &&
            typeof response === "object"
        ) {

            match =
                response.data ||
                response.match ||
                response;

        }

    }


    if (!match) {

        box.innerHTML = `
            <div class="error-box">

                <h3>
                    ⚠️ Match introuvable
                </h3>

                <p>
                    Les informations de ce match
                    ne sont pas disponibles.
                </p>

            </div>
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


    const date =
        formatDate(
            getMatchDate(
                match
            )
        );


    box.innerHTML = `

        <div class="match-detail-card">

            <div class="detail-competition">

                🏆 ${competition || "Football"}

            </div>


            <div class="detail-status">

                ${
                    isLiveMatch(match)
                    ?
                    "🔴 LIVE"
                    :
                    status ||
                    "Match"
                }

            </div>


            <div class="detail-teams">

                <div class="detail-team">

                    <h2>
                        ${home}
                    </h2>


                    <strong>
                        ${homeScore}
                    </strong>

                </div>


                <div class="detail-vs">

                    -

                </div>


                <div class="detail-team">

                    <h2>
                        ${away}
                    </h2>


                    <strong>
                        ${awayScore}
                    </strong>

                </div>

            </div>


            ${
                date
                ?
                `
                <div class="detail-date">

                    📅 ${date}

                </div>
                `
                :
                ""
            }

        </div>

    `;


    // ==================================================
    // SAVE MATCH
    // ==================================================

    const index =
        preziMatches.findIndex(
            item =>
                String(
                    getMatchSlug(item)
                ) ===
                String(
                    getMatchSlug(match)
                )
        );


    if (index === -1) {

        preziMatches.push(
            match
        );

    }


    return match;

}


// ======================================================
// 📊 LOAD MATCH STATISTICS
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


    const match =
        findPreziMatch(
            slug
        );


    if (match) {

        renderMatchStatistics(
            box,
            match
        );

        return;

    }


    box.innerHTML = `
        <div class="empty-box">
            📊 Statistiques indisponibles.
        </div>
    `;

}


// ======================================================
// 👥 LOAD LINEUPS
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


    const match =
        findPreziMatch(
            slug
        );


    if (match) {

        renderLineups(
            box,
            match
        );

        return;

    }


    box.innerHTML = `
        <div class="empty-box">
            👥 Compositions indisponibles.
        </div>
    `;

}


// ======================================================
// 🚀 PART 3 READY
// ======================================================

console.log(
    "⚽ PreziScore SportScore API — PART 3 loaded"
);

console.log(
    "🔍 Match Details • ⚽ Events • 📊 Stats • 👥 Lineups"
);

// ======================================================
// ⚽ PREZISCORE — SPORTScore API
// API.JS — PATI 4/4
// COMPETITIONS • STANDINGS • SEARCH • FINAL ENGINE
// ======================================================


// ======================================================
// 🏆 COMPETITION CONFIG
// ======================================================

const PREZI_COMPETITIONS = {

    premierLeague: {
        id: 39,
        name: "Premier League",
        country: "🇬🇧"
    },

    laLiga: {
        id: 140,
        name: "La Liga",
        country: "🇪🇸"
    },

    ligue1: {
        id: 61,
        name: "Ligue 1",
        country: "🇫🇷"
    },

    serieA: {
        id: 135,
        name: "Serie A",
        country: "🇮🇹"
    },

    bundesliga: {
        id: 78,
        name: "Bundesliga",
        country: "🇩🇪"
    },

    championsLeague: {
        id: 2,
        name: "Champions League",
        country: "🏆"
    }

};


// ======================================================
// 🧩 GET STANDINGS ARRAY
// ======================================================

function extractStandings(data) {

    if (!data) {
        return [];
    }


    if (Array.isArray(data)) {
        return data;
    }


    if (Array.isArray(data.standings)) {
        return data.standings;
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
// 🏆 TEAM NAME FROM STANDING
// ======================================================

function getStandingTeamName(row) {

    return (
        row?.team?.name ||
        row?.participant?.name ||
        row?.club?.name ||
        row?.name ||
        row?.team_name ||
        "Équipe"
    );

}


// ======================================================
// 🖼️ TEAM LOGO
// ======================================================

function getStandingLogo(row) {

    return (
        row?.team?.logo ||
        row?.team?.image ||
        row?.participant?.logo ||
        row?.participant?.image ||
        row?.logo ||
        ""
    );

}


// ======================================================
// 📊 STANDING POSITION
// ======================================================

function getStandingPosition(row, index) {

    return (
        row?.position ||
        row?.rank ||
        row?.place ||
        index + 1
    );

}


// ======================================================
// 📊 STANDING VALUES
// ======================================================

function getStandingValue(
    row,
    keys,
    fallback = 0
) {

    for (
        const key of keys
    ) {

        if (
            row?.[key] !== undefined &&
            row?.[key] !== null
        ) {

            return row[key];

        }

    }


    return fallback;

}


// ======================================================
// 🏆 RENDER STANDINGS
// ======================================================

function renderStandings(
    box,
    standings,
    competitionName
) {

    if (!box) {
        return;
    }


    const rows =
        extractStandings(
            standings
        );


    if (
        rows.length === 0
    ) {

        box.innerHTML = `
            <div class="empty-box">

                🏆 Classement indisponible.

            </div>
        `;

        return;

    }


    let html = `

        <div class="standings-header">

            <div>#</div>

            <div>Équipe</div>

            <div>MJ</div>

            <div>G</div>

            <div>N</div>

            <div>P</div>

            <div>PTS</div>

        </div>

    `;


    rows
        .slice(0, 30)
        .forEach(
            (
                row,
                index
            ) => {

                const position =
                    getStandingPosition(
                        row,
                        index
                    );


                const team =
                    escapeHTML(
                        getStandingTeamName(
                            row
                        )
                    );


                const logo =
                    getStandingLogo(
                        row
                    );


                const played =
                    getStandingValue(
                        row,
                        [
                            "played",
                            "matches_played",
                            "games_played",
                            "mp"
                        ]
                    );


                const wins =
                    getStandingValue(
                        row,
                        [
                            "wins",
                            "won",
                            "w"
                        ]
                    );


                const draws =
                    getStandingValue(
                        row,
                        [
                            "draws",
                            "draw",
                            "d"
                        ]
                    );


                const losses =
                    getStandingValue(
                        row,
                        [
                            "losses",
                            "lost",
                            "l"
                        ]
                    );


                const points =
                    getStandingValue(
                        row,
                        [
                            "points",
                            "pts"
                        ]
                    );


                html += `

                    <div class="standing-row">

                        <div class="standing-position">

                            ${escapeHTML(position)}

                        </div>


                        <div class="standing-team">

                            ${
                                logo
                                ?
                                `
                                <img
                                    src="${escapeHTML(logo)}"
                                    alt=""
                                    loading="lazy"
                                >
                                `
                                :
                                "⚽"
                            }


                            <span>

                                ${team}

                            </span>

                        </div>


                        <div>

                            ${escapeHTML(played)}

                        </div>


                        <div>

                            ${escapeHTML(wins)}

                        </div>


                        <div>

                            ${escapeHTML(draws)}

                        </div>


                        <div>

                            ${escapeHTML(losses)}

                        </div>


                        <strong>

                            ${escapeHTML(points)}

                        </strong>

                    </div>

                `;

            }
        );


    box.innerHTML = `

        <div class="standings-card">

            ${
                competitionName
                ?
                `
                <h3>
                    🏆 ${escapeHTML(competitionName)}
                </h3>
                `
                :
                ""
            }


            <div class="standings-table">

                ${html}

            </div>

        </div>

    `;

}


// ======================================================
// 🏆 LOAD STANDINGS
// ======================================================

async function loadStandings(
    competitionId,
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
            🔄 Chargement du classement...
        </p>
    `;


    try {

        const response =
            await sportScoreRequest(
                "/standings/?sport=football&league=" +
                encodeURIComponent(
                    competitionId
                )
            );


        if (!response) {

            box.innerHTML = `
                <div class="error-box">

                    ⚠️ Impossible de charger
                    le classement.

                </div>
            `;

            return;

        }


        const standings =
            extractStandings(
                response
            );


        renderStandings(
            box,
            standings,
            ""
        );


    }

    catch (error) {

        console.error(
            "STANDINGS ERROR:",
            error
        );


        box.innerHTML = `
            <div class="error-box">

                ⚠️ Erreur pendant
                le chargement du classement.

            </div>
        `;

    }

}


// ======================================================
// 🔎 SEARCH MATCHES
// ======================================================

async function searchMatches(
    query,
    containerId
) {

    const box =
        getElement(
            containerId
        );


    if (!box) {
        return;
    }


    const search =
        String(
            query || ""
        )
        .trim()
        .toLowerCase();


    if (!search) {

        box.innerHTML = `
            <p>
                🔎 Entrez le nom d'une équipe.
            </p>
        `;

        return;

    }


    box.innerHTML = `
        <p>
            🔎 Recherche en cours...
        </p>
    `;


    try {

        const response =
            await sportScoreRequest(
                "/matches/?sport=football&limit=100"
            );


        const matches =
            extractMatches(
                response
            );


        const results =
            matches.filter(
                match => {

                    const home =
                        String(
                            getTeamName(
                                match,
                                "home"
                            )
                        )
                        .toLowerCase();


                    const away =
                        String(
                            getTeamName(
                                match,
                                "away"
                            )
                        )
                        .toLowerCase();


                    const competition =
                        String(
                            getCompetition(
                                match
                            )
                        )
                        .toLowerCase();


                    return (
                        home.includes(search) ||
                        away.includes(search) ||
                        competition.includes(search)
                    );

                }
            );


        box.innerHTML = "";


        if (
            results.length === 0
        ) {

            box.innerHTML = `
                <div class="empty-box">

                    🔎 Aucun match trouvé.

                </div>
            `;

            return;

        }


        results
            .slice(0, 50)
            .forEach(
                match => {

                    let type = "upcoming";


                    if (
                        isLiveMatch(match)
                    ) {

                        type = "live";

                    }

                    else if (
                        isFinishedMatch(match)
                    ) {

                        type = "finished";

                    }


                    renderMatchCard(
                        box,
                        match,
                        type
                    );

                }
            );

    }

    catch (error) {

        console.error(
            "SEARCH ERROR:",
            error
        );


        box.innerHTML = `
            <div class="error-box">

                ⚠️ Erreur pendant
                la recherche.

            </div>
        `;

    }

}


// ======================================================
// 🔄 MANUAL REFRESH
// ======================================================

async function refreshPreziScore() {

    console.log(
        "🔄 Refresh PreziScore..."
    );


    const live =
        getElement(
            "liveMatches"
        );


    const homeLive =
        getElement(
            "homeLiveMatches"
        );


    if (live) {

        await loadLiveMatches(
            "liveMatches"
        );

    }


    if (homeLive) {

        await loadLiveMatches(
            "homeLiveMatches"
        );

    }


    console.log(
        "✅ Refresh terminé"
    );

}


// ======================================================
// 🛡️ API ERROR HELPER
// ======================================================

function showApiError(
    containerId,
    message
) {

    const box =
        getElement(
            containerId
        );


    if (!box) {
        return;
    }


    box.innerHTML = `

        <div class="error-box">

            ⚠️
            ${escapeHTML(
                message ||
                "Une erreur est survenue."
            )}

        </div>

    `;

}


// ======================================================
// 📡 API STATUS
// ======================================================

function getPreziScoreStatus() {

    return {

        api: "SportScore",

        status: "ready",

        matches:
            Array.isArray(
                preziMatches
            )
            ?
            preziMatches.length
            :
            0,

        time:
            new Date().toISOString()

    };

}


// ======================================================
// 🧪 API TEST
// ======================================================

async function testPreziScoreAPI() {

    console.log(
        "🧪 Test SportScore API..."
    );


    try {

        const response =
            await sportScoreRequest(
                "/matches/?sport=football&limit=1"
            );


        if (!response) {

            console.error(
                "❌ SportScore API test failed"
            );

            return false;

        }


        console.log(
            "✅ SportScore API fonctionne",
            response
        );


        return true;

    }

    catch (error) {

        console.error(
            "❌ API TEST ERROR:",
            error
        );


        return false;

    }

}


// ======================================================
// 🚀 FINAL ENGINE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "⚽ PreziScore FINAL ENGINE READY"
        );


        console.log(
            "📡 API:",
            "SportScore"
        );


        console.log(
            "🔴 Live • ✅ Finished • 📅 Upcoming"
        );


        console.log(
            "🏆 Standings • 🔎 Search • 📊 Match Center"
        );

    }
);


// ======================================================
// 🚀 API COMPLETE
// ======================================================

console.log(
    "=================================================="
);

console.log(
    "⚽ PREZISCORE — SPORTScore API COMPLETE"
);

console.log(
    "✅ PART 1"
);

console.log(
    "✅ PART 2"
);

console.log(
    "✅ PART 3"
);

console.log(
    "✅ PART 4"
);

console.log(
    "🚀 API ENGINE READY"
);

console.log(
    "=================================================="
);
