// ======================================
// FOOTBALL GLOBAL
// API FOOTBALL CONNECTION
// ======================================


const API_KEY = "47f671279defefb2b169097f1062a2a6";


const API_URL = "https://v3.football.api-sports.io";




// Fonction principale API

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
"Erreur API:",
error
);


return {
response:[]
};


}


}







// ======================================
// MATCHS LIVE POUR INDEX + MATCHES
// ======================================


async function loadLiveMatches(id){



const box =
document.getElementById(id);



if(!box) return;



const data =
await apiRequest("/fixtures?live=all");



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



// ======================================
// PROCHAINS MATCHS
// ======================================


async function loadUpcomingMatches(){


const boxes = [

"homeUpcomingMatches",

"upcomingMatches"

];



const today =
new Date().toISOString().split("T")[0];



const data =
await apiRequest(
`/fixtures?date=${today}`
);



boxes.forEach(id=>{


const box =
document.getElementById(id);



if(!box) return;



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

📅 ${new Date(match.fixture.date).toLocaleString("fr-FR")}

</span>



</div>


`;


});



});



}







// ======================================
// DERNIERS RESULTATS
// ======================================


async function loadResults(){


const box =
document.getElementById("resultsMatches");



if(!box) return;



const data =
await apiRequest(
"/fixtures?last=10"
);



box.innerHTML = "";



if(!data.response || data.response.length === 0){


box.innerHTML =
"<p>Aucun résultat disponible.</p>";


return;


}



data.response.forEach(match=>{


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

✅ Terminé

</span>



</div>


`;


});



}


// ======================================
// DEMARRAGE AUTOMATIQUE
// ======================================


document.addEventListener(
"DOMContentLoaded",
()=>{


// Page Accueil

loadLiveMatches("homeLiveMatches");

loadUpcomingMatches();




// Page Matchs

loadLiveMatches("liveMatches");




// Résultats

loadResults();



});




// ======================================
// FIN FOOTBALL GLOBAL API
// ======================================
