"use strict";

/* =====================================================
   PREZISCORE API
   API-FOOTBALL
   MATCHS + DETAILS + STATISTIQUES + EVENEMENTS
===================================================== */

const API_KEY = "47f671279defefb2b169097f1062a2a2";

const API_URL =
    "https://v3.football.api-sports.io";

const CACHE_TIME = 30000;

const cache = new Map();


/* =====================================================
   REQUEST
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


    const old =
        cache.get(cacheKey);


    if (
        old &&
        Date.now() - old.time < CACHE_TIME
    ) {

        return old.data;

    }


    const response =
        await fetch(
            cacheKey,
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
        cacheKey,
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
   MATCH PAR ID
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
   STATISTIQUES
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


    return data?.response || [];

}


/* =====================================================
   EVENEMENTS
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


    return data?.response || [];

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


    return data?.response || [];

}


/* =====================================================
   HEAD TO HEAD
===================================================== */

async function getHeadToHead(homeId, awayId) {

    if (!homeId || !awayId) {

        return [];

    }


    const data =
        await apiRequest(
            "/fixtures/headtohead",
            {
                h2h:
                    homeId +
                    "-" +
                    awayId,

                last: 5
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

    let state =
        "upcoming";


    /* LIVE */

    if (

        status.short === "1H" ||
        status.short === "2H" ||
        status.short === "ET" ||
        status.short === "BT" ||
        status.short === "P"

    ) {

        state =
            "live";

    }


    /* FINISHED */

    if (

        status.short === "FT" ||
        status.short === "AET" ||
        status.short === "PEN"

    ) {

        state =
            "finished";

    }


    return {

        id:
            fixture.id,

        status:
            state,

        minute:
            status.elapsed ??
            null,

        statusShort:
            status.short ||
            "",

        statusLong:
            status.long ||
            "",

        time:
            fixture.date ||
            null,

        competition:
            match?.league?.name ||
            "Football",

        leagueId:
            match?.league?.id ||
            null,

        leagueLogo:
            match?.league?.logo ||
            null,

        season:
            match?.league?.season ||
            null,

        round:
            match?.league?.round ||
            null,

        venue:
            fixture?.venue?.name ||
            "",

        city:
            fixture?.venue?.city ||
            "",

        referee:
            fixture?.referee ||
            "",

        timezone:
            fixture?.timezone ||
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

    getMatchById,

    getMatchStatistics,

    getMatchEvents,

    getMatchLineups,

    getHeadToHead,

    normalizeMatch

};


console.log(
    "✅ PreziScore API complète prête"
);
