"use strict";

/* =========================================================
   PREZISCORE — SCRIPT.JS
   PARTIE 1 / 2
   LIVE + UPCOMING + FINISHED
========================================================= */

console.log("⚽ PREZISCORE SCRIPT — PARTIE 1 OK");


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


/* =========================================================
   ESCAPE HTML
========================================================= */

function esc(value) {

    return String(value ?? "")
        .replace(/[&<>"']/g, char => ({

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"

        }[char]));

}


/* =========================================================
   STATUS
   API SportScore / TheSports
========================================================= */

function status(match) {

    const values = [

        match?.status,
        match?.status_text,

        match?.raw?.status,
        match?.raw?.status_text,
        match?.raw?.statusText,
        match?.raw?.state,
        match?.raw?.match_status

    ];


    const text =
        values
            .filter(Boolean)
            .map(value =>
                String(value)
                    .toLowerCase()
                    .trim()
            )
            .join(" ");


    /* ================= LIVE ================= */

    const liveWords = [

        "live",
        "playing",
        "ongoing",
        "in_progress",
        "in progress",
        "progress",
        "started",

        "1h",
        "2h",
        "ht",
        "et",
        "bt",
        "penalty",
        "penalties",

        "first half",
        "second half",
        "first_half",
        "second_half",

        "halftime",
        "half time"

    ];


    if (
        liveWords.some(word =>
            text.includes(word)
        )
    ) {

        return "live";

    }


    /* ================= FINISHED ================= */

    const finishedWords = [

        "finished",
        "finish",
        "ended",
        "completed",
        "full time",
        "full_time",
        "ft",
        "aet"

    ];


    if (
        finishedWords.some(word =>
            text.includes(word)
        )
    ) {

        return "finished";

    }


    /* ================= UPCOMING ================= */

    return "upcoming";

}


/* =========================================================
   TEAM NAME
========================================================= */

function team(match, side) {

    let value =
        match?.[side];


    /* API normalized object */

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


    /* API direct string */

    if (
        typeof value === "string" &&
        value.trim()
    ) {

        return value.trim();

    }


    /* RAW DATA */

    const raw =
        match?.raw || {};


    let name;


    if (side === "home") {

        name =
            raw.home ||
            raw.home_name ||
            raw.home_team_name ||
            raw.home_team?.name ||
            raw.home?.name;

    }

    else {

        name =
            raw.away ||
            raw.away_name ||
            raw.away_team_name ||
            raw.away_team?.name ||
            raw.away?.name;

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

function logo(match, side) {

    const value =
        match?.[side];


    /* Normalized object */

    if (
        value &&
        typeof value === "object"
    ) {

        if (
            value.logo
        ) {

            return String(
                value.logo
            ).trim();

        }

    }


    /* RAW */

    const raw =
        match?.raw || {};


    let result;


    if (side === "home") {

        result =
            raw.home_logo ||
            raw.home_team_logo ||
            raw.home_team?.logo ||
            raw.home?.logo;

    }

    else {

        result =
            raw.away_logo ||
            raw.away_team_logo ||
            raw.away_team?.logo ||
            raw.away?.logo;

    }


    return (
        typeof result === "string"
            ? result.trim()
            : ""
    );

}


/* =========================================================
   SCORE
========================================================= */

function score(match, side) {

    const value =
        match?.[side];


    /* Normalized object */

    if (
        value &&
        typeof value === "object"
    ) {

        if (
            value.score !== undefined &&
            value.score !== null
        ) {

            return value.score;

        }

    }


    /* RAW */

    const raw =
        match?.raw || {};


    let result;


    if (side === "home") {

        result =
            raw.home_score ??
            raw.homeScore ??
            raw.home_team?.score ??
            raw.home?.score;

    }

    else {

        result =
            raw.away_score ??
            raw.awayScore ??
            raw.away_team?.score ??
            raw.away?.score;

    }


    if (
        result === undefined ||
        result === null ||
        result === ""
    ) {

        return "-";

    }


    return result;

}


/* =========================================================
   COMPETITION
========================================================= */

function competition(match) {

    let value =
        match?.competition;


    if (
        value &&
        typeof value === "object"
    ) {

        value =
            value.name ||
            value.title;

    }


    if (!value) {

        const raw =
            match?.raw || {};


        value =
            raw.competition ||
            raw.competition_name ||
            raw.league_name ||
            raw.tournament_name ||
            raw.league?.name ||
            raw.tournament?.name ||
            raw.competition?.name;

    }


    return (
        String(
            value || "Football"
        ).trim()
    );

}


/* =========================================================
   TIME
========================================================= */

function time(match, currentStatus) {

    if (
        currentStatus === "live"
    ) {

        return "🔴 LIVE";

    }


    if (
        currentStatus === "finished"
    ) {

        return "FT";

    }


    const value =
        match?.time ||
        match?.raw?.time ||
        match?.raw?.date ||
        match?.raw?.start_time;


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
   FILTER
========================================================= */

function filtered() {

    let list =
        matches.filter(
            match =>
                status(match) === filter
        );


    /* SEARCH */

    const query =
        search?.value
            ?.toLowerCase()
            .trim();


    if (query) {

        list =
            list.filter(match => {

                const home =
                    team(
                        match,
                        "home"
                    )
                    .toLowerCase();


                const away =
                    team(
                        match,
                        "away"
                    )
                    .toLowerCase();


                const league =
                    competition(
                        match
                    )
                    .toLowerCase();


                return (

                    home.includes(query) ||

                    away.includes(query) ||

                    league.includes(query)

                );

            });

    }


    return list;

}


/* =========================================================
   MATCH CARD
========================================================= */

function card(match) {

    const currentStatus =
        status(match);


    const home =
        team(match, "home");

    const away =
        team(match, "away");


    const homeLogo =
        logo(match, "home");

    const awayLogo =
        logo(match, "away");


    const homeScore =
        score(match, "home");

    const awayScore =
        score(match, "away");


    const article =
        document.createElement(
            "article"
        );


    article.className =
        "match-item";


    let statusText =
        "À VENIR";


    if (
        currentStatus === "live"
    ) {

        statusText =
            "🔴 LIVE";

    }


    if (
        currentStatus === "finished"
    ) {

        statusText =
            "TERMINÉ";

    }


    article.innerHTML = `

        <div class="match-top">

            <div class="status ${currentStatus}">

                <span class="status-dot"></span>

                ${statusText}

            </div>


            <div class="match-time">

                ${esc(
                    time(
                        match,
                        currentStatus
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

                        ?

                        `
                        <img
                            src="${esc(homeLogo)}"
                            alt="${esc(home)}"
                            loading="lazy"
                            onerror="this.style.display='none'"
                        >
                        `

                        :

                        `⚽`
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
                        String(homeScore)
                    )}

                </strong>


                <span>
                    -
                </span>


                <strong>

                    ${esc(
                        String(awayScore)
                    )}

                </strong>


                <small>

                    ${
                        currentStatus === "live"
                            ? "🔴 LIVE"

                            :

                        currentStatus === "finished"
                            ? "FT"

                            :

                        "À venir"
                    }

                </small>

            </div>


            <!-- AWAY -->

            <div class="club">

                <div class="club-logo">

                    ${
                        awayLogo

                        ?

                        `
                        <img
                            src="${esc(awayLogo)}"
                            alt="${esc(away)}"
                            loading="lazy"
                            onerror="this.style.display='none'"
                        >
                        `

                        :

                        `⚽`
                    }

                </div>


                <div class="club-name">

                    ${esc(away)}

                </div>

            </div>


        </div>

    `;


    /* ===============================
       OPEN MATCH DETAILS
    =============================== */

    const id =
        match?.id ||
        match?.slug ||
        match?.url ||
        match?.raw?.id ||
        match?.raw?.url ||
        "";


    if (id) {

        article.style.cursor =
            "pointer";


        article.addEventListener(
            "click",
            function() {

                location.href =
                    "match-details.html?match=" +
                    encodeURIComponent(id);

            }
        );

    }


    return article;

}


/* =========================================================
   LOAD MATCHES
========================================================= */

async function loadMatches() {

    console.log(
        "🔄 PreziScore: chargement..."
    );


    try {

        if (
            loading
        ) {

            loading.style.display =
                "block";

        }


        if (!window.PreziAPI) {

            throw new Error(
                "PreziAPI pa jwenn"
            );

        }


        if (
            typeof PreziAPI
                .getNormalizedMatches
            !== "function"
        ) {

            throw new Error(
                "getNormalizedMatches() pa jwenn"
            );

        }


        const data =
            await PreziAPI
                .getNormalizedMatches();


        matches =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "⚽ Matchs reçus:",
            matches.length
        );


        render();

    }

    catch(error) {

        console.error(
            "❌ PreziScore API:",
            error
        );


        if (loading) {

            loading.style.display =
                "none";

        }


        showEmpty(
            "⚠️",
            "Erreur API",
            "Impossible de charger les matchs."
        );

    }

        }
/* =========================================================
   PREZISCORE — SCRIPT.JS
   PARTIE 2 / 2
   RENDER + TABS + SEARCH + AUTO REFRESH
========================================================= */


/* =========================================================
   RENDER
========================================================= */

function render() {

    if (loading) {

        loading.style.display =
            "none";

    }


    if (!box) {

        console.error(
            "❌ matchesContainer pa jwenn."
        );

        return;

    }


    const list =
        filtered();


    box.innerHTML =
        "";


    /* MATCH COUNT */

    if (count) {

        count.textContent =
            list.length +
            (
                list.length > 1
                    ? " matchs"
                    : " match"
            );

    }


    /* NO MATCH */

    if (
        list.length === 0
    ) {

        showEmpty(

            filter === "live"
                ? "🔴"

                : filter === "finished"
                ? "✅"

                : "📅",

            filter === "live"
                ? "Aucun match en direct"

                : filter === "finished"
                ? "Aucun match terminé"

                : "Aucun match à venir",

            filter === "live"
                ? "Les matchs en direct apparaîtront ici."

                : filter === "finished"
                ? "Les matchs terminés apparaîtront ici."

                : "Les prochains matchs apparaîtront ici."

        );

        return;

    }


    /* HIDE EMPTY */

    if (empty) {

        empty.classList.remove(
            "show"
        );

        empty.style.display =
            "none";

    }


    /* =====================================================
       GROUP BY COMPETITION
    ===================================================== */

    const groups = {};


    list.forEach(
        match => {

            const name =
                competition(match);


            if (
                !groups[name]
            ) {

                groups[name] =
                    [];

            }


            groups[name].push(
                match
            );

        }
    );


    /* =====================================================
       CREATE COMPETITIONS
    ===================================================== */

    Object.entries(groups)
        .forEach(
            ([name, games]) => {


                const section =
                    document.createElement(
                        "section"
                    );


                section.className =
                    "competition";


                /* HEADER */

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

                        ${esc(name)}

                    </span>

                `;


                section.appendChild(
                    header
                );


                /* MATCHES */

                games.forEach(
                    match => {

                        section.appendChild(
                            card(match)
                        );

                    }
                );


                box.appendChild(
                    section
                );

            }
        );

}


/* =========================================================
   EMPTY MESSAGE
========================================================= */

function showEmpty(
    icon,
    title,
    text
) {

    if (!empty) {

        return;

    }


    empty.innerHTML = `

        <div>

            ${esc(icon)}

        </div>


        <h3>

            ${esc(title)}

        </h3>


        <p>

            ${esc(text)}

        </p>

    `;


    empty.style.display =
        "block";


    empty.classList.add(
        "show"
    );

}


/* =========================================================
   TABS
========================================================= */

tabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            function() {


                /* REMOVE ACTIVE */

                tabs.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                /* ACTIVE TAB */

                this.classList.add(
                    "active"
                );


                /* FILTER */

                filter =
                    this.dataset.filter ||
                    "live";


                console.log(
                    "📌 Filter:",
                    filter
                );


                /* RENDER */

                render();

            }
        );

    }
);


/* =========================================================
   SEARCH
========================================================= */

if (search) {

    search.addEventListener(
        "input",
        function() {

            render();

        }
    );

}


/* =========================================================
   SEARCH BUTTON
========================================================= */

window.focusSearch =
function() {

    if (!search) {

        return;

    }


    search.focus();


    search.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

};


/* =========================================================
   AUTO REFRESH
   Chak 30 segonn
========================================================= */

setInterval(
    async function() {

        try {

            if (
                !window.PreziAPI
            ) {

                return;

            }


            if (
                typeof PreziAPI
                    .getNormalizedMatches
                !== "function"
            ) {

                return;

            }


            console.log(
                "🔄 Auto refresh..."
            );


            const data =
                await PreziAPI
                    .getNormalizedMatches();


            if (
                Array.isArray(data)
            ) {

                matches =
                    data;


                render();

            }

        }

        catch(error) {

            console.log(
                "⚠️ Auto refresh error:",
                error
            );

        }

    },

    30000

);


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "🚀 PreziScore START"
        );


        loadMatches();

    }
);


/* =========================================================
   GLOBAL API
========================================================= */

window.PreziMatches = {

    reload:
        loadMatches,

    render:
        render,

    getAll:
        function() {

            return matches;

        },

    getLive:
        function() {

            return matches.filter(
                match =>
                    status(match) ===
                    "live"
            );

        },

    getUpcoming:
        function() {

            return matches.filter(
                match =>
                    status(match) ===
                    "upcoming"
            );

        },

    getFinished:
        function() {

            return matches.filter(
                match =>
                    status(match) ===
                    "finished"
            );

        }

};


/* =========================================================
   READY
========================================================= */

console.log(
    "✅ PREZISCORE SCRIPT.JS FULL READY"
);
