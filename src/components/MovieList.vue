<template>
  <div class="movie-list-page">
    <MovieNavbar
      :searchKeyword="searchKeyword"
      :genres="genres"
      :countries="countries"
      :showGenreDropdown="showGenreDropdown"
      :showCountryDropdown="showCountryDropdown"
      @toggle-genre-dropdown="toggleGenreDropdown"
      @toggle-country-dropdown="toggleCountryDropdown"
      @load-movies-by-genre="loadMoviesByGenre"
      @load-movies-by-country="loadMoviesByCountry"
      @load-movies-by-type-list="loadMoviesByTypeList"
      @load-movies-by-year="loadMoviesByYear"
    />

    <!-- Filter Section -->
    <div class="filter-section">
      <select v-model="filters.type_list">
        <option value="">--- Hình thức ---</option>
        <option value="phim-bo">Phim Bộ</option>
        <option value="phim-le">Phim Lẻ</option>
        <option value="tv-shows">TV Shows</option>
        <option value="hoat-hinh">Hoạt Hình</option>
        <option value="phim-vietsub">Phim Vietsub</option>
        <option value="phim-thuyet-minh">Phim Thuyết Minh</option>
        <option value="phim-long-tieng">Phim Lồng Tiếng</option>
      </select>

      <select v-model="filters.category">
        <option value="">--- Thể loại ---</option>
        <option v-for="genre in genres" :key="genre.slug" :value="genre.slug">
          {{ genre.name }}
        </option>
      </select>

      <select v-model="filters.country">
        <option value="">--- Quốc gia ---</option>
        <option
          v-for="country in countries"
          :key="country.slug"
          :value="country.slug"
        >
          {{ country.name }}
        </option>
      </select>

      <select v-model="filters.sort_field">
        <option value="">--- Sắp xếp ---</option>
        <option value="modified.time">Thời gian cập nhật</option>
        <option value="_id">ID</option>
        <option value="year">Năm phát hành</option>
      </select>

      <select v-model="filters.sort_type">
        <option value="">--- Tình trạng ---</option>
        <option value="asc">Tăng dần</option>
        <option value="desc">Giảm dần</option>
      </select>

      <select v-model="filters.year">
        <option value="">--- Năm ---</option>
        <option v-for="year in years" :key="year" :value="year">
          {{ year }}
        </option>
      </select>

      <select v-model="filters.sort_lang">
        <option value="">--- Ngôn ngữ ---</option>
        <option value="vietsub">Vietsub</option>
        <option value="thuyet-minh">Thuyết Minh</option>
        <option value="long-tieng">Lồng Tiếng</option>
      </select>

      <div class="button-group">
        <button class="reset-button" @click="resetFilters">Đặt lại</button>
        <button class="filter-button" @click="applyFilters">Lọc phim</button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="loading-spinner">
      <span>Đang tải...</span>
      <div class="spinner"></div>
    </div>

    <!-- Movie List -->
    <div v-else class="movies">
      <div v-for="movie in movies" :key="movie._id" class="movie-card">
        <img
          :src="getMovieImage(movie)"
          alt="Poster"
          @error="handleImageError"
        />
        <div class="hover-overlay">
          <p class="movie-info">
            <strong>Thời lượng:</strong> {{ movie.time || "Đang cập nhật"
            }}<br />
            <strong>Chất lượng:</strong> {{ movie.quality || "Đang cập nhật"
            }}<br />
            <strong>Năm:</strong> {{ movie.year || "Đang cập nhật" }}<br />
            <strong>Trạng thái:</strong> {{ translateStatus(movie.status) }}
          </p>
          <router-link :to="`/movie/${movie.slug}`" class="watch-button">
            Xem phim
          </router-link>
        </div>
        <h3>{{ movie.name }}</h3>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="changePage(1)" :disabled="currentPage === 1">Đầu</button>
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="changePage(page)"
        :class="{ active: currentPage === page }"
      >
        {{ page }}
      </button>
      <button
        @click="changePage(totalPages)"
        :disabled="currentPage === totalPages"
      >
        Cuối
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import MovieNavbar from "./Navbar.vue";

export default {
  components: { MovieNavbar },
  data() {
    return {
      movies: [],
      genres: [],
      countries: [],
      searchKeyword: "",
      currentPage: 1,
      totalPages: 1,
      isLoading: true,
      showGenreDropdown: false,
      showCountryDropdown: false,
      apiUrl: "", // Dynamically updated API URL
      filters: {
        type_list: "",
        sort_field: "",
        sort_type: "",
        sort_lang: "",
        category: "",
        country: "",
        year: "",
      },
      years: Array.from(
        { length: new Date().getFullYear() - 1970 + 1 },
        (_, i) => 1970 + i
      ),
    };
  },
  mounted() {
    this.scrollToTop(); // Scroll to top when the component is mounted
    this.fetchGenres();
    this.fetchCountries();
    const apiUrl = this.$store.state.apiUrl; // Lấy API URL từ Vuex store
    if (apiUrl) {
      this.apiUrl = apiUrl;
      this.loadMoviesByFilter(this.apiUrl, 1);
    } else {
      this.apiUrl = "https://phimapi.com/danh-sach/phim-moi-cap-nhat";
      this.fetchMovies(1);
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.scrollToTop(); // Scroll to top when the route changes
        const apiUrl = this.$store.state.apiUrl; // Retrieve API URL from Vuex store
        if (apiUrl) {
          this.apiUrl = apiUrl;
          this.loadMoviesByFilter(this.apiUrl, 1);
        } else {
          this.apiUrl =
            "https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=1";
          this.fetchMovies(1);
        }
      },
    },
    isLoading(newValue) {
      this.$emit("loading", newValue); // Emit loading state to parent
    },
    // Thêm watcher để theo dõi sự thay đổi của apiUrl trong Vuex store
    "$store.state.apiUrl": {
      immediate: true,
      handler(newApiUrl) {
        if (newApiUrl && newApiUrl !== this.apiUrl) {
          this.apiUrl = newApiUrl;
          this.loadMoviesByFilter(this.apiUrl, 1); // Tải lại danh sách phim
        }
      },
    },
  },
  computed: {
    visiblePages() {
      const pages = [];
      const totalVisible = 5; // Always show 5 page numbers
      const halfVisible = Math.floor(totalVisible / 2);

      let start = Math.max(1, this.currentPage - halfVisible);
      let end = Math.min(this.totalPages, this.currentPage + halfVisible);

      // Adjust start and end if there are fewer than 5 pages
      if (end - start + 1 < totalVisible) {
        if (start === 1) {
          end = Math.min(this.totalPages, start + totalVisible - 1);
        } else if (end === this.totalPages) {
          start = Math.max(1, end - totalVisible + 1);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },
  methods: {
    async fetchGenres() {
      try {
        const response = await axios.get("https://phimapi.com/the-loai");
        this.genres = response.data || [];
      } catch (error) {
        // ...existing code...
      }
    },

    async fetchCountries() {
      try {
        const response = await axios.get("https://phimapi.com/quoc-gia");
        this.countries = response.data || [];
      } catch (error) {
        // ...existing code...
      }
    },

    async loadMoviesByTypeList(apiUrl) {
      this.apiUrl = apiUrl; // Update API URL dynamically
      this.loadMoviesByFilter(apiUrl, 1);
    },

    async loadMoviesByYear(apiUrl) {
      this.apiUrl = apiUrl; // Update API URL dynamically
      this.loadMoviesByFilter(apiUrl, 1);
    },

    async loadMoviesByGenre(apiUrl) {
      this.apiUrl = apiUrl; // Update API URL dynamically
      this.loadMoviesByFilter(apiUrl, 1);
    },

    async loadMoviesByCountry(apiUrl) {
      this.apiUrl = apiUrl; // Update API URL dynamically
      this.loadMoviesByFilter(apiUrl, 1);
    },

    async searchMovies(keyword) {
      if (keyword.trim() === "") {
        this.apiUrl = "https://phimapi.com/danh-sach/phim-moi-cap-nhat";
        this.fetchMovies(1);
        return;
      }
      const encodedKeyword = encodeURIComponent(keyword.trim());
      this.apiUrl = `https://phimapi.com/v1/api/tim-kiem?keyword=${encodedKeyword}`;
      this.loadMoviesByFilter(this.apiUrl, 1);
    },

    async fetchMovies(page = 1) {
      this.isLoading = true;
      try {
        const response = await axios.get(
          `${this.apiUrl}${this.apiUrl.includes("?") ? "&" : "?"}page=${page}`
        ); // Append page parameter dynamically
        this.movies = response.data?.items || response.data?.data?.items || [];
        this.movies = this.movies.map((movie) => ({
          ...movie,
          type: movie.type === "hoathinh" ? "anime" : movie.type, // Convert "hoathinh" to "anime"
        }));
        this.totalPages =
          response.data?.pagination?.totalPages ||
          response.data?.data?.params?.pagination?.totalPages ||
          1;
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async loadMoviesByFilter(apiUrl, page = 1) {
      this.isLoading = true;
      try {
        const response = await axios.get(
          `${apiUrl}${apiUrl.includes("?") ? "&" : "?"}page=${page}`
        ); // Append page parameter dynamically
        this.movies = response.data?.data?.items || [];
        this.totalPages =
          response.data?.data?.params?.pagination?.totalPages || 1;
        this.currentPage = page;
      } catch (error) {
        console.error("Lỗi khi tải danh sách phim theo bộ lọc:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async applyFilters() {
      const {
        type_list,
        sort_field,
        sort_type,
        sort_lang,
        category,
        country,
        year,
      } = this.filters;
      const queryParams = new URLSearchParams({
        page: this.currentPage,
        sort_field,
        sort_type,
        sort_lang,
        category,
        country,
        year,
        limit: 10,
      }).toString();

      const apiUrl = `https://phimapi.com/v1/api/danh-sach/${type_list}?${queryParams}`;
      this.loadMoviesByFilter(apiUrl, 1);
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPage)
        return;
      this.currentPage = page;
      this.fetchMovies(page); // Ensure the correct page is fetched
    },

    toggleGenreDropdown() {
      this.showGenreDropdown = !this.showGenreDropdown;
    },

    toggleCountryDropdown() {
      this.showCountryDropdown = !this.showCountryDropdown;
    },

    getMovieImage(movie) {
      if (movie.poster_url) {
        if (movie.poster_url.startsWith("upload")) {
          return `https://phimimg.com/${movie.poster_url}`;
        }
        return movie.poster_url;
      }
      return "https://placehold.it/150x150";
    },

    handleImageError(event) {
      event.target.src = "https://placehold.it/150x150";
    },

    resetFilters() {
      this.filters = {
        type_list: "",
        sort_field: "",
        sort_type: "",
        sort_lang: "",
        category: "",
        country: "",
        year: "",
      };
      this.fetchMovies(1);
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    translateStatus(status) {
      const statusMap = {
        completed: "Hoàn thành",
        ongoing: "Đang chiếu",
      };
      return statusMap[status?.toLowerCase()] || "Đang cập nhật";
    },

    redirectToMovieList(apiUrl) {
      if (apiUrl) {
        const updatedApiUrl = apiUrl.replace("hoathinh", "anime"); // Replace "hoathinh" with "anime" in the URL
        this.$store.commit("setApiUrl", updatedApiUrl);
        this.$router.push({ path: "/movies" });
      }
    },
  },
};
</script>

<style scoped>
.movie-list-page {
  background-color: #1c1c1c; /* Light gray background */
  color: white; /* White text color */
  min-height: 100vh; /* Ensure the page covers the full viewport height */
  padding: 20px;
}

.movies {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px auto;
  padding-top: 20px;
  max-width: 1200px;
}

.movie-card {
  position: relative;
  background-color: #1c1c1c; /* Black background */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.movie-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
}

.movie-card img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-bottom: 2px solid #ff6347; /* Add a bottom border for better separation */
}

.movie-card h3 {
  font-size: 16px; /* Increase font size */
  font-weight: bold; /* Make the title bold */
  color: white;
  text-align: center;
  margin: 10px 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  transition: color 0.3s, transform 0.3s; /* Add hover effects */
}

.movie-card:hover h3 {
  color: #ff6347; /* Change color on hover */
  transform: scale(1.05); /* Slight scale effect */
}

.movie-card .hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent black */
  opacity: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;
}

.movie-card:hover .hover-overlay {
  opacity: 1; /* Show overlay on hover */
}

.movie-card .hover-overlay .movie-info {
  color: white;
  font-size: 14px;
  text-align: center;
  margin-bottom: 10px;
}

.movie-card .hover-overlay .watch-button {
  font-size: 14px;
  color: white;
  background-color: rgba(255, 99, 71, 0.9); /* Match homepage button color */
  padding: 10px 20px;
  border-radius: 8px;
  text-transform: uppercase;
  font-weight: bold;
  text-decoration: none;
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  position: relative;
  overflow: hidden;
}

.movie-card .hover-overlay .watch-button::before {
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

.movie-card .hover-overlay .watch-button:hover::before {
  left: 100%;
}

.movie-card .hover-overlay .watch-button:hover {
  background-color: rgba(255, 99, 71, 1); /* Match hover color */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
  transform: scale(1.05); /* Slight scale effect */
}

/* Filter Section */
.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 20px auto;
  padding: 15px 20px;
  background-color: #1c1c1c;
  max-width: 100%;
  flex-wrap: nowrap;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
}

.filter-section select {
  padding: 8px 25px 8px 10px;
  border: 1px solid #333;
  border-radius: 5px;
  background-color: #1c1c1c;
  color: #999;
  cursor: pointer;
  flex: 1;
  min-width: 120px;
  max-width: 160px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
  font-size: 14px;
}

.filter-section select:focus {
  outline: none;
  border-color: #ff6347;
}

.filter-section select option {
  background-color: #1c1c1c;
  color: #999;
  padding: 8px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-left: 0;
}

.reset-button {
  padding: 12px 25px;
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 14px;
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  position: relative;
  overflow: hidden;
}

.reset-button::before {
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

.reset-button:hover::before {
  left: 100%;
}

.reset-button:hover {
  background-color: #444;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
  transform: scale(1.05); /* Slight scale effect */
}

.filter-button {
  padding: 12px 25px;
  background-color: #c41e3a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 14px;
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  position: relative;
  overflow: hidden;
}

.filter-button::before {
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

.filter-button:hover::before {
  left: 100%;
}

.filter-button:hover {
  background-color: #a01830;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
  transform: scale(1.05); /* Slight scale effect */
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .filter-section {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .filter-section select {
    flex: 1 1 calc(25% - 10px);
    max-width: calc(25% - 10px);
  }

  .button-group {
    flex: 1 1 100%;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .movies {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .movie-card img {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    padding: 10px;
  }

  .filter-section select {
    max-width: 100%;
    width: 100%;
  }

  .button-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    margin-top: 10px;
  }

  .reset-button,
  .filter-button {
    width: 100%;
  }

  .movies {
    grid-template-columns: repeat(2, 1fr); /* Display 2 movies per row */
  }

  .movie-card img {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .movies {
    grid-template-columns: repeat(2, 1fr); /* Display 2 movies per row */
  }

  .movie-card img {
    height: 300px;
  }

  .movie-card h3 {
    font-size: 12px;
  }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
  gap: 10px;
}

.pagination button {
  padding: 10px 15px;
  border: 1px solid #ff6347; /* Orange border */
  border-radius: 5px;
  background-color: #1c1c1c; /* Black background */
  color: white;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
}

.pagination button.active {
  background-color: #ff6347; /* Orange background */
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.pagination button:hover:not(.active) {
  background-color: #e03e2d; /* Darker orange */
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
}

.pagination button:disabled {
  background-color: #333; /* Dark gray */
  color: #aaa;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Loading Spinner */
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

.episode-list-container {
  max-height: 400px; /* Set maximum height for the container */
  overflow-y: auto; /* Add vertical scroll if content exceeds max height */
  padding: 10px;
  background-color: #2c2c2c; /* Background color for the container */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
}

/* Custom scrollbar styling */
.episode-list-container::-webkit-scrollbar {
  width: 8px; /* Width of the scrollbar */
}

.episode-list-container::-webkit-scrollbar-thumb {
  background-color: #ff6347; /* Color of the scrollbar thumb */
  border-radius: 4px; /* Rounded corners for the thumb */
}

.episode-list-container::-webkit-scrollbar-thumb:hover {
  background-color: #e03e2d; /* Darker color on hover */
}

.episode-list-container::-webkit-scrollbar-track {
  background-color: #333; /* Background color of the scrollbar track */
  border-radius: 4px; /* Rounded corners for the track */
}
</style>
