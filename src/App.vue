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
        behavior: 'smooth'
      });
    }
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
</style>
