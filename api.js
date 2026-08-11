"use strict";

/* =========================================================
   PREZISCORE — API.JS
   PARTIE 1 / 3

   - SportScore
   - Football
   - Matches
   - Teams
   - Logos
   - Scores
   - Status
   - Cache
========================================================= */

const PreziAPI = (() => {

    /* =====================================================
       CONFIG
    ===================================================== */

    const BASE_URL =
        "https://sportscore.com/api/widget";

    const SPORT =
        "football";

    const CACHE_TIME =
        10000;

    const cache =
        new Map();


    /* =====================================================
       FIRST VALUE
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


        console.log(
            "📡 PreziScore API:",
            endpoint,
            params
        );


        let response;

        try {

            response =
                await fetch(
                    url.toString(),
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );

        } catch (error) {

            console.error(
                "❌ API NETWORK ERROR:",
                error
            );

            throw new Error(
                "Impossible de contacter SportScore"
            );

        }


        if (!response.ok) {

            throw new Error(
                "SportScore HTTP " +
                response.status
            );

        }


        let data;

        try {

            data =
                await response.json();

        } catch (error) {

            console.error(
                "❌ API JSON ERROR:",
                error
            );

            throw new Error(
                "Réponse API invalide"
            );

        }


        cache.set(
            cacheKey,
            {
                time:
                    Date.now(),

                data:
                    data
            }
        );


        return data;

    }


    /* =====================================================
       GET RAW MATCHES
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
                    limit:
                        safeLimit
                }
            );


        console.log(
            "📦 RAW MATCH DATA:",
            data
        );


        /* API → matches */

        if (
            Array.isArray(
                data?.matches
            )
        ) {

            return data.matches;

        }


        /* API → data */

        if (
            Array.isArray(
                data?.data
            )
        ) {

            return data.data;

        }


        /* API → results */

        if (
            Array.isArray(
                data?.results
            )
        ) {

            return data.results;

        }


        /* API → events */

        if (
            Array.isArray(
                data?.events
            )
        ) {

            return data.events;

        }


        /* API dirèkteman voye array */

        if (
            Array.isArray(data)
        ) {

            return data;

        }


        console.warn(
            "⚠️ API pa jwenn lis matchs."
        );


        return [];

    }


    /* =====================================================
       TEAM OBJECT
    ===================================================== */

    function getTeam(
        match,
        side
    ) {

        if (
            side === "home"
        ) {

            return (
                match?.home_team ||
                match?.homeTeam ||
                match?.home ||
                match?.home_team_data ||
                match?.homeTeamData ||
                {}
            );

        }


        return (
            match?.away_team ||
            match?.awayTeam ||
            match?.away ||
            match?.away_team_data ||
            match?.awayTeamData ||
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
            getTeam(
                match,
                side
            );


        /* Team = string */

        if (
            typeof team === "string"
        ) {

            return team.trim();

        }


        /* Team = object */

        if (
            team &&
            typeof team === "object"
        ) {

            const name =
                firstValue(

                    team.name,

                    team.title,

                    team.team_name,

                    team.teamName,

                    team.display_name,

                    team.displayName,

                    team.short_name,

                    team.shortName,

                    team.label

                );


            if (name) {

                return String(name);

            }

        }


        /* Fallback direct fields */

        const directName =
            side === "home"

                ? firstValue(
                    match?.home_name,
                    match?.homeName,
                    match?.home_team_name,
                    match?.homeTeamName
                )

                : firstValue(
                    match?.away_name,
                    match?.awayName,
                    match?.away_team_name,
                    match?.awayTeamName
                );


        if (directName) {

            return String(
                directName
            );

        }


        return (
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


        /* Team object */

        if (
            team &&
            typeof team === "object"
        ) {

            const logo =
                firstValue(

                    team.logo,

                    team.logo_url,

                    team.logoUrl,

                    team.badge,

                    team.badge_url,

                    team.badgeUrl,

                    team.image,

                    team.image_url,

                    team.imageUrl,

                    team.photo,

                    team.photo_url,

                    team.icon

                );


            if (logo) {

                return String(
                    logo
                );

            }

        }


        /* Direct logo fields */

        const directLogo =
            side === "home"

                ? firstValue(
                    match?.home_logo,
                    match?.homeLogo,
                    match?.home_image,
                    match?.homeImage,
                    match?.home_badge,
                    match?.homeBadge,
                    match?.home_logo_url,
                    match?.homeLogoUrl
                )

                : firstValue(
                    match?.away_logo,
                    match?.awayLogo,
                    match?.away_image,
                    match?.awayImage,
                    match?.away_badge,
                    match?.awayBadge,
                    match?.away_logo_url,
                    match?.awayLogoUrl
                );


        if (directLogo) {

            return String(
                directLogo
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
            getTeam(
                match,
                side
            );


        const directScore =
            side === "home"

                ? firstValue(
                    match?.home_score,
                    match?.homeScore,
                    match?.home_goals,
                    match?.homeGoals,
                    match?.score_home,
                    match?.scoreHome
                )

                : firstValue(
                    match?.away_score,
                    match?.awayScore,
                    match?.away_goals,
                    match?.awayGoals,
                    match?.score_away,
                    match?.scoreAway
                );


        if (
            directScore !== null
        ) {

            const number =
                Number(
                    directScore
                );


            return Number.isNaN(
                number
            )
                ? directScore
                : number;

        }


        /* Score anndan team object */

        if (
            team &&
            typeof team === "object"
        ) {

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
                    Number(
                        teamScore
                    );


                return Number.isNaN(
                    number
                )
                    ? teamScore
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
            String(
                firstValue(

                    match?.status,

                    match?.state,

                    match?.match_status,

                    match?.matchStatus,

                    match?.match_state,

                    match?.matchState,

                    match?.status_code,

                    match?.statusCode

                ) || ""
            )
            .toLowerCase()
            .trim();


        const statusText =
            String(
                firstValue(

                    match?.status_text,

                    match?.statusText,

                    match?.status_name,

                    match?.statusName,

                    match?.state_text,

                    match?.stateText

                ) || ""
            )
            .toLowerCase()
            .trim();


        const combined =
            rawStatus +
            " " +
            statusText;


        /* =========================
           LIVE
        ========================= */

        const liveWords = [

            "live",

            "playing",

            "in_progress",

            "in progress",

            "progress",

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
                    combined.includes(
                        word
                    )
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

            "full_time",

            "full time",

            "full-time",

            "ft"

        ];


        if (
            finishedWords.some(
                word =>
                    combined.includes(
                        word
                    )
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
       START TIME
    ===================================================== */

    function getStartTime(
        match
    ) {

        return firstValue(

            match?.start_time,

            match?.startTime,

            match?.start_at,

            match?.startAt,

            match?.kickoff,

            match?.kick_off,

            match?.date,

            match?.datetime,

            match?.time

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

                match?.competition,

                match?.league,

                match?.tournament,

                match?.competition_name,

                match?.competitionName,

                match?.league_name,

                match?.leagueName,

                match?.tournament_name,

                match?.tournamentName

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

                    competition.leagueName

                ) ||
                "Football"
            );

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

            match?.id,

            match?.match_id,

            match?.matchId,

            match?.event_id,

            match?.eventId,

            match?.game_id,

            match?.gameId

        );

    }


    /* =====================================================
       MATCH SLUG
    ===================================================== */

    function getMatchSlug(
        match
    ) {

        return firstValue(

            match?.slug,

            match?.match_slug,

            match?.matchSlug,

            match?.url,

            match?.link

        );

    }


    /* =====================================================
       NORMALIZE
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


        return {

            id:
                getMatchId(
                    match
                ),


            slug:
                getMatchSlug(
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
                getCompetition(
                    match
                ),


            status:
                status,


            statusText:
                firstValue(

                    match?.status_text,

                    match?.statusText,

                    match?.status_name

                ) || "",


            startTime:
                getStartTime(
                    match
                ),


            raw:
                match

        };

    }


    /* =====================================================
       NORMALIZED MATCHES
    ===================================================== */

    async function getNormalizedMatches() {

        const matches =
            await getMatches(
                100
            );


        const normalized =
            matches
                .map(
                    normalizeMatch
                )
                .filter(Boolean);


        console.log(
            "⚽ PreziScore:",
            normalized.length,
            "matchs normalisés"
        );


        return normalized;

    }


    /* =====================================================
       CLEAR CACHE
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

        normalizeMatch,

        normalizeStatus,

        clearCache

    };

})();


/* =========================================================
   GLOBAL
========================================================= */

window.PreziAPI =
    PreziAPI;


console.log(
    "✅ PREZISCORE API PART 1 READY"
);
