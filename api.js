"use strict";

/* =========================================================
   PREZISCORE — API ENGINE V2
   SPORT: FOOTBALL
   LIVE + UPCOMING + FINISHED
   TEAM NAME + LOGO + SCORE + MINUTE
========================================================= */

console.log("⚽ PREZISCORE API V2 — loading...");


/* =========================================================
   CONFIG
========================================================= */

const PREZI_CONFIG = {

    BASE_URL:
        "https://sportscore.com/api/widget",

    SPORT:
        "football",

    MATCH_LIMIT:
        100,

    CACHE_TIME:
        10000,

    LIVE_REFRESH:
        15000

};


/* =========================================================
   CACHE
========================================================= */

const PreziCache = new Map();


/* =========================================================
   HELPER — FIRST VALUE
========================================================= */

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


/* =========================================================
   HELPER — SAFE NUMBER
========================================================= */

function toNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : null;

}


/* =========================================================
   REQUEST
========================================================= */

async function preziRequest(
    endpoint,
    params = {}
) {

    const url =
        new URL(
            PREZI_CONFIG.BASE_URL +
            endpoint
        );


    url.searchParams.set(
        "sport",
        PREZI_CONFIG.SPORT
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


    const cacheKey =
        url.toString();


    const cached =
        PreziCache.get(
            cacheKey
        );


    if (
        cached &&
        Date.now() - cached.time <
        PREZI_CONFIG.CACHE_TIME
    ) {

        return cached.data;

    }


    console.log(
        "🌐 API:",
        endpoint,
        params
    );


    const response =
        await fetch(
            cacheKey,
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


    if (!response.ok) {

        throw new Error(
            "SportScore HTTP " +
            response.status
        );

    }


    const data =
        await response.json();


    PreziCache.set(
        cacheKey,
        {
            time: Date.now(),
            data: data
        }
    );


    return data;

}


/* =========================================================
   GET RAW MATCHES
========================================================= */

async function getRawMatches() {

    const data =
        await preziRequest(
            "/matches/",
            {
                limit:
                    PREZI_CONFIG.MATCH_LIMIT
            }
        );


    /*
       SportScore ka ka retounen:

       {
          matches: [...]
       }

       oswa dirèkteman:

       [...]
    */


    if (
        Array.isArray(
            data
        )
    ) {

        return data;

    }


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
        Array.isArray(
            data?.events
        )
    ) {

        return data.events;

    }


    console.warn(
        "⚠️ API pa retounen matches[]",
        data
    );


    return [];

}


/* =========================================================
   TEAM OBJECT
========================================================= */

function getTeamObject(
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
            match.team_home ||
            match.teamHome ||
            match.teams?.home ||
            {}
        );

    }


    return (
        match.away_team ||
        match.awayTeam ||
        match.away ||
        match.team_away ||
        match.teamAway ||
        match.teams?.away ||
        {}
    );

}


/* =========================================================
   TEAM NAME
========================================================= */

function getTeamName(
    match,
    side
) {

    const team =
        getTeamObject(
            match,
            side
        );


    if (
        typeof team === "string"
    ) {

        return team;

    }


    const name =
        firstValue(

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


    return name ||
        (
            side === "home"
                ? "Équipe domicile"
                : "Équipe visiteuse"
        );

}


/* =========================================================
   TEAM LOGO
========================================================= */

function getTeamLogo(
    match,
    side
) {

    const team =
        getTeamObject(
            match,
            side
        );


    const direct =
        side === "home"

            ? firstValue(
                match.home_logo,
                match.homeLogo,
                match.home_image,
                match.homeImage,
                match.home_badge,
                match.homeBadge
            )

            : firstValue(
                match.away_logo,
                match.awayLogo,
                match.away_image,
                match.awayImage,
                match.away_badge,
                match.awayBadge
            );


    if (direct) {

        return direct;

    }


    if (
        typeof team === "string"
    ) {

        return null;

    }


    return firstValue(

        team?.logo,

        team?.logo_url,

        team?.logoUrl,

        team?.image,

        team?.image_url,

        team?.imageUrl,

        team?.photo,

        team?.photo_url,

        team?.badge,

        team?.badge_url,

        team?.icon,

        team?.crest

    );

}


/* =========================================================
   SCORE
========================================================= */

function getTeamScore(
    match,
    side
) {

    const team =
        getTeamObject(
            match,
            side
        );


    const direct =
        side === "home"

            ? firstValue(
                match.home_score,
                match.homeScore,
                match.home_goals,
                match.homeGoals,
                match.home_result
            )

            : firstValue(
                match.away_score,
                match.awayScore,
                match.away_goals,
                match.awayGoals,
                match.away_result
            );


    if (
        direct !== null
    ) {

        return toNumber(
            direct
        );

    }


    if (
        typeof team === "object"
    ) {

        const score =
            firstValue(

                team?.score,

                team?.goals,

                team?.current_score,

                team?.currentScore,

                team?.result

            );


        if (
            score !== null
        ) {

            return toNumber(
                score
            );

        }

    }


    /*
       Gen kèk API ki mete score
       andedan scores object.
    */

    const scores =
        match.scores ||
        match.score ||
        {};


    if (
        typeof scores === "object"
    ) {

        const value =
            side === "home"

                ? firstValue(
                    scores.home,
                    scores.home_score,
                    scores.homeScore
                )

                : firstValue(
                    scores.away,
                    scores.away_score,
                    scores.awayScore
                );


        if (
            value !== null
        ) {

            return toNumber(
                value
            );

        }

    }


    return null;

}


/* =========================================================
   COMPETITION
========================================================= */

function getCompetition(
    match
) {

    const competition =
        firstValue(

            match.competition,

            match.league,

            match.tournament,

            match.competition_name,

            match.competitionName,

            match.league_name,

            match.leagueName,

            match.tournament_name,

            match.tournamentName

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

        return firstValue(

            competition.name,

            competition.title,

            competition.league_name,

            competition.leagueName

        ) || "Football";

    }


    return "Football";

}


/* =========================================================
   MATCH ID
========================================================= */

function getMatchId(
    match
) {

    return firstValue(

        match.id,

        match.match_id,

        match.matchId,

        match.event_id,

        match.eventId,

        match.game_id,

        match.gameId

    );

}


/* =========================================================
   MATCH SLUG
========================================================= */

function getMatchSlug(
    match
) {

    return firstValue(

        match.slug,

        match.match_slug,

        match.matchSlug,

        match.url,

        match.link

    );

}


/* =========================================================
   START TIME
========================================================= */

function getStartTime(
    match
) {

    return firstValue(

        match.start_time,

        match.startTime,

        match.start_at,

        match.startAt,

        match.datetime,

        match.date,

        match.timestamp,

        match.time

    );

}


/* =========================================================
   STATUS
========================================================= */

function getRawStatus(
    match
) {

    return String(

        firstValue(

            match.status,

            match.state,

            match.match_status,

            match.matchStatus,

            match.status_code,

            match.statusCode,

            match.game_status,

            match.gameStatus

        ) || ""

    )
    .toLowerCase()
    .trim();

}


/* =========================================================
   STATUS TEXT
========================================================= */

function getStatusText(
    match
) {

    return String(

        firstValue(

            match.status_text,

            match.statusText,

            match.status_name,

            match.statusName,

            match.state_text,

            match.stateText

        ) || ""

    )
    .toLowerCase()
    .trim();

}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(
    match
) {

    const status =
        getRawStatus(match);


    const text =
        getStatusText(match);


    const combined =
        status + " " + text;


    /* LIVE */

    const liveWords = [

        "live",

        "in_progress",

        "in progress",

        "progress",

        "playing",

        "ongoing",

        "started",

        "first_half",

        "second_half",

        "1st_half",

        "2nd_half",

        "1st half",

        "2nd half",

        "half time",

        "halftime"

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


    /* FINISHED */

    const finishedWords = [

        "finished",

        "finish",

        "ended",

        "completed",

        "full_time",

        "full time",

        "ft",

        "after_penalties",

        "after extra time"

    ];


    if (
        finishedWords.some(
            word =>
                status === word ||
                text === word ||
                combined.includes(
                    word
                )
        )
    ) {

        return "finished";

    }


    return "upcoming";

           }

/* =========================================================
   MINUTE / LIVE TIME
========================================================= */

function cleanMinute(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    if (
        typeof value === "object"
    ) {

        value =
            firstValue(
                value.minute,
                value.elapsed,
                value.current,
                value.value,
                value.time,
                value.minutes
            );

        if (
            value === null
        ) {
            return null;
        }
    }

    let text =
        String(value)
        .trim()
        .replace(/minutes?/gi, "")
        .replace(/mins?/gi, "")
        .trim();

    /*
       Egzanp:
       45
       67'
       67 min
       67:30
       90+3
    */

    const plus =
        text.match(
            /^(\d+)\s*\+\s*(\d+)/
        );

    if (plus) {

        return (
            Number(plus[1]) +
            "+" +
            Number(plus[2])
        );
    }

    const number =
        text.match(
            /^\d+/
        );

    if (number) {

        return Number(
            number[0]
        );
    }

    return null;
}


/* =========================================================
   FIND MINUTE DEEPLY
   Chèche minit la menm si li nan object nested.
========================================================= */

function findMinute(
    match
) {

    if (!match) {
        return null;
    }

    /*
       Field ki pi souvan itilize.
    */

    const direct =
        firstValue(

            match.minute,

            match.minutes,

            match.elapsed,

            match.elapsed_time,

            match.elapsedTime,

            match.match_time,

            match.matchTime,

            match.live_minute,

            match.liveMinute,

            match.current_minute,

            match.currentMinute,

            match.game_minute,

            match.gameMinute,

            match.timer,

            match.time_elapsed,

            match.timeElapsed,

            match.status_time,

            match.statusTime

        );

    if (
        direct !== null
    ) {

        const minute =
            cleanMinute(
                direct
            );

        if (
            minute !== null
        ) {
            return minute;
        }
    }


    /*
       Si API mete time object.
    */

    const timeObjects = [

        match.time,

        match.timer,

        match.clock,

        match.live,

        match.live_data,

        match.liveData,

        match.status,

        match.period,

        match.game

    ];


    for (
        const object of timeObjects
    ) {

        if (
            !object ||
            typeof object !== "object"
        ) {
            continue;
        }

        const value =
            firstValue(

                object.minute,

                object.minutes,

                object.elapsed,

                object.elapsed_time,

                object.elapsedTime,

                object.current,

                object.current_minute,

                object.currentMinute,

                object.value,

                object.time

            );

        if (
            value !== null
        ) {

            const minute =
                cleanMinute(
                    value
                );

            if (
                minute !== null
            ) {

                return minute;

            }
        }
    }


    /*
       API a ka mete timeline.
       Nou pran dènye event ki gen minute.
    */

    const timeline =
        firstValue(

            match.timeline,

            match.events,

            match.match_events,

            match.matchEvents

        );


    if (
        Array.isArray(timeline)
    ) {

        for (
            let i =
                timeline.length - 1;
            i >= 0;
            i--
        ) {

            const event =
                timeline[i];

            if (
                !event ||
                typeof event !== "object"
            ) {
                continue;
            }

            const value =
                firstValue(

                    event.minute,

                    event.minutes,

                    event.elapsed,

                    event.elapsed_time,

                    event.elapsedTime,

                    event.time

                );

            if (
                value !== null
            ) {

                const minute =
                    cleanMinute(
                        value
                    );

                if (
                    minute !== null
                ) {

                    return minute;

                }
            }
        }
    }


    return null;
}


/* =========================================================
   LIVE MINUTE FROM TRACKER
========================================================= */

async function getLiveTracker(
    match
) {

    const id =
        getMatchId(
            match
        );

    if (!id) {
        return null;
    }

    try {

        const data =
            await preziRequest(
                "/tracker/",
                {
                    id: id
                }
            );

        return data || null;

    } catch (error) {

        console.warn(
            "⚠️ Tracker unavailable:",
            id
        );

        return null;

    }
}


/* =========================================================
   GET LIVE MINUTE
========================================================= */

async function getLiveMinute(
    match
) {

    /*
       Premye opsyon:
       minit ki deja nan /matches/
    */

    let minute =
        findMinute(
            match
        );

    if (
        minute !== null
    ) {

        return minute;

    }


    /*
       Dezyèm opsyon:
       tracker.
    */

    const tracker =
        await getLiveTracker(
            match
        );


    if (
        tracker
    ) {

        minute =
            findMinute(
                tracker
            );

        if (
            minute !== null
        ) {

            return minute;

        }


        /*
           Tracker ka gen data nested.
        */

        minute =
            findMinute(
                tracker.data
            );

        if (
            minute !== null
        ) {

            return minute;

        }


        minute =
            findMinute(
                tracker.match
            );

        if (
            minute !== null
        ) {

            return minute;

        }
    }


    /*
       Pa bay fo minit.
    */

    return null;
}


/* =========================================================
   NORMALIZE MATCH
========================================================= */

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
            getCompetition(
                match
            ),

        competitionLogo:
            firstValue(

                match.competition_logo,

                match.competitionLogo,

                match.league_logo,

                match.leagueLogo

            ),

        status:
            status,

        statusText:
            firstValue(

                match.status_text,

                match.statusText,

                match.status_name,

                match.statusName

            ) || "",

        minute:
            status === "live"
                ? findMinute(match)
                : null,

        startTime:
            getStartTime(
                match
            ),

        raw:
            match

    };

}


/* =========================================================
   GET NORMALIZED MATCHES
========================================================= */

async function getNormalizedMatches() {

    const rawMatches =
        await getRawMatches();


    console.log(
        "📦 RAW MATCHES:",
        rawMatches.length
    );


    const matches =
        rawMatches
        .map(
            normalizeMatch
        )
        .filter(Boolean);


    console.log(
        "⚽ NORMALIZED MATCHES:",
        matches.length
    );


    return matches;

}


/* =========================================================
   GET LIVE MATCHES
========================================================= */

async function getLiveMatches() {

    const matches =
        await getNormalizedMatches();


    return matches.filter(
        match =>
            match.status === "live"
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
   GET MATCH DETAILS
========================================================= */

async function getMatch(
    slug
) {

    if (!slug) {

        throw new Error(
            "Match slug manke"
        );

    }


    return await preziRequest(
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


    return await preziRequest(
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


    return await preziRequest(
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


    return await preziRequest(
        "/topscorers/",
        {
            slug: slug
        }
    );

           }

/* =========================================================
   PREZISCORE API — PART 3/3
   FILTERS + HELPERS + AUTO REFRESH + EXPORT
========================================================= */


/* =========================================================
   GET LIVE MATCHES
========================================================= */

async function getLiveMatches() {

    const matches = await getNormalizedMatches();

    return matches.filter(match => {

        return match.status === "live";

    });

}


/* =========================================================
   GET UPCOMING MATCHES
========================================================= */

async function getUpcomingMatches() {

    const matches = await getNormalizedMatches();

    return matches.filter(match => {

        return match.status === "upcoming";

    });

}


/* =========================================================
   GET FINISHED MATCHES
========================================================= */

async function getFinishedMatches() {

    const matches = await getNormalizedMatches();

    return matches.filter(match => {

        return match.status === "finished";

    });

}


/* =========================================================
   GET MATCH BY ID
========================================================= */

async function getMatchById(id) {

    if (!id) {
        return null;
    }

    const matches =
        await getNormalizedMatches();

    return matches.find(match => {

        return String(match.id) === String(id);

    }) || null;

}


/* =========================================================
   GET MATCH DETAILS
========================================================= */

async function getMatch(slug) {

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
   TEAM
========================================================= */

async function getTeam(slug) {

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
   STANDINGS
========================================================= */

async function getStandings(slug) {

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
   TOP SCORERS
========================================================= */

async function getTopScorers(slug) {

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
   PLAYER
========================================================= */

async function getPlayer(slug) {

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
   BRACKET
========================================================= */

async function getBracket(slug) {

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
   TRACKER
========================================================= */

async function getTracker(id) {

    if (!id) {

        throw new Error(
            "Tracker ID manke"
        );

    }

    return await request(
        "/tracker/",
        {
            id: id
        }
    );

}


/* =========================================================
   SEARCH TEAM
========================================================= */

async function searchTeams(query) {

    if (!query) {
        return [];
    }

    const text =
        String(query)
            .trim()
            .toLowerCase();

    const matches =
        await getNormalizedMatches();

    const teams = [];

    matches.forEach(match => {

        const home =
            match.home?.name || "";

        const away =
            match.away?.name || "";


        if (
            home.toLowerCase()
                .includes(text)
        ) {

            teams.push({
                name: home,
                logo: match.home?.logo || null
            });

        }


        if (
            away.toLowerCase()
                .includes(text)
        ) {

            teams.push({
                name: away,
                logo: match.away?.logo || null
            });

        }

    });


    /* Retire doublons */

    const unique =
        teams.filter(
            (team, index, array) => {

                return index ===
                    array.findIndex(
                        item =>
                            item.name ===
                            team.name
                    );

            }
        );


    return unique;

}


/* =========================================================
   FORMAT MINUTE
========================================================= */

function formatMinute(minute) {

    if (
        minute === null ||
        minute === undefined ||
        minute === ""
    ) {

        return "";

    }


    const text =
        String(minute).trim();


    if (
        /^\d+$/.test(text)
    ) {

        return text + "'";

    }


    return text;

}


/* =========================================================
   LIVE MINUTE
========================================================= */

function getLiveMinute(match) {

    if (!match) {
        return null;
    }


    if (
        match.minute !== null &&
        match.minute !== undefined
    ) {

        return match.minute;

    }


    const raw =
        match.raw || {};


    const possible = [

        raw.minute,
        raw.elapsed,
        raw.elapsed_time,
        raw.elapsedTime,
        raw.match_time,
        raw.matchTime,
        raw.live_minute,
        raw.liveMinute,
        raw.status_time,
        raw.statusTime,
        raw.timer

    ];


    for (
        const value of possible
    ) {

        if (
            value !== null &&
            value !== undefined &&
            value !== ""
        ) {

            if (
                typeof value === "object"
            ) {

                const nested =
                    value.minute ??
                    value.elapsed ??
                    value.current ??
                    value.value;


                if (
                    nested !== undefined &&
                    nested !== null
                ) {

                    return cleanMinuteValue(
                        nested
                    );

                }

            }


            return cleanMinuteValue(
                value
            );

        }

    }


    return null;

}


/* =========================================================
   CLEAN MINUTE VALUE
========================================================= */

function cleanMinuteValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return null;

    }


    let text =
        String(value)
            .trim()
            .replace(/min/gi, "")
            .trim();


    const found =
        text.match(/(\d+)/);


    if (found) {

        return Number(
            found[1]
        );

    }


    return null;

}


/* =========================================================
   GET LOGO
========================================================= */

function getLogo(team) {

    if (!team) {
        return null;
    }


    if (
        typeof team === "string"
    ) {

        return null;

    }


    return (

        team.logo ||
        team.image ||
        team.photo ||
        team.icon ||
        team.badge ||
        team.logo_url ||
        team.image_url ||
        team.photo_url ||
        team.badge_url ||
        null

    );

}


/* =========================================================
   CACHE CLEAR
========================================================= */

function clearCache() {

    cache.clear();

    console.log(
        "🧹 PreziScore cache cleared"
    );

}


/* =========================================================
   API STATUS
========================================================= */

async function testAPI() {

    try {

        const matches =
            await getMatches(5);


        console.log(
            "✅ API OK"
        );


        console.log(
            "⚽ Matchs reçus:",
            matches.length
        );


        return {

            success: true,

            count:
                matches.length,

            matches:
                matches

        };

    }

    catch (error) {

        console.error(
            "❌ API TEST ERROR:",
            error
        );


        return {

            success: false,

            count: 0,

            error:
                error.message

        };

    }

}


/* =========================================================
   PUBLIC API
========================================================= */

window.PreziAPI = {

    request,

    getMatches,

    getNormalizedMatches,

    getLiveMatches,

    getUpcomingMatches,

    getFinishedMatches,

    getMatchById,

    getMatch,

    getTeam,

    getStandings,

    getTopScorers,

    getPlayer,

    getBracket,

    getTracker,

    searchTeams,

    getLiveMinute,

    formatMinute,

    getLogo,

    normalizeMatch,

    normalizeStatus,

    clearCache,

    testAPI

};


/* =========================================================
   AUTO REFRESH ENGINE
========================================================= */

window.PreziLive = {

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
                "❌ Callback PreziLive pa valid."
            );

            return;

        }


        this.running = true;


        /* Premye chaj */

        callback();


        /* Refresh */

        this.timer =
            setInterval(
                () => {

                    if (
                        typeof callback ===
                        "function"
                    ) {

                        callback();

                    }

                },
                seconds * 1000
            );


        console.log(
            "🔄 PreziLive started:",
            seconds,
            "seconds"
        );

    },


    stop() {

        if (this.timer) {

            clearInterval(
                this.timer
            );

            this.timer = null;

        }


        this.running = false;

        console.log(
            "⏹️ PreziLive stopped"
        );

    }

};


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
    "🔴 LIVE / 📅 UPCOMING / ✅ FINISHED"
);

console.log(
    "⏱️ LIVE MINUTE ENGINE READY"
);

console.log(
    "🛡️ TEAM + LOGO ENGINE READY"
);

console.log(
    "🔄 AUTO REFRESH READY"
);

console.log(
    "===================================="
);


/* =========================================================
   GLOBAL SHORTCUTS
========================================================= */

window.getLiveMatches =
    getLiveMatches;

window.getUpcomingMatches =
    getUpcomingMatches;

window.getFinishedMatches =
    getFinishedMatches;

window.testPreziAPI =
    testAPI;
