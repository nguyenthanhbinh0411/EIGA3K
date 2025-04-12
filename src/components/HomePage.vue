<template>
  <div class="homepage">
    <div v-if="isLoading" class="loading-spinner">
      <span>Đang tải...</span>
      <div class="spinner"></div>
    </div>
    <div v-else class="container">
      <!-- Auto-Sliding Banner Section -->
      <section class="banner-slider-section">
        <div class="banner-slider" ref="bannerSlider">
          <div
            v-for="(movie, index) in bannerMovies"
            :key="index"
            class="banner-slide"
            :style="{ backgroundImage: `url(${movie.thumb_url})` }"
          >
            <div class="banner-overlay">
              <div
                class="banner-thumbnail"
                @click="$router.push(`/movie/${movie.slug}`)"
              >
                <img :src="movie.poster_url" alt="Banner" />
                <div class="pause-icon">
                  <i class="fas fa-play"></i>
                </div>
              </div>
              <div class="banner-content">
                <h2>{{ movie.name }}</h2>
                <p class="movie-description">
                  {{ movie.content || "Đang cập nhật" }}
                </p>
                <div class="movie-details">
                  <span>
                    <i class="fas fa-clock"></i>
                    {{ movie.time || "Đang cập nhật" }}
                  </span>
                  <span>
                    <i class="fas fa-video"></i>
                    {{ movie.quality || "Đang cập nhật" }}
                  </span>
                  <span>
                    <i class="fas fa-language"></i>
                    {{ movie.lang || "Đang cập nhật" }}
                  </span>
                  <span>
                    <i class="fas fa-info-circle"></i>
                    {{ translateStatus(movie.status) }}
                  </span>
                </div>
                <!-- Add rating info -->
                <div class="rating-info">
                  <div class="rating-container">
                    <div class="rating-percentage">
                      <div
                        class="circle"
                        :style="{
                          background: `conic-gradient(#ff6347 ${circlePercentage(
                            movie
                          )}%, #fff ${circlePercentage(movie)}%)`,
                        }"
                      >
                        <span class="percentage-text">
                          {{ circlePercentage(movie) }}%
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
                <button
                  class="watch-now-button"
                  @click="$router.push(`/movie/${movie.slug}`)"
                >
                  Xem Phim
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- Dots for Slide Navigation -->
        <div class="banner-dots">
          <span
            v-for="(movie, index) in bannerMovies"
            :key="index"
            class="dot"
            :class="{ active: currentSlide === index }"
            @click="goToSlide(index)"
          ></span>
        </div>
      </section>

      <!-- Anime Mới Section -->
      <section class="movie-section">
        <div class="section-header">
          <h2>Anime Mới</h2>
          <button @click="redirectToMovieList(animeApiUrl)" class="view-more">
            Xem thêm
          </button>
        </div>
        <div class="movie-slider-wrapper">
          <div class="movie-slider" ref="phimMoiSlider">
            <div
              v-for="movie in animeMovies"
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
        </div>
      </section>

      <div class="main-content">
        <LeftSection
          :sectionsConfig="sectionsConfig"
          @loaded="onLeftSectionLoaded"
        />
        <RightSection
          :newMovies="newMovies"
          @redirect="redirectToMovieListWithoutApi"
          @loaded="onRightSectionLoaded"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import RightSection from "@/components/RightSection.vue";
import LeftSection from "@/components/LeftSection.vue";

export default {
  name: "HomePage",
  components: {
    RightSection,
    LeftSection,
  },
  data() {
    return {
      isLoading: true,
      leftSectionLoaded: false,
      rightSectionLoaded: false,
      bannerMovies: [], // State for banner movies
      currentSlide: 0, // Track the current slide index
      slideInterval: null, // Store the interval for auto-sliding
      sectionsConfig: [
        {
          title: "Phim Hoa Ngữ",
          apiUrl: "https://phimapi.com/v1/api/quoc-gia/trung-quoc?page=1",
        },
        {
          title: "Phim Hành Động",
          apiUrl: "https://phimapi.com/v1/api/the-loai/hanh-dong?page=1",
        },
        {
          title: "Phim Lẻ",
          apiUrl: "https://phimapi.com/v1/api/danh-sach/phim-le?page=1",
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
      try {
        const animeResponse = await axios.get(this.animeApiUrl);
        this.animeMovies = (
          animeResponse.data?.items ||
          animeResponse.data?.data?.items ||
          []
        ).map((movie) => ({
          ...movie,
          type: movie.type === "hoathinh" ? "anime" : movie.type, // Convert "hoathinh" to "anime"
        }));
      } catch (error) {
        console.error("Error fetching anime movies:", error);
      }
      try {
        const newMoviesResponse = await axios.get(this.newMoviesApiUrl);
        this.newMovies =
          newMoviesResponse.data?.items ||
          newMoviesResponse.data?.data?.items ||
          [];
      } catch (error) {
        console.error("Error fetching new movies:", error);
      }
      this.isLoading = false;
    },
    async fetchBannerMovies() {
      const apiUrls = [
        "https://phimapi.com/phim/ket-hon-voi-nguoi-ma-toi-ghet-nhat",
        "https://phimapi.com/phim/ten-cau-la-gi",
        "https://phimapi.com/phim/su-quyen-ru-cua-25d",
        "https://phimapi.com/phim/dua-con-cua-thoi-tiet",
        "https://phimapi.com/phim/blue-archive-the-animation",
        "https://phimapi.com/phim/arya-ban-ben-thinh-thoang-lai-treu-gheo-toi-bang-tieng-nga",
        "https://phimapi.com/phim/thien-su-nha-ben-phan-1",
        "https://phimapi.com/phim/josee-khi-nang-tho-yeu",
      ];
      try {
        const responses = await Promise.all(
          apiUrls.map((url) => axios.get(url))
        );
        this.bannerMovies = responses.map((res) => {
          const movie = res.data.movie;
          movie.vote_average = movie.tmdb?.vote_average || 0;
          movie.vote_count = movie.tmdb?.vote_count || 0;
          return movie;
        });
      } catch (error) {
        console.error("Error fetching banner movies:", error);
      }
    },
    autoSlideBanner() {
      this.slideInterval = setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.bannerMovies.length;
        this.updateSlidePosition();
      }, 5000); // Change slide every 5 seconds
    },
    updateSlidePosition() {
      const slider = this.$refs.bannerSlider;
      if (slider) {
        slider.style.transform = `translateX(-${this.currentSlide * 100}%)`;
      }
    },
    goToSlide(index) {
      this.currentSlide = index;
      this.updateSlidePosition();
      clearInterval(this.slideInterval); // Stop auto-sliding when manually navigating
      this.autoSlideBanner(); // Restart auto-sliding
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
      if (slider) {
        setInterval(() => {
          const scrollAmount = slider.offsetWidth / 2; // Scroll by half the slider width (2 movies)
          slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }, 5000); // Scroll every 5 seconds
      }
    },
    onLeftSectionLoaded() {
      this.leftSectionLoaded = true;
      this.checkAllSectionsLoaded();
    },
    onRightSectionLoaded() {
      this.rightSectionLoaded = true;
      this.checkAllSectionsLoaded();
    },
    checkAllSectionsLoaded() {
      if (this.leftSectionLoaded && this.rightSectionLoaded) {
        this.isLoading = false;
      }
    },
    circlePercentage(movie) {
      const voteAverage = parseFloat(movie.vote_average) || 0;
      return (voteAverage * 10).toFixed(0);
    },
    translateStatus(status) {
      const statusMap = {
        completed: "Hoàn thành",
        ongoing: "Đang chiếu",
      };
      return statusMap[status?.toLowerCase()] || "Đang cập nhật";
    },
  },
  mounted() {
    this.fetchMovies();
    this.fetchBannerMovies().then(() => {
      this.autoSlideBanner();
    });
    this.autoScrollSlider("phimMoiSlider");
  },
  beforeUnmount() {
    clearInterval(this.slideInterval); // Clear interval when component is destroyed
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

.movie-slider-wrapper {
  position: relative;
  overflow: hidden;
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

.banner-slider-section {
  position: relative;
  overflow: hidden;
  margin-bottom: 40px;
}

.banner-slider {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.banner-slide {
  flex: 0 0 100%;
  position: relative;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.banner-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.banner-overlay {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3));
}

.banner-thumbnail {
  position: relative;
  width: 300px;
  height: 450px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer; /* Add pointer cursor for clickable thumbnails */
}

.banner-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.banner-thumbnail:hover img {
  transform: scale(1.05); /* Slight zoom effect on hover */
}

.pause-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.banner-thumbnail:hover .pause-icon {
  opacity: 1; /* Show pause icon on hover */
}

.banner-content {
  flex: 1;
  margin-left: 20px;
  color: white;
  text-align: left;
}

.banner-content h2 {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.movie-description {
  font-size: 16px;
  margin-bottom: 15px;
  line-height: 1.5;
}

.movie-details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.movie-details span {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.movie-details i {
  color: #ff6347;
}

.watch-now-button {
  background-color: #ff6347;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.watch-now-button:hover {
  background-color: #e03e2d;
  transform: scale(1.05);
}

.banner-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 3;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: #ccc;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dot.active {
  background-color: #ff6347;
}

.rating-info {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 0;
  color: white;
  gap: 20px;
  font-family: "Arial", sans-serif;
  font-size: 14px;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
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
  align-items: flex-start;
  gap: 2px;
}

.stars {
  display: flex;
  gap: 2px;
  color: #ff6347;
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
    padding: 0 15px;
  }
  .banner-slider-section {
    display: none;
  }
  .movie-slider {
    gap: 5px;
  }

  .movie-card {
    width: 120px;
  }

  .banner-thumbnail {
    width: 250px;
    height: 375px;
  }

  .banner-content h2 {
    font-size: 24px;
  }
  .movie-grid,
  .movie-slider {
    grid-template-columns: repeat(2, 1fr); /* Display 2 movies per row */
    gap: 10px;
  }
  .movie-card {
    flex: 0 0 calc(50% - 15px); /* Match LeftSection's movie-card ratio */
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .movie-slider {
    gap: 5px;
  }

  .movie-card {
    width: 120px;
  }

  .banner-thumbnail {
    width: 200px;
    height: 300px;
  }

  .banner-content h2 {
    font-size: 20px;
  }
  .movie-slider-wrapper {
    overflow: hidden;
  }

  .movie-slider {
    display: flex;
    gap: 10px;
  }

  .movie-card {
    flex: 0 0 50%; /* Show 2 movies at a time */
  }
  .movie-grid,
  .movie-slider {
    grid-template-columns: repeat(2, 1fr); /* Display 2 movies per row */
    gap: 10px;
  }
  .movie-card {
    flex: 0 0 calc(50% - 10px); /* Match LeftSection's movie-card ratio */
  }
}

@media (max-width: 480px) {
  .banner-content h2 {
    font-size: 18px;
  }

  .movie-card img {
    height: 300px;
  }

  .movie-title {
    font-size: 12px;
  }
  .movie-grid,
  .movie-slider {
    grid-template-columns: repeat(2, 1fr); /* Display 2 movies per row */
    gap: 10px;
  }
  .movie-card {
    flex: 0 0 calc(50% - 10px); /* Match LeftSection's movie-card ratio */
  }
}

/* Responsive adjustments for navbar */
@media (max-width: 1024px) {
  .navbar {
    flex-direction: column; /* Stack navbar items vertically */
    align-items: flex-start; /* Align items to the left */
    padding: 10px 20px; /* Adjust padding */
  }

  .navbar-logo {
    margin-bottom: 10px; /* Add spacing below the logo */
  }

  .navbar-links {
    display: flex;
    flex-direction: column; /* Stack links vertically */
    gap: 10px; /* Add spacing between links */
  }

  .navbar-links a {
    font-size: 14px; /* Adjust font size */
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 10px; /* Reduce padding */
  }

  .navbar-links {
    gap: 8px; /* Reduce spacing between links */
  }

  .navbar-links a {
    font-size: 12px; /* Further reduce font size */
  }

  .navbar-toggle {
    display: block; /* Show toggle button */
    font-size: 18px; /* Adjust toggle button size */
    cursor: pointer;
  }

  .navbar-links {
    display: none; /* Hide links by default */
  }

  .navbar-links.active {
    display: flex; /* Show links when active */
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 8px; /* Further reduce padding */
  }

  .navbar-logo {
    font-size: 16px; /* Adjust logo font size */
  }

  .navbar-links a {
    font-size: 10px; /* Further reduce link font size */
  }
}
</style>
