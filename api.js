
// ==================================
// FOOTBALL GLOBAL API ENGINE
// ==================================


// Mete kle API ou isit la
const API_KEY = "47f671279defefb2b169097f1062a2a6";


const API_URL = "https://v3.football.api-sports.io";




// Fonksyon jeneral pou rele API a

async function apiRequest(endpoint){


try{


const response = await fetch(

`${API_URL}${endpoint}`,

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
"Erreur API:",
error
);


return null;


}


}







// ===============================
// MATCHS EN DIRECT
// ===============================


async function getLiveMatches(){


const container =
document.getElementById("liveMatches");



if(!container) return;



const data =
await apiRequest("/fixtures?live=all");



container.innerHTML = "";



if(!data || data.response.length === 0){


container.innerHTML =

"<p>Aucun match en direct actuellement.</p>";


return;


}



data.response.forEach(match=>{


container.innerHTML += `


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


async function getUpcomingMatches(){


const container =
document.getElementById("upcomingMatches");



if(!container) return;



const today =
new Date().toISOString().split("T")[0];



const data =
await apiRequest(
`/fixtures?date=${today}`
);



container.innerHTML = "";



if(!data || data.response.length === 0){


container.innerHTML =

"<p>Aucun match prévu aujourd'hui.</p>";


return;


}




data.response.slice(0,10).forEach(match=>{


container.innerHTML += `


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

📅 ${match.fixture.date}

</span>


</div>


`;


});



}







// ===============================
// DERNIERS RESULTATS
// ===============================


async function getResults(){


const container =
document.getElementById("resultsMatches");



if(!container) return;



const data =
await apiRequest(
"/fixtures?last=10"
);



container.innerHTML = "";



if(!data || data.response.length === 0){


container.innerHTML =

"<p>Aucun résultat disponible.</p>";


return;


}




data.response.forEach(match=>{


container.innerHTML += `


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

✅ Terminé

</span>


</div>


`;


});


}



// ===============================
// DEMARRAGE AUTOMATIQUE
// ===============================



document.addEventListener(
"DOMContentLoaded",
()=>{


getLiveMatches();

getUpcomingMatches();

getResults();


});





// ===============================
// FIN FOOTBALL GLOBAL API
// ===============================
