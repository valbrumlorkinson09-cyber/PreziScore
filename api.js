"use strict";

/* =========================================================
   PREZISCORE — API.JS
   PART 1 / 2
========================================================= */

const PreziAPI = (() => {

    const BASE =
        "https://sportscore.com/api/widget";

    const SPORT =
        "football";

    const cache =
        new Map();

    const CACHE_TIME =
        15000;


    /* =====================================================
       REQUEST
    ===================================================== */

    async function request(
        endpoint,
        params = {}
    ) {

        const url =
            new URL(BASE + endpoint);

        url.searchParams.set(
            "sport",
            SPORT
        );

        for (
            const key in params
        ) {

            const value =
                params[key];

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


        const cacheKey =
            url.toString();

        const saved =
            cache.get(cacheKey);


        if (
            saved &&
            Date.now() - saved.time <
            CACHE_TIME
        ) {

            return saved.data;

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
                "API HTTP " +
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
       VALUE HELPER
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
       GET ALL MATCHES
    ===================================================== */

    async function getMatches(
        limit = 100
    ) {

        const data =
            await request(
                "/matches/",
                {
                    limit: limit
                }
            );


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
                data?.data
            )
        ) {

            return data.data;

        }


        if (
            Array.isArray(
                data?.events
            )
        ) {

            return data.events;

        }


        return [];

    }


    /* =====================================================
       TEAM OBJECT
    ===================================================== */

    function team(
        match,
        side
    ) {

        if (
            side === "home"
        ) {

            return (
                match.home_team ||
                match.homeTeam ||
                match.team_home ||
                match.home ||
                {}
            );

        }


        return (
            match.away_team ||
            match.awayTeam ||
            match.team_away ||
            match.away ||
            {}
        );

    }


    /* =====================================================
       TEAM NAME
    ===================================================== */

    function teamName(
        match,
        side
    ) {

        const obj =
            team(
                match,
                side
            );


        if (
            typeof obj === "string"
        ) {

            return obj;

        }


        const name =
            first(

                obj?.name,
                obj?.title,
                obj?.team_name,
                obj?.teamName,
                obj?.display_name,
                obj?.displayName,
                obj?.short_name,
                obj?.shortName

            );


        if (name) {

            return String(name);

        }


        if (
            side === "home"
        ) {

            return String(
                first(

                    match.home_name,
                    match.homeName,
                    match.home_team_name,
                    match.homeTeamName

                ) ||
                "Équipe domicile"
            );

        }


        return String(
            first(

                match.away_name,
                match.awayName,
                match.away_team_name,
                match.awayTeamName

            ) ||
            "Équipe visiteuse"
        );

    }


    /* =====================================================
       TEAM LOGO
    ===================================================== */

    function teamLogo(
        match,
        side
    ) {

        const obj =
            team(
                match,
                side
            );


        const logo =
            first(

                obj?.logo,
                obj?.logo_url,
                obj?.logoUrl,

                obj?.image,
                obj?.image_url,
                obj?.imageUrl,

                obj?.photo,
                obj?.photo_url,
                obj?.photoUrl,

                obj?.badge,
                obj?.badge_url,
                obj?.badgeUrl,

                obj?.icon,
                obj?.icon_url,
                obj?.iconUrl

            );


        if (logo) {

            return String(logo);

        }


        if (
            side === "home"
        ) {

            return first(

                match.home_logo,
                match.homeLogo,
                match.home_image,
                match.homeImage,
                match.home_badge,
                match.homeBadge,
                match.home_logo_url,
                match.homeLogoUrl

            );

        }


        return first(

            match.away_logo,
            match.awayLogo,
            match.away_image,
            match.awayImage,
            match.away_badge,
            match.awayBadge,
            match.away_logo_url,
            match.awayLogoUrl

        );

    }


    /* =====================================================
       SCORE
    ===================================================== */

    function score(
        match,
        side
    ) {

        const obj =
            team(
                match,
                side
            );


        let value;


        if (
            side === "home"
        ) {

            value =
                first(

                    match.home_score,
                    match.homeScore,
                    match.home_goals,
                    match.homeGoals,

                    obj?.score,
                    obj?.goals,
                    obj?.current_score,
                    obj?.currentScore

                );

        } else {

            value =
                first(

                    match.away_score,
                    match.awayScore,
                    match.away_goals,
                    match.awayGoals,

                    obj?.score,
                    obj?.goals,
                    obj?.current_score,
                    obj?.currentScore

                );

        }


        if (
            value === null
        ) {

            return null;

        }


        const number =
            Number(value);


        return Number.isNaN(number)
            ? value
            : number;

    }


    /* =====================================================
       STATUS
    ===================================================== */

    function normalizeStatus(
        match
    ) {

        const status =
            String(
                first(

                    match.status,
                    match.state,
                    match.match_status,
                    match.matchStatus,
                    match.status_code,
                    match.statusCode

                ) || ""
            )
            .toLowerCase()
            .trim();


        const text =
            String(
                first(

                    match.status_text,
                    match.statusText,
                    match.status_name,
                    match.statusName

                ) || ""
            )
            .toLowerCase()
            .trim();


        /* LIVE */

        const live = [

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
            "halftime",
            "half time"

        ];


        if (
            live.some(
                word =>
                    status.includes(word) ||
                    text.includes(word)
            )
        ) {

            return "live";

        }


        /* FINISHED */

        const finished = [

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
                    status.includes(word) ||
                    text.includes(word)
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

    function minute(
        match
    ) {

        const value =
            first(

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

                match.status_time,
                match.statusTime

            );


        if (
            value === null
        ) {

            return null;

        }


        if (
            typeof value === "object"
        ) {

            return cleanMinute(
                first(

                    value.minute,
                    value.elapsed,
                    value.elapsed_time,
                    value.elapsedTime,
                    value.current,
                    value.value,
                    value.time

                )
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


        const text =
            String(value)
            .trim()
            .replace(
                /minutes?/gi,
                ""
            )
            .replace(
                /min/gi,
                ""
            )
            .trim();


        const found =
            text.match(
                /^(\d+)/
            );


        if (found) {

            return Number(
                found[1]
            );

        }


        return text;

           }

      /* =====================================================
       START TIME
    ===================================================== */

    function startTime(match) {

        return first(

            match.start_time,
            match.startTime,

            match.start_at,
            match.startAt,

            match.date,
            match.datetime,

            match.timestamp,

            match.time

        );

    }


    /* =====================================================
       COMPETITION
    ===================================================== */

    function competition(match) {

        const value =
            first(

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
            typeof value === "string"
        ) {

            return value;

        }


        if (
            value &&
            typeof value === "object"
        ) {

            return String(
                first(

                    value.name,
                    value.title,
                    value.league_name,
                    value.leagueName

                ) ||
                "Football"
            );

        }


        return "Football";

    }


    /* =====================================================
       COMPETITION LOGO
    ===================================================== */

    function competitionLogo(match) {

        const obj =
            match.competition ||
            match.league ||
            match.tournament;


        if (
            obj &&
            typeof obj === "object"
        ) {

            const logo =
                first(

                    obj.logo,
                    obj.logo_url,
                    obj.logoUrl,

                    obj.image,
                    obj.image_url,
                    obj.imageUrl,

                    obj.icon

                );


            if (logo) {

                return logo;

            }

        }


        return first(

            match.competition_logo,
            match.competitionLogo,

            match.league_logo,
            match.leagueLogo,

            match.tournament_logo,
            match.tournamentLogo

        );

    }


    /* =====================================================
       MATCH ID
    ===================================================== */

    function matchId(match) {

        return first(

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

    function matchSlug(match) {

        return first(

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


        const status =
            normalizeStatus(
                match
            );


        return {

            id:
                matchId(match),


            slug:
                matchSlug(match),


            home: {

                name:
                    teamName(
                        match,
                        "home"
                    ),

                logo:
                    teamLogo(
                        match,
                        "home"
                    ) || null,

                score:
                    score(
                        match,
                        "home"
                    )

            },


            away: {

                name:
                    teamName(
                        match,
                        "away"
                    ),

                logo:
                    teamLogo(
                        match,
                        "away"
                    ) || null,

                score:
                    score(
                        match,
                        "away"
                    )

            },


            competition:
                competition(match),


            competitionLogo:
                competitionLogo(match),


            status:
                status,


            statusText:
                String(
                    first(

                        match.status_text,
                        match.statusText,
                        match.status_name,
                        match.statusName

                    ) || ""
                ),


            minute:
                status === "live"
                    ? minute(match)
                    : null,


            startTime:
                startTime(match),


            raw:
                match

        };

    }


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


        const result =
            matches
                .map(
                    normalizeMatch
                )
                .filter(Boolean);


        console.log(
            "📊 Matchs normalisés:",
            result
        );


        return result;

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


        return request(
            "/match/",
            {
                slug: slug
            }
        );

    }


    /* =====================================================
       TEAM DETAILS
    ===================================================== */

    async function getTeam(slug) {

        if (!slug) {

            throw new Error(
                "Team slug manke"
            );

        }


        return request(
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

    async function getTopScorers(slug) {

        return request(
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

        getMinute: minute,

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


        if (
            typeof callback === "function"
        ) {

            callback();

        }


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


/* =========================================================
   READY
========================================================= */

console.log(
    "✅ PREZISCORE API READY"
);            
