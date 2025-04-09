<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <p>
          <strong
            >Xem Phim Online Hay Nhất - Đa Dạng Thể Loại, Cập Nhật Liên
            Tục</strong
          >
        </p>
        <p>
          Thưởng thức hàng ngàn bộ phim hay nhất với chất lượng cao, từ hành
          động, tình cảm, kinh dị đến viễn tưởng. Kho phim đa dạng, cập nhật
          liên tục các siêu phẩm mới nhất, mang đến trải nghiệm giải trí tuyệt
          vời ngay tại nhà.
        </p>
        <p>
          <strong>EIGA3K</strong> | Xem Phim Hay Online © 2024. All Rights
          Reserved
        </p>
        <p>
          Trang web này không lưu trữ bất kỳ tệp nào trên máy chủ của chúng tôi,
          chúng tôi chỉ liên kết với phương tiện được lưu trữ trên các dịch vụ
          của bên thứ 3.
        </p>
      </div>
      <div class="footer-contact">
        <h4>Liên Hệ</h4>
        <p>Email: <a href="#">Easylove04@gmail.com</a></p>
        <p>Telegram: <a href="#" target="_blank">@crawl_team</a></p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "AppFooter", // Updated component name to be multi-word
};
</script>

<style scoped>
.footer {
  margin-top: auto;
  background-color: #111;
  color: #ccc;
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
}

.footer-container {
  display: flex;
  justify-content: space-between; /* Align content to the left and right */
  align-items: flex-start; /* Align items at the top */
  max-width: 1200px;
  margin: 0 auto;
  gap: 20px;
}

.footer-content {
  flex: 2; /* Take more space */
  text-align: left;
}

.footer-content strong {
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.footer-contact {
  flex: 1; /* Take less space */
  text-align: left; /* Align text to the right */
  margin-top: auto;
}

.footer-contact h4 {
  color: #fff;
  margin-bottom: 10px;
}

.footer-contact a {
  color: #ff6347;
  text-decoration: none;
}

.footer-contact a:hover {
  color: #e03e2d;
  text-decoration: underline;
}
</style>
