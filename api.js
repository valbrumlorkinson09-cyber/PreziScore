/* =========================================================
   PREZISCORE — GLOBAL API ENGINE
   Version 1.0
========================================================= */

const PreziAPI = {

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    config: {
        /*
         * Lè nou chwazi API final la,
         * se sèlman URL sa a n ap chanje.
         */
        baseURL: "https://www.sportscore.com/api",

        timeout: 10000,

        cacheTime: 30000
    },


    /* =====================================================
       INTERNAL REQUEST
    ===================================================== */

    async request(endpoint, options = {}) {

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, this.config.timeout);


        try {

            const response = await fetch(
                this.config.baseURL + endpoint,
                {
                    ...options,
                    signal: controller.signal,

                    headers: {
                        "Accept": "application/json",

                        ...(options.headers || {})
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    `API Error ${response.status}`
                );

            }


            return await response.json();

        }

        catch (error) {

            console.error(
                "PreziScore API:",
                error
            );

            throw error;

        }

        finally {

            clearTimeout(timeout);

        }

    },


    /* =====================================================
       TODAY MATCHES
    ===================================================== */

    async getTodayMatches() {

        return await this.request(
            "/matches/today"
        );

    },


    /* =====================================================
       LIVE MATCHES
    ===================================================== */

    async getLiveMatches() {

        return await this.request(
            "/matches/live"
        );

    },


    /* =====================================================
       UPCOMING MATCHES
    ===================================================== */

    async getUpcomingMatches() {

        return await this.request(
            "/matches/upcoming"
        );

    },


    /* =====================================================
       FINISHED MATCHES
    ===================================================== */

    async getFinishedMatches() {

        return await this.request(
            "/matches/finished"
        );

    },


    /* =====================================================
       COMPETITIONS
    ===================================================== */

    async getCompetitions() {

        return await this.request(
            "/competitions"
        );

    },


    /* =====================================================
       STANDINGS
    ===================================================== */

    async getStandings(competitionId) {

        return await this.request(
            `/competitions/${competitionId}/standings`
        );

    },


    /* =====================================================
       TEAM
    ===================================================== */

    async getTeam(teamId) {

        return await this.request(
            `/teams/${teamId}`
        );

    },


    /* =====================================================
       TEAM MATCHES
    ===================================================== */

    async getTeamMatches(teamId) {

        return await this.request(
            `/teams/${teamId}/matches`
        );

    },


    /* =====================================================
       PLAYERS
    ===================================================== */

    async getPlayers(teamId) {

        return await this.request(
            `/teams/${teamId}/players`
        );

    },


    /* =====================================================
       MATCH DETAILS
    ===================================================== */

    async getMatch(matchId) {

        return await this.request(
            `/matches/${matchId}`
        );

    },


    /* =====================================================
       MATCH EVENTS
    ===================================================== */

    async getMatchEvents(matchId) {

        return await this.request(
            `/matches/${matchId}/events`
        );

    },


    /* =====================================================
       MATCH STATISTICS
    ===================================================== */

    async getMatchStats(matchId) {

        return await this.request(
            `/matches/${matchId}/statistics`
        );

    },


    /* =====================================================
       SEARCH
    ===================================================== */

    async search(query) {

        if (!query || query.trim().length < 2) {

            return [];

        }

        return await this.request(
            `/search?q=${encodeURIComponent(query)}`
        );

    },


    /* =====================================================
       SAFE REQUEST
       Evite sit la kraze si API a pa disponib.
    ===================================================== */

    async safeRequest(method, ...args) {

        try {

            return await this[method](...args);

        }

        catch (error) {

            return {
                success: false,
                data: [],
                error: error.message
            };

        }

    }

};


/* =========================================================
   AUTO REFRESH
========================================================= */

const PreziLive = {

    interval: null,

    start(callback, seconds = 30) {

        this.stop();

        callback();

        this.interval = setInterval(
            callback,
            seconds * 1000
        );

    },

    stop() {

        if (this.interval) {

            clearInterval(this.interval);

            this.interval = null;

        }

    }

};


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.PreziAPI = PreziAPI;
window.PreziLive = PreziLive;
