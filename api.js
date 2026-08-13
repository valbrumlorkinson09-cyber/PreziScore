"use strict";

/* =====================================================
   PREZISCORE — API ENGINE FINAL
   PART 1 / 2
===================================================== */

const PREZI_API_BASE =
    "https://sportscore.com/api/widget";

const PREZI_SPORT = "football";

const PREZI_CACHE_TIME = 30000;

const PREZI_CACHE = new Map();


/* =====================================================
   REQUEST
===================================================== */

async function preziRequest(endpoint, params = {}) {

    const url = new URL(
        PREZI_API_BASE + endpoint
    );

    Object.entries(params).forEach(
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

    const cacheKey = url.toString();

    const cached =
        PREZI_CACHE.get(cacheKey);

    if (
        cached &&
        Date.now() - cached.time <
        PREZI_CACHE_TIME
    ) {

        return cached.data;

    }

    const response = await fetch(
        url.toString(),
        {
            method: "GET",
            headers: {
                "Accept":
                    "application/json"
            }
        }
    );

    if (!response.ok) {

        throw new Error(
            "API HTTP " +
            response.status
        );

    }

    const data =
        await response.json();

    PREZI_CACHE.set(
        cacheKey,
        {
            time: Date.now(),
            data: data
        }
    );

    return data;
}


/* =====================================================
   GET RAW MATCHES
===================================================== */

async function getMatches() {

    const data =
        await preziRequest(
            "/matches/",
            {
                sport: PREZI_SPORT,
                limit: 50
            }
        );

    /*
       Nou aksepte plizyè format
       pou API a pa kraze.
    */

    if (
        Array.isArray(data)
    ) {

        return data;

    }

    if (
        Array.isArray(
            data?.matches
        )
    ) {

        return data.matches;

    }

    if (
        Array.isArray(
            data?.data
        )
    ) {

        return data.data;

    }

    if (
        Array.isArray(
            data?.results
        )
    ) {

        return data.results;

    }

    return [];
}


/* =====================================================
   STATUS NORMALIZATION
===================================================== */

function normalizeStatus(match) {

    const status = String(
        match?.status ||
        match?.status_text ||
        match?.state ||
        ""
    )
    .toLowerCase()
    .trim();


    /* LIVE */

    const liveStatuses = [

        "live",
        "in_play",
        "in-play",
        "in progress",
        "in_progress",
        "playing",
        "ongoing",
        "started",
        "1h",
        "2h",
        "ht",
        "et",
        "bt",
        "p",
        "first_half",
        "second_half"

    ];


    if (
        liveStatuses.includes(status) ||
        status.includes("live") ||
        status.includes("progress")
    ) {

        return "live";

    }


    /* FINISHED */

    const finishedStatuses = [

        "finished",
        "finish",
        "ended",
        "completed",
        "ft",
        "full_time",
        "full time",
        "aet",
        "pen"

    ];


    if (
        finishedStatuses.includes(status) ||
        status.includes("finished") ||
        status.includes("ended")
    ) {

        return "finished";

    }


    return "upcoming";
}


/* =====================================================
   SCORE
===================================================== */

function normalizeScore(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }

    const n = Number(value);

    return Number.isNaN(n)
        ? null
        : n;
}


/* =====================================================
   SLUG
===================================================== */

function getMatchSlug(match) {

    const url =
        String(
            match?.url || ""
        );

    if (!url) {

        return "";

    }

    return url
        .replace(
            /^\/football\/match\//,
            ""
        )
        .replace(
            /\/$/,
            ""
        );
}


/* =====================================================
   NORMALIZE MATCH
===================================================== */

function normalizeMatch(match) {

    if (!match) {

        return null;

    }

    const slug =
        getMatchSlug(match);


    return {

        id:
            slug ||
            match.id ||
            null,

        slug:
            slug,

        url:
            match.url || "",


        status:
            normalizeStatus(
                match
            ),

        statusRaw:
            match.status || "",

        statusText:
            match.status_text || "",


        time:
            match.time || null,

        date:
            match.time || null,


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


        competition:
            match.competition ||
            "Football",

        competitionLogo:
            match.competition_logo ||
            "",


        raw:
            match

    };
}


/* =====================================================
   NORMALIZED MATCHES
===================================================== */

async function getNormalizedMatches() {

    const raw =
        await getMatches();

    return raw
        .map(normalizeMatch)
        .filter(Boolean);

}


/* =====================================================
   FILTERS
===================================================== */

async function getLiveMatches() {

    const matches =
        await getNormalizedMatches();

    return matches.filter(
        m => m.status === "live"
    );
}


async function getFinishedMatches() {

    const matches =
        await getNormalizedMatches();

    return matches.filter(
        m => m.status === "finished"
    );
}


async function getUpcomingMatches() {

    const matches =
        await getNormalizedMatches();

    return matches.filter(
        m => m.status === "upcoming"
    );
       }
/* =====================================================
   PREZISCORE — API ENGINE FINAL
   PART 2 / 2
===================================================== */


/* =====================================================
   MATCH DETAILS
===================================================== */

async function getMatchBySlug(slug) {

    if (!slug) {
        return null;
    }

    const cleanSlug =
        String(slug)
            .replace(
                /^\/football\/match\//,
                ""
            )
            .replace(
                /\/$/,
                ""
            );

    const data =
        await preziRequest(
            "/match/",
            {
                sport: PREZI_SPORT,
                slug: cleanSlug
            }
        );

    return (
        data?.match ||
        data?.data ||
        data?.result ||
        data ||
        null
    );
}


async function getMatchById(id) {

    return await getMatchBySlug(id);

}


async function getMatchDetails(slug) {

    return await getMatchBySlug(slug);

}


/* =====================================================
   MATCH STATISTICS
===================================================== */

async function getMatchStatistics(slug) {

    const data =
        await getMatchBySlug(slug);

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
        await getMatchBySlug(slug);

    if (!data) {
        return [];
    }

    return (
        data.events ||
        data.timeline ||
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
        await getMatchBySlug(slug);

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

    try {

        const data =
            await preziRequest(
                "/h2h/",
                {
                    sport: PREZI_SPORT,
                    home: home,
                    away: away
                }
            );

        return (
            data?.matches ||
            data?.h2h ||
            data?.data ||
            []
        );

    } catch (error) {

        console.log(
            "H2H indisponible"
        );

        return [];

    }
}


/* =====================================================
   COMPETITIONS
===================================================== */

async function getCompetitions() {

    try {

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

    } catch (error) {

        console.log(
            "Competitions indisponibles"
        );

        return [];

    }
}


/* =====================================================
   STANDINGS
===================================================== */

async function getStandings(slug) {

    if (!slug) {
        return [];
    }

    try {

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

    } catch (error) {

        console.log(
            "Classement indisponible"
        );

        return [];

    }
}


/* =====================================================
   TOP SCORERS
===================================================== */

async function getTopScorers(slug) {

    if (!slug) {
        return [];
    }

    try {

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

    } catch (error) {

        console.log(
            "Top scorers indisponible"
        );

        return [];

    }
}


/* =====================================================
   TEAM
===================================================== */

async function getTeam(slug) {

    if (!slug) {
        return null;
    }

    try {

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

    } catch (error) {

        return null;

    }
}


/* =====================================================
   PLAYER
===================================================== */

async function getPlayer(slug) {

    if (!slug) {
        return null;
    }

    try {

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

    } catch (error) {

        return null;

    }
}


/* =====================================================
   LIVE TRACKER
===================================================== */

async function getTracker(slug) {

    if (!slug) {
        return null;
    }

    try {

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

    } catch (error) {

        return null;

    }
}


/* =====================================================
   SEARCH TEAM
===================================================== */

async function searchTeam(query) {

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
        "🧹 PREZISCORE CACHE CLEARED"
    );
}


/* =====================================================
   API STATUS
===================================================== */

function getAPIStatus() {

    return {

        provider:
            "SportScore",

        sport:
            "football",

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
   GLOBAL PREZI API
===================================================== */

window.PreziAPI = {

    /* MATCHES */

    getMatches:
        getMatches,

    getNormalizedMatches:
        getNormalizedMatches,

    getLiveMatches:
        getLiveMatches,

    getFinishedMatches:
        getFinishedMatches,

    getUpcomingMatches:
        getUpcomingMatches,


    /* DETAILS */

    getMatchBySlug:
        getMatchBySlug,

    getMatchById:
        getMatchById,

    getMatchDetails:
        getMatchDetails,


    /* MATCH DATA */

    getMatchStatistics:
        getMatchStatistics,

    getMatchEvents:
        getMatchEvents,

    getMatchLineups:
        getMatchLineups,

    getHeadToHead:
        getHeadToHead,


    /* COMPETITIONS */

    getCompetitions:
        getCompetitions,

    getStandings:
        getStandings,

    getTopScorers:
        getTopScorers,


    /* TEAM / PLAYER */

    getTeam:
        getTeam,

    getPlayer:
        getPlayer,


    /* LIVE */

    getTracker:
        getTracker,


    /* SEARCH */

    searchTeam:
        searchTeam,


    /* SYSTEM */

    clearCache:
        clearPreziCache,

    getAPIStatus:
        getAPIStatus

};


/* =====================================================
   READY
===================================================== */

console.log(
    "================================="
);

console.log(
    "⚽ PREZISCORE API READY"
);

console.log(
    "🏆 FOOTBALL"
);

console.log(
    "🔑 NO API KEY"
);

console.log(
    "💾 CACHE: 30 SECONDS"
);

console.log(
    "================================="
);
