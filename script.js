"use strict";

/* =========================================================
   PREZISCORE — SCRIPT.JS
   PARTIE 1/2
   LIVE + UPCOMING + FINISHED
========================================================= */

console.log("⚽ PREZISCORE SCRIPT OK");


/* =========================================================
   ELEMENTS
========================================================= */

const matchesContainer =
    document.getElementById("matchesContainer");

const loading =
    document.getElementById("loading");

const noMatches =
    document.getElementById("noMatches");

const searchInput =
    document.getElementById("searchInput");

const matchCount =
    document.getElementById("matchCount");

const tabs =
    document.querySelectorAll(".match-tab");


/* =========================================================
   STATE
========================================================= */

let allMatches = [];

let currentFilter = "live";


/* =========================================================
   LOAD MATCHES
========================================================= */

async function loadMatches() {

    console.log("🔄 Chargement des matchs...");


    if (!matchesContainer) {

        console.error(
            "❌ matchesContainer pa jwenn."
        );

        return;

    }


    if (!window.PreziAPI) {

        console.error(
            "❌ PreziAPI pa jwenn."
        );

        showEmpty(
            "⚠️",
            "API indisponible",
            "api.js pa chaje."
        );

        return;

    }


    if (
        typeof PreziAPI.getNormalizedMatches !==
        "function"
    ) {

        console.error(
            "❌ getNormalizedMatches() pa jwenn."
        );

        showEmpty(
            "⚠️",
            "API pa pare",
            "Fonksyon match yo pa disponib."
        );

        return;

    }


    if (loading) {

        loading.style.display =
            "block";

    }


    if (noMatches) {

        noMatches.classList.remove(
            "show"
        );

    }


    try {

        const data =
            await PreziAPI
                .getNormalizedMatches();


        allMatches =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "⚽ MATCHS REÇUS:",
            allMatches.length
        );


        renderMatches();


    }

    catch (error) {

        console.error(
            "❌ PREZISCORE ERROR:",
            error
        );


        if (loading) {

            loading.style.display =
                "none";

        }


        showEmpty(
            "⚠️",
            "Erreur de connexion",
            "Impossible de charger les matchs."
        );

    }

}


/* =========================================================
   STATUS
========================================================= */

function getMatchStatus(match) {

    const status =
        String(

            match?.status ??
            match?.raw?.status ??
            match?.raw?.state ??
            match?.raw?.match_status ??
            match?.raw?.status_code ??
            ""

        )
        .toLowerCase()
        .trim();


    const statusText =
        String(

            match?.statusText ??
            match?.raw?.status_text ??
            match?.raw?.statusText ??
            ""

        )
        .toLowerCase()
        .trim();


    /* LIVE */

    if (

        status === "live" ||
        status === "in_progress" ||
        status === "in progress" ||
        status === "progress" ||
        status === "ongoing" ||
        status === "playing" ||
        status === "started" ||
        status === "1st_half" ||
        status === "2nd_half" ||
        status === "first_half" ||
        status === "second_half" ||

        status.includes("live") ||
        status.includes("progress") ||
        status.includes("playing") ||

        statusText.includes("live") ||
        statusText.includes("progress") ||
        statusText.includes("playing")

    ) {

        return "live";

    }


    /* FINISHED */

    if (

        status === "finished" ||
        status === "finish" ||
        status === "ended" ||
        status === "completed" ||
        status === "ft" ||
        status === "full_time" ||
        status === "full time" ||

        status.includes("finished") ||
        status.includes("ended") ||

        statusText.includes("finished") ||
        statusText.includes("ended") ||
        statusText.includes("full time")

    ) {

        return "finished";

    }


    return "upcoming";

}


/* =========================================================
   FILTER
========================================================= */

function getFilteredMatches() {

    let result =
        allMatches.filter(
            match => {

                const status =
                    getMatchStatus(
                        match
                    );


                if (
                    currentFilter ===
                    "live"
                ) {

                    return status ===
                        "live";

                }


                if (
                    currentFilter ===
                    "finished"
                ) {

                    return status ===
                        "finished";

                }


                if (
                    currentFilter ===
                    "upcoming"
                ) {

                    return status ===
                        "upcoming";

                }


                return true;

            }
        );


    /* SEARCH */

    const query =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    if (query) {

        result =
            result.filter(
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


                    const competition =
                        getCompetitionName(
                            match
                        )
                        .toLowerCase();


                    return (

                        home.includes(
                            query
                        ) ||

                        away.includes(
                            query
                        ) ||

                        competition.includes(
                            query
                        )

                    );

                }
            );

    }


    return result;

}


/* =========================================================
   RENDER
========================================================= */

function renderMatches() {

    if (!matchesContainer) {

        return;

    }


    if (loading) {

        loading.style.display =
            "none";

    }


    matchesContainer.innerHTML =
        "";


    const matches =
        getFilteredMatches();


    if (matchCount) {

        matchCount.textContent =
            `${matches.length} match${
                matches.length > 1
                    ? "s"
                    : ""
            }`;

    }


    if (!matches.length) {

        showEmpty(
            getEmptyIcon(),
            getEmptyTitle(),
            getEmptyText()
        );

        return;

    }


    if (noMatches) {

        noMatches.classList.remove(
            "show"
        );

    }


    /* GROUP BY COMPETITION */

    const competitions = {};


    matches.forEach(
        match => {

            const competition =
                getCompetitionName(
                    match
                );


            if (
                !competitions[
                    competition
                ]
            ) {

                competitions[
                    competition
                ] = [];

            }


            competitions[
                competition
            ].push(match);

        }
    );


    Object.entries(
        competitions
    )
    .forEach(
        ([competition, games]) => {

            const section =
                document.createElement(
                    "section"
                );


            section.className =
                "competition";


            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "competition-head";


            header.innerHTML = `

                <div class="competition-icon">
                    🏆
                </div>

                <span>
                    ${escapeHTML(
                        competition
                    )}
                </span>

            `;


            section.appendChild(
                header
            );


            games.forEach(
                match => {

                    section.appendChild(
                        createMatchCard(
                            match
                        )
                    );

                }
            );


            matchesContainer.appendChild(
                section
            );

        }
    );

}


/* =========================================================
   MATCH CARD
========================================================= */

function createMatchCard(match) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "match-item";


    const status =
        getMatchStatus(
            match
        );


    let statusText =
        "À VENIR";


    let statusClass =
        "upcoming";


    if (
        status === "live"
    ) {

        statusClass =
            "live";


        const minute =
            getLiveMinute(
                match
            );


        statusText =
            minute !== null
                ? `LIVE • ${minute}'`
                : "LIVE";

    }


    else if (
        status === "finished"
    ) {

        statusText =
            "TERMINÉ";


        statusClass =
            "finished";

    }


    const homeName =
        getTeamName(
            match,
            "home"
        );


    const awayName =
        getTeamName(
            match,
            "away"
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


    const homeScore =
        getTeamScore(
            match,
            "home"
        );


    const awayScore =
        getTeamScore(
            match,
            "away"
        );


    let scoreStatus =
        "À venir";


    if (
        status === "live"
    ) {

        const minute =
            getLiveMinute(
                match
            );


        scoreStatus =
            minute !== null
                ? `${minute}'`
                : "LIVE";

    }


    else if (
        status === "finished"
    ) {

        scoreStatus =
            "FT";

    }


    card.innerHTML = `

        <div class="match-top">

            <div class="status ${statusClass}">

                <span class="status-dot"></span>

                <span>
                    ${escapeHTML(
                        statusText
                    )}
                </span>

            </div>


            <div class="match-time">

                ${escapeHTML(
                    formatMatchTime(
                        match,
                        status
                    )
                )}

            </div>

        </div>


        <div class="match-body">

            <div class="club">

                <div class="club-logo">

                    ${
                        homeLogo
                            ? `
                                <img
                                    src="${escapeAttribute(
                                        homeLogo
                                    )}"
                                    alt="${escapeAttribute(
                                        homeName
                                    )}"
                                    loading="lazy"
                                >
                              `
                            : `
                                <span>
                                    ⚽
                                </span>
                              `
                    }

                </div>


                <div class="club-name">

                    ${escapeHTML(
                        homeName
                    )}

                </div>

            </div>


            <div class="score">

                <strong>
                    ${escapeHTML(
                        String(
                            homeScore
                        )
                    )}
                </strong>

                <span class="score-separator">
                    -
                </span>

                <strong>
                    ${escapeHTML(
                        String(
                            awayScore
                        )
                    )}
                </strong>


                <small>
                    ${escapeHTML(
                        scoreStatus
                    )}
                </small>

            </div>


            <div class="club">

                <div class="club-logo">

                    ${
                        awayLogo
                            ? `
                                <img
                                    src="${escapeAttribute(
                                        awayLogo
                                    )}"
                                    alt="${escapeAttribute(
                                        awayName
                                    )}"
                                    loading="lazy"
                                >
                              `
                            : `
                                <span>
                                    ⚽
                                </span>
                              `
                    }

                </div>


                <div class="club-name">

                    ${escapeHTML(
                        awayName
                    )}

                </div>

            </div>

        </div>

    `;


    /* =====================================================
       OPEN MATCH DETAILS
       IMPORTANT:
       Nou itilize ?id=
    ===================================================== */

    const matchId =
        match?.id ||
        match?.raw?.id ||
        match?.slug ||
        match?.raw?.slug ||
        "";


    if (matchId) {

        card.style.cursor =
            "pointer";


        card.addEventListener(
            "click",
            () => {

             window.location.href =
    "match-details.html?match=" +
    encodeURIComponent(
        matchId
    );  

            }
        );

    }


    return card;

       }
/* =========================================================
   PREZISCORE — SCRIPT.JS
   PARTIE 2/2
========================================================= */


/* =========================================================
   TEAM NAME
========================================================= */

function getTeamName(match, side) {

    const team =
        side === "home"
            ? match?.home
            : match?.away;


    let name =
        team?.name;


    if (
        !name &&
        match?.raw
    ) {

        const raw =
            match.raw;


        if (
            side === "home"
        ) {

            name =
                raw.home_name ||
                raw.home_team_name ||
                raw.home_team?.name ||
                raw.home?.name ||
                raw.home;

        }

        else {

            name =
                raw.away_name ||
                raw.away_team_name ||
                raw.away_team?.name ||
                raw.away?.name ||
                raw.away;

        }

    }


    if (
        typeof name === "object"
    ) {

        name =
            name.name ||
            name.title ||
            name.short_name ||
            name.shortName;

    }


    return (
        String(name || "").trim()
    ) || (
        side === "home"
            ? "Équipe domicile"
            : "Équipe visiteuse"
    );

}


/* =========================================================
   TEAM LOGO
========================================================= */

function getTeamLogo(match, side) {

    const team =
        side === "home"
            ? match?.home
            : match?.away;


    let logo =
        team?.logo;


    if (
        !logo &&
        match?.raw
    ) {

        const raw =
            match.raw;


        if (
            side === "home"
        ) {

            logo =
                raw.home_logo ||
                raw.home_team_logo ||
                raw.home_team?.logo ||
                raw.home?.logo;

        }

        else {

            logo =
                raw.away_logo ||
                raw.away_team_logo ||
                raw.away_team?.logo ||
                raw.away?.logo;

        }

    }


    return (
        typeof logo === "string"
            ? logo.trim()
            : ""
    );

}


/* =========================================================
   SCORE
========================================================= */

function getTeamScore(match, side) {

    const team =
        side === "home"
            ? match?.home
            : match?.away;


    let score =
        team?.score;


    if (
        score === null ||
        score === undefined ||
        score === ""
    ) {

        const raw =
            match?.raw;


        if (raw) {

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

        }

    }


    if (
        score === null ||
        score === undefined ||
        score === ""
    ) {

        return "-";

    }


    return score;

}


/* =========================================================
   COMPETITION
========================================================= */

function getCompetitionName(match) {

    let name =
        match?.competition;


    if (
        typeof name === "object"
    ) {

        name =
            name.name ||
            name.title;

    }


    if (
        !name &&
        match?.raw
    ) {

        const raw =
            match.raw;


        name =
            raw.competition_name ||
            raw.league_name ||
            raw.tournament_name ||
            raw.competition?.name ||
            raw.league?.name ||
            raw.tournament?.name;

    }


    return (
        String(
            name || "Football"
        ).trim()
    );

}


/* =========================================================
   LIVE MINUTE
========================================================= */

function getLiveMinute(match) {

    const raw =
        match?.raw || {};


    let value =
        match?.minute ??
        match?.elapsed ??
        raw.minute ??
        raw.minutes ??
        raw.elapsed ??
        raw.elapsed_time ??
        raw.elapsedTime ??
        raw.match_time ??
        raw.matchTime ??
        raw.time_elapsed ??
        raw.status_time ??
        raw.statusTime ??
        raw.timer ??
        raw.live_minute ??
        raw.liveMinute ??
        raw.live_time ??
        null;


    /* OBJECT */

    if (
        value &&
        typeof value === "object"
    ) {

        value =
            value.minute ??
            value.minutes ??
            value.elapsed ??
            value.elapsed_time ??
            value.elapsedTime ??
            value.current ??
            value.value ??
            value.time ??
            null;

    }


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        const text =
            String(

                match?.statusText ||
                raw.status_text ||
                raw.statusText ||
                raw.time ||
                ""

            );


        const minuteMatch =
            text.match(
                /(\d{1,3})\s*['’]/
            );


        if (minuteMatch) {

            return Number(
                minuteMatch[1]
            );

        }


        const minuteWord =
            text.match(
                /(\d{1,3})\s*(?:min|minute|minutes)/i
            );


        if (minuteWord) {

            return Number(
                minuteWord[1]
            );

        }


        return null;

    }


    /* STRING */

    if (
        typeof value === "string"
    ) {

        const text =
            value
                .trim()
                .replace(
                    /minutes?/gi,
                    ""
                )
                .replace(
                    /mins?/gi,
                    ""
                )
                .trim();


        if (
            /^\d+$/.test(text)
        ) {

            return Number(text);

        }


        const apostrophe =
            text.match(
                /^(\d{1,3})\s*['’]/
            );


        if (apostrophe) {

            return Number(
                apostrophe[1]
            );

        }


        const clock =
            text.match(
                /^(\d{1,3}):\d{1,2}$/
            );


        if (clock) {

            return Number(
                clock[1]
            );

        }


        const minutes =
            text.match(
                /(\d{1,3})/
            );


        if (minutes) {

            return Number(
                minutes[1]
            );

        }


        return null;

    }


    /* NUMBER */

    if (
        typeof value === "number" &&
        Number.isFinite(value)
    ) {

        return value;

    }


    return null;

}


/* =========================================================
   MATCH TIME
========================================================= */

function formatMatchTime(match, status) {

    if (
        status === "live"
    ) {

        return "EN DIRECT";

    }


    const value =
        match?.startTime ??
        match?.start_time ??
        match?.date ??
        match?.raw?.start_time ??
        match?.raw?.startTime ??
        match?.raw?.date ??
        match?.raw?.datetime ??
        null;


    if (!value) {

        return "--:--";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

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
   EMPTY STATE
========================================================= */

function showEmpty(
    icon,
    title,
    text
) {

    if (
        !noMatches
    ) {

        return;

    }


    noMatches.innerHTML = `

        <div>
            ${escapeHTML(icon)}
        </div>

        <h3>
            ${escapeHTML(title)}
        </h3>

        <p>
            ${escapeHTML(text)}
        </p>

    `;


    noMatches.classList.add(
        "show"
    );

}


/* =========================================================
   EMPTY CONTENT
========================================================= */

function getEmptyIcon() {

    if (
        currentFilter ===
        "live"
    ) {

        return "🔴";

    }


    if (
        currentFilter ===
        "upcoming"
    ) {

        return "📅";

    }


    return "✅";

}


function getEmptyTitle() {

    if (
        currentFilter ===
        "live"
    ) {

        return "Aucun match en direct";

    }


    if (
        currentFilter ===
        "upcoming"
    ) {

        return "Aucun match à venir";

    }


    return "Aucun match terminé";

}


function getEmptyText() {

    if (
        currentFilter ===
        "live"
    ) {

        return (
            "Les matchs en cours " +
            "apparaîtront ici automatiquement."
        );

    }


    if (
        currentFilter ===
        "upcoming"
    ) {

        return (
            "Les prochains matchs " +
            "apparaîtront ici automatiquement."
        );

    }


    return (
        "Les matchs terminés " +
        "apparaîtront ici automatiquement."
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
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


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(value) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   FILTER BUTTONS
========================================================= */

tabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            () => {

                tabs.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                tab.classList.add(
                    "active"
                );


                currentFilter =
                    tab.dataset.filter ||
                    "live";


                renderMatches();

            }
        );

    }
);


/* =========================================================
   SEARCH
========================================================= */

if (
    searchInput
) {

    searchInput.addEventListener(
        "input",
        () => {

            renderMatches();

        }
    );

}


/* =========================================================
   SEARCH BUTTON
========================================================= */

function focusSearch() {

    if (
        searchInput
    ) {

        searchInput.focus();

    }

}


/* =========================================================
   AUTO REFRESH
========================================================= */

let refreshTimer =
    null;


function startAutoRefresh() {

    if (
        refreshTimer
    ) {

        clearInterval(
            refreshTimer
        );

    }


    refreshTimer =
        setInterval(
            () => {

                loadMatches();

            },
            30000
        );

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadMatches();

        startAutoRefresh();

    }
);
