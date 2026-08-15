"use strict";

/* =====================================================
   PREZISCORE — API CENTRAL
   VERCEL BACKEND
   NO API KEY
===================================================== */

const PREZI_API_BASE =
    "https://prezi-score.vercel.app";

const PREZI_CACHE_TIME = 15000;
const PREZI_CACHE = new Map();


/* =====================================================
   REQUEST
===================================================== */

async function preziRequest(path) {

    const url =
        PREZI_API_BASE.replace(/\/$/, "") + path;

    const cached = PREZI_CACHE.get(url);

    if (
        cached &&
        Date.now() - cached.time < PREZI_CACHE_TIME
    ) {
        return cached.data;
    }

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(
            "PreziScore API HTTP " +
            response.status
        );
    }

    const data = await response.json();

    PREZI_CACHE.set(url, {
        time: Date.now(),
        data: data
    });

    return data;
}


/* =====================================================
   STATUS NORMALIZER
===================================================== */

function normalizeStatus(match) {

    const status =
        String(match?.status || "")
            .toLowerCase()
            .trim();

    const text =
        String(match?.status_text || "")
            .toLowerCase()
            .trim();


    /* LIVE */

    if (
        status === "live" ||
        status === "inplay" ||
        status === "in_play" ||
        status === "playing" ||
        status === "started" ||
        status === "1h" ||
        status === "2h" ||
        status === "ht" ||
        status === "half"
    ) {
        return "live";
    }


    if (
        text.includes("live") ||
        text.includes("1st half") ||
        text.includes("2nd half") ||
        text.includes("half time") ||
        text.includes("halftime") ||
        text.includes("in play") ||
        text.includes("in-play")
    ) {
        return "live";
    }


    /* FINISHED */

    if (
        status === "finished" ||
        status === "finish" ||
        status === "ended" ||
        status === "ft"
    ) {
        return "finished";
    }


    if (
        text.includes("finished") ||
        text === "ft" ||
        text.includes("full time") ||
        text.includes("full-time")
    ) {
        return "finished";
    }


    /* DEFAULT */

    return "upcoming";
}


/* =====================================================
   LIVE MINUTE
===================================================== */

function getLiveMinute(match) {

    if (normalizeStatus(match) !== "live") {
        return null;
    }


    /* Si API a deja bay minute */

    if (
        match.minute !== undefined &&
        match.minute !== null &&
        match.minute !== ""
    ) {
        return String(match.minute);
    }


    if (
        match.elapsed !== undefined &&
        match.elapsed !== null
    ) {
        return String(match.elapsed);
    }


    if (
        match.minutes !== undefined &&
        match.minutes !== null
    ) {
        return String(match.minutes);
    }


    /* Eseye kalkile l depi lè kòmansman */

    if (match.time) {

        const start =
            new Date(match.time).getTime();

        if (!Number.isNaN(start)) {

            const now =
                Date.now();

            const minutes =
                Math.floor(
                    (now - start) / 60000
                );

            if (
                minutes >= 0 &&
                minutes <= 130
            ) {
                return minutes + "'";
            }
        }
    }


    return "LIVE";
}


/* =====================================================
   NORMALIZE MATCH
===================================================== */

function normalizeMatch(match) {

    if (!match) {
        return null;
    }


    const status =
        normalizeStatus(match);


    const homeName =
        typeof match.home === "object"
            ? match.home?.name
            : match.home;


    const awayName =
        typeof match.away === "object"
            ? match.away?.name
            : match.away;


    const homeLogo =
        typeof match.home === "object"
            ? (
                match.home?.logo ||
                match.home?.crest ||
                ""
            )
            : (
                match.home_logo ||
                ""
            );


    const awayLogo =
        typeof match.away === "object"
            ? (
                match.away?.logo ||
                match.away?.crest ||
                ""
            )
            : (
                match.away_logo ||
                ""
            );


    const homeScore =
        typeof match.home === "object"
            ? (
                match.home?.score ??
                null
            )
            : (
                match.home_score ??
                null
            );


    const awayScore =
        typeof match.away === "object"
            ? (
                match.away?.score ??
                null
            )
            : (
                match.away_score ??
                null
            );


    return {

        id:
            match.id ||
            match.match_id ||
            match.url ||
            `${homeName}-${awayName}`,

        slug:
            match.url ||
            String(match.id || ""),


        status: status,


        statusText:
            status === "live"
                ? "LIVE"
                : status === "finished"
                    ? "Finished"
                    : (
                        match.status_text ||
                        "À venir"
                    ),


        minute:
            getLiveMinute(match),


        time:
            match.time ||
            match.utcTime ||
            match.start_time ||
            null,


        home: {

            name:
                homeName ||
                "Équipe domicile",

            logo:
                homeLogo,

            score:
                homeScore

        },


        away: {

            name:
                awayName ||
                "Équipe visiteuse",

            logo:
                awayLogo,

            score:
                awayScore

        },


        competition:
            typeof match.competition === "object"
                ? (
                    match.competition?.name ||
                    "Football"
                )
                : (
                    match.competition ||
                    "Football"
                ),


        competitionLogo:
            match.competition_logo ||
            (
                typeof match.competition === "object"
                    ? match.competition?.logo
                    : ""
            ) ||
            "",


        url:
            match.url ||
            null,


        raw:
            match

    };
}


/* =====================================================
   EXTRACT MATCHES
===================================================== */

function extractMatches(data) {

    /* Nouvo Vercel API */

    if (
        Array.isArray(data?.matches)
    ) {
        return data.matches;
    }


    /* Si API a retounen data.matches */

    if (
        Array.isArray(data?.data?.matches)
    ) {
        return data.data.matches;
    }


    /* Si API a retounen data kòm array */

    if (
        Array.isArray(data?.data)
    ) {
        return data.data;
    }


    /* FotMob-style fallback */

    if (
        Array.isArray(data?.leagues)
    ) {

        const result = [];

        data.leagues.forEach(
            league => {

                (
                    league.matches ||
                    []
                ).forEach(
                    match => {

                        result.push({

                            ...match,

                            competition:
                                league.name,

                            competition_logo:
                                league.logo

                        });

                    }
                );

            }
        );

        return result;
    }


    return [];
}


/* =====================================================
   GET ALL MATCHES
===================================================== */

async function getNormalizedMatches() {

    const data =
        await preziRequest(
            "/api/matches"
        );


    const matches =
        extractMatches(data);


    return matches
        .map(normalizeMatch)
        .filter(Boolean);
}


/* =====================================================
   LIVE
===================================================== */

async function getLiveMatches() {

    const matches =
        await getNormalizedMatches();

    return matches.filter(
        match =>
            match.status === "live"
    );
}


/* =====================================================
   FINISHED
===================================================== */

async function getFinishedMatches() {

    const matches =
        await getNormalizedMatches();

    return matches.filter(
        match =>
            match.status === "finished"
    );
}


/* =====================================================
   UPCOMING
===================================================== */

async function getUpcomingMatches() {

    const matches =
        await getNormalizedMatches();

    return matches.filter(
        match =>
            match.status === "upcoming"
    );
}


/* =====================================================
   MATCH DETAILS
===================================================== */

async function getMatchDetails(id) {

    if (!id) {
        return null;
    }


    const encoded =
        encodeURIComponent(id);


    try {

        const data =
            await preziRequest(
                "/api/matches/" +
                encoded
            );

        return (
            data?.match ||
            data?.data ||
            data ||
            null
        );

    } catch (error) {

        console.warn(
            "Match details unavailable:",
            error
        );

        return null;
    }
}


/* =====================================================
   SEARCH
===================================================== */

async function searchTeam(query) {

    if (!query) {
        return [];
    }


    const text =
        String(query)
            .trim()
            .toLowerCase();


    const matches =
        await getNormalizedMatches();


    return matches.filter(
        match => {

            const home =
                match.home.name
                    .toLowerCase();

            const away =
                match.away.name
                    .toLowerCase();


            return (
                home.includes(text) ||
                away.includes(text)
            );

        }
    );
}


/* =====================================================
   CACHE
===================================================== */

function clearPreziCache() {

    PREZI_CACHE.clear();

    console.log(
        "🧹 PreziScore cache cleared"
    );
}


/* =====================================================
   API STATUS
===================================================== */

function getAPIStatus() {

    return {

        provider:
            "PreziScore Vercel API",

        source:
            "Vercel Backend",

        apiKeyRequired:
            false,

        baseURL:
            PREZI_API_BASE,

        endpoint:
            "/api/matches",

        cache:
            true,

        cacheTime:
            PREZI_CACHE_TIME

    };
}


/* =====================================================
   GLOBAL API
===================================================== */

window.PreziAPI = {

    /* MATCHES */

    getNormalizedMatches,

    getLiveMatches,

    getFinishedMatches,

    getUpcomingMatches,


    /* DETAILS */

    getMatchDetails,

    getMatchById:
        getMatchDetails,


    /* SEARCH */

    searchTeam,


    /* SYSTEM */

    clearCache:
        clearPreziCache,

    getAPIStatus,

    normalizeMatch,

    getLiveMinute

};


/* =====================================================
   READY
===================================================== */

console.log(
    "===================================="
);

console.log(
    "⚽ PREZISCORE API READY"
);

console.log(
    "🌐 VERCEL: prezi-score.vercel.app"
);

console.log(
    "📡 ENDPOINT: /api/matches"
);

console.log(
    "🔑 API KEY: NONE"
);

console.log(
    "🔴 LIVE: READY"
);

console.log(
    "⚽ LOGOS: READY"
);

console.log(
    "🔢 SCORES: READY"
);

console.log(
    "⏱️ MINUTES: READY"
);

console.log(
    "===================================="
);
