"use strict";

/* =====================================================
   PREZISCORE — MATCH DETAILS
===================================================== */

console.log("⚽ MATCH DETAILS OK");


const loading =
    document.getElementById("detailsLoading");

const errorBox =
    document.getElementById("detailsError");

const details =
    document.getElementById("matchDetails");


/* =====================================================
   GET MATCH ID
===================================================== */

const params =
    new URLSearchParams(
        window.location.search
    );

const matchId =
    params.get("match");


/* =====================================================
   START
===================================================== */

async function loadMatchDetails() {

    if (!matchId) {

        showError();

        return;

    }


    if (!window.PreziAPI) {

        console.error(
            "PreziAPI pa chaje."
        );

        showError();

        return;

    }


    try {

        /*
         * Nou pran match yo nan API a
         * epi nou jwenn match ki koresponn
         * ak ID ki nan URL la.
         */

        const matches =
            await PreziAPI.getNormalizedMatches();


        if (
            !Array.isArray(matches)
        ) {

            showError();

            return;

        }


        const match =
            matches.find(item => {

                return (

                    String(item?.id) ===
                        String(matchId)

                    ||

                    String(item?.slug) ===
                        String(matchId)

                    ||

                    String(item?.raw?.id) ===
                        String(matchId)

                    ||

                    String(item?.raw?.slug) ===
                        String(matchId)

                );

            });


        if (!match) {

            console.error(
                "Match pa jwenn:",
                matchId
            );

            showError();

            return;

        }


        renderMatch(match);


    }

    catch (err) {

        console.error(
            "❌ Match Details:",
            err
        );

        showError();

    }

}


/* =====================================================
   RENDER MATCH
===================================================== */

function renderMatch(match) {

    const home =
        match?.home || {};

    const away =
        match?.away || {};


    const homeName =
        home.name ||
        "Équipe domicile";


    const awayName =
        away.name ||
        "Équipe visiteuse";


    const homeScore =
        home.score ??
        "-";


    const awayScore =
        away.score ??
        "-";


    const competition =
        getCompetition(match);


    const status =
        getStatus(match);


    const time =
        getTime(match);


    /* NAMES */

    document.getElementById(
        "homeName"
    ).textContent =
        homeName;


    document.getElementById(
        "awayName"
    ).textContent =
        awayName;


    /* SCORES */

    document.getElementById(
        "homeScore"
    ).textContent =
        homeScore;


    document.getElementById(
        "awayScore"
    ).textContent =
        awayScore;


    /* COMPETITION */

    document.getElementById(
        "competitionName"
    ).textContent =
        competition;


    document.getElementById(
        "infoCompetition"
    ).textContent =
        competition;


    /* STATUS */

    const statusElement =
        document.getElementById(
            "matchStatus"
        );


    statusElement.textContent =
        status.text;


    document.getElementById(
        "infoStatus"
    ).textContent =
        status.text;


    document.getElementById(
        "scoreInfo"
    ).textContent =
        status.text;


    if (status.live) {

        statusElement.classList.add(
            "live"
        );

    }


    /* TIME */

    document.getElementById(
        "matchDate"
    ).textContent =
        time;


    document.getElementById(
        "infoTime"
    ).textContent =
        time;


    /* LOGOS */

    setLogo(
        "homeLogo",
        "homeLogoFallback",
        home.logo,
        homeName
    );


    setLogo(
        "awayLogo",
        "awayLogoFallback",
        away.logo,
        awayName
    );


    /* SHOW */

    if (loading) {

        loading.style.display =
            "none";

    }


    if (errorBox) {

        errorBox.classList.remove(
            "show"
        );

    }


    if (details) {

        details.style.display =
            "block";

    }

}


/* =====================================================
   STATUS
===================================================== */

function getStatus(match) {

    const status =
        String(
            match?.status || ""
        )
        .toLowerCase();


    if (
        status === "live" ||
        status.includes("live") ||
        status.includes("progress")
    ) {

        const minute =
            match?.minute ??
            match?.elapsed ??
            null;


        return {

            text:
                minute !== null
                    ? `LIVE • ${minute}'`
                    : "LIVE",

            live: true

        };

    }


    if (
        status === "finished" ||
        status.includes("finished") ||
        status.includes("ended")
    ) {

        return {

            text: "TERMINÉ",

            live: false

        };

    }


    return {

        text: "À VENIR",

        live: false

    };

}


/* =====================================================
   COMPETITION
===================================================== */

function getCompetition(match) {

    let name =
        match?.competition;


    if (
        typeof name === "object"
    ) {

        name =
            name.name ||
            name.title;

    }


    if (!name) {

        name =
            match?.raw?.competition_name ||
            match?.raw?.league_name ||
            match?.raw?.tournament_name ||
            match?.raw?.competition?.name ||
            match?.raw?.league?.name;

    }


    return (
        String(
            name || "Football"
        )
    );

}


/* =====================================================
   TIME
===================================================== */

function getTime(match) {

    const raw =
        match?.raw || {};


    const value =
        match?.date ||
        match?.startTime ||
        match?.start_time ||
        match?.kickoff ||
        raw.date ||
        raw.start_time ||
        raw.startTime ||
        raw.kickoff ||
        raw.match_date;


    if (!value) {

        return "Heure indisponible";

    }


    try {

        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);

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

    catch {

        return String(value);

    }

}


/* =====================================================
   LOGO
===================================================== */

function setLogo(
    imageId,
    fallbackId,
    url,
    teamName
) {

    const img =
        document.getElementById(
            imageId
        );

    const fallback =
        document.getElementById(
            fallbackId
        );


    if (
        !img ||
        !url
    ) {

        return;

    }


    img.src =
        url;

    img.alt =
        teamName;


    img.onload = () => {

        img.style.display =
            "block";


        if (fallback) {

            fallback.style.display =
                "none";

        }

    };


    img.onerror = () => {

        img.style.display =
            "none";

    };

}


/* =====================================================
   ERROR
===================================================== */

function showError() {

    if (loading) {

        loading.style.display =
            "none";

    }


    if (details) {

        details.style.display =
            "none";

    }


    if (errorBox) {

        errorBox.classList.add(
            "show"
        );

    }

}


/* =====================================================
   START
===================================================== */

loadMatchDetails();
