"use strict";

/* =====================================================
   PREZISCORE — api.js
   SportScore Football
===================================================== */

const PREZI_URL =
    "https://sportscore.com/api/widget/matches/?sport=football&limit=100";

const PREZI_CACHE = 15000;

let preziCache = null;
let preziCacheTime = 0;


/* =====================================================
   REQUEST
===================================================== */

async function preziRequest() {

    if (
        preziCache &&
        Date.now() - preziCacheTime < PREZI_CACHE
    ) {
        return preziCache;
    }

    const response = await fetch(PREZI_URL, {
        method: "GET",
        headers: {
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(
            "SportScore HTTP " + response.status
        );
    }

    const data = await response.json();

    preziCache = data;
    preziCacheTime = Date.now();

    return data;
}


/* =====================================================
   RAW MATCHES
===================================================== */

async function getRawMatches() {

    const data = await preziRequest();

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.matches)) {
        return data.matches;
    }

    if (Array.isArray(data.data)) {
        return data.data;
    }

    if (
        data.data &&
        Array.isArray(data.data.matches)
    ) {
        return data.data.matches;
    }

    return [];
}


/* =====================================================
   VALUE
===================================================== */

function valueOf(...values) {

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
   TEAM
===================================================== */

function getTeam(match, side) {

    if (side === "home") {

        return (
            match.home_team ||
            match.homeTeam ||
            match.home ||
            match.home ||
            {}
        );
    }

    return (
        match.away_team ||
        match.awayTeam ||
        match.away ||
        {}
    );
}


/* =====================================================
   TEAM NAME
===================================================== */

function getName(match, side) {

    const team = getTeam(match, side);

    if (typeof team === "string") {
        return team;
    }

    return valueOf(
        team.name,
        team.title,
        team.team_name,
        team.teamName,
        team.display_name,
        team.displayName,

        side === "home"
            ? match.home_name
            : match.away_name,

        side === "home"
            ? match.homeName
            : match.awayName
    ) || (
        side === "home"
            ? "Équipe domicile"
            : "Équipe visiteuse"
    );
}


/* =====================================================
   LOGO
===================================================== */

function getLogo(match, side) {

    const team = getTeam(match, side);

    if (typeof team === "string") {
        return null;
    }

    return valueOf(

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

        team.icon,

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
}


/* =====================================================
   SCORE
===================================================== */

function getScore(match, side) {

    const team = getTeam(match, side);

    let score;

    if (side === "home") {

        score = valueOf(
            match.home_score,
            match.homeScore,
            match.home_goals,
            match.homeGoals,
            match.score_home,
            match.scoreHome
        );

    } else {

        score = valueOf(
            match.away_score,
            match.awayScore,
            match.away_goals,
            match.awayGoals,
            match.score_away,
            match.scoreAway
        );
    }

    if (score === null && team) {

        score = valueOf(
            team.score,
            team.goals,
            team.current_score,
            team.currentScore
        );
    }

    if (score === null) {
        return null;
    }

    const number = Number(score);

    return Number.isNaN(number)
        ? score
        : number;
}


/* =====================================================
   STATUS
===================================================== */

function getStatus(match) {

    const status = String(
        valueOf(
            match.status,
            match.state,
            match.match_status,
            match.matchStatus,
            match.status_code,
            match.statusCode,
            match.status_text,
            match.statusText,
            match.status_name,
            match.statusName
        ) || ""
    ).toLowerCase().trim();


    /* LIVE */

    if (
        status.includes("live") ||
        status.includes("progress") ||
        status.includes("playing") ||
        status.includes("ongoing") ||
        status.includes("started") ||
        status.includes("first half") ||
        status.includes("second half") ||
        status.includes("1st half") ||
        status.includes("2nd half") ||
        status.includes("halftime") ||
        status.includes("half time")
    ) {
        return "live";
    }


    /* FINISHED */

    if (
        status.includes("finished") ||
        status.includes("finish") ||
        status.includes("ended") ||
        status.includes("completed") ||
        status.includes("full time") ||
        status.includes("full_time") ||
        status === "ft"
    ) {
        return "finished";
    }


    return "upcoming";
}


/* =====================================================
   MINUTE
===================================================== */

function getMinute(match) {

    let minute = valueOf(

        match.minute,
        match.minutes,

        match.elapsed,
        match.elapsed_time,
        match.elapsedTime,

        match.live_minute,
        match.liveMinute,

        match.current_minute,
        match.currentMinute,

        match.game_minute,
        match.gameMinute,

        match.match_minute,
        match.matchMinute,

        match.play_time,
        match.playTime
    );


    /* CLOCK */

    if (
        minute === null &&
        match.clock &&
        typeof match.clock === "object"
    ) {

        minute = valueOf(
            match.clock.minute,
            match.clock.minutes,
            match.clock.elapsed,
            match.clock.current,
            match.clock.value
        );
    }


    /* TIMER */

    if (
        minute === null &&
        match.timer &&
        typeof match.timer === "object"
    ) {

        minute = valueOf(
            match.timer.minute,
            match.timer.minutes,
            match.timer.elapsed,
            match.timer.current,
            match.timer.value
        );
    }


    if (minute === null) {
        return null;
    }


    if (typeof minute === "object") {

        minute = valueOf(
            minute.minute,
            minute.minutes,
            minute.elapsed,
            minute.current,
            minute.value,
            minute.time
        );
    }


    if (minute === null) {
        return null;
    }


    const text =
        String(minute).trim();


    const found =
        text.match(/(\d+)/);


    if (!found) {
        return null;
    }


    return Number(found[1]);
}


/* =====================================================
   COMPETITION
===================================================== */

function getCompetition(match) {

    const league =
        valueOf(
            match.competition,
            match.league,
            match.tournament
        );


    if (typeof league === "string") {
        return league;
    }


    if (
        league &&
        typeof league === "object"
    ) {

        return valueOf(
            league.name,
            league.title,
            league.league_name
        ) || "Football";
    }


    return valueOf(
        match.competition_name,
        match.league_name,
        match.tournament_name
    ) || "Football";
}


/* =====================================================
   START TIME
===================================================== */

function getStartTime(match) {

    return valueOf(
        match.start_time,
        match.startTime,
        match.start_at,
        match.startAt,
        match.date,
        match.datetime,
        match.time
    );
}


/* =====================================================
   NORMALIZE
===================================================== */

function normalizeMatch(match) {

    if (!match) {
        return null;
    }


    const status =
        getStatus(match);


    return {

        id: valueOf(
            match.id,
            match.match_id,
            match.event_id,
            match.eventId,
            match.game_id,
            match.gameId
        ),


        slug: valueOf(
            match.slug,
            match.match_slug,
            match.matchSlug
        ),


        home: {

            name:
                getName(
                    match,
                    "home"
                ),

            logo:
                getLogo(
                    match,
                    "home"
                ),

            score:
                getScore(
                    match,
                    "home"
                )
        },


        away: {

            name:
                getName(
                    match,
                    "away"
                ),

            logo:
                getLogo(
                    match,
                    "away"
                ),

            score:
                getScore(
                    match,
                    "away"
                )
        },


        competition:
            getCompetition(match),


        status:
            status,


        statusText:
            valueOf(
                match.status_text,
                match.statusText,
                match.status_name
            ) || "",


        minute:
            status === "live"
                ? getMinute(match)
                : null,


        startTime:
            getStartTime(match),


        raw:
            match
    };
}


/* =====================================================
   PUBLIC API
===================================================== */

window.PreziAPI = {

    async getNormalizedMatches() {

        const raw =
            await getRawMatches();


        return raw
            .map(normalizeMatch)
            .filter(Boolean);
    },


    async getLiveMatches() {

        const matches =
            await this.getNormalizedMatches();

        return matches.filter(
            match =>
                match.status === "live"
        );
    },


    async getUpcomingMatches() {

        const matches =
            await this.getNormalizedMatches();

        return matches.filter(
            match =>
                match.status === "upcoming"
        );
    },


    async getFinishedMatches() {

        const matches =
            await this.getNormalizedMatches();

        return matches.filter(
            match =>
                match.status === "finished"
        );
    }

};


/* =====================================================
   TEST
===================================================== */

console.log(
    "✅ PreziScore api.js chargé"
);
