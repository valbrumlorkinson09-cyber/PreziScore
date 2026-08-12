"use strict";

/* =========================================================
   PREZISCORE — MATCH DETAILS
   PARTIE 1/2
   MATCH + HEADER + RESUME + STATISTIQUES
========================================================= */

console.log("⚽ PREZISCORE MATCH DETAILS OK");


/* =========================================================
   ELEMENTS
========================================================= */

const matchHeader =
    document.getElementById("matchHeader");

const detailContent =
    document.getElementById("detailContent");

const tabs =
    document.querySelectorAll(".detail-tab");


/* =========================================================
   MATCH ID
   IMPORTANT:
   Nou aksepte ?id= ET ?match=
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const matchId =
    params.get("id") ||
    params.get("match") ||
    params.get("fixture") ||
    params.get("fixture_id");


console.log(
    "⚽ PREZISCORE MATCH ID:",
    matchId
);


/* =========================================================
   SAFE HTML
========================================================= */

function safe(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,
            function(char) {

                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                }[char];

            }
        );

}


/* =========================================================
   STATUS
========================================================= */

function getStatus(match) {

    return String(
        match?.status ||
        ""
    )
    .toLowerCase()
    .trim();

}


function getMinute(match) {

    return (
        match?.minute ??
        match?.elapsed ??
        match?.raw?.fixture?.status?.elapsed ??
        null
    );

}


function getStatusText(match) {

    const status =
        getStatus(match);

    const minute =
        getMinute(match);


    if (
        status === "live" ||
        status.includes("live") ||
        status.includes("progress")
    ) {

        return minute !== null
            ? `🔴 LIVE • ${minute}'`
            : "🔴 LIVE";

    }


    if (
        status === "finished" ||
        status.includes("finished") ||
        status.includes("ended")
    ) {

        return "TERMINÉ";

    }


    return "À VENIR";

}


/* =========================================================
   TEAM
========================================================= */

function getTeam(match, side) {

    return (
        match?.[side] ||
        {}
    );

}


function getTeamName(match, side) {

    const team =
        getTeam(match, side);

    return (
        team?.name ||
        "Équipe"
    );

}


function getTeamLogo(match, side) {

    const team =
        getTeam(match, side);

    return (
        team?.logo ||
        ""
    );

}


function getTeamScore(match, side) {

    const team =
        getTeam(match, side);

    const score =
        team?.score;

    return (
        score === null ||
        score === undefined
    )
        ? "-"
        : score;

}


/* =========================================================
   COMPETITION
========================================================= */

function getCompetition(match) {

    let value =
        match?.competition;


    if (
        typeof value === "object"
    ) {

        value =
            value?.name ||
            value?.title;

    }


    return (
        value ||
        "Football"
    );

}


/* =========================================================
   DATE
========================================================= */

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


/* =========================================================
   ERROR
========================================================= */

function showError(
    title,
    message
) {

    if (matchHeader) {

        matchHeader.innerHTML = `

            <div class="detail-error">

                <div>⚠️</div>

                <h3>
                    ${safe(title)}
                </h3>

                <p>
                    ${safe(message)}
                </p>

            </div>

        `;

    }


    if (detailContent) {

        detailContent.innerHTML = "";

    }

}


/* =========================================================
   LOAD MATCH
========================================================= */

async function loadMatch() {

    /* -----------------------------------------------
       CHECK ID
    ----------------------------------------------- */

    if (!matchId) {

        showError(
            "Match introuvable",
            "Aucun identifiant de match n'a été fourni."
        );

        return;

    }


    /* -----------------------------------------------
       CHECK API
    ----------------------------------------------- */

    if (
        !window.PreziAPI
    ) {

        showError(
            "API indisponible",
            "api.js ne s'est pas chargé."
        );

        return;

    }


    try {

        let match = null;


        /* -------------------------------------------
           METHOD 1 — getMatchById
        ------------------------------------------- */

        if (
            typeof PreziAPI.getMatchById ===
            "function"
        ) {

            match =
                await PreziAPI.getMatchById(
                    matchId
                );

        }


        /* -------------------------------------------
           METHOD 2 — fallback
        ------------------------------------------- */

        if (
            !match &&
            typeof PreziAPI.getNormalizedMatches ===
            "function"
        ) {

            const matches =
                await PreziAPI
                    .getNormalizedMatches();


            if (
                Array.isArray(matches)
            ) {

                match =
                    matches.find(
                        item =>
                            String(
                                item?.id
                            ) ===
                            String(matchId)
                    );

            }

        }


        /* -------------------------------------------
           NO MATCH
        ------------------------------------------- */

        if (!match) {

            showError(
                "Match introuvable",
                "Impossible de trouver ce match."
            );

            return;

        }


        /* -------------------------------------------
           SAVE
        ------------------------------------------- */

        window.currentMatch =
            match;


        console.log(
            "✅ MATCH:",
            match
        );


        /* -------------------------------------------
           DISPLAY
        ------------------------------------------- */

        renderMatchHeader(
            match
        );


        renderSummary(
            match
        );

    }


    catch(error) {

        console.error(
            "❌ MATCH DETAILS ERROR:",
            error
        );


        showError(
            "Erreur de chargement",
            "Impossible de charger les informations du match."
        );

    }

}


/* =========================================================
   RENDER MATCH HEADER
========================================================= */

function renderMatchHeader(match) {

    if (!matchHeader) return;


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


    const status =
        getStatus(match);


    const statusText =
        getStatusText(match);


    const minute =
        getMinute(match);


    const competition =
        getCompetition(match);


    matchHeader.innerHTML = `

        <div class="detail-competition">

            🏆 ${safe(competition)}

        </div>


        <div class="
            detail-status
            ${safe(status)}
        ">

            ${safe(statusText)}

        </div>


        <div class="detail-teams">


            <!-- HOME -->

            <div class="detail-team">

                <div class="detail-logo">

                    ${
                        homeLogo
                        ?
                        `
                            <img
                                src="${safe(homeLogo)}"
                                alt="${safe(home)}"
                            >
                        `
                        :
                        `
                            ⚽
                        `
                    }

                </div>


                <div class="detail-team-name">

                    ${safe(home)}

                </div>

            </div>


            <!-- SCORE -->

            <div class="detail-score">

                ${safe(homeScore)}

                :

                ${safe(awayScore)}


                <small>

                    ${
                        status === "live"
                        ?
                        `${safe(minute ?? "")}'`
                        :
                        status === "finished"
                        ?
                        "FT"
                        :
                        "À venir"
                    }

                </small>

            </div>


            <!-- AWAY -->

            <div class="detail-team">

                <div class="detail-logo">

                    ${
                        awayLogo
                        ?
                        `
                            <img
                                src="${safe(awayLogo)}"
                                alt="${safe(away)}"
                            >
                        `
                        :
                        `
                            ⚽
                        `
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
                        match.raw?.fixture?.venue?.name ||
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
                        match.raw?.fixture?.referee ||
                        "—"
                    )}

                </strong>

            </div>


        </div>

    `;

}


/* =========================================================
   RESUME
========================================================= */

function renderSummary(match) {

    if (!detailContent) return;


    const status =
        getStatus(match);


    let message =
        "Le match n'a pas encore commencé.";


    if (
        status === "live"
    ) {

        message =
            "Le match est actuellement en direct. Les informations sont mises à jour automatiquement.";

    }


    if (
        status === "finished"
    ) {

        message =
            "Ce match est terminé. Consultez les statistiques et les événements.";

    }


    detailContent.innerHTML = `

        <div class="detail-panel">

            <div class="panel-title">

                📋 Résumé du match

            </div>


            <p style="
                color:var(--muted);
                font-size:10px;
                line-height:1.7;
            ">

                ${safe(message)}

            </p>

        </div>

    `;

}


/* =========================================================
   TABS
========================================================= */

tabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            async function() {

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


                if (
                    !window.currentMatch
                ) {

                    return;

                }


                const type =
                    tab.dataset.tab;


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

                    await loadStatistics();

                }


                if (
                    type === "events"
                ) {

                    await loadEvents();

                }

            }
        );

    }
);


/* =========================================================
   START
========================================================= */

loadMatch();
