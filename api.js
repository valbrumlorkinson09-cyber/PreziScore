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

        url.searchParams.set(
            "src",
            "preziscore"
        );

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
                "SportScore HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        cache.set(key, {
            time: Date.now(),
            data: data
        });


        return data;
    }


    /* =====================================================
       HELPERS
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


    function getName(value) {

        if (!value) return null;

        if (typeof value === "string") {
            return value;
        }

        if (typeof value === "object") {

            return firstValue(
                value.name,
                value.title,
                value.short_name,
                value.shortName,
                value.abbr,
                value.label
            );

        }

        return String(value);
    }


    function getLogo(value) {

        if (!value) return null;

        if (typeof value === "string") {
            return value;
        }

        if (typeof value === "object") {

            return firstValue(
                value.logo,
                value.image,
                value.image_url,
                value.logo_url,
                value.photo
            );

        }

        return null;
    }


    function getScore(value) {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return null;
        }


        if (typeof value === "object") {

            value =
                firstValue(
                    value.current,
                    value.total,
                    value.score,
                    value.goals,
                    value.value
                );

        }


        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return null;
        }


        const number =
            Number(value);


        return Number.isNaN(number)
            ? null
            : number;
    }


    /* =====================================================
       TEAM EXTRACTION
    ===================================================== */

    function getHomeTeam(match) {

        return firstValue(

            match.home_team,

            match.homeTeam,

            match.home,

            match.teams?.home,

            match.teams?.home_team,

            match.competitors?.home,

            match.competitors?.[0],

            match.sides?.home

        );

    }


    function getAwayTeam(match) {

        return firstValue(

            match.away_team,

            match.awayTeam,

            match.away,

            match.teams?.away,

            match.teams?.away_team,

            match.competitors?.away,

            match.competitors?.[1],

            match.sides?.away

        );

    }


    /* =====================================================
       STATUS
    ===================================================== */

    function normalizeStatus(match) {

        const values = [

            match.status,

            match.state,

            match.match_status,

            match.status_type,

            match.status_code,

            match.phase,

            match.period,

            match.status_text,

            match.statusText

        ];


        const text =
            values
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


        /* LIVE */

        if (

            text.includes("live") ||

            text.includes("in progress") ||

            text.includes("in_progress") ||

            text.includes("progress") ||

            text.includes("playing") ||

            text.includes("1st half") ||

            text.includes("2nd half") ||

            text.includes("half time") ||

            text.includes("halftime") ||

            text.includes("extra time") ||

            text.includes("penalty")

        ) {

            return "live";

        }


        /* FINISHED */

        if (

            text.includes("finished") ||

            text.includes("finish") ||

            text.includes("ended") ||

            text.includes("completed") ||

            text.includes("full time") ||

            text.includes("ft")

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

        const candidates = [

            match.minute,

            match.elapsed,

            match.elapsed_time,

            match.match_time,

            match.timer,

            match.time_elapsed,

            match.status_time,

            match.live_time,

            match.game_time,

            match.period_time,

            match.clock,

            match.status?.minute,

            match.status?.elapsed,

            match.status?.time,

            match.timer?.minute,

            match.timer?.elapsed

        ];


        for (
            const value of candidates
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
                    firstValue(

                        value.minute,

                        value.elapsed,

                        value.current,

                        value.time,

                        value.value

                    );


                if (
                    nested !== null
                ) {

                    return
                        formatMinute(nested);

                }

            }


            return formatMinute(value);

        }


        /* STATUS TEXT */

        const text =
            String(
                firstValue(
                    match.status_text,
                    match.statusText,
                    match.status,
                    ""
                )
            );


        const minuteMatch =
            text.match(
                /(\d{1,3})(?:\s*)['′]?/
            );


        if (
            minuteMatch
        ) {

            return (
                minuteMatch[1] +
                "'"
            );

        }


        return null;
    }


    function formatMinute(value) {

        if (
            value === undefined ||
            value === null
        ) {
            return null;
        }


        const text =
            String(value)
                .trim()
                .replace("′", "'");


        if (
            text === ""
        ) {
            return null;
        }


        /* Already formatted */

        if (
            text.includes("'") ||
            text.includes("+")
        ) {

            return text;

        }


        /* Number */

        if (
            /^\d+$/.test(text)
        ) {

            return (
                text +
                "'"
            );

        }


        return text;
    }


    /* =====================================================
       SCORE EXTRACTION
    ===================================================== */

    function getHomeScore(match, home) {

        return getScore(
            firstValue(

                match.home_score,

                match.homeScore,

                match.home_goals,

                match.homeGoals,

                match.score?.home,

                match.scores?.home,

                home?.score,

                home?.goals,

                home?.score?.current,

                home?.score?.total

            )
        );

    }


    function getAwayScore(match, away) {

        return getScore(
            firstValue(

                match.away_score,

                match.awayScore,

                match.away_goals,

                match.awayGoals,

                match.score?.away,

                match.scores?.away,

                away?.score,

                away?.goals,

                away?.score?.current,

                away?.score?.total

            )
        );

    }


    /* =====================================================
       NORMALIZE MATCH
    ===================================================== */

    function normalizeMatch(match) {

        if (!match) {
            return null;
        }


        const home =
            getHomeTeam(match);


        const away =
            getAwayTeam(match);


        const status =
            normalizeStatus(match);


        const homeName =
            getName(home) ||

            getName(
                match.home_name
            ) ||

            getName(
                match.homeName
            ) ||

            "Équipe domicile";


        const awayName =
            getName(away) ||

            getName(
                match.away_name
            ) ||

            getName(
                match.awayName
            ) ||

            "Équipe visiteuse";


        const competition =
            getName(
                firstValue(

                    match.competition,

                    match.league,

                    match.tournament,

                    match.competition_name,

                    match.league_name

                )
            ) ||

            "Football";


        const homeScore =
            getHomeScore(
                match,
                home
            );


        const awayScore =
            getAwayScore(
                match,
                away
            );


        const minute =
            getMinute(match);


        const slug =
            firstValue(

                match.slug,

                match.match_slug,

                match.url,

                match.match_url

            );


        return {

            id:
                firstValue(

                    match.id,

                    match.match_id,

                    match.event_id

                ),


            slug:
                slug,


            home: {

                name:
                    homeName,

                logo:
                    getLogo(home) ||

                    firstValue(
                        match.home_logo,
                        match.home_image
                    ),

                score:
                    homeScore

            },


            away: {

                name:
                    awayName,

                logo:
                    getLogo(away) ||

                    firstValue(
                        match.away_logo,
                        match.away_image
                    ),

                score:
                    awayScore

            },


            competition:
                competition,


            competitionLogo:
                getLogo(
                    firstValue(
                        match.competition,
                        match.league
                    )
                ),


            status:
                status,


            statusText:
                firstValue(
                    match.status_text,
                    match.statusText
                ) || "",


            minute:
                minute,


            raw:
                match

        };

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


        return Array.isArray(
            data?.matches
        )
            ? data.matches
            : [];

    }


    /* =====================================================
       NORMALIZED
    ===================================================== */

    async function getNormalizedMatches() {

        const matches =
            await getMatches(50);


        console.log(
            "⚽ SportScore matches:",
            matches.length
        );


        /* IMPORTANT:
           Gade premye match la nan console
           pou nou konnen tout fields API a.
        */

        if (matches.length) {

            console.log(
                "🔎 PREZISCORE RAW MATCH:",
                matches[0]
            );

        }


        return matches

            .map(
                normalizeMatch
            )

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
       DETAILS
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
                slug:
                    slug
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
                slug:
                    slug
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
                slug:
                    slug
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
                slug:
                    slug
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
                slug:
                    slug
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
                slug:
                    slug
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
                id:
                    id
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
    "✅ PREZISCORE API READY"
);
