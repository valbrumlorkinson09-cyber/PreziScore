"use strict";

/* =====================================================
   PREZISCORE — VERCEL API
   API CLIENT
===================================================== */

const PREZI_API_URL =
    "https://prezi-score.vercel.app/api/matches";

const PREZI_CACHE_TIME = 30000;

let preziCache = null;
let preziCacheTime = 0;


/* =====================================================
   REQUEST
===================================================== */

async function preziRequest() {

    if (
        preziCache &&
        Date.now() - preziCacheTime <
        PREZI_CACHE_TIME
    ) {
        return preziCache;
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

    preziCache = data;
    preziCacheTime = Date.now();

    return data;
}


/* =====================================================
   SCORE
===================================================== */

function normalizeScore(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const n = Number(value);

    return Number.isNaN(n)
        ? null
        : n;
}


/* =====================================================
   NORMALIZE MATCH
===================================================== */

function normalizeMatch(match) {

    if (!match) return null;

    const rawStatus =
        String(
            match.status ||
            ""
        )
        .toLowerCase()
        .trim();

    let state = "upcoming";


    /* LIVE */

    if (
        [
            "live",
            "in_play",
            "in-play",
            "playing",
            "ongoing",
            "started",
            "1h",
            "2h",
            "ht",
            "et",
            "bt",
            "p"
        ].includes(rawStatus)
        ||
        rawStatus.includes("live")
    ) {
        state = "live";
    }


    /* FINISHED */

    else if (
        [
            "finished",
            "finish",
            "ended",
            "completed",
            "ft",
            "aet",
            "pen"
        ].includes(rawStatus)
    ) {
        state = "finished";
    }


    return {

        id:
            match.url || "",

        slug:
            String(match.url || "")
                .replace(
                    /^\/football\/match\//,
                    ""
                )
                .replace(
                    /\/$/,
                    ""
                ),

        url:
            match.url || "",

        status:
            state,

        statusRaw:
            rawStatus,

        statusText:
            match.status_text || "",

        time:
            match.time || null,

        date:
            match.time || null,

        home: {
            name:
                match.home ||
                "Équipe domicile",

            logo:
                match.home_logo || "",

            score:
                normalizeScore(
                    match.home_score
                )
        },

        away: {
            name:
                match.away ||
                "Équipe visiteuse",

            logo:
                match.away_logo || "",

            score:
                normalizeScore(
                    match.away_score
                )
        },

        competition:
            match.competition ||
            "Football",

        competitionLogo:
            match.competition_logo ||
            "",

        raw:
            match
    };
}


/* =====================================================
   GET ALL MATCHES
===================================================== */

async function getMatches() {

    const data =
        await preziRequest();

    const list =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.matches)
            ? data.matches
            : [];

    return list;
}


/* =====================================================
   NORMALIZED MATCHES
===================================================== */

async function getNormalizedMatches() {

    const list =
        await getMatches();

    return list
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
   CACHE
===================================================== */

function clearPreziCache() {

    preziCache = null;
    preziCacheTime = 0;

}


/* =====================================================
   API STATUS
===================================================== */

function getAPIStatus() {

    return {

        provider:
            "PreziScore Vercel API",

        apiKeyRequired:
            false,

        endpoint:
            PREZI_API_URL,

        cache:
            true

    };
}


/* =====================================================
   GLOBAL
===================================================== */

window.PreziAPI = {

    getMatches,

    getNormalizedMatches,

    getLiveMatches,

    getFinishedMatches,

    getUpcomingMatches,

    clearCache:
        clearPreziCache,

    getAPIStatus,

    normalizeMatch

};


/* =====================================================
   READY
===================================================== */

console.log(
    "⚽ PreziScore Vercel API connecté"
);

console.log(
    "🌐 " + PREZI_API_URL
);
