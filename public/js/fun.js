import { loadNavBar , displayDate } from "./common.js";


document.addEventListener("DOMContentLoaded", async function() {
  await loadNavBar();
  displayDate();
  getJoke();
  getRandomAdvice();
  getRandomEvent();
});


async function getJoke() {
  const joke = document.getElementById("joke-content");
  const data = await fetch("https://v2.jokeapi.dev/joke/Miscellaneous,Dark?type=single");
  const value = await data.json();
  console.log("Joke:", value["joke"]);
  joke.innerHTML = value["joke"];
}

async function getRandomAdvice()
{
  const advice = document.getElementById("advice-content");
  const data = await fetch("https://api.adviceslip.com/advice");
  const value = await data.json();
  console.log("Advice:", value["slip"]["advice"]);
  advice.innerHTML = value["slip"]["advice"];
}