console.log("PREZISCORE SCRIPT OK");
console.log("PreziAPI =", window.PreziAPI);

<script>

/* =====================================================
   PREZISCORE — MATCH ENGINE
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


let allMatches = [];

let currentFilter = "live";


/* =====================================================
   LOAD MATCHES FROM API
===================================================== */

async function loadMatches() {

    loading.style.display = "block";

    noMatches.classList.remove("show");

    matchesContainer.innerHTML = "";

    matchesContainer.appendChild(
        loading
    );


    try {

        const matches =
            await PreziAPI.getNormalizedMatches();


        allMatches = matches || [];


        renderMatches();


    } catch (error) {

        console.error(
            "PreziScore:",
            error
        );


        loading.style.display = "none";

        matchesContainer.innerHTML = "";


        showEmpty(
            "⚠️",
            "Impossible de charger les matchs",
            "Vérifiez votre connexion internet."
        );

    }

}


/* =====================================================
   FILTER MATCHES
===================================================== */

function getFilteredMatches() {

    let result = allMatches.filter(
        match => {

            if (
                currentFilter === "live"
            ) {

                return (
                    match.status === "live"
                );

            }


            if (
                currentFilter === "finished"
            ) {

                return (
                    match.status === "finished"
                );

            }


            if (
                currentFilter === "upcoming"
            ) {

                return (
                    match.status === "upcoming"
                );

            }


            return true;

        }
    );


    /* =========================
       SEARCH
    ========================= */

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (query) {

        result =
            result.filter(match => {

                const home =
                    match.home.name
                        .toLowerCase();

                const away =
                    match.away.name
                        .toLowerCase();

                const competition =
                    match.competition
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

    loading.style.display = "none";

    matchesContainer.innerHTML = "";

    const matches =
        getFilteredMatches();


    matchCount.textContent =
        `${matches.length} match${matches.length > 1 ? "s" : ""}`;


    if (!matches.length) {

        showEmpty(
            currentFilter === "live"
                ? "🔴"
                : currentFilter === "finished"
                    ? "✅"
                    : "📅",

            currentFilter === "live"
                ? "Aucun match en direct"
                : currentFilter === "finished"
                    ? "Aucun match terminé"
                    : "Aucun match à venir",

            currentFilter === "live"
                ? "Les matchs en cours apparaîtront ici automatiquement."
                : "Nous n'avons trouvé aucun match pour cette période."
        );

        return;

    }


    noMatches.classList.remove("show");


    /* =========================
       GROUP BY COMPETITION
    ========================= */

    const groups = {};


    matches.forEach(match => {

        const competition =
            match.competition ||
            "Football";


        if (!groups[competition]) {

            groups[competition] = [];

        }


        groups[competition].push(
            match
        );

    });


    Object.entries(groups)
        .forEach(
            ([competition, competitionMatches]) => {

                const section =
                    document.createElement("section");

                section.className =
                    "competition";


                /* =========================
                   COMPETITION HEADER
                ========================= */

                const header =
                    document.createElement("div");

                header.className =
                    "competition-head";


                header.innerHTML = `

                    <div class="competition-icon">
                        🏆
                    </div>

                    <span>
                        ${escapeHTML(competition)}
                    </span>

                `;


                section.appendChild(
                    header
                );


                /* =========================
                   MATCHES
                ========================= */

                competitionMatches
                    .forEach(match => {

                        section.appendChild(
                            createMatchCard(match)
                        );

                    });


                matchesContainer.appendChild(
                    section
                );

            }
        );

}


/* =====================================================
   MATCH CARD
===================================================== */

function createMatchCard(match) {

    const article =
        document.createElement("article");

    article.className =
        "match-item";


    /* =========================
       STATUS
    ========================= */

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


    /* =========================
       SCORE
    ========================= */

    const homeScore =
        match.home.score ??
        "-";


    const awayScore =
        match.away.score ??
        "-";


    /* =========================
       CARD
    ========================= */

    article.innerHTML = `

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
                        match.home.logo
                            ? `<img
                                src="${escapeAttribute(match.home.logo)}"
                                alt=""
                                style="
                                    width:32px;
                                    height:32px;
                                    object-fit:contain;
                                "
                              >`
                            : "⚽"
                    }

                </div>


                <div class="club-name">

                    ${escapeHTML(
                        match.home.name
                    )}

                </div>

            </div>


            <!-- SCORE -->

            <div class="score">

                ${homeScore}

                <span style="margin:0 3px;">
                    -
                </span>

                ${awayScore}


                <small>

                    ${
                        match.status === "live"
                            ? "En direct"
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
                        match.away.logo
                            ? `<img
                                src="${escapeAttribute(match.away.logo)}"
                                alt=""
                                style="
                                    width:32px;
                                    height:32px;
                                    object-fit:contain;
                                "
                              >`
                            : "⚽"
                    }

                </div>


                <div class="club-name">

                    ${escapeHTML(
                        match.away.name
                    )}

                </div>

            </div>

        </div>

    `;


    /* =========================
       CLICK
    ========================= */

    article.addEventListener(
        "click",
        () => {

            if (match.slug) {

                openMatch(
                    match.slug
                );

            }

        }
    );


    return article;

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


    if (
        match.raw?.start_time
    ) {

        try {

            return new Date(
                match.raw.start_time
            ).toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        } catch {

            return "--:--";

        }

    }


    return "--:--";

}


/* =====================================================
   OPEN MATCH
===================================================== */

function openMatch(slug) {

    window.location.href =
        `match-details.html?match=${encodeURIComponent(slug)}`;

}


/* =====================================================
   EMPTY STATE
===================================================== */

function showEmpty(
    icon,
    title,
    text
) {

    loading.style.display =
        "none";


    noMatches.innerHTML = `

        <div>
            ${icon}
        </div>

        <h3>
            ${title}
        </h3>

        <p>
            ${text}
        </p>

    `;


    noMatches.classList.add(
        "show"
    );

}


/* =====================================================
   SEARCH
===================================================== */

searchInput.addEventListener(
    "input",
    () => {

        renderMatches();

    }
);


/* =====================================================
   TABS
===================================================== */

document
    .querySelectorAll(".match-tab")
    .forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".match-tab"
                    )
                    .forEach(item => {

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

function focusSearch() {

    searchInput.focus();

}


/* =====================================================
   SECURITY
===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

}


/* =====================================================
   AUTO REFRESH
===================================================== */

PreziLive.start(
    loadMatches,
    60
);


/* =====================================================
   FIRST LOAD
===================================================== */

loadMatches();

</script>
