
// =================================
// FOOTBALL GLOBAL API
// =================================


const API_KEY = "47f671279defefb2b169097f1062a2a6";

const API_URL = "https://v3.football.api-sports.io";





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


console.log("API Error:", error);

return null;


}


}







// =================================
// MATCHS LIVE - ACCUEIL
// =================================


async function homeLiveMatches(){


const box =
document.getElementById("homeLiveMatches");


if(!box) return;



const data =
await apiRequest("/fixtures?live=all");



box.innerHTML = "";



if(!data || data.response.length === 0){


box.innerHTML =
"<p>Aucun match en direct.</p>";

return;


}




data.response.slice(0,5).forEach(match=>{


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



// =================================
// PROCHAINS MATCHS - ACCUEIL
// =================================


async function homeUpcomingMatches(){


const box =
document.getElementById("homeUpcomingMatches");


if(!box) return;



const today =
new Date().toISOString().split("T")[0];



const data =
await apiRequest(
`/fixtures?date=${today}`
);



box.innerHTML = "";



if(!data || data.response.length === 0){


box.innerHTML =

"<p>Aucun match prévu aujourd'hui.</p>";


return;


}




data.response.slice(0,6).forEach(match=>{


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

📅 ${new Date(match.fixture.date).toLocaleString("fr-FR")}

</span>


</div>


`;


});


}







// =================================
// CLASSEMENT - ACCUEIL
// =================================


async function homeStandings(){


const table =
document.getElementById("homeStandings");


if(!table) return;



// Exemple Ligue 1 France
// Nous allons connecter les vraies ligues après


table.innerHTML = `


<tr>

<td>1</td>

<td>Chargement API...</td>

<td>-</td>

</tr>


`;



}


// =================================
// DEMARRAGE AUTOMATIQUE
// =================================


document.addEventListener(
"DOMContentLoaded",
()=>{


homeLiveMatches();

homeUpcomingMatches();

homeStandings();


});




// =================================
// FIN FOOTBALL GLOBAL API
// =================================
