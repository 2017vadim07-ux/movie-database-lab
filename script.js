"use strict";

console.log("Підключено JavaScript для Практичної роботи №5");

const loadPokemonButton = document.getElementById("loadPokemon");
const pokemonOutput = document.getElementById("pokemonOutput");
const pokemonCard = document.getElementById("pokemonCard");

// Callback
function showMessage(callback) {
  setTimeout(function() {
    callback("Callback виконано");
  }, 1000);
}

showMessage(function(message) {
  console.log(message);
});

// Promise
function promiseExample() {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve("Promise виконано");
    }, 1000);
  });
}

promiseExample()
  .then(function(result) {
    console.log(result);
  })
  .catch(function(error) {
    console.error(error);
  });

// Async/Await + Fetch API
async function loadPokemonData() {
  const pokemonName = prompt("Введіть ім'я або ID покемона:");

  if (!pokemonName || pokemonName.trim() === "") {
    alert("Потрібно ввести ім'я або ID покемона.");
    return;
  }

  const name = pokemonName.trim().toLowerCase();
  const url = `https://pokeapi.co/api/v2/pokemon/${name}`;

  try {
    pokemonOutput.textContent = "Завантаження...";
    pokemonCard.innerHTML = "";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Покемона не знайдено або сталася помилка запиту.");
    }

    const data = await response.json();

    const {
      id,
      name,
      height,
      weight,
      sprites,
      types,
      abilities
    } = data;

    const pokemonTypes = types.map(item => item.type.name).join(", ");
    const pokemonAbilities = abilities.map(item => item.ability.name).join(", ");
    const image = sprites.front_default;

    pokemonCard.innerHTML = `
      <h3>${name.toUpperCase()}</h3>
      <img src="${image}" alt="${name}">
      <p><b>ID:</b> ${id}</p>
      <p><b>Зріст:</b> ${height}</p>
      <p><b>Вага:</b> ${weight}</p>
      <p><b>Тип:</b> ${pokemonTypes}</p>
      <p><b>Здібності:</b> ${pokemonAbilities}</p>
    `;

    pokemonOutput.textContent = JSON.stringify(data, null, 2);
    console.log("Дані покемона:", data);
  } catch (error) {
    pokemonOutput.textContent = error.message;
    pokemonCard.innerHTML = "";
    console.error("Error:", error);
  }
}

// Promise.all
async function loadSeveralPokemon() {
  try {
    const urls = [
      "https://pokeapi.co/api/v2/pokemon/pikachu",
      "https://pokeapi.co/api/v2/pokemon/bulbasaur"
    ];

    const requests = urls.map(url => fetch(url).then(response => response.json()));
    const results = await Promise.all(requests);

    console.log("Promise.all результат:", results);
  } catch (error) {
    console.error("Promise.all error:", error);
  }
}

// Promise.race
async function raceExample() {
  const fastRequest = fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  const slowPromise = new Promise(function(resolve) {
    setTimeout(resolve, 3000, "Час очікування завершено");
  });

  const result = await Promise.race([fastRequest, slowPromise]);
  console.log("Promise.race результат:", result);
}

loadPokemonButton.addEventListener("click", loadPokemonData);

loadSeveralPokemon();
raceExample();