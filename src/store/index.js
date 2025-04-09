import { createStore } from "vuex";

export default createStore({
  state: {
    apiUrl: "", // Lưu trữ API URL
  },
  mutations: {
    setApiUrl(state, apiUrl) {
      state.apiUrl = apiUrl; // Cập nhật API URL
    },
  },
  actions: {},
  modules: {},
});
