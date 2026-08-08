// ======================================
// ⚽ PREZISCORE
// MAIN JAVASCRIPT
// ======================================

console.log("⚽ PreziScore is running!");


// ======================================
// HERO BUTTON
// ======================================

const exploreBtn =
    document.querySelector(".hero .btn");

if (exploreBtn) {

    exploreBtn.addEventListener(
        "click",
        () => {

            console.log(
                "Opening matches page..."
            );

        }
    );

}


// ======================================
// FOOTER YEAR
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const year =
            new Date().getFullYear();

        const footerTexts =
            document.querySelectorAll(
                "footer p"
            );

        footerTexts.forEach(
            footerText => {

                if (
                    footerText.textContent.includes("©")
                ) {

                    footerText.innerHTML =
                        `© ${year} PreziScore - Tous droits réservés.`;

                }

            }
        );

    }
);


// ======================================
// MENU
// ======================================

const links =
    document.querySelectorAll(
        "nav a"
    );

links.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                console.log(
                    "Opening:",
                    link.innerText.trim()
                );

            }
        );

    }
);


// ======================================
// API / PAGES
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        // ==================================
        // 🏠 HOME PAGE — LIVE
        // ==================================

        const homeLive =
            document.getElementById(
                "homeLiveMatches"
            );


        if (
            homeLive &&
            typeof loadLiveMatches === "function"
        ) {

            loadLiveMatches(
                "homeLiveMatches"
            );

        }


        // ==================================
        // 🏠 HOME PAGE — UPCOMING
        // ==================================

        const homeUpcoming =
            document.getElementById(
                "homeUpcomingMatches"
            );


        if (
            homeUpcoming &&
            typeof loadUpcomingMatches === "function"
        ) {

            loadUpcomingMatches(
                "homeUpcomingMatches"
            );

        }


        // ==================================
        // ⚽ MATCHES PAGE — LIVE
        // ==================================

        const liveMatches =
            document.getElementById(
                "liveMatches"
            );


        if (
            liveMatches &&
            typeof loadLiveMatches === "function"
        ) {

            loadLiveMatches(
                "liveMatches"
            );

        }


        // ==================================
        // ✅ MATCHES PAGE — TERMINÉS
        // ==================================

        const finishedMatches =
            document.getElementById(
                "finishedMatches"
            );


        if (
            finishedMatches &&
            typeof loadFinishedMatches === "function"
        ) {

            loadFinishedMatches(
                "finishedMatches"
            );

        }


        // ==================================
        // 📅 MATCHES PAGE — À VENIR
        // ==================================

        const upcomingMatches =
            document.getElementById(
                "upcomingMatches"
            );


        if (
            upcomingMatches &&
            typeof loadUpcomingMatches === "function"
        ) {

            loadUpcomingMatches(
                "upcomingMatches"
            );

        }


        // ==================================
        // 🏆 COMPETITIONS
        // ==================================

        if (
            document.getElementById(
                "premierLeague"
            ) &&
            typeof loadStandings === "function"
        ) {

            loadStandings(
                39,
                "premierLeague"
            );

        }


        if (
            document.getElementById(
                "laLiga"
            ) &&
            typeof loadStandings === "function"
        ) {

            loadStandings(
                140,
                "laLiga"
            );

        }


        if (
            document.getElementById(
                "ligue1"
            ) &&
            typeof loadStandings === "function"
        ) {

            loadStandings(
                61,
                "ligue1"
            );

        }


        if (
            document.getElementById(
                "serieA"
            ) &&
            typeof loadStandings === "function"
        ) {

            loadStandings(
                135,
                "serieA"
            );

        }


        if (
            document.getElementById(
                "bundesliga"
            ) &&
            typeof loadStandings === "function"
        ) {

            loadStandings(
                78,
                "bundesliga"
            );

        }


        if (
            document.getElementById(
                "championsLeague"
            ) &&
            typeof loadStandings === "function"
        ) {

            loadStandings(
                2,
                "championsLeague"
            );

        }

    }
);


// ======================================
// 🚀 PREZISCORE READY
// ======================================

console.log(
    "🚀 PreziScore JavaScript loaded successfully!"
);

console.log(
    "🔴 Live | ✅ Terminé | 📅 À venir"
);
