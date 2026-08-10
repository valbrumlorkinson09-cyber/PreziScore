/* =========================================================
   PREZISCORE — GLOBAL FOOTBALL ENGINE
   LIVE + UPCOMING + FINISHED
========================================================= */

"use strict";

const PreziAPI = (() => {

    const BASE_URL = "https://sportscore.com/api/widget";
    const SPORT = "football";

    const CACHE_TIME = 30 * 1000;
    const cache = new Map();


    /* =====================================================
       REQUEST
    ===================================================== */

    async function request(endpoint, params = {}) {

        const url = new URL(
            BASE_URL + endpoint
        );

        url.searchParams.set("sport", SPORT);

        Object.entries(params).forEach(([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {
                url.searchParams.set(key, value);
            }

        });

        url.searchParams.set(
            "src",
            "preziscore"
        );

        const cacheKey = url.toString();

        const old = cache.get(cacheKey);

        if (
            old &&
            Date.now() - old.time < CACHE_TIME
        ) {
            return old.data;
        }


        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                10000
            );


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
                    `HTTP ${response.status}`
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
       EXTRACT MATCHES
    ===================================================== */

    function extractMatches(data) {

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.matches)) {
            return data.matches;
        }

        if (Array.isArray(data?.events)) {
            return data.events;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        if (Array.isArray(data?.data?.matches)) {
            return data.data.matches;
        }

        if (Array.isArray(data?.data?.events)) {
            return data.data.events;
        }

        return [];

    }


    /* =====================================================
       FIRST VALID VALUE
    ===================================================== */

    function first(...values) {

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


    /* =====================================================
       TEAM OBJECT
    ===================================================== */

    function getTeam(match, side) {

        if (side === "home") {

            return first(
                match.home_team,
                match.homeTeam,
                match.home,
                match.teams?.home,
                match.teams?.[0]
            ) || {};

        }


        return first(
            match.away_team,
            match.awayTeam,
            match.away,
            match.teams?.away,
            match.teams?.[1]
        ) || {};

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


        return first(

            team.name,
            team.title,
            team.team_name,
            team.display_name,

            side === "home"
                ? match.home_name
                : match.away_name,

            side === "home"
                ? match.homeTeamName
                : match.awayTeamName

        ) ||

        (
            side === "home"
                ? "Équipe domicile"
                : "Équipe visiteuse"
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


        return first(

            team.logo,
            team.logo_url,
            team.image,
            team.image_url,

            side === "home"
                ? match.home_logo
                : match.away_logo,

            side === "home"
                ? match.home_logo_url
                : match.away_logo

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


        const score =
            side === "home"
                ? first(
                    team.score,
                    team.goals,
                    team.current_score,
                    match.home_score,
                    match.homeScore,
                    match.scores?.home
                )
                : first(
                    team.score,
                    team.goals,
                    team.current_score,
                    match.away_score,
                    match.awayScore,
                    match.scores?.away
                );


        /*
         * Kenbe 0 kòm score valid.
         */

        if (
            score === 0 ||
            score === "0"
        ) {
            return 0;
        }


        if (
            score !== null &&
            score !== undefined &&
            score !== ""
        ) {
            return Number.isNaN(
                Number(score)
            )
                ? score
                : Number(score);
        }


        return null;

    }


    /* =====================================================
       COMPETITION
    ===================================================== */

    function getCompetition(match) {

        return first(

            match.competition?.name,
            match.competition?.title,

            match.league?.name,
            match.league?.title,

            match.tournament?.name,
            match.tournament?.title,

            match.competition_name,
            match.league_name,
            match.tournament_name

        ) || "Football";

    }


    /* =====================================================
       RAW STATUS
    ===================================================== */

    function getRawStatus(match) {

        const values = [

            match.status,
            match.state,
            match.match_status,
            match.game_status,
            match.event_status,

            match.status?.type,
            match.status?.name,
            match.status?.short,

            match.state?.type,
            match.state?.name

        ];


        return values
            .filter(
                value =>
                    value !== undefined &&
                    value !== null
            )
            .map(
                value =>
                    String(value)
                        .toLowerCase()
                        .trim()
            )
            .join(" ");

    }


    /* =====================================================
       STATUS
    ===================================================== */

    function normalizeStatus(match) {

        const raw =
            getRawStatus(match);


        /* LIVE */

        const liveWords = [

            "live",
            "in_progress",
            "in progress",
            "progress",
            "playing",
            "ongoing",
            "started",
            "1st half",
            "2nd half",
            "first half",
            "second half",
            "halftime",
            "half time"

        ];


        if (
            liveWords.some(
                word =>
                    raw.includes(word)
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
            "fulltime",
            "final",
            "ft"

        ];


        if (
            finishedWords.some(
                word =>
                    raw === word ||
                    raw.includes(word)
            )
        ) {

            return "finished";

        }


        /* UPCOMING */

        return "upcoming";

    }


    /* =====================================================
       MINUTE
    ===================================================== */

    function getMinute(match) {

        return first(

            match.minute,
            match.elapsed,
            match.elapsed_time,
            match.match_time,

            match.time?.elapsed,
            match.timer?.minute

        );

    }


    /* =====================================================
       START TIME
    ===================================================== */

    function getStartTime(match) {

        return first(

            match.start_time,
            match.startTime,
            match.start_date,
            match.datetime,
            match.date,
            match.kickoff,
            match.kickoff_time

        );

    }


    /* =====================================================
       ID
    ===================================================== */

    function getID(match) {

        return first(

            match.id,
            match.match_id,
            match.event_id,
            match.game_id

        );

    }


    /* =====================================================
       SLUG
    ===================================================== */

    function getSlug(match) {

        return first(

            match.slug,
            match.match_slug,
            match.event_slug,
            match.url_slug

        );

    }


    /* =====================================================
       NORMALIZE MATCH
    ===================================================== */

    function normalizeMatch(match) {

        if (!match) {
            return null;
        }


        return {

            id:
                getID(match),


            slug:
                getSlug(match),


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
                    getScore(
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
                    getScore(
                        match,
                        "away"
                    )

            },


            competition:
                getCompetition(match),


            status:
                normalizeStatus(match),


            minute:
                getMinute(match),


            raw: {

                ...match,

                start_time:
                    getStartTime(match)

            }

        };

    }


    /* =====================================================
       GET ALL MATCHES
    ===================================================== */

    async function getNormalizedMatches() {

        const data =
            await request(
                "/matches/",
                {
                    limit: 50
                }
            );


        console.log(
            "📦 PreziScore API:",
            data
        );


        const matches =
            extractMatches(data);


        console.log(
            "⚽ Matchs reçus:",
            matches.length
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
       MATCH DETAILS
    ===================================================== */

    async function getMatch(slug) {

        if (!slug) {

            throw new Error(
                "Match slug is required"
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
        slug,
        limit = 20
    ) {

        if (!slug) {

            throw new Error(
                "Team slug is required"
            );

        }


        return await request(
            "/team/",
            {
                slug: slug,
                limit: limit
            }
        );

    }


    /* =====================================================
       STANDINGS
    ===================================================== */

    async function getStandings(
        competitionSlug
    ) {

        return await request(
            "/standings/",
            {
                slug:
                    competitionSlug
            }
        );

    }


    /* =====================================================
       TOP SCORERS
    ===================================================== */

    async function getTopScorers(
        competitionSlug,
        limit = 20
    ) {

        return await request(
            "/topscorers/",
            {
                slug:
                    competitionSlug,

                limit:
                    limit
            }
        );

    }


    /* =====================================================
       PLAYER
    ===================================================== */

    async function getPlayer(slug) {

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

        return await request(
            "/bracket/",
            {
                slug:
                    competitionSlug
            }
        );

    }


    /* =====================================================
       TRACKER
    ===================================================== */

    async function getTracker(
        matchId
    ) {

        return await request(
            "/tracker/",
            {
                id:
                    matchId
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
       PUBLIC
    ===================================================== */

    return {

        request,

        getMatches: async () =>
            request(
                "/matches/",
                {
                    limit: 50
                }
            ),

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
   AUTO REFRESH
========================================================= */

const PreziLive = {

    timer: null,


    start(
        callback,
        seconds = 30
    ) {

        this.stop();


        callback();


        this.timer =
            setInterval(
                callback,
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
