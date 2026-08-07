// ======================================
// ⚽ PREZISCORE API ENGINE v1.0
// GLOBAL FOOTBALL SYSTEM
// ======================================


// ===============================
// API CONFIG
// ===============================


const API_KEY = "47f671279defefb2b169097f1062a2a6";


const API_URL =
"https://v3.football.api-sports.io";




// ===============================
// GLOBAL API REQUEST
// ===============================


async function apiRequest(endpoint){


try{


const response = await fetch(

API_URL + endpoint,

{

method:"GET",

headers:{

"x-apisports-key": API_KEY

}

}

);



const data = await response.json();


return data;



}

catch(error){


console.log(
"API ERROR:",
error
);



return {

response:[]

};


}



}






// ===============================
// HELPERS
// ===============================


function getElement(id){


return document.getElementById(id);


}





function loading(id,text){


const box = getElement(id);



if(box){


box.innerHTML =

`<p>${text}</p>`;


}



}





console.log(
"⚽ PreziScore API Connected"
);

// ======================================
// MATCH SYSTEM
// LIVE + UPCOMING
// ======================================



// ===============================
// MATCHS LIVE
// ===============================


async function loadLiveMatches(containerId){


const box = getElement(containerId);


if(!box) return;



loading(
containerId,
"Chargement des matchs en direct..."
);




const data = await apiRequest(

"/fixtures?live=all"

);




box.innerHTML = "";



if(!data.response || data.response.length === 0){


box.innerHTML =

"<p>Aucun match en direct actuellement.</p>";

return;


}




data.response.forEach(match=>{


box.innerHTML += `


<div class="match-card">


<h3>

${match.teams.home.name}

</h3>


<h2>

${match.goals.home ?? 0}

-

${match.goals.away ?? 0}

</h2>



<h3>

${match.teams.away.name}

</h3>



<p>

🔴 ${match.fixture.status.long}

</p>


</div>


`;



});



}








// ===============================
// MATCHS A VENIR
// ===============================


async function loadUpcomingMatches(containerId){


const box = getElement(containerId);


if(!box) return;



loading(
containerId,
"Chargement du calendrier..."
);





const today =

new Date()
.toISOString()
.split("T")[0];





const data = await apiRequest(

`/fixtures?date=${today}`

);





box.innerHTML = "";



if(!data.response || data.response.length === 0){


box.innerHTML =

"<p>Aucun match prévu.</p>";

return;


}




data.response.slice(0,20).forEach(match=>{


box.innerHTML += `


<div class="match-card">


<h3>

${match.teams.home.name}

</h3>



<h2>

VS

</h2>



<h3>

${match.teams.away.name}

</h3>



<p>

📅 

${new Date(match.fixture.date)
.toLocaleString("fr-FR")}

</p>



</div>


`;



});



}





console.log(
"⚽ Match System Ready"
);
// ======================================
// MATCH DETAILS SYSTEM
// STATISTICS + LINEUPS
// ======================================



// ===============================
// STATISTIQUES MATCH
// ===============================


async function loadMatchStatistics(fixtureId, containerId){


const box = getElement(containerId);


if(!box) return;



loading(
containerId,
"Chargement des statistiques..."
);




const data = await apiRequest(

`/fixtures/statistics?fixture=${fixtureId}`

);




box.innerHTML = "";



if(!data.response || data.response.length === 0){


box.innerHTML =

"<p>Statistiques indisponibles.</p>";

return;


}





data.response.forEach(team=>{


box.innerHTML += `


<div class="stats-card">


<h3>

${team.team.name}

</h3>


${team.statistics.map(stat=>`


<p>

${stat.type} :

${stat.value ?? 0}

</p>


`).join("")}



</div>


`;



});



}








// ===============================
// COMPOSITION DES EQUIPES
// ===============================


async function loadLineups(fixtureId, containerId){


const box = getElement(containerId);


if(!box) return;



loading(
containerId,
"Chargement des compositions..."
);





const data = await apiRequest(

`/fixtures/lineups?fixture=${fixtureId}`

);





box.innerHTML = "";



if(!data.response || data.response.length === 0){


box.innerHTML =

"<p>Composition indisponible.</p>";

return;


}





data.response.forEach(team=>{


box.innerHTML += `


<div class="lineup-card">


<h3>

${team.team.name}

</h3>


<h4>

Titulaires

</h4>


<ul>


${team.startXI.map(player=>`


<li>

${player.player.name}

</li>


`).join("")}


</ul>



<h4>

Remplaçants

</h4>


<ul>


${team.substitutes.map(player=>`


<li>

${player.player.name}

</li>


`).join("")}


</ul>



</div>


`;



});



}




console.log(
"📊 Statistics + Lineups System Ready"
);

// ======================================
// COMPETITIONS + STANDINGS SYSTEM
// ======================================



const PREZISCORE_LEAGUES = {


"Premier League":39,

"La Liga":140,

"Ligue 1":61,

"Serie A":135,

"Bundesliga":78,

"Champions League":2


};






// ===============================
// LOAD STANDINGS
// ===============================


async function loadStandings(leagueId,containerId){


const box = getElement(containerId);


if(!box) return;



loading(
containerId,
"Chargement du classement..."
);





const season = new Date().getFullYear();





const data = await apiRequest(

`/standings?league=${leagueId}&season=${season}`

);





box.innerHTML = "";



if(!data.response || data.response.length===0){


box.innerHTML =

"<p>Classement indisponible.</p>";

return;


}





const table =

data.response[0]
.league
.standings[0];





table.forEach(team=>{


box.innerHTML += `


<div class="standing-card">


<span>

${team.rank}

</span>



<strong>

${team.team.name}

</strong>



<span>

${team.points} pts

</span>



</div>


`;



});



}







// ===============================
// AUTO START SYSTEM
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{



// ACCUEIL


loadLiveMatches(
"homeLiveMatches"
);



loadUpcomingMatches(
"homeUpcomingMatches"
);




// PAGE MATCHS


loadLiveMatches(
"liveMatches"
);



loadUpcomingMatches(
"upcomingMatches"
);




// PAGE COMPETITIONS


if(getElement("standings")){


loadStandings(

39,

"standings"

);


}



});







console.log(
"🚀 PreziScore Global System Loaded"
);

console.log("API TEST START");

apiRequest("/fixtures?live=all")
.then(data=>{

console.log("LIVE DATA:",data);

});
