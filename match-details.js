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
