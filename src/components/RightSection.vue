<template>
  <div class="right-section">
    <section class="movie-section">
      <div class="section-header">
        <h2>Phim Mới</h2>
        <button @click="$emit('redirect')" class="view-more">Xem thêm</button>
      </div>
      <div class="anime-grid">
        <div
          v-for="movie in newMovies.slice(0, 7)"
          :key="movie._id"
          class="anime-card"
        >
          <div
            class="anime-thumbnail"
            @click="$router.push(`/movie/${movie.slug}`)"
          >
            <img
              :src="getMovieImage(movie)"
              alt="Poster"
              @error="handleImageError"
            />
            <div class="pause-icon">
              <i class="fas fa-play"></i>
            </div>
          </div>
          <div class="anime-details">
            <h3 class="anime-title">{{ movie.name }}</h3>
            <div class="anime-info">
              <i class="fas fa-clock"></i>
              <span>Thời lượng: {{ movie.time || "Đang cập nhật" }}</span>
            </div>
            <div class="anime-info">
              <i class="fas fa-film"></i>
              <span>Chất lượng: {{ movie.quality || "Đang cập nhật" }}</span>
            </div>
            <div class="anime-info">
              <i class="fas fa-globe"></i>
              <span>Ngôn ngữ: {{ movie.lang || "Đang cập nhật" }}</span>
            </div>
            <div class="anime-info">
              <i class="fas fa-calendar-alt"></i>
              <span>Năm: {{ movie.year || "Đang cập nhật" }}</span>
            </div>
            <div class="anime-tags">
              <span
                v-for="category in movie.category"
                :key="category.id"
                class="anime-tag"
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
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "RightSection",
  props: {
    newMovies: {
      type: Array,
      required: true,
    },
  },
  methods: {
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

.right-section {
  flex: 1;
  border-radius: 8px;
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  padding: 10px;
}

.anime-card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
}

.anime-thumbnail {
  width: 120px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
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

.anime-thumbnail:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
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
</style>
