/* =====================================================
   PREZISCORE — GLOBAL FOOTBALL API
===================================================== */

const PreziAPI = {

    BASE_URL: "https://sportscore.com/api/widget",

    async request(endpoint, params = {}) {

        const url = new URL(
            this.BASE_URL + endpoint
        );

        Object.entries(params).forEach(([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {
                url.searchParams.set(key, value);
            }

        });

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `SportScore API error: ${response.status}`
            );
        }

        return await response.json();
    },


    /* ================================
       FOOTBALL MATCHES
    ================================= */

    async getMatches(limit = 50) {

        return await this.request(
            "/matches/",
            {
                sport: "football",
                limit: limit
            }
        );
    },


    /* ================================
       MATCH DETAILS
    ================================= */

    async getMatch(slug) {

        return await this.request(
            "/match/",
            {
                sport: "football",
                slug: slug
            }
        );
    },


    /* ================================
       TEAM
    ================================= */

    async getTeam(slug, limit = 10) {

        return await this.request(
            "/team/",
            {
                sport: "football",
                slug: slug,
                limit: limit
            }
        );
    },


    /* ================================
       STANDINGS
    ================================= */

    async getStandings(slug) {

        return await this.request(
            "/standings/",
            {
                sport: "football",
                slug: slug
            }
        );
    },


    /* ================================
       TOP SCORERS
    ================================= */

    async getTopScorers(
        slug,
        limit = 20,
        stat = "goals"
    ) {

        return await this.request(
            "/topscorers/",
            {
                sport: "football",
                slug: slug,
                limit: limit,
                stat: stat
            }
        );
    }

};


/* =====================================================
   LIVE REFRESH
===================================================== */

const PreziLive = {

    timer: null,

    start(callback, seconds = 60) {

        this.stop();

        callback();

        this.timer = setInterval(
            callback,
            seconds * 1000
        );
    },

    stop() {

        if (this.timer) {

            clearInterval(this.timer);

            this.timer = null;
        }
    }
};


/* =====================================================
   GLOBAL
===================================================== */

window.PreziAPI = PreziAPI;
window.PreziLive = PreziLive;
