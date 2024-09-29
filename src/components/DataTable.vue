<template>
  <div class="container mt-5">
    <h1 class="text-center">Bảng Dữ Liệu Ngẫu Nhiên</h1>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Tên</th>
          <th>Tuổi</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>{{ index + 1 }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.age }}</td>
          <td>{{ item.email }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: [
        { name: 'Nguyễn Văn A', age: 25, email: 'nguyenvana@example.com' },
        { name: 'Trần Thị B', age: 30, email: 'tranthib@example.com' },
        { name: 'Nguyễn Văn C', age: 22, email: 'nguyenvanc@example.com' },
        { name: 'Phạm Văn D', age: 28, email: 'phamvand@example.com' },
      ],
    };
  },
};
</script>

<style scoped>
/* Bạn có thể thêm các kiểu CSS tùy chỉnh tại đây */
</style>
