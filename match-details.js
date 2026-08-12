"use strict";

/* =====================================================
   PREZISCORE — MATCH DETAILS
   PARTIE 1/2
   🇫🇷 FRANÇAIS
===================================================== */

console.log("⚽ PREZISCORE MATCH DETAILS OK");


/* =====================================================
   ELEMENTS
===================================================== */

const matchHeader =
    document.getElementById("matchHeader");

const detailContent =
    document.getElementById("detailContent");

const tabs =
    document.querySelectorAll(".detail-tab");


/* =====================================================
   MATCH ID
===================================================== */

const params =
    new URLSearchParams(
        window.location.search
    );

const matchId =
    params.get("match");


console.log(
    "⚽ Match ID:",
    matchId
);


/* =====================================================
   HELPERS
===================================================== */

function safe(value) {

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


function getName(match, side) {

    return (
        match?.[side]?.name ||
        "Équipe"
    );

}


function getLogo(match, side) {

    return (
        match?.[side]?.logo ||
        ""
    );

}


function getScore(match, side) {

    return (
        match?.[side]?.score ??
        "-"
    );

}


function getStatus(match) {

    return (
        match?.status ||
        "upcoming"
    );

}


function getMinute(match) {

    return (
        match?.minute ??
        null
    );

}


/* =====================================================
   STATUS
===================================================== */

function statusText(match) {

    const status =
        getStatus(match);


    if (status === "live") {

        const minute =
            getMinute(match);


        return minute !== null
            ? `🔴 EN DIRECT • ${minute}'`
            : "🔴 EN DIRECT";

    }


    if (status === "finished") {

        return "TERMINÉ";

    }


    return "À VENIR";

}


/* =====================================================
   LOAD MATCH
===================================================== */

async function loadMatch() {

    if (!matchId) {

        showError(
            "Match introuvable",
            "Aucun identifiant de match n'a été fourni."
        );

        return;

    }


    if (
        !window.PreziAPI ||
        typeof PreziAPI.getMatchById !==
        "function"
    ) {

        showError(
            "API indisponible",
            "La fonction du match n'est pas disponible."
        );

        return;

    }


    try {

        const match =
            await PreziAPI.getMatchById(
                matchId
            );


        if (!match) {

            showError(
                "Match introuvable",
                "Impossible de trouver ce match."
            );

            return;

        }


        window.currentMatch =
            match;


        renderMatchHeader(
            match
        );


        renderSummary(
            match
        );


    }

    catch (error) {

        console.error(
            "❌ Erreur match:",
            error
        );


        showError(
            "Erreur de chargement",
            "Impossible de charger les informations du match."
        );

    }

}


/* =====================================================
   MATCH HEADER
===================================================== */

function renderMatchHeader(match) {

    const home =
        getName(
            match,
            "home"
        );


    const away =
        getName(
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


    const status =
        getStatus(match);


    matchHeader.innerHTML = `

        <div class="detail-competition">

            🏆 ${safe(
                match.competition ||
                "Football"
            )}

        </div>


        <div class="detail-status ${safe(status)}">

            ${safe(
                statusText(match)
            )}

        </div>


        <div class="detail-teams">


            <!-- ÉQUIPE A -->

            <div class="detail-team">

                <div class="detail-logo">

                    ${
                        homeLogo
                        ? `
                            <img
                                src="${safe(homeLogo)}"
                                alt="${safe(home)}"
                            >
                          `
                        : "⚽"
                    }

                </div>


                <div class="detail-team-name">

                    ${safe(home)}

                </div>

            </div>


            <!-- SCORE -->

            <div class="detail-score">

                ${safe(
                    getScore(
                        match,
                        "home"
                    )
                )}

                :

                ${safe(
                    getScore(
                        match,
                        "away"
                    )
                )}

                <small>

                    ${
                        status === "live"
                        ? `${safe(
                            getMinute(match) ?? ""
                          )}'`

                        : status === "finished"
                        ? "FT"

                        : "À venir"
                    }

                </small>

            </div>


            <!-- ÉQUIPE B -->

            <div class="detail-team">

                <div class="detail-logo">

                    ${
                        awayLogo
                        ? `
                            <img
                                src="${safe(awayLogo)}"
                                alt="${safe(away)}"
                            >
                          `
                        : "⚽"
                    }

                </div>


                <div class="detail-team-name">

                    ${safe(away)}

                </div>

            </div>

        </div>


        <div class="match-info">

            <div class="info-box">

                <span>
                    DATE
                </span>

                <strong>
                    ${formatDate(match.time)}
                </strong>

            </div>


            <div class="info-box">

                <span>
                    STADE
                </span>

                <strong>
                    ${safe(
                        match.venue ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="info-box">

                <span>
                    ARBITRE
                </span>

                <strong>
                    ${safe(
                        match.referee ||
                        "—"
                    )}
                </strong>

            </div>

        </div>

    `;

}


/* =====================================================
   DATE
===================================================== */

function formatDate(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.toLocaleString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =====================================================
   SUMMARY
===================================================== */

function renderSummary(match) {

    const status =
        getStatus(match);


    detailContent.innerHTML = `

        <div class="detail-panel">

            <div class="panel-title">

                📋 Résumé du match

            </div>


            <p style="
                color:var(--muted);
                font-size:10px;
                line-height:1.7;
                margin:0;
            ">

                ${
                    status === "live"

                    ? "Le match est actuellement en direct. Les informations sont mises à jour automatiquement."

                    : status === "finished"

                    ? "Ce match est terminé. Consultez les statistiques et les événements."

                    : "Le match n'a pas encore commencé."

                }

            </p>

        </div>

    `;

}


/* =====================================================
   ERROR
===================================================== */

function showError(title, text) {

    if (!matchHeader) return;


    matchHeader.innerHTML = `

        <div class="detail-error">

            <div>
                ⚠️
            </div>


            <h3>
                ${safe(title)}
            </h3>


            <p>
                ${safe(text)}
            </p>

        </div>

    `;


    if (detailContent) {

        detailContent.innerHTML = "";

    }

}


/* =====================================================
   TABS
===================================================== */

tabs.forEach(tab => {

    tab.addEventListener(
        "click",
        () => {

            tabs.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


            tab.classList.add(
                "active"
            );


            const type =
                tab.dataset.tab;


            if (!window.currentMatch) {

                return;

            }


            if (
                type === "summary"
            ) {

                renderSummary(
                    window.currentMatch
                );

            }


            if (
                type === "stats"
            ) {

                loadStatistics();

            }


            if (
                type === "events"
            ) {

                loadEvents();

            }

        }
    );

});


/* =====================================================
   START
===================================================== */

loadMatch();
/* =====================================================
   PREZISCORE — MATCH DETAILS
   PARTIE 2/2
   STATISTIQUES + ÉVÉNEMENTS
===================================================== */


/* =====================================================
   STATISTIQUES
===================================================== */

async function loadStatistics() {

    const match =
        window.currentMatch;


    if (!match) return;


    detailContent.innerHTML = `

        <div class="detail-panel">

            <div class="detail-loading">
                📊 Chargement des statistiques...
            </div>

        </div>

    `;


    try {

        let statistics = null;


        /* API DIRECT */

        if (
            typeof PreziAPI.getMatchStatistics ===
            "function"
        ) {

            statistics =
                await PreziAPI.getMatchStatistics(
                    match.id
                );

        }


        /* SI API RETOURNE DATA */

        if (
            statistics
        ) {

            renderStatistics(
                statistics,
                match
            );

            return;

        }


        /* FALLBACK */

        renderStatistics(
            {},
            match
        );

    }

    catch (error) {

        console.error(
            "❌ Statistiques:",
            error
        );


        detailContent.innerHTML = `

            <div class="detail-panel">

                <div class="panel-title">
                    📊 Statistiques
                </div>

                <p style="
                    color:var(--muted);
                    font-size:10px;
                    text-align:center;
                ">

                    Statistiques indisponibles
                    pour ce match.

                </p>

            </div>

        `;

    }

}


/* =====================================================
   NORMALIZE STATISTICS
===================================================== */

function normalizeStatistics(data) {

    let home = {};
    let away = {};


    if (
        Array.isArray(data)
    ) {

        if (data[0]) {

            home =
                data[0].statistics ||
                data[0].stats ||
                data[0];

        }


        if (data[1]) {

            away =
                data[1].statistics ||
                data[1].stats ||
                data[1];

        }

    }


    else if (
        data?.response
    ) {

        return normalizeStatistics(
            data.response
        );

    }


    else if (
        data?.statistics
    ) {

        return normalizeStatistics(
            data.statistics
        );

    }


    else {

        home =
            data?.home ||
            data?.team1 ||
            {};


        away =
            data?.away ||
            data?.team2 ||
            {};

    }


    return {
        home,
        away
    };

}


/* =====================================================
   GET STAT VALUE
===================================================== */

function statValue(
    object,
    names
) {

    if (!object) {

        return "-";

    }


    for (
        const name of names
    ) {

        if (
            object[name] !==
            undefined &&
            object[name] !== null
        ) {

            return object[name];

        }

    }


    return "-";

}


/* =====================================================
   NUMBER
===================================================== */

function numberValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    const number =
        parseFloat(
            String(value)
                .replace("%", "")
                .replace(",", ".")
        );


    return Number.isFinite(number)
        ? number
        : 0;

}


/* =====================================================
   STAT LABELS FRANÇAIS
===================================================== */

const STAT_LABELS = [

    {
        key: "shotsOnGoal",
        label: "Tirs cadrés",
        names: [
            "Shots on Goal",
            "shots_on_goal",
            "shotsOnGoal"
        ]
    },

    {
        key: "shotsOffGoal",
        label: "Tirs non cadrés",
        names: [
            "Shots off Goal",
            "shots_off_goal",
            "shotsOffGoal"
        ]
    },

    {
        key: "totalShots",
        label: "Tirs totaux",
        names: [
            "Total Shots",
            "total_shots",
            "totalShots"
        ]
    },

    {
        key: "blockedShots",
        label: "Tirs bloqués",
        names: [
            "Blocked Shots",
            "blocked_shots",
            "blockedShots"
        ]
    },

    {
        key: "shotsInside",
        label: "Tirs dans la surface",
        names: [
            "Shots insidebox",
            "shots_insidebox",
            "shotsInsidebox"
        ]
    },

    {
        key: "shotsOutside",
        label: "Tirs hors surface",
        names: [
            "Shots outsidebox",
            "shots_outsidebox",
            "shotsOutsidebox"
        ]
    },

    {
        key: "fouls",
        label: "Fautes",
        names: [
            "Fouls",
            "fouls"
        ]
    },

    {
        key: "corners",
        label: "Corners",
        names: [
            "Corner Kicks",
            "corner_kicks",
            "corners"
        ]
    },

    {
        key: "offsides",
        label: "Hors-jeu",
        names: [
            "Offsides",
            "offsides"
        ]
    },

    {
        key: "possession",
        label: "Possession",
        names: [
            "Ball Possession",
            "ball_possession",
            "possession"
        ]
    },

    {
        key: "yellowCards",
        label: "Cartons jaunes",
        names: [
            "Yellow Cards",
            "yellow_cards",
            "yellowCards"
        ]
    },

    {
        key: "redCards",
        label: "Cartons rouges",
        names: [
            "Red Cards",
            "red_cards",
            "redCards"
        ]
    },

    {
        key: "saves",
        label: "Arrêts du gardien",
        names: [
            "Goalkeeper Saves",
            "goalkeeper_saves",
            "goalkeeperSaves",
            "saves"
        ]
    },

    {
        key: "passes",
        label: "Passes",
        names: [
            "Total passes",
            "Total Passes",
            "total_passes",
            "passes"
        ]
    },

    {
        key: "accuratePasses",
        label: "Passes réussies",
        names: [
            "Passes accurate",
            "Passes Accurate",
            "passes_accurate",
            "accurate_passes"
        ]
    },

    {
        key: "passPercent",
        label: "Précision des passes",
        names: [
            "Passes %",
            "Passes%",
            "passes_percent",
            "pass_percent"
        ]
    },

    {
        key: "expectedGoals",
        label: "Buts attendus (xG)",
        names: [
            "expected_goals",
            "Expected Goals",
            "xG",
            "expectedGoals"
        ]
    },

    {
        key: "goalsPrevented",
        label: "Buts empêchés",
        names: [
            "goals_prevented",
            "Goals Prevented",
            "goalsPrevented"
        ]
    }

];


/* =====================================================
   RENDER STATISTICS
===================================================== */

function renderStatistics(
    data,
    match
) {

    const normalized =
        normalizeStatistics(
            data
        );


    const homeStats =
        normalized.home || {};


    const awayStats =
        normalized.away || {};


    const homeName =
        getName(
            match,
            "home"
        );


    const awayName =
        getName(
            match,
            "away"
        );


    let rows = "";


    STAT_LABELS.forEach(
        stat => {

            const home =
                statValue(
                    homeStats,
                    stat.names
                );


            const away =
                statValue(
                    awayStats,
                    stat.names
                );


            const homeNumber =
                numberValue(home);


            const awayNumber =
                numberValue(away);


            const total =
                homeNumber +
                awayNumber;


            let homePercent =
                50;


            let awayPercent =
                50;


            if (total > 0) {

                homePercent =
                    (
                        homeNumber /
                        total
                    ) * 100;


                awayPercent =
                    (
                        awayNumber /
                        total
                    ) * 100;

            }


            rows += `

                <div class="prezi-stat-row">

                    <div class="prezi-stat-values">

                        <strong>
                            ${safe(home)}
                        </strong>

                        <span>
                            ${safe(stat.label)}
                        </span>

                        <strong>
                            ${safe(away)}
                        </strong>

                    </div>


                    <div class="prezi-stat-bars">

                        <div class="prezi-bar home">

                            <div
                                class="prezi-fill"
                                style="
                                    width:${homePercent}%;
                                "
                            ></div>

                        </div>


                        <div class="prezi-bar away">

                            <div
                                class="prezi-fill"
                                style="
                                    width:${awayPercent}%;
                                "
                            ></div>

                        </div>

                    </div>

                </div>

            `;

        }
    );


    detailContent.innerHTML = `

        <div class="detail-panel prezi-statistics">

            <div class="panel-title">

                📊 Statistiques

            </div>


            <div class="prezi-stat-teams">

                <div>

                    ${safe(homeName)}

                </div>


                <span>
                    -
                </span>


                <div>

                    ${safe(awayName)}

                </div>

            </div>


            ${rows}

        </div>

    `;

}


/* =====================================================
   ÉVÉNEMENTS
===================================================== */

async function loadEvents() {

    const match =
        window.currentMatch;


    if (!match) return;


    detailContent.innerHTML = `

        <div class="detail-panel">

            <div class="detail-loading">
                📝 Chargement des événements...
            </div>

        </div>

    `;


    try {

        let events = [];


        if (
            typeof PreziAPI.getMatchEvents ===
            "function"
        ) {

            events =
                await PreziAPI.getMatchEvents(
                    match.id
                );

        }


        renderEvents(
            events,
            match
        );

    }

    catch (error) {

        console.error(
            "❌ Événements:",
            error
        );


        renderEvents(
            [],
            match
        );

    }

}


/* =====================================================
   RENDER EVENTS
===================================================== */

function renderEvents(
    events,
    match
) {

    if (
        !Array.isArray(events) ||
        !events.length
    ) {

        detailContent.innerHTML = `

            <div class="detail-panel">

                <div class="panel-title">
                    📝 Événements
                </div>

                <p style="
                    color:var(--muted);
                    font-size:10px;
                    text-align:center;
                ">

                    Aucun événement disponible.

                </p>

            </div>

        `;

        return;

    }


    let html = "";


    events.forEach(
        event => {

            const minute =
                event?.time?.elapsed ??
                event?.minute ??
                event?.time ??
                "-";


            const player =
                event?.player?.name ||
                event?.player_name ||
                event?.player ||
                "Joueur";


            const type =
                String(
                    event?.type ||
                    event?.detail ||
                    event?.event ||
                    ""
                )
                .toLowerCase();


            let icon =
                "⚽";


            let label =
                "Événement";


            if (
                type.includes("goal")
            ) {

                icon = "⚽";

                label = "But";

            }


            else if (
                type.includes("yellow")
            ) {

                icon = "🟨";

                label =
                    "Carton jaune";

            }


            else if (
                type.includes("red")
            ) {

                icon = "🟥";

                label =
                    "Carton rouge";

            }


            else if (
                type.includes("subst")
            ) {

                icon = "🔄";

                label =
                    "Remplacement";

            }


            html += `

                <div class="event-row">

                    <div class="event-time">

                        ${safe(minute)}'

                    </div>


                    <div class="event-center">

                        ${icon}
                        ${safe(label)}

                        <div class="event-team">

                            ${safe(player)}

                        </div>

                    </div>


                    <div></div>

                </div>

            `;

        }
    );


    detailContent.innerHTML = `

        <div class="detail-panel">

            <div class="panel-title">
                📝 Événements
            </div>

            ${html}

        </div>

    `;

            }
