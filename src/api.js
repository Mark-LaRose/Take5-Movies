import axios from "axios";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const BASE_API_URL = "https://take5-movies-backend.onrender.com"; // Updated backend URL

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
      title: item.title || item.name,
      release_date: item.release_date || item.first_air_date || "N/A",
      poster_path: item.poster_path,
      overview: item.overview || "No description available.",
    }));
  } catch (error) {
    return [];
  }
};

// Fetch user favorites from Render backend
export const fetchFavorites = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await axios.get(`${BASE_API_URL}/api/movies/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.success ? response.data.favorites : [];
  } catch (error) {
    return [];
  }
};