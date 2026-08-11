"use strict";

/* =========================================================
   PREZISCORE — API ENGINE
   SportScore Football
   LIVE / UPCOMING / FINISHED
========================================================= */

const PreziAPI = (() => {

    const BASE_URL =
        "https://sportscore.com/api/widget";

    const SPORT = "football";

    const CACHE_TIME = 15000;

    const cache = new Map();


    /* =====================================================
       BUILD URL
    ===================================================== */

    function buildURL(endpoint, params = {}) {

        const url =
            new URL(BASE_URL + endpoint);

        url.searchParams.set(
            "sport",
            SPORT
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

        return url.toString();
    }


    /* =====================================================
       CACHE
    ===================================================== */

    function getCache(key) {

        const item =
            cache.get(key);

        if (!item) {
            return null;
        }

        if (
            Date.now() - item.time >
            CACHE_TIME
        ) {

            cache.delete(key);

            return null;
        }

        return item.data;
    }


    function setCache(key, data) {

        cache.set(key, {
            time: Date.now(),
            data: data
        });

    }


    /* =====================================================
       REQUEST
    ===================================================== */

    async function request(
        endpoint,
        params = {},
        options = {}
    ) {

        const url =
            buildURL(
                endpoint,
                params
            );

        const cached =
            options.noCache
                ? null
                : getCache(url);

        if (cached) {
            return cached;
        }


        const controller =
            new AbortController();


        const timeout =
            setTimeout(() => {

                controller.abort();

            }, options.timeout || 10000);


        try {

            const response =
                await fetch(
                    url,
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        },

                        signal:
                            controller.signal
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


            setCache(
                url,
                data
            );


            return data;

        }

        finally {

            clearTimeout(
                timeout
            );

        }

    }


    /* =====================================================
       SAFE REQUEST
    ===================================================== */

    async function safe(
        endpoint,
        params = {},
        options = {}
    ) {

        try {

            return await request(
                endpoint,
                params,
                options
            );

        }

        catch (error) {

            console.error(
                "❌ PreziScore API:",
                error
            );

            return {
                success: false,
                error: error.message,
                matches: []
            };

        }

    }


    /* =====================================================
       GET MATCHES
    ===================================================== */

    async function getMatches(
        limit = 100
    ) {

        const safeLimit =
            Math.min(
                Math.max(
                    Number(limit) || 100,
                    1
                ),
                100
            );


        const data =
            await request(
                "/matches/",
                {
                    limit: safeLimit
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
       FIRST VALUE
    ===================================================== */

    function firstValue(
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
       TEAM OBJECT
    ===================================================== */

    function getTeamObject(
        match,
        side
    ) {

        if (side === "home") {

            return (
                match.home_team ||
                match.homeTeam ||
                (
                    typeof match.home === "object"
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
                typeof match.away === "object"
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
            getTeamObject(
                match,
                side
            );


        const directName =
            side === "home"
                ? firstValue(
                    typeof match.home === "string"
                        ? match.home
                        : null,
                    match.home_name,
                    match.homeName
                )
                : firstValue(
                    typeof match.away === "string"
                        ? match.away
                        : null,
                    match.away_name,
                    match.awayName
                );


        return (
            directName ||

            firstValue(
                team.name,
                team.title,
                team.team_name,
                team.teamName,
                team.display_name,
                team.displayName,
                team.short_name,
                team.shortName
            ) ||

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
            getTeamObject(
                match,
                side
            );


        const directLogo =
            side === "home"
                ? firstValue(
                    match.home_logo,
                    match.homeLogo,
                    match.home_image,
                    match.homeImage,
                    match.home_badge,
                    match.homeBadge
                )
                : firstValue(
                    match.away_logo,
                    match.awayLogo,
                    match.away_image,
                    match.awayImage,
                    match.away_badge,
                    match.awayBadge
                );


        return (
            directLogo ||

            firstValue(
                team.logo,
                team.image,
                team.photo,
                team.icon,
                team.badge,
                team.logo_url,
                team.logoUrl,
                team.image_url,
                team.imageUrl,
                team.photo_url,
                team.photoUrl,
                team.badge_url,
                team.badgeUrl
            ) ||

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
            getTeamObject(
                match,
                side
            );


        const directScore =
            side === "home"
                ? firstValue(
                    match.home_score,
                    match.homeScore,
                    match.home_goals,
                    match.homeGoals,
                    match.home_result
                )
                : firstValue(
                    match.away_score,
                    match.awayScore,
                    match.away_goals,
                    match.awayGoals,
                    match.away_result
                );


        if (
            directScore !== null
        ) {

            const number =
                Number(directScore);


            return Number.isNaN(number)
                ? directScore
                : number;

        }


        const teamScore =
            firstValue(
                team.score,
                team.goals,
                team.current_score,
                team.currentScore,
                team.result
            );


        if (
            teamScore !== null
        ) {

            const number =
                Number(teamScore);


            return Number.isNaN(number)
                ? teamScore
                : number;

        }


        return null;

    }


    /* =====================================================
       STATUS
    ===================================================== */

    function normalizeStatus(
        match
    ) {

        const raw =
            String(
                firstValue(

                    match.status,
                    match.state,
                    match.match_status,
                    match.matchStatus,
                    match.match_state,
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
                    match.statusName,
                    match.state_text,
                    match.stateText

                ) || ""
            )
            .toLowerCase()
            .trim();


        const combined =
            raw + " " + text;


        /* =================================================
           LIVE
        ================================================= */

        const liveWords = [

            "live",
            "in_progress",
            "in progress",
            "progress",
            "playing",
            "ongoing",
            "started",
            "1st_half",
            "2nd_half",
            "first_half",
            "second_half",
            "1st half",
            "2nd half",
            "half time",
            "halftime"

        ];


        if (
            liveWords.some(
                word =>
                    combined.includes(word)
            )
        ) {

            return "live";

        }


        /* =================================================
           FINISHED
        ================================================= */

        const finishedWords = [

            "finished",
            "finish",
            "ended",
            "completed",
            "full time",
            "full_time",
            "ft",
            "after penalties",
            "after extra time"

        ];


        if (
            finishedWords.some(
                word =>
                    combined.includes(word)
            )
        ) {

            return "finished";

        }


        /* =================================================
           UPCOMING
        ================================================= */

        return "upcoming";

    }


    /* =====================================================
       MINUTE
    ===================================================== */

    function getMinute(
        match
    ) {

        const value =
            firstValue(

                match.minute,
                match.minutes,
                match.elapsed,
                match.elapsed_time,
                match.elapsedTime,
                match.match_time,
                match.matchTime,
                match.timer,
                match.time_elapsed,
                match.timeElapsed,
                match.status_time,
                match.statusTime,
                match.live_minute,
                match.liveMinute,
                match.current_minute,
                match.currentMinute

            );


        if (
            value === null
        ) {

            return null;

        }


        if (
            typeof value === "object"
        ) {

            const nested =
                firstValue(

                    value.minute,
                    value.minutes,
                    value.elapsed,
                    value.elapsed_time,
                    value.current,
                    value.value,
                    value.time

                );


            if (
                nested === null
            ) {

                return null;

            }


            return cleanMinute(
                nested
            );

        }


        return cleanMinute(
            value
        );

    }


    /* =====================================================
       CLEAN MINUTE
    ===================================================== */

    function cleanMinute(
        value
    ) {

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


        text =
            text
            .replace(
                /minutes?/gi,
                ""
            )
            .trim();


        text =
            text.replace(
                /['′]/g,
                ""
            )
            .trim();


        /*
         * 67
         */

        if (
            /^\d+$/.test(text)
        ) {

            return Number(text);

        }


        /*
         * 67:30
         */

        const timeMatch =
            text.match(
                /^(\d+):(\d+)/
            );


        if (
            timeMatch
        ) {

            return Number(
                timeMatch[1]
            );

        }


        /*
         * "67 min"
         */

        const numberMatch =
            text.match(
                /(\d+)/
            );


        if (
            numberMatch
        ) {

            return Number(
                numberMatch[1]
            );

        }


        return null;

    }


    /* =====================================================
       START TIME
    ===================================================== */

    function getStartTime(
        match
    ) {

        return firstValue(

            match.start_time,
            match.startTime,
            match.start_at,
            match.startAt,
            match.datetime,
            match.date_time,
            match.dateTime,
            match.date,
            match.utc_time,
            match.utcTime,
            match.time

        );

    }


    /* =====================================================
       COMPETITION
    ===================================================== */

    function getCompetition(
        match
    ) {

        const competition =
            firstValue(

                match.competition,
                match.league,
                match.tournament,
                match.competition_name,
                match.competitionName,
                match.league_name,
                match.leagueName,
                match.tournament_name,
                match.tournamentName

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
                    competition.league_name,
                    competition.leagueName,
                    competition.display_name

                ) ||
                "Football"
            );

        }


        return "Football";

    }


    /* =====================================================
       COMPETITION LOGO
    ===================================================== */

    function getCompetitionLogo(
        match
    ) {

        const competition =
            (
                match.competition &&
                typeof match.competition === "object"
            )
                ? match.competition
                : (
                    match.league &&
                    typeof match.league === "object"
                )
                    ? match.league
                    : (
                        match.tournament &&
                        typeof match.tournament === "object"
                    )
                        ? match.tournament
                        : {}
                );


        return firstValue(

            match.competition_logo,
            match.competitionLogo,
            match.league_logo,
            match.leagueLogo,
            match.tournament_logo,
            match.tournamentLogo,

            competition.logo,
            competition.image,
            competition.icon,
            competition.badge

        );

    }


    /* =====================================================
       MATCH ID
    ===================================================== */

    function getMatchId(
        match
    ) {

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


    /* =====================================================
       MATCH SLUG
    ===================================================== */

    function getMatchSlug(
        match
    ) {

        return firstValue(

            match.slug,
            match.match_slug,
            match.matchSlug,
            match.url,
            match.link

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


        const status =
            normalizeStatus(
                match
            );


        const homeName =
            getTeamName(
                match,
                "home"
            );


        const awayName =
            getTeamName(
                match,
                "away"
            );


        const homeLogo =
            getTeamLogo(
                match,
                "home"
            );


        const awayLogo =
            getTeamLogo(
                match,
                "away"
            );


        const homeScore =
            getScore(
                match,
                "home"
            );


        const awayScore =
            getScore(
                match,
                "away"
            );


        const minute =
            status === "live"
                ? getMinute(match)
                : null;


        return {

            id:
                getMatchId(match),

       /* =====================================================
       MATCH DETAILS
    ===================================================== */

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


    /* =====================================================
       TEAM
    ===================================================== */

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


    /* =====================================================
       STANDINGS
    ===================================================== */

    async function getStandings(
        competitionSlug
    ) {

        if (!competitionSlug) {

            throw new Error(
                "Competition slug manke"
            );

        }

        return await request(
            "/standings/",
            {
                slug: competitionSlug
            }
        );

    }


    /* =====================================================
       TOP SCORERS
    ===================================================== */

    async function getTopScorers(
        competitionSlug,
        limit = 20,
        stat = "goals"
    ) {

        if (!competitionSlug) {

            throw new Error(
                "Competition slug manke"
            );

        }

        const safeLimit =
            Math.min(
                Math.max(
                    Number(limit) || 20,
                    1
                ),
                50
            );


        const safeStat =
            stat === "assists"
                ? "assists"
                : "goals";


        return await request(
            "/topscorers/",
            {
                slug:
                    competitionSlug,

                limit:
                    safeLimit,

                stat:
                    safeStat
            }
        );

    }


    /* =====================================================
       PLAYER
    ===================================================== */

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


    /* =====================================================
       BRACKET
    ===================================================== */

    async function getBracket(
        competitionSlug
    ) {

        if (!competitionSlug) {

            throw new Error(
                "Competition slug manke"
            );

        }

        return await request(
            "/bracket/",
            {
                slug:
                    competitionSlug
            }
        );

    }


    /* =====================================================
       LIVE TRACKER
    ===================================================== */

    async function getTracker(
        matchId
    ) {

        if (!matchId) {

            throw new Error(
                "Match ID manke"
            );

        }

        return await request(
            "/tracker/",
            {
                id:
                    matchId
            },
            {
                noCache: true,
                timeout: 8000
            }
        );

    }


    /* =====================================================
       CLEAR CACHE
    ===================================================== */

    function clearCache() {

        cache.clear();

        console.log(
            "🧹 PreziScore cache netwaye"
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        request,
        safe,

        getMatches,

        getNormalizedMatches,

        getLiveMatches,

        getUpcomingMatches,

        getFinishedMatches,

        getMatch,

        getTeam,

        getStandings,

        getTopScorers,

        getPlayer,

        getBracket,

        getTracker,

        normalizeMatch,

        normalizeStatus,

        clearCache

    };

})();


/* =========================================================
   PREZI LIVE — AUTO REFRESH
========================================================= */

const PreziLive = {

    timer: null,

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
                "❌ PreziLive: callback pa valid"
            );

            return;

        }


        callback();


        this.timer =
            setInterval(
                () => {

                    callback();

                },
                seconds * 1000
            );

    },


    stop() {

        if (this.timer !== null) {

            clearInterval(
                this.timer
            );

            this.timer = null;

        }

    }

};


/* =========================================================
   GLOBAL
========================================================= */

window.PreziAPI =
    PreziAPI;


window.PreziLive =
    PreziLive;


/* =========================================================
   TEST
========================================================= */

console.log(
    "✅ PREZISCORE API READY"
);


/* =========================================================
   OPTIONAL TEST
   Sa pa chaje match yo otomatikman.
========================================================= */

window.PreziAPITest =
    async function () {

        try {

            const matches =
                await PreziAPI
                    .getNormalizedMatches();


            console.log(
                "⚽ TEST MATCHES:",
                matches
            );


            return matches;

        }

        catch (error) {

            console.error(
                "❌ TEST API:",
                error
            );


            return [];

        }

    };        
           
