"use strict";

/* =====================================================
   PREZISCORE API
   API-FOOTBALL
===================================================== */

const API_KEY = "47f671279defefb2b169097f1062a2a6";

const API_URL =
    "https://v3.football.api-sports.io";

const CACHE_TIME = 30000;

const cache = new Map();


/* =====================================================
   REQUEST
===================================================== */

async function apiRequest(endpoint, params = {}) {

    const url = new URL(
        API_URL + endpoint
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


    const key = url.toString();

    const old = cache.get(key);


    if (
        old &&
        Date.now() - old.time < CACHE_TIME
    ) {

        return old.data;

    }


    const response = await fetch(
        key,
        {
            method: "GET",

            headers: {
                "x-apisports-key": API_KEY,
                "Accept": "application/json"
            }
        }
    );


    if (!response.ok) {

        throw new Error(
            "API Football HTTP " +
            response.status
        );

    }


    const data =
        await response.json();


    cache.set(
        key,
        {
            time: Date.now(),
            data: data
        }
    );


    return data;

}


/* =====================================================
   LIVE MATCHS
===================================================== */

async function getLiveMatches() {

    const data =
        await apiRequest(
            "/fixtures",
            {
                live: "all"
            }
        );


    return data?.response || [];

}


/* =====================================================
   MATCHS DU JOUR
===================================================== */

async function getTodayMatches() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const data =
        await apiRequest(
            "/fixtures",
            {
                date: today
            }
        );


    return data?.response || [];

}


/* =====================================================
   NORMALIZE MATCH
===================================================== */

function normalizeMatch(match) {

    const fixture =
        match?.fixture || {};

    const teams =
        match?.teams || {};

    const goals =
        match?.goals || {};

    const status =
        fixture?.status || {};


    let state = "upcoming";


    if (
        status.short === "1H" ||
        status.short === "2H" ||
        status.short === "ET" ||
        status.short === "BT" ||
        status.short === "P"
    ) {

        state = "live";

    }


    if (
        status.short === "FT" ||
        status.short === "AET" ||
        status.short === "PEN"
    ) {

        state = "finished";

    }


    return {

        id: fixture.id,

        status: state,

        minute:
            status.elapsed ?? null,

        statusShort:
            status.short || "",

        statusLong:
            status.long || "",

        time:
            fixture.date || null,

        competition:
            match?.league?.name ||
            "Football",

        leagueLogo:
            match?.league?.logo ||
            null,

        home: {

            id:
                teams.home?.id || null,

            name:
                teams.home?.name ||
                "Équipe domicile",

            logo:
                teams.home?.logo ||
                null,

            score:
                goals.home ?? null

        },

        away: {

            id:
                teams.away?.id || null,

            name:
                teams.away?.name ||
                "Équipe visiteuse",

            logo:
                teams.away?.logo ||
                null,

            score:
                goals.away ?? null

        }

    };

}


/* =====================================================
   NORMALIZED MATCHS
===================================================== */

async function getNormalizedMatches() {

    const matches =
        await getTodayMatches();


    return matches.map(
        normalizeMatch
    );

}


/* =====================================================
   GLOBAL API
===================================================== */

window.PreziAPI = {

    getLiveMatches,

    getTodayMatches,

    getNormalizedMatches,

    normalizeMatch

};


console.log(
    "✅ PreziScore API Football prête"
);
