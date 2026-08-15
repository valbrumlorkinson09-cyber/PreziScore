"use strict";

/* =====================================================
   PREZISCORE — API CENTRAL
   VERCEL BACKEND
   VERSION SOLID
   NO API KEY
===================================================== */

const PREZI_API_BASE =
    "https://prezi-score.vercel.app";

const PREZI_CACHE_TIME = 15000;

const PREZI_CACHE =
    new Map();


/* =====================================================
   REQUEST CENTRAL
===================================================== */

async function preziRequest(path) {

    const cleanBase =
        PREZI_API_BASE.replace(/\/+$/, "");

    const cleanPath =
        String(path || "").startsWith("/")
            ? path
            : "/" + path;

    const url =
        cleanBase + cleanPath;


    /* ================= CACHE ================= */

    const cached =
        PREZI_CACHE.get(url);


    if (
        cached &&
        Date.now() - cached.time <
        PREZI_CACHE_TIME
    ) {

        return cached.data;

    }


    console.log(
        "🌐 PreziScore API:",
        url
    );


    /* ================= REQUEST ================= */

    const response =
        await fetch(
            url,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                },

                cache:
                    "no-store"
            }
        );


    /* ================= HTTP ERROR ================= */

    if (!response.ok) {

        let errorText = "";

        try {

            errorText =
                await response.text();

        } catch (_) {

            errorText = "";

        }


        throw new Error(
            "PreziScore API HTTP " +
            response.status +
            (
                errorText
                    ? " — " + errorText
                    : ""
            )
        );

    }


    /* ================= JSON ================= */

    let data;

    try {

        data =
            await response.json();

    } catch (error) {

        throw new Error(
            "API a pa retounen JSON valid."
        );

    }


    /* ================= CACHE ================= */

    PREZI_CACHE.set(
        url,
        {
            time:
                Date.now(),

            data:
                data
        }
    );


    console.log(
        "✅ API RESPONSE:",
        data
    );


    return data;
}


/* =====================================================
   DATE HELPERS
===================================================== */

function getTodayDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );
}


/* =====================================================
   SAFE STRING
===================================================== */

function safeString(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    if (
        typeof value === "object"
    ) {

        return (
            value.name ||
            value.title ||
            value.short_name ||
            value.shortName ||
            value.displayName ||
            ""
        );

    }


    return String(value).trim();
}


/* =====================================================
   FIND VALUE
===================================================== */

function firstValue(
    object,
    keys
) {

    if (!object) {

        return null;

    }


    for (
        const key of keys
    ) {

        const value =
            object?.[key];


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
   STATUS NORMALIZER
===================================================== */

function normalizeStatus(match) {

    if (!match) {

        return "upcoming";

    }


    const raw =
        match.raw || {};


    const values = [

        match.status,

        match.status_text,

        match.statusText,

        match.state,

        match.match_status,

        match.matchStatus,

        match.phase,

        raw.status,

        raw.status_text,

        raw.statusText,

        raw.state,

        raw.match_status,

        raw.matchStatus,

        raw.phase

    ];


    const text =
        values
            .filter(
                value =>
                    value !==
                    undefined &&
                    value !== null
            )
            .map(
                value =>
                    safeString(
                        value
                    ).toLowerCase()
            )
            .join(" ");


    /* =================================================
       LIVE
    ================================================= */

    const liveWords = [

        "live",

        "inplay",

        "in_play",

        "in play",

        "playing",

        "ongoing",

        "started",

        "in_progress",

        "in progress",

        "progress",

        "1h",

        "2h",

        "ht",

        "half",

        "half time",

        "halftime",

        "first half",

        "second half",

        "first_half",

        "second_half",

        "et",

        "extra time",

        "penalty",

        "penalties"

    ];


    if (
        liveWords.some(
            word =>
                text.includes(word)
        )
    ) {

        return "live";

    }


    /* =================================================
       FINISHED
    ================================================= */

    const finishedWords = [

        "finished",

        "finish",

        "ended",

        "end",

        "completed",

        "full time",

        "full_time",

        "full-time",

        "ft",

        "aet",

        "after extra time"

    ];


    if (
        finishedWords.some(
            word =>
                text.includes(word)
        )
    ) {

        return "finished";

    }


    /* =================================================
       UPCOMING
    ================================================= */

    return "upcoming";
}


/* =====================================================
   LIVE MINUTE
===================================================== */

function getLiveMinute(match) {

    if (
        normalizeStatus(match) !==
        "live"
    ) {

        return null;

    }


    const directMinute =
        firstValue(
            match,
            [
                "minute",
                "minutes",
                "elapsed",
                "match_minute",
                "matchMinute",
                "current_minute",
                "currentMinute"
            ]
        );


    if (
        directMinute !==
        null
    ) {

        const value =
            safeString(
                directMinute
            );


        if (value) {

            return value
                .includes("'")
                ? value
                : value + "'";

        }

    }


    /* RAW MINUTE */

    const raw =
        match.raw || {};


    const rawMinute =
        firstValue(
            raw,
            [
                "minute",
                "minutes",
                "elapsed",
                "match_minute",
                "matchMinute",
                "current_minute",
                "currentMinute"
            ]
        );


    if (
        rawMinute !==
        null
    ) {

        const value =
            safeString(
                rawMinute
            );


        if (value) {

            return value
                .includes("'")
                ? value
                : value + "'";

        }

    }


    /* CALCULATE FROM START TIME */

    const startTime =
        firstValue(
            match,
            [
                "time",
                "utcTime",
                "start_time",
                "startTime",
                "kickoff",
                "kickoff_time",
                "kickoffTime",
                "date"
            ]
        );


    if (startTime) {

        const start =
            new Date(
                startTime
            ).getTime();


        if (
            !Number.isNaN(
                start
            )
        ) {

            const minutes =
                Math.floor(
                    (
                        Date.now() -
                        start
                    ) / 60000
                );


            if (
                minutes >= 0 &&
                minutes <= 130
            ) {

                return (
                    minutes +
                    "'"
                );

            }

        }

    }


    return "LIVE";
}


/* =====================================================
   TEAM OBJECT
===================================================== */

function getTeamObject(
    match,
    side
) {

    if (!match) {

        return {};

    }


    const raw =
        match.raw || {};


    const direct =
        match?.[side];


    if (
        direct &&
        typeof direct ===
        "object"
    ) {

        return direct;

    }


    if (
        typeof direct ===
        "string"
    ) {

        return {
            name:
                direct
        };

    }


    if (
        side === "home"
    ) {

        return (
            raw.home_team ||
            raw.homeTeam ||
            raw.home ||
            {}
        );

    }


    return (
        raw.away_team ||
        raw.awayTeam ||
        raw.away ||
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
        getTeamObject(
            match,
            side
        );


    const raw =
        match?.raw || {};


    let name =
        firstValue(
            team,
            [
                "name",
                "title",
                "short_name",
                "shortName",
                "displayName",
                "team_name",
                "teamName"
            ]
        );


    if (!name) {

        if (
            side === "home"
        ) {

            name =
                firstValue(
                    match,
                    [
                        "home_name",
                        "homeName",
                        "home_team_name",
                        "homeTeamName"
                    ]
                );

        } else {

            name =
                firstValue(
                    match,
                    [
                        "away_name",
                        "awayName",
                        "away_team_name",
                        "awayTeamName"
                    ]
                );

        }

    }


    if (!name) {

        if (
            side === "home"
        ) {

            name =
                firstValue(
                    raw,
                    [
                        "home_name",
                        "homeName",
                        "home_team_name",
                        "homeTeamName"
                    ]
                );

        } else {

            name =
                firstValue(
                    raw,
                    [
                        "away_name",
                        "awayName",
                        "away_team_name",
                        "awayTeamName"
                    ]
                );

        }

    }


    return (
        safeString(
            name
        ) ||
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
        getTeamObject(
            match,
            side
        );


    const raw =
        match?.raw || {};


    let logo =
        firstValue(
            team,
            [
                "logo",
                "crest",
                "image",
                "image_url",
                "imageUrl",
                "team_logo",
                "teamLogo"
            ]
        );


    if (!logo) {

        if (
            side === "home"
        ) {

            logo =
                firstValue(
                    match,
                    [
                        "home_logo",
                        "homeLogo",
                        "home_crest",
                        "homeCrest",
                        "home_image"
                    ]
                );

        } else {

            logo =
                firstValue(
                    match,
                    [
                        "away_logo",
                        "awayLogo",
                        "away_crest",
                        "awayCrest",
                        "away_image"
                    ]
                );

        }

    }


    if (!logo) {

        if (
            side === "home"
        ) {

            logo =
                firstValue(
                    raw,
                    [
                        "home_logo",
                        "homeLogo",
                        "home_crest",
                        "homeCrest",
                        "home_image"
                    ]
                );

        } else {

            logo =
                firstValue(
                    raw,
                    [
                        "away_logo",
                        "awayLogo",
                        "away_crest",
                        "awayCrest",
                        "away_image"
                    ]
                );

        }

    }


    return safeString(
        logo
    );
}


/* =====================================================
   SCORE
===================================================== */

function getTeamScore(
    match,
    side
) {

    const team =
        getTeamObject(
            match,
            side
        );


    const raw =
        match?.raw || {};


    let score =
        firstValue(
            team,
            [
                "score",
                "goals",
                "goal",
                "points"
            ]
        );


    if (
        score === null
    ) {

        if (
            side === "home"
        ) {

            score =
                firstValue(
                    match,
                    [
                        "home_score",
                        "homeScore",
                        "home_goals",
                        "homeGoals",
                        "home_points"
                    ]
                );

        } else {

            score =
                firstValue(
                    match,
                    [
                        "away_score",
                        "awayScore",
                        "away_goals",
                        "awayGoals",
                        "away_points"
                    ]
                );

        }

    }


    if (
        score === null
    ) {

        if (
            side === "home"
        ) {

            score =
                firstValue(
                    raw,
                    [
                        "home_score",
                        "homeScore",
                        "home_goals",
                        "homeGoals"
                    ]
                );

        } else {

            score =
                firstValue(
                    raw,
                    [
                        "away_score",
                        "awayScore",
                        "away_goals",
                        "awayGoals"
                    ]
                );

        }

    }


    if (
        score === null ||
        score === undefined ||
        score === ""
    ) {

        return null;

    }


    return score;
       }
/* =====================================================
   PREZISCORE — API CENTRAL
   PARTIE 2 / 2
===================================================== */


/* =====================================================
   COMPETITION
===================================================== */

function getCompetitionName(match) {

    const raw =
        match?.raw || {};


    let competition =
        match?.competition;


    if (
        competition &&
        typeof competition ===
        "object"
    ) {

        competition =
            firstValue(
                competition,
                [
                    "name",
                    "title",
                    "short_name",
                    "shortName"
                ]
            );

    }


    if (!competition) {

        competition =
            firstValue(
                match,
                [
                    "competition_name",
                    "competitionName",
                    "league_name",
                    "leagueName",
                    "tournament_name",
                    "tournamentName"
                ]
            );

    }


    if (!competition) {

        const league =
            match?.league;


        if (
            league &&
            typeof league ===
            "object"
        ) {

            competition =
                firstValue(
                    league,
                    [
                        "name",
                        "title",
                        "short_name",
                        "shortName"
                    ]
                );

        }

    }


    if (!competition) {

        competition =
            firstValue(
                raw,
                [
                    "competition_name",
                    "competitionName",
                    "league_name",
                    "leagueName",
                    "tournament_name",
                    "tournamentName"
                ]
            );

    }


    if (!competition) {

        const league =
            raw?.league;


        if (
            league &&
            typeof league ===
            "object"
        ) {

            competition =
                firstValue(
                    league,
                    [
                        "name",
                        "title",
                        "short_name",
                        "shortName"
                    ]
                );

        }

    }


    return (
        safeString(
            competition
        ) ||
        "Football"
    );
}


/* =====================================================
   COMPETITION LOGO
===================================================== */

function getCompetitionLogo(
    match
) {

    const raw =
        match?.raw || {};


    let logo =
        firstValue(
            match,
            [
                "competition_logo",
                "competitionLogo",
                "league_logo",
                "leagueLogo",
                "tournament_logo"
            ]
        );


    if (!logo) {

        const competition =
            match?.competition;


        if (
            competition &&
            typeof competition ===
            "object"
        ) {

            logo =
                firstValue(
                    competition,
                    [
                        "logo",
                        "crest",
                        "image",
                        "image_url",
                        "imageUrl"
                    ]
                );

        }

    }


    if (!logo) {

        const league =
            match?.league;


        if (
            league &&
            typeof league ===
            "object"
        ) {

            logo =
                firstValue(
                    league,
                    [
                        "logo",
                        "crest",
                        "image",
                        "image_url",
                        "imageUrl"
                    ]
                );

        }

    }


    if (!logo) {

        logo =
            firstValue(
                raw,
                [
                    "competition_logo",
                    "competitionLogo",
                    "league_logo",
                    "leagueLogo",
                    "tournament_logo"
                ]
            );

    }


    return safeString(
        logo
    );
}


/* =====================================================
   MATCH TIME
===================================================== */

function getMatchTime(
    match
) {

    const raw =
        match?.raw || {};


    const value =
        firstValue(
            match,
            [
                "time",
                "utcTime",
                "utc_time",
                "start_time",
                "startTime",
                "kickoff",
                "kickoff_time",
                "kickoffTime",
                "date",
                "datetime"
            ]
        );


    if (value) {

        return value;

    }


    return firstValue(
        raw,
        [
            "time",
            "utcTime",
            "utc_time",
            "start_time",
            "startTime",
            "kickoff",
            "kickoff_time",
            "kickoffTime",
            "date",
            "datetime"
        ]
    ) || null;
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


    const homeName =
        getTeamName(
            match,
            "home"
        );


    const awayName =
        getTeamName(
            match,
            "away"
        );


    const homeLogo =
        getTeamLogo(
            match,
            "home"
        );


    const awayLogo =
        getTeamLogo(
            match,
            "away"
        );


    const homeScore =
        getTeamScore(
            match,
            "home"
        );


    const awayScore =
        getTeamScore(
            match,
            "away"
        );


    const competition =
        getCompetitionName(
            match
        );


    const competitionLogo =
        getCompetitionLogo(
            match
        );


    const matchTime =
        getMatchTime(
            match
        );


    const id =
        firstValue(
            match,
            [
                "id",
                "match_id",
                "matchId",
                "fixture_id",
                "fixtureId"
            ]
        ) ||
        match.url ||
        `${homeName}-${awayName}`;


    return {

        id:
            String(id),

        slug:
            String(
                match.slug ||
                match.url ||
                id
            ),


        status:
            status,


        statusText:

            status === "live"
                ? "LIVE"

                : status === "finished"
                ? "Finished"

                : "À venir",


        minute:
            getLiveMinute(
                match
            ),


        time:
            matchTime,


        home: {

            name:
                homeName,

            logo:
                homeLogo,

            score:
                homeScore

        },


        away: {

            name:
                awayName,

            logo:
                awayLogo,

            score:
                awayScore

        },


        competition:
            competition,


        competitionLogo:
            competitionLogo,


        url:
            match.url ||
            null,


        raw:
            match

    };
}


/* =====================================================
   EXTRACT MATCHES
===================================================== */

function extractMatches(
    data
) {

    /* ===============================
       FORMAT:
       { matches: [] }
    =============================== */

    if (
        Array.isArray(
            data?.matches
        )
    ) {

        return data.matches;

    }


    /* ===============================
       FORMAT:
       { data: { matches: [] } }
    =============================== */

    if (
        Array.isArray(
            data?.data?.matches
        )
    ) {

        return data.data.matches;

    }


    /* ===============================
       FORMAT:
       { data: [] }
    =============================== */

    if (
        Array.isArray(
            data?.data
        )
    ) {

        return data.data;

    }


    /* ===============================
       FORMAT:
       { results: [] }
    =============================== */

    if (
        Array.isArray(
            data?.results
        )
    ) {

        return data.results;

    }


    /* ===============================
       FORMAT:
       { data: { results: [] } }
    =============================== */

    if (
        Array.isArray(
            data?.data?.results
        )
    ) {

        return data.data.results;

    }


    /* ===============================
       FOTMOB STYLE
    =============================== */

    if (
        Array.isArray(
            data?.leagues
        )
    ) {

        const result =
            [];


        data.leagues.forEach(
            league => {

                const games =
                    Array.isArray(
                        league?.matches
                    )
                        ? league.matches
                        : [];


                games.forEach(
                    match => {

                        result.push({

                            ...match,

                            competition:
                                league?.name ||
                                "Football",

                            competition_logo:
                                league?.logo ||
                                ""

                        });

                    }
                );

            }
        );


        return result;
    }


    /* ===============================
       DATA LEAGUES
    =============================== */

    if (
        Array.isArray(
            data?.data?.leagues
        )
    ) {

        const result =
            [];


        data.data.leagues.forEach(
            league => {

                const games =
                    Array.isArray(
                        league?.matches
                    )
                        ? league.matches
                        : [];


                games.forEach(
                    match => {

                        result.push({

                            ...match,

                            competition:
                                league?.name ||
                                "Football",

                            competition_logo:
                                league?.logo ||
                                ""

                        });

                    }
                );

            }
        );


        return result;
    }


    return [];
}


/* =====================================================
   GET ALL MATCHES
===================================================== */

async function getNormalizedMatches() {

    const data =
        await preziRequest(
            "/api/matches"
        );


    const rawMatches =
        extractMatches(
            data
        );


    console.log(
        "📊 Matchs bruts:",
        rawMatches.length
    );


    const normalized =
        rawMatches
            .map(
                normalizeMatch
            )
            .filter(
                Boolean
            );


    console.log(
        "⚽ Matchs normalisés:",
        normalized.length
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
            match.status ===
            "live"
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
            match.status ===
            "finished"
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
            match.status ===
            "upcoming"
    );
}


/* =====================================================
   MATCH DETAILS
===================================================== */

async function getMatchDetails(
    id
) {

    if (!id) {

        return null;

    }


    const cleanId =
        String(id)
            .replace(
                /^\/api\/matches\//,
                ""
            )
            .replace(
                /^\/api\/fotmob\/match\//,
                ""
            )
            .replace(
                /\/$/,
                ""
            );


    try {

        const data =
            await preziRequest(
                "/api/matches/" +
                encodeURIComponent(
                    cleanId
                )
            );


        return (
            data?.match ||
            data?.data ||
            data ||
            null
        );

    }

    catch (error) {

        console.warn(
            "⚠️ Match details unavailable:",
            error
        );


        return null;

    }
}


/* =====================================================
   SEARCH TEAM
===================================================== */

async function searchTeam(
    query
) {

    if (!query) {

        return [];

    }


    const text =
        String(query)
            .trim()
            .toLowerCase();


    const matches =
        await getNormalizedMatches();


    return matches.filter(
        match => {

            const home =
                match.home.name
                    .toLowerCase();


            const away =
                match.away.name
                    .toLowerCase();


            const league =
                match.competition
                    .toLowerCase();


            return (

                home.includes(text) ||

                away.includes(text) ||

                league.includes(text)

            );

        }
    );
}


/* =====================================================
   CLEAR CACHE
===================================================== */

function clearPreziCache() {

    PREZI_CACHE.clear();


    console.log(
        "🧹 PreziScore cache cleared"
    );
}


/* =====================================================
   API STATUS
===================================================== */

function getAPIStatus() {

    return {

        provider:
            "PreziScore Vercel API",

        source:
            "Vercel Backend",

        apiKeyRequired:
            false,

        baseURL:
            PREZI_API_BASE,

        endpoint:
            "/api/matches",

        cache:
            true,

        cacheTime:
            PREZI_CACHE_TIME

    };
}


/* =====================================================
   GLOBAL PREZI API
===================================================== */

window.PreziAPI = {

    /* MATCHES */

    getNormalizedMatches,

    getLiveMatches,

    getFinishedMatches,

    getUpcomingMatches,


    /* DETAILS */

    getMatchDetails,

    getMatchById:
        getMatchDetails,


    /* SEARCH */

    searchTeam,


    /* HELPERS */

    normalizeMatch,

    getLiveMinute,

    getTeamName,

    getTeamLogo,

    getTeamScore,

    getCompetitionName,


    /* SYSTEM */

    clearCache:
        clearPreziCache,

    getAPIStatus

};


/* =====================================================
   READY
===================================================== */

console.log(
    "===================================="
);

console.log(
    "⚽ PREZISCORE API READY"
);

console.log(
    "🌐 VERCEL:",
    PREZI_API_BASE
);

console.log(
    "📡 ENDPOINT: /api/matches"
);

console.log(
    "🔑 API KEY: NONE"
);

console.log(
    "🔴 LIVE: READY"
);

console.log(
    "📅 MATCHES: READY"
);

console.log(
    "⚽ LOGOS: READY"
);

console.log(
    "🔢 SCORES: READY"
);

console.log(
    "⏱️ MINUTES: READY"
);

console.log(
    "===================================="
);
