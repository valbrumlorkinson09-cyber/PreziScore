"use strict";

/* =====================================================
   PREZISCORE — API FINAL
   API-FOOTBALL / API-SPORTS
   ===================================================== */

const API_KEY = "47f671279defefb2b169097f1062a2a6";

const API_URL =
    "https://v3.football.api-sports.io";

const CACHE_TIME = 30000;

const cache = new Map();


/* =====================================================
   API REQUEST
===================================================== */

async function apiRequest(endpoint, params = {}) {

    const url =
        new URL(API_URL + endpoint);


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


    const response =
        await fetch(
            cacheKey,
            {
                method: "GET",

                headers: {
                    "x-apisports-key":
                        API_KEY,

                    "Accept":
                        "application/json"
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


    if (
        data?.errors &&
        Object.keys(data.errors).length
    ) {

        console.error(
            "API errors:",
            data.errors
        );

    }


    cache.set(
        cacheKey,
        {
            time: Date.now(),
            data
        }
    );


    return data;

}


/* =====================================================
   LIVE MATCHES
===================================================== */

async function getLiveMatches() {

    const data =
        await apiRequest(
            "/fixtures",
            {
                live: "all"
            }
        );


    return (
        Array.isArray(data?.response)
            ? data.response
            : []
    );

}


/* =====================================================
   TODAY MATCHES
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


    return (
        Array.isArray(data?.response)
            ? data.response
            : []
    );

}


/* =====================================================
   COMBINE LIVE + TODAY
   LIVE yo enkli tou
===================================================== */

async function getAllTodayMatches() {

    const [
        today,
        live
    ] =
        await Promise.all([
            getTodayMatches(),
            getLiveMatches()
        ]);


    const map =
        new Map();


    today.forEach(
        match => {

            if (match?.fixture?.id) {

                map.set(
                    String(
                        match.fixture.id
                    ),
                    match
                );

            }

        }
    );


    live.forEach(
        match => {

            if (match?.fixture?.id) {

                map.set(
                    String(
                        match.fixture.id
                    ),
                    match
                );

            }

        }
    );


    return Array.from(
        map.values()
    );

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


    let state =
        "upcoming";


    const short =
        String(
            status.short || ""
        ).toUpperCase();


    /* LIVE */

    if (
        [
            "1H",
            "2H",
            "HT",
            "ET",
            "BT",
            "P"
        ].includes(short)
    ) {

        state =
            "live";

    }


    /* FINISHED */

    if (
        [
            "FT",
            "AET",
            "PEN"
        ].includes(short)
    ) {

        state =
            "finished";

    }


    return {

        id:
            fixture.id || null,


        slug:
            String(
                fixture.id || ""
            ),


        status:
            state,


        statusShort:
            short,


        statusLong:
            status.long || "",


        minute:
            status.elapsed ??
            null,


        time:
            fixture.date ||
            null,


        venue:
            fixture.venue?.name ||
            "",


        referee:
            fixture.referee ||
            "",


        competition:
            match?.league?.name ||
            "Football",


        leagueId:
            match?.league?.id ||
            null,


        leagueLogo:
            match?.league?.logo ||
            null,


        country:
            match?.league?.country ||
            "",


        home: {

            id:
                teams.home?.id ||
                null,


            name:
                teams.home?.name ||
                "Équipe domicile",


            logo:
                teams.home?.logo ||
                null,


            score:
                goals.home ??
                null

        },


        away: {

            id:
                teams.away?.id ||
                null,


            name:
                teams.away?.name ||
                "Équipe visiteuse",


            logo:
                teams.away?.logo ||
                null,


            score:
                goals.away ??
                null

        },


        raw:
            match

    };

}


/* =====================================================
   NORMALIZED MATCHES
===================================================== */

async function getNormalizedMatches() {

    const matches =
        await getAllTodayMatches();


    return matches.map(
        normalizeMatch
    );

}


/* =====================================================
   GET MATCH BY ID
   IMPORTANT POUR match-details.html
===================================================== */

async function getMatchById(id) {

    if (!id) {

        return null;

    }


    const data =
        await apiRequest(
            "/fixtures",
            {
                id: id
            }
        );


    const match =
        data?.response?.[0];


    if (!match) {

        return null;

    }


    return normalizeMatch(
        match
    );

}


/* =====================================================
   STATISTICS
===================================================== */

async function getMatchStatistics(id) {

    if (!id) {

        return [];

    }


    const data =
        await apiRequest(
            "/fixtures/statistics",
            {
                fixture: id
            }
        );


    return (
        Array.isArray(data?.response)
            ? data.response
            : []
    );

}


/* =====================================================
   EVENTS
===================================================== */

async function getMatchEvents(id) {

    if (!id) {

        return [];

    }


    const data =
        await apiRequest(
            "/fixtures/events",
            {
                fixture: id
            }
        );


    return (
        Array.isArray(data?.response)
            ? data.response
            : []
    );

}


/* =====================================================
   LINEUPS
===================================================== */

async function getMatchLineups(id) {

    if (!id) {

        return [];

    }


    const data =
        await apiRequest(
            "/fixtures/lineups",
            {
                fixture: id
            }
        );


    return (
        Array.isArray(data?.response)
            ? data.response
            : []
    );

}


/* =====================================================
   HEAD TO HEAD
===================================================== */

async function getHeadToHead(
    team1,
    team2
) {

    if (!team1 || !team2) {

        return [];

    }


    const data =
        await apiRequest(
            "/fixtures/headtohead",
            {
                h2h:
                    `${team1}-${team2}`
            }
        );


    return (
        Array.isArray(data?.response)
            ? data.response
            : []
    );

}


/* =====================================================
   GLOBAL API
===================================================== */

window.PreziAPI = {

    getLiveMatches,

    getTodayMatches,

    getAllTodayMatches,

    getNormalizedMatches,

    getMatchById,

    getMatchStatistics,

    getMatchEvents,

    getMatchLineups,

    getHeadToHead,

    normalizeMatch

};


console.log(
    "✅ PreziScore API FINAL READY"
);
