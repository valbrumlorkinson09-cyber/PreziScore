"use strict";

/* =========================================================
   PREZISCORE — SCRIPT.JS
   PARTIE 1 / 2
   LIVE + UPCOMING + FINISHED
   SCORE + LOGOS + MINUTE + SEARCH
========================================================= */

console.log("⚽ PREZISCORE SCRIPT READY");


/* =========================================================
   ELEMENTS
========================================================= */

const box =
    document.getElementById("matchesContainer");

const loading =
    document.getElementById("loading");

const empty =
    document.getElementById("noMatches");

const search =
    document.getElementById("searchInput");

const count =
    document.getElementById("matchCount");

const tabs =
    document.querySelectorAll(".match-tab");


/* =========================================================
   STATE
========================================================= */

let matches = [];

let filter = "live";

let refreshTimer = null;


/* =========================================================
   ESCAPE HTML
========================================================= */

function esc(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,
            char => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[char])
        );

}


/* =========================================================
   STATUS
========================================================= */

function getStatus(match) {

    const raw =
        match?.raw || {};


    const values = [

        match?.status,
        match?.statusText,
        match?.status_text,

        raw?.status,
        raw?.statusText,
        raw?.status_text,
        raw?.state,
        raw?.match_status,
        raw?.matchStatus

    ];


    const text =
        values
            .filter(
                value =>
                    value !== undefined &&
                    value !== null
            )
            .map(
                value =>
                    String(value)
                        .toLowerCase()
                        .trim()
            )
            .join(" ");


    /* =====================================================
       FINISHED
    ===================================================== */

    if (

        text.includes("finished") ||
        text.includes("finish") ||
        text.includes("ended") ||
        text.includes("completed") ||
        text.includes("full time") ||
        text.includes("full_time") ||
        text === "ft" ||
        text.includes("aet") ||
        text.includes("after extra time")

    ) {

        return "finished";

    }


    /* =====================================================
       LIVE
    ===================================================== */

    if (

        text.includes("live") ||
        text.includes("playing") ||
        text.includes("ongoing") ||
        text.includes("in_progress") ||
        text.includes("in progress") ||
        text.includes("inplay") ||
        text.includes("in play") ||
        text.includes("started") ||
        text === "1h" ||
        text === "2h" ||
        text === "ht" ||
        text.includes("first half") ||
        text.includes("second half") ||
        text.includes("first_half") ||
        text.includes("second_half") ||
        text.includes("halftime") ||
        text.includes("half time")

    ) {

        return "live";

    }


    /* =====================================================
       UPCOMING
    ===================================================== */

    return "upcoming";

}


/* =========================================================
   TEAM NAME
========================================================= */

function getTeam(match, side) {

    const value =
        match?.[side];


    /* NORMALIZED API */

    if (
        value &&
        typeof value === "object"
    ) {

        return (

            value.name ||
            value.title ||
            value.short_name ||
            value.shortName ||
            "Équipe"

        );

    }


    if (
        typeof value === "string" &&
        value.trim()
    ) {

        return value.trim();

    }


    /* RAW API */

    const raw =
        match?.raw || {};


    let team;


    if (
        side === "home"
    ) {

        team =

            raw.home_team ||
            raw.homeTeam ||
            raw.home ||
            raw.home_name ||
            raw.home_team_name;

    }

    else {

        team =

            raw.away_team ||
            raw.awayTeam ||
            raw.away ||
            raw.away_name ||
            raw.away_team_name;

    }


    if (
        team &&
        typeof team === "object"
    ) {

        return (

            team.name ||
            team.title ||
            team.short_name ||
            team.shortName ||
            "Équipe"

        );

    }


    return (

        String(
            team || ""
        ).trim()

    ) || (

        side === "home"
            ? "Équipe domicile"
            : "Équipe visiteuse"

    );

}


/* =========================================================
   LOGO
========================================================= */

function getLogo(match, side) {

    const value =
        match?.[side];


    /* NORMALIZED */

    if (
        value &&
        typeof value === "object"
    ) {

        const logo =

            value.logo ||
            value.crest ||
            value.image ||
            value.badge ||
            value.icon;


        if (logo) {

            return String(
                logo
            ).trim();

        }

    }


    /* RAW */

    const raw =
        match?.raw || {};


    let team;


    if (
        side === "home"
    ) {

        team =

            raw.home_team ||
            raw.homeTeam ||
            raw.home;

    }

    else {

        team =

            raw.away_team ||
            raw.awayTeam ||
            raw.away;

    }


    if (
        team &&
        typeof team === "object"
    ) {

        const logo =

            team.logo ||
            team.crest ||
            team.image ||
            team.badge ||
            team.icon;


        if (logo) {

            return String(
                logo
            ).trim();

        }

    }


    /* DIRECT LOGO */

    const direct =

        side === "home"

            ? (

                raw.home_logo ||
                raw.homeLogo ||
                raw.home_team_logo ||
                raw.homeTeamLogo

            )

            : (

                raw.away_logo ||
                raw.awayLogo ||
                raw.away_team_logo ||
                raw.awayTeamLogo

            );


    return (

        typeof direct === "string"

            ? direct.trim()

            : ""

    );

}


/* =========================================================
   SCORE
========================================================= */

function getScore(match, side) {

    const value =
        match?.[side];


    /* NORMALIZED */

    if (
        value &&
        typeof value === "object"
    ) {

        if (

            value.score !== undefined &&
            value.score !== null &&
            value.score !== ""

        ) {

            return value.score;

        }

    }


    /* RAW */

    const raw =
        match?.raw || {};


    let score;


    if (
        side === "home"
    ) {

        score =

            raw.home_score ??
            raw.homeScore ??
            raw.home_team?.score ??
            raw.home?.score;

    }

    else {

        score =

            raw.away_score ??
            raw.awayScore ??
            raw.away_team?.score ??
            raw.away?.score;

    }


    if (

        score === undefined ||
        score === null ||
        score === ""

    ) {

        return "-";

    }


    return score;

}


/* =========================================================
   COMPETITION
========================================================= */

function getCompetition(match) {

    let value =
        match?.competition;


    if (
        value &&
        typeof value === "object"
    ) {

        value =

            value.name ||
            value.title ||
            value.short_name ||
            value.shortName;

    }


    const raw =
        match?.raw || {};


    if (!value) {

        value =

            raw.competition_name ||
            raw.competitionName ||
            raw.league_name ||
            raw.leagueName ||
            raw.tournament_name ||
            raw.tournamentName ||
            raw.league?.name ||
            raw.competition?.name;

    }


    return (

        String(
            value || "Football"
        ).trim()

    );

}


/* =========================================================
   MATCH DATE
========================================================= */

function getMatchDate(match) {

    const raw =
        match?.raw || {};


    return (

        match?.time ||

        match?.utcTime ||

        match?.start_time ||

        raw?.time ||

        raw?.utcTime ||

        raw?.utc_time ||

        raw?.date ||

        raw?.start_time ||

        raw?.startTime ||

        raw?.kickoff ||

        raw?.kickoff_time ||

        raw?.kickoffTime ||

        null

    );

}


/* =========================================================
   LIVE MINUTE
========================================================= */

function getLiveMinute(match) {

    const raw =
        match?.raw || {};


    const direct =

        match?.minute ??

        match?.elapsed ??

        match?.minutes ??

        match?.minutePlayed ??

        raw?.minute ??

        raw?.elapsed ??

        raw?.minutes ??

        raw?.elapsed_time ??

        raw?.minutePlayed;


    /* API GIVES MINUTE */

    if (

        direct !== undefined &&
        direct !== null &&
        direct !== ""

    ) {

        const value =
            String(direct).trim();


        /* Already formatted */

        if (
            value.includes("'")
        ) {

            return value;

        }


        const number =
            parseInt(
                value.replace(
                    /[^\d]/g,
                    ""
                ),
                10
            );


        if (
            !Number.isNaN(number)
        ) {

            return number + "'";

        }

    }


    /* STATUS TEXT */

    const text = [

        match?.statusText,
        match?.status_text,
        raw?.statusText,
        raw?.status_text,
        raw?.status

    ]

        .filter(Boolean)

        .join(" ");


    const minuteMatch =
        String(text)
            .match(
                /(\d{1,3})\s*'?/
            );


    if (minuteMatch) {

        return (
            minuteMatch[1] +
            "'"
        );

    }


    /* CALCULATE FROM KICKOFF */

    const dateValue =
        getMatchDate(match);


    if (!dateValue) {

        return "LIVE";

    }


    const kickoff =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            kickoff.getTime()
        )
    ) {

        return "LIVE";

    }


    const now =
        Date.now();


    const minutes =
        Math.floor(
            (
                now -
                kickoff.getTime()
            ) / 60000
        );


    if (
        minutes < 1
    ) {

        return "1'";

    }


    if (
        minutes <= 45
    ) {

        return (
            minutes +
            "'"
        );

    }


    if (
        minutes <= 60
    ) {

        return "45+";

    }


    return (

        Math.min(
            minutes - 15,
            120
        ) + "'"

    );

}


/* =========================================================
   TIME
========================================================= */

function getTime(
    match,
    state
) {

    if (
        state === "live"
    ) {

        return getLiveMinute(
            match
        );

    }


    if (
        state === "finished"
    ) {

        return "FT";

    }


    const value =
        getMatchDate(
            match
        );


    if (!value) {

        return "--:--";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "--:--";

    }


    return date.toLocaleTimeString(
        "fr-FR",
        {

            hour: "2-digit",

            minute: "2-digit"

        }
    );

}


/* =========================================================
   FILTER + SEARCH
========================================================= */

function filteredMatches() {

    let list =
        matches.filter(
            match =>
                getStatus(match) ===
                filter
        );


    const query =
        search?.value
            ?.toLowerCase()
            .trim();


    if (query) {

        list =
            list.filter(
                match => {

                    const home =
                        getTeam(
                            match,
                            "home"
                        )
                        .toLowerCase();


                    const away =
                        getTeam(
                            match,
                            "away"
                        )
                        .toLowerCase();


                    const league =
                        getCompetition(
                            match
                        )
                        .toLowerCase();


                    return (

                        home.includes(query) ||

                        away.includes(query) ||

                        league.includes(query)

                    );

                }
            );

    }


    return list;

}


/* =========================================================
   MATCH CARD
========================================================= */

function createCard(match) {

    const state =
        getStatus(match);


    const home =
        getTeam(
            match,
            "home"
        );


    const away =
        getTeam(
            match,
            "away"
        );


    const homeLogo =
        getLogo(
            match,
            "home"
        );


    const awayLogo =
        getLogo(
            match,
            "away"
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


    const article =
        document.createElement(
            "article"
        );


    article.className =
        "match-item";


    let statusText =
        "📅 À VENIR";


    if (
        state === "live"
    ) {

        statusText =
            "🔴 LIVE";

    }


    else if (
        state === "finished"
    ) {

        statusText =
            "✅ TERMINÉ";

    }


    article.innerHTML = `

        <div class="match-top">

            <div class="status ${state}">

                ${statusText}

            </div>


            <div class="match-time">

                ${esc(
                    getTime(
                        match,
                        state
                    )
                )}

            </div>

        </div>


        <div class="match-body">


            <!-- HOME -->

            <div class="club">

                <div class="club-logo">

                    ${
                        homeLogo

                            ? `

                                <img
                                    src="${esc(homeLogo)}"
                                    alt="${esc(home)}"
                                    loading="lazy"
                                    onerror="
                                        this.onerror=null;
                                        this.parentElement.innerHTML='⚽';
                                    "
                                >

                              `

                            : `⚽`
                    }

                </div>


                <div class="club-name">

                    ${esc(home)}

                </div>

            </div>


            <!-- SCORE -->

            <div class="score">

                <strong>

                    ${esc(
                        String(
                            homeScore
                        )
                    )}

                </strong>


                <span>

                    -

                </span>


                <strong>

                    ${esc(
                        String(
                            awayScore
                        )
                    )}

                </strong>


                <small>

                    ${
                        state === "live"

                            ? `🔴 ${esc(
                                getLiveMinute(
                                    match
                                )
                            )}`

                            : state === "finished"

                            ? "FT"

                            : "À venir"
                    }

                </small>

            </div>


            <!-- AWAY -->

            <div class="club">

                <div class="club-logo">

                    ${
                        awayLogo

                            ? `

                                <img
                                    src="${esc(awayLogo)}"
                                    alt="${esc(away)}"
                                    loading="lazy"
                                    onerror="
                                        this.onerror=null;
                                        this.parentElement.innerHTML='⚽';
                                    "
                                >

                              `

                            : `⚽`
                    }

                </div>


                <div class="club-name">

                    ${esc(away)}

                </div>

            </div>


        </div>

    `;


    /* =====================================================
       OPEN DETAILS
    ===================================================== */

    const id =

        match?.id ||

        match?.slug ||

        match?.url ||

        match?.raw?.id ||

        match?.raw?.match_id ||

        match?.raw?.url;


    if (id) {

        article.style.cursor =
            "pointer";


        article.addEventListener(
            "click",
            () => {

                location.href =
                    "match-details.html?match=" +
                    encodeURIComponent(
                        id
                    );

            }
        );

    }


    return article;

}


/* =========================================================
   END PART 1
=========================================================p */
/* =========================================================
   PREZISCORE — SCRIPT.JS
   PARTIE 2 / 2
   SEARCH + REFRESH + INIT
========================================================= */


/* =========================================================
   SEARCH
========================================================= */

if (search) {

    search.addEventListener(
        "input",
        () => {

            render();

        }
    );

}


/* =========================================================
   FOCUS SEARCH
========================================================= */

function focusSearch() {

    if (!search) {
        return;
    }


    search.focus();


    search.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   AUTO REFRESH
   Chak 15 segonn
========================================================= */

let refreshTimer = null;


function startAutoRefresh() {

    if (refreshTimer) {

        clearInterval(
            refreshTimer
        );

    }


    refreshTimer =
        setInterval(
            async () => {

                console.log(
                    "🔄 PreziScore: actualisation..."
                );


                try {

                    if (
                        window.PreziAPI &&
                        typeof PreziAPI.clearCache ===
                        "function"
                    ) {

                        PreziAPI.clearCache();

                    }


                    await loadMatches();


                } catch (error) {

                    console.error(
                        "❌ Auto refresh:",
                        error
                    );

                }

            },

            15000
        );

}


/* =========================================================
   STOP AUTO REFRESH
========================================================= */

function stopAutoRefresh() {

    if (refreshTimer) {

        clearInterval(
            refreshTimer
        );

        refreshTimer = null;

    }

}


/* =========================================================
   REFRESH WHEN USER RETURNS
========================================================= */

document.addEventListener(
    "visibilitychange",
    async () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            console.log(
                "👀 PreziScore: utilisateur revenu"
            );


            try {

                if (
                    window.PreziAPI &&
                    typeof PreziAPI.clearCache ===
                    "function"
                ) {

                    PreziAPI.clearCache();

                }


                await loadMatches();

            } catch (error) {

                console.error(
                    "❌ Visibility refresh:",
                    error
                );

            }

        }

    }
);


/* =========================================================
   MANUAL REFRESH
========================================================= */

async function refreshMatches() {

    console.log(
        "🔄 PreziScore: refresh manuel"
    );


    try {

        if (
            window.PreziAPI &&
            typeof PreziAPI.clearCache ===
            "function"
        ) {

            PreziAPI.clearCache();

        }


        await loadMatches();

    } catch (error) {

        console.error(
            "❌ Refresh:",
            error
        );

    }

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.PreziScore = {

    loadMatches,

    render,

    refreshMatches,

    startAutoRefresh,

    stopAutoRefresh,

    focusSearch

};


/* =========================================================
   INITIAL LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "🚀 PreziScore démarre..."
        );


        await loadMatches();


        startAutoRefresh();


    }
);


/* =========================================================
   FALLBACK
   Si DOMContentLoaded deja pase
========================================================= */

if (
    document.readyState ===
    "interactive" ||
    document.readyState ===
    "complete"
) {

    if (
        !matches.length
    ) {

        loadMatches();

        startAutoRefresh();

    }

}


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "===================================="
);

console.log(
    "⚽ PREZISCORE SCRIPT READY"
);

console.log(
    "🔴 LIVE FILTER: READY"
);

console.log(
    "📅 UPCOMING FILTER: READY"
);

console.log(
    "✅ FINISHED FILTER: READY"
);

console.log(
    "🔍 SEARCH: READY"
);

console.log(
    "🔄 AUTO REFRESH: 15s"
);

console.log(
    "🖼️ LOGOS: READY"
);

console.log(
    "⚽ SCORES: READY"
);

console.log(
    "⏱️ LIVE MINUTE: READY"
);

console.log(
    "===================================="
);
