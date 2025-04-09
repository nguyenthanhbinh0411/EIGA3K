<template>
  <div id="app">
    <MovieNavbar />
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component
          :is="Component"
          :key="route.fullPath"
          @loading="setLoading"
        />
      </transition>
    </router-view>
    <AppFooter v-if="!isLoading" />
  </div>
</template>

<script>
import MovieNavbar from "./components/Navbar.vue";
import AppFooter from "./components/Footer.vue";
import HomePage from "./components/HomePage.vue";

export default {
  name: "App",
  components: {
    MovieNavbar,
    AppFooter,
    HomePage,
  },
  data() {
    return {
      isLoading: false, // Track loading state
    };
  },
  methods: {
    setLoading(loading) {
      this.isLoading = loading; // Update loading state
      if (!loading) {
        this.scrollToTop(); // Scroll to top when loading is complete
      }
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #42b983;
  text-decoration: none;
}

nav a.router-link-exact-active {
  color: #42b983;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px; /* Width of the scrollbar */
  height: 8px; /* Height for horizontal scrollbars */
}

::-webkit-scrollbar-thumb {
  background-color: #ff6347; /* Color of the scrollbar thumb */
  border-radius: 4px; /* Rounded corners for the thumb */
  transition: background-color 0.3s ease, transform 0.3s ease; /* Smooth transition */
}

::-webkit-scrollbar-thumb:hover {
  background-color: #e03e2d; /* Darker color on hover */
  transform: scale(1.1); /* Slightly enlarge on hover */
}

::-webkit-scrollbar-track {
  background-color: #333; /* Background color of the scrollbar track */
  border-radius: 4px; /* Rounded corners for the track */
}
</style>
