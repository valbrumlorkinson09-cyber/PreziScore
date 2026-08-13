"use strict";

/* =====================================================
   PREZISCORE — SPORTScore API
   API ENGINE
   PART 1 / 2

   NO API KEY
   FOOTBALL
===================================================== */

const PREZI_API_BASE =
    "https://sportscore.com/api/widget";

const PREZI_SPORT =
    "football";

const PREZI_CACHE_TIME =
    60000;

const PREZI_CACHE =
    new Map();


/* =====================================================
   API REQUEST
===================================================== */

async function preziRequest(
    endpoint,
    params = {}
) {

    const url =
        new URL(
            PREZI_API_BASE +
            endpoint
        );


    Object.entries(
        params
    ).forEach(
        ([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                url.searchParams.set(
                    key,
                    value
                );

            }

        }
    );


    const cacheKey =
        url.toString();


    const cached =
        PREZI_CACHE.get(
            cacheKey
        );


    if (
        cached &&
        Date.now() -
        cached.time <
        PREZI_CACHE_TIME
    ) {

        return cached.data;

    }


    const response =
        await fetch(
            cacheKey,
            {
                method:
                    "GET",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );


    if (!response.ok) {

        throw new Error(
            "SportScore HTTP " +
            response.status
        );

    }


    const data =
        await response.json();


    PREZI_CACHE.set(
        cacheKey,
        {
            time:
                Date.now(),

            data:
                data
        }
    );


    return data;

}


/* =====================================================
   GET MATCHES
===================================================== */

async function getMatches(
    limit = 50
) {

    const data =
        await preziRequest(
            "/matches/",
            {
                sport:
                    PREZI_SPORT,

                limit:
                    Math.min(
                        Number(limit) || 50,
                        50
                    )
            }
        );


    if (
        Array.isArray(
            data?.matches
        )
    ) {

        return data.matches;

    }


    return [];

}


/* =====================================================
   NORMALIZE ONE MATCH
===================================================== */

function normalizeMatch(
    match
) {

    if (!match) {

        return null;

    }


    /*
       SportScore response:

       home: "Team name"
       away: "Team name"

       home_logo: "..."
       away_logo: "..."

       home_score: "1"
       away_score: "1"

       status: "finished"
       status_text: "Finished"

       time: "2026-..."

       competition: "USL League One"

       url:
       "/football/match/..."
    */


    const status =
        String(
            match.status ||
            ""
        )
        .toLowerCase()
        .trim();


    let state =
        "upcoming";


    /* LIVE */

    if (

        status === "live" ||

        status === "in_play" ||

        status === "in-play" ||

        status === "playing" ||

        status === "ongoing" ||

        status === "started" ||

        status === "1h" ||

        status === "2h" ||

        status === "ht" ||

        status === "et" ||

        status === "bt" ||

        status === "p"

    ) {

        state =
            "live";

    }


    /* FINISHED */

    else if (

        status === "finished" ||

        status === "finish" ||

        status === "ended" ||

        status === "completed" ||

        status === "ft" ||

        status === "aet" ||

        status === "pen"

    ) {

        state =
            "finished";

    }


    /*
       Slug soti nan URL la.

       /football/match/
       monterrey-vs-nashville/
    */

    let slug =
        "";


    if (
        typeof match.url ===
        "string"
    ) {

        slug =
            match.url
                .replace(
                    /^\/football\/match\//,
                    ""
                )
                .replace(
                    /\/$/,
                    ""
                );

    }


    return {

        /* MATCH ID */

        id:
            slug || null,


        slug:
            slug,


        url:
            match.url ||
            "",


        /* STATUS */

        status:
            state,


        statusRaw:
            status,


        statusText:
            match.status_text ||
            "",


        /* TIME */

        time:
            match.time ||
            null,


        date:
            match.time ||
            null,


        /* HOME */

        home: {

            name:
                match.home ||
                "Équipe domicile",


            logo:
                match.home_logo ||
                "",


            score:
                normalizeScore(
                    match.home_score
                )

        },


        /* AWAY */

        away: {

            name:
                match.away ||
                "Équipe visiteuse",


            logo:
                match.away_logo ||
                "",


            score:
                normalizeScore(
                    match.away_score
                )

        },


        /* COMPETITION */

        competition:
            match.competition ||
            "Football",


        competitionLogo:
            match.competition_logo ||
            "",


        /* ORIGINAL */

        raw:
            match

    };

}


/* =====================================================
   SCORE
===================================================== */

function normalizeScore(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(value);


    if (
        Number.isNaN(
            number
        )
    ) {

        return null;

    }


    return number;

}


/* =====================================================
   NORMALIZED MATCHES
===================================================== */

async function getNormalizedMatches() {

    const matches =
        await getMatches(
            50
        );


    return matches
        .map(
            normalizeMatch
        )
        .filter(
            Boolean
        );

}


/* =====================================================
   LIVE MATCHES
===================================================== */

async function getLiveMatches() {

    const matches =
        await getNormalizedMatches();


    return matches.filter(
        match =>
            match.status ===
            "live"
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
   CLEAR CACHE
===================================================== */

function clearPreziCache() {

    PREZI_CACHE.clear();

    console.log(
        "🧹 PreziScore cache cleared"
    );

}
/* =====================================================
   PREZISCORE — SPORTScore API
   PART 2 / 2
===================================================== */


/* =====================================================
   MATCH BY SLUG
===================================================== */

async function getMatchBySlug(slug) {

    if (!slug) {
        return null;
    }

    const cleanSlug =
        String(slug)
            .replace(/^\/football\/match\//, "")
            .replace(/\/$/, "");


    const data =
        await preziRequest(
            "/match/",
            {
                sport: PREZI_SPORT,
                slug: cleanSlug
            }
        );


    /*
       SportScore ka mete detay yo
       nan diferan property selon response.
    */

    const match =
        data?.match ||
        data?.data ||
        data?.result ||
        data;


    if (!match) {
        return null;
    }


    return match;

}


/* =====================================================
   MATCH DETAILS NORMALIZED
===================================================== */

async function getMatchDetails(slug) {

    const data =
        await getMatchBySlug(
            slug
        );


    if (!data) {
        return null;
    }


    return data;

}


/* =====================================================
   MATCH BY ID / SLUG
===================================================== */

async function getMatchById(id) {

    if (!id) {
        return null;
    }


    /*
       Nan SportScore nou itilize URL slug
       kòm ID prensipal la.
    */

    return await getMatchBySlug(
        id
    );

}


/* =====================================================
   STATISTICS
===================================================== */

async function getMatchStatistics(slug) {

    const data =
        await getMatchBySlug(
            slug
        );


    if (!data) {
        return [];
    }


    return (
        data.statistics ||
        data.stats ||
        data.team_statistics ||
        data.teamStats ||
        []
    );

}


/* =====================================================
   EVENTS / TIMELINE
===================================================== */

async function getMatchEvents(slug) {

    const data =
        await getMatchBySlug(
            slug
        );


    if (!data) {
        return [];
    }


    return (
        data.timeline ||
        data.events ||
        data.incidents ||
        data.match_events ||
        data.matchEvents ||
        []
    );

}


/* =====================================================
   LINEUPS
===================================================== */

async function getMatchLineups(slug) {

    const data =
        await getMatchBySlug(
            slug
        );


    if (!data) {
        return [];
    }


    return (
        data.lineups ||
        data.lineup ||
        data.squads ||
        data.players ||
        []
    );

}


/* =====================================================
   HEAD TO HEAD
===================================================== */

async function getHeadToHead(
    home,
    away
) {

    if (!home || !away) {
        return [];
    }


    /*
       H2H pa toujou disponib
       nan endpoint widget gratis la.

       Nou retounen [] olye nou
       fè aplikasyon an kraze.
    */

    return [];

}


/* =====================================================
   COMPETITIONS
===================================================== */

async function getCompetitions() {

    const data =
        await preziRequest(
            "/competitions/",
            {
                sport:
                    PREZI_SPORT
            }
        );


    return (
        data?.competitions ||
        data?.data ||
        data?.results ||
        []
    );

}


/* =====================================================
   STANDINGS
===================================================== */

async function getStandings(
    slug
) {

    if (!slug) {
        return [];
    }


    const data =
        await preziRequest(
            "/standings/",
            {
                sport:
                    PREZI_SPORT,

                slug:
                    slug
            }
        );


    return (
        data?.standings ||
        data?.table ||
        data?.rows ||
        data?.data ||
        []
    );

}


/* =====================================================
   TOP SCORERS
===================================================== */

async function getTopScorers(
    slug
) {

    if (!slug) {
        return [];
    }


    const data =
        await preziRequest(
            "/topscorers/",
            {
                sport:
                    PREZI_SPORT,

                slug:
                    slug
            }
        );


    return (
        data?.topscorers ||
        data?.players ||
        data?.results ||
        data?.data ||
        []
    );

}


/* =====================================================
   TEAM
===================================================== */

async function getTeam(
    slug
) {

    if (!slug) {
        return null;
    }


    const data =
        await preziRequest(
            "/team/",
            {
                sport:
                    PREZI_SPORT,

                slug:
                    slug
            }
        );


    return (
        data?.team ||
        data?.data ||
        data?.result ||
        null
    );

}


/* =====================================================
   PLAYER
===================================================== */

async function getPlayer(
    slug
) {

    if (!slug) {
        return null;
    }


    const data =
        await preziRequest(
            "/player/",
            {
                sport:
                    PREZI_SPORT,

                slug:
                    slug
            }
        );


    return (
        data?.player ||
        data?.data ||
        data?.result ||
        null
    );

}


/* =====================================================
   LIVE TRACKER
===================================================== */

async function getTracker(
    slug
) {

    if (!slug) {
        return null;
    }


    const data =
        await preziRequest(
            "/tracker/",
            {
                sport:
                    PREZI_SPORT,

                slug:
                    slug
            }
        );


    return (
        data?.tracker ||
        data?.data ||
        data?.result ||
        null
    );

}


/* =====================================================
   SEARCH TEAM
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
   API INFORMATION
===================================================== */

function getAPIStatus() {

    return {

        provider:
            "SportScore",

        sport:
            PREZI_SPORT,

        apiKeyRequired:
            false,

        cache:
            true,

        cacheTime:
            PREZI_CACHE_TIME,

        baseURL:
            PREZI_API_BASE

    };

}


/* =====================================================
   GLOBAL API
===================================================== */

window.PreziAPI = {

    /* MATCHES */

    getMatches,

    getNormalizedMatches,

    getLiveMatches,

    getFinishedMatches,

    getUpcomingMatches,


    /* DETAILS */

    getMatchBySlug,

    getMatchById,

    getMatchDetails,


    /* MATCH DATA */

    getMatchStatistics,

    getMatchEvents,

    getMatchLineups,

    getHeadToHead,


    /* COMPETITIONS */

    getCompetitions,

    getStandings,

    getTopScorers,


    /* TEAMS / PLAYERS */

    getTeam,

    getPlayer,


    /* LIVE */

    getTracker,


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
    "🌐 Provider: SportScore"
);

console.log(
    "🏆 Sport: Football"
);

console.log(
    "🔑 API KEY: NOT REQUIRED"
);

console.log(
    "💾 CACHE: 60 SECONDS"
);

console.log(
    "===================================="
);
