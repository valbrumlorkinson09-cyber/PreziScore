"use strict";

/* =========================================================
   PREZISCORE API — PARTIE 1
   SportScore
   LIVE + SCORE + TEAMS + LOGOS
========================================================= */

const SPORT = "football";

const BASE_URL =
    "https://sportscore.com/api/widget";

const CACHE_TIME = 10000;

const apiCache = new Map();


/* =========================================================
   REQUEST
========================================================= */

async function sportRequest(
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
        .forEach(
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
        apiCache.get(cacheKey);


    if (
        cached &&
        Date.now() - cached.time <
        CACHE_TIME
    ) {

        return cached.data;

    }


    console.log(
        "📡 SportScore:",
        url.toString()
    );


    const response =
        await fetch(
            url.toString(),
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
            "SportScore HTTP " +
            response.status
        );

    }


    const data =
        await response.json();


    apiCache.set(
        cacheKey,
        {
            time:
                Date.now(),

            data:
                data
        }
    );


    return data;

}


/* =========================================================
   GET RAW MATCHES
========================================================= */

async function getMatches(
    limit = 50
) {

    const data =
        await sportRequest(
            "/matches/",
            {
                limit:
                    Math.min(
                        Math.max(
                            Number(limit) || 50,
                            1
                        ),
                        50
                    )
            }
        );


    console.log(
        "📦 RAW SPORTDATA:",
        data
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


/* =========================================================
   FIRST VALUE
========================================================= */

function firstValue(
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


/* =========================================================
   TEAM OBJECT
========================================================= */

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
            match.home_team_data ||
            {}
        );

    }


    return (
        match.away_team ||
        match.awayTeam ||
        match.away ||
        match.away_team_data ||
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
        firstValue(

            team?.name,
            team?.title,
            team?.team_name,
            team?.display_name,
            team?.short_name,

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


/* =========================================================
   TEAM LOGO
========================================================= */

function getTeamLogo(
    match,
    side
) {

    const team =
        getTeam(
            match,
            side
        );


    const logo =
        firstValue(

            team?.logo,
            team?.badge,
            team?.image,
            team?.photo,
            team?.icon,

            team?.logo_url,
            team?.badge_url,
            team?.image_url,

            side === "home"
                ? match.home_logo
                : match.away_logo,

            side === "home"
                ? match.homeLogo
                : match.awayLogo,

            side === "home"
                ? match.home_image
                : match.away_image,

            side === "home"
                ? match.homeImage
                : match.awayImage

        );


    return logo || null;

}


/* =========================================================
   SCORE
========================================================= */

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
        firstValue(

            side === "home"
                ? match.home_score
                : match.away_score,

            side === "home"
                ? match.homeScore
                : match.awayScore,

            side === "home"
                ? match.home_goals
                : match.away_goals,

            side === "home"
                ? match.homeGoals
                : match.awayGoals,

            team?.score,
            team?.goals,
            team?.current_score,
            team?.currentScore

        );


    if (
        score === null
    ) {

        return null;

    }


    const number =
        Number(score);


    return Number.isNaN(number)
        ? score
        : number;

}


/* =========================================================
   STATUS
========================================================= */

function getStatus(
    match
) {

    const status =
        String(
            firstValue(

                match.status,
                match.state,
                match.match_status,
                match.matchState,
                match.status_code

            ) || ""
        )
        .toLowerCase()
        .trim();


    const text =
        String(
            firstValue(

                match.status_text,
                match.statusText,
                match.status_name,
                match.statusName

            ) || ""
        )
        .toLowerCase()
        .trim();


    const combined =
        status + " " + text;


    /* LIVE */

    if (

        combined.includes("live") ||

        combined.includes("progress") ||

        combined.includes("playing") ||

        combined.includes("ongoing") ||

        combined.includes("started") ||

        combined.includes("1st half") ||

        combined.includes("2nd half") ||

        combined.includes("first half") ||

        combined.includes("second half")

    ) {

        return "live";

    }


    /* FINISHED */

    if (

        combined.includes("finished") ||

        combined.includes("ended") ||

        combined.includes("completed") ||

        combined.includes("full time") ||

        combined === "ft"

    ) {

        return "finished";

    }


    return "upcoming";

}


/* =========================================================
   GET MINUTE
========================================================= */

function getMinute(
    match
) {

    const value =
        firstValue(

            match.minute,
            match.elapsed,
            match.elapsed_time,
            match.elapsedTime,

            match.live_minute,
            match.liveMinute,

            match.current_minute,
            match.currentMinute,

            match.match_time,
            match.matchTime,

            match.timer,
            match.clock,

            match.status_time,
            match.statusTime

        );


    if (
        value === null
    ) {

        return null;

    }


    if (
        typeof value === "object"
    ) {

        return cleanMinute(
            firstValue(

                value.minute,
                value.elapsed,
                value.current,
                value.value,
                value.time

            )
        );

    }


    return cleanMinute(
        value
    );

}


/* =========================================================
   CLEAN MINUTE
========================================================= */

function cleanMinute(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const text =
        String(value)
        .trim();


    const found =
        text.match(
            /^(\d+)/
        );


    if (
        found
    ) {

        return Number(
            found[1]
        );

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
            match.league_name,
            match.tournament_name

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

        return (
            firstValue(

                competition.name,
                competition.title

            ) || "Football"
        );

    }


    return "Football";

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

        match.date,
        match.datetime,

        match.time

    );

       }
/* =========================================================
   PREZISCORE API — PART 2
   STATUS + MINUTE + TEAM DATA
========================================================= */


/* =========================================================
   FIRST VALUE
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
   TEAM NAME
========================================================= */

function getTeamName(team, fallback) {

    if (typeof team === "string") {
        return team;
    }

    if (team && typeof team === "object") {

        return firstValue(
            team.name,
            team.title,
            team.team_name,
            team.teamName,
            team.display_name,
            team.displayName,
            team.short_name,
            team.shortName
        ) || fallback;

    }

    return fallback;
}


/* =========================================================
   TEAM LOGO
========================================================= */

function getTeamLogo(team, directLogo) {

    const logo = firstValue(
        directLogo
    );

    if (logo) {
        return logo;
    }

    if (team && typeof team === "object") {

        return firstValue(
            team.logo,
            team.logo_url,
            team.logoUrl,
            team.image,
            team.image_url,
            team.imageUrl,
            team.photo,
            team.photo_url,
            team.badge,
            team.badge_url,
            team.icon
        );

    }

    return null;
}


/* =========================================================
   SCORE
========================================================= */

function getScore(match, side) {

    const team =
        side === "home"
            ? (
                match.home_team ||
                match.homeTeam ||
                match.home
            )
            : (
                match.away_team ||
                match.awayTeam ||
                match.away
            );


    const directScore =
        side === "home"
            ? firstValue(
                match.home_score,
                match.homeScore,
                match.home_goals,
                match.homeGoals,
                match.score_home,
                match.scoreHome
            )
            : firstValue(
                match.away_score,
                match.awayScore,
                match.away_goals,
                match.awayGoals,
                match.score_away,
                match.scoreAway
            );


    if (directScore !== null) {

        const number =
            Number(directScore);

        return Number.isNaN(number)
            ? directScore
            : number;

    }


    if (
        team &&
        typeof team === "object"
    ) {

        const teamScore =
            firstValue(
                team.score,
                team.goals,
                team.current_score,
                team.currentScore,
                team.result
            );


        if (teamScore !== null) {

            const number =
                Number(teamScore);

            return Number.isNaN(number)
                ? teamScore
                : number;

        }

    }


    return null;
}


/* =========================================================
   STATUS
========================================================= */

function normalizeStatus(match) {

    const status = String(
        firstValue(
            match.status,
            match.state,
            match.match_status,
            match.matchStatus,
            match.match_state,
            match.matchState,
            match.status_code,
            match.statusCode
        ) || ""
    )
    .toLowerCase()
    .trim();


    const text = String(
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


    /* =========================
       LIVE
    ========================= */

    const liveWords = [
        "live",
        "playing",
        "in_progress",
        "in progress",
        "progress",
        "ongoing",
        "started",
        "1st_half",
        "2nd_half",
        "first_half",
        "second_half",
        "1st half",
        "2nd half",
        "half time",
        "halftime"
    ];


    if (
        liveWords.some(word =>
            status.includes(word) ||
            text.includes(word)
        )
    ) {
        return "live";
    }


    /* =========================
       FINISHED
    ========================= */

    const finishedWords = [
        "finished",
        "finish",
        "ended",
        "completed",
        "full_time",
        "full time",
        "ft"
    ];


    if (
        finishedWords.some(word =>
            status === word ||
            status.includes(word) ||
            text.includes(word)
        )
    ) {
        return "finished";
    }


    /* =========================
       UPCOMING
    ========================= */

    return "upcoming";
}


/* =========================================================
   MINUTE CLEANER
========================================================= */

function cleanMinute(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }


    /* OBJECT */

    if (
        typeof value === "object"
    ) {

        value = firstValue(
            value.minute,
            value.elapsed,
            value.elapsed_time,
            value.elapsedTime,
            value.current,
            value.value,
            value.time
        );

    }


    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }


    let text =
        String(value)
            .trim();


    /*
       Examples:
       45
       67'
       67 min
       67:30
       45+2
    */

    text = text
        .replace(/minutes?/gi, "")
        .replace(/mins?/gi, "")
        .trim();


    const numberMatch =
        text.match(/^(\d+)/);


    if (numberMatch) {

        return Number(
            numberMatch[1]
        );

    }


    return text;
}


/* =========================================================
   MINUTE FROM MATCH
========================================================= */

function getMinute(match) {

    /*
       Nou chèche MINIT la nan anpil
       non field diferan.
    */

    const direct = firstValue(

        match.minute,

        match.minutes,

        match.elapsed,

        match.elapsed_time,

        match.elapsedTime,

        match.match_time,

        match.matchTime,

        match.timer,

        match.live_minute,

        match.liveMinute,

        match.current_minute,

        match.currentMinute,

        match.game_minute,

        match.gameMinute,

        match.status_time,

        match.statusTime,

        match.play_time,

        match.playTime

    );


    if (direct !== null) {

        return cleanMinute(
            direct
        );

    }


    /* =========================
       CLOCK OBJECT
    ========================= */

    if (
        match.clock &&
        typeof match.clock === "object"
    ) {

        const clockMinute =
            firstValue(

                match.clock.minute,

                match.clock.minutes,

                match.clock.elapsed,

                match.clock.current,

                match.clock.value

            );


        if (
            clockMinute !== null
        ) {

            return cleanMinute(
                clockMinute
            );

        }

    }


    /* =========================
       TIMER OBJECT
    ========================= */

    if (
        match.timer &&
        typeof match.timer === "object"
    ) {

        const timerMinute =
            firstValue(

                match.timer.minute,

                match.timer.minutes,

                match.timer.elapsed,

                match.timer.current,

                match.timer.value

            );


        if (
            timerMinute !== null
        ) {

            return cleanMinute(
                timerMinute
            );

        }

    }


    return null;
}


/* =========================================================
   START TIME
========================================================= */

function getStartTime(match) {

    return firstValue(

        match.start_time,

        match.startTime,

        match.start_at,

        match.startAt,

        match.kickoff,

        match.kick_off,

        match.kickoff_time,

        match.kickoffTime,

        match.date,

        match.datetime,

        match.time

    );
}


/* =========================================================
   COMPETITION
========================================================= */

function getCompetition(match) {

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

function getMatchId(match) {

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

function getMatchSlug(match) {

    return firstValue(

        match.slug,

        match.match_slug,

        match.matchSlug,

        match.url,

        match.link

    );
}


/* =========================================================
   NORMALIZE MATCH
========================================================= */

function normalizeMatch(match) {

    if (!match) {
        return null;
    }


    const homeTeam =
        match.home_team ||
        match.homeTeam ||
        match.home ||
        {};


    const awayTeam =
        match.away_team ||
        match.awayTeam ||
        match.away ||
        {};


    const status =
        normalizeStatus(
            match
        );


    const homeName =
        getTeamName(
            homeTeam,
            firstValue(
                match.home_name,
                match.homeName
            ) || "Équipe domicile"
        );


    const awayName =
        getTeamName(
            awayTeam,
            firstValue(
                match.away_name,
                match.awayName
            ) || "Équipe visiteuse"
        );


    const homeLogo =
        getTeamLogo(
            homeTeam,
            firstValue(
                match.home_logo,
                match.homeLogo,
                match.home_image,
                match.homeImage,
                match.home_badge,
                match.homeBadge
            )
        );


    const awayLogo =
        getTeamLogo(
            awayTeam,
            firstValue(
                match.away_logo,
                match.awayLogo,
                match.away_image,
                match.awayImage,
                match.away_badge,
                match.awayBadge
            )
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
                getScore(
                    match,
                    "home"
                )

        },


        away: {

            name:
                awayName,

            logo:
                awayLogo,

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
                ? getMinute(match)
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
   PREZISCORE API — PART 3
   GET + FILTER + AUTO REFRESH
========================================================= */


/* =========================================================
   NORMALIZED MATCHES
========================================================= */

async function getNormalizedMatches() {

    const matches =
        await getMatches(100);


    console.log(
        "⚽ PreziScore:",
        matches.length,
        "matchs reçus"
    );


    const normalized =
        matches
            .map(match =>
                normalizeMatch(match)
            )
            .filter(Boolean);


    console.log(
        "📊 Matchs normalisés:",
        normalized
    );


    return normalized;
}


/* =========================================================
   LIVE MATCHES
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
   UPCOMING MATCHES
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
   FINISHED MATCHES
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
   MATCH DETAILS
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
            "League slug manke"
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
            "League slug manke"
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
            "League slug manke"
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
   CLEAR CACHE
========================================================= */

function clearCache() {

    cache.clear();

    console.log(
        "🧹 PreziScore cache netwaye"
    );
}


/* =========================================================
   API OBJECT
========================================================= */

const PreziAPI = {

    request,

    getMatches,

    getNormalizedMatches,

    getLiveMatches,

    getUpcomingMatches,

    getFinishedMatches,

    getMatch,

    getTeam,

    getStandings,

    getTopScorers,

    getPlayer,

    getBracket,

    getTracker,

    normalizeMatch,

    normalizeStatus,

    clearCache

};


/* =========================================================
   AUTO REFRESH
========================================================= */

const PreziLive = {

    timer: null,


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
                "❌ PreziLive callback pa valid."
            );

            return;

        }


        /*
         * Premye chaj la fèt touswit.
         */

        callback();


        /*
         * Apre sa nou rafrechi
         * otomatikman.
         */

        this.timer =
            setInterval(
                callback,
                seconds * 1000
            );


        console.log(
            "🔴 PreziLive aktif — chak",
            seconds,
            "segonn"
        );

    },


    stop() {

        if (this.timer) {

            clearInterval(
                this.timer
            );


            this.timer = null;


            console.log(
                "⏹️ PreziLive kanpe"
            );

        }

    }

};


/* =========================================================
   GLOBAL
========================================================= */

window.PreziAPI =
    PreziAPI;


window.PreziLive =
    PreziLive;


/* =========================================================
   READY
========================================================= */

console.log(
    "✅ PREZISCORE API READY"
);

console.log(
    "⚽ getMatches() OK"
);

console.log(
    "🔴 getLiveMatches() OK"
);

console.log(
    "📅 getUpcomingMatches() OK"
);

console.log(
    "✅ getFinishedMatches() OK"
);
