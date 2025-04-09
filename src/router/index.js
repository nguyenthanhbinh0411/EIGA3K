import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/HomePage.vue";
import MovieList from "../components/MovieList.vue";
import MovieDetail from "../components/MovieDetail.vue";
import MoviePlayer from "../components/MoviePlayer.vue";

const routes = [
  { path: "/", component: HomePage }, // Set HomePage as the default route
  {
    path: "/movies",
    component: MovieList,
    props: (route) => ({ query: route.query }),
  },
  {
    path: "/movie/:slug",
    name: "MovieDetail",
    component: MovieDetail,
    props: true,
  },
  {
    path: "/xem-phim/:slug",
    name: "MoviePlayer",
    component: MoviePlayer,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
