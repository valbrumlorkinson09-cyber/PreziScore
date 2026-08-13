"use strict";

const box = document.getElementById("matchesContainer");
const loading = document.getElementById("loading");
const empty = document.getElementById("noMatches");
const search = document.getElementById("searchInput");
const count = document.getElementById("matchCount");
const tabs = document.querySelectorAll(".match-tab");

let matches = [];
let filter = "live";


function esc(x) {
    return String(x ?? "").replace(/[&<>"']/g, c => ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#039;"
    }[c]));
}


function status(m) {

    const s = String(
        m?.status ??
        m?.statusShort ??
        m?.raw?.status ??
        m?.raw?.status_short ??
        m?.raw?.statusShort ??
        m?.raw?.status_code ??
        ""
    ).toLowerCase().trim();


    const text = String(
        m?.statusText ??
        m?.statusLong ??
        m?.raw?.status_text ??
        m?.raw?.statusText ??
        m?.raw?.status_long ??
        ""
    ).toLowerCase().trim();


    /* =========================
       LIVE
    ========================= */

    const liveStatuses = [
        "live",
        "1h",
        "2h",
        "ht",
        "et",
        "bt",
        "p",
        "playing",
        "ongoing",
        "started",
        "in_progress",
        "in progress",
        "progress",
        "first_half",
        "second_half",
        "1st_half",
        "2nd_half"
    ];


    if (
        liveStatuses.includes(s) ||
        s.includes("live") ||
        s.includes("progress") ||
        s.includes("playing") ||
        text.includes("live") ||
        text.includes("progress") ||
        text.includes("playing") ||
        text.includes("first half") ||
        text.includes("second half") ||
        text.includes("1st half") ||
        text.includes("2nd half")
    ) {

        return "live";

    }


    /* =========================
       FINISHED
    ========================= */

    const finishedStatuses = [
        "finished",
        "finish",
        "ft",
        "ended",
        "completed",
        "aet",
        "pen",
        "full_time",
        "full time"
    ];


    if (
        finishedStatuses.includes(s) ||
        s.includes("finished") ||
        s.includes("ended") ||
        text.includes("finished") ||
        text.includes("ended") ||
        text.includes("full time")
    ) {

        return "finished";

    }


    /* =========================
       UPCOMING
    ========================= */

    return "upcoming";
}


function team(m, side) {

    let t = m?.[side];

    if (typeof t === "string") {
        return t;
    }

    let name = t?.name;

    if (!name) {
        name =
            m?.raw?.[side] ||
            m?.raw?.[side + "_name"] ||
            m?.raw?.[side + "_team"]?.name;
    }

    return name ||
        (side === "home"
            ? "Équipe domicile"
            : "Équipe visiteuse");
}


function logo(m, side) {

    let t = m?.[side];

    if (typeof t === "string") {
        t = null;
    }

    return (
        t?.logo ||
        m?.raw?.[side + "_logo"] ||
        m?.raw?.[side + "_team"]?.logo ||
        ""
    );
}


function score(m, side) {

    let t = m?.[side];

    if (typeof t === "string") {
        t = null;
    }

    return (
        t?.score ??
        m?.raw?.[side + "_score"] ??
        "-"
    );
}


function competition(m) {

    return (
        m?.competition ||
        m?.raw?.competition ||
        "Football"
    );
}


function time(m, s) {

    if (s === "live") {
        return "🔴 LIVE";
    }

    if (s === "finished") {
        return "FT";
    }

    const value =
        m?.time ||
        m?.raw?.time;

    if (!value) {
        return "--:--";
    }

    const d = new Date(value);

    if (isNaN(d)) {
        return "--:--";
    }

    return d.toLocaleTimeString(
        "fr-FR",
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    );
}


function filtered() {

    let list =
        matches.filter(
            m => status(m) === filter
        );

    const q =
        search?.value
            ?.toLowerCase()
            .trim();

    if (q) {

        list = list.filter(m => {

            return (
                team(m,"home")
                    .toLowerCase()
                    .includes(q) ||

                team(m,"away")
                    .toLowerCase()
                    .includes(q) ||

                String(
                    competition(m)
                )
                .toLowerCase()
                .includes(q)
            );

        });
    }

    return list;
}


function card(m) {

    const s = status(m);

    const home = team(m,"home");
    const away = team(m,"away");

    const hl = logo(m,"home");
    const al = logo(m,"away");

    const hs = score(m,"home");
    const as = score(m,"away");

    const div =
        document.createElement("article");

    div.className =
        "match-item";

    div.innerHTML = `

        <div class="match-top">

            <div class="status ${s}">

                <span class="status-dot"></span>

                ${s === "live"
                    ? "🔴 LIVE"
                    : s === "finished"
                    ? "TERMINÉ"
                    : "À VENIR"}

            </div>

            <div class="match-time">
                ${esc(time(m,s))}
            </div>

        </div>


        <div class="match-body">

            <div class="club">

                <div class="club-logo">

                    ${
                        hl
                        ? `<img src="${esc(hl)}"
                                alt="${esc(home)}"
                                loading="lazy">`
                        : "⚽"
                    }

                </div>

                <div class="club-name">
                    ${esc(home)}
                </div>

            </div>


            <div class="score">

                <strong>
                    ${esc(hs)}
                </strong>

                <span>-</span>

                <strong>
                    ${esc(as)}
                </strong>

                <small>
                    ${
                        s === "live"
                        ? "LIVE"
                        : s === "finished"
                        ? "FT"
                        : "À venir"
                    }
                </small>

            </div>


            <div class="club">

                <div class="club-logo">

                    ${
                        al
                        ? `<img src="${esc(al)}"
                                alt="${esc(away)}"
                                loading="lazy">`
                        : "⚽"
                    }

                </div>

                <div class="club-name">
                    ${esc(away)}
                </div>

            </div>

        </div>
    `;


    div.onclick = () => {

        const id =
            m?.slug ||
            m?.id ||
            m?.url ||
            m?.raw?.url ||
            "";

        if (!id) return;

        location.href =
            "match-details.html?match=" +
            encodeURIComponent(id);
    };


    return div;
}


async function loadMatches() {

    try {

        loading.style.display = "block";

        const data =
            await PreziAPI.getNormalizedMatches();

        matches =
            Array.isArray(data)
            ? data
            : [];

        render();

    } catch(e) {

        console.error(e);

        loading.style.display = "none";

        showEmpty(
            "⚠️",
            "Erreur API",
            "Impossible de charger les matchs."
        );
    }
               }

/* =====================================================
   PREZISCORE SCRIPT.JS
   PARTIE 2 / 2
===================================================== */


function render() {

    loading.style.display = "none";

    const list = filtered();

    box.innerHTML = "";


    if (count) {

        count.textContent =
            list.length +
            (list.length > 1 ? " matchs" : " match");

    }


    if (!list.length) {

        showEmpty(
            filter === "live"
                ? "🔴"
                : filter === "finished"
                ? "✅"
                : "📅",

            filter === "live"
                ? "Aucun match en direct"
                : filter === "finished"
                ? "Aucun match terminé"
                : "Aucun match à venir",

            "Aucun match ne correspond actuellement."
        );

        return;
    }


    if (empty) {

        empty.classList.remove("show");

        empty.style.display = "none";

    }


    /*
       GROUP BY COMPETITION
    */

    const groups = {};


    list.forEach(m => {

        const name =
            competition(m);

        if (!groups[name]) {
            groups[name] = [];
        }

        groups[name].push(m);

    });


    Object.entries(groups).forEach(
        ([name, games]) => {

            const section =
                document.createElement("section");

            section.className =
                "competition";


            const head =
                document.createElement("div");

            head.className =
                "competition-head";


            head.innerHTML = `
                <div class="competition-icon">
                    🏆
                </div>

                <span>
                    ${esc(name)}
                </span>
            `;


            section.appendChild(head);


            games.forEach(m => {

                section.appendChild(
                    card(m)
                );

            });


            box.appendChild(section);

        }
    );

}


/* =====================================================
   EMPTY MESSAGE
===================================================== */

function showEmpty(
    icon,
    title,
    text
) {

    if (!empty) return;


    empty.innerHTML = `

        <div>${icon}</div>

        <h3>
            ${esc(title)}
        </h3>

        <p>
            ${esc(text)}
        </p>

    `;


    empty.style.display = "block";

    empty.classList.add("show");

}


/* =====================================================
   EMPTY TEXT
===================================================== */

function emptyTitle() {

    if (filter === "live") {

        return "Aucun match en direct";

    }

    if (filter === "finished") {

        return "Aucun match terminé";

    }

    return "Aucun match à venir";
}


/* =====================================================
   TABS
===================================================== */

tabs.forEach(tab => {

    tab.addEventListener(
        "click",
        function() {

            tabs.forEach(t => {

                t.classList.remove(
                    "active"
                );

            });


            this.classList.add(
                "active"
            );


            filter =
                this.dataset.filter ||
                "live";


            render();

        }
    );

});


/* =====================================================
   SEARCH
===================================================== */

if (search) {

    search.addEventListener(
        "input",
        function() {

            render();

        }
    );

}


/* =====================================================
   SEARCH BUTTON
===================================================== */

function focusSearch() {

    if (!search) return;

    search.focus();

    search.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =====================================================
   AUTO REFRESH
===================================================== */

setInterval(
    async function() {

        try {

            const data =
                await PreziAPI
                    .getNormalizedMatches();


            if (
                Array.isArray(data)
            ) {

                matches = data;

                render();

            }

        }
        catch(error) {

            console.log(
                "Auto refresh:",
                error
            );

        }

    },
    60000
);


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadMatches();

    }
);


/* =====================================================
   GLOBAL
===================================================== */

window.PreziMatches = {

    reload: loadMatches,

    render: render,

    getAll: () => matches

};


console.log(
    "✅ PreziScore script.js FULL READY"
);
