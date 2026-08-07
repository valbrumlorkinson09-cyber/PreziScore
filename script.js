/* ==========================
   ⚽ FOOTBALL GLOBAL
   Main JavaScript
========================== */


console.log("⚽ Football Global is running!");





// ==========================
// HERO BUTTON
// ==========================


const exploreBtn = document.querySelector(".hero .btn");


if(exploreBtn){

exploreBtn.addEventListener("click",()=>{


console.log(
"Opening matches page..."
);


});


}







// ==========================
// SIMPLE NEWS SYSTEM
// ==========================


const newsBox = document.querySelector(".news-box");



const footballNews = [

"🔥 Transfer market is heating up.",

"⚽ New football stories coming soon.",

"🌍 Football Global connects fans worldwide."

];



let newsIndex = 0;



function updateNews(){


if(newsBox){


newsBox.innerHTML = `

<h3>
${footballNews[newsIndex]}
</h3>

<p>
Stay connected with Football Global for more updates.
</p>

`;


newsIndex++;


if(newsIndex >= footballNews.length){

newsIndex = 0;

}


}


}



setInterval(updateNews,5000);







// ==========================
// FOOTER YEAR
// ==========================


const footerText = document.querySelector("footer p");


if(footerText){


const year = new Date().getFullYear();


footerText.innerHTML =

`© ${year} Football Global | The World of Football`;


}







// ==========================
// MENU ACTIVE LOG
// ==========================


const links = document.querySelectorAll("nav a");


links.forEach(link=>{


link.addEventListener("click",()=>{


console.log(

"Opening:",
link.innerText

);


});


});
document.addEventListener("DOMContentLoaded",()=>{

if(document.getElementById("homeLiveMatches")){

loadLiveMatches("homeLiveMatches");

}


if(document.getElementById("homeUpcomingMatches")){

loadUpcomingMatches("homeUpcomingMatches");

}



});
