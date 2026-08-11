"use strict";

/* =====================================================
   PREZISCORE — API FOOTBALL
===================================================== */

const API_KEY = "47f671279defefb2b169097f1062a2a6";

const API_URL =
    "https://v3.football.api-sports.io";

const CACHE_TIME = 30000;

const cache = new Map();


/* =====================================================
   REQUEST
===================================================== */

async function apiRequest(
    endpoint,
    params = {}
) {

    const url =
        new URL(
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
        Object.keys(
            data.errors
        ).length
    ) {

        console.error(
            "API Football errors:",
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


    return Array.isArray(
        data?.response
    )
        ? data.response
        : [];

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


    return Array.isArray(
        data?.response
    )
        ? data.response
        : [];

}


/* =====================================================
   STATUS
===================================================== */

function getStatus(
    fixture
) {

    const short =
        String(
            fixture?.fixture?.status?.short ||
            ""
        )
        .toUpperCase()
        .trim();


    /* LIVE */

    const liveStatuses = [
        "1H",
        "2H",
        "HT",
        "ET",
        "BT",
        "P"
    ];


    if (
        liveStatuses.includes(
            short
        )
    ) {

        return "live";

    }


    /* FINISHED */

    const finishedStatuses = [
        "FT",
        "AET",
        "PEN"
    ];


    if (
        finishedStatuses.includes(
            short
        )
    ) {

        return "finished";

    }


    return "upcoming";

}


/* =====================================================
   NORMALIZE MATCH
===================================================== */

function normalizeMatch(
    match
) {

    const fixture =
        match?.fixture || {};

    const teams =
        match?.teams || {};

    const goals =
        match?.goals || {};

    const status =
        fixture?.status || {};


    return {

        id:
            fixture.id || null,


        slug:
            fixture.id
                ? String(
                    fixture.id
                )
                : "",


        status:
            getStatus(match),


        statusShort:
            status.short || "",


        statusLong:
            status.long || "",


        minute:
            status.elapsed ??
            null,


        time:
            fixture.date ||
            null,


        timestamp:
            fixture.timestamp ||
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

    const results =
        await Promise.allSettled([

            getTodayMatches(),

            getLiveMatches()

        ]);


    const today =
        results[0].status ===
        "fulfilled"

            ? results[0].value

            : [];


    const live =
        results[1].status ===
        "fulfilled"

            ? results[1].value

            : [];


    /* COMBINE */

    const all = [
        ...today,
        ...live
    ];


    /* REMOVE DUPLICATES */

    const unique =
        new Map();


    all.forEach(
        match => {

            const id =
                match?.fixture?.id;


            if (id) {

                unique.set(
                    id,
                    match
                );

            }

        }
    );


    /* NORMALIZE */

    return Array
        .from(
            unique.values()
        )
        .map(
            normalizeMatch
        );

}


/* =====================================================
   FIND ONE MATCH
===================================================== */

async function getMatchById(
    id
) {

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
   GLOBAL API
===================================================== */

window.PreziAPI = {

    getLiveMatches,

    getTodayMatches,

    getNormalizedMatches,

    getMatchById,

    normalizeMatch

};


console.log(
    "✅ PreziScore API Football prête"
);
