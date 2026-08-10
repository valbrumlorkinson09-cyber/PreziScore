/* =========================================================
   PREZISCORE
   GLOBAL FOOTBALL API ENGINE
   Provider: SportScore
========================================================= */

"use strict";

const PreziAPI = (() => {

    const BASE_URL = "https://sportscore.com/api/widget";
    const SPORT = "football";

    // SportScore cache ~60s.
    // Nou cache lokalman tou pou pa gaspiye requests.
    const CACHE_TIME = 55 * 1000;

    const cache = new Map();


    /* =====================================================
       UTILITIES
    ===================================================== */

    function buildURL(endpoint, params = {}) {

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

        // Optional identification for SportScore analytics
        url.searchParams.set(
            "src",
            "preziscore"
        );

        return url.toString();
    }


    function getCache(key) {

        const item = cache.get(key);

        if (!item) return null;

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
            data
        });

    }


    /* =====================================================
       HTTP REQUEST
    ===================================================== */

    async function request(
        endpoint,
        params = {},
        options = {}
    ) {

        const url = buildURL(
            endpoint,
            params
        );

        const cacheKey = url;

        // Cache
        if (!options.noCache) {

            const cached =
                getCache(cacheKey);

            if (cached) {

                return cached;
            }
        }


        const controller =
            new AbortController();

        const timeout =
            setTimeout(() => {

                controller.abort();

            }, options.timeout || 10000);


        try {

            const response =
                await fetch(url, {

                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    signal:
                        controller.signal
                });


            if (!response.ok) {

                throw new Error(
                    `SportScore HTTP ${response.status}`
                );
            }


            const data =
                await response.json();


            setCache(
                cacheKey,
                data
            );


            return data;

        }

        finally {

            clearTimeout(timeout);

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
                "PreziScore API:",
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
       MATCHES
       Live + recent matches
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

        return data;
    }


    /* =====================================================
       LIVE
    ===================================================== */

    async function getLiveMatches() {

        const data =
            await getMatches(50);

        const matches =
            Array.isArray(
                data?.matches
            )
                ? data.matches
                : [];

        return matches.filter(
            isLive
        );
    }


    /* =====================================================
       RECENT / FINISHED
    ===================================================== */

    async function getFinishedMatches() {

        const data =
            await getMatches(50);

        const matches =
            Array.isArray(
                data?.matches
            )
                ? data.matches
                : [];

        return matches.filter(
            isFinished
        );
    }


    /* =====================================================
       UPCOMING
    ===================================================== */

    async function getUpcomingMatches() {

        /*
         * SportScore /matches/ endpoint
         * focuses on live + recent matches.
         *
         * Upcoming team/competition fixtures
         * are available through their dedicated
         * team/competition pages.
         *
         * We keep this method so the UI does not
         * depend directly on the provider.
         */

        return [];
    }


    /* =====================================================
       MATCH DETAILS
    ===================================================== */

    async function getMatch(
        slug
    ) {

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
        limit = 10
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
                limit:
                    Math.min(
                        Math.max(
                            limit,
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

    async function getStandings(
        competitionSlug
    ) {

        if (!competitionSlug) {
            throw new Error(
                "Competition slug is required"
            );
        }

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
        limit = 20,
        stat = "goals"
    ) {

        if (!competitionSlug) {
            throw new Error(
                "Competition slug is required"
            );
        }

        return await request(
            "/topscorers/",
            {
                slug:
                    competitionSlug,

                limit:
                    Math.min(
                        Math.max(
                            limit,
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

    async function getPlayer(
        slug
    ) {

        if (!slug) {
            throw new Error(
                "Player slug is required"
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
       TOURNAMENT BRACKET
    ===================================================== */

    async function getBracket(
        competitionSlug
    ) {

        if (!competitionSlug) {
            throw new Error(
                "Competition slug is required"
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
                "Match ID is required"
            );
        }

        return await request(
            "/tracker/",
            {
                id: matchId
            }
        );
    }


    /* =====================================================
       STATUS NORMALIZATION
       Nou pap kite UI depann de non SportScore.
    ===================================================== */

    function normalizeStatus(
        match
    ) {

        const raw = String(
            match?.status ??
            match?.state ??
            match?.match_status ??
            ""
        ).toLowerCase();

        if (
            raw.includes("live") ||
            raw.includes("progress") ||
            raw.includes("playing")
        ) {
            return "live";
        }

        if (
            raw.includes("finish") ||
            raw.includes("ended") ||
            raw.includes("ft")
        ) {
            return "finished";
        }

        return "upcoming";
    }


    function isLive(match) {

        return (
            normalizeStatus(match)
            === "live"
        );
    }


    function isFinished(match) {

        return (
            normalizeStatus(match)
            === "finished"
        );
    }


    /* =====================================================
       NORMALIZE MATCH
       UI PreziScore sèvi ak menm format la tout kote.
    ===================================================== */

    function normalizeMatch(
        match
    ) {

        if (!match) return null;

        return {

            id:
                match.id ??
                match.match_id ??
                match.event_id ??
                null,

            slug:
                match.slug ??
                match.match_slug ??
                null,

            home: {

                name:
                    match.home_team?.name ??
                    match.home?.name ??
                    match.home_name ??
                    "Équipe domicile",

                logo:
                    match.home_team?.logo ??
                    match.home?.logo ??
                    match.home_logo ??
                    null,

                score:
                    match.home_team?.score ??
                    match.home?.score ??
                    match.home_score ??
                    null
            },

            away: {

                name:
                    match.away_team?.name ??
                    match.away?.name ??
                    match.away_name ??
                    "Équipe visiteuse",

                logo:
                    match.away_team?.logo ??
                    match.away?.logo ??
                    match.away_logo ??
                    null,

                score:
                    match.away_team?.score ??
                    match.away?.score ??
                    match.away_score ??
                    null
            },

            competition:
                match.competition?.name ??
                match.league?.name ??
                match.tournament?.name ??
                "Football",

            status:
                normalizeStatus(match),

            minute:
                match.minute ??
                match.elapsed ??
                match.time ??
                null,

            raw: match
        };
    }


    /* =====================================================
       GET NORMALIZED MATCHES
    ===================================================== */

    async function getNormalizedMatches() {

        const data =
            await getMatches(50);

        const matches =
            Array.isArray(
                data?.matches
            )
                ? data.matches
                : [];

        return matches
            .map(normalizeMatch)
            .filter(Boolean);
    }


    /* =====================================================
       CACHE CONTROL
    ===================================================== */

    function clearCache() {

        cache.clear();

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        request,
        safe,

        getMatches,
        getLiveMatches,
        getFinishedMatches,
        getUpcomingMatches,

        getMatch,
        getTeam,

        getStandings,
        getTopScorers,

        getPlayer,
        getBracket,
        getTracker,

        normalizeMatch,
        getNormalizedMatches,

        normalizeStatus,

        clearCache
    };

})();


/* =========================================================
   AUTO REFRESH ENGINE
========================================================= */

const PreziLive = {

    timer: null,

    start(
        callback,
        seconds = 60
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

window.PreziAPI = PreziAPI;
window.PreziLive = PreziLive;
