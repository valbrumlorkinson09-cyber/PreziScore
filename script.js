/* ======================================
   ⚽ PREZISCORE
   MAIN JAVASCRIPT
====================================== */


console.log("⚽ PreziScore is running!");


// ======================================
// HERO BUTTON
// ======================================

const exploreBtn = document.querySelector(".hero .btn");

if (exploreBtn) {

    exploreBtn.addEventListener("click", () => {

        console.log("Opening matches page...");

    });

}


// ======================================
// FOOTER YEAR
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const footerTexts = document.querySelectorAll("footer p");

    const year = new Date().getFullYear();

    footerTexts.forEach((footerText) => {

        if (
            footerText.textContent.includes("Football Global") ||
            footerText.textContent.includes("PreziScore") ||
            footerText.textContent.includes("©")
        ) {

            footerText.innerHTML =
                `© ${year} PreziScore - Tous droits réservés.`;

        }

    });

});


// ======================================
// MENU
// ======================================

const links = document.querySelectorAll("nav a");

links.forEach((link) => {

    link.addEventListener("click", () => {

        console.log(
            "Opening:",
            link.innerText
        );

    });

});


// ======================================
// API CONNECTION
// ======================================

document.addEventListener("DOMContentLoaded", () => {


    // ==============================
    // HOME PAGE
    // ==============================

    const homeLive =
        document.getElementById("homeLiveMatches");


    const homeUpcoming =
        document.getElementById("homeUpcomingMatches");


    if (homeLive && typeof loadLiveMatches === "function") {

        loadLiveMatches(
            "homeLiveMatches"
        );

    }


    if (
        homeUpcoming &&
        typeof loadUpcomingMatches === "function"
    ) {

        loadUpcomingMatches(
            "homeUpcomingMatches"
        );

    }



    // ==============================
    // MATCHES PAGE
    // ==============================

    const liveMatches =
        document.getElementById("liveMatches");


    const upcomingMatches =
        document.getElementById("upcomingMatches");


    if (
        liveMatches &&
        typeof loadLiveMatches === "function"
    ) {

        loadLiveMatches(
            "liveMatches"
        );

    }


    if (
        upcomingMatches &&
        typeof loadUpcomingMatches === "function"
    ) {

        loadUpcomingMatches(
            "upcomingMatches"
        );

    }



    // ==============================
    // COMPETITIONS PAGE
    // ==============================

    if (
        document.getElementById("premierLeague") &&
        typeof loadStandings === "function"
    ) {

        loadStandings(
            39,
            "premierLeague"
        );

    }


    if (
        document.getElementById("laLiga") &&
        typeof loadStandings === "function"
    ) {

        loadStandings(
            140,
            "laLiga"
        );

    }


    if (
        document.getElementById("ligue1") &&
        typeof loadStandings === "function"
    ) {

        loadStandings(
            61,
            "ligue1"
        );

    }


    if (
        document.getElementById("serieA") &&
        typeof loadStandings === "function"
    ) {

        loadStandings(
            135,
            "serieA"
        );

    }


    if (
        document.getElementById("bundesliga") &&
        typeof loadStandings === "function"
    ) {

        loadStandings(
            78,
            "bundesliga"
        );

    }


    if (
        document.getElementById("championsLeague") &&
        typeof loadStandings === "function"
    ) {

        loadStandings(
            2,
            "championsLeague"
        );

    }

});


// ======================================
// PREZISCORE READY
// ======================================

console.log(
    "🚀 PreziScore JavaScript loaded successfully!"
);
