/* =========================================================
   PREZISCORE
   GLOBAL FOOTBALL API ENGINE
========================================================= */

"use strict";


const PreziAPI = (() => {


    /* =====================================================
       CONFIG
    ===================================================== */

    const BASE_URL =
        "https://sportscore.com/api/widget";

    const SPORT =
        "football";

    const CACHE_TIME =
        55 * 1000;

    const cache =
        new Map();


    /* =====================================================
       BUILD URL
    ===================================================== */

    function buildURL(
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


        Object.entries(
            params
        ).forEach(
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


    function setCache(
        key,
        data
    ) {

        cache.set(
            key,
            {
                time: Date.now(),
                data: data
            }
        );

    }


    /* =====================================================
       HTTP REQUEST
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
            setTimeout(
                () => {

                    controller.abort();

                },
                options.timeout || 10000
            );


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
                    `SportScore HTTP ${response.status}`
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
                                Number(limit) || 50,
                                1
                            ),
                            50
                        )
                }
            );


        return data;

    }


    /* =====================================================
       EXTRACT MATCH ARRAY
    ===================================================== */

    function extractMatches(
        data
    ) {

        if (
            Array.isArray(data)
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
                data?.events
            )
        ) {

            return data.events;

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
                data?.data?.matches
            )
        ) {

            return data.data.matches;

        }


        if (
            Array.isArray(
                data?.data?.events
            )
        ) {

            return data.data.events;

        }


        return [];

    }


    /* =====================================================
       VALUE FINDER
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
       TEAM NAME
    ===================================================== */

    function getTeamName(
        match,
        side
    ) {

        const team =
            side === "home"
                ? match?.home_team
                : match?.away_team;


        const direct =
            side === "home"
                ? match?.home
                : match?.away;


        return firstValue(

            team?.name,

            team?.title,

            team?.team_name,

            direct?.name,

            direct?.title,

            direct?.team_name,

            side === "home"
                ? match?.home_name
                : match?.away_name,

            side === "home"
                ? match?.homeTeamName
                : match?.awayTeamName,

            side === "home"
                ? match?.homeTeam
                : match?.awayTeam

        ) || (

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
            side === "home"
                ? match?.home_team
                : match?.away_team;


        const direct =
            side === "home"
                ? match?.home
                : match?.away;


        return firstValue(

            team?.logo,

            team?.logo_url,

            team?.image,

            team?.image_url,

            direct?.logo,

            direct?.logo_url,

            direct?.image,

            direct?.image_url,

            side === "home"
                ? match?.home_logo
                : match?.away_logo,

            side === "home"
                ? match?.home_logo_url
                : match?.away_logo

        );

    }


    /* =====================================================
       TEAM SCORE
    ===================================================== */

    function getTeamScore(
        match,
        side
    ) {

        const team =
            side === "home"
                ? match?.home_team
                : match?.away_team;


        const direct =
            side === "home"
                ? match?.home
                : match?.away;


        return firstValue(

            team?.score,

            team?.goals,

            team?.current_score,

            direct?.score,

            direct?.goals,

            side === "home"
                ? match?.home_score
                : match?.away_score,

            side === "home"
                ? match?.homeScore
                : match?.awayScore,

            side === "home"
                ? match?.scores?.home
                : match?.scores?.away

        );

    }


    /* =====================================================
       COMPETITION
    ===================================================== */

    function getCompetition(
        match
    ) {

        return firstValue(

            match?.competition?.name,

            match?.competition?.title,

            match?.league?.name,

            match?.league?.title,

            match?.tournament?.name,

            match?.tournament?.title,

            match?.competition_name,

            match?.league_name,

            match?.tournament_name

        ) || "Football";

    }


    /* =====================================================
       STATUS
    ===================================================== */

    function normalizeStatus(
        match
    ) {

        const values = [

            match?.status,

            match?.state,

            match?.match_status,

            match?.matchState,

            match?.game_status,

            match?.event_status,

            match?.status?.type,

            match?.status?.name,

            match?.status?.short

        ];


        const raw =
            values
                .filter(
                    value =>
                        value !==
                        undefined &&
                        value !==
                        null
                )
                .map(
                    value =>
                        String(
                            value
                        ).toLowerCase()
                )
                .join(" ");


        /* LIVE */

        if (

            raw.includes("live") ||

            raw.includes("in_progress") ||

            raw.includes("in progress") ||

            raw.includes("progress") ||

            raw.includes("playing") ||

            raw.includes("ongoing") ||

            raw.includes("started") ||

            raw.includes("1st half") ||

            raw.includes("2nd half") ||

            raw.includes("halftime")

        ) {

            return "live";

        }


        /* FINISHED */

        if (

            raw.includes("finished") ||

            raw.includes("finish") ||

            raw.includes("ended") ||

            raw.includes("completed") ||

            raw.includes("full time") ||

            raw === "ft"

        ) {

            return "finished";

        }


        /* UPCOMING */

        return "upcoming";

    }


    /* =====================================================
       MINUTE
    ===================================================== */

    function getMinute(
        match
    ) {

        return firstValue(

            match?.minute,

            match?.elapsed,

            match?.elapsed_time,

            match?.match_time,

            match?.time?.elapsed,

            match?.timer?.minute

        );

    }


    /* =====================================================
       MATCH ID
    ===================================================== */

    function getMatchId(
        match
    ) {

        return firstValue(

            match?.id,

            match?.match_id,

            match?.event_id,

            match?.game_id

        );

    }


    /* =====================================================
       MATCH SLUG
    ===================================================== */

    function getSlug(
        match
    ) {

        return firstValue(

            match?.slug,

            match?.match_slug,

            match?.event_slug,

            match?.url_slug

        );

    }


    /* =====================================================
       START TIME
    ===================================================== */

    function getStartTime(
        match
    ) {

        return firstValue(

            match?.start_time,

            match?.startTime,

            match?.start_date,

            match?.date,

            match?.datetime,

            match?.kickoff,

            match?.kickoff_time

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


        return {

            id:
                getMatchId(
                    match
                ),


            slug:
                getSlug(
                    match
                ),


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
                getCompetition(
                    match
                ),


            status:
                normalizeStatus(
                    match
                ),


            minute:
                getMinute(
                    match
                ),


            raw: {

                ...match,

                start_time:
                    getStartTime(
                        match
                    )

            }

        };

    }


    /* =====================================================
       NORMALIZED MATCHES
    ===================================================== */

    async function getNormalizedMatches() {

        const data =
            await getMatches(
                50
            );


        console.log(
            "📦 PreziScore API response:",
            data
        );


        const matches =
            extractMatches(
                data
            );


        console.log(
            "⚽ Matches found:",
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
                match.status ===
                "live"
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
                match.status ===
                "finished"
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
                match.status ===
                "upcoming"
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
                "Match slug is required"
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
                slug:
                    slug,

                limit:
                    Math.min(
                        Math.max(
                            Number(limit) || 10,
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
                slug:
                    slug
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
                "Competition sl
