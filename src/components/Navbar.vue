<template>
  <div class="navbar">
    <div class="logo">
      <router-link to="/">
        <img src="@/assets/logo.png" alt="Trang Chủ" class="logo-image" />
      </router-link>
    </div>
    <div class="menu">
      <div class="dropdown">
        <button
          class="menu-item dropdown-toggle"
          @click="toggleDanhSachDropdown"
        >
          Danh Sách
        </button>
        <div class="mega-menu" :class="{ show: showDanhSachDropdown }">
          <div class="row">
            <div
              class="genre-column"
              v-for="(item, index) in danhSachItems"
              :key="index"
            >
              <button class="genre-button" @click="selectDanhSach(item.slug)">
                {{ item.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="dropdown">
        <button class="menu-item dropdown-toggle" @click="toggleGenreDropdown">
          Thể Loại
        </button>
        <div class="mega-menu" :class="{ show: localShowGenreDropdown }">
          <div class="row">
            <div
              class="genre-column"
              v-for="(genre, index) in genres"
              :key="index"
            >
              <button class="genre-button" @click="selectGenre(genre)">
                {{ genre.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="dropdown">
        <button
          class="menu-item dropdown-toggle"
          @click="toggleCountryDropdown"
        >
          Quốc Gia
        </button>
        <div class="mega-menu" :class="{ show: localShowCountryDropdown }">
          <div class="row">
            <div
              class="genre-column"
              v-for="(country, index) in countries"
              :key="index"
            >
              <button class="genre-button" @click="selectCountry(country)">
                {{ country.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="dropdown">
        <button class="menu-item dropdown-toggle" @click="toggleYearDropdown">
          Năm
        </button>
        <div class="mega-menu" :class="{ show: localShowYearDropdown }">
          <div class="row">
            <div
              class="genre-column"
              v-for="(year, index) in years"
              :key="index"
            >
              <button class="genre-button" @click="selectYear(year)">
                {{ year }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="search-bar">
      <div class="search-input-container">
        <input
          type="text"
          v-model="localSearchKeyword"
          placeholder="Tìm kiếm tên phim, đạo diễn, thể loại..."
          @input="fetchSearchSuggestions"
        />
        <button
          @click="clearSearch"
          class="clear-button"
          v-if="localSearchKeyword"
        >
          ✕
        </button>
        <button @click="searchMovies" class="search-button">
          <i class="fas fa-search"></i>
        </button>
        <div v-if="showSearchDropdown" class="search-suggestions">
          <div
            v-for="movie in searchSuggestions.slice(0, 5)"
            :key="movie._id"
            class="suggestion-item"
            @click="redirectToMovieDetail(movie.slug)"
          >
            <img :src="getFullImageUrl(movie.poster_url)" alt="Poster" />
            <div class="suggestion-details">
              <h4>{{ movie.name }}</h4>
              <p>
                {{ movie.time || "" }}/{{ movie.lang || "" }}/{{
                  movie.quality || ""
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MovieNavbar",
  props: {
    searchKeyword: String,
    genres: {
      type: Array,
      default: () => [
        {
          _id: "9822be111d2ccc29c7172c78b8af8ff5",
          name: "Hành Động",
          slug: "hanh-dong",
        },
        {
          _id: "d111447ee87ec1a46a31182ce4623662",
          name: "Miền Tây",
          slug: "mien-tay",
        },
        {
          _id: "0c853f6238e0997ee318b646bb1978bc",
          name: "Trẻ Em",
          slug: "tre-em",
        },
        {
          _id: "f8ec3e9b77c509fdf64f0c387119b916",
          name: "Lịch Sử",
          slug: "lich-su",
        },
        {
          _id: "3a17c7283b71fa84e5a8d76fb790ed3e",
          name: "Cổ Trang",
          slug: "co-trang",
        },
        {
          _id: "1bae5183d681b7649f9bf349177f7123",
          name: "Chiến Tranh",
          slug: "chien-tranh",
        },
        {
          _id: "68564911f00849030f9c9c144ea1b931",
          name: "Viễn Tưởng",
          slug: "vien-tuong",
        },
        {
          _id: "4db8d7d4b9873981e3eeb76d02997d58",
          name: "Kinh Dị",
          slug: "kinh-di",
        },
        {
          _id: "1645fa23fa33651cef84428b0dcc2130",
          name: "Tài Liệu",
          slug: "tai-lieu",
        },
        {
          _id: "2fb53017b3be83cd754a08adab3e916c",
          name: "Bí Ẩn",
          slug: "bi-an",
        },
        {
          _id: "4b4457a1af8554c282dc8ac41fd7b4a1",
          name: "Phim 18+",
          slug: "phim-18",
        },
        {
          _id: "bb2b4b030608ca5984c8dd0770f5b40b",
          name: "Tình Cảm",
          slug: "tinh-cam",
        },
        {
          _id: "a7b065b92ad356387ef2e075dee66529",
          name: "Tâm Lý",
          slug: "tam-ly",
        },
        {
          _id: "591bbb2abfe03f5aa13c08f16dfb69a2",
          name: "Thể Thao",
          slug: "the-thao",
        },
        {
          _id: "66c78b23908113d478d8d85390a244b4",
          name: "Phiêu Lưu",
          slug: "phieu-luu",
        },
        {
          _id: "252e74b4c832ddb4233d7499f5ed122e",
          name: "Âm Nhạc",
          slug: "am-nhac",
        },
        {
          _id: "a2492d6cbc4d58f115406ca14e5ec7b6",
          name: "Gia Đình",
          slug: "gia-dinh",
        },
        {
          _id: "01c8abbb7796a1cf1989616ca5c175e6",
          name: "Học Đường",
          slug: "hoc-duong",
        },
        {
          _id: "ba6fd52e5a3aca80eaaf1a3b50a182db",
          name: "Hài Hước",
          slug: "hai-huoc",
        },
        {
          _id: "7a035ac0b37f5854f0f6979260899c90",
          name: "Hình Sự",
          slug: "hinh-su",
        },
        {
          _id: "578f80eb493b08d175c7a0c29687cbdf",
          name: "Võ Thuật",
          slug: "vo-thuat",
        },
        {
          _id: "0bcf4077916678de9b48c89221fcf8ae",
          name: "Khoa Học",
          slug: "khoa-hoc",
        },
        {
          _id: "2276b29204c46f75064735477890afd6",
          name: "Thần Thoại",
          slug: "than-thoai",
        },
        {
          _id: "37a7b38b6184a5ebd3c43015aa20709d",
          name: "Chính Kịch",
          slug: "chinh-kich",
        },
        {
          _id: "268385d0de78827ff7bb25c35036ee2a",
          name: "Kinh Điển",
          slug: "kinh-dien",
        },
      ],
    },
    countries: {
      type: Array,
      default: () => [
        {
          _id: "f6ce1ae8b39af9d38d653b8a0890adb8",
          name: "Việt Nam",
          slug: "viet-nam",
        },
        {
          _id: "3e075636c731fe0f889c69e0bf82c083",
          name: "Trung Quốc",
          slug: "trung-quoc",
        },
        {
          _id: "cefbf1640a17bad1e13c2f6f2a811a2d",
          name: "Thái Lan",
          slug: "thai-lan",
        },
        {
          _id: "dcd5551cbd22ea2372726daafcd679c1",
          name: "Hồng Kông",
          slug: "hong-kong",
        },
        { _id: "92f688188aa938a03a61a786d6616dcb", name: "Pháp", slug: "phap" },
        { _id: "24a5bf049aeef94ab79bad1f73f16b92", name: "Đức", slug: "duc" },
        {
          _id: "41487913363f08e29ea07f6fdfb49a41",
          name: "Hà Lan",
          slug: "ha-lan",
        },
        {
          _id: "8dbb07a18d46f63d8b3c8994d5ccc351",
          name: "Mexico",
          slug: "mexico",
        },
        {
          _id: "61709e9e6ca6ca8245bc851c0b781673",
          name: "Thụy Điển",
          slug: "thuy-dien",
        },
        {
          _id: "77dab2f81a6c8c9136efba7ab2c4c0f2",
          name: "Philippines",
          slug: "philippines",
        },
        {
          _id: "208c51751eff7e1480052cdb4e26176a",
          name: "Đan Mạch",
          slug: "dan-mach",
        },
        {
          _id: "69e561770d6094af667b9361f58f39bd",
          name: "Thụy Sĩ",
          slug: "thuy-si",
        },
        {
          _id: "c338f80e38dd2381f8faf9eccb6e6c1c",
          name: "Ukraina",
          slug: "ukraina",
        },
        {
          _id: "05de95be5fc404da9680bbb3dd8262e6",
          name: "Hàn Quốc",
          slug: "han-quoc",
        },
        {
          _id: "74d9fa92f4dea9ecea8fc2233dc7921a",
          name: "Âu Mỹ",
          slug: "au-my",
        },
        {
          _id: "aadd510492662beef1a980624b26c685",
          name: "Ấn Độ",
          slug: "an-do",
        },
        {
          _id: "445d337b5cd5de476f99333df6b0c2a7",
          name: "Canada",
          slug: "canada",
        },
        {
          _id: "8a40abac202ab3659bb98f71f05458d1",
          name: "Tây Ban Nha",
          slug: "tay-ban-nha",
        },
        {
          _id: "4647d00cf81f8fb0ab80f753320d0fc9",
          name: "Indonesia",
          slug: "indonesia",
        },
        {
          _id: "59317f665349487a74856ac3e37b35b5",
          name: "Ba Lan",
          slug: "ba-lan",
        },
        {
          _id: "3f0e49c46cbde0c7adf5ea04a97ab261",
          name: "Malaysia",
          slug: "malaysia",
        },
        {
          _id: "fcd5da8ea7e4bf894692933ee3677967",
          name: "Bồ Đào Nha",
          slug: "bo-dao-nha",
        },
        { _id: "b6ae56d2d40c99fc293aefe45dcb3b3d", name: "UAE", slug: "uae" },
        {
          _id: "471cdb11e01cf8fcdafd3ab5cd7b4241",
          name: "Châu Phi",
          slug: "chau-phi",
        },
        {
          _id: "cc85d02a69f06f7b43ab67f5673604a3",
          name: "Ả Rập Xê Út",
          slug: "a-rap-xe-ut",
        },
        {
          _id: "d4097fbffa8f7149a61281437171eb83",
          name: "Nhật Bản",
          slug: "nhat-ban",
        },
        {
          _id: "559fea9881e3a6a3e374b860fa8fb782",
          name: "Đài Loan",
          slug: "dai-loan",
        },
        { _id: "932bbaca386ee0436ad0159117eabae4", name: "Anh", slug: "anh" },
        {
          _id: "45a260effdd4ba38e861092ae2a1b96a",
          name: "Quốc Gia Khác",
          slug: "quoc-gia-khac",
        },
        {
          _id: "8931caa7f43ee5b07bf046c8300f4eba",
          name: "Thổ Nhĩ Kỳ",
          slug: "tho-nhi-ky",
        },
        { _id: "2dbf49dd0884691f87e44769a3a3a29e", name: "Nga", slug: "nga" },
        { _id: "435a85571578e419ed511257881a1e75", name: "Úc", slug: "uc" },
        {
          _id: "42537f0fb56e31e20ab9c2305752087d",
          name: "Brazil",
          slug: "brazil",
        },
        { _id: "a30878a7fdb6a94348fce16d362edb11", name: "Ý", slug: "y" },
        {
          _id: "638f494a6d33cf5760f6e95c8beb612a",
          name: "Na Uy",
          slug: "na-uy",
        },
        { _id: "5c35522c5074ad8e4c229a91f68eb464", name: "Namh", slug: "namh" },
      ],
    },
    years: {
      type: Array,
      default: () =>
        Array.from({ length: 2025 - 1999 + 1 }, (_, i) => 1999 + i), // Generate years from 1980 to 2025
    },
    showGenreDropdown: Boolean,
    showCountryDropdown: Boolean,
    showYearDropdown: Boolean,
  },
  data() {
    return {
      localSearchKeyword: this.searchKeyword || "", // Initialize with the search keyword
      showDanhSachDropdown: false,
      localShowYearDropdown: this.showYearDropdown, // Use a local property
      localShowCountryDropdown: this.showCountryDropdown, // Use a local property
      localShowGenreDropdown: this.showGenreDropdown, // Use a local property
      danhSachItems: [
        { name: "Phim Lẻ", slug: "phim-le" },
        { name: "Phim Bộ", slug: "phim-bo" },
        { name: "TV Shows", slug: "tv-shows" },
        { name: "Anime", slug: "hoat-hinh" },
        { name: "Phim Vietsub", slug: "phim-vietsub" },
        { name: "Phim Thuyết Minh", slug: "phim-thuyet-minh" },
        { name: "Phim Lồng Tiếng", slug: "phim-long-tieng" },
      ],
      searchSuggestions: [], // Store search suggestions
      showSearchDropdown: false, // Control visibility of search dropdown
    };
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    // Updated from beforeDestroy to beforeUnmount
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    searchMovies() {
      if (this.localSearchKeyword.trim()) {
        const encodedKeyword = encodeURIComponent(
          this.localSearchKeyword.trim()
        );
        const searchUrl = `https://phimapi.com/v1/api/tim-kiem?keyword=${encodedKeyword}&limit=10`;
        this.$store.commit("setApiUrl", searchUrl); // Save the search URL to Vuex
        this.$router.push({
          path: "/movies",
          query: { keyword: this.localSearchKeyword.trim() }, // Only pass the keyword in the query
        });
        this.showSearchDropdown = false; // Hide dropdown menu when searching
      } else {
        alert("Vui lòng nhập từ khóa tìm kiếm.");
      }
    },
    toggleGenreDropdown() {
      this.localShowGenreDropdown = !this.localShowGenreDropdown; // Update local property
    },
    toggleCountryDropdown() {
      this.localShowCountryDropdown = !this.localShowCountryDropdown; // Update local property
    },
    toggleYearDropdown() {
      this.localShowYearDropdown = !this.localShowYearDropdown; // Update local property
    },
    toggleDanhSachDropdown() {
      this.showDanhSachDropdown = !this.showDanhSachDropdown;
    },
    selectDanhSach(slug) {
      const apiUrl = `https://phimapi.com/v1/api/danh-sach/${slug}?page=1`;
      this.$store.commit("setApiUrl", apiUrl); // Lưu API URL vào Vuex
      if (this.$route.path !== "/movies") {
        this.$router.push({ path: "/movies" }); // Chuyển hướng nếu không ở trang MovieList
      }
      this.showDanhSachDropdown = false; // Đóng megamenu
    },
    selectGenre(genre) {
      const apiUrl = `https://phimapi.com/v1/api/the-loai/${genre.slug}?page=1`;
      this.$store.commit("setApiUrl", apiUrl); // Lưu API URL vào Vuex
      if (this.$route.path !== "/movies") {
        this.$router.push({ path: "/movies" }); // Chuyển hướng nếu không ở trang MovieList
      }
      this.localShowGenreDropdown = false; // Đóng megamenu
    },
    selectCountry(country) {
      const apiUrl = `https://phimapi.com/v1/api/quoc-gia/${country.slug}?page=1`;
      this.$store.commit("setApiUrl", apiUrl); // Lưu API URL vào Vuex
      if (this.$route.path !== "/movies") {
        this.$router.push({ path: "/movies" }); // Chuyển hướng nếu không ở trang MovieList
      }
      this.localShowCountryDropdown = false; // Đóng megamenu
    },
    selectYear(year) {
      const apiUrl = `https://phimapi.com/v1/api/nam/${year}?page=1`;
      this.$store.commit("setApiUrl", apiUrl); // Lưu API URL vào Vuex
      if (this.$route.path !== "/movies") {
        this.$router.push({ path: "/movies" }); // Chuyển hướng nếu không ở trang MovieList
      }
      this.localShowYearDropdown = false; // Đóng megamenu
    },
    clearSearch() {
      this.localSearchKeyword = "";
      this.searchSuggestions = [];
      this.showSearchDropdown = false; // Hide dropdown when clearing input
    },
    async fetchSearchSuggestions() {
      if (this.localSearchKeyword.trim()) {
        try {
          const response = await fetch(
            `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(
              this.localSearchKeyword.trim()
            )}&limit=10`
          );
          const data = await response.json();
          this.searchSuggestions = data.data.items || [];
          this.showSearchDropdown = true; // Show dropdown menu as soon as the user starts typing
        } catch (error) {
          console.error("Error fetching search suggestions:", error);
          this.searchSuggestions = [];
          this.showSearchDropdown = false;
        }
      } else {
        this.searchSuggestions = [];
        this.showSearchDropdown = false; // Hide dropdown when input is empty
      }
    },
    handleClickOutside(event) {
      const searchBar = this.$el.querySelector(".search-bar");
      if (searchBar && !searchBar.contains(event.target)) {
        this.showSearchDropdown = false; // Close dropdown when clicking outside
      }
    },
    redirectToMovieDetail(slug) {
      this.$router.push(`/movie/${slug}`);
      this.searchSuggestions = []; // Clear suggestions after redirection
    },
    getFullImageUrl(path) {
      return path.startsWith("upload")
        ? `https://phimimg.com/${path}`
        : path || "https://placehold.it/50x50";
    },
  },
  watch: {
    searchKeyword(newValue) {
      this.localSearchKeyword = newValue; // Sync prop with local data
    },
    showYearDropdown(newValue) {
      this.localShowYearDropdown = newValue; // Sync prop with local property
    },
    showCountryDropdown(newValue) {
      this.localShowCountryDropdown = newValue; // Sync prop with local property
    },
    showGenreDropdown(newValue) {
      this.localShowGenreDropdown = newValue; // Sync prop with local property
    },
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: center; /* Center the navbar horizontally */
  background-color: #353434;
  padding: 25px 20px;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  gap: 50px; /* Increase spacing between sections */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #ff6347; /* Updated to orange */
  text-decoration: none;
}
.logo-image {
  height: 50px; /* Điều chỉnh chiều cao */
  width: auto; /* Giữ tỷ lệ hình ảnh */
}
.logo-text:hover {
  color: #e03e2d; /* Darker orange on hover */
}

.menu {
  display: flex;
  align-items: center;
  gap: 30px; /* Add padding between menu items */
}

.menu-item {
  color: #ff6347; /* Updated to orange */
  text-decoration: none; /* Remove underline */
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s;
  position: relative;
}

.menu-item:hover {
  color: #e03e2d; /* Darker orange on hover */
  text-decoration: none; /* Ensure underline is removed */
  background-color: rgba(255, 99, 71, 0.1); /* Add subtle hover background */
  border-radius: 5px; /* Add rounded corners for hover effect */
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: #ff6347; /* Updated to orange */
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  outline: none; /* Remove white border on focus */
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #222;
  border: 1px solid #333;
  border-radius: 5px;
  padding: 10px;
  z-index: 1000;
  display: flex;
  flex-wrap: wrap;
  gap: 20px; /* Adjust spacing between columns */
  max-width: auto; /* Set maximum width for the dropdown */
  justify-content: space-between; /* Distribute columns evenly */
}

.dropdown-column {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Adjust spacing between items */
  flex: 1 1 calc(33.33% - 20px); /* 3 columns with spacing */
}

.dropdown-item {
  color: #ff6347; /* Updated to orange */
  cursor: pointer;
  padding: 5px 10px;
  transition: background-color 0.3s, color 0.3s;
  text-align: left; /* Align text to the left */
}

.dropdown-item:hover {
  background-color: #333;
  color: #e03e2d; /* Darker orange on hover */
}

.search-bar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-input-container {
  position: relative;
  width: 400px; /* Increase search bar width */
}

.search-input-container input {
  width: 100%;
  padding: 8px 40px 8px 10px; /* Add padding for the button */
  border: 1px solid #333;
  border-radius: 5px;
  background-color: #222;
  color: white;
  outline: none;
  padding-right: 40px; /* Adjust padding for clear button */
}

.search-input-container input::placeholder {
  color: #aaa;
}

.clear-button {
  position: absolute;
  top: 50%;
  right: 40px; /* Position clear button */
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #ff6347;
  font-size: 16px;
  cursor: pointer;
}

.clear-button:hover {
  color: #e03e2d;
}

.search-button {
  position: absolute;
  top: 50%;
  right: 10px; /* Adjust position for clear button */
  transform: translateY(-50%);
  background-color: transparent;
  border: none;
  color: #ff6347; /* Updated to orange */
  font-size: 16px;
  cursor: pointer;
}

.search-button:hover {
  color: #e03e2d; /* Darker orange on hover */
}

.mega-menu {
  display: none;
  position: absolute;
  background-color: #1c1c1c;
  width: 800px;

  padding: 20px;
  box-sizing: border-box;
  text-align: left;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
}

.mega-menu.show {
  display: block;
  opacity: 1;
  transform: translateY(0);
  left: 50%;
  transform: translateX(-50%);
  top: 100%;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
  z-index: 1;
}

.mega-menu .row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
}

.genre-column {
  width: 25%;
  padding: 10px;
  box-sizing: border-box;
}

.genre-button {
  display: block;
  margin: 5px 0;
  width: 100%;
  background-color: transparent;
  border: none;
  color: #ff6347; /* Updated to orange */
  position: relative;
  padding-bottom: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* Modern shadow effect */
}

.genre-button::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 2px;
  background-color: #ff6347; /* Updated to orange */
  transition: width 0.3s ease;
}

.genre-button:hover::after {
  width: 100%;
}

.genre-button:hover {
  color: #e03e2d; /* Darker orange on hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5); /* Hover shadow effect */
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #1c1c1c;
  border: 1px solid #333;
  border-radius: 5px;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.suggestion-item:hover {
  background-color: #333;
}

.suggestion-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 10px;
}

.suggestion-details {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center align vertically */
  align-items: flex-start; /* Align text to the left */
  gap: 2px; /* Reduce spacing between elements */
  line-height: 1.2; /* Adjust line height for better alignment */
}

.suggestion-details h4 {
  font-size: 14px;
  color: white;
  margin: 0;
}

.suggestion-details p {
  font-size: 12px;
  color: #aaa;
  margin: 0;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .menu {
    gap: 20px;
  }

  .search-bar {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .menu {
    flex-wrap: wrap;
    gap: 10px;
  }

  .search-bar {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .menu-item {
    font-size: 14px;
  }

  .search-bar {
    width: 100%;
  }
}
</style>
