/* =========================================================
   PREZISCORE — GLOBAL FOOTBALL API ENGINE
   SportScore
   LIVE + UPCOMING + FINISHED
========================================================= */

"use strict";

const PreziAPI = (() => {

    const BASE_URL =
        "https://sportscore.com/api/widget";

    const SPORT = "football";

    const CACHE_TIME = 15000;

    const cache = new Map();


    /* =====================================================
       REQUEST
    ===================================================== */

    async function request(endpoint, params = {}) {

        const url = new URL(
            BASE_URL + endpoint
        );

        url.searchParams.set(
            "sport",
            SPORT
        );

        url.searchParams.set(
            "src",
            "preziscore"
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
                    url.toString(),
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
                    `SportScore HTTP ${response.status}`
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

    async function getMatches(limit = 50) {

        const safeLimit =
            Math.min(
                Math.max(
                    Number(limit) || 50,
                    1
                ),
                50
            );


        const data =
            await request(
                "/matches/",
                {
                    limit:
                        safeLimit
                }
            );


        if (
            Array.isArray(data?.matches)
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
       HELPER — STRING
    ===================================================== */

    function text(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value).trim();

    }


    /* =====================================================
       TEAM NAME
    ===================================================== */

    function getTeamName(match, side) {

        const team =
            match?.[side + "_team"];


        if (
            team &&
            typeof team === "object"
        ) {

            return (
                team.name ||
                team.title ||
                team.short_name ||
                team.shortName ||
                (
                    side === "home"
                        ? "Équipe domicile"
                        : "Équipe visiteuse"
                )
            );

        }


        const direct =
            match?.[side];


        if (
            direct &&
            typeof direct === "object"
        ) {

            return (
                direct.name ||
                direct.title ||
                direct.short_name ||
                direct.shortName ||
                (
                    side === "home"
                        ? "Équipe domicile"
                        : "Équipe visiteuse"
                )
            );

        }


        const possible = [

            match?.[side + "_name"],

            match?.[
                side === "home"
                    ? "home_team_name"
                    : "away_team_name"
            ],

            match?.[
                side === "home"
                    ? "homeTeamName"
                    : "awayTeamName"
            ]

        ];


        for (
            const value of possible
        ) {

            if (text(value)) {
                return text(value);
            }

        }


        return side === "home"
            ? "Équipe domicile"
            : "Équipe visiteuse";

    }


    /* =====================================================
       TEAM LOGO
    ===================================================== */

    function getTeamLogo(match, side) {

        const team =
            match?.[side + "_team"];


        if (
            team &&
            typeof team === "object"
        ) {

            return (
                team.logo ||
                team.image ||
                team.icon ||
                null
            );

        }


        const direct =
            match?.[side];


        if (
            direct &&
            typeof direct === "object"
        ) {

            return (
                direct.logo ||
                direct.image ||
                direct.icon ||
                null
            );

        }


        return (
            match?.[
                side === "home"
                    ? "home_logo"
                    : "away_logo"
            ] ||
            null
        );

    }


    /* =====================================================
       SCORE
    ===================================================== */

    function getScore(match, side) {

        const team =
            match?.[side + "_team"];


        if (
            team &&
            typeof team === "object"
        ) {

            const score =
                team.score ??
                team.goals ??
                team.current_score;


            if (
                score !== undefined &&
                score !== null &&
                score !== ""
            ) {

                const number =
                    Number(score);

                return Number.isNaN(number)
                    ? null
                    : number;

            }

        }


        const direct =
            match?.[side];


        if (
            direct &&
            typeof direct === "object"
        ) {

            const score =
                direct.score ??
                direct.goals ??
                direct.current_score;


            if (
                score !== undefined &&
                score !== null &&
                score !== ""
            ) {

                const number =
                    Number(score);

                return Number.isNaN(number)
                    ? null
                    : number;

            }

        }


        const value =
            match?.[
                side === "home"
                    ? "home_score"
                    : "away_score"
            ];


        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {

            const number =
                Number(value);

            if (
                !Number.isNaN(number)
            ) {
                return number;
            }

        }


        return null;

        }

      /* =====================================================
       STATUS
    ===================================================== */

    function normalizeStatus(match) {

        const values = [

            match?.status,
            match?.state,
            match?.match_status,
            match?.status_text,
            match?.statusText,
            match?.phase,
            match?.game_status

        ];


        const combined =
            values
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


        /* LIVE */

        if (

            combined.includes("live") ||
            combined.includes("in_progress") ||
            combined.includes("in progress") ||
            combined.includes("progress") ||
            combined.includes("playing") ||
            combined.includes("ongoing") ||
            combined.includes("1st half") ||
            combined.includes("2nd half") ||
            combined.includes("half time") ||
            combined.includes("halftime")

        ) {

            return "live";

        }


        /* FINISHED */

        if (

            combined.includes("finished") ||
            combined.includes("finish") ||
            combined.includes("ended") ||
            combined.includes("completed") ||
            combined.includes("full time") ||
            combined.includes("fulltime") ||
            combined === "ft" ||
            combined.includes(" ft")

        ) {

            return "finished";

        }


        return "upcoming";

    }


    /* =====================================================
       MINUTE
    ===================================================== */

    function getMinute(match) {

        const possible = [

            match?.minute,
            match?.elapsed,
            match?.elapsed_time,
            match?.elapsedTime,
            match?.match_time,
            match?.matchTime,
            match?.timer,
            match?.time_elapsed,
            match?.status_time,
            match?.statusTime,
            match?.clock,
            match?.game_time

        ];


        for (
            const value of possible
        ) {

            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {
                continue;
            }


            /* OBJECT */

            if (
                typeof value === "object"
            ) {

                const nested =
                    value.minute ??
                    value.elapsed ??
                    value.current ??
                    value.value;


                if (
                    nested !== undefined &&
                    nested !== null
                ) {

                    return nested;

                }

            }


            /* NUMBER */

            if (
                typeof value === "number"
            ) {

                return value;

            }


            /* STRING */

            const str =
                String(value).trim();


            const matchNumber =
                str.match(/^\d+/);


            if (matchNumber) {

                const number =
                    parseInt(
                        matchNumber[0],
                        10
                    );


                if (
                    !Number.isNaN(number)
                ) {

                    return number;

                }

            }

        }


        return null;

    }


    /* =====================================================
       COMPETITION
    ===================================================== */

    function getCompetition(match) {

        if (
            match?.competition &&
            typeof match.competition === "object"
        ) {

            return (
                match.competition.name ||
                match.competition.title ||
                "Football"
            );

        }


        if (
            match?.league &&
            typeof match.league === "object"
        ) {

            return (
                match.league.name ||
                match.league.title ||
                "Football"
            );

        }


        if (
            match?.tournament &&
            typeof match.tournament === "object"
        ) {

            return (
                match.tournament.name ||
                match.tournament.title ||
                "Football"
            );

        }


        return (
            match?.competition ||
            match?.league ||
            match?.tournament ||
            "Football"
        );

    }


    /* =====================================================
       NORMALIZE MATCH
    ===================================================== */

    function normalizeMatch(match) {

        if (!match) {
            return null;
        }


        const status =
            normalizeStatus(match);


        return {

            id:
                match.id ??
                match.match_id ??
                match.event_id ??
                null,


            slug:
                match.slug ??
                match.match_slug ??
                match.url ??
                null,


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
                status,


            statusText:
                match.status_text ||
                match.statusText ||
                "",


            minute:
                getMinute(match),


            raw:
                match

        };

    }


    /* =====================================================
       NORMALIZED MATCHES
    ===================================================== */

    async function getNormalizedMatches() {

        const rawMatches =
            await getMatches(50);


        console.log(
            "⚽ PreziScore RAW:",
            rawMatches
        );


        const normalized =
            rawMatches
                .map(normalizeMatch)
                .filter(Boolean);


        console.log(
            "⚽ PreziScore NORMALIZED:",
            normalized
        );


        return normalized;

    }


    /* =====================================================
       FILTERS
    ===================================================== */

    async function getLiveMatches() {

        const matches =
            await getNormalizedMatches();


        return matches.filter(
            match =>
                match.status === "live"
        );

    }


    async function getFinishedMatches() {

        const matches =
            await getNormalizedMatches();


        return matches.filter(
            match =>
                match.status === "finished"
        );

    }


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
                "Match slug manke"
            );

        }


        return request(
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
        limit = 30
    ) {

        return request(
            "/team/",
            {
                slug: slug,
                limit: Math.min(
                    Math.max(
                        Number(limit) || 30,
                        1
                    ),
                    30
                )
            }
        );

    }


    /* =====================================================
       STANDINGS
    ===================================================== */

    async function getStandings(slug) {

        return request(
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
        slug,
        limit = 20,
        stat = "goals"
    ) {

        return request(
            "/topscorers/",
            {
                slug: slug,

                limit: Math.min(
                    Math.max(
                        Number(limit) || 20,
                        1
                    ),
                    50
                ),

                stat:
                    stat === "assists"
                        ? "assists"
                        : "goals"
            }
        );

    }


    /* =====================================================
       PLAYER
    ===================================================== */

    async function getPlayer(slug) {

        return request(
            "/player/",
            {
                slug: slug
            }
        );

    }


    /* =====================================================
       BRACKET
    ===================================================== */

    async function getBracket(slug) {

        return request(
            "/bracket/",
            {
                slug: slug
            }
        );

    }


    /* =====================================================
       TRACKER
    ===================================================== */

    async function getTracker(id) {

        return request(
            "/tracker/",
            {
                id: id
            }
        );

    }


    /* =====================================================
       CLEAR CACHE
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

        getMinute,

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
