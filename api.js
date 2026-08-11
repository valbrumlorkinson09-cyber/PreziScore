"use strict";

/* =====================================================
   PREZISCORE — API.JS SIMPLE
===================================================== */

const API_URL =
    "https://sportscore.com/api/widget/matches/?sport=football&limit=100";


async function loadSportScore() {

    const response =
        await fetch(API_URL, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

    if (!response.ok) {
        throw new Error(
            "API HTTP " + response.status
        );
    }

    const data =
        await response.json();

    return (
        data.matches ||
        data.data ||
        data ||
        []
    );
}


/* =====================================================
   TEAM NAME
===================================================== */

function teamName(team, fallback) {

    if (!team) return fallback;

    if (typeof team === "string") {
        return team;
    }

    return (
        team.name ||
        team.title ||
        team.team_name ||
        team.display_name ||
        fallback
    );
}


/* =====================================================
   TEAM LOGO
===================================================== */

function teamLogo(team) {

    if (!team || typeof team !== "object") {
        return null;
    }

    return (
        team.logo ||
        team.logo_url ||
        team.image ||
        team.image_url ||
        team.photo ||
        team.badge ||
        team.badge_url ||
        null
    );
}


/* =====================================================
   SCORE
===================================================== */

function teamScore(match, side) {

    const team =
        side === "home"
            ? (match.home_team || match.home || {})
            : (match.away_team || match.away || {});

    const score =
        side === "home"
            ? (
                match.home_score ??
                match.homeScore ??
                match.home_goals
            )
            : (
                match.away_score ??
                match.awayScore ??
                match.away_goals
            );

    return score ??
        team.score ??
        team.goals ??
        null;
}


/* =====================================================
   MINUTE
===================================================== */

function matchMinute(match) {

    const value =
        match.minute ??
        match.minutes ??
        match.elapsed ??
        match.elapsed_time ??
        match.elapsedTime ??
        match.live_minute ??
        match.liveMinute ??
        match.current_minute ??
        match.currentMinute ??
        null;

    if (value === null) {
        return null;
    }

    if (typeof value === "object") {

        return (
            value.minute ??
            value.elapsed ??
            value.current ??
            value.value ??
            null
        );

    }

    const found =
        String(value).match(/\d+/);

    return found
        ? Number(found[0])
        : null;
}


/* =====================================================
   STATUS
===================================================== */

function matchStatus(match) {

    const status =
        String(
            match.status ??
            match.state ??
            match.match_status ??
            match.status_text ??
            ""
        ).toLowerCase();


    if (
        status.includes("live") ||
        status.includes("progress") ||
        status.includes("playing") ||
        status.includes("ongoing") ||
        status.includes("started") ||
        status.includes("half")
    ) {
        return "live";
    }


    if (
        status.includes("finished") ||
        status.includes("ended") ||
        status.includes("completed") ||
        status.includes("full time")
    ) {
        return "finished";
    }


    return "upcoming";
}


/* =====================================================
   NORMALIZE
===================================================== */

function normalizeMatch(match) {

    const home =
        match.home_team ||
        match.home ||
        match.homeTeam ||
        {};

    const away =
        match.away_team ||
        match.away ||
        match.awayTeam ||
        {};


    return {

        id:
            match.id ||
            match.match_id ||
            match.event_id ||
            null,

        home: {
            name:
                teamName(
                    home,
                    match.home_name ||
                    "Home"
                ),

            logo:
                teamLogo(home),

            score:
                teamScore(
                    match,
                    "home"
                )
        },


        away: {
            name:
                teamName(
                    away,
                    match.away_name ||
                    "Away"
                ),

            logo:
                teamLogo(away),

            score:
                teamScore(
                    match,
                    "away"
                )
        },


        competition:
            match.competition?.name ||
            match.competition ||
            match.league?.name ||
            match.league ||
            "Football",


        status:
            matchStatus(match),


        minute:
            matchStatus(match) === "live"
                ? matchMinute(match)
                : null,


        startTime:
            match.start_time ||
            match.startTime ||
            match.date ||
            match.datetime ||
            null,


        raw:
            match
    };
}


/* =====================================================
   PREZISCORE GLOBAL API
===================================================== */

window.PreziAPI = {

    async getNormalizedMatches() {

        const raw =
            await loadSportScore();

        if (!Array.isArray(raw)) {
            return [];
        }

        return raw
            .map(normalizeMatch)
            .filter(Boolean);
    },


    async getLiveMatches() {

        const matches =
            await this.getNormalizedMatches();

        return matches.filter(
            m => m.status === "live"
        );
    },


    async getUpcomingMatches() {

        const matches =
            await this.getNormalizedMatches();

        return matches.filter(
            m => m.status === "upcoming"
        );
    },


    async getFinishedMatches() {

        const matches =
            await this.getNormalizedMatches();

        return matches.filter(
            m => m.status === "finished"
        );
    }

};


console.log(
    "✅ PreziScore api.js chargé"
);
