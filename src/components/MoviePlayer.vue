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
          <router-link v-if="movieType" :to="`/movies?type=${movieType}`">
            {{ translatedType }}
          </router-link>
          <span v-else>Đang tải...</span>
          <span>/</span>
          <span>{{ movieName || "Đang tải..." }} {{ currentEpisodeName }}</span>
        </nav>
        <!-- Existing MoviePlayer content -->
        <div v-if="isLoading" class="loading-spinner">
          <span>Đang tải...</span>
          <div class="spinner"></div>
        </div>
        <div class="player-container">
          <iframe
            v-if="episodeUrl"
            :src="episodeUrl"
            class="video-player"
            frameborder="0"
            allowfullscreen
          ></iframe>
          <div v-else class="loading-spinner">
            <span>Đang tải...</span>
          </div>
        </div>

        <div class="server-list" v-if="episodes.length > 0">
          <EpisodeList
            :episodes="episodes"
            :currentEpisodeSlug="episodeSlug"
            @episode-click="playEpisode"
          />
        </div>
        <!-- Movie Information Section -->
        <div
          v-if="movie && movie.thumb_url"
          class="movie-detail-container"
          :style="{ backgroundImage: `url(${movie.thumb_url})` }"
        >
          <div class="overlay"></div>
          <div class="movie-content">
            <div class="movie-thumbnail">
              <img :src="movie.poster_url" alt="Thumbnail" loading="lazy" />
            </div>
            <div class="movie-info">
              <h1>{{ movie.name }}</h1>
              <p>
                <i class="fas fa-film"></i> Tên khác:
                {{ movie.origin_name || "Đang cập nhật" }}
              </p>
              <p class="movie-content">
                {{ movie.content || "Đang cập nhật" }}
              </p>
              <div class="rating-info">
                <div class="rating-container">
                  <div class="rating-percentage">
                    <div
                      class="circle"
                      :style="{
                        background: `conic-gradient(#ff6347 ${circlePercentage}%, #fff ${circlePercentage}%)`,
                      }"
                    >
                      <span class="percentage-text"
                        >{{ circlePercentage }}%</span
                      >
                    </div>
                  </div>
                  <div class="stars-container">
                    <div class="stars">
                      <i
                        v-for="n in 10"
                        :key="n"
                        :class="
                          n <= Math.round(movie.vote_average)
                            ? 'fas fa-star'
                            : 'far fa-star'
                        "
                      ></i>
                    </div>
                    <p class="rating-text">
                      ({{ movie.vote_average || "0" }}/10 từ
                      {{ movie.vote_count || "0" }} lượt vote)
                    </p>
                  </div>
                </div>
                <div class="additional-info">
                  <span>
                    <i class="fas fa-list-ol"></i>
                    {{
                      movie.status?.toLowerCase() === "completed"
                        ? movie.episode_current
                        : `${movie.episode_current || "N/A"}/${
                            movie.episode_total || "N/A"
                          }`
                    }}
                  </span>
                  <span>
                    <i class="fas fa-calendar-alt"></i>
                    {{ movie.year || "N/A" }}
                  </span>
                  <span>
                    <i class="fas fa-eye"></i> {{ movie.view || 0 }} Lượt Xem
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="loading-spinner">
          <span>Đang tải thông tin phim...</span>
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
      movie: null, // Ensure movie is initialized as null
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
    translatedStatus() {
      const statusMap = {
        completed: "Hoàn thành",
        ongoing: "Đang chiếu",
      };
      return statusMap[this.movie.status?.toLowerCase()] || "Đang cập nhật";
    },
    circlePercentage() {
      const voteAverage = parseFloat(this.movie.vote_average) || 0;
      return (voteAverage * 10).toFixed(0);
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
        if (res.data && res.data.movie) {
          this.movie = res.data.movie; // Assign the movie data
          this.movieName = res.data.movie.name; // Update movieName
          this.movieType = res.data.movie.type; // Update movieType
          this.episodes = res.data.episodes.map((server) => ({
            ...server,
            server_data: server.server_data.map((episode) => ({
              ...episode,
              slug: episode.slug || episode.filename,
            })),
          }));
          this.updateCurrentEpisode();
        } else {
          console.error("Movie data is missing in the response.");
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
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
  max-width: 1000px;
  height: 500px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out;
}

/* Thông tin phim */
.movie-info {
  text-align: center;
  font-size: 18px;
  margin-top: 10px;
  font-weight: bold;
  color: #fff; /* Orange text */
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
  font-size: 16px;
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

.movie-detail-container {
  display: flex;
  flex-direction: column; /* Stack elements vertically */
  align-items: center; /* Center align content */
  gap: 20px; /* Add spacing between elements */
  margin-top: 20px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  padding: 20px;
  position: relative;
}

.movie-detail-container .overlay {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  z-index: 1;
}

.movie-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  position: relative;
  z-index: 2;
  font-weight: normal; /* Ensure content is not bold */
  color: #ccc; /* Adjust text color for better readability */
}

.movie-thumbnail img {
  width: 100%;
  max-width: 300px; /* Limit the image width */
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.movie-info {
  flex: 1;
  text-align: left;
}

.movie-info h1 {
  font-size: 28px;
  color: #ff6347;
  text-align: center; /* Center align the title */
  margin-bottom: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Add text shadow */
}

.movie-info p {
  margin: 5px 0;
  font-size: 18px; /* Match font size from MovieDetail */
  display: flex;
  align-items: center;
  gap: 10px; /* Add spacing between icon and text */
}

.movie-info i {
  color: #ff6347; /* Match icon color from MovieDetail */
  font-size: 18px;
}

.rating-info {
  display: flex;
  align-items: center;
  justify-content: center; /* Center align the rating info */
  gap: 20px;
  margin-top: 20px;
  font-size: 14px;
  color: #ccc;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-container::after {
  content: "";
  width: 1px;
  height: 40px;
  background-color: white;
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
}

.rating-percentage .circle {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: conic-gradient(#ff6347 0%, #fff 0%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-percentage .circle::before {
  content: "";
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: #1c1c1c;
  border-radius: 50%;
  z-index: 1;
}

.percentage-text {
  position: absolute;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  z-index: 2;
}

.stars-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stars {
  display: flex;
  gap: 2px;
  color: #ffcc00;
}

.stars i {
  font-size: 12px;
}

.rating-text {
  margin: 0;
  font-size: 13px !important;
  color: #ccc !important;
  white-space: nowrap;
}

.additional-info {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #ccc;
}

.additional-info i {
  font-size: 14px;
  color: #ff6347;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .container {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .player-container iframe {
    max-width: 800px;
    height: 450px;
  }

  .movie-info h1 {
    font-size: 32px;
  }

  .movie-info p {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .player-container iframe {
    max-width: 100%;
    height: 300px;
  }

  .movie-info h1 {
    font-size: 24px;
  }

  .movie-info p {
    font-size: 14px;
  }

  .rating-info {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .player-container iframe {
    height: 250px;
  }

  .movie-info h1 {
    font-size: 20px;
  }

  .movie-info p {
    font-size: 12px;
  }

  .rating-info {
    font-size: 12px;
  }

  .additional-info {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
