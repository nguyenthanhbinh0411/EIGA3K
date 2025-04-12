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
    <div class="container">
      <div class="left-section">
        <!-- Breadcrumb navigation -->
        <nav class="breadcrumb">
          <router-link to="/">Trang chủ</router-link>
          <span>/</span>
          <router-link :to="`/movies?type=${movieType}`">
            {{ translatedType }}
          </router-link>
          <span>/</span>
          <span>{{ movieName }}</span>
        </nav>
        <!-- Existing MoviePlayer content -->
        <div v-if="isLoading" class="loading-spinner">
          <span>Đang tải...</span>
          <div class="spinner"></div>
        </div>

        <div v-if="movieName && currentEpisodeName" class="movie-info">
          <h2>{{ movieName }} - {{ currentEpisodeName }}</h2>
        </div>

        <div class="player-container">
          <iframe
            v-if="episodeUrl"
            :src="episodeUrl"
            class="video-player"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>

        <div class="server-list" v-if="episodes.length > 0">
          <EpisodeList
            :episodes="episodes"
            :currentEpisodeSlug="episodeSlug"
            @episode-click="playEpisode"
          />
        </div>
        <!-- End of existing content -->
      </div>
      <div class="right-section">
        <RightSection
          :newMovies="newMovies"
          @redirect="redirectToMovieListWithoutApi"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import MovieNavbar from "./Navbar.vue";
import EpisodeList from "./EpisodeList.vue";
import RightSection from "./RightSection.vue";

export default {
  components: {
    EpisodeList,
    MovieNavbar,
    RightSection,
  },
  data() {
    return {
      isLoading: true,
      episodeSlug: this.$route.query.episodeSlug || "full",
      episodeUrl: "",
      episodes: [],
      movieName: "",
      movieType: "",
      currentEpisodeName: "",
      genres: [],
      countries: [],
      showGenreDropdown: false,
      showCountryDropdown: false,
      newMovies: [], // Add newMovies for RightSection
    };
  },
  computed: {
    translatedType() {
      const typeMap = {
        "phim-le": "Phim Lẻ",
        "phim-bo": "Phim Bộ",
        "tv-shows": "TV Shows",
        hoathinh: "Anime",
        "phim-vietsub": "Phim Vietsub",
        "phim-thuyet-minh": "Phim Thuyết Minh",
        "phim-long-tieng": "Phim Lồng Tiếng",
      };
      return typeMap[this.movieType] || "Danh sách phim";
    },
  },
  mounted() {
    this.scrollToTop();
    this.fetchMovieDetails();
    this.fetchGenres();
    this.fetchCountries();
    this.fetchNewMovies(); // Fetch new movies for RightSection
  },
  watch: {
    $route: {
      immediate: true,
      handler(newRoute) {
        this.scrollToTop();
        this.episodeSlug = newRoute.query.episodeSlug || "full";
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
          this.movieType = res.data.movie.type;
          this.episodes = res.data.episodes.map((server) => ({
            ...server,
            server_data: server.server_data.map((episode) => ({
              ...episode,
              slug: episode.slug || episode.filename,
            })),
          }));
          this.updateCurrentEpisode();
        }
      } catch (error) {
        // Handle error
      } finally {
        this.isLoading = false;
      }
    },
    async fetchGenres() {
      try {
        const response = await axios.get("https://phimapi.com/the-loai");
        this.genres = response.data || [];
      } catch (error) {
        // Handle error
      }
    },
    async fetchCountries() {
      try {
        const response = await axios.get("https://phimapi.com/quoc-gia");
        this.countries = response.data || [];
      } catch (error) {
        // Handle error
      }
    },
    async fetchNewMovies() {
      try {
        const response = await axios.get(
          "https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=1"
        );
        this.newMovies = response.data?.items || [];
      } catch (error) {
        // Handle error
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
    toggleGenreDropdown() {
      this.showGenreDropdown = !this.showGenreDropdown;
    },
    toggleCountryDropdown() {
      this.showCountryDropdown = !this.showCountryDropdown;
    },
    playEpisode(episode) {
      if (episode.link_embed) {
        this.$router.push({
          name: "MoviePlayer",
          params: { slug: this.$route.params.slug },
          query: { episodeSlug: episode.slug },
        });
        this.episodeSlug = episode.slug;
        this.episodeUrl = episode.link_embed;
        this.currentEpisodeName = episode.name;
      } else {
        alert("Không thể phát tập này.");
      }
    },
    redirectToMovieListWithoutApi() {
      this.$router.push({ path: "/movies" });
    },
  },
};
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 8fr 4fr; /* Left section 8 rows, right section 4 rows */
  gap: 20px;
  padding-top: 60px;
  max-width: 1450px;
  margin: 0 auto;
}

.left-section {
  flex: 2;
}

.right-section {
  flex: 1;
}

.movie-player-page {
  background-color: #1c1c1c;
  color: white;
  min-height: 100vh;
  padding: 20px;
}

/* Existing styles... */
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

/* Responsive adjustments */
@media (max-width: 1200px) {
  .player-container iframe {
    max-width: 600px;
    height: 350px;
  }
}

@media (max-width: 768px) {
  .player-container iframe {
    max-width: 100%;
    height: 300px;
  }

  .movie-info {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .player-container iframe {
    height: 250px;
  }

  .movie-info {
    font-size: 14px;
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  background: #1c1c1c;
  margin-bottom: 15px;
  color: #ff6347;
}

.breadcrumb a {
  color: #ff6347;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #e03e2d;
  text-decoration: underline;
}

.breadcrumb span {
  color: #ff6347;
}
</style>
