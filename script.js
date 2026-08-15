"use strict";

/* =========================================================
   PREZISCORE — SCRIPT.JS
   LIVE + SCORE + MINUTE + LOGOS
========================================================= */

console.log("⚽ PREZISCORE SCRIPT READY");


const box = document.getElementById("matchesContainer");
const loading = document.getElementById("loading");
const empty = document.getElementById("noMatches");
const search = document.getElementById("searchInput");
const count = document.getElementById("matchCount");
const tabs = document.querySelectorAll(".match-tab");

let matches = [];
let filter = "live";


/* =========================================================
   ESCAPE
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
========================================================= */

function getStatus(match) {

    const raw = match?.raw || {};

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

    const text = values
        .filter(v => v !== undefined && v !== null)
        .map(v => String(v).toLowerCase().trim())
        .join(" ");

    /* FINISHED FIRST */

    if (
        text.includes("finished") ||
        text.includes("finish") ||
        text.includes("ended") ||
        text.includes("completed") ||
        text.includes("full time") ||
        text.includes("full_time") ||
        text === "ft" ||
        text.includes("aet")
    ) {
        return "finished";
    }


    /* LIVE */

    if (
        text.includes("live") ||
        text.includes("playing") ||
        text.includes("ongoing") ||
        text.includes("in_progress") ||
        text.includes("in progress") ||
        text.includes("started") ||
        text.includes("1h") ||
        text.includes("2h") ||
        text.includes("first half") ||
        text.includes("second half") ||
        text.includes("first_half") ||
        text.includes("second_half") ||
        text.includes("halftime") ||
        text.includes("half time")
    ) {
        return "live";
    }


    return "upcoming";
}


/* =========================================================
   TEAM NAME
========================================================= */

function getTeam(match, side) {

    const value = match?.[side];

    if (value && typeof value === "object") {

        return (
            value.name ||
            value.title ||
            value.short_name ||
            value.shortName ||
            "Équipe"
        );
    }

    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }


    const raw = match?.raw || {};

    let team;

    if (side === "home") {

        team =
            raw.home_team ||
            raw.home ||
            raw.homeTeam ||
            raw.home_name ||
            raw.home_team_name;

    } else {

        team =
            raw.away_team ||
            raw.away ||
            raw.awayTeam ||
            raw.away_name ||
            raw.away_team_name;
    }


    if (team && typeof team === "object") {

        return (
            team.name ||
            team.title ||
            team.short_name ||
            team.shortName ||
            "Équipe"
        );
    }


    return String(team || "").trim() ||
        (
            side === "home"
                ? "Équipe domicile"
                : "Équipe visiteuse"
        );
}


/* =========================================================
   LOGO
========================================================= */

function getLogo(match, side) {

    const value = match?.[side];

    if (value && typeof value === "object") {

        const logo =
            value.logo ||
            value.crest ||
            value.image ||
            value.badge ||
            value.icon;

        if (logo) {
            return String(logo).trim();
        }
    }


    const raw = match?.raw || {};

    let team;

    if (side === "home") {

        team =
            raw.home_team ||
            raw.homeTeam ||
            raw.home;

    } else {

        team =
            raw.away_team ||
            raw.awayTeam ||
            raw.away;
    }


    if (team && typeof team === "object") {

        const logo =
            team.logo ||
            team.crest ||
            team.image ||
            team.badge ||
            team.icon;

        if (logo) {
            return String(logo).trim();
        }
    }


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


    return typeof direct === "string"
        ? direct.trim()
        : "";
}


/* =========================================================
   SCORE
========================================================= */

function getScore(match, side) {

    const value = match?.[side];

    if (value && typeof value === "object") {

        if (
            value.score !== undefined &&
            value.score !== null
        ) {
            return value.score;
        }
    }


    const raw = match?.raw || {};

    let score;

    if (side === "home") {

        score =
            raw.home_score ??
            raw.homeScore ??
            raw.home_team?.score ??
            raw.home?.score;

    } else {

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

    let value = match?.competition;

    if (value && typeof value === "object") {
        value =
            value.name ||
            value.title;
    }


    const raw = match?.raw || {};

    value =
        value ||
        raw.competition_name ||
        raw.league_name ||
        raw.tournament_name ||
        raw.league?.name ||
        raw.competition?.name ||
        "Football";


    return String(value).trim();
}


/* =========================================================
   MATCH DATE
========================================================= */

function getMatchDate(match) {

    const raw = match?.raw || {};

    return (
        match?.time ||
        raw?.time ||
        raw?.utcTime ||
        raw?.date ||
        raw?.start_time ||
        raw?.startTime ||
        null
    );
}


/* =========================================================
   LIVE MINUTE
========================================================= */

function getLiveMinute(match) {

    const raw = match?.raw || {};

    const direct =
        match?.minute ??
        match?.elapsed ??
        match?.minutePlayed ??
        raw?.minute ??
        raw?.elapsed ??
        raw?.elapsed_time ??
        raw?.minutePlayed;


    /* If API already gives minute */

    if (
        direct !== undefined &&
        direct !== null &&
        direct !== ""
    ) {

        const number = parseInt(
            String(direct).replace(/[^\d]/g, ""),
            10
        );

        if (!Number.isNaN(number)) {
            return number + "'";
        }
    }


    /* Try status text */

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
        String(text).match(/(\d{1,3})\s*'?/);

    if (minuteMatch) {

        return minuteMatch[1] + "'";
    }


    /* Calculate from kickoff */

    const dateValue =
        getMatchDate(match);

    if (!dateValue) {
        return "LIVE";
    }


    const kickoff =
        new Date(dateValue);

    if (
        Number.isNaN(
            kickoff.getTime()
        )
    ) {
        return "LIVE";
    }


    const now = Date.now();

    let minutes =
        Math.floor(
            (now - kickoff.getTime()) /
            60000
        );


    /*
       Football calculation:
       0-45 = first half
       45-60 = halftime / second half transition
       60+ = second half
    */

    if (minutes < 1) {
        return "1'";
    }


    if (minutes <= 45) {
        return minutes + "'";
    }


    if (minutes <= 60) {
        return "45+";
    }


    return Math.min(
        minutes - 15,
        120
    ) + "'";
}


/* =========================================================
   TIME
========================================================= */

function getTime(match, state) {

    if (state === "live") {

        return getLiveMinute(match);
    }


    if (state === "finished") {
        return "FT";
    }


    const value =
        getMatchDate(match);

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
   SEARCH + FILTER
========================================================= */

function filteredMatches() {

    let list =
        matches.filter(
            match =>
                getStatus(match) === filter
        );


    const query =
        search?.value
            ?.toLowerCase()
            .trim();


    if (query) {

        list =
            list.filter(match => {

                const home =
                    getTeam(match, "home")
                        .toLowerCase();

                const away =
                    getTeam(match, "away")
                        .toLowerCase();

                const league =
                    getCompetition(match)
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

function createCard(match) {

    const state =
        getStatus(match);

    const home =
        getTeam(match, "home");

    const away =
        getTeam(match, "away");

    const homeLogo =
        getLogo(match, "home");

    const awayLogo =
        getLogo(match, "away");

    const homeScore =
        getScore(match, "home");

    const awayScore =
        getScore(match, "away");


    const article =
        document.createElement("article");

    article.className =
        "match-item";


    let statusText;

    if (state === "live") {
        statusText = "🔴 LIVE";
    } else if (state === "finished") {
        statusText = "✅ TERMINÉ";
    } else {
        statusText = "📅 À VENIR";
    }


    article.innerHTML = `

        <div class="match-top">

            <div class="status ${state}">
                ${statusText}
            </div>

            <div class="match-time">
                ${esc(
                    getTime(match, state)
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


            <div class="score">

                <strong>
                    ${esc(homeScore)}
                </strong>

                <span>-</span>

                <strong>
                    ${esc(awayScore)}
                </strong>

                <small>

                    ${
                        state === "live"
                            ? `🔴 ${esc(
                                getLiveMinute(match)
                              )}`

                            : state === "finished"
                            ? "FT"

                            : getTime(
                                match,
                                state
                              )
                    }

                </small>

            </div>


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


    const id =
        match?.id ||
        match?.slug ||
        match?.raw?.id ||
        match?.raw?.url;


    if (id) {

        article.style.cursor =
            "pointer";

        article.addEventListener(
            "click",
            () => {

                location.href =
                    "match-details.html?match=" +
                    encodeURIComponent(id);

            }
        );
    }


    return article;
}


/* =========================================================
   EMPTY
========================================================= */

function showEmpty(icon, title, text) {

    if (!empty) return;


    empty.innerHTML = `

        <div>${esc(icon)}</div>

        <h3>${esc(title)}</h3>

        <p>${esc(text)}</p>
    `;


    empty.style.display =
        "block";

    empty.classList.add("show");
}


/* =========================================================
   RENDER
========================================================= */

function render() {

    if (loading) {
        loading.style.display = "none";
    }

    if (!box) return;


    const list =
        filteredMatches();


    box.innerHTML = "";


    if (count) {

        count.textContent =
            list.length +
            (
                list.length === 1
                    ? " match"
                    : " matchs"
            );
    }


    if (!list.length) {

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


    if (empty) {

        empty.style.display = "none";

        empty.classList.remove("show");
    }


    const groups = {};


    list.forEach(match => {

        const name =
            getCompetition(match);

        if (!groups[name]) {
            groups[name] = [];
        }

        groups[name].push(match);
    });


    Object.entries(groups)
        .forEach(([name, games]) => {

            const section =
                document.createElement("section");

            section.className =
                "competition";


            const header =
                document.createElement("div");

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


            section.appendChild(header);


            games.forEach(match => {

                section.appendChild(
                    createCard(match)
                );

            });


            box.appendChild(section);
        });
}


/* =========================================================
   LOAD
========================================================= */

async function loadMatches() {

    try {

        if (loading) {
            loading.style.display = "block";
        }


        if (
            !window.PreziAPI ||
            typeof PreziAPI.getNormalizedMatches !== "function"
        ) {

            throw new Error(
                "PreziAPI pa disponib"
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
            "⚽ MATCHES:",
            matches.length
        );


        console.log(
            "🔴 LIVE:",
            matches.filter(
                m => getStatus(m) === "live"
            ).length
        );


        console.log(
            "✅ FINISHED:",
            matches.filter(
                m => getStatus(m) === "finished"
            ).length
        );


        console.log(
            "📅 UPCOMING:",
            matches.filter(
                m => getStatus(m) === "upcoming"
            ).length
        );


        render();

    } catch (error) {

        console.error(
            "❌ PREZISCORE:",
            error
        );


        if (loading) {
            loading.style.display = "none";
        }


        showEmpty(
            "⚠️",
            "Erreur API",
            "Impossible de charger les matchs."
        );
    }
}


/* =========================================================
   TABS
========================================================= */

tabs.forEach(tab => {

    tab.addEventListener(
        "click",
        () => {

            tabs.forEach(t =>
                t.classList.remove("active")
            );


            tab.classList.add("active");


            filter =
                tab.dataset.filter ||
                "live";


            render();
        }
    );
});


/* =========================================================
   SEARCH
========================================================= */

if (search) {

    search.addEventListener(
        "input",
        render
    );
},
    30000
);


/* =========================================================
   START
========================================================= */

loadMatches();


console.log(
    "================================"
);

console.log(
    "⚽ PREZISCORE READY"
);

console.log(
    "🔴 LIVE + SCORE + MINUTE"
);

console.log(
    "🖼️ LOGOS"
);

console.log(
    "🔄 AUTO REFRESH 30s"
);

console.log(
    "================================"
);
   
