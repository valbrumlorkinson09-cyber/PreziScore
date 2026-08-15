"use strict";

/* =====================================================
   PREZISCORE — FOOTBALL LIVE API
   NO API KEY
===================================================== */

/*
   ⚠️ RANPLASE URL SA A AK URL VERCEL OU A

   Egzanp:
   https://football-live-api-xxxx.vercel.app
*/

const PREZI_API_BASE =
    "https://football-live-api.vercel.app";


const PREZI_CACHE_TIME = 30000;

const PREZI_CACHE = new Map();


/* =====================================================
   REQUEST
===================================================== */

async function preziRequest(path) {

    const url =
        PREZI_API_BASE.replace(/\/$/, "") +
        path;


    const cached =
        PREZI_CACHE.get(url);


    if (
        cached &&
        Date.now() - cached.time <
        PREZI_CACHE_TIME
    ) {

        return cached.data;

    }


    const response =
        await fetch(url, {
            method: "GET",
            headers: {
                "Accept":
                    "application/json"
            }
        });


    if (!response.ok) {

        throw new Error(
            "Football API HTTP " +
            response.status
        );

    }


    const data =
        await response.json();


    PREZI_CACHE.set(
        url,
        {
            time: Date.now(),
            data: data
        }
    );


    return data;

}


/* =====================================================
   DATE
===================================================== */

function todayDate() {

    const d = new Date();

    const year =
        d.getFullYear();

    const month =
        String(
            d.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            d.getDate()
        ).padStart(2, "0");


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


/* =====================================================
   NORMALIZE MATCH
===================================================== */

function normalizeMatch(m) {

    if (!m) return null;


    const home =
        m.home || {};

    const away =
        m.away || {};

    const status =
        m.status || {};


    let state =
        "upcoming";


    if (
        status.started === true &&
        status.finished !== true
    ) {

        state =
            "live";

    }


    else if (
        status.finished === true
    ) {

        state =
            "finished";

    }


    return {

        id:
            m.id || null,


        slug:
            String(
                m.id || ""
            ),


        status:
            state,


        statusText:
            state === "live"
                ? "LIVE"
                : state === "finished"
                ? "Finished"
                : "À venir",


        time:
            status.utcTime ||
            m.utcTime ||
            null,


        home: {

            name:
                home.name ||
                "Équipe domicile",


            logo:
                home.logo ||
                home.crest ||
                "",


            score:
                home.score ??
                null

        },


        away: {

            name:
                away.name ||
                "Équipe visiteuse",


            logo:
                away.logo ||
                away.crest ||
                "",


            score:
                away.score ??
                null

        },


        competition:
            m.league?.name ||
            m.competition?.name ||
            "Football",


        competitionLogo:
            m.league?.logo ||
            "",


        raw:
            m

    };

}


/* =====================================================
   GET TODAY MATCHES
===================================================== */

async function getNormalizedMatches() {

    const date =
        todayDate();


    const data =
        await preziRequest(
            "/api/fotmob/matches/date/" +
            date
        );


    const leagues =
        data?.data?.leagues ||
        data?.leagues ||
        [];


    const result = [];


    leagues.forEach(
        league => {

            const games =
                league.matches ||
                [];


            games.forEach(
                match => {

                    const normalized =
                        normalizeMatch({
                            ...match,

                            league: {
                                name:
                                    league.name,

                                logo:
                                    league.logo
                            }
                        });


                    if (normalized) {

                        result.push(
                            normalized
                        );

                    }

                }
            );

        }
    );


    return result;

}


/* =====================================================
   LIVE
===================================================== */

async function getLiveMatches() {

    const matches =
        await getNormalizedMatches();


    return matches.filter(
        m =>
            m.status ===
            "live"
    );

}


/* =====================================================
   FINISHED
===================================================== */

async function getFinishedMatches() {

    const matches =
        await getNormalizedMatches();


    return matches.filter(
        m =>
            m.status ===
            "finished"
    );

}


/* =====================================================
   UPCOMING
===================================================== */

async function getUpcomingMatches() {

    const matches =
        await getNormalizedMatches();


    return matches.filter(
        m =>
            m.status ===
            "upcoming"
    );

}


/* =====================================================
   CACHE
===================================================== */

function clearPreziCache() {

    PREZI_CACHE.clear();

    console.log(
        "🧹 PreziScore cache cleared"
    );

}
/* =====================================================
   PREZISCORE — FOOTBALL LIVE API
   PART 2 / 2
===================================================== */


/* =====================================================
   MATCH DETAILS
===================================================== */

async function getMatchDetails(id) {

    if (!id) {
        return null;
    }

    const cleanId =
        String(id)
            .replace(
                /^\/api\/fotmob\/match\//,
                ""
            )
            .replace(
                /\/$/,
                ""
            );


    const data =
        await preziRequest(
            "/api/fotmob/match/" +
            encodeURIComponent(
                cleanId
            )
        );


    return (
        data?.data ||
        data?.match ||
        data ||
        null
    );
}


/* =====================================================
   STATISTICS
===================================================== */

async function getMatchStatistics(id) {

    const data =
        await getMatchDetails(id);


    if (!data) {
        return [];
    }


    return (
        data?.content?.stats ||
        data?.stats ||
        []
    );
}


/* =====================================================
   EVENTS
===================================================== */

async function getMatchEvents(id) {

    const data =
        await getMatchDetails(id);


    if (!data) {
        return [];
    }


    return (
        data?.content?.matchFacts?.events ||
        data?.content?.events ||
        data?.events ||
        data?.incidents ||
        []
    );
}


/* =====================================================
   LINEUPS
===================================================== */

async function getMatchLineups(id) {

    const data =
        await getMatchDetails(id);


    if (!data) {
        return null;
    }


    return (
        data?.content?.lineup ||
        data?.lineup ||
        data?.lineups ||
        null
    );
}


/* =====================================================
   H2H
===================================================== */

async function getHeadToHead(id) {

    const data =
        await getMatchDetails(id);


    if (!data) {
        return null;
    }


    return (
        data?.content?.h2h ||
        data?.h2h ||
        null
    );
}


/* =====================================================
   SHOTMAP
===================================================== */

async function getShotmap(id) {

    const data =
        await getMatchDetails(id);


    if (!data) {
        return [];
    }


    return (
        data?.content?.shotmap ||
        data?.shotmap ||
        []
    );
}


/* =====================================================
   PLAYER STATS
===================================================== */

async function getPlayerStats(id) {

    const data =
        await getMatchDetails(id);


    if (!data) {
        return {};
    }


    return (
        data?.content?.playerStats ||
        data?.playerStats ||
        {}
    );
}


/* =====================================================
   MOMENTUM
===================================================== */

async function getMomentum(id) {

    const data =
        await getMatchDetails(id);


    if (!data) {
        return null;
    }


    return (
        data?.content?.momentum ||
        data?.momentum ||
        null
    );
}


/* =====================================================
   CLUB
===================================================== */

async function getTeam(id) {

    if (!id) {
        return null;
    }


    const data =
        await preziRequest(
            "/api/fotmob/club/" +
            encodeURIComponent(
                id
            )
        );


    return (
        data?.data ||
        data?.club ||
        data ||
        null
    );
}


/* =====================================================
   PLAYER
===================================================== */

async function getPlayer(id) {

    if (!id) {
        return null;
    }


    const data =
        await preziRequest(
            "/api/fotmob/player/" +
            encodeURIComponent(
                id
            )
        );


    return (
        data?.data ||
        data?.player ||
        data ||
        null
    );
}


/* =====================================================
   LEAGUE
===================================================== */

async function getCompetition(id) {

    if (!id) {
        return null;
    }


    const data =
        await preziRequest(
            "/api/fotmob/league/" +
            encodeURIComponent(
                id
            )
        );


    return (
        data?.data ||
        data?.league ||
        data ||
        null
    );
}


/* =====================================================
   STANDINGS
===================================================== */

async function getStandings(id) {

    const league =
        await getCompetition(id);


    if (!league) {
        return [];
    }


    return (
        league?.table?.content?.[0]?.rows ||
        league?.table?.rows ||
        league?.standings ||
        []
    );
}


/* =====================================================
   TOP SCORERS
===================================================== */

async function getTopScorers(id) {

    const league =
        await getCompetition(id);


    if (!league) {
        return [];
    }


    return (
        league?.stats?.topScorers ||
        league?.topScorers ||
        league?.stats?.players ||
        []
    );
}


/* =====================================================
   SEARCH
===================================================== */

async function searchTeam(query) {

    if (!query) {
        return [];
    }


    const text =
        String(query)
            .trim();


    const data =
        await preziRequest(
            "/api/fotmob/search/all?q=" +
            encodeURIComponent(
                text
            )
        );


    return (
        data?.data ||
        data?.results ||
        data?.searchResults ||
        []
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
            "Football Live API",

        source:
            "FotMob",

        apiKeyRequired:
            false,

        baseURL:
            PREZI_API_BASE,

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


    /* MATCH DATA */

    getMatchStatistics,

    getMatchEvents,

    getMatchLineups,

    getHeadToHead,

    getShotmap,

    getPlayerStats,

    getMomentum,


    /* CLUB / PLAYER */

    getTeam,

    getPlayer,


    /* COMPETITION */

    getCompetition,

    getStandings,

    getTopScorers,


    /* SEARCH */

    searchTeam,


    /* SYSTEM */

    clearCache:
        clearPreziCache,

    getAPIStatus,

    normalizeMatch

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
    "🌐 Provider: Football Live API"
);

console.log(
    "📡 Source: FotMob"
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
    "📊 DETAILS: READY"
);

console.log(
    "===================================="
);
