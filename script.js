"use strict";

/* =====================================================
   PREZISCORE — SCRIPT.JS
===================================================== */

console.log("⚽ PreziScore script loaded");


/* =====================================================
   ELEMENTS
===================================================== */

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


let allMatches = [];

let currentFilter = "live";


/* =====================================================
   LOAD MATCHES
===================================================== */

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
            "❌ PreziAPI pa jwenn. Verifye api.js."
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
            "❌ getNormalizedMatches() pa egziste."
        );

        showEmpty(
            "⚠️",
            "API pa pare",
            "Fonksyon API a pa disponib."
        );

        return;

    }


    loading.style.display = "block";

    noMatches.classList.remove("show");


    try {

        const data =
            await PreziAPI.getNormalizedMatches();


        console.log(
            "📦 API DATA:",
            data
        );


        allMatches =
            Array.isArray(data)
                ? data
                : [];


        renderMatches();


    } catch (error) {

        console.error(
            "❌ PREZISCORE API ERROR:",
            error
        );


        loading.style.display = "none";


        showEmpty(
            "⚠️",
            "Erreur de connexion",
            "Impossible de charger les matchs."
        );

    }

}


/* =====================================================
   FILTER MATCHES
===================================================== */

function getFilteredMatches() {

    let result =
        allMatches.filter(match => {


            /* LIVE */

            if (
                currentFilter === "live"
            ) {

                return (
                    match.status === "live"
                );

            }


            /* UPCOMING */

            if (
                currentFilter === "upcoming"
            ) {

                return (
                    match.status === "upcoming"
                );

            }


            /* FINISHED */

            if (
                currentFilter === "finished"
            ) {

                return (
                    match.status === "finished"
                );

            }


            return true;

        });


    /* =================================================
       SEARCH
    ================================================= */

    const query =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    if (query) {

        result =
            result.filter(match => {


                const home =
                    String(
                        match.home?.name || ""
                    )
                    .toLowerCase();


                const away =
                    String(
                        match.away?.name || ""
                    )
                    .toLowerCase();


                const competition =
                    String(
                        match.competition || ""
                    )
                    .toLowerCase();


                return (

                    home.includes(query) ||

                    away.includes(query) ||

                    competition.includes(query)

                );

            });

    }


    return result;

}


/* =====================================================
   RENDER
===================================================== */

function renderMatches() {

    if (!matchesContainer) {
        return;
    }


    loading.style.display =
        "none";


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


    /* =================================================
       NO MATCHES
    ================================================= */

    if (!matches.length) {

        showEmpty(
            getEmptyIcon(),

            getEmptyTitle(),

            getEmptyText()

        );

        return;

    }


    noMatches.classList.remove(
        "show"
    );


    /* =================================================
       GROUP BY COMPETITION
    ================================================= */

    const competitions = {};


    matches.forEach(match => {

        const name =
            match.competition ||
            "Football";


        if (!competitions[name]) {

            competitions[name] = [];

        }


        competitions[name].push(
            match
        );

    });


    /* =================================================
       CREATE SECTIONS
    ================================================= */

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
                    ${escapeHTML(
                        competition
                    )}
                </span>

            `;


            section.appendChild(
                header
            );


            /* MATCHES */

            games.forEach(match => {

                const card =
                    createMatchCard(
                        match
                    );


                section.appendChild(
                    card
                );

            });


            matchesContainer.appendChild(
                section
            );

        }
    );

}


/* =====================================================
   CREATE MATCH CARD
===================================================== */

function createMatchCard(match) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "match-item";


    /* =================================================
       STATUS
    ================================================= */

    let statusText =
        "À VENIR";


    let statusClass =
        "upcoming";


    if (
        match.status === "live"
    ) {

        statusText =
            match.minute
                ? `LIVE • ${match.minute}'`
                : "LIVE";


        statusClass =
            "live";

    }


    else if (
        match.status === "finished"
    ) {

        statusText =
            "TERMINÉ";


        statusClass =
            "finished";

    }


    /* =================================================
       TEAMS
    ================================================= */

    const homeName =
        match.home?.name ||
        "Équipe";


    const awayName =
        match.away?.name ||
        "Équipe";


    const homeLogo =
        match.home?.logo ||
        "";


    const awayLogo =
        match.away?.logo ||
        "";


    /* =================================================
       SCORE
    ================================================= */

    const homeScore =
        match.home?.score ??
        "-";


    const awayScore =
        match.away?.score ??
        "-";


    /* =================================================
       CARD HTML
    ================================================= */

    card.innerHTML = `

        <div class="match-top">

            <div class="status ${statusClass}">

                <span class="status-dot"></span>

                ${statusText}

            </div>


            <div class="match-time">

                ${formatMatchTime(match)}

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
                                src="${escapeAttribute(
                                    homeLogo
                                )}"
                                alt=""
                            >

                          `

                        : "⚽"

                    }

                </div>


                <div class="club-name">

                    ${escapeHTML(
                        homeName
                    )}

                </div>


            </div>



            <!-- SCORE -->

            <div class="score">

                ${homeScore}

                <span>
                    -
                </span>

                ${awayScore}


                <small>

                    ${
                        match.status === "live"

                            ? "LIVE"

                            : match.status === "finished"

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
                                src="${escapeAttribute(
                                    awayLogo
                                )}"
                                alt=""
                            >

                          `

                        : "⚽"

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


    /* =================================================
       OPEN MATCH
    ================================================= */

    if (match.slug) {

        card.style.cursor =
            "pointer";


        card.addEventListener(
            "click",
            () => {

                window.location.href =
                    "match-details.html?match=" +
                    encodeURIComponent(
                        match.slug
                    );

            }
        );

    }


    return card;

}


/* =====================================================
   MATCH TIME
===================================================== */

function formatMatchTime(match) {

    if (
        match.status === "live"
    ) {

        return "En cours";

    }


    if (
        match.status === "finished"
    ) {

        return "Terminé";

    }


    const date =
        match.raw?.start_time ||
        match.raw?.startTime ||
        match.raw?.date ||
        match.start_time;


    if (!date) {

        return "--:--";

    }


    try {

        return new Date(
            date
        )
        .toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }

    catch (error) {

        return "--:--";

    }

}


/* =====================================================
   EMPTY STATE
===================================================== */

function showEmpty(
    icon,
    title,
    text
) {

    if (loading) {

        loading.style.display =
            "none";

    }


    if (!noMatches) {

        return;

    }


    noMatches.innerHTML = `

        <div>
            ${icon}
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


/* =====================================================
   EMPTY TEXT
===================================================== */

function getEmptyIcon() {

    if (
        currentFilter === "live"
    ) {

        return "🔴";

    }


    if (
        currentFilter === "finished"
    ) {

        return "✅";

    }


    return "📅";

}


function getEmptyTitle() {

    if (
        currentFilter === "live"
    ) {

        return "Aucun match en direct";

    }


    if (
        currentFilter === "finished"
    ) {

        return "Aucun match terminé";

    }


    return "Aucun match à venir";

}


function getEmptyText() {

    if (
        currentFilter === "live"
    ) {

        return "Les matchs en cours apparaîtront ici automatiquement.";

    }


    if (
        currentFilter === "finished"
    ) {

        return "Les résultats terminés apparaîtront ici.";

    }


    return "Les prochains matchs apparaîtront ici.";

}


/* =====================================================
   SEARCH
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            renderMatches();

        }
    );

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


            currentFilter =
                tab.dataset.filter;


            renderMatches();

        }
    );

});


/* =====================================================
   SEARCH BUTTON
===================================================== */

window.focusSearch =
    function () {

        if (searchInput) {

            searchInput.focus();

        }

    };


/* =====================================================
   SECURITY
===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )

    .replaceAll(
        "&",
        "&amp;"
    )

    .replaceAll(
        "<",
        "&lt;"
    )

    .replaceAll(
        ">",
        "&gt;"
    )

    .replaceAll(
        '"',
        "&quot;"
    )

    .replaceAll(
        "'",
        "&#039;"
    );

}


function escapeAttribute(value) {

    return String(
        value ?? ""
    )

    .replaceAll(
        "&",
        "&amp;"
    )

    .replaceAll(
        '"',
        "&quot;"
    )

    .replaceAll(
        "<",
        "&lt;"
    )

    .replaceAll(
        ">",
        "&gt;"
    );

}


/* =====================================================
   START
===================================================== */

loadMatches();


/* =====================================================
   AUTO REFRESH
===================================================== */

if (
    typeof PreziLive !== "undefined" &&
    typeof PreziLive.start === "function"
) {

    PreziLive.start(
        loadMatches,
        60
    );

       }
