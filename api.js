// ======================================
// ⚽ FOOTBALL GLOBAL API ENGINE v1.0
// GLOBAL SYSTEM
// ======================================


// ===============================
// CONFIGURATION API
// ===============================


const API_KEY = "47f671279defefb2b169097f1062a2a6";


const API_URL =
"https://v3.football.api-sports.io";




// ===============================
// API REQUEST GLOBAL
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
// SYSTEME DE VERIFICATION
// ===============================


function elementExiste(id){


return document.getElementById(id);

}




function afficherChargement(id,message){


const element =
elementExiste(id);



if(element){


element.innerHTML =

`<p>${message}</p>`;


}



}




console.log(
"⚽ Football Global API Global System Active"
);

// ======================================
// MATCH SYSTEM GLOBAL
// ======================================



// ===============================
// MATCHS EN DIRECT
// ===============================


async function getLiveMatches(containerId){



const box =
elementExiste(containerId);



if(!box) return;



afficherChargement(
containerId,
"Chargement des matchs en direct..."
);



const data =
await apiRequest(
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


<p>

${match.goals.home ?? 0}

-

${match.goals.away ?? 0}

</p>



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


const box =
elementExiste(containerId);



if(!box) return;



afficherChargement(
containerId,
"Chargement du calendrier..."
);



const today =
new Date()
.toISOString()
.split("T")[0];



const data =
await apiRequest(

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

// ======================================
// STANDINGS SYSTEM GLOBAL
// ======================================



// ===============================
// CLASSEMENT D'UNE LIGUE
// ===============================


async function getStandings(league, season, containerId){



const table =
elementExiste(containerId);



if(!table) return;



afficherChargement(
containerId,
"Chargement du classement..."
);



const data =
await apiRequest(

`/standings?league=${league}&season=${season}`

);



table.innerHTML = "";



if(!data.response || data.response.length === 0){


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


<td>

${team.rank}

</td>


<td>

${team.team.name}

</td>


<td>

${team.points}

</td>



</tr>


`;



});



}







// ===============================
// LIGUES POPULAIRES
// ===============================



const FOOTBALL_LEAGUES = {


premierLeague:39,


laLiga:140,


ligue1:61,


serieA:135,


bundesliga:78,


championsLeague:2


};





console.log(
"📊 Standings System Ready"
);

// ======================================
// PLAYERS + TRANSFERS SYSTEM GLOBAL
// ======================================





// ===============================
// RECHERCHE JOUEUR
// ===============================


async function searchPlayer(name, containerId){



const box =
elementExiste(containerId);



if(!box) return;



afficherChargement(
containerId,
"Recherche joueur..."
);



const data =
await apiRequest(

`/players?search=${name}`

);



box.innerHTML = "";



if(!data.response || data.response.length === 0){


box.innerHTML =

"<p>Aucun joueur trouvé.</p>";

return;


}





data.response.slice(0,10).forEach(player=>{


box.innerHTML += `


<div class="player-card">


<h3>

${player.player.name}

</h3>



<p>

Age : ${player.player.age ?? "N/A"}

</p>



<p>

Nationalité :

${player.player.nationality ?? "N/A"}

</p>



</div>


`;


});



}







// ===============================
// STATISTIQUES JOUEUR
// ===============================


async function getPlayerStats(playerId, season, containerId){



const box =
elementExiste(containerId);



if(!box) return;



const data =
await apiRequest(

`/players?id=${playerId}&season=${season}`

);



box.innerHTML = "";



if(!data.response || data.response.length === 0){


box.innerHTML =

"<p>Statistiques indisponibles.</p>";

return;


}



const stats =
data.response[0]
.statistics[0];




box.innerHTML = `


<div class="player-card">


<h3>

${data.response[0].player.name}

</h3>


<p>

Matchs: ${stats.games.appearences ?? 0}

</p>


<p>

Buts: ${stats.goals.total ?? 0}

</p>



<p>

Passes: ${stats.goals.assists ?? 0}

</p>


</div>


`;



}







// ===============================
// TRANSFERTS
// ===============================


async function getTransfers(playerId, season, containerId){



const box =
elementExiste(containerId);



if(!box) return;



const data =
await apiRequest(

`/transfers?player=${playerId}&season=${season}`

);



box.innerHTML = "";



if(!data.response || data.response.length === 0){


box.innerHTML =

"<p>Aucun transfert trouvé.</p>";

return;


}



data.response.slice(0,10).forEach(item=>{


box.innerHTML += `


<div class="transfer-card">


<p>

${item.player.name}

</p>


<p>

${item.transfers[0].teams.out.name}

➡️

${item.transfers[0].teams.in.name}

</p>


</div>


`;


});



}



console.log(
"👤 Players & Transfers System Ready"
);

// ======================================
// AUTO START SYSTEM
// ======================================



document.addEventListener(
"DOMContentLoaded",
()=>{


// ===============================
// ACCUEIL
// ===============================


getLiveMatches(
"homeLiveMatches"
);


getUpcomingMatches(
"homeUpcomingMatches"
);




// ===============================
// PAGE MATCHS
// ===============================


getLiveMatches(
"liveMatches"
);


getUpcomingMatches(
"upcomingMatches"
);



// ===============================
// PAGE RESULTATS
// ===============================


const results =
elementExiste("resultsMatches");



if(results){


getUpcomingMatches(
"resultsMatches"
);


}




// ===============================
// CLASSEMENT PAR DEFAUT
// ===============================


const standings =
elementExiste("homeStandings");



if(standings){


const season =
new Date()
.getFullYear();



getStandings(

39,

season,

"homeStandings"

);


}



});






console.log(
"🚀 Football Global API v1.0 Loaded Successfully"
);
