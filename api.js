"use strict";

/* =========================================
   PREZISCORE — SPORTSCORE API
========================================= */

const API_BASE =
    "https://sportscore.com/api/widget";

const SPORT = "football";

const CACHE_TIME = 60000;

const cache = new Map();


/* =========================================
   REQUEST
========================================= */

async function request(
    endpoint,
    params = {}
) {

    const url =
        new URL(
            API_BASE + endpoint
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

    const key =
        url.toString();

    const old =
        cache.get(key);

    if (
        old &&
        Date.now() - old.time <
        CACHE_TIME
    ) {

        return old.data;

    }

    const res =
        await fetch(key, {
            method: "GET",
            headers: {
                Accept:
                    "application/json"
            }
        });

    if (!res.ok) {

        throw new Error(
            "SportScore HTTP " +
            res.status
        );

    }

    const data =
        await res.json();

    cache.set(
        key,
        {
            time: Date.now(),
            data: data
        }
    );

    return data;
}


/* =========================================
   RAW MATCHES
========================================= */

async function getMatches(
    limit = 50
) {

    const data =
        await request(
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
        data.matches
    )
        ? data.matches
        : [];
}


/* =========================================
   TEAM EXTRACTOR
========================================= */

function getTeam(
    match,
    side
) {

    const team =
        side === "home"
            ? match.home
            : match.away;

    if (team) {

        return team;

    }

    const teamObject =
        side === "home"
            ? match.homeTeam
            : match.awayTeam;

    if (teamObject) {

        return teamObject;

    }

    const nested =
        match.teams;

    if (nested) {

        return side === "home"
            ? nested.home
            : nested.away;

    }

    return {};
}


/* =========================================
   TEAM NAME
========================================= */

function teamName(
    team
) {

    return (
        team.name ||
        team.title ||
        team.team_name ||
        team.short_name ||
        "—"
    );

}


/* =========================================
   TEAM LOGO
========================================= */

function teamLogo(
    team
) {

    return (
        team.logo ||
        team.image ||
        team.logo_url ||
        team.icon ||
        ""
    );

}


/* =========================================
   SCORE
========================================= */

function getScore(
    match,
    side
) {

    const score =
        match.score ||
        match.scores ||
        {};

    if (
        side === "home"
    ) {

        return (
            score.home ??
            score.home_score ??
            match.home_score ??
            null
        );

    }

    return (
        score.away ??
        score.away_score ??
        match.away_score ??
        null
    );

}


/* =========================================
   MATCH NORMALIZER
========================================= */

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
        String(
            match.status ||
            match.state ||
            match.status_text ||
            ""
        ).toLowerCase();

    let state =
        "upcoming";


    if (
        status.includes("live") ||
        status.includes("playing") ||
        status.includes("in-play") ||
        status.includes("in_play")
    ) {

        state = "live";

    }


    if (
        status.includes("finished") ||
        status.includes("ended") ||
        status === "ft" ||
        status.includes("complete")
    ) {

        state = "finished";

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
            "",

        status:
            state,

        statusText:
            match.status_text ||
            match.status ||
            match.state ||
            "",

        minute:
            match.minute ??
            match.elapsed ??
            null,

        date:
            match.date ??
            match.start_time ??
            match.kickoff ??
            null,

        home: {

            id:
                home.id ??
                home.team_id ??
                null,

            name:
                teamName(home),

            logo:
                teamLogo(home),

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
                null,

            name:
                teamName(away),

            logo:
                teamLogo(away),

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

        raw:
            match

    };

}


/* =========================================
   NORMALIZED MATCHES
========================================= */

async function getNormalizedMatches() {

    const matches =
        await getMatches(50);

    return matches
        .map(normalizeMatch)
        .filter(Boolean);

}


/* =========================================
   LIVE MATCHES
========================================= */

async function getLiveMatches() {

    const matches =
        await getNormalizedMatches();

    return matches.filter(
        match =>
            match.status === "live"
    );

}


/* =========================================
   FINISHED MATCHES
========================================= */

async function getFinishedMatches() {

    const matches =
        await getNormalizedMatches();

    return matches.filter(
        match =>
            match.status === "finished"
    );

}


/* =========================================
   UPCOMING MATCHES
========================================= */

async function getUpcomingMatches() {

    const matches =
        await getNormalizedMatches();

    return matches.filter(
        match =>
            match.status === "upcoming"
    );

}


/* =========================================
   ALL MATCHES
========================================= */

async function getAllMatches() {

    return await getNormalizedMatches();

                   }
/* =========================================
   MATCH DETAILS
========================================= */

async function getMatchBySlug(
    slug
) {

    if (!slug) return null;

    const data =
        await request(
            "/match/",
            {
                sport: SPORT,
                slug: slug
            }
        );

    return (
        data.match ||
        data
    );

}


/* =========================================
   MATCH DETAILS BY ID
========================================= */

async function getMatchById(
    id
) {

    if (!id) return null;

    const matches =
        await getMatches(50);

    const match =
        matches.find(
            item =>
                String(
                    item.id ??
                    item.match_id ??
                    item.event_id ??
                    ""
                ) === String(id)
        );

    if (!match) {

        return null;

    }

    return normalizeMatch(
        match
    );

}


/* =========================================
   STATISTICS
========================================= */

async function getMatchStatistics(
    slug
) {

    const data =
        await getMatchBySlug(
            slug
        );

    if (!data) return [];

    return (
        data.statistics ||
        data.stats ||
        data.team_stats ||
        []
    );

}


/* =========================================
   EVENTS / TIMELINE
========================================= */

async function getMatchEvents(
    slug
) {

    const data =
        await getMatchBySlug(
            slug
        );

    if (!data) return [];

    return (
        data.timeline ||
        data.events ||
        data.match_events ||
        []
    );

}


/* =========================================
   LINEUPS
========================================= */

async function getMatchLineups(
    slug
) {

    const data =
        await getMatchBySlug(
            slug
        );

    if (!data) return [];

    return (
        data.lineups ||
        data.lineup ||
        []
    );

}


/* =========================================
   TEAM
========================================= */

async function getTeamInfo(
    slug
) {

    if (!slug) return null;

    return await request(
        "/team/",
        {
            sport: SPORT,
            slug: slug
        }
    );

}


/* =========================================
   STANDINGS
========================================= */

async function getStandings(
    slug
) {

    if (!slug) return [];

    const data =
        await request(
            "/standings/",
            {
                sport: SPORT,
                slug: slug
            }
        );

    return (
        data.standings ||
        data.table ||
        data.teams ||
        []
    );

}


/* =========================================
   TOP SCORERS
========================================= */

async function getTopScorers(
    slug
) {

    if (!slug) return [];

    const data =
        await request(
            "/topscorers/",
            {
                sport: SPORT,
                slug: slug,
                stat: "goals",
                limit: 50
            }
        );

    return (
        data.players ||
        data.topscorers ||
        data.results ||
        []
    );

}


/* =========================================
   TOP ASSISTS
========================================= */

async function getTopAssists(
    slug
) {

    if (!slug) return [];

    const data =
        await request(
            "/topscorers/",
            {
                sport: SPORT,
                slug: slug,
                stat: "assists",
                limit: 50
            }
        );

    return (
        data.players ||
        data.topscorers ||
        data.results ||
        []
    );

}


/* =========================================
   PLAYER
========================================= */

async function getPlayer(
    slug
) {

    if (!slug) return null;

    const data =
        await request(
            "/player/",
            {
                sport: SPORT,
                slug: slug
            }
        );

    return (
        data.player ||
        data
    );

}


/* =========================================
   BRACKET
========================================= */

async function getBracket(
    slug
) {

    if (!slug) return [];

    const data =
        await request(
            "/bracket/",
            {
                sport: SPORT,
                slug: slug
            }
        );

    return (
        data.bracket ||
        data.rounds ||
        data.matches ||
        []
    );

}


/* =========================================
   LIVE TRACKER
========================================= */

async function getTracker(
    id
) {

    if (!id) return null;

    return await request(
        "/tracker/",
        {
            sport: SPORT,
            id: id
        }
    );

}


/* =========================================
   CLEAR CACHE
========================================= */

function clearCache() {

    cache.clear();

    console.log(
        "🧹 PreziScore cache cleared"
    );

}


/* =========================================
   API INFORMATION
========================================= */

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


/* =========================================
   GLOBAL API
========================================= */

window.PreziAPI = {

    /* MATCHES */

    getMatches,

    getAllMatches,

    getNormalizedMatches,

    getLiveMatches,

    getFinishedMatches,

    getUpcomingMatches,


    /* MATCH */

    getMatchBySlug,

    getMatchById,

    getMatchStatistics,

    getMatchEvents,

    getMatchLineups,


    /* TEAM */

    getTeamInfo,


    /* COMPETITION */

    getStandings,

    getTopScorers,

    getTopAssists,

    getBracket,


    /* PLAYER */

    getPlayer,


    /* TRACKER */

    getTracker,


    /* UTILITIES */

    normalizeMatch,

    clearCache,

    getAPIStatus

};


/* =========================================
   READY
========================================= */

console.log(
    "================================="
);

console.log(
    "⚽ PREZISCORE API READY"
);

console.log(
    "🌐 Provider: SportScore"
);

console.log(
    "🔑 API KEY: NOT REQUIRED"
);

console.log(
    "💾 CACHE: 60 SECONDS"
);

console.log(
    "================================="
);
