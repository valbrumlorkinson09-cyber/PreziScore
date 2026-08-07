// ======================================
// ⚽ FOOTBALL GLOBAL API ENGINE v2.0
// CLEAN GLOBAL SYSTEM
// ======================================



// ===============================
// CONFIGURATION
// ===============================


const API_KEY = "47f671279defefb2b169097f1062a2a6";


const API_URL = 
"https://v3.football.api-sports.io";





// ===============================
// GLOBAL REQUEST
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



function elementExiste(id){


return document.getElementById(id);


}




function afficherChargement(id,message){


const box = elementExiste(id);



if(box){


box.innerHTML =

`<p>${message}</p>`;


}



}





console.log(
"⚽ Football Global API v2 Connected"
);

// ======================================
// MATCH SYSTEM GLOBAL v2
// ======================================



// ===============================
// MATCHS EN DIRECT
// ===============================


async function getLiveMatches(containerId){


const box = elementExiste(containerId);



if(!box) return;



afficherChargement(
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




data.response.slice(0,10).forEach(match=>{


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



<span>

🔴 ${match.fixture.status.long}

</span>



</div>


`;


});



}








// ===============================
// PROCHAINS MATCHS
// ===============================


async function getUpcomingMatches(containerId){


const box = elementExiste(containerId);



if(!box) return;



afficherChargement(
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





data.response.slice(0,10).forEach(match=>{


box.innerHTML += `


<div class="match-card">


<h3>

${match.teams.home.name}

</h3>



<p>

VS

</p>



<h3>

${match.teams.away.name}

</h3>



<span>

📅 ${new Date(match.fixture.date)
.toLocaleString("fr-FR")}

</span>



</div>


`;



});


}




// ===============================
// RESULTATS RECENTS
// ===============================


async function getResults(containerId){


const box = elementExiste(containerId);



if(!box) return;



afficherChargement(
containerId,
"Chargement des résultats..."
);



const today =

new Date()
.toISOString()
.split("T")[0];



const data = await apiRequest(

`/fixtures?date=${today}`

);



box.innerHTML = "";



if(!data.response || data.response.length===0){


box.innerHTML =

"<p>Aucun résultat disponible.</p>";


return;


}




data.response.slice(0,10).forEach(match=>{


box.innerHTML += `


<div class="match-card">


<h3>

${match.teams.home.name}

${match.goals.home ?? 0}

-

${match.goals.away ?? 0}

${match.teams.away.name}

</h3>



</div>


`;


});


}




console.log(
"⚽ Match System v2 Ready"
);

// ======================================
// PLAYERS + TRANSFERS SYSTEM v2
// ======================================



// ===============================
// RECHERCHE JOUEUR
// ===============================


async function searchPlayer(name, containerId){


const box = elementExiste(containerId);



if(!box) return;



afficherChargement(
containerId,
"Recherche joueur..."
);



const data = await apiRequest(

`/players?search=${name}`

);



box.innerHTML = "";



if(!data.response || data.response.length === 0){


box.innerHTML =

"<p>Aucun joueur trouvé.</p>";

return;


}




data.response.slice(0,10).forEach(item=>{


const player = item.player;



box.innerHTML += `


<div class="player-card">


<h3>

⭐ ${player.name}

</h3>



<p>

Pays : ${player.nationality ?? "N/A"}

</p>



<p>

Âge : ${player.age ?? "N/A"}

</p>



<button onclick="getPlayerStats(${player.id}, ${new Date().getFullYear()}, 'playerStats')">

Voir statistiques

</button>



</div>


`;



});



}








// ===============================
// STATISTIQUES JOUEUR
// ===============================


async function getPlayerStats(playerId, season, containerId){


const box = elementExiste(containerId);



if(!box) return;



afficherChargement(
containerId,
"Chargement statistiques..."
);



const data = await apiRequest(

`/players?id=${playerId}&season=${season}`

);



box.innerHTML = "";



if(!data.response || data.response.length===0){


box.innerHTML =

"<p>Statistiques indisponibles.</p>";

return;


}




const player = data.response[0].player;

const stats = data.response[0].statistics[0];




box.innerHTML = `


<div class="player-card">


<h3>

${player.name}

</h3>



<p>

Matchs : ${stats.games.appearences ?? 0}

</p>



<p>

Buts : ${stats.goals.total ?? 0}

</p>



<p>

Passes : ${stats.goals.assists ?? 0}

</p>



</div>


`;



}







// ===============================
// TRANSFERTS JOUEUR
// ===============================


async function getTransfers(playerId, season, containerId){


const box = elementExiste(containerId);



if(!box) return;



afficherChargement(
containerId,
"Chargement des transferts..."
);



const data = await apiRequest(

`/transfers?player=${playerId}&season=${season}`

);



box.innerHTML = "";



if(!data.response || data.response.length===0){


box.innerHTML =

"<p>Aucun transfert disponible.</p>";

return;


}





data.response.forEach(item=>{


item.transfers.forEach(move=>{


box.innerHTML += `


<div class="transfer-card">


<h3>

${item.player.name}

</h3>



<p>

${move.teams.out.name}

➡️

${move.teams.in.name}

</p>



</div>


`;



});


});


}




console.log(
"👤 Players + Transfers v2 Ready"
);

// ======================================
// STANDINGS + COMPETITIONS SYSTEM v2
// ======================================



const FOOTBALL_LEAGUES = {


premierLeague:39,

laLiga:140,

ligue1:61,

serieA:135,

bundesliga:78,

championsLeague:2


};






// ===============================
// CLASSEMENT
// ===============================


async function getStandings(league, season, containerId){


const table = elementExiste(containerId);



if(!table) return;



afficherChargement(
containerId,
"Chargement du classement..."
);




const data = await apiRequest(

`/standings?league=${league}&season=${season}`

);




table.innerHTML = "";



if(!data.response || data.response.length===0){


table.innerHTML =

"<tr><td>Aucun classement disponible.</td></tr>";

return;


}




const standings =

data.response[0]
.league
.standings[0];





standings.forEach(team=>{


table.innerHTML += `


<tr>


<td>${team.rank}</td>


<td>${team.team.name}</td>


<td>${team.points}</td>


<td>${team.all.played}</td>


</tr>


`;



});


}








// ===============================
// COMPETITION BUTTON
// ===============================


async function loadCompetition(leagueId){


const season = new Date().getFullYear();



getStandings(

leagueId,

season,

"competitionStandings"

);



const info = elementExiste(
"competitionInfo"
);



if(info){


info.innerHTML =

`

<h3>

🏆 Saison ${season}

</h3>


<p>

Classement mis à jour depuis API Football.

</p>

`;



}



}







// ===============================
// AUTO LOAD GLOBAL
// ===============================


document.addEventListener(

"DOMContentLoaded",

()=>{



getLiveMatches(
"homeLiveMatches"
);



getUpcomingMatches(
"homeUpcomingMatches"
);





getLiveMatches(
"liveMatches"
);



getUpcomingMatches(
"upcomingMatches"
);





const season =
new Date().getFullYear();



if(elementExiste("homeStandings")){


getStandings(

39,

season,

"homeStandings"

);


}



});






console.log(
"🚀 Football Global API v2 Loaded Successfully"
);
