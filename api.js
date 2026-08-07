const API_KEY = "47f671279defefb2b169097f1062a2a6";

const API_URL = "https://v3.football.api-sports.io";


async function getMatches(){

const container = document.getElementById("liveMatches");


try{

const response = await fetch(
`${API_URL}/fixtures?live=all`,
{
headers:{
"x-apisports-key": API_KEY
}
}
);


const data = await response.json();


container.innerHTML="";


if(data.response.length === 0){

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
${match.goals.home} - ${match.goals.away}
</p>

<h3>
${match.teams.away.name}
</h3>

<span>
🔴 En direct
</span>

</div>

`;


});


}

catch(error){

container.innerHTML =
"<p>Erreur de connexion API.</p>";

console.log(error);

}


}


getMatches();
