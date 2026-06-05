"use strict";

const API_URL = "https://api.tvmaze.com/shows";

const moviesContainer = document.getElementById("moviesContainer");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const reloadButton = document.getElementById("reloadButton");
const statusText = document.getElementById("status");

let movies = [];

const removeHtmlTags = (text) => {
  return text ? text.replace(/<[^>]*>/g, "") : "Опис відсутній";
};

const getRating = (movie) => {
  return movie.rating.average || 0;
};

async function loadMovies() {
  try {
    statusText.textContent = "Завантаження даних...";
    moviesContainer.innerHTML = "";

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Помилка завантаження: ${response.status}`);
    }

    movies = await response.json();

    statusText.textContent = `Завантажено фільмів: ${movies.length}`;
    renderMovies(movies);
  } catch (error) {
    statusText.textContent = "Не вдалося завантажити дані з API.";
    moviesContainer.innerHTML = `<p class="error">${error.message}</p>`;
    console.error("Помилка:", error);
  }
}

function renderMovies(movieList) {
  if (movieList.length === 0) {
    moviesContainer.innerHTML = "<p>Фільми не знайдено.</p>";
    return;
  }

  moviesContainer.innerHTML = movieList.map((movie) => {
    const {
      name,
      genres,
      language,
      premiered,
      image,
      rating,
      summary
    } = movie;

    const poster = image ? image.medium : "https://via.placeholder.com/210x295?text=No+Image";
    const movieGenres = genres.length > 0 ? genres.join(", ") : "Жанр не вказано";
    const movieRating = rating.average ? rating.average : "Немає рейтингу";
    const description = removeHtmlTags(summary).slice(0, 150);

    return `
      <article class="movie-card">
        <img src="${poster}" alt="${name}">
        <h3>${name}</h3>
        <p><b>Жанри:</b> ${movieGenres}</p>
        <p><b>Мова:</b> ${language}</p>
        <p><b>Дата виходу:</b> ${premiered || "Невідомо"}</p>
        <p><b>Рейтинг:</b> ${movieRating}</p>
        <p>${description}...</p>
      </article>
    `;
  }).join("");
}

function updateMovies() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const sortValue = sortSelect.value;

  let filteredMovies = movies.filter((movie) => {
    const title = movie.name.toLowerCase();
    const genres = movie.genres.join(" ").toLowerCase();

    return title.includes(searchValue) || genres.includes(searchValue);
  });

  if (sortValue === "title") {
    filteredMovies.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortValue === "rating") {
    filteredMovies.sort((a, b) => getRating(b) - getRating(a));
  }

  renderMovies(filteredMovies);
}

searchInput.addEventListener("input", updateMovies);
sortSelect.addEventListener("change", updateMovies);
reloadButton.addEventListener("click", loadMovies);

loadMovies();