// ======================================================
// ⚽ PREZISCORE — SCRIPT.JS
// PATI 1/2
// HOME • MATCHS • NAVIGATION • LIVE
// ======================================================

console.log("⚽ PreziScore Script loading...");


// ======================================================
// 🧩 HELPER
// ======================================================

function $(id) {
    return document.getElementById(id);
}


// ======================================================
// 📱 BOTTOM NAVIGATION
// ======================================================

function setActiveMenu() {

    const path =
        window.location.pathname.toLowerCase();

    const menu =
        document.querySelectorAll(".bottom-nav a");

    menu.forEach(link => {

        link.classList.remove("active");

        const href =
            (link.getAttribute("href") || "")
            .toLowerCase();

        if (
            href &&
            path.includes(
                href.replace(".html", "")
            )
        ) {
            link.classList.add("active");
        }

    });

}


// ======================================================
// 🏠 HOME — LIVE
// ======================================================

async function initHomeLive() {

    const box =
        $("homeLiveMatches");

    if (!box) return;

    if (
        typeof loadLiveMatches ===
        "function"
    ) {

        await loadLiveMatches(
            "homeLiveMatches"
        );

    }

}


// ======================================================
// 🏠 HOME — UPCOMING
// ======================================================

async function initHomeUpcoming() {

    const box =
        $("homeUpcomingMatches");

    if (!box) return;

    if (
        typeof loadUpcomingMatches ===
        "function"
    ) {

        await loadUpcomingMatches(
            "homeUpcomingMatches"
        );

    }

}


// ======================================================
// ⚽ MATCHES PAGE
// ======================================================

async function initMatchesPage() {

    const live =
        $("liveMatches");

    const finished =
        $("finishedMatches");

    const upcoming =
        $("upcomingMatches");


    if (
        live &&
        typeof loadLiveMatches ===
        "function"
    ) {

        await loadLiveMatches(
            "liveMatches"
        );

    }


    if (
        finished &&
        typeof loadFinishedMatches ===
        "function"
    ) {

        await loadFinishedMatches(
            "finishedMatches"
        );

    }


    if (
        upcoming &&
        typeof loadUpcomingMatches ===
        "function"
    ) {

        await loadUpcomingMatches(
            "upcomingMatches"
        );

    }

}


// ======================================================
// 🏆 COMPETITIONS
// ======================================================

async function initCompetitions() {

    const competitions = [

        [39, "premierLeague"],

        [140, "laLiga"],

        [61, "ligue1"],

        [135, "serieA"],

        [78, "bundesliga"],

        [2, "championsLeague"]

    ];


    if (
        typeof loadStandings !==
        "function"
    ) {

        return;

    }


    for (
        const [leagueId, elementId]
        of competitions
    ) {

        const box =
            $(elementId);

        if (!box) continue;


        try {

            await loadStandings(
                leagueId,
                elementId
            );

        }

        catch (error) {

            console.error(
                "Erreur classement:",
                leagueId,
                error
            );

        }

    }

}


// ======================================================
// 🚀 INITIALISATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "🚀 PreziScore DOM ready"
        );


        setActiveMenu();


        await initHomeLive();

        await initHomeUpcoming();

        await initMatchesPage();

        await initCompetitions();


        console.log(
            "✅ PreziScore initialized"
        );

    }
);


// ======================================================
// 🔄 ACTIVE MENU APRÈS NAVIGATION
// ======================================================

window.addEventListener(
    "pageshow",
    () => {

        setActiveMenu();

    }
);


// ======================================================
// ⚽ SCRIPT PART 1 READY
// ======================================================

console.log(
    "⚽ PreziScore Script — PART 1/2 loaded"

);

// ======================================================
// ⚽ PREZISCORE — SCRIPT.JS
// PATI 2/2
// MENU • NAVIGATION • MATCH CENTER • AUTO REFRESH
// ======================================================


// ======================================================
// 📱 BOTTOM MENU
// ======================================================

function initBottomMenu() {

    const menu =
        document.querySelector(".bottom-menu");

    if (!menu) return;


    const links =
        menu.querySelectorAll("a");


    links.forEach(link => {

        link.addEventListener("click", () => {

            links.forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");

        });

    });

}


// ======================================================
// 🔍 SEARCH
// ======================================================

function initSearch() {

    const input =
        document.querySelector("#searchInput");

    if (!input) return;


    input.addEventListener(
        "input",
        function () {

            const value =
                this.value
                    .toLowerCase()
                    .trim();


            const cards =
                document.querySelectorAll(
                    ".match-card"
                );


            cards.forEach(card => {

                const text =
                    card.textContent
                        .toLowerCase();


                if (
                    !value ||
                    text.includes(value)
                ) {

                    card.style.display = "";

                } else {

                    card.style.display = "none";

                }

            });

        }
    );

}


// ======================================================
// 🏠 HOME
// ======================================================

function initHome() {

    const live =
        document.getElementById(
            "homeLiveMatches"
        );


    const upcoming =
        document.getElementById(
            "homeUpcomingMatches"
        );


    if (
        live &&
        typeof loadLiveMatches === "function"
    ) {

        loadLiveMatches(
            "homeLiveMatches"
        );

    }


    if (
        upcoming &&
        typeof loadUpcomingMatches === "function"
    ) {

        loadUpcomingMatches(
            "homeUpcomingMatches"
        );

    }

}


// ======================================================
// ⚽ MATCHES PAGE
// ======================================================

function initMatchesPage() {

    const live =
        document.getElementById(
            "liveMatches"
        );


    const finished =
        document.getElementById(
            "finishedMatches"
        );


    const upcoming =
        document.getElementById(
            "upcomingMatches"
        );


    if (
        live &&
        typeof loadLiveMatches === "function"
    ) {

        loadLiveMatches(
            "liveMatches"
        );

    }


    if (
        finished &&
        typeof loadFinishedMatches === "function"
    ) {

        loadFinishedMatches(
            "finishedMatches"
        );

    }


    if (
        upcoming &&
        typeof loadUpcomingMatches === "function"
    ) {

        loadUpcomingMatches(
            "upcomingMatches"
        );

    }

}


// ======================================================
// 🏆 COMPETITIONS
// ======================================================

function initCompetitions() {

    const competitions = [

        {
            id: "premierLeague",
            league: 39
        },

        {
            id: "laLiga",
            league: 140
        },

        {
            id: "ligue1",
            league: 61
        },

        {
            id: "serieA",
            league: 135
        },

        {
            id: "bundesliga",
            league: 78
        },

        {
            id: "championsLeague",
            league: 2
        }

    ];


    competitions.forEach(item => {

        const box =
            document.getElementById(
                item.id
            );


        if (
            box &&
            typeof loadStandings === "function"
        ) {

            loadStandings(
                item.league,
                item.id
            );

        }

    });

}


// ======================================================
// 🔄 LIVE AUTO REFRESH
// ======================================================

let liveRefreshTimer = null;


function startLiveRefresh() {

    if (liveRefreshTimer) {

        clearInterval(
            liveRefreshTimer
        );

    }


    liveRefreshTimer =
        setInterval(
            () => {

                const live =
                    document.getElementById(
                        "liveMatches"
                    );


                const homeLive =
                    document.getElementById(
                        "homeLiveMatches"
                    );


                if (
                    live &&
                    typeof loadLiveMatches ===
                    "function"
                ) {

                    loadLiveMatches(
                        "liveMatches"
                    );

                }


                if (
                    homeLive &&
                    typeof loadLiveMatches ===
                    "function"
                ) {

                    loadLiveMatches(
                        "homeLiveMatches"
                    );

                }

            },
            30000
        );

}


// ======================================================
// 📄 PAGE DETECTION
// ======================================================

function detectPage() {

    const page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    console.log(
        "📄 PreziScore page:",
        page
    );


    if (
        page === "" ||
        page === "index.html"
    ) {

        initHome();

    }


    if (
        page === "matches.html"
    ) {

        initMatchesPage();

    }


    if (
        page === "competitions.html"
    ) {

        initCompetitions();

    }

}


// ======================================================
// 🚀 START PREZISCORE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "⚽ PreziScore démarre..."
        );


        initBottomMenu();

        initSearch();

        detectPage();

        startLiveRefresh();


        console.log(
            "✅ PreziScore prêt!"
        );

    }
);


// ======================================================
// 🔥 GLOBAL MATCH OPEN
// ======================================================

window.openMatch =
    function (slug) {

        if (!slug) return;


        window.location.href =
            "match-details.html?slug=" +
            encodeURIComponent(slug);

    };


// ======================================================
// ⚽ PREZISCORE READY
// ======================================================

console.log(
    "🔥 SCRIPT PART 2/2 CHARGÉ"
);

console.log(
    "🏠 Home"
);

console.log(
    "⚽ Matches"
);

console.log(
    "🏆 Competitions"
);

console.log(
    "📱 Bottom Menu"
);

console.log(
    "🔄 Live Refresh 30s"
);

