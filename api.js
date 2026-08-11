"use strict";

/* =========================================================
   PREZISCORE — API ENGINE
   SportScore Football
   LIVE + UPCOMING + FINISHED
========================================================= */

const PreziAPI = (() => {

    const BASE_URL =
        "https://sportscore.com/api/widget";

    const SPORT =
        "football";

    const CACHE_TIME =
        15000;

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


        const response =
            await fetch(
                cacheKey,
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
            cacheKey,
            {
                time: Date.now(),
                data: data
            }
        );


        return data;

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
                                limit,
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


        return [];

    }


    /* =====================================================
       FIND VALUE
       Chèche yon valeur nan plizyè kote.
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

                team.short_name,

                team.display_name

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

        /* Logo direct */

        const direct =
            firstValue(
                directLogo
            );


        if (direct) {

            return direct;

        }


        /* Team object */

        if (
            team &&
            typeof team === "object"
        ) {

            const logo =
                firstValue(

                    team.logo,

                    team.image,

                    team.photo,

                    team.icon,

                    team.badge,

                    team.logo_url,

                    team.image_url,

                    team.photo_url,

                    team.badge_url

                );


            if (logo) {

                return logo;

            }

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
                ? match.home_team ||
                  match.home ||
                  match.homeTeam
                : match.away_team ||
                  match.away ||
                  match.awayTeam;


        const directScore =
            side === "home"
                ? firstValue(
                    match.home_score,
                    match.homeScore,
                    match.home_goals,
                    match.homeGoals
                )
                : firstValue(
                    match.away_score,
                    match.awayScore,
                    match.away_goals,
                    match.awayGoals
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


        if (
            team &&
            typeof team === "object"
        ) {

            const score =
                firstValue(

                    team.score,

                    team.goals,

                    team.current_score,

                    team.currentScore

                );


            if (
                score !== null
            ) {

                const number =
                    Number(score);


                return Number.isNaN(number)
                    ? score
                    : number;

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

        const rawStatus =
            firstValue(

                match.status,

                match.state,

                match.match_status,

                match.matchState,

                match.status_code

            );


        const status =
            String(
                rawStatus || ""
            )
            .toLowerCase()
            .trim();


        const statusText =
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


        /* =========================
           LIVE
        ========================= */

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
            "2nd half"

        ];


        if (
            liveWords.some(
                word =>
                    status.includes(word) ||
                    statusText.includes(word)
            )
        ) {

            return "live";

        }


        /* =========================
           FINISHED
        ========================= */

        const finishedWords = [

            "finished",
            "finish",
            "ended",
            "completed",
            "full time",
            "full_time",
            "ft"

        ];


        if (
            finishedWords.some(
                word =>
                    status === word ||
                    status.includes(word) ||
                    statusText.includes(word)
            )
        ) {

            return "finished";

        }


        /* =========================
           UPCOMING
        ========================= */

        return "upcoming";

    }


    /* =====================================================
       MINUTE — IMPORTANT
    ===================================================== */

    function getMinute(
        match
    ) {

        /* 
           Nou teste plizyè kote.
           Nou pa mete 2 kòm fallback.
        */

        const value =
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

                match.liveMinute

            );


        if (
            value === null
        ) {

            return null;

        }


        /* Object */

        if (
            typeof value === "object"
        ) {

            const objectValue =
                firstValue(

                    value.minute,

                    value.elapsed,

                    value.elapsed_time,

                    value.current,

                    value.value,

                    value.time

                );


            if (
                objectValue === null
            ) {

                return null;

            }


            return cleanMinute(
                objectValue
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


        /*
         * Egzanp:
         * 67'
         * 67
         * 67 min
         * 67:30
         */

        text =
            text
            .replace(
                /min/gi,
                ""
            )
            .trim();


        if (
            /^\d+$/.test(text)
        ) {

            return Number(text);

        }


        const match =
            text.match(
                /^(\d+)/
            );


        if (match) {

            return Number(
                match[1]
            );

        }


        return text;

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

            match.date,

            match.datetime,

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

            return firstValue(

                competition.name,

                competition.title,

                competition.league_name

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

    function normalizeMatch(match) {

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
            normalizeStatus(match);


        const homeName =
            getTeamName(
                homeTeam,
                firstValue(
                    match.home_name,
                    match.homeName
                ) || "Équipe domicile"
            );


        const awayName =
            getTeamName(
                awayTeam,
                firstValue(
                    match.away_name,
                    match.awayName
                ) || "Équipe visiteuse"
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
                    match.homeBadge
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
                    match.awayBadge
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
                getCompetition(match),


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

                    match.status_name

                ) || "",


            /*
             * Si API a pa bay minute,
             * li rete null.
             *
             * Nou pa janm mete 2 kòm
             * default.
             */

            minute:
                status === "live"
                    ? getMinute(match)
                    : null,


            startTime:
                getStartTime(match),


            raw:
                match

        };

    }


    /* =====================================================
       NORMALIZED MATCHES
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
                .map(
                    normalizeMatch
                )
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
   PREZI LIVE — AUTO REFRESH
========================================================= */

const PreziLive = {

    timer: null,


    start(
        callback,
        seconds = 30
    ) {

        this.stop();


        /*
         * Premye loading
         */

        callback();


        /*
         * Refresh otomatik
         */

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
