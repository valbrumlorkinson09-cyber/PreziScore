"use strict";

/* =====================================================
   PREZISCORE — API ENGINE
   PART 1 / 2
   LIVE + LOGO + SCORE + MINUTE
===================================================== */

const PREZI_API_URL =
    "https://prezi-score.vercel.app/api/matches";

const PREZI_CACHE_TIME = 30000;

let PREZI_CACHE = null;
let PREZI_CACHE_TIME_STAMP = 0;


/* =====================================================
   API REQUEST
===================================================== */

async function preziRequest() {

    const now = Date.now();

    if (
        PREZI_CACHE &&
        now - PREZI_CACHE_TIME_STAMP < PREZI_CACHE_TIME
    ) {
        return PREZI_CACHE;
    }

    const response = await fetch(
        PREZI_API_URL,
        {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            cache: "no-store"
        }
    );

    if (!response.ok) {
        throw new Error(
            "Vercel API HTTP " +
            response.status
        );
    }

    const data =
        await response.json();

    PREZI_CACHE = data;
    PREZI_CACHE_TIME_STAMP = now;

    return data;
}


/* =====================================================
   SAFE VALUE
===================================================== */

function preziValue(...values) {

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
   TEAM NAME
===================================================== */

function getTeamName(
    match,
    side
) {

    const team =
        match?.[side];

    if (
        typeof team === "string"
    ) {
        return team;
    }

    return preziValue(

        team?.name,

        team?.team?.name,

        team?.short_name,

        match?.[
            side + "_name"
        ],

        match?.[
            side + "_team_name"
        ],

        match?.[
            side + "_team"
        ]?.name,

        match?.raw?.[
            side + "_name"
        ],

        match?.raw?.[
            side + "_team_name"
        ]

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

    let team =
        match?.[side];

    if (
        typeof team === "string"
    ) {
        team = null;
    }

    return preziValue(

        team?.logo,

        team?.logo_url,

        team?.image,

        team?.image_url,

        team?.team?.logo,

        team?.team?.logo_url,

        match?.[
            side + "_logo"
        ],

        match?.[
            side + "_logo_url"
        ],

        match?.[
            side + "_image"
        ],

        match?.[
            side + "_image_url"
        ],

        match?.[
            side + "_team"
        ]?.logo,

        match?.[
            side + "_team"
        ]?.logo_url,

        match?.raw?.[
            side + "_logo"
        ],

        match?.raw?.[
            side + "_logo_url"
        ]

    ) || "";
}


/* =====================================================
   SCORE
===================================================== */

function getTeamScore(
    match,
    side
) {

    let team =
        match?.[side];

    if (
        typeof team === "string"
    ) {
        team = null;
    }

    const score =
        preziValue(

            team?.score,

            team?.goals,

            team?.result,

            team?.current_score,

            match?.[
                side + "_score"
            ],

            match?.[
                side + "_goals"
            ],

            match?.[
                side + "_current_score"
            ],

            match?.score?.[
                side
            ],

            match?.scores?.[
                side
            ],

            match?.raw?.[
                side + "_score"
            ]

        );

    if (
        score === null ||
        score === undefined ||
        score === ""
    ) {
        return "-";
    }

    return score;
}


/* =====================================================
   MATCH MINUTE
===================================================== */

function getMatchMinute(
    match
) {

    return preziValue(

        match?.minute,

        match?.minutes,

        match?.elapsed,

        match?.match_minute,

        match?.live_minute,

        match?.current_minute,

        match?.time_elapsed,

        match?.period?.minute,

        match?.clock?.minute,

        match?.raw?.minute,

        match?.raw?.minutes,

        match?.raw?.elapsed,

        match?.raw?.match_minute,

        match?.raw?.live_minute

    );
}


/* =====================================================
   STATUS
===================================================== */

function getMatchStatus(
    match
) {

    const value =
        String(
            preziValue(

                match?.status,

                match?.state,

                match?.match_status,

                match?.raw?.status,

                match?.raw?.state

            ) || ""
        )
        .toLowerCase()
        .trim();


    if (

        value.includes("live") ||

        value.includes("playing") ||

        value.includes("ongoing") ||

        value.includes("in_play") ||

        value.includes("in-play") ||

        value === "started" ||

        value === "1h" ||

        value === "2h" ||

        value === "ht" ||

        value === "et" ||

        value === "bt" ||

        value === "p"

    ) {
        return "live";
    }


    if (

        value.includes("finish") ||

        value.includes("ended") ||

        value.includes("completed") ||

        value === "ft" ||

        value === "aet" ||

        value === "pen"

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

    return preziValue(

        match?.competition,

        match?.league,

        match?.tournament,

        match?.competition_name,

        match?.league_name,

        match?.raw?.competition,

        match?.raw?.league,

        match?.raw?.competition_name

    ) || "Football";
}


/* =====================================================
   COMPETITION LOGO
===================================================== */

function getCompetitionLogo(
    match
) {

    return preziValue(

        match?.competition_logo,

        match?.competitionLogo,

        match?.league_logo,

        match?.league?.logo,

        match?.competition?.logo,

        match?.raw?.competition_logo,

        match?.raw?.league_logo

    ) || "";
}


/* =====================================================
   MATCH TIME
===================================================== */

function getMatchTime(
    match
) {

    return preziValue(

        match?.time,

        match?.datetime,

        match?.date,

        match?.start_time,

        match?.startTime,

        match?.match_time,

        match?.raw?.time,

        match?.raw?.datetime,

        match?.raw?.date,

        match?.raw?.start_time

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


    const status =
        getMatchStatus(
            match
        );


    const minute =
        getMatchMinute(
            match
        );


    const competition =
        getCompetition(
            match
        );


    const competitionLogo =
        getCompetitionLogo(
            match
        );


    const time =
        getMatchTime(
            match
        );


    return {

        id:
            match.id ||
            match.match_id ||
            match.event_id ||
            null,


        slug:
            match.slug ||
            match.match_slug ||
            "",


        url:
            match.url ||
            match.match_url ||
            "",


        status,


        statusRaw:
            match.status ||
            "",


        statusText:
            match.status_text ||
            match.statusText ||
            "",


        minute,


        time,


        date:
            time,


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


        competition,


        competitionLogo,


        raw:
            match

    };
}


/* =====================================================
   GET MATCHES
===================================================== */

async function getMatches() {

    const data =
        await preziRequest();


    let list = [];


    if (
        Array.isArray(
            data
        )
    ) {
        list = data;
    }

    else if (
        Array.isArray(
            data?.matches
        )
    ) {
        list =
            data.matches;
    }

    else if (
        Array.isArray(
            data?.data
        )
    ) {
        list =
            data.data;
    }

    else if (
        Array.isArray(
            data?.results
        )
    ) {
        list =
            data.results;
    }


    return list;
}


/* =====================================================
   NORMALIZED MATCHES
===================================================== */

async function getNormalizedMatches() {

    const list =
        await getMatches();


    return list
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
   CLEAR CACHE
===================================================== */

function clearPreziCache() {

    PREZI_CACHE = null;

    PREZI_CACHE_TIME_STAMP = 0;

    console.log(
        "🧹 PreziScore cache cleared"
    );
       }
