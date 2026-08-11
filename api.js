/* =========================================================
   PREZISCORE API ENGINE
   SportScore Football
   LIVE + UPCOMING + FINISHED
========================================================= */

"use strict";

const PreziAPI = (() => {

    const BASE =
        "https://sportscore.com/api/widget";

    const SPORT = "football";

    const CACHE_TIME = 15000;

    const cache = new Map();


    /* =====================================================
       REQUEST
    ===================================================== */

    async function request(endpoint, params = {}) {

        const url = new URL(BASE + endpoint);

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

        const key = url.toString();

        const old = cache.get(key);

        if (
            old &&
            Date.now() - old.time < CACHE_TIME
        ) {
            return old.data;
        }


        const response = await fetch(key, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });


        if (!response.ok) {
            throw new Error(
                "SportScore HTTP " + response.status
            );
        }


        const data = await response.json();


        cache.set(key, {
            time: Date.now(),
            data
        });


        return data;
    }


    /* =====================================================
       GET MATCHES
    ===================================================== */

    async function getMatches(limit = 100) {

        const data = await request(
            "/matches/",
            {
                limit: limit
            }
        );


        return Array.isArray(data.matches)
            ? data.matches
            : [];
    }


    /* =====================================================
       DATE
    ===================================================== */

    function getTime(match) {

        return match.time || null;

    }


    /* =====================================================
       STATUS
    ===================================================== */

    function normalizeStatus(match) {

        const status =
            String(
                match.status || ""
            ).toLowerCase();

        const text =
            String(
                match.status_text || ""
            ).toLowerCase();


        /* LIVE */

        if (
            status === "live" ||
            status === "in_progress" ||
            status === "playing" ||
            status === "progress" ||
            text.includes("live") ||
            text.includes("progress") ||
            text.includes("playing")
        ) {
            return "live";
        }


        /* FINISHED */

        if (
            status === "finished" ||
            status === "finish" ||
            status === "ended" ||
            status === "completed" ||
            text.includes("finished") ||
            text.includes("ended") ||
            text.includes("full time")
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

    const value =
        match.minute ??
        match.elapsed ??
        match.elapsed_time ??
        match.match_time ??
        match.timer ??
        match.time_elapsed ??
        match.status_time ??
        null;

    if (value === null || value === undefined) {
        return null;
    }

    // Si API a voye yon object
    if (typeof value === "object") {

        return (
            value.minute ??
            value.elapsed ??
            value.current ??
            value.value ??
            null
        );

    }

    // Si API a voye yon string tankou "67"
    const text =
        String(value)
            .trim()
            .replace("'", "");

    if (/^\d+$/.test(text)) {
        return Number(text);
    }

    return text;
}

    /* =====================================================
       NORMALIZE
    ===================================================== */

    function normalizeMatch(match) {

        if (!match) {
            return null;
        }


        const status =
            normalizeStatus(match);


        return {

            id:
                match.id ||
                match.match_id ||
                match.url,


            slug:
                match.url || null,


            home: {

                name:
                    match.home ||
                    "Équipe domicile",

                logo:
                    match.home_logo ||
                    null,

                score:
                    match.home_score !== undefined
                        ? Number(match.home_score)
                        : null

            },


            away: {

                name:
                    match.away ||
                    "Équipe visiteuse",

                logo:
                    match.away_logo ||
                    null,

                score:
                    match.away_score !== undefined
                        ? Number(match.away_score)
                        : null

            },


            competition:
                match.competition ||
                "Football",


            competitionLogo:
                match.competition_logo ||
                null,


            status:
                status,


            statusText:
                match.status_text ||
                "",


            minute:
                getMinute(match),


            raw: match

        };

    }


    /* =====================================================
       ALL
    ===================================================== */

    async function getNormalizedMatches() {

        const matches =
            await getMatches(100);


        console.log(
            "⚽ PreziScore:",
            matches.length,
            "matchs reçus"
        );


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

    async function getStandings(slug) {

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

    async function getTopScorers(slug) {

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

    async function getBracket(slug) {

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

    async function getTracker(id) {

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
       PUBLIC
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
   AUTO REFRESH
========================================================= */

const PreziLive = {

    timer: null,


    start(callback, seconds = 30) {

        this.stop();

        callback();

        this.timer = setInterval(
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
    "✅ PREZISCORE API READY"
);
