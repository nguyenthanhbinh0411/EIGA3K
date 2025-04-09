<template>
  <div class="homepage">
    <div v-if="isLoading" class="loading-spinner">
      <span>Đang tải...</span>
      <div class="spinner"></div>
    </div>
    <div v-else class="container">
      <!-- Anime Mới Section -->
      <section class="movie-section">
        <div class="section-header">
          <h2>Anime Mới</h2>
          <button @click="redirectToMovieList(animeApiUrl)" class="view-more">
            Xem thêm
          </button>
        </div>
        <div class="movie-slider" ref="phimMoiSlider">
          <div v-for="movie in animeMovies" :key="movie._id" class="movie-card">
            <div class="movie-thumbnail">
              <img
                :src="getMovieImage(movie)"
                alt="Poster"
                @error="handleImageError"
              />
              <div class="hover-overlay">
                <p class="movie-info">
                  <strong>Thời lượng:</strong>
                  {{ movie.time || "Đang cập nhật" }}<br />
                  <strong>Chẩt lượng:</strong>
                  {{ movie.quality || "Đang cập nhật" }}<br />
                  <strong>Ngôn ngữ:</strong>
                  {{ movie.lang || "Đang cập nhật" }}
                </p>
                <router-link :to="`/movie/${movie.slug}`" class="watch-overlay">
                  Xem phim
                </router-link>
              </div>
            </div>
            <h3 class="movie-title">{{ movie.name }}</h3>
          </div>
        </div>
      </section>

      <div class="main-content">
        <!-- Left Section: 7 Rows -->
        <div class="left-section">
          <section
            v-for="(section, index) in sections.slice(1)"
            :key="index"
            class="movie-section"
          >
            <div class="section-header">
              <h2>{{ section.title }}</h2>
              <button
                @click="redirectToMovieList(section.apiUrl)"
                class="view-more"
              >
                Xem thêm
              </button>
            </div>
            <div class="movie-grid">
              <div
                v-for="movie in section.movies.slice(0, 10)"
                :key="movie._id"
                class="movie-card"
              >
                <div class="movie-thumbnail">
                  <img
                    :src="getMovieImage(movie)"
                    alt="Poster"
                    @error="handleImageError"
                  />
                  <div class="hover-overlay">
                    <p class="movie-info">
                      <strong>Thời lượng:</strong>
                      {{ movie.time || "Đang cập nhật" }}<br />
                      <strong>Chẩt lượng:</strong>
                      {{ movie.quality || "Đang cập nhật" }}<br />
                      <strong>Ngôn ngữ:</strong>
                      {{ movie.lang || "Đang cập nhật" }}
                    </p>
                    <router-link
                      :to="`/movie/${movie.slug}`"
                      class="watch-overlay"
                    >
                      Xem phim
                    </router-link>
                  </div>
                </div>
                <h3 class="movie-title">{{ movie.name }}</h3>
              </div>
            </div>
          </section>
        </div>

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
import RightSection from "@/components/RightSection.vue";

export default {
  name: "HomePage",
  components: {
    RightSection,
  },
  data() {
    return {
      isLoading: true,
      sections: [
        {
          title: "Anime Mới",
          apiUrl: "https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=1",
          movies: [],
        },
        {
          title: "Phim Hoa Ngữ",
          apiUrl: "https://phimapi.com/v1/api/quoc-gia/trung-quoc?page=1",
          movies: [],
        },
        {
          title: "Phim Hành Động",
          apiUrl: "https://phimapi.com/v1/api/the-loai/hanh-dong?page=1",
          movies: [],
        },
        {
          title: "Phim Lẻ",
          apiUrl: "https://phimapi.com/v1/api/danh-sach/phim-le?page=1",
          movies: [],
        },
      ],
      animeApiUrl: "https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=1",
      animeMovies: [],
      newMoviesApiUrl:
        "https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=1",
      newMovies: [],
    };
  },
  methods: {
    async fetchMovies() {
      this.isLoading = true;
      for (const section of this.sections) {
        try {
          const response = await axios.get(section.apiUrl);
          section.movies =
            response.data?.items || response.data?.data?.items || [];
        } catch (error) {
          console.error(`Lỗi khi tải dữ liệu cho ${section.title}:`, error);
        }
      }
      try {
        const animeResponse = await axios.get(this.animeApiUrl);
        this.animeMovies =
          animeResponse.data?.items || animeResponse.data?.data?.items || [];
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu cho Phim Anime:", error);
      }
      try {
        const newMoviesResponse = await axios.get(this.newMoviesApiUrl);
        this.newMovies =
          newMoviesResponse.data?.items ||
          newMoviesResponse.data?.data?.items ||
          [];
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu cho Phim Mới:", error);
      }
      this.isLoading = false;
    },
    redirectToMovieList(apiUrl) {
      if (apiUrl) {
        this.$router.push({ path: "/movies", query: { filter: apiUrl } });
      } else {
        console.error("API URL is undefined.");
      }
    },
    redirectToMovieListWithoutApi() {
      this.$router.push({ path: "/movies" });
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
    scrollLeft(sliderRef) {
      const slider = this.$refs[sliderRef];
      if (slider && slider.scrollBy) {
        slider.scrollBy({ left: -300, behavior: "smooth" });
      } else if (slider) {
        slider.scrollLeft -= 300;
      }
    },
    scrollRight(sliderRef) {
      const slider = this.$refs[sliderRef];
      if (slider && slider.scrollBy) {
        slider.scrollBy({ left: 300, behavior: "smooth" });
      } else if (slider) {
        slider.scrollLeft += 300;
      }
    },
    autoScrollSlider(sliderRef) {
      const slider = this.$refs[sliderRef];
      if (slider && slider.scrollBy) {
        setInterval(() => {
          slider.scrollBy({ left: 300, behavior: "smooth" });
        }, 3000);
      }
    },
  },
  mounted() {
    this.fetchMovies();
    this.autoScrollSlider("phimMoiSlider");
  },
};
</script>

<style scoped>
.homepage {
  padding: 20px;
  padding-top: 60px;
  background-color: #1c1c1c;
  color: white;
  display: flex;
  justify-content: center;
}

.container {
  max-width: 1310px;
  width: 100%;
}

.main-content {
  display: flex;
  gap: 20px;
}

.left-section {
  flex: 2;
}

.movie-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  color: #ff6347;
}

.section-header .view-more {
  font-size: 14px;
  color: white;
  background-color: #ff6347;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  position: relative;
  overflow: hidden;
}

.section-header .view-more::before {
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

.section-header .view-more:hover::before {
  left: 100%;
}

.section-header .view-more:hover {
  background-color: #e03e2d;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
  transform: scale(1.05); /* Slight scale effect */
}

.movie-slider {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 10px;
}

.movie-slider::-webkit-scrollbar {
  display: none;
}

.movie-card {
  flex: 0 0 auto;
  width: 150px;
  background-color: #1c1c1c;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.movie-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
}

.movie-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-bottom: 2px solid #ff6347; /* Add a bottom border for better separation */
}

.movie-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-thumbnail:hover img {
  transform: scale(1.05); /* Slight zoom effect on hover */
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  opacity: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;
}

.movie-thumbnail:hover .hover-overlay {
  opacity: 1;
}

.movie-info {
  color: white;
  font-size: 14px;
  text-align: center;
  margin-bottom: 10px;
}

.watch-overlay {
  font-size: 14px;
  color: white;
  background-color: rgba(255, 99, 71, 0.9);
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

.watch-overlay::before {
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

.watch-overlay:hover::before {
  left: 100%;
}

.watch-overlay:hover {
  background-color: rgba(255, 99, 71, 1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
  transform: scale(1.05); /* Slight scale effect */
}

.movie-title {
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

.movie-title:hover {
  color: #ff6347; /* Change color on hover */
  transform: scale(1.05); /* Slight scale effect */
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1c1c1c;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.spinner {
  border: 4px solid #a3a0a0;
  border-top: 4px solid #ff6347;
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

.anime-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.anime-card {
  display: flex;
  align-items: flex-start;
  background-color: #1c1c1c;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  padding: 10px;
}

.anime-card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.anime-thumbnail {
  width: 120px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  cursor: pointer;
}

.anime-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.anime-thumbnail:hover img {
  transform: scale(1.05);
}

.pause-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: white;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.anime-thumbnail:hover .pause-icon {
  opacity: 1;
}

.anime-details {
  flex: 1;
  margin-left: 15px;
  color: white;
  font-size: 14px;
  line-height: 1.6;
}

.anime-title {
  font-size: 18px;
  font-weight: bold;
  color: #ff7043;
  margin-bottom: 10px;
}

.anime-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #cccccc;
}

.anime-info i {
  margin-right: 8px;
  color: #ff7043;
}

.anime-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.anime-tag {
  background-color: #ff7043;
  color: white;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 15px;
  font-weight: bold;
  text-transform: capitalize;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.anime-tag:hover {
  background-color: #e03e2d;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin: 20px 0;
}

.movie-card {
  background-color: #1c1c1c;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.movie-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
}

.movie-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-bottom: 2px solid #ff6347; /* Add a bottom border for better separation */
}

.movie-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-thumbnail:hover img {
  transform: scale(1.05); /* Slight zoom effect on hover */
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  opacity: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;
}

.movie-thumbnail:hover .hover-overlay {
  opacity: 1;
}

.movie-info {
  color: white;
  font-size: 14px;
  text-align: center;
  margin-bottom: 10px;
}

.watch-overlay {
  font-size: 14px;
  color: white;
  background-color: rgba(255, 99, 71, 0.9);
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

.watch-overlay::before {
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

.watch-overlay:hover::before {
  left: 100%;
}

.watch-overlay:hover {
  background-color: rgba(255, 99, 71, 1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
  transform: scale(1.05); /* Slight scale effect */
}

.movie-title {
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

.movie-title:hover {
  color: #ff6347; /* Change color on hover */
  transform: scale(1.05); /* Slight scale effect */
}
</style>
