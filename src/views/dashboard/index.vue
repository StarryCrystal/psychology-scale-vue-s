<template>
  <div class="dashboard-container" style="display: flex">
    <el-card class="box-card" style="flex: 1">
      <div slot="header" class="clearfix">
        <span style="color: #000000; font-weight: 600"
          >青苗心理测评系统</span
        >
      </div>
    </el-card>
    <el-card class="box-card" style="flex: 1">
      <div slot="header" class="clearfix">
        <span style="color: #000000; font-weight: 600">我们的服务</span>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Dashboard",
  computed: {
    ...mapGetters(["name"]),
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
