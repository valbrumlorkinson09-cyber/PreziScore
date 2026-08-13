"use strict";

/* =====================================================
   PREZISCORE — SPORTSCORE API
   API ENGINE — FINAL
   ===================================================== */

const PREZI_API_BASE =
    "https://sportscore.com/api/widget";

const PREZI_SPORT =
    "football";

const PREZI_CACHE_TIME =
    30000;

const PREZI_CACHE =
    new Map();


/* =====================================================
   REQUEST
===================================================== */

async function preziRequest(
    endpoint,
    params = {}
) {

    const url =
        new URL(
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


    const cacheKey =
        url.toString();


    const cached =
        PREZI_CACHE.get(cacheKey);


    if (
        cached &&
        Date.now() - cached.time <
        PREZI_CACHE_TIME
    ) {

        return cached.data;

    }


    const response =
        await fetch(
            url.toString(),
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                },

                cache: "no-store"
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
            time: Date.now(),
            data: data
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
   NORMALIZE STATUS
===================================================== */

function normalizeStatus(match) {

    const status =
        String(
            match?.status ??
            match?.state ??
            match?.match_status ??
            ""
        )
        .toLowerCase()
        .trim();


    const statusText =
        String(
            match?.status_text ??
            match?.statusText ??
            match?.state_text ??
            ""
        )
        .toLowerCase()
        .trim();


    const combined =
        (
            status +
            " " +
            statusText
        )
        .toLowerCase();


    /* =========================================
       LIVE
    ========================================= */

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

        "first half",
        "second half",
        "half time",
        "halftime"

    ];


    if (
        liveStatuses.includes(status) ||
        liveStatuses.includes(statusText) ||

        combined.includes("live") ||
        combined.includes("in play") ||
        combined.includes("in_play") ||
        combined.includes("playing") ||
        combined.includes("ongoing") ||
        combined.includes("progress") ||

        status === "1h" ||
        status === "2h" ||
        status === "ht" ||
        status === "et" ||
        status === "bt"

    ) {

        return "live";

    }


    /* =========================================
       FINISHED
    ========================================= */

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
        finishedStatuses.includes(statusText) ||

        combined.includes("finished") ||
        combined.includes("ended") ||
        combined.includes("completed") ||
        combined.includes("full time")

    ) {

        return "finished";

    }


    /* =========================================
       UPCOMING
    ========================================= */

    return "upcoming";

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


    if (
        Number.isNaN(number)
    ) {

        return null;

    }


    return number;

}


/* =====================================================
   NORMALIZE MATCH
===================================================== */

function normalizeMatch(match) {

    if (!match) {
        return null;
    }


    const state =
        normalizeStatus(match);


    /* =========================================
       SLUG
    ========================================= */

    let slug = "";


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


    if (!slug) {

        slug =
            match.slug ||
            match.match_slug ||
            "";

    }


    /* =========================================
       HOME
    ========================================= */

    let homeName =
        match.home;


    if (
        typeof homeName ===
        "object"
    ) {

        homeName =
            homeName.name ||
            homeName.title ||
            "";

    }


    homeName =
        homeName ||
        match.home_name ||
        match.home_team_name ||
        match.home_team?.name ||
        "Équipe domicile";


    let homeLogo =
        match.home_logo ||
        match.home_team_logo ||
        match.home_team?.logo ||
        "";


    let homeScore =
        match.home_score;


    if (
        homeScore === undefined ||
        homeScore === null
    ) {

        homeScore =
            match.homeScore ??
            match.home_team?.score ??
            match.home?.score;

    }


    /* =========================================
       AWAY
    ========================================= */

    let awayName =
        match.away;


    if (
        typeof awayName ===
        "object"
    ) {

        awayName =
            awayName.name ||
            awayName.title ||
            "";

    }


    awayName =
        awayName ||
        match.away_name ||
        match.away_team_name ||
        match.away_team?.name ||
        "Équipe visiteuse";


    let awayLogo =
        match.away_logo ||
        match.away_team_logo ||
        match.away_team?.logo ||
        "";


    let awayScore =
        match.away_score;


    if (
        awayScore === undefined ||
        awayScore === null
    ) {

        awayScore =
            match.awayScore ??
            match.away_team?.score ??
            match.away?.score;

    }


    /* =========================================
       COMPETITION
    ========================================= */

    let competition =
        match.competition;


    if (
        typeof competition ===
        "object"
    ) {

        competition =
            competition.name ||
            competition.title ||
            "";

    }


    competition =
        competition ||
        match.competition_name ||
        match.league_name ||
        match.tournament_name ||
        match.league?.name ||
        match.tournament?.name ||
        "Football";


    /* =========================================
       RETURN
    ========================================= */

    return {

        id:
            match.id ||
            slug ||
            null,


        slug:
            slug,


        url:
            match.url ||
            "",


        status:
            state,


        statusRaw:
            match.status ||
            match.state ||
            "",


        statusText:
            match.status_text ||
            match.statusText ||
            "",


        time:
            match.time ||
            match.date ||
            match.start_time ||
            null,


        date:
            match.time ||
            match.date ||
            match.start_time ||
            null,


        home: {

            name:
                String(
                    homeName
                ).trim(),

            logo:
                String(
                    homeLogo || ""
                ).trim(),

            score:
                normalizeScore(
                    homeScore
                )

        },


        away: {

            name:
                String(
                    awayName
                ).trim(),

            logo:
                String(
                    awayLogo || ""
                ).trim(),

            score:
                normalizeScore(
                    awayScore
                )

        },


        competition:
            String(
                competition
            ).trim(),


        competitionLogo:
            match.competition_logo ||
            match.league_logo ||
            "",


        raw:
            match

    };

}


/* =====================================================
   NORMALIZED MATCHES
===================================================== */

async function getNormalizedMatches() {

    const matches =
        await getMatches(50);


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
   MATCH BY SLUG
===================================================== */

async function getMatchBySlug(
    slug
) {

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
                sport:
                    PREZI_SPORT,

                slug:
                    cleanSlug
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


/* =====================================================
   MATCH DETAILS
===================================================== */

async function getMatchDetails(
    slug
) {

    return await getMatchBySlug(
        slug
    );

}


/* =====================================================
   MATCH BY ID
===================================================== */

async function getMatchById(
    id
) {

    return await getMatchBySlug(
        id
    );

}


/* =====================================================
   STATISTICS
===================================================== */

async function getMatchStatistics(
    slug
) {

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
   EVENTS
===================================================== */

async function getMatchEvents(
    slug
) {

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

async function getMatchLineups(
    slug
) {

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
   H2H
===================================================== */

async function getHeadToHead(
    home,
    away
) {

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
   TRACKER
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
   GLOBAL API
===================================================== */

window.PreziAPI = {

    getMatches,

    getNormalizedMatches,

    getLiveMatches,

    getFinishedMatches,

    getUpcomingMatches,

    getMatchBySlug,

    getMatchById,

    getMatchDetails,

    getMatchStatistics,

    getMatchEvents,

    getMatchLineups,

    getHeadToHead,

    getCompetitions,

    getStandings,

    getTopScorers,

    getTeam,

    getPlayer,

    getTracker,

    searchTeam,

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
    "🌐 Provider: SportScor
   );

console.log(
    "🏆 Sport: Football"
);

console.log(
    "🔑 API KEY: NOT REQUIRED"
);

console.log(
    "🔴 LIVE DETECTION: ENABLED"
);

console.log(
    "💾 CACHE: 30 SECONDS"
);

console.log(
    "===================================="
);
