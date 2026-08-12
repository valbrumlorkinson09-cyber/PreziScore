"use strict";

/* =====================================================
   PREZISCORE
   SPORTSCORE API ENGINE
   PART 1 / 2
===================================================== */

const API_BASE =
    "https://sportscore.com/api/widget";

const SPORT =
    "football";

const CACHE_TIME =
    60000;

const cache =
    new Map();


/* =====================================================
   API REQUEST
===================================================== */

async function apiRequest(
    endpoint,
    params = {}
) {

    const url =
        new URL(
            API_BASE + endpoint
        );

    Object.entries(params)
        .forEach(
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


    const saved =
        cache.get(
            cacheKey
        );


    if (
        saved &&
        Date.now() -
        saved.time <
        CACHE_TIME
    ) {

        return saved.data;

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


    cache.set(
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
   GET RAW MATCHES
===================================================== */

async function getMatches(
    limit = 50
) {

    const data =
        await apiRequest(
            "/matches/",
            {
                sport:
                    SPORT,

                limit:
                    Math.min(
                        limit,
                        50
                    )
            }
        );


    if (
        Array.isArray(
            data
        )
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
   SMART TEAM
===================================================== */

function getTeam(
    match,
    side
) {

    const home =
        side === "home";


    const candidates = [

        home
            ? match.home
            : match.away,

        home
            ? match.home_team
            : match.away_team,

        home
            ? match.homeTeam
            : match.awayTeam,

        home
            ? match.team_home
            : match.team_away,

        match.teams?.[
            home
                ? "home"
                : "away"
        ],

        match.teams?.[
            home
                ? "home_team"
                : "away_team"
        ]

    ];


    return (
        candidates.find(
            item =>
                item &&
                typeof item ===
                "object"
        ) || {}
    );

}


/* =====================================================
   TEAM NAME
===================================================== */

function getTeamName(
    team
) {

    if (!team) {

        return "—";

    }


    return (

        team.name ||

        team.title ||

        team.team_name ||

        team.teamName ||

        team.display_name ||

        team.displayName ||

        team.short_name ||

        team.shortName ||

        team.label ||

        "—"

    );

}


/* =====================================================
   TEAM LOGO
===================================================== */

function getTeamLogo(
    team
) {

    if (!team) {

        return "";

    }


    return (

        team.logo ||

        team.image ||

        team.logo_url ||

        team.logoUrl ||

        team.image_url ||

        team.imageUrl ||

        team.icon ||

        ""

    );

}


/* =====================================================
   SCORE READER
===================================================== */

function getScore(
    match,
    side
) {

    const home =
        side === "home";


    const score =
        match.score ||
        match.scores ||
        match.result ||
        {};


    const values = [

        home
            ? score.home
            : score.away,

        home
            ? score.home_score
            : score.away_score,

        home
            ? score.homeScore
            : score.awayScore,

        home
            ? match.home_score
            : match.away_score,

        home
            ? match.homeScore
            : match.awayScore,

        home
            ? match.result?.home
            : match.result?.away

    ];


    const found =
        values.find(
            value =>
                value !==
                undefined &&
                value !== null
        );


    return found ?? null;

}


/* =====================================================
   STATUS READER
===================================================== */

function getStatus(
    match
) {

    const values = [

        match.status,

        match.state,

        match.status_text,

        match.statusText,

        match.match_status,

        match.matchStatus,

        match.game_status,

        match.gameStatus

    ];


    const found =
        values.find(
            value =>
                value !==
                undefined &&
                value !== null
        );


    return String(
        found || ""
    ).toLowerCase();

}


/* =====================================================
   MATCH NORMALIZER
===================================================== */

function normalizeMatch(
    match
) {

    if (!match) {

        return null;

    }


    const home =
        getTeam(
            match,
            "home"
        );


    const away =
        getTeam(
            match,
            "away"
        );


    const status =
        getStatus(
            match
        );


    let state =
        "upcoming";


    /* LIVE */

    if (

        status.includes("live") ||

        status.includes("playing") ||

        status.includes("inplay") ||

        status.includes("in-play") ||

        status.includes("in_play") ||

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

        status.includes("finished") ||

        status.includes("finish") ||

        status.includes("ended") ||

        status.includes("complete") ||

        status === "ft" ||

        status === "aet" ||

        status === "pen"

    ) {

        state =
            "finished";

    }


    return {

        id:
            match.id ??
            match.match_id ??
            match.event_id ??
            null,


        slug:
            match.slug ??
            match.match_slug ??
            match.event_slug ??
            "",


        status:
            state,


        statusText:
            match.status_text ||
            match.statusText ||
            match.status ||
            match.state ||
            "",


        minute:
            match.minute ??
            match.elapsed ??
            match.match_time ??
            null,


        date:
            match.date ??
            match.start_time ??
            match.startTime ??
            match.kickoff ??
            match.kickoff_time ??
            null,


        home: {

            id:
                home.id ??
                home.team_id ??
                home.teamId ??
                null,

            name:
                getTeamName(
                    home
                ),

            logo:
                getTeamLogo(
                    home
                ),

            score:
                getScore(
                    match,
                    "home"
                )

        },


        away: {

            id:
                away.id ??
                away.team_id ??
                away.teamId ??
                null,

            name:
                getTeamName(
                    away
                ),

            logo:
                getTeamLogo(
                    away
                ),

            score:
                getScore(
                    match,
                    "away"
                )

        },


        competition:
            match.competition?.name ||
            match.league?.name ||
            match.tournament?.name ||
            match.competition_name ||
            match.league_name ||
            "Football",


        competitionSlug:
            match.competition?.slug ||
            match.league?.slug ||
            match.tournament?.slug ||
            "",


        country:
            match.competition?.country ||
            match.league?.country ||
            "",


        venue:
            match.venue ||
            match.stadium ||
            "",


        referee:
            match.referee ||
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
   ALL MATCHES
===================================================== */

async function getAllMatches() {

    return await getNormalizedMatches();

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
                sport:
                    SPORT,

                slug:
                    slug
            }
        );


    return (
        data?.match ??
        data?.data ??
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
        await getMatches(
            50
        );


    const found =
        matches.find(
            match => {

                const matchId =
                    match?.id ??
                    match?.match_id ??
                    match?.event_id ??
                    null;


                return String(
                    matchId
                ) === String(id);

            }
        );


    if (!found) {

        return null;

    }


    return normalizeMatch(
        found
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

        data.team_stats ||

        data.match_statistics ||

        data.statistics_data ||

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

        data.match_events ||

        data.incidents ||

        data.match_incidents ||

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

        data.players ||

        data.squads ||

        []

    );

}


/* =====================================================
   TEAM INFO
===================================================== */

async function getTeamInfo(
    slug
) {

    if (!slug) {

        return null;

    }


    const data =
        await apiRequest(
            "/team/",
            {
                sport:
                    SPORT,

                slug:
                    slug
            }
        );


    return (
        data?.team ??
        data?.data ??
        data ??
        null
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
        await apiRequest(
            "/standings/",
            {
                sport:
                    SPORT,

                slug:
                    slug
            }
        );


    return (

        data?.standings ||

        data?.table ||

        data?.rows ||

        data?.teams ||

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
        await apiRequest(
            "/topscorers/",
            {
                sport:
                    SPORT,

                slug:
                    slug,

                stat:
                    "goals",

                limit:
                    50
            }
        );


    return (

        data?.players ||

        data?.topscorers ||

        data?.results ||

        data?.data ||

        []

    );

}


/* =====================================================
   TOP ASSISTS
===================================================== */

async function getTopAssists(
    slug
) {

    if (!slug) {

        return [];

    }


    const data =
        await apiRequest(
            "/topscorers/",
            {
                sport:
                    SPORT,

                slug:
                    slug,

                stat:
                    "assists",

                limit:
                    50
            }
        );


    return (

        data?.players ||

        data?.topscorers ||

        data?.results ||

        data?.data ||

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
                sport:
                    SPORT,

                slug:
                    slug
            }
        );


    return (

        data?.player ||

        data?.data ||

        data ||

        null

    );

}


/* =====================================================
   BRACKET
===================================================== */

async function getBracket(
    slug
) {

    if (!slug) {

        return [];

    }


    const data =
        await apiRequest(
            "/bracket/",
            {
                sport:
                    SPORT,

                slug:
                    slug
            }
        );


    return (

        data?.bracket ||

        data?.rounds ||

        data?.matches ||

        data?.data ||

        []

    );

}


/* =====================================================
   LIVE TRACKER
===================================================== */

async function getTracker(
    id
) {

    if (!id) {

        return null;

    }


    const data =
        await apiRequest(
            "/tracker/",
            {
                sport:
                    SPORT,

                id:
                    id
            }
        );


    return (

        data?.tracker ||

        data?.data ||

        data ||

        null

    );

}


/* =====================================================
   CACHE CLEAR
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
            API_BASE

    };

}


/* =====================================================
   GLOBAL PREZISCORE API
===================================================== */

window.PreziAPI = {

    /* MATCHES */

    getMatches,

    getAllMatches,

    getNormalizedMatches,

    getLiveMatches,

    getFinishedMatches,

    getUpcomingMatches,


    /* MATCH DETAILS */

    getMatchBySlug,

    getMatchById,

    getMatchDetails,

    getMatchStatistics,

    getMatchEvents,

    getMatchLineups,


    /* TEAMS */

    getTeamInfo,


    /* COMPETITIONS */

    getStandings,

    getTopScorers,

    getTopAssists,

    getBracket,


    /* PLAYERS */

    getPlayer,


    /* LIVE */

    getTracker,


    /* HELPERS */

    normalizeMatch,

    clearCache,

    getAPIStatus

};


/* =====================================================
   PREZISCORE READY
===================================================== */

console.log(
    "===================================="
);

console.log(
    "⚽ PREZISCORE API READY"
);

console.log(
    "🌐 SportScore"
);

console.log(
    "🔑 API KEY: NONE"
);

console.log(
    "💾 CACHE: 60 SECONDS"
);

console.log(
    "===================================="
);
