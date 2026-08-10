// ======================================================
// ⚽ PREZISCORE — MAIN SCRIPT
// MENU • DATES • SEARCH • FAVORITES • MATCHES
// ======================================================

console.log("⚽ PreziScore Script loading...");


// ======================================================
// 🌍 GLOBAL
// ======================================================

let selectedDateOffset = 0;

let allPreziMatches = [];

let favoriteTeams =
    JSON.parse(
        localStorage.getItem("preziFavorites") || "[]"
    );


// ======================================================
// 🧩 GET ELEMENT
// ======================================================

function el(id) {
    return document.getElementById(id);
}


// ======================================================
// 📅 DATE FORMAT
// ======================================================

function getDateFromOffset(offset) {

    const date = new Date();

    date.setDate(
        date.getDate() + offset
    );

    return date;
}


function formatShortDate(date) {

    return date.toLocaleDateString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit"
        }
    );

}


// ======================================================
// 📅 UPDATE DATE BAR
// ======================================================

function updateDateBar() {

    const buttons =
        document.querySelectorAll(
            ".date-item"
        );

    buttons.forEach(button => {

        const offset =
            Number(
                button.dataset.dateOffset
            );

        const date =
            getDateFromOffset(offset);

        const strong =
            button.querySelector("strong");

        if (strong) {

            strong.textContent =
                formatShortDate(date);

        }

    });

}


// ======================================================
// 📅 SELECT DATE
// ======================================================

function selectDate(offset) {

    selectedDateOffset =
        Number(offset);

    const buttons =
        document.querySelectorAll(
            ".date-item"
        );

    buttons.forEach(button => {

        const value =
            Number(
                button.dataset.dateOffset
            );

        button.classList.toggle(
            "active",
            value === selectedDateOffset
        );

    });

    renderSelectedDateMatches();

}


// ======================================================
// 📅 DATE BUTTONS
// ======================================================

function setupDateNavigation() {

    updateDateBar();


    document
        .querySelectorAll(".date-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectDate(
                        button.dataset.dateOffset
                    );

                }
            );

        });


    const previous =
        el("previousDay");

    if (previous) {

        previous.addEventListener(
            "click",
            () => {

                selectedDateOffset--;

                updateDateBar();

                renderSelectedDateMatches();

            }
        );

    }


    const next =
        el("nextDay");

    if (next) {

        next.addEventListener(
            "click",
            () => {

                selectedDateOffset++;

                updateDateBar();

                renderSelectedDateMatches();

            }
        );

    }

}


// ======================================================
// 📱 BOTTOM MENU
// ======================================================

function setupBottomNavigation() {

    const buttons =
        document.querySelectorAll(
            ".bottom-item"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const pageId =
                    button.dataset.page;


                buttons.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                document
                    .querySelectorAll(".app-page")
                    .forEach(page => {

                        page.classList.remove(
                            "active-page"
                        );

                    });


                const page =
                    el(pageId);

                if (page) {

                    page.classList.add(
                        "active-page"
                    );

                }


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });


                if (
                    pageId === "pageLive"
                ) {

                    loadLivePage();

                }


                if (
                    pageId === "pageFavorites"
                ) {

                    renderFavorites();

                }

            }
        );

    });

}


// ======================================================
// 🔍 SEARCH
// ======================================================

function setupSearch() {

    const searchBtn =
        el("searchBtn");

    const searchBox =
        el("searchBox");

    const searchInput =
        el("searchInput");


    if (
        !searchBtn ||
        !searchBox ||
        !searchInput
    ) {

        return;

    }


    searchBtn.addEventListener(
        "click",
        () => {

            searchBox.classList.toggle(
                "hidden"
            );


            if (
                !searchBox.classList.contains(
                    "hidden"
                )
            ) {

                searchInput.focus();

            }

        }
    );


    searchInput.addEventListener(
        "input",
        () => {

            const query =
                searchInput.value
                    .toLowerCase()
                    .trim();


            if (!query) {

                renderAllMatches(
                    allPreziMatches
                );

                return;

            }


            const filtered =
                allPreziMatches.filter(
                    match => {

                        const home =
                            getTeamNameSafe(
                                match,
                                "home"
                            )
                            .toLowerCase();


                        const away =
                            getTeamNameSafe(
                                match,
                                "away"
                            )
                            .toLowerCase();


                        return (
                            home.includes(query) ||
                            away.includes(query)
                        );

                    }
                );


            renderAllMatches(
                filtered
            );

        }
    );

}


// ======================================================
// 🛡️ SAFE TEAM NAME
// ======================================================

function getTeamNameSafe(
    match,
    side
) {

    try {

        if (
            typeof getTeamName ===
            "function"
        ) {

            return (
                getTeamName(
                    match,
                    side
                ) || "Équipe"
            );

        }

    } catch (error) {

        console.warn(
            "Team name error:",
            error
        );

    }


    const team =
        side === "home"
        ?
        (
            match?.home_team ||
            match?.home ||
            match?.homeTeam
        )
        :
        (
            match?.away_team ||
            match?.away ||
            match?.awayTeam
        );


    if (
        typeof team === "string"
    ) {

        return team;

    }


    return (
        team?.name ||
        "Équipe"
    );

}


// ======================================================
// 🛡️ SAFE SCORE
// ======================================================

function getScoreSafe(
    match,
    side
) {

    try {

        if (
            typeof getScore ===
            "function"
        ) {

            return getScore(
                match,
                side
            );

        }

    } catch (error) {}

    const team =
        side === "home"
        ?
        (
            match?.home_team ||
            match?.home
        )
        :
        (
            match?.away_team ||
            match?.away
        );


    return (
        team?.score ??
        match?.score?.[side] ??
        match?.scores?.[side] ??
        0
    );

}


// ======================================================
// 🏆 SAFE COMPETITION
// ======================================================

function getCompetitionSafe(match) {

    try {

        if (
            typeof getCompetition ===
            "function"
        ) {

            return getCompetition(
                match
            ) || "";
        }

    } catch (error) {}


    return (
        match?.league?.name ||
        match?.competition?.name ||
        match?.tournament?.name ||
        ""
    );

}


// ======================================================
// 📅 MATCH DATE
// ======================================================

function getMatchDateSafe(match) {

    try {

        if (
            typeof getMatchDate ===
            "function"
        ) {

            return getMatchDate(
                match
            );

        }

    } catch (error) {}


    return (
        match?.starting_at ||
        match?.start_at ||
        match?.date ||
        match?.timestamp ||
        ""
    );

}


// ======================================================
// 🔴 STATUS
// ======================================================

function getStatusSafe(match) {

    try {

        if (
            typeof getMatchStatus ===
            "function"
        ) {

            return (
                getMatchStatus(
                    match
                ) || ""
            );

        }

    } catch (error) {}


    return (
        match?.status?.name ||
        match?.status ||
        match?.state?.name ||
        ""
    );

}


// ======================================================
// 🔴 CHECK LIVE
// ======================================================

function checkLive(match) {

    try {

        if (
            typeof isLiveMatch ===
            "function"
        ) {

            return isLiveMatch(
                match
            );

        }

    } catch (error) {}


    const status =
        String(
            getStatusSafe(match)
        )
        .toLowerCase();


    return (
        status.includes("live") ||
        status.includes("1h") ||
        status.includes("2h") ||
        status.includes("half") ||
        status.includes("ht")
    );

}


// ======================================================
// ✅ CHECK FINISHED
// ======================================================

function checkFinished(match) {

    try {

        if (
            typeof isFinishedMatch ===
            "function"
        ) {

            return isFinishedMatch(
                match
            );

        }

    } catch (error) {}


    const status =
        String(
            getStatusSafe(match)
        )
        .toLowerCase();


    return (
        status.includes("finished") ||
        status.includes("finish") ||
        status.includes("ended") ||
        status === "ft"
    );

}


// ======================================================
// 📅 CHECK UPCOMING
// ======================================================

function checkUpcoming(match) {

    if (
        checkLive(match) ||
        checkFinished(match)
    ) {

        return false;

    }


    const value =
        getMatchDateSafe(match);


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    return (
        date.getTime() >
        Date.now()
    );

}


// ======================================================
// ⭐ FAVORITE
// ======================================================

function isFavorite(teamName) {

    return favoriteTeams.includes(
        teamName
    );

}


function toggleFavorite(
    teamName
) {

    if (
        isFavorite(teamName)
    ) {

        favoriteTeams =
            favoriteTeams.filter(
                name =>
                    name !== teamName
            );

    } else {

        favoriteTeams.push(
            teamName
        );

    }


    localStorage.setItem(
        "preziFavorites",
        JSON.stringify(
            favoriteTeams
        )
    );


    renderAllMatches(
        allPreziMatches
    );


    renderFavorites();

}


// ======================================================
// 🧩 ESCAPE HTML
// ======================================================

function safeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================================
// 🖼️ RENDER MATCH
// ======================================================

function renderSimpleMatch(
    match
) {

    const home =
        safeHTML(
            getTeamNameSafe(
                match,
                "home"
            )
        );


    const away =
        safeHTML(
            getTeamNameSafe(
                match,
                "away"
            )
        );


    const homeScore =
        getScoreSafe(
            match,
            "home"
        );


    const awayScore =
        getScoreSafe(
            match,
            "away"
        );


    const competition =
        safeHTML(
            getCompetitionSafe(
                match
            )
        );


    const live =
        checkLive(match);


    const finished =
        checkFinished(match);


    const date =
        new Date(
            getMatchDateSafe(match)
        );


    let statusText =
        "À venir";


    let statusClass =
        "upcoming";


    if (live) {

        statusText =
            "🔴 LIVE";

        statusClass =
            "live";

    }


    if (finished) {

        statusText =
            "TERMINÉ";

        statusClass =
            "finished";

    }


    let dateText = "";


    if (
        !finished &&
        !live &&
        !isNaN(
            date.getTime()
        )
    ) {

        dateText =
            date.toLocaleTimeString(
                "fr-FR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    }


    const favorite =
        isFavorite(
            getTeamNameSafe(
                match,
                "home"
            )
        );


    return `

        <article
            class="match-card"
        >

            <div class="match-top">

                <span
                    class="match-status ${statusClass}"
                >

                    ${
                        live
                        ?
                        `<span class="live-dot"></span>`
                        :
                        ""
                    }

                    ${statusText}

                    ${
                        dateText
                        ?
                        ` • ${dateText}`
                        :
                        ""
                    }

                </span>


                <button
                    class="favorite-btn ${
                        favorite
                        ? "active"
                        : ""
                    }"
                    type="button"
                    onclick="toggleFavorite('${safeHTML(
                        getTeamNameSafe(
                            match,
                            "home"
                        )
                    )}')"
                >
                    ${
                        favorite
                        ? "★"
                        : "☆"
                    }
                </button>

            </div>


            <div class="match-body">


                <div class="team">

                    <span
                        class="team-name"
                    >
                        ${home}
                    </span>

                </div>


                <div class="score-area">

                    <div class="score">

                        ${
                            live ||
                            finished
                            ?
                            `
                            <span class="${
                                live
                                ? "live-score"
                                : ""
                            }">
                                ${homeScore}
                            </span>

                            <span>-</span>

                            <span>
                                ${awayScore}
                            </span>
                            `
                            :
                            `
                            <span class="upcoming-score">
                                VS
                            </span>
                            `
                        }

                    </div>

                </div>


                <div
                    class="team away"
                >

                    <span
                        class="team-name"
                    >
                        ${away}
                    </span>

                </div>


            </div>


            ${
                competition
                ?
                `
                <div class="match-date">
                    🏆 ${competition}
                </div>
                `
                :
                ""
            }

        </article>

    `;

}


// ======================================================
// 📋 RENDER ALL
// ======================================================

function renderAllMatches(
    matches
) {

    const container =
        el("allMatches");


    if (!container) {

        return;

    }


    if (
        !matches ||
        matches.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ⚽
                </div>

                <h2>
                    Aucun match
                </h2>

                <p>
                    Aucun match trouvé pour cette sélection.
                </p>

            </div>

        `;

        updateCount(0);

        return;

    }


    container.innerHTML =
        matches
            .map(
                match =>
                    renderSimpleMatch(
                        match
                    )
            )
            .join("");


    updateCount(
        matches.length
    );

}


// ======================================================
// 🔢 COUNT
// ======================================================

function updateCount(count) {

    const counter =
        el("totalMatches");

    if (counter) {

        counter.textContent =
            count;

    }

}


// ======================================================
// 🔴 LIVE PAGE
// =================================================
