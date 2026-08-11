"use strict";

/* =========================================================
   PREZISCORE — API ENGINE
   SportScore Football
   LIVE + UPCOMING + FINISHED
========================================================= */

const PreziAPI = (() => {

    const BASE_URL =
        "https://sportscore.com/api/widget";

    const SPORT = "football";

    const CACHE_TIME = 10000;

    const cache = new Map();


    /* =====================================================
       UTILITIES
    ===================================================== */

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


    function toNumber(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }

        const number = Number(value);

        return Number.isNaN(number)
            ? null
            : number;
    }


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
            cache.get(cacheKey);


        if (
            cached &&
            Date.now() - cached.time <
            CACHE_TIME
        ) {

            return cached.data;

        }


        const controller =
            new AbortController();


        const timeout =
            setTimeout(() => {

                controller.abort();

            }, 12000);


        try {

            const response =
                await fetch(
                    cacheKey,
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


            cache.set(
                cacheKey,
                {
                    time: Date.now(),
                    data: data
                }
            );


            return data;

        }

        finally {

            clearTimeout(timeout);

        }

    }


    /* =====================================================
       GET MATCHES
    ===================================================== */

    async function getMatches(
        limit = 100
    ) {

        const data =
            await request(
                "/matches/",
                {
                    limit:
                        Math.min(
                            Math.max(
                                Number(limit) || 100,
                                1
                            ),
                            100
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


        if (
            Array.isArray(
                data?.data
            )
        ) {

            return data.data;

        }


        return [];

    }


    /* =====================================================
       TEAM NAME
    ===================================================== */

    function getTeamName(
        team,
        fallback
    ) {

        if (
            typeof team === "string"
        ) {

            return team;

        }


        if (
            team &&
            typeof team === "object"
        ) {

            return firstValue(

                team.name,

                team.title,

                team.team_name,

                team.teamName,

                team.display_name,

                team.displayName,

                team.short_name,

                team.shortName

            ) || fallback;

        }


        return fallback;

    }


    /* =====================================================
       TEAM LOGO
    ===================================================== */

    function getTeamLogo(
        team,
        directLogo
    ) {

        const direct =
            firstValue(
                directLogo
            );


        if (direct) {

            return direct;

        }


        if (
            team &&
            typeof team === "object"
        ) {

            return firstValue(

                team.logo,

                team.logo_url,

                team.logoUrl,

                team.image,

                team.image_url,

                team.imageUrl,

                team.photo,

                team.photo_url,

                team.badge,

                team.badge_url,

                team.icon

            );

        }


        return null;

    }


    /* =====================================================
       SCORE
    ===================================================== */

    function getScore(
        match,
        side
    ) {

        const team =
            side === "home"

                ? (
                    match.home_team ||
                    match.home ||
                    match.homeTeam ||
                    {}
                )

                : (
                    match.away_team ||
                    match.away ||
                    match.awayTeam ||
                    {}
                );


        const directScore =
            side === "home"

                ? firstValue(

                    match.home_score,

                    match.homeScore,

                    match.home_goals,

                    match.homeGoals,

                    match.home_result,

                    match.homeResult

                )

                : firstValue(

                    match.away_score,

                    match.awayScore,

                    match.away_goals,

                    match.awayGoals,

                    match.away_result,

                    match.awayResult

                );


        if (
            directScore !== null
        ) {

            return toNumber(
                directScore
            ) ??
            directScore;

        }


        if (
            team &&
            typeof team === "object"
        ) {

            const score =
                firstValue(

                    team.score,

                    team.goals,

                    team.current_score,

                    team.currentScore,

                    team.result

                );


            if (
                score !== null
            ) {

                return toNumber(
                    score
                ) ?? score;

            }

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

                    match.state_name,

                    match.stateName

                ) || ""
            )
            .toLowerCase()
            .trim();


        const combined =
            raw + " " + text;


        /* LIVE */

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


        /* FINISHED */

        const finishedWords = [

            "finished",

            "finish",

            "ended",

            "completed",

            "full time",

            "full_time",

            "ft",

            "after_penalties",

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


        return "upcoming";

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

            match.start,

            match.kickoff,

            match.kick_off,

            match.kickoff_time,

            match.kickoffTime,

            match.datetime,

            match.date,

            match.event_time,

            match.eventTime,

            match.time

        );

    }


    /* =====================================================
       MINUTE
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


        if (
            typeof value === "object"
        ) {

            value =
                firstValue(

                    value.minute,

                    value.elapsed,

                    value.elapsed_time,

                    value.elapsedTime,

                    value.current,

                    value.value,

                    value.time

                );

        }


        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return null;

        }


        const text =
            String(value)
                .trim();


        const match =
            text.match(
                /(\d+)/
            );


        if (!match) {

            return null;

        }


        const minute =
            Number(
                match[1]
            );


        if (
            Number.isNaN(minute)
        ) {

            return null;

        }


        return minute;

    }


    function getAPIMinute(
        match
    ) {

        return cleanMinute(

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

                match.status_time,

                match.statusTime,

                match.live_minute,

                match.liveMinute,

                match.game_minute,

                match.gameMinute

            )

        );

    }


    /* =====================================================
       CALCULATE MINUTE
       Si API pa bay minute, nou kalkile l.
    ===================================================== */

    function calculateMinute(
        startTime
    ) {

        if (!startTime) {

            return null;

        }


        const start =
            new Date(
                startTime
            );


        if (
            Number.isNaN(
                start.getTime()
            )
        ) {

            return null;

        }


        const now =
            Date.now();


        const difference =
            now - start.getTime();


        if (
            difference < 0
        ) {

            return 0;

        }


        const minutes =
            Math.floor(
                difference /
                60000
            );


        return Math.max(
            0,
            Math.min(
                minutes,
                130
            )
        );

    }


    /* =====================================================
       MINUTE FINAL
    ===================================================== */

    function getMinute(
        match,
        status,
        startTime
    ) {

        if (
            status !== "live"
        ) {

            return null;

        }


        /*
         * Premye chwa:
         * vrè minute API a.
         */

        const apiMinute =
            getAPIMinute(
                match
            );


        if (
            apiMinute !== null
        ) {

            return apiMinute;

        }


        /*
         * Si API pa bay li:
         * kalkile depi kick-off.
         */

        const calculated =
            calculateMinute(
                startTime
            );


        return calculated;

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

            return firstValue(

                competition.name,

                competition.title,

                competition.league_name,

                competition.leagueName

            ) || "Football";

        }


        return "Football";

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
       SLUG
    ===================================================== */

    function getMatchSlug(
        match
    ) {

        return firstValue(

            match.slug,

            match.match_slug,

            match.matchSlug,

            match.url,

            match.link,

            match.match_url,

            match.matchUrl

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


        const homeTeam =
            match.home_team ||
            match.home ||
            match.homeTeam ||
            {};


        const awayTeam =
            match.away_team ||
            match.away ||
            match.awayTeam ||
            {};


        const status =
            normalizeStatus(
                match
            );


        const startTime =
            getStartTime(
                match
            );


        const homeName =
            getTeamName(

                homeTeam,

                firstValue(

                    match.home_name,

                    match.homeName,

                    match.home_team_name,

                    match.homeTeamName

                ) ||
                "Équipe domicile"

            );


        const awayName =
            getTeamName(

                awayTeam,

                firstValue(

                    match.away_name,

                    match.awayName,

                    match.away_team_name,

                    match.awayTeamName

                ) ||
                "Équipe visiteuse"

            );


        const homeLogo =
            getTeamLogo(

                homeTeam,

                firstValue(

                    match.home_logo,

                    match.homeLogo,

                    match.home_image,

                    match.homeImage,

                    match.home_badge,

                    match.homeBadge,

                    match.home_logo_url,

                    match.homeLogoUrl

                )

            );


        const awayLogo =
            getTeamLogo(

                awayTeam,

                firstValue(

                    match.away_logo,

                    match.awayLogo,

                    match.away_image,

                    match.awayImage,

                    match.away_badge,

                    match.awayBadge,

                    match.away_logo_url,

                    match.awayLogoUrl

                )

            );


        return {

            id:
                getMatchId(match),


            slug:
                getMatchSlug(match),


            home: {

                name:
                    homeName,

                logo:
                    homeLogo,

                score:
                    getScore(
                        match,
                        "home"
                    )

            },


            away: {

                name:
                    awayName,

                logo:
                    awayLogo,

                score:
                    getScore(
                        match,
                        "away"
                    )

            },


            competition:
                getCompetition(
                    match
                ),


            competitionLogo:
                firstValue(

                    match.competition_logo,

                    match.competitionLogo,

                    match.league_logo,

                    match.leagueLogo

                ),


            status:
                status,


            statusText:
                firstValue(

                    match.status_text,

                    match.statusText,

                    match.status_name,


/* =====================================================
       GET NORMALIZED MATCHES
    ===================================================== */

    async function getNormalizedMatches() {

        const matches =
            await getMatches(100);


        console.log(
            "⚽ PreziScore:",
            matches.length,
            "matchs reçus"
        );


        const normalized =
            matches
                .map(normalizeMatch)
                .filter(Boolean);


        console.log(
            "📊 Matchs normalisés:",
            normalized
        );


        return normalized;

    }


    /* =====================================================
       LIVE MATCHES
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
       UPCOMING MATCHES
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
       FINISHED MATCHES
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
       MATCH DETAILS
    ===================================================== */

    async function getMatch(
        slug
    ) {

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

    async function getTeam(
        slug
    ) {

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
        slug
    ) {

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


    /* =====================================================
       TOP SCORERS
    ===================================================== */

    async function getTopScorers(
        slug
    ) {

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


    /* =====================================================
       PLAYER
    ===================================================== */

    async function getPlayer(
        slug
    ) {

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
        slug
    ) {

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


    /* =====================================================
       TRACKER
    ===================================================== */

    async function getTracker(
        id
    ) {

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


    /* =====================================================
       CACHE
    ===================================================== */

    function clearCache() {

        cache.clear();

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        request,

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
   PREZISCORE LIVE REFRESH
========================================================= */

const PreziLive = {

    timer: null,


    start(
        callback,
        seconds = 30
    ) {

        this.stop();


        if (
            typeof callback !== "function"
        ) {

            console.error(
                "❌ PreziLive: callback invalid"
            );

            return;

        }


        /*
         * Premye chaj la fèt imedyatman.
         */

        callback();


        /*
         * Apre sa nou verifye API a
         * chak 30 segonn.
         */

        this.timer =
            setInterval(
                () => {

                    callback();

                },
                seconds * 1000
            );

    },


    stop() {

        if (this.timer) {

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


console.log(
    "✅ PREZISCORE API ENGINE READY"
);                   
