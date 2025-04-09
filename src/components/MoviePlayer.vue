<template>
  <div class="movie-player-page">
    <MovieNavbar
      :genres="genres"
      :countries="countries"
      :showGenreDropdown="showGenreDropdown"
      :showCountryDropdown="showCountryDropdown"
      @toggle-genre-dropdown="toggleGenreDropdown"
      @toggle-country-dropdown="toggleCountryDropdown"
      @load-movies-by-genre="loadMoviesByGenre"
      @load-movies-by-country="loadMoviesByCountry"
    />
    <!-- Loading Spinner -->
    <div v-if="isLoading" class="loading-spinner">
      <span>Đang tải...</span>
      <div class="spinner"></div>
    </div>

    <!-- Movie Info -->
    <div v-if="movieName && currentEpisodeName" class="movie-info">
      <h2>{{ movieName }} - {{ currentEpisodeName }}</h2>
    </div>

    <!-- Video Player -->
    <div class="player-container">
      <iframe
        v-if="episodeUrl"
        :src="episodeUrl"
        class="video-player"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>

    <!-- Server and Episode List -->
    <div class="server-list" v-if="episodes.length > 0">
      <h3>Danh sách Server</h3>
      <div v-for="(server, index) in episodes" :key="index" class="server">
        <h4>{{ server.server_name }}</h4>
        <ul>
          <li
            v-for="(episode, epIndex) in server.server_data"
            :key="episode.slug || epIndex"
            class="episode-item"
          >
            <button
              class="episode-button"
              @click="
                playEpisode(episode.slug, episode.link_embed, episode.name)
              "
            >
              {{ episode.name }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import MovieNavbar from "./Navbar.vue";

export default {
  components: {
    MovieNavbar,
  },
  data() {
    return {
      isLoading: true,
      episodeSlug: this.$route.query.episodeSlug || "full", // Retrieve episodeSlug from query parameters
      episodeUrl: "",
      episodes: [],
      movieName: "",
      currentEpisodeName: "",
      genres: [],
      countries: [],
      showGenreDropdown: false,
      showCountryDropdown: false,
    };
  },
  mounted() {
    this.scrollToTop(); // Scroll to top when the component is mounted
    this.fetchMovieDetails();
    this.fetchGenres();
    this.fetchCountries();
  },
  watch: {
    $route: {
      immediate: true,
      handler(newRoute) {
        this.scrollToTop(); // Scroll to top when the route changes
        this.episodeSlug = newRoute.query.episodeSlug || "full"; // Update episodeSlug from query parameters
        if (this.episodes.length > 0) {
          this.updateCurrentEpisode();
        } else {
          this.fetchMovieDetails();
        }
      },
    },
  },
  methods: {
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    async fetchMovieDetails() {
      const slug = this.$route.params.slug;
      try {
        const res = await axios.get(`https://phimapi.com/phim/${slug}`);
        if (res.data && res.data.movie && res.data.episodes.length > 0) {
          this.movieName = res.data.movie.name;
          this.episodes = res.data.episodes.map((server) => ({
            ...server,
            server_data: server.server_data.map((episode) => ({
              ...episode,
              slug: episode.slug || episode.filename, // Ensure slug is correctly handled
            })),
          }));
          this.updateCurrentEpisode();
        } else {
          console.error("Dữ liệu trả về không có danh sách tập.");
        }
      } catch (error) {
        console.error("Có lỗi xảy ra khi lấy dữ liệu từ API:", error);
      } finally {
        this.isLoading = false;
      }
    },
    updateCurrentEpisode() {
      for (const server of this.episodes) {
        const currentEpisode = server.server_data.find(
          (ep) => ep.slug === this.episodeSlug
        );
        if (currentEpisode && currentEpisode.link_embed) {
          this.episodeUrl = currentEpisode.link_embed;
          this.currentEpisodeName = currentEpisode.name;
          return;
        }
      }
      // If no matching episode is found, default to the first episode with a valid link
      for (const server of this.episodes) {
        const fallbackEpisode = server.server_data.find((ep) => ep.link_embed);
        if (fallbackEpisode) {
          this.episodeUrl = fallbackEpisode.link_embed;
          this.currentEpisodeName = fallbackEpisode.name;
          return;
        }
      }
      console.error("Không tìm thấy tập hiện tại hoặc không có link_embed.");
    },
    async fetchGenres() {
      try {
        const response = await axios.get("https://phimapi.com/the-loai");
        this.genres = response.data || [];
      } catch (error) {
        console.error("Lỗi khi lấy danh sách thể loại:", error);
      }
    },
    async fetchCountries() {
      try {
        const response = await axios.get("https://phimapi.com/quoc-gia");
        this.countries = response.data || [];
      } catch (error) {
        console.error("Lỗi khi lấy danh sách quốc gia:", error);
      }
    },
    toggleGenreDropdown() {
      this.showGenreDropdown = !this.showGenreDropdown;
    },
    toggleCountryDropdown() {
      this.showCountryDropdown = !this.showCountryDropdown;
    },
    loadMoviesByGenre(apiUrl) {
      this.$router.push("/");
      this.$emit("load-movies-by-genre", apiUrl);
    },
    loadMoviesByCountry(apiUrl) {
      this.$router.push("/");
      this.$emit("load-movies-by-country", apiUrl);
    },
    playEpisode(slug, linkEmbed, episodeName) {
      if (linkEmbed) {
        this.$router.push({
          name: "MoviePlayer",
          params: { slug: this.$route.params.slug, episodeSlug: slug },
        });
        this.episodeSlug = slug;
        this.episodeUrl = linkEmbed;
        this.currentEpisodeName = episodeName;
      } else {
        alert("Không thể phát tập này.");
      }
    },
  },
};
</script>

<style scoped>
.movie-player-page {
  background-color: #1c1c1c; /* Black background */
  color: white; /* White text color */
  min-height: 100vh;
  padding: 20px;
}

/* Hiệu ứng spinner */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1c1c1c; /* Black background */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.spinner {
  border: 4px solid #a3a0a0; /* Light gray */
  border-top: 4px solid #ff6347; /* Orange */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Trình phát phim */
.player-container {
  max-width: 1200px;
  margin: 20px auto;
  text-align: center;
  padding: 0 16px;
}

.player-container iframe {
  width: 100%;
  max-width: 800px;
  height: 450px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out;
}

.player-container iframe:hover {
  transform: scale(1.02);
}

/* Thông tin phim */
.movie-info {
  text-align: center;
  font-size: 18px;
  margin-top: 40px;
  font-weight: bold;
  color: #ff6347; /* Orange text */
}

/* Danh sách tập */
.episode-list {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 16px;
}

.episode-list h3 {
  text-align: center;
  font-size: 22px;
  margin-bottom: 20px;
  font-weight: bold;
  color: #ff6347; /* Orange text */
}

.episode-list ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  padding: 0;
  margin: 0;
}

.episode-item {
  list-style: none;
  text-align: center;
}

.episode-item button {
  padding: 12px 25px;
  background-color: #ff6347; /* Orange background */
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.episode-item button:hover {
  background-color: #e03e2d; /* Darker orange */
  transform: scale(1.05);
}

.episode-item button:disabled {
  background-color: #333; /* Dark gray */
  cursor: not-allowed;
  color: #aaa;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .episode-item {
    width: calc(50% - 10px);
  }
}

@media (max-width: 480px) {
  .episode-item {
    width: 100%;
  }
}

/* Server List */
.server-list {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 16px;
}

.server h4 {
  font-size: 18px;
  color: #ff6347;
  margin-bottom: 10px;
}

.server ul {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0;
  margin: 0;
}

.episode-item {
  list-style: none;
}

.episode-button {
  padding: 10px 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.episode-button:hover {
  background-color: #ff6347;
  transform: scale(1.05);
}
</style>
