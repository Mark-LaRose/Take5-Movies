import axios from "axios";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const fetchContent = async (selectedType = "movie", page = 1, searchQuery = "", selectedGenre = "", selectedYear = "", actorQuery = "") => {
  try {
    let url = `${BASE_URL}/discover/${selectedType}?api_key=${API_KEY}&page=${page}&language=en-US&include_adult=false&with_original_language=en`;

    if (searchQuery) {
      url = `${BASE_URL}/search/${selectedType}?api_key=${API_KEY}&query=${searchQuery}&language=en-US&include_adult=false&with_original_language=en`;
    } else {
      if (selectedGenre) url += `&with_genres=${selectedGenre}`;
      if (selectedYear) {
        if (selectedType === "movie") {
          url += `&primary_release_year=${selectedYear}`;
        } else {
          url += `&first_air_date_year=${selectedYear}`;
        }
      }
    }

    // Handle Actor Search (Convert Name to Actor ID)
    if (actorQuery) {
      const actorResponse = await axios.get(`${BASE_URL}/search/person`, {
        params: { api_key: API_KEY, query: actorQuery },
      });

      if (actorResponse.data.results.length > 0) {
        const actorId = actorResponse.data.results[0].id;
        url = `${BASE_URL}/discover/${selectedType}?api_key=${API_KEY}&with_cast=${actorId}&page=${page}&language=en-US&include_adult=false&with_original_language=en`;
      }
    }

    const response = await axios.get(url);
    return response.data.results.map(item => ({
      id: item.id,
      title: item.title || item.name, // Use `name` for TV shows
      release_date: item.release_date || item.first_air_date || "N/A",
      poster_path: item.poster_path,
    }));
  } catch (error) {
    console.error(`Error fetching ${selectedType === "movie" ? "movies" : "TV shows"}:`, error);
    return [];
  }
};