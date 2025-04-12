<template>
  <div class="episode-list-container">
    <div class="episode-list" v-if="episodes.length > 0">
      <div class="server" v-for="(server, index) in episodes" :key="index">
        <h4 class="server-name">
          <i class="fas fa-server"></i> {{ server.server_name }}
        </h4>
        <div class="episode-buttons">
          <button
            v-for="episode in server.server_data"
            :key="episode.slug"
            class="episode-button"
            :class="{ active: episode.slug === currentEpisodeSlug }"
            @click="handleEpisodeClick(episode)"
          >
            {{ episode.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "EpisodeList",
  props: {
    episodes: {
      type: Array,
      required: true,
    },
    currentEpisodeSlug: {
      type: String,
      required: true, // Pass the currently playing episode slug as a prop
    },
  },
  methods: {
    handleEpisodeClick(episode) {
      this.$emit("episode-click", episode);
    },
  },
};
</script>

<style scoped>
.episode-list-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  background-color: #2c2c2c;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.episode-list {
  margin-top: 20px;
}

.server h4 {
  margin-bottom: 30px;
  color: #ff6347;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.server-name {
  display: flex;
  align-items: center;
  gap: 8px; /* Add spacing between icon and text */
  font-size: 16px; /* Adjust font size */
  color: #ff6347; /* Match the theme color */
  margin-bottom: 20px; /* Adjust spacing below the server name */
}

.server-name i {
  font-size: 18px; /* Adjust icon size */
  color: #ff6347; /* Match the text color */
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.episode-button:hover {
  background-color: #ff6347;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  transform: scale(1.05);
}

.episode-button.active {
  background-color: #ff6347; /* Highlight the active episode */
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}
</style>
