"use strict";

/* =====================================================
   PREZISCORE — SPORTSCORE API
   NO API KEY
===================================================== */

const SPORT_API_URL =
    "https://sportscore.com/api/widget";

const SPORT = "football";

const CACHE_TIME = 60000;

const cache = new Map();


/* =====================================================
   API REQUEST
===================================================== */

async function apiRequest(
    endpoint,
    params = {}
) {

    const url =
        new URL(
            SPORT_API_URL + endpoint
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

    url.searchParams.set(
        "src",
        "preziscore"
    );

    const cacheKey =
        url.toString();

    const cached =
        cache.get(cacheKey);

    if (
        cached &&
        Date.now() - cached.time <
        CACHE_TIME
    ) {

        return cached.data;

    }

    const response =
        await fetch(
            cacheKey,
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
            "SportScore HTTP " +
            response.status
        );

    }

    const data =
        await response.json();

    cache.set(
        cacheKey,
        {
            time: Date.now(),
            data: data
        }
    );

    return data;
}


/* =====================================================
   LIVE MATCHES
===================================================== */

async function getLiveMatches(
    limit = 50
) {

    const data =
        await apiRequest(
            "/matches/",
            {
                sport: SPORT,
                limit: Math.min(
                    limit,
                    50
                )
            }
        );

    return Array.isArray(
        data?.matches
    )
        ? data.matches
        : [];
}


/* =====================================================
   TODAY MATCHES
===================================================== */

async function getTodayMatches(
    limit = 50
) {

    return await getLiveMatches(
        limit
    );

}


/* =====================================================
   ALL TODAY MATCHES
===================================================== */

async function getAllTodayMatches() {

    return await getTodayMatches(
        50
    );

}


/* =====================================================
   NORMALIZE MATCH
===================================================== */

function normalizeMatch(
    match
) {

    if (!match) {
        return null;
    }

    const id =
        match.id ??
        match.match_id ??
        match.event_id ??
        null;

    const slug =
        match.slug ??
        match.match_slug ??
        "";

    const home =
        match.home ??
        match.home_team ??
        match.team_home ??
        {};

    const away =
        match.away ??
        match.away_team ??
        match.team_away ??
        {};

    const score =
        match.score ??
        match.scores ??
        {};

    const status =
        String(
            match.status ??
            match.state ??
            ""
        ).toLowerCase();

    let state =
        "upcoming";


    if (
        status.includes("live") ||
        status.includes("playing") ||
        status.includes("in_play")
    ) {

        state = "live";

    }


    if (
        status.includes("finished") ||
        status.includes("ended") ||
        status.includes("ft") ||
        status.includes("complete")
    ) {

        state = "finished";

    }


    return {

        id: id,

        slug: slug,

        status: state,

        statusShort:
            match.status ??
            match.state ??
            "",

        statusLong:
            match.status_text ??
            match.status_long ??
            "",

        minute:
            match.minute ??
            match.elapsed ??
            null,

        time:
            match.date ??
            match.start_time ??
            match.kickoff ??
            null,

        venue:
            match.venue ??
            match.stadium ??
            "",

        referee:
            match.referee ??
            "",

        competition:
            match.competition?.name ??
            match.league?.name ??
            match.tournament?.name ??
            "Football",

        leagueId:
            match.competition?.id ??
            match.league?.id ??
            null,

        leagueLogo:
            match.competition?.logo ??
            match.league?.logo ??
            null,

        country:
            match.competition?.country ??
            match.league?.country ??
            "",

        home: {

            id:
                home.id ??
                home.team_id ??
                null,

            name:
                home.name ??
                home.team_name ??
                "Équipe domicile",

            logo:
                home.logo ??
                home.image ??
                home.logo_url ??
                null,

            score:
                score.home ??
                score.home_score ??
                match.home_score ??
                null

        },

        away: {

            id:
                away.id ??
                away.team_id ??
                null,

            name:
                away.name ??
                away.team_name ??
                "Équipe visiteuse",

            logo:
                away.logo ??
                away.image ??
                away.logo_url ??
                null,

            score:
                score.away ??
                score.away_score ??
                match.away_score ??
                null

        },

        raw: match

    };

}


/* =====================================================
   NORMALIZED MATCHES
===================================================== */

async function getNormalizedMatches() {

    const matches =
        await getAllTodayMatches();

    return matches
        .map(normalizeMatch)
        .filter(Boolean);

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

    const data =
        await apiRequest(
            "/match/",
            {
                sport: SPORT,
                slug: slug
            }
        );

    return (
        data?.match ??
        data ??
        null
    );

}


/* =====================================================
   MATCH BY ID
===================================================== */

async function getMatchById(
    id
) {

    if (!id) {
        return null;
    }

    const matches =
        await getLiveMatches(50);

    const found =
        matches.find(
            match => {

                return String(
                    match?.id ??
                    match?.match_id ??
                    match?.event_id ??
                    ""
                ) ===
                String(id);

            }
        );

    if (found) {

        return normalizeMatch(
            found
        );

    }

    return null;

}


/* =====================================================
   MATCH DETAILS
===================================================== */

async function getMatchDetails(
    slug
) {

    if (!slug) {
        return null;
    }

    const data =
        await apiRequest(
            "/match/",
            {
                sport: SPORT,
                slug: slug
            }
        );

    return (
        data?.match ??
        data ??
        null
    );

}
/* =====================================================
   MATCH STATISTICS
===================================================== */

async function getMatchStatistics(
    slug
) {

    const data =
        await getMatchDetails(
            slug
        );

    if (!data) {
        return [];
    }

    return (
        data.statistics ??
        data.stats ??
        data.team_stats ??
        []
    );

}


/* =====================================================
   MATCH EVENTS
===================================================== */

async function getMatchEvents(
    slug
) {

    const data =
        await getMatchDetails(
            slug
        );

    if (!data) {
        return [];
    }

    return (
        data.timeline ??
        data.events ??
        data.match_events ??
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
        await getMatchDetails(
            slug
        );

    if (!data) {
        return [];
    }

    return (
        data.lineups ??
        data.lineup ??
        []
    );

}


/* =====================================================
   TEAM
===================================================== */

async function getTeam(
    slug,
    limit = 30
) {

    if (!slug) {
        return null;
    }

    return await apiRequest(
        "/team/",
        {
            sport: SPORT,
            slug: slug,
            limit: Math.min(
                limit,
                30
            )
        }
    );

}


/* =====================================================
   STANDINGS
===================================================== */

async function getStandings(
    competitionSlug
) {

    if (!competitionSlug) {
        return [];
    }

    const data =
        await apiRequest(
            "/standings/",
            {
                sport: SPORT,
                slug: competitionSlug
            }
        );

    return (
        data?.standings ??
        data?.table ??
        data?.teams ??
        []
    );

}


/* =====================================================
   TOP SCORERS
===================================================== */

async function getTopScorers(
    competitionSlug,
    limit = 50
) {

    if (!competitionSlug) {
        return [];
    }

    const data =
        await apiRequest(
            "/topscorers/",
            {
                sport: SPORT,
                slug: competitionSlug,
                limit: Math.min(
                    limit,
                    50
                ),
                stat: "goals"
            }
        );

    return (
        data?.players ??
        data?.topscorers ??
        data?.results ??
        []
    );

}


/* =====================================================
   TOP ASSISTS
===================================================== */

async function getTopAssists(
    competitionSlug,
    limit = 50
) {

    if (!competitionSlug) {
        return [];
    }

    const data =
        await apiRequest(
            "/topscorers/",
            {
                sport: SPORT,
                slug: competitionSlug,
                limit: Math.min(
                    limit,
                    50
                ),
                stat: "assists"
            }
        );

    return (
        data?.players ??
        data?.topscorers ??
        data?.results ??
        []
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
        await apiRequest(
            "/player/",
            {
                sport: SPORT,
                slug: slug
            }
        );

    return (
        data?.player ??
        data ??
        null
    );

}


/* =====================================================
   BRACKET
===================================================== */

async function getBracket(
    competitionSlug
) {

    if (!competitionSlug) {
        return [];
    }

    const data =
        await apiRequest(
            "/bracket/",
            {
                sport: SPORT,
                slug: competitionSlug
            }
        );

    return (
        data?.bracket ??
        data?.rounds ??
        data?.matches ??
        []
    );

}


/* =====================================================
   TRACKER
===================================================== */

async function getTracker(
    matchId
) {

    if (!matchId) {
        return null;
    }

    return await apiRequest(
        "/tracker/",
        {
            sport: SPORT,
            id: matchId
        }
    );

}


/* =====================================================
   HEAD TO HEAD
===================================================== */

async function getHeadToHead(
    team1,
    team2
) {

    if (!team1 || !team2) {
        return [];
    }

    return [];

}


/* =====================================================
   CLEAR CACHE
===================================================== */

function clearCache() {

    cache.clear();

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
            "SportScore",

        sport:
            SPORT,

        apiKey:
            false,

        cache:
            true,

        cacheTime:
            CACHE_TIME,

        baseURL:
            SPORT_API_URL

    };

}


/* =====================================================
   GLOBAL PREZISCORE API
===================================================== */

window.PreziAPI = {

    /* MATCHES */

    getLiveMatches,

    getTodayMatches,

    getAllTodayMatches,

    getNormalizedMatches,


    /* MATCH DETAILS */

    getMatchById,

    getMatchBySlug,

    getMatchDetails,

    getMatchStatistics,

    getMatchEvents,

    getMatchLineups,


    /* TEAMS */

    getTeam,


    /* COMPETITIONS */

    getStandings,

    getTopScorers,

    getTopAssists,

    getBracket,


    /* PLAYERS */

    getPlayer,


    /* TRACKER */

    getTracker,


    /* H2H */

    getHeadToHead,


    /* HELPERS */

    normalizeMatch,

    clearCache,

    getAPIStatus

};


/* =====================================================
   READY
===================================================== */

console.log(
    "✅ PreziScore — SportScore API READY"
);

console.log(
    "🔑 API Key: NOT REQUIRED"
);

console.log(
    "⚽ Football API active"
);

console.log(
    "💾 Cache: 60 seconds"
);
