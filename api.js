"use strict";

/* =========================================================
   PREZISCORE — API.JS
   PART 1 / 3
========================================================= */

const PreziAPI = (() => {

    const BASE_URL =
        "https://sportscore.com/api/widget";

    const SPORT =
        "football";

    const CACHE_TIME =
        30000;

    const cache =
        new Map();


    /* =====================================================
       REQUEST
    ===================================================== */

    async function request(
        endpoint,
        params = {}
    ) {

        const url =
            new URL(
                BASE_URL + endpoint
            );


        url.searchParams.set(
            "sport",
            SPORT
        );


        Object.entries(params)
            .forEach(([key, value]) => {

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

            });


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


        const response =
            await fetch(
                key,
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
            key,
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
       FIRST VALUE
    ===================================================== */

    function first(
        ...values
    ) {

        for (
            const value of values
        ) {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                return value;

            }

        }


        return null;

    }


    /* =====================================================
       GET MATCHES
    ===================================================== */

    async function getMatches(
        limit = 50
    ) {

        const data =
            await request(
                "/matches/",
                {
                    limit:
                        Math.min(
                            Math.max(
                                limit,
                                1
                            ),
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
            Array.isArray(data)
        ) {

            return data;

        }


        return [];

    }


    /* =====================================================
       TEAM OBJECT
    ===================================================== */

    function getTeam(
        match,
        side
    ) {

        if (
            side === "home"
        ) {

            return (

                match.home_team ||

                match.homeTeam ||

                (
                    typeof match.home ===
                    "object"
                        ? match.home
                        : null
                ) ||

                {}

            );

        }


        return (

            match.away_team ||

            match.awayTeam ||

            (
                typeof match.away ===
                "object"
                    ? match.away
                    : null
            ) ||

            {}

        );

    }


    /* =====================================================
       TEAM NAME
    ===================================================== */

    function getTeamName(
        match,
        side
    ) {

        const team =
            getTeam(
                match,
                side
            );


        const direct =
            side === "home"

                ? first(
                    typeof match.home ===
                    "string"
                        ? match.home
                        : null,

                    match.home_name,

                    match.homeName
                )

                : first(
                    typeof match.away ===
                    "string"
                        ? match.away
                        : null,

                    match.away_name,

                    match.awayName
                );


        return (

            direct ||

            team.name ||

            team.title ||

            team.team_name ||

            team.display_name ||

            team.short_name ||

            (
                side === "home"
                    ? "Équipe domicile"
                    : "Équipe visiteuse"
            )

        );

    }


    /* =====================================================
       TEAM LOGO
    ===================================================== */

    function getTeamLogo(
        match,
        side
    ) {

        const team =
            getTeam(
                match,
                side
            );


        const direct =
            side === "home"

                ? first(
                    match.home_logo,
                    match.homeLogo,
                    match.home_image,
                    match.homeImage,
                    match.home_badge,
                    match.homeBadge
                )

                : first(
                    match.away_logo,
                    match.awayLogo,
                    match.away_image,
                    match.awayImage,
                    match.away_badge,
                    match.awayBadge
                );


        return (

            direct ||

            team.logo ||

            team.image ||

            team.photo ||

            team.icon ||

            team.badge ||

            team.logo_url ||

            team.image_url ||

            team.photo_url ||

            team.badge_url ||

            null

        );

    }


    /* =====================================================
       SCORE
    ===================================================== */

    function getScore(
        match,
        side
    ) {

        const team =
            getTeam(
                match,
                side
            );


        let value = null;


        if (
            side === "home"
        ) {

            value =
                first(
                    match.home_score,
                    match.homeScore,
                    match.home_goals,
                    match.homeGoals,
                    team.score,
                    team.goals
                );

        }


        else {

            value =
                first(
                    match.away_score,
                    match.awayScore,
                    match.away_goals,
                    match.awayGoals,
                    team.score,
                    team.goals
                );

        }


        if (
            value === null
        ) {

            return null;

        }


        const number =
            Number(value);


        return Number.isNaN(
            number
        )
            ? value
            : number;

    }


    /* =====================================================
       MATCH ID
    ===================================================== */

    function getMatchId(
        match
    ) {

        return first(

            match.id,

            match.match_id,

            match.event_id,

            match.eventId,

            match.game_id,

            match.gameId

        );

    }


    /* =====================================================
       MATCH SLUG
    ===================================================== */

    function getMatchSlug(
        match
    ) {

        return first(

            match.slug,

            match.match_slug,

            match.matchSlug,

            match.url,

            match.link

        );

    }


    /* =====================================================
       COMPETITION
    ===================================================== */

    function getCompetition(
        match
    ) {

        const value =
            first(

                match.competition,

                match.league,

                match.tournament,

                match.competition_name,

                match.league_name,

                match.tournament_name

            );


        if (
            typeof value ===
            "string"
        ) {

            return value;

        }


        if (
            value &&
            typeof value ===
            "object"
        ) {

            return (

                first(
                    value.name,
                    value.title,
                    value.league_name
                ) ||

                "Football"

            );

        }


        return "Football";

    }


    /* =====================================================
       START TIME
    ===================================================== */

    function getStartTime(
        match
    ) {

        return first(

            match.start_time,

            match.startTime,

            match.start_at,

            match.startAt,

            match.datetime,

            match.date,

            match.time

        );

    }
/* =========================================================
   PREZISCORE API — PARTIE 2
   NORMALISATION + LIVE MINUTE + LOGOS
========================================================= */


/* =========================================================
   HELPERS
========================================================= */

function firstValue(...values) {

    for (const value of values) {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            return value;
        }

    }

    return null;
}


/* =========================================================
   TEAM OBJECT
========================================================= */

function getTeamObject(match, side) {

    if (side === "home") {

        return (
            match.home_team ||
            match.homeTeam ||
            match.home ||
            match.home_team_data ||
            {}
        );

    }

    return (
        match.away_team ||
        match.awayTeam ||
        match.away ||
        match.away_team_data ||
        {}
    );

}


/* =========================================================
   TEAM NAME
========================================================= */

function getTeamName(match, side) {

    const team =
        getTeamObject(match, side);

    const name =
        firstValue(

            typeof team === "string"
                ? team
                : null,

            team?.name,
            team?.title,
            team?.team_name,
            team?.display_name,
            team?.short_name,

            side === "home"
                ? match.home_name
                : match.away_name,

            side === "home"
                ? match.homeName
                : match.awayName

        );


    return name ||
        (
            side === "home"
                ? "Équipe domicile"
                : "Équipe visiteuse"
        );

}


/* =========================================================
   TEAM LOGO
========================================================= */

function getTeamLogo(match, side) {

    const team =
        getTeamObject(match, side);


    const logo =
        firstValue(

            team?.logo,
            team?.badge,
            team?.image,
            team?.photo,
            team?.icon,

            team?.logo_url,
            team?.badge_url,
            team?.image_url,

            side === "home"
                ? match.home_logo
                : match.away_logo,

            side === "home"
                ? match.homeLogo
                : match.awayLogo,

            side === "home"
                ? match.home_image
                : match.away_image,

            side === "home"
                ? match.homeImage
                : match.awayImage

        );


    if (!logo) {
        return null;
    }


    return String(logo);

}


/* =========================================================
   SCORE
========================================================= */

function getTeamScore(match, side) {

    const team =
        getTeamObject(match, side);


    const score =
        firstValue(

            side === "home"
                ? match.home_score
                : match.away_score,

            side === "home"
                ? match.homeScore
                : match.awayScore,

            side === "home"
                ? match.home_goals
                : match.away_goals,

            side === "home"
                ? match.homeGoals
                : match.awayGoals,

            team?.score,
            team?.goals,
            team?.current_score,
            team?.currentScore

        );


    if (
        score === null ||
        score === undefined ||
        score === ""
    ) {
        return null;
    }


    const number =
        Number(score);


    return Number.isNaN(number)
        ? score
        : number;

}


/* =========================================================
   STATUS
========================================================= */

function normalizeStatus(match) {

    const status =
        String(
            firstValue(

                match.status,
                match.state,
                match.match_status,
                match.matchState,
                match.status_code,
                match.statusCode

            ) || ""
        )
        .toLowerCase()
        .trim();


    const text =
        String(
            firstValue(

                match.status_text,
                match.statusText,
                match.status_name,
                match.statusName

            ) || ""
        )
        .toLowerCase()
        .trim();


    const combined =
        `${status} ${text}`;


    /* =========================
       LIVE
    ========================= */

    const live =
        [

            "live",
            "in_progress",
            "in progress",
            "progress",
            "playing",
            "ongoing",
            "started",
            "first half",
            "second half",
            "1st half",
            "2nd half",
            "1st_half",
            "2nd_half",
            "half time",
            "halftime"

        ];


    if (
        live.some(
            word =>
                combined.includes(word)
        )
    ) {
        return "live";
    }


    /* =========================
       FINISHED
    ========================= */

    const finished =
        [

            "finished",
            "finish",
            "ended",
            "completed",
            "full time",
            "full_time",
            "ft"

        ];


    if (
        finished.some(
            word =>
                combined.includes(word)
        )
    ) {
        return "finished";
    }


    return "upcoming";

}


/* =========================================================
   LIVE MINUTE
========================================================= */

function getLiveMinute(match) {

    /*
       IMPORTANT:

       Nou pa mete 2,
       nou pa mete 0,
       nou pa envante minit.

       Nou pran sèlman sa API a bay.
    */

    const possible =
        firstValue(

            match.minute,
            match.elapsed,
            match.elapsed_time,
            match.elapsedTime,

            match.match_time,
            match.matchTime,

            match.timer,
            match.time_elapsed,
            match.timeElapsed,

            match.live_minute,
            match.liveMinute,

            match.current_minute,
            match.currentMinute,

            match.status_time,
            match.statusTime,

            match.clock,
            match.game_time,
            match.gameTime

        );


    if (
        possible === null ||
        possible === undefined ||
        possible === ""
    ) {
        return null;
    }


    /* Object */

    if (
        typeof possible === "object"
    ) {

        return getObjectMinute(
            possible
        );

    }


    return cleanMinute(
        possible
    );

}


/* =========================================================
   OBJECT MINUTE
========================================================= */

function getObjectMinute(object) {

    const value =
        firstValue(

            object.minute,
            object.elapsed,
            object.elapsed_time,
            object.elapsedTime,
            object.current,
            object.value,
            object.time,
            object.clock

        );


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }


    return cleanMinute(value);

}


/* =========================================================
   CLEAN MINUTE
========================================================= */

function cleanMinute(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }


    let text =
        String(value)
        .trim();


    /*
       Egzanp:
       45
       45'
       45 min
       45:30
       45+2
    */

    text =
        text
        .replace(
            /minutes?/gi,
            ""
        )
        .replace(
            /mins?/gi,
            ""
        )
        .trim();


    const found =
        text.match(
            /^(\d+)(?:\s*'\s*|\s*min)?/
        );


    if (found) {

        return Number(
            found[1]
        );

    }


    return null;

}


/* =========================================================
   START TIME
========================================================= */

function getStartTime(match) {

    return firstValue(

        match.start_time,
        match.startTime,

        match.start_at,
        match.startAt,

        match.date,
        match.datetime,

        match.utc_date,
        match.utcDate,

        match.time

    );

}


/* =========================================================
   COMPETITION
========================================================= */

function getCompetition(match) {

    const competition =
        firstValue(

            match.competition,
            match.league,
            match.tournament,

            match.competition_name,
            match.league_name,
            match.tournament_name

        );


    if (
        typeof competition === "string"
    ) {

        return competition;

    }


    if (
        competition &&
        typeof competition === "object"
    ) {

        return (
            firstValue(

                competition.name,
                competition.title,
                competition.league_name

            ) || "Football"
        );

    }


    return "Football";

}


/* =========================================================
   COMPETITION LOGO
========================================================= */

function getCompetitionLogo(match) {

    return firstValue(

        match.competition_logo,
        match.competitionLogo,

        match.league_logo,
        match.leagueLogo,

        match.tournament_logo,
        match.tournamentLogo

    );

}


/* =========================================================
   MATCH ID
========================================================= */

function getMatchId(match) {

    return firstValue(

        match.id,
        match.match_id,
        match.matchId,

        match.event_id,
        match.eventId,

        match.game_id,
        match.gameId

    );

}


/* =========================================================
   MATCH SLUG
========================================================= */

function getMatchSlug(match) {

    return firstValue(

        match.slug,
        match.match_slug,
        match.matchSlug,

        match.url,
        match.link

    );

}


/* =========================================================
   NORMALIZE MATCH
========================================================= */

function normalizeMatch(match) {

    if (!match) {
        return null;
    }


    const status =
        normalizeStatus(match);


    const normalized = {

        id:
            getMatchId(match),


        slug:
            getMatchSlug(match),


        home: {

            name:
                getTeamName(
                    match,
                    "home"
                ),

            logo:
                getTeamLogo(
                    match,
                    "home"
                ),

            score:
                getTeamScore(
                    match,
                    "home"
                )

        },


        away: {

            name:
                getTeamName(
                    match,
                    "away"
                ),

            logo:
                getTeamLogo(
                    match,
                    "away"
                ),

            score:
                getTeamScore(
                    match,
                    "away"
                )

        },


        competition:
            getCompetition(match),


        competitionLogo:
            getCompetitionLogo(match),


        status:
            status,


        statusText:
            firstValue(

                match.status_text,
                match.statusText,
                match.status_name,
                match.statusName

            ) || "",


        /*
           Minit sèlman si match LIVE.
        */

        minute:
            status === "live"
                ? getLiveMinute(match)
                : null,


        startTime:
            getStartTime(match),


        raw:
            match

    };


    return normalized;

}


/* =========================================================
   NORMALIZE LIST
========================================================= */

function normalizeMatches(matches) {

    if (
        !Array.isArray(matches)
    ) {
        return [];
    }


    return matches
        .map(
            match =>
                normalizeMatch(match)
        )
        .filter(Boolean);

}


/* =========================================================
   GET NORMALIZED MATCHES
========================================================= */

async function getNormalizedMatches() {

    const matches =
        await getMatches(50);


    console.log(
        "⚽ SportScore matches:",
        matches.length
    );


    const normalized =
        normalizeMatches(
            matches
        );


    console.log(
        "📊 PreziScore normalized:",
        normalized
    );


    return normalized;

}


/* =========================================================
   LIVE
========================================================= */

async function getLiveMatches() {

    const matches =
        await getNormalizedMatches();


    return matches.filter(
        match =>
            match.status === "live"
    );

}


/* =========================================================
   UPCOMING
========================================================= */

async function getUpcomingMatches() {

    const matches =
        await getNormalizedMatches();


    return matches.filter(
        match =>
            match.status === "upcoming"
    );

}


/* =========================================================
   FINISHED
========================================================= */

async function getFinishedMatches() {

    const matches =
        await getNormalizedMatches();


    return matches.filter(
        match =>
            match.status === "finished"
    );

       }

   
/* =========================================================
   PREZISCORE API — PARTIE 3
   DETAILS + TEAM + STANDINGS + CACHE + GLOBAL
========================================================= */


/* =========================================================
   MATCH DETAILS
========================================================= */

async function getMatch(slug) {

    if (!slug) {

        throw new Error(
            "Match slug manke"
        );

    }


    return await request(
        "/match/",
        {
            slug: slug
        }
    );

}


/* =========================================================
   TEAM DETAILS
========================================================= */

async function getTeam(slug) {

    if (!slug) {

        throw new Error(
            "Team slug manke"
        );

    }


    return await request(
        "/team/",
        {
            slug: slug
        }
    );

}


/* =========================================================
   STANDINGS
========================================================= */

async function getStandings(slug) {

    if (!slug) {

        throw new Error(
            "Competition slug manke"
        );

    }


    return await request(
        "/standings/",
        {
            slug: slug
        }
    );

}


/* =========================================================
   TOP SCORERS
========================================================= */

async function getTopScorers(slug) {

    if (!slug) {

        throw new Error(
            "Competition slug manke"
        );

    }


    return await request(
        "/topscorers/",
        {
            slug: slug
        }
    );

}


/* =========================================================
   PLAYER
========================================================= */

async function getPlayer(slug) {

    if (!slug) {

        throw new Error(
            "Player slug manke"
        );

    }


    return await request(
        "/player/",
        {
            slug: slug
        }
    );

}


/* =========================================================
   BRACKET
========================================================= */

async function getBracket(slug) {

    if (!slug) {

        throw new Error(
            "Competition slug manke"
        );

    }


    return await request(
        "/bracket/",
        {
            slug: slug
        }
    );

}


/* =========================================================
   TRACKER
========================================================= */

async function getTracker(id) {

    if (!id) {

        throw new Error(
            "Match ID manke"
        );

    }


    return await request(
        "/tracker/",
        {
            id: id
        }
    );

}


/* =========================================================
   CACHE CLEAR
========================================================= */

function clearCache() {

    cache.clear();

    console.log(
        "🧹 PreziScore API cache cleared"
    );

}


/* =========================================================
   FORCE REFRESH
========================================================= */

async function refreshMatches() {

    clearCache();

    return await getNormalizedMatches();

}


/* =========================================================
   API TEST
========================================================= */

async function testAPI() {

    try {

        console.log(
            "🔎 PreziScore API test..."
        );


        const matches =
            await getMatches(10);


        console.log(
            "✅ API OK"
        );


        console.log(
            "⚽ Matchs reçus:",
            matches.length
        );


        return {

            success: true,

            count:
                matches.length,

            matches:
                matches

        };

    }

    catch (error) {

        console.error(
            "❌ API TEST ERROR:",
            error
        );


        return {

            success: false,

            count: 0,

            matches: [],

            error:
                error.message

        };

    }

}


/* =========================================================
   PUBLIC API OBJECT
========================================================= */

const PreziAPI = {

    /* REQUEST */

    request:


        request,


    /* MATCHES */

    getMatches:


        getMatches,


    getNormalizedMatches:


        getNormalizedMatches,


    getLiveMatches:


        getLiveMatches,


    getUpcomingMatches:


        getUpcomingMatches,


    getFinishedMatches:


        getFinishedMatches,


    refreshMatches:


        refreshMatches,


    /* DETAILS */

    getMatch:


        getMatch,


    getTeam:


        getTeam,


    getStandings:


        getStandings,


    getTopScorers:


        getTopScorers,


    getPlayer:


        getPlayer,


    getBracket:


        getBracket,


    getTracker:


        getTracker,


    /* NORMALIZATION */

    normalizeMatch:


        normalizeMatch,


    normalizeMatches:


        normalizeMatches,


    normalizeStatus:


        normalizeStatus,


    /* CACHE */

    clearCache:


        clearCache,


    /* TEST */

    testAPI:


        testAPI

};


/* =========================================================
   AUTO REFRESH ENGINE
========================================================= */

const PreziLive = {

    timer: null,


    running: false,


    start(
        callback,
        seconds = 30
    ) {

        this.stop();


        if (
            typeof callback !==
            "function"
        ) {

            console.error(
                "❌ PreziLive callback invalid"
            );

            return;

        }


        this.running =
            true;


        /* Premye chaj */

        callback();


        /* Refresh */

        this.timer =
            setInterval(

                () => {

                    if (
                        typeof callback ===
                        "function"
                    ) {

                        callback();

                    }

                },

                seconds * 1000

            );


        console.log(
            "🔄 PreziLive started:",
            seconds,
            "seconds"
        );

    },


    stop() {

        if (
            this.timer
        ) {

            clearInterval(
                this.timer
            );

            this.timer =
                null;

        }


        this.running =
            false;


        console.log(
            "⏹️ PreziLive stopped"
        );

    }

};


/* =========================================================
   GLOBAL
========================================================= */

/*
   Sa yo enpòtan anpil.

   script.js ap chèche:

   window.PreziAPI

   ak

   window.PreziLive
*/

window.PreziAPI =
    PreziAPI;


window.PreziLive =
    PreziLive;


/* =========================================================
   READY MESSAGE
========================================================= */

console.log(
    "===================================="
);

console.log(
    "⚽ PREZISCORE API READY"
);

console.log(
    "📡 SportScore Football"
);

console.log(
    "🔴 LIVE"
);

console.log(
    "📅 UPCOMING"
);

console.log(
    "✅ FINISHED"
);

console.log(
    "⏱️ Live minute detection enabled"
);

console.log(
    "🖼️ Team logo detection enabled"
);

console.log(
    "===================================="
);                  
