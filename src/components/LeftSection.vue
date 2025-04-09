<template>
  <div class="left-section">
    <section
      v-for="(section, index) in sections"
      :key="index"
      class="movie-section"
    >
      <div class="section-header">
        <h2>{{ section.title }}</h2>
        <button @click="redirectToMovieList(section.apiUrl)" class="view-more">
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
                <strong>Thời lượng:</strong> {{ movie.time || "Đang cập nhật" }}
                <br />
                <strong>Chất lượng:</strong>
                {{ movie.quality || "Đang cập nhật" }}
                <br />
                <strong>Ngôn ngữ:</strong> {{ movie.lang || "Đang cập nhật" }}
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
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "LeftSection",
  props: {
    sectionsConfig: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      sections: this.sectionsConfig.map((section) => ({
        ...section,
        movies: [],
      })),
    };
  },
  async mounted() {
    await this.fetchMovies();
    this.$emit("loaded"); // Emit loaded event after fetching movies
  },
  methods: {
    async fetchMovies() {
      for (const section of this.sections) {
        try {
          const response = await axios.get(section.apiUrl);
          section.movies =
            response.data?.items || response.data?.data?.items || [];
        } catch (error) {
          console.error(
            `Error fetching movies for section: ${section.title}`,
            error
          );
        }
      }
    },
    redirectToMovieList(apiUrl) {
      if (apiUrl) {
        this.$store.commit("setApiUrl", apiUrl); // Lưu API URL vào Vuex store
        this.$router.push({ path: "/movies" }); // Chuyển hướng mà không truyền query
      }
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
  },
};
</script>

<style scoped>
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
  transform: scale(1.05);
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.movie-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
}

.movie-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-bottom: 2px solid #ff6347;
}

.movie-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-thumbnail:hover img {
  transform: scale(1.05);
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
  transform: scale(1.05);
}

.movie-title {
  font-size: 16px;
  font-weight: bold;
  color: white;
  text-align: center;
  margin: 10px 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  transition: color 0.3s, transform 0.3s;
}

.movie-title:hover {
  color: #ff6347;
  transform: scale(1.05);
}
</style>
