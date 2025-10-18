<template>
  <div class="ai-review-container">
    <div class="page-header">
      <h2>AI复盘</h2>
      <p>查看AI对直播内容的分析和复盘结果</p>
    </div>
    <div class="content-placeholder">
      <div class="placeholder-icon">
        <i class="el-icon-cpu"></i>
      </div>
      <p>AI复盘功能即将上线</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AiReview',
  data() {
    return {
      pageTitle: 'AI复盘'
    }
  },
  mounted() {
    console.log('AI复盘页面已加载');
  }
}
</script>

<style scoped>
.ai-review-container {
  padding: 20px;
  color: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  color: #45ff93;
  margin-bottom: 10px;
  font-size: 24px;
}

.page-header p {
  color: #b0b0b0;
  font-size: 14px;
}

.content-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #242424;
  border-radius: 8px;
  padding: 40px;
}

.placeholder-icon {
  font-size: 48px;
  color: #45ff93;
  margin-bottom: 16px;
}

.content-placeholder p {
  color: #b0b0b0;
  font-size: 16px;
}
</style>