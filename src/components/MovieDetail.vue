<template>
  <div class="movie-detail-page">
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
    <!-- Breadcrumb navigation -->
    <nav class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span>/</span>
      <router-link
        v-if="!isLoading && movie.type"
        :to="`/movies?type=${movie.type}`"
      >
        {{ translatedType }}
      </router-link>
      <span v-else>Đang tải...</span>
      <span>/</span>
      <span>{{ movie.name }}</span>
    </nav>
    <div v-if="isLoading" class="loading-spinner">
      <span>Đang tải...</span>
      <div class="spinner"></div>
    </div>
    <div v-else class="container">
      <div class="left-section">
        <div
          class="movie-detail-container"
          :style="{ backgroundImage: `url(${movie.thumb_url})` }"
        >
          <div class="overlay"></div>
          <div class="movie-content">
            <div class="movie-thumbnail">
              <img :src="movie.poster_url" alt="Thumbnail" loading="lazy" />
              <router-link
                :to="{
                  name: 'MoviePlayer',
                  params: { slug: movie.slug, episodeSlug: 'tap-01' },
                }"
                class="play-button"
              >
                <i class="fas fa-play"></i>
              </router-link>
            </div>
            <div class="movie-info">
              <h1 style="font-size: 40px">{{ movie.name }}</h1>
              <p>
                <i class="fas fa-film"></i>
                <strong>Tên khác:</strong>
                {{ movie.origin_name || "Đang cập nhật" }}
              </p>
              <p>
                <i class="fas fa-info-circle"></i>
                <strong>Trạng thái:</strong>
                {{ translatedStatus }}
              </p>
              <p>
                <i class="fas fa-list-ol"></i>
                <strong>Số tập:</strong>
                {{ movie.episode_total || "Đang cập nhật" }}
              </p>
              <p>
                <i class="fas fa-clock"></i>
                <strong>Thời lượng:</strong> {{ movie.time || "Đang cập nhật" }}
              </p>
              <p>
                <i class="fas fa-calendar-alt"></i>
                <strong>Năm phát hành:</strong>
                {{ movie.year || "Đang cập nhật" }}
              </p>
              <p>
                <i class="fas fa-video"></i>
                <strong>Chất lượng:</strong>
                {{ movie.quality || "Đang cập nhật" }}
              </p>
              <p>
                <i class="fas fa-language"></i>
                <strong>Ngôn ngữ:</strong> {{ movie.lang || "Đang cập nhật" }}
              </p>
              <p>
                <i class="fas fa-tags"></i>
                <strong>Thể loại:</strong>
                <span
                  v-for="category in movie.category"
                  :key="category.id"
                  class="category-tag"
                  @click="
                    $router.push({
                      path: '/movies',
                      query: {
                        filter: `https://phimapi.com/v1/api/the-loai/${category.slug}?page=1`,
                      },
                    })
                  "
                >
                  {{ category.name }}
                </span>
              </p>
              <p>
                <i class="fas fa-globe"></i>
                <strong>Quốc gia:</strong>
                <span
                  v-for="country in movie.country"
                  :key="country.id"
                  class="country-tag"
                  @click="
                    $router.push({
                      path: '/movies',
                      query: {
                        filter: `https://phimapi.com/v1/api/quoc-gia/${country.slug}?page=1`,
                      },
                    })
                  "
                >
                  {{ country.name }}
                </span>
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
                      <span class="percentage-text">
                        {{ circlePercentage }}%
                      </span>
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
        <div class="movie-description-tabs">
          <div class="tabs">
            <button
              class="tab-button"
              :class="{ active: activeTab === 'description' }"
              @click="activeTab = 'description'"
            >
              <i class="fas fa-info-circle"></i> Giới thiệu
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'trailer' }"
              @click="activeTab = 'trailer'"
            >
              <i class="fas fa-video"></i> Trailer
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'characters' }"
              @click="activeTab = 'characters'"
            >
              <i class="fas fa-users"></i> Diễn viên
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'directors' }"
              @click="activeTab = 'directors'"
            >
              <i class="fas fa-user-tie"></i> Đạo diễn
            </button>
          </div>
          <div class="tab-content">
            <div v-if="activeTab === 'description'" class="description-tab">
              <h3>Giới thiệu</h3>
              <p>{{ movie.content || "Đang cập nhật" }}</p>
            </div>
            <div v-if="activeTab === 'trailer'" class="trailer-tab">
              <h3>Trailer</h3>
              <iframe
                v-if="embeddedTrailerUrl"
                :src="embeddedTrailerUrl"
                frameborder="0"
                allowfullscreen
                class="trailer-iframe"
              ></iframe>
              <p v-else>Trailer hiện chưa có sẵn.</p>
            </div>
            <div v-if="activeTab === 'characters'" class="characters-tab">
              <h3>Nhân vật</h3>
              <p>
                <span
                  v-if="movie.actor && movie.actor.length > 0"
                  class="actor-list"
                >
                  {{ movie.actor.join(", ") }}
                </span>
                <span v-else>Đang cập nhật</span>
              </p>
            </div>
            <div v-if="activeTab === 'directors'" class="directors-tab">
              <h3>Đạo diễn</h3>
              <p>
                <span
                  v-if="movie.director && movie.director.length > 0"
                  class="director-list"
                >
                  {{ movie.director.join(", ") }}
                </span>
                <span v-else>Đang cập nhật</span>
              </p>
            </div>
          </div>
        </div>
        <EpisodeList :episodes="episodes" @episode-click="handleEpisodeClick" />
      </div>
      <RightSection
        :newMovies="newMovies"
        @redirect="redirectToMovieListWithoutApi"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import MovieNavbar from "./Navbar.vue";
import RightSection from "./RightSection.vue";
import EpisodeList from "./EpisodeList.vue";

export default {
  components: {
    EpisodeList,
    RightSection,
    MovieNavbar,
  },
  data() {
    return {
      movie: {},
      episodes: [], // Episodes grouped by server
      isLoading: true,
      genres: [],
      countries: [],
      showGenreDropdown: false,
      showCountryDropdown: false,
      newMovies: [], // Add newMovies for RightSection
      activeTab: "description", // Default to "Giới thiệu" tab
    };
  },
  mounted() {
    this.scrollToTop(); // Scroll to top when the component is mounted
    this.fetchMovieDetails();
    this.fetchGenres();
    this.fetchCountries();
    this.fetchNewMovies(); // Fetch new movies for RightSection
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.scrollToTop(); // Scroll to top when the route changes
        this.fetchMovieDetails();
      },
    },
  },
  computed: {
    embeddedTrailerUrl() {
      if (!this.movie.trailer_url) return null;
      try {
        const url = new URL(this.movie.trailer_url);
        if (
          url.hostname.includes("youtube.com") ||
          url.hostname.includes("youtu.be")
        ) {
          const videoId =
            url.searchParams.get("v") || url.pathname.split("/").pop();
          return `https://www.youtube.com/embed/${videoId}`;
        }
        return this.movie.trailer_url; // Return as-is for other platforms
      } catch {
        return null; // Invalid URL
      }
    },
    circleBorderColor() {
      const percentage = this.movie.vote_average * 10;
      if (percentage >= 75) {
        return "#4caf50"; // Green
      } else if (percentage >= 50) {
        return "#ffeb3b"; // Yellow
      } else {
        return "#f44336"; // Red
      }
    },
    circlePercentage() {
      const voteAverage = parseFloat(this.movie.vote_average) || 0; // Ensure vote_average is a number or default to 0
      return (voteAverage * 10).toFixed(0); // Calculate percentage and default to 0
    },
    translatedStatus() {
      const statusMap = {
        completed: "Hoàn thành",
        ongoing: "Đang chiếu",
      };
      return statusMap[this.movie.status?.toLowerCase()] || "Đang cập nhật"; // Default to "Đang cập nhật" if status is not found
    },
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
      return typeMap[this.movie.type] || "Danh sách phim";
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
        const response = await axios.get(`https://phimapi.com/phim/${slug}`);
        if (response.data && response.data.movie) {
          this.movie = {
            ...response.data.movie,
            type: response.data.movie.type || "unknown", // Ensure type is set
          };
          this.episodes = response.data.episodes.map((server) => ({
            ...server,
            server_data: server.server_data.map((episode) => ({
              ...episode,
              slug: episode.slug || episode.filename, // Ensure slug is correctly handled
            })),
          }));
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
    playEpisode(slug, linkEmbed) {
      if (linkEmbed) {
        this.$router.push({
          name: "MoviePlayer",
          params: { slug: this.movie.slug, episodeSlug: slug },
        });
      } else {
        alert("Không thể phát tập này.");
      }
    },
    redirectToMovieList(apiUrl) {
      if (apiUrl) {
        const updatedApiUrl = apiUrl.replace("hoathinh", "anime"); // Replace "hoathinh" with "anime" in the URL
        this.$store.commit("setApiUrl", updatedApiUrl);
        this.$router.push({ path: "/movies" });
      }
    },
    redirectToMovieListWithoutApi() {
      this.$router.push({ path: "/movies" });
    },
    handleEpisodeClick(episode) {
      this.$router.push({
        name: "MoviePlayer",
        params: { slug: this.movie.slug },
        query: { episodeSlug: episode.slug },
      });
    },
  },
};
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 8fr 4fr; /* Left section 8 rows, right section 4 rows */
  gap: 20px;
  max-width: 1450px;
}

.left-section {
  flex: 2;
}

.right-section {
  flex: 1;
}

.movie-detail-page {
  background-color: #1c1c1c;
  color: white;
  min-height: 100vh;
  padding: 20px;
}

.movie-detail-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  background-size: cover; /* Ensure the background image covers the container */
  background-position: center; /* Center the background image */
  background-repeat: no-repeat; /* Prevent background repetition */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  padding: 20px;
  position: relative; /* Ensure child elements are positioned relative to this container */
}

.movie-detail-container .overlay {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(
    0,
    0,
    0,
    0.6
  ); /* Add a dark overlay for better text visibility */
  border-radius: 8px;
  z-index: 1; /* Ensure the overlay is above the background but below the content */
}

.movie-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  position: relative;
  z-index: 2; /* Ensure content is above the overlay */
}

.movie-thumbnail {
  position: relative;
}

.movie-thumbnail img {
  width: 300px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
}

.movie-thumbnail .play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
  text-decoration: none; /* Remove underline */
}

.movie-thumbnail .play-button:hover {
  background-color: rgba(255, 99, 71, 0.9);
  transform: translate(-50%, -50%) scale(1.1);
}

.movie-thumbnail .play-button i {
  pointer-events: none;
}

.movie-info {
  flex: 1;
  text-align: left;
}

.movie-info h1 {
  font-size: 28px;
  color: #ff6347;
  margin-bottom: 10px;
  text-align: left;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Text shadow for modern look */
}

.movie-info p {
  margin: 5px 0;
  font-size: 18px; /* Increased font size for movie information */
  text-align: left;
  display: flex;
  align-items: center; /* Align icon and text */
  gap: 10px; /* Add spacing between icon and text */
  flex-wrap: wrap; /* Allow wrapping for long content */
}

.movie-info i {
  color: #ff6347; /* Updated icon color */
  font-size: 18px; /* Icon size */
}

.actor-list {
  white-space: normal; /* Allow text to wrap properly */
  word-break: break-word; /* Break long words if necessary */
}

.category-tag,
.country-tag {
  display: inline-block;
  background-color: #ff6347;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  margin-left: 10px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  transition: box-shadow 0.3s, transform 0.3s;
}

.category-tag:hover,
.country-tag:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
  transform: scale(1.05); /* Slight scale effect */
}

.watch-button {
  display: inline-block;
  margin-top: 15px;
  padding: 12px 25px;
  background-color: #ff6347;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  position: relative;
  overflow: hidden;
}

.watch-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transform: skewX(-45deg);
  transition: left 0.5s ease;
}

.watch-button:hover::before {
  left: 100%;
}

.watch-button:hover {
  background-color: #e03e2d;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
  transform: scale(1.05); /* Slight scale effect */
}

.movie-description {
  margin-top: 20px;
  padding: 15px;
  background-color: #2c2c2c;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
}

.movie-description h3 {
  margin-bottom: 10px;
  color: #ff6347;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Text shadow for modern look */
}

.episode-list-container {
  margin-top: 20px;
  max-height: 400px; /* Set maximum height for the container */
  overflow-y: auto; /* Add vertical scroll if content exceeds max height */
  padding: 10px;
  background-color: #2c2c2c; /* Background color for the container */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
}

.episode-list {
  margin-top: 20px;
}

.server h4 {
  margin-bottom: 10px;
  color: #ff6347;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Text shadow for modern look */
}

.episode-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.episode-button {
  padding: 10px 15px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
}

.episode-button:hover {
  background-color: #ff6347;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
  transform: scale(1.05); /* Slight scale effect */
}

.movie-description-tabs {
  margin-top: 20px;
  background-color: #2c2c2c;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  padding: 15px;
}

.tabs {
  display: flex;
  justify-content: flex-start; /* Align tabs to the left */
  margin-bottom: 20px;
  gap: 10px; /* Add spacing between buttons */
}

.tab-button {
  padding: 10px 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px; /* Add spacing between icon and text */
  transition: background-color 0.3s, transform 0.3s;
}

.tab-button.active {
  background-color: #ff6347;
  transform: scale(1.05);
}

.tab-button:hover {
  background-color: #e03e2d;
}

.tab-content {
  text-align: left; /* Align content to the left */
}

.description-tab h3,
.trailer-tab h3,
.characters-tab h3 {
  color: #ff6347;
  margin-bottom: 10px;
}

.trailer-tab {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content horizontally */
  justify-content: center; /* Center content vertically */
}

.trailer-iframe {
  width: 100%;
  max-width: 800px;
  height: 450px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  margin: 0 auto; /* Ensure the iframe is centered */
}

.actor-list {
  white-space: normal;
  word-break: break-word;
}

.rating-info {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 20px;
  padding: 0;
  color: white;
  gap: 20px; /* Adjust spacing */
  font-family: "Arial", sans-serif; /* Match font */
  font-size: 14px; /* Keep font size unchanged for rating-info */
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 10px; /* Reduce spacing */
  position: relative;
}

.rating-container::after {
  content: "";
  width: 1px;
  height: 40px; /* Adjust height to match the content */
  background-color: white;
  position: absolute;
  right: -10px; /* Position the divider */
  top: 50%;
  transform: translateY(-50%);
}

.rating-percentage .circle {
  position: relative;
  width: 50px; /* Adjust size */
  height: 50px; /* Adjust size */
  border-radius: 50%;
  background: conic-gradient(#ff6347 0%, #fff 0%); /* Default gradient */
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-percentage .circle::before {
  content: "";
  position: absolute;
  width: 40px; /* Inner transparent circle size */
  height: 40px;
  background-color: #1c1c1c; /* Match background color for transparency effect */
  border-radius: 50%;
  z-index: 1;
}

.percentage-text {
  position: absolute;
  font-size: 14px; /* Adjust font size */
  font-weight: bold;
  color: #fff;
  z-index: 2;
}

.stars-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px; /* Reduce gap between stars and text */
}

.stars {
  display: flex;
  gap: 2px; /* Reduce spacing between stars */
  color: #ffcc00; /* Star color */
}

.stars i {
  font-size: 12px; /* Smaller star size */
}

.rating-text {
  margin: 0;
  font-size: 13px !important; /* Force smaller text size */
  color: #ccc !important;
  white-space: nowrap; /* Prevent text wrapping */
}

.additional-info {
  display: flex;
  gap: 15px; /* Adjust spacing */
  font-size: 14px; /* Adjust font size */
  color: #ccc; /* Match text color */
}

.additional-info i {
  font-size: 14px;
  color: #ff6347; /* Match icon color */
}

.directors-tab {
  text-align: left;
}

.director-list {
  white-space: normal;
  word-break: break-word;
}

.directors-tab h3 {
  color: #ff6347; /* Ensure the header uses the correct color */
  margin-bottom: 10px;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .container {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .movie-thumbnail img {
    width: 250px;
  }

  .movie-info h1 {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .movie-thumbnail img {
    width: 200px;
  }

  .movie-info h1 {
    font-size: 24px;
  }

  .movie-info p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .movie-info h1 {
    font-size: 20px;
  }

  .movie-info p {
    font-size: 12px;
  }
}

.breadcrumb {
  margin-top: 30px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  background: #1c1c1c;
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
  color: #e03e2d;
}
</style>
