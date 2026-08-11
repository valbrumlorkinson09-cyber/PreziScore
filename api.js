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

/* =========================================================
   PREZISCORE — API.JS
   PARTIE 2 / 3

   LIVE MINUTE + TRACKER + DETAILS
========================================================= */


/* =========================================================
   MINUTE CLEANER
========================================================= */

function cleanMinute(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }


    /* Si API a voye object */

    if (
        typeof value === "object"
    ) {

        value =

            value.minute ??

            value.minutes ??

            value.elapsed ??

            value.elapsed_time ??

            value.elapsedTime ??

            value.current ??

            value.value ??

            value.time ??

            null;

    }


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
       Egzanp:
       45
       67'
       67 min
       67 minutes
       67:30
       45+2
    */

    text =
        text
            .replace(
                /minutes?/gi,
                ""
            )
            .replace(
                /mins?/gi,
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


    return null;

}


/* =========================================================
   GET MINUTE FROM MATCH
========================================================= */

function getMatchMinute(
    match
) {

    if (!match) {
        return null;
    }


    /*
       Nou pa mete okenn "2"
       kòm fallback.
    */

    const direct =
        firstValue(

            match.minute,

            match.minutes,

            match.elapsed,

            match.elapsed_time,

            match.elapsedTime,

            match.live_minute,

            match.liveMinute,

            match.current_minute,

            match.currentMinute,

            match.game_minute,

            match.gameMinute,

            match.match_minute,

            match.matchMinute,

            match.match_time,

            match.matchTime,

            match.play_time,

            match.playTime,

            match.status_time,

            match.statusTime

        );


    if (
        direct !== null
    ) {

        return cleanMinute(
            direct
        );

    }


    /* =====================================================
       CLOCK
    ===================================================== */

    if (
        match.clock &&
        typeof match.clock === "object"
    ) {

        const clock =
            firstValue(

                match.clock.minute,

                match.clock.minutes,

                match.clock.elapsed,

                match.clock.elapsed_time,

                match.clock.current,

                match.clock.value,

                match.clock.time

            );


        if (
            clock !== null
        ) {

            return cleanMinute(
                clock
            );

        }

    }


    /* =====================================================
       TIMER
    ===================================================== */

    if (
        match.timer &&
        typeof match.timer === "object"
    ) {

        const timer =
            firstValue(

                match.timer.minute,

                match.timer.minutes,

                match.timer.elapsed,

                match.timer.elapsed_time,

                match.timer.current,

                match.timer.value,

                match.timer.time

            );


        if (
            timer !== null
        ) {

            return cleanMinute(
                timer
            );

        }

    }


    return null;

}


/* =========================================================
   GET TRACKER
========================================================= */

async function getTracker(
    id
) {

    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        return null;

    }


    try {

        const data =
            await request(
                "/tracker/",
                {
                    id: id
                }
            );


        console.log(
            "⏱️ Tracker:",
            id,
            data
        );


        return data;

    }

    catch (error) {

        console.warn(
            "⚠️ Tracker indisponible:",
            id
        );


        return null;

    }

}


/* =========================================================
   EXTRACT MINUTE FROM TRACKER
========================================================= */

function getTrackerMinute(
    tracker
) {

    if (!tracker) {
        return null;
    }


    /*
       Tracker ka ka ka:
       data
       tracker
       match
       event
    */

    const sources = [

        tracker,

        tracker.data,

        tracker.tracker,

        tracker.match,

        tracker.event,

        tracker.result

    ];


    for (
        const source of sources
    ) {

        if (
            !source
        ) {
            continue;
        }


        const minute =
            getMatchMinute(
                source
            );


        if (
            minute !== null
        ) {

            return minute;

        }

    }


    return null;

}


/* =========================================================
   GET LIVE MINUTE
========================================================= */

async function getLiveMinute(
    match
) {

    if (!match) {
        return null;
    }


    /*
       PREMIÈRE TENTATIVE:
       minit ki deja nan match la.
    */

    const directMinute =
        getMatchMinute(
            match.raw ||
            match
        );


    if (
        directMinute !== null
    ) {

        return directMinute;

    }


    /*
       DEZYÈM TENTATIV:
       tracker.
    */

    const id =
        match.id ||
        match.raw?.id ||
        match.raw?.match_id ||
        match.raw?.event_id;


    if (!id) {

        return null;

    }


    const tracker =
        await getTracker(
            id
        );


    return getTrackerMinute(
        tracker
    );

}


/* =========================================================
   ADD LIVE MINUTES
========================================================= */

async function addLiveMinutes(
    matches
) {

    if (
        !Array.isArray(matches)
    ) {

        return [];

    }


    const liveMatches =
        matches.filter(
            match =>
                match.status === "live"
        );


    /*
       Si pa gen live,
       pa bezwen tracker.
    */

    if (
        liveMatches.length === 0
    ) {

        return matches;

    }


    console.log(
        "⏱️ Recherche minutes pour",
        liveMatches.length,
        "matchs LIVE..."
    );


    /*
       Nou limite demann tracker yo
       pou API a pa pran twòp request.
    */

    const updated =
        await Promise.all(

            liveMatches.map(
                async match => {

                    try {

                        const minute =
                            await getLiveMinute(
                                match
                            );


                        if (
                            minute !== null
                        ) {

                            match.minute =
                                minute;

                        }

                    }

                    catch (error) {

                        console.warn(
                            "⚠️ Minute pa disponib:",
                            match.id
                        );

                    }


                    return match;

                }
            )

        );


    /*
       Ranplase ansyen live matches
       yo ak nouvo yo.
    */

    const map =
        new Map();


    updated.forEach(
        match => {

            map.set(
                String(match.id),
                match
            );

        }
    );


    return matches.map(
        match => {

            const key =
                String(match.id);


            return map.get(key) ||
                match;

        }
    );

}


/* =========================================================
   GET LIVE MATCHES
========================================================= */

async function getLiveMatches() {

    const matches =
        await getNormalizedMatches();


    const live =
        matches.filter(
            match =>
                match.status === "live"
        );


    return await addLiveMinutes(
        live
    );

}


/* =========================================================
   GET UPCOMING MATCHES
========================================================= */

async function getUpcomingMatches() {

    const matches =
        await getNormalizedMatches();


    return matches.filter(
        match =>
            match.status === "upcoming"
    );

}


/* =========================================================
   GET FINISHED MATCHES
========================================================= */

async function getFinishedMatches() {

    const matches =
        await getNormalizedMatches();


    return matches.filter(
        match =>
            match.status === "finished"
    );

}


/* =========================================================
   GET ONE MATCH
========================================================= */

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


/* =========================================================
   GET TEAM
========================================================= */

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


/* =========================================================
   GET STANDINGS
========================================================= */

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


/* =========================================================
   GET TOP SCORERS
========================================================= */

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


/* =========================================================
   GET PLAYER
========================================================= */

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


/* =========================================================
   GET BRACKET
========================================================= */

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


/* =========================================================
   UPDATE PUBLIC API
========================================================= */

Object.assign(
    PreziAPI,
    {

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

        getLiveMinute,

        addLiveMinutes

    }
);


console.log(
    "✅ PREZISCORE API PART 2 READY"
   /* =========================================================
   PREZISCORE — API.JS
   PARTIE 3 / 3

   FINAL PUBLIC API
   AUTO REFRESH
   LIVE MINUTE FALLBACK
   CACHE CONTROL
========================================================= */


/* =========================================================
   GET ALL MATCHES
========================================================= */

async function getAllMatches() {

    const matches =
        await getNormalizedMatches();


    /*
       Pou LIVE sèlman,
       nou eseye jwenn minit la.
    */

    const result =
        await addLiveMinutes(
            matches
        );


    return result;

}


/* =========================================================
   GET LIVE + ALL DATA
========================================================= */

async function getLiveData() {

    try {

        const matches =
            await getAllMatches();


        const live =
            matches.filter(
                match =>
                    match.status === "live"
            );


        console.log(
            "🔴 LIVE:",
            live.length
        );


        return live;

    }

    catch (error) {

        console.error(
            "❌ LIVE DATA ERROR:",
            error
        );


        return [];

    }

}


/* =========================================================
   MINUTE FORMAT
========================================================= */

function formatMinute(
    minute
) {

    if (
        minute === null ||
        minute === undefined ||
        minute === ""
    ) {

        return "";

    }


    const number =
        Number(minute);


    if (
        Number.isNaN(number)
    ) {

        return "";

    }


    return (
        number +
        "'"
    );

}


/* =========================================================
   LIVE LABEL
========================================================= */

function getLiveLabel(
    match
) {

    if (
        !match ||
        match.status !== "live"
    ) {

        return "";

    }


    /*
       IMPORTANT:
       Pa mete "2'" si API a pa bay li.
    */

    const minute =
        match.minute;


    if (
        minute !== null &&
        minute !== undefined
    ) {

        return (
            "LIVE • " +
            formatMinute(
                minute
            )
        );

    }


    return "LIVE";

}


/* =========================================================
   REFRESH MATCHES
========================================================= */

async function refreshMatches() {

    try {

        /*
           Netwaye cache avan refresh
           pou jwenn nouvo score/minit.
        */

        clearCache();


        const matches =
            await getAllMatches();


        return matches;

    }

    catch (error) {

        console.error(
            "❌ Refresh error:",
            error
        );


        return [];

    }

}


/* =========================================================
   SAFE REQUEST
========================================================= */

async function safeRequest(
    endpoint,
    params = {}
) {

    try {

        return await request(
            endpoint,
            params
        );

    }

    catch (error) {

        console.error(
            "❌ API request error:",
            endpoint,
            error
        );


        return null;

    }

}


/* =========================================================
   API HEALTH CHECK
========================================================= */

async function healthCheck() {

    try {

        const matches =
            await getMatches(
                1
            );


        if (
            Array.isArray(
                matches
            )
        ) {

            console.log(
                "🟢 PreziScore API OK"
            );


            return true;

        }


        return false;

    }

    catch (error) {

        console.error(
            "🔴 PreziScore API OFFLINE",
            error
        );


        return false;

    }

}


/* =========================================================
   AUTO REFRESH ENGINE
========================================================= */

const PreziLive = {

    timer: null,

    running: false,


    start(
        callback,
        seconds = 30
    ) {

        this.stop();


        if (
            typeof callback !==
            "function"
        ) {

            console.error(
                "❌ PreziLive callback pa valid"
            );


            return;

        }


        this.running =
            true;


        /*
           Premye refresh imedyat.
        */

        callback();


        /*
           Apre sa chak X segonn.
        */

        this.timer =
            setInterval(

                () => {

                    if (
                        this.running
                    ) {

                        callback();

                    }

                },

                Math.max(
                    Number(seconds) ||
                    30,

                    10
                ) * 1000

            );


        console.log(
            "🔄 PreziLive started"
        );

    },


    stop() {

        if (
            this.timer
        ) {

            clearInterval(
                this.timer
            );

        }


        this.timer =
            null;


        this.running =
            false;


        console.log(
            "⏹️ PreziLive stopped"
        );

    }

};


/* =========================================================
   FINAL PUBLIC API
========================================================= */

Object.assign(
    PreziAPI,
    {

        getAllMatches,

        getLiveData,

        formatMinute,

        getLiveLabel,

        refreshMatches,

        safeRequest,

        healthCheck

    }
);


/* =========================================================
   GLOBAL OBJECTS
========================================================= */

window.PreziAPI =
    PreziAPI;


window.PreziLive =
    PreziLive;


/* =========================================================
   FINAL TEST
========================================================= */

console.log(
    "===================================="
);

console.log(
    "⚽ PREZISCORE API READY"
);

console.log(
    "🔴 LIVE MATCHES READY"
);

console.log(
    "⏱️ LIVE MINUTE SYSTEM READY"
);

console.log(
    "🏆 COMPETITIONS READY"
);

console.log(
    "👤 PLAYERS READY"
);

console.log(
    "📊 STANDINGS READY"
);

console.log(
    "🔄 AUTO REFRESH READY"
);

console.log(
    "===================================="
);


/* =========================================================
   OPTIONAL START TEST
========================================================= */

(async function () {

    try {

        const ok =
            await healthCheck();


        if (ok) {

            console.log(
                "✅ SportScore konekte ak PreziScore"
            );

        }

        else {

            console.warn(
                "⚠️ SportScore pa retounen matchs"
            );

        }

    }

    catch (error) {

        console.error(
            "❌ PreziScore API initialization error:",
            error
        );

    }

})();
);
