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
  const data = await fetch("https://v2.jokeapi.dev/joke/Programming?type=single");
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

async function getRandomEvent()
{
  const doYouKnow = document.getElementById("dyk-content");
  const data = await fetch("https://byabbe.se/on-this-day/1/26/events.json");
  const value = await data.json();
  let randomNum = getRandomValueFromList(value["events"]);
  console.log("Event:", value["events"][randomNum]["description"]);
  doYouKnow.innerHTML = value["events"][randomNum]["description"];
}

function getRandomValueFromList(list) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Input must be a non-empty array.");
  }
  return Math.floor(Math.random() * list.length);
}

