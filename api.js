// FOOTBALL GLOBAL API

const API_KEY = "47f671279defefb2b169097f1062a2a6";

const API_URL = "https://v3.football.api-sports.io";


async function getMatches(){

try{

const response = await fetch(
`${API_URL}/fixtures?live=all`,
{
method:"GET",
headers:{
"x-apisports-key": API_KEY
}
}
);


const data = await response.json();

console.log(data);

}

catch(error){

console.log("Erreur API:", error);

}

}


getMatches();
