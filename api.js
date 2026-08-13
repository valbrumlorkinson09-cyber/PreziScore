"use strict";

/* =====================================================
   PREZISCORE — FOOTBALL LIVE API
   API.JS — PARTIE 1 / 2

   NO API KEY
   LIVE + TODAY
===================================================== */

const PREZI_API_BASE =
    "https://football-live-api.vercel.app/api";

const PREZI_CACHE_TIME =
    30000;

const PREZI_CACHE =
    new Map();


/* =====================================================
   REQUEST
===================================================== */

async function preziRequest(endpoint) {

    const url =
        PREZI_API_BASE + endpoint;

    const cached =
        PREZI_CACHE.get(url);

    if (
        cached &&
        Date.now() - cached.time <
        PREZI_CACHE_TIME
    ) {

        return cached.data;

    }


    const response =
        await fetch(url, {
            method: "GET",
            headers: {
                "Accept":
                    "application/json"
            }
        });


    if (!response.ok) {

        throw new Error(
            "Football API HTTP " +
            response.status
        );

    }


    const data =
        await response.json();


    PREZI_CACHE.set(
        url,
        {
            time: Date.now(),
            data: data
        }
    );


    return data;

}


/* =====================================================
   GET LIVE
===================================================== */

async function getLiveMatches() {

    const data =
        await preziRequest(
            "/matches/live"
        );


    return extractMatches(data);

}


/* =====================================================
   GET TODAY
===================================================== */

async function getTodayMatches() {

    const data =
        await preziRequest(
            "/matches/today"
        );


    return extractMatches(data);

}


/* =====================================================
   EXTRACT MATCHES
===================================================== */

function extractMatches(data) {

    if (
        Array.isArray(data)
    ) {

        return data;

    }


    if (
        Array.isArray(data?.matches)
    ) {

        return data.matches;

    }


    if (
        Array.isArray(data?.data)
    ) {

        return data.data;

    }


    if (
        Array.isArray(data?.results)
    ) {

        return data.results;

    }


    return [];

}


/* =====================================================
   NORMALIZE SCORE
===================================================== */

function normalizeScore(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(value);


    return Number.isNaN(number)
        ? null
        : number;

}


/* =====================================================
   NORMALIZE MATCH
===================================================== */

function normalizeMatch(match) {

    if (!match) {

        return null;

    }


    const rawStatus =
        String(
            match.status ||
            match.statusText ||
            match.status_text ||
            match.state ||
            ""
        )
        .toLowerCase()
        .trim();


    let state =
        "upcoming";


    /* ===============================
       LIVE
    =============================== */

    if (

        rawStatus.includes("live") ||
        rawStatus.includes("playing") ||
        rawStatus.includes("progress") ||
        rawStatus === "1h" ||
        rawStatus === "2h" ||
        rawStatus === "ht" ||
        rawStatus === "et" ||
        rawStatus === "p"

    ) {

        state = "live";

    }


    /* ===============================
       FINISHED
    =============================== */

    else if (

        rawStatus.includes("finished") ||
        rawStatus.includes("finish") ||
        rawStatus.includes("ended") ||
        rawStatus.includes("completed") ||
        rawStatus === "ft" ||
        rawStatus === "aet" ||
        rawStatus === "pen"

    ) {

        state = "finished";

    }


    /* ===============================
       TEAM DATA
    =============================== */

    const home =
        match.home ||
        match.homeTeam ||
        match.home_team ||
        match.teams?.home ||
        {};


    const away =
        match.away ||
        match.awayTeam ||
        match.away_team ||
        match.teams?.away ||
        {};


    const homeName =
        typeof home === "string"
            ? home
            : (
                home.name ||
                home.team?.name ||
                match.home_name ||
                "Équipe domicile"
            );


    const awayName =
        typeof away === "string"
            ? away
            : (
                away.name ||
                away.team?.name ||
                match.away_name ||
                "Équipe visiteuse"
            );


    const homeLogo =
        typeof home === "object"
            ? (
                home.logo ||
                home.image ||
                home.crest ||
                home.team?.logo ||
                match.home_logo ||
                ""
            )
            : (
                match.home_logo ||
                ""
            );


    const awayLogo =
        typeof away === "object"
            ? (
                away.logo ||
                away.image ||
                away.crest ||
                away.team?.logo ||
                match.away_logo ||
                ""
            )
            : (
                match.away_logo ||
                ""
            );


    /* ===============================
       SCORES
    =============================== */

    const homeScore =
        typeof home === "object"
            ? (
                home.score ??
                home.goals ??
                match.home_score ??
                match.homeScore
            )
            : (
                match.home_score ??
                match.homeScore
            );


    const awayScore =
        typeof away === "object"
            ? (
                away.score ??
                away.goals ??
                match.away_score ??
                match.awayScore
            )
            : (
                match.away_score ??
                match.awayScore
            );


    /* ===============================
       COMPETITION
    =============================== */

    let competition =
        match.competition ||
        match.league ||
        match.tournament ||
        match.competition_name ||
        "Football";


    if (
        typeof competition === "object"
    ) {

        competition =
            competition.name ||
            competition.title ||
            "Football";

    }


    /* ===============================
       TIME
    =============================== */

    const matchTime =
        match.time ||
        match.date ||
        match.startTime ||
        match.start_time ||
        null;


    /* ===============================
       ID / SLUG
    =============================== */

    const id =
        match.id ||
        match.matchId ||
        match.match_id ||
        match.slug ||
        "";


    return {

        id: id,

        slug:
            match.slug ||
            id,

        url:
            match.url ||
            "",

        status:
            state,

        statusRaw:
            rawStatus,

        statusText:
            match.status_text ||
            match.statusText ||
            "",

        time:
            matchTime,

        date:
            matchTime,

        home: {

            name:
                String(homeName),

            logo:
                String(homeLogo || ""),

            score:
                normalizeScore(
                    homeScore
                )

        },

        away: {

            name:
                String(awayName),

            logo:
                String(awayLogo || ""),

            score:
                normalizeScore(
                    awayScore
                )

        },

        competition:
            String(competition),

        competitionLogo:
            match.competition_logo ||
            match.league?.logo ||
            "",

        raw:
            match

    };

}


/* =====================================================
   NORMALIZE ARRAY
===================================================== */

function normalizeMatches(list) {

    return list
        .map(normalizeMatch)
        .filter(Boolean);

       }
/* =====================================================
   PREZISCORE — FOOTBALL LIVE API
   API.JS — PARTIE 2 / 2
===================================================== */


/* =====================================================
   GET ALL MATCHES
===================================================== */

async function getMatches() {

    const today =
        await getTodayMatches();

    const live =
        await getLiveMatches();


    /*
       Nou mete LIVE yo an premye.
       Sa pèmèt PreziScore toujou montre
       match LIVE yo si API a bay yo.
    */

    const combined = [
        ...live,
        ...today
    ];


    /*
       Evite menm match la parèt 2 fwa.
    */

    const unique =
        new Map();


    combined.forEach(match => {

        const key =
            match.id ||
            match.slug ||
            (
                String(
                    match.home?.name
                ) +
                "_" +
                String(
                    match.away?.name
                )
            );


        if (!unique.has(key)) {

            unique.set(
                key,
                match
            );

        }

    });


    return [
        ...unique.values()
    ];

}


/* =====================================================
   NORMALIZED MATCHES
===================================================== */

async function getNormalizedMatches() {

    const data =
        await getMatches();


    return normalizeMatches(
        data
    );

}


/* =====================================================
   LIVE MATCHES
===================================================== */

async function getNormalizedLiveMatches() {

    const data =
        await getLiveMatches();


    return normalizeMatches(
        data
    );

}


/* =====================================================
   FINISHED MATCHES
===================================================== */

async function getFinishedMatches() {

    const matches =
        await getNormalizedMatches();


    return matches.filter(
        match =>
            match.status ===
            "finished"
    );

}


/* =====================================================
   UPCOMING MATCHES
===================================================== */

async function getUpcomingMatches() {

    const matches =
        await getNormalizedMatches();


    return matches.filter(
        match =>
            match.status ===
            "upcoming"
    );

}


/* =====================================================
   FIND MATCH
===================================================== */

async function getMatchById(id) {

    if (!id) {

        return null;

    }


    try {

        const data =
            await preziRequest(
                "/match/" +
                encodeURIComponent(id)
            );


        return (
            data?.match ||
            data?.data ||
            data ||
            null
        );

    }

    catch(error) {

        console.error(
            "❌ Match details:",
            error
        );


        return null;

    }

}


/* =====================================================
   MATCH DETAILS
===================================================== */

async function getMatchDetails(id) {

    return await getMatchById(
        id
    );

}


/* =====================================================
   STATISTICS
===================================================== */

async function getMatchStatistics(id) {

    const data =
        await getMatchDetails(
            id
        );


    if (!data) {

        return [];

    }


    return (
        data.statistics ||
        data.stats ||
        data.teamStats ||
        data.team_statistics ||
        []
    );

}


/* =====================================================
   EVENTS
===================================================== */

async function getMatchEvents(id) {

    const data =
        await getMatchDetails(
            id
        );


    if (!data) {

        return [];

    }


    return (
        data.events ||
        data.timeline ||
        data.incidents ||
        []
    );

}


/* =====================================================
   LINEUPS
===================================================== */

async function getMatchLineups(id) {

    const data =
        await getMatchDetails(
            id
        );


    if (!data) {

        return [];

    }


    return (
        data.lineups ||
        data.lineup ||
        data.squads ||
        []
    );

}


/* =====================================================
   COMPETITIONS
===================================================== */

async function getCompetitions() {

    try {

        const data =
            await preziRequest(
                "/competitions"
            );


        return (
            data?.competitions ||
            data?.data ||
            data?.results ||
            []
        );

    }

    catch(error) {

        console.error(
            "❌ Competitions:",
            error
        );


        return [];

    }

}


/* =====================================================
   SEARCH
===================================================== */

async function searchTeam(
    query
) {

    if (!query) {

        return [];

    }


    const matches =
        await getNormalizedMatches();


    const text =
        String(query)
            .toLowerCase()
            .trim();


    return matches.filter(
        match => {

            const home =
                String(
                    match.home?.name ||
                    ""
                )
                .toLowerCase();


            const away =
                String(
                    match.away?.name ||
                    ""
                )
                .toLowerCase();


            return (
                home.includes(text) ||
                away.includes(text)
            );

        }
    );

}


/* =====================================================
   CLEAR CACHE
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
            "Football Live API",

        baseURL:
            PREZI_API_BASE,

        apiKeyRequired:
            false,

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

    getMatches,

    getNormalizedMatches,

    getNormalizedLiveMatches,

    getLiveMatches:
        getNormalizedLiveMatches,

    getFinishedMatches,

    getUpcomingMatches,


    /* DETAILS */

    getMatchById,

    getMatchDetails,


    /* DATA */

    getMatchStatistics,

    getMatchEvents,

    getMatchLineups,


    /* COMPETITIONS */

    getCompetitions,


    /* SEARCH */

    searchTeam,


    /* SYSTEM */

    clearCache:
        clearPreziCache,

    getAPIStatus,

    normalizeMatch

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
    "🌐 Provider: Football Live API"
);

console.log(
    "🔑 API KEY: NOT REQUIRED"
);

console.log(
    "🔴 LIVE: ENABLED"
);

console.log(
    "📅 TODAY: ENABLED"
);

console.log(
    "💾 CACHE: 30 SECONDS"
);

console.log(
    "===================================="
);
