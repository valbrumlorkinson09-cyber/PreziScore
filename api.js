"use strict";

/* =========================================================
   PREZISCORE — API.JS
   NOUVO ENGINE
   PARTIE 1 / 3

   SportScore
   • Matchs LIVE
   • Matchs à venir
   • Matchs terminés
   • Équipes
   • Logos
   • Scores
========================================================= */

const PreziAPI = (() => {

    const BASE_URL =
        "https://sportscore.com/api/widget";

    const SPORT =
        "football";

    const CACHE_TIME =
        60000;

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


        const key =
            url.toString();


        const saved =
            cache.get(key);


        if (
            saved &&
            Date.now() - saved.time <
            CACHE_TIME
        ) {

            return saved.data;

        }


        console.log(
            "📡 PreziScore API:",
            key
        );


        const response =
            await fetch(
                key,
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
            key,
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
                                Number(limit) ||
                                100,
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
            Array.isArray(
                data?.data
            )
        ) {

            return data.data;

        }


        if (
            Array.isArray(data)
        ) {

            return data;

        }


        return [];

    }


    /* =====================================================
       FIRST VALUE
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
       TEAM
    ===================================================== */

    function getTeam(
        match,
        side
    ) {

        if (
            side === "home"
        ) {

            return (
                match.home_team ||
                match.homeTeam ||
                match.home ||
                {}
            );

        }


        return (
            match.away_team ||
            match.awayTeam ||
            match.away ||
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


        if (
            typeof team === "string"
        ) {

            return team;

        }


        const name =
            first(

                team?.name,
                team?.title,
                team?.team_name,
                team?.teamName,
                team?.display_name,
                team?.displayName,
                team?.short_name,
                team?.shortName,

                side === "home"
                    ? match.home_name
                    : match.away_name,

                side === "home"
                    ? match.homeName
                    : match.awayName

            );


        return (
            name ||
            (
                side === "home"
                    ? "Équipe domicile"
                    : "Équipe visiteuse"
            )
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


        const direct =
            side === "home"
                ? first(
                    match.home_logo,
                    match.homeLogo,
                    match.home_image,
                    match.homeImage,
                    match.home_badge,
                    match.homeBadge
                )
                : first(
                    match.away_logo,
                    match.awayLogo,
                    match.away_image,
                    match.awayImage,
                    match.away_badge,
                    match.awayBadge
                );


        if (
            direct
        ) {

            return direct;

        }


        if (
            team &&
            typeof team === "object"
        ) {

            return first(

                team.logo,
                team.logo_url,
                team.logoUrl,

                team.badge,
                team.badge_url,

                team.image,
                team.image_url,

                team.photo,
                team.photo_url,

                team.icon

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


        const score =
            side === "home"
                ? first(
                    match.home_score,
                    match.homeScore,
                    match.home_goals,
                    match.homeGoals,
                    match.score_home,
                    match.scoreHome
                )
                : first(
                    match.away_score,
                    match.awayScore,
                    match.away_goals,
                    match.awayGoals,
                    match.score_away,
                    match.scoreAway
                );


        if (
            score !== null
        ) {

            const number =
                Number(score);


            return Number.isNaN(
                number
            )
                ? score
                : number;

        }


        if (
            team &&
            typeof team === "object"
        ) {

            const teamScore =
                first(
                    team.score,
                    team.goals,
                    team.current_score,
                    team.currentScore
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


        const value =
            status +
            " " +
            text;


        /* LIVE */

        if (

            value.includes("live") ||
            value.includes("progress") ||
            value.includes("playing") ||
            value.includes("ongoing") ||
            value.includes("started") ||
            value.includes("1st half") ||
            value.includes("2nd half") ||
            value.includes("first half") ||
            value.includes("second half")

        ) {

            return "live";

        }


        /* FINISHED */

        if (

            value.includes("finished") ||
            value.includes("ended") ||
            value.includes("completed") ||
            value.includes("full time") ||
            value.includes("full_time") ||
            value === "ft"

        ) {

            return "finished";

        }


        return "upcoming";

    }


    /* =====================================================
       COMPETITION
    ===================================================== */

    function getCompetition(
        match
    ) {

        const competition =
            first(

                match.competition,
                match.league,
                match.tournament,
                match.competition_name,
                match.league_name,
                match.tournament_name

            );


        if (
            typeof competition ===
            "string"
        ) {

            return competition;

        }


        if (
            competition &&
            typeof competition ===
            "object"
        ) {

            return (
                first(
                    competition.name,
                    competition.title,
                    competition.league_name
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

        return first(

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

    function getSlug(
        match
    ) {

        return first(

            match.slug,
            match.match_slug,
            match.matchSlug,
            match.url,
            match.link

        );

    }


    /* =====================================================
       START TIME
    ===================================================== */

    function getStartTime(
        match
    ) {

        return first(

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
       NORMALIZE MATCH
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


            startTime:
                getStartTime(
                    match
                ),


            /*
               Nou pa mete okenn fo
               minit isit la.
            */

            minute:
                null,


            raw:
                match

        };

    }


    /* =====================================================
       GET NORMALIZED MATCHES
    ===================================================== */

    async function getNormalizedMatches() {

        const raw =
            await getMatches(
                100
            );


        const matches =
            raw
                .map(
                    normalizeMatch
                )
                .filter(Boolean);


        console.log(
            "⚽ PreziScore:",
            matches.length,
            "matchs"
        );


        return matches;

    }


    /* =====================================================
       CACHE
    ===================================================== */

    function clearCache() {

        cache.clear();

    }


    /* =====================================================
       EXPORT
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
    "✅ PreziScore API PART 1 READY"
   /* =========================================================
   PREZISCORE — API.JS
   PARTIE 2 / 3

   LIVE DETAILS
   • Vrai minute
   • Timeline
   • Match details
   • Fallback minute
========================================================= */


/* =========================================================
   MATCH DETAILS
========================================================= */

async function getMatchDetails(
    slug
) {

    if (
        !slug
    ) {

        return null;

    }


    try {

        const data =
            await PreziAPI.request(
                "/match/",
                {
                    slug:
                        slug
                }
            );


        return data || null;

    }

    catch (error) {

        console.warn(
            "⚠️ Match details indisponible:",
            slug
        );


        return null;

    }

}


/* =========================================================
   FIND MINUTE IN OBJECT
========================================================= */

function findMinute(
    object,
    depth = 0
) {

    /*
       Pa fouye twò fon pou evite
       boucle oswa done initil.
    */

    if (
        !object ||
        depth > 5
    ) {

        return null;

    }


    /* NUMBER */

    if (
        typeof object === "number"
    ) {

        if (
            object >= 0 &&
            object <= 130
        ) {

            return object;

        }


        return null;

    }


    /* STRING */

    if (
        typeof object === "string"
    ) {

        const text =
            object
                .trim()
                .toLowerCase();


        /*
           Egzanp:
           67
           67'
           67 min
           67:30
           67+2
        */

        const found =
            text.match(
                /^(\d{1,3})(?:\s*['′]|:\d{1,2}|\s*(?:min|mins|minutes)|\+)?/
            );


        if (
            found
        ) {

            const number =
                Number(
                    found[1]
                );


            if (
                number >= 0 &&
                number <= 130
            ) {

                return number;

            }

        }


        return null;

    }


    /* ARRAY */

    if (
        Array.isArray(
            object
        )
    ) {

        /*
           Timeline/events yo souvan
           gen dènye event la.
        */

        for (
            let i =
                object.length - 1;

            i >= 0;

            i--
        ) {

            const result =
                findMinute(
                    object[i],
                    depth + 1
                );


            if (
                result !== null
            ) {

                return result;

            }

        }


        return null;

    }


    /* OBJECT */

    if (
        typeof object ===
        "object"
    ) {

        /*
           Nou chèche field ki gen
           gwo chans pou se minit.
        */

        const directKeys = [

            "minute",
            "minutes",
            "elapsed",
            "elapsed_time",
            "elapsedTime",
            "match_time",
            "matchTime",
            "game_time",
            "gameTime",
            "live_minute",
            "liveMinute",
            "current_minute",
            "currentMinute",
            "game_minute",
            "gameMinute",
            "play_time",
            "playTime",
            "clock",
            "timer"

        ];


        for (
            const key
            of directKeys
        ) {

            if (
                Object.prototype
                    .hasOwnProperty
                    .call(
                        object,
                        key
                    )
            ) {

                const result =
                    findMinute(
                        object[key],
                        depth + 1
                    );


                if (
                    result !== null
                ) {

                    return result;

                }

            }

        }


        /*
           Apre sa nou gade events/timeline.
        */

        const eventKeys = [

            "timeline",
            "events",
            "incidents",
            "match_events",
            "matchEvents",
            "live_events",
            "liveEvents"

        ];


        for (
            const key
            of eventKeys
        ) {

            if (
                object[key]
            ) {

                const result =
                    findMinute(
                        object[key],
                        depth + 1
                    );


                if (
                    result !== null
                ) {

                    return result;

                }

            }

        }


        return null;

    }


    return null;

}


/* =========================================================
   GET MINUTE FROM MATCH DETAILS
========================================================= */

function getDetailMinute(
    details
) {

    if (
        !details
    ) {

        return null;

    }


    /*
       Premye eseye field dirèk yo.
    */

    const direct =
        findMinute(
            details
        );


    if (
        direct !== null
    ) {

        return direct;

    }


    /*
       Gen API ki mete detay yo
       andedan data/result/match.
    */

    const containers = [

        details.data,

        details.result,

        details.match,

        details.event,

        details.details

    ];


    for (
        const container
        of containers
    ) {

        const minute =
            findMinute(
                container
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
   ADD LIVE MINUTES
========================================================= */

async function addLiveMinutes(
    matches
) {

    if (
        !Array.isArray(
            matches
        )
    ) {

        return [];

    }


    const result =
        [...matches];


    const liveMatches =
        result.filter(
            match =>
                match.status ===
                "live"
        );


    console.log(
        "🔴 LIVE pou verifye:",
        liveMatches.length
    );


    /*
       Nou limite request yo
       pou API a pa chaje twòp.
    */

    const requests =
        liveMatches.map(
            async match => {

                if (
                    !match.slug
                ) {

                    return;

                }


                /*
                   Si API list la deja bay
                   minit la, nou pa bezwen
                   fè yon lòt request.
                */

                if (
                    match.minute !== null &&
                    match.minute !== undefined
                ) {

                    return;

                }


                const details =
                    await getMatchDetails(
                        match.slug
                    );


                const minute =
                    getDetailMinute(
                        details
                    );


                if (
                    minute !== null
                ) {

                    match.minute =
                        minute;


                    console.log(
                        "⏱️",
                        match.home.name,
                        "vs",
                        match.away.name,
                        "→",
                        minute + "'"
                    );

                }

            }
        );


    await Promise.allSettled(
        requests
    );


    return result;

}


/* =========================================================
   GET LIVE MATCHES
========================================================= */

async function getLiveMatches() {

    const matches =
        await PreziAPI
            .getNormalizedMatches();


    return await addLiveMinutes(
        matches.filter(
            match =>
                match.status ===
                "live"
        )
    );

}


/* =========================================================
   GET UPCOMING MATCHES
========================================================= */

async function getUpcomingMatches() {

    const matches =
        await PreziAPI
            .getNormalizedMatches();


    return matches.filter(
        match =>
            match.status ===
            "upcoming"
    );

}


/* =========================================================
   GET FINISHED MATCHES
========================================================= */

async function getFinishedMatches() {

    const matches =
        await PreziAPI
            .getNormalizedMatches();


    return matches.filter(
        match =>
            match.status ===
            "finished"
    );

}


/* =========================================================
   SAFE DETAILS
========================================================= */

async function safeMatchDetails(
    slug
) {

    try {

        return await getMatchDetails(
            slug
        );

    }

    catch (
        error
    ) {

        console.warn(
            "⚠️ Details error:",
            error
        );


        return null;

    }

}


/* =========================================================
   EXTEND PUBLIC API
========================================================= */

Object.assign(
    PreziAPI,
    {

        getMatchDetails,

        getDetailMinute,

        addLiveMinutes,

        getLiveMatches,

        getUpcomingMatches,

        getFinishedMatches,

        safeMatchDetails

    }
);


console.log(
    "✅ PreziScore API PART 2 READY"
   
);/* =========================================================
   PREZISCORE — API.JS
   PARTIE 3 / 3

   FINAL
   • Auto refresh
   • Live refresh
   • Minute refresh
   • Safe errors
   • Global API
========================================================= */


/* =========================================================
   AUTO REFRESH
========================================================= */

const PreziLive = {

    timer: null,

    running: false,

    callback: null,


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
                "❌ PreziLive: callback manke."
            );

            return;

        }


        this.callback =
            callback;


        this.running =
            true;


        /*
           Premye chaj la touswit.
        */

        try {

            callback();

        }

        catch (
            error
        ) {

            console.error(
                "❌ PreziLive callback:",
                error
            );

        }


        /*
           Apre sa refresh otomatik.
        */

        this.timer =
            setInterval(
                () => {

                    if (
                        !this.running
                    ) {

                        return;

                    }


                    try {

                        callback();

                    }

                    catch (
                        error
                    ) {

                        console.error(
                            "❌ Refresh error:",
                            error
                        );

                    }

                },
                Math.max(
                    Number(seconds) || 30,
                    15
                ) * 1000
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

    },


    restart(
        seconds = 30
    ) {

        if (
            typeof this.callback !==
            "function"
        ) {

            return;

        }


        this.start(
            this.callback,
            seconds
        );

    }

};


/* =========================================================
   LIVE MINUTE REFRESH
========================================================= */

let liveMinuteTimer =
    null;


function startLiveMinuteRefresh(
    callback,
    seconds = 30
) {

    stopLiveMinuteRefresh();


    if (
        typeof callback !==
        "function"
    ) {

        return;

    }


    liveMinuteTimer =
        setInterval(
            async () => {

                try {

                    await callback();

                }

                catch (
                    error
                ) {

                    console.warn(
                        "⚠️ Minute refresh:",
                        error
                    );

                }

            },

            Math.max(
                Number(seconds) || 30,
                15
            ) * 1000
        );

}


function stopLiveMinuteRefresh() {

    if (
        liveMinuteTimer
    ) {

        clearInterval(
            liveMinuteTimer
        );

    }


    liveMinuteTimer =
        null;

}


/* =========================================================
   FORCE REFRESH
========================================================= */

async function refreshMatches() {

    /*
       Nou netwaye cache la avan
       nouvo request la.
    */

    if (
        typeof PreziAPI
            .clearCache ===
        "function"
    ) {

        PreziAPI.clearCache();

    }


    const matches =
        await PreziAPI
            .getNormalizedMatches();


    return await addLiveMinutes(
        matches
    );

}


/* =========================================================
   LIVE ONLY + REAL MINUTE
========================================================= */

async function refreshLiveMatches() {

    const matches =
        await refreshMatches();


    return matches.filter(
        match =>
            match.status ===
            "live"
    );

}


/* =========================================================
   ALL MATCHES + MINUTES
========================================================= */

async function getAllMatches() {

    const matches =
        await PreziAPI
            .getNormalizedMatches();


    /*
       Se sèlman LIVE yo ki bezwen
       detay `/match/` pou minute.
    */

    return await addLiveMinutes(
        matches
    );

}


/* =========================================================
   API STATUS
========================================================= */

async function testAPI() {

    try {

        const matches =
            await PreziAPI
                .getMatches(1);


        if (
            Array.isArray(
                matches
            )
        ) {

            console.log(
                "✅ PreziScore API OK"
            );


            return {

                ok: true,

                matches:
                    matches.length

            };

        }


        return {

            ok: false,

            matches: 0

        };

    }

    catch (
        error
    ) {

        console.error(
            "❌ PreziScore API ERROR:",
            error
        );


        return {

            ok: false,

            error:
                error.message

        };

    }

}


/* =========================================================
   CLEAR EVERYTHING
========================================================= */

function clearPreziCache() {

    try {

        if (
            typeof PreziAPI
                .clearCache ===
            "function"
        ) {

            PreziAPI.clearCache();

        }

    }

    catch (
        error
    ) {

        console.warn(
            "Cache clear error:",
            error
        );

    }

}


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        /*
           Lè itilizatè a retounen sou sit la,
           nou fè yon nouvo request.
        */

        if (
            document.visibilityState ===
            "visible"
        ) {

            clearPreziCache();

        }

    }
);


/* =========================================================
   ONLINE / OFFLINE
========================================================= */

window.addEventListener(
    "online",
    () => {

        console.log(
            "🌐 Internet reconnecté"
        );


        clearPreziCache();

    }
);


window.addEventListener(
    "offline",
    () => {

        console.warn(
            "📴 Internet déconnecté"
        );

    }
);


/* =========================================================
   GLOBAL HELPERS
========================================================= */

window.PreziAPI =
    PreziAPI;


window.PreziLive =
    PreziLive;


window.refreshPrezi =
    refreshMatches;


window.refreshPreziLive =
    refreshLiveMatches;


window.testPreziAPI =
    testAPI;


/* =========================================================
   STARTUP CHECK
========================================================= */

console.log(
    "🚀 PREZISCORE API ENGINE READY"
);


console.log(
    "📡 Sport:",
    "football"
);


console.log(
    "🔴 Live details:",
    "enabled"
);


console.log(
    "⏱️ Real minute:",
    "enabled"
);


/* =========================================================
   OPTIONAL TEST
========================================================= */

/*
   Si ou vle teste API a nan Console:

   testPreziAPI()

   oswa:

   refreshPreziLive()
*/
);
