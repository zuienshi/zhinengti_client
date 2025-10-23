<template>
  <div class="live-list-container">
    <!-- 独立的选项卡区域 -->
    <div class="header-section">
      <!-- 左侧选项卡 -->
      <div class="custom-tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          所有主播
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'recording' }"
          @click="activeTab = 'recording'"
        >
          录制中
        </div>
      </div>
      
      <!-- 右侧按钮 -->
      <el-button type="primary" size="mini" class="add-streamer-btn">添加主播</el-button>
    </div>

  
    
    <!-- 第二个Card：操作部分 -->
    <el-card v-show="activeTab === 'all'" class="main-card dark-card operation-card">
      <!-- 搜索查询区 -->
      <div class="search-area">
        <div class="search-container">
          <div class="search-left">
            <el-input 
              v-model="searchKeyword" 
              placeholder="搜索主播昵称" 
              prefix-icon="el-icon-search"
              size="mini"
              class="search-input"
            ></el-input>
            <el-button type="primary" size="mini" class="search-btn" @click="handleSearch">搜索</el-button>
          </div>
          <div class="search-right">
            <el-button size="mini" class="record-analysis-btn" @click="handleRecordAnalysis">录制分析</el-button>
          </div>
        </div>
      </div>
      
      <!-- 筛选区域 -->
      <div class="filter-area">
        <div class="filter-left">
          <span class="filter-label">账号筛选：</span>
          <el-radio-group v-model="accountFilter" size="mini" class="account-filter">
            <el-radio-button label="all">全部账号</el-radio-button>
            <el-radio-button label="self">自有账号</el-radio-button>
            <el-radio-button label="peer">同行账号</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="filter-right">
          <el-select v-model="videoFormat" placeholder="视频格式" size="mini" class="format-select">
              <el-option label="ts" value="ts"></el-option>
              <el-option label="mp4" value="mp4"></el-option>
            </el-select>
            
            <el-select v-model="videoQuality" placeholder="视频清晰度" size="mini" class="quality-select">
              <el-option label="标清" value="sd"></el-option>
              <el-option label="高清" value="hd"></el-option>
              <el-option label="蓝光" value="blueray"></el-option>
            </el-select>
        </div>
      </div>
    </el-card>
    
    <!-- 新增数据统计Card -->
    <el-card v-show="activeTab === 'all'" class="main-card dark-card stats-card">
      <div class="stats-grid">
        <div class="stats-item">
          <div class="stats-label">主播数量</div>
          <div class="stats-value">{{ stats.totalStreamers }}</div>
        </div>
        <div class="stats-item">
          <div class="stats-label">直播中</div>
          <div class="stats-value online">{{ stats.liveNow }}</div>
        </div>
        <div class="stats-item">
          <div class="stats-label">录制中</div>
          <div class="stats-value recording">{{ stats.recordingNow }}</div>
        </div>
        <div class="stats-item">
          <div class="stats-label">已检测</div>
          <div class="stats-value">{{ stats.detectedCount }}</div>
        </div>
        <div class="stats-item">
          <div class="stats-label">AI分析时长</div>
          <div class="stats-value">{{ stats.aiAnalysisHours }}小时</div>
        </div>
        <div class="stats-item stats-action">
          <el-button type="primary" size="mini" class="expand-btn" @click="handleExpand">立即扩容</el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 表格部分 -->
    <div class="table-section">
      <div class="table-header-container">
        <div class="card-header fixed-header">
          <span>电商</span>
        </div>
      </div>
      <el-card class="table-card white-card">
        <el-table :data="streamerData" style="width: 100%" class="custom-table">
          <el-table-column prop="id" label="ID" min-width="60"></el-table-column>
          <el-table-column prop="nickname" label="主播昵称" min-width="120"></el-table-column>
          <el-table-column prop="autoRecord" label="自动检测录制" min-width="100">
            <template v-slot:scope>
              <el-switch v-model="scope.row.autoRecord" active-text="开启" inactive-text="关闭"></el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="dataDashboard" label="数据看板" min-width="80">
            <template v-slot="scope">
              <el-button type="primary" size="mini" plain>查看</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="danmuMonitor" label="弹幕监控" min-width="100">
            <template v-slot="scope">
              <el-button type="success" size="mini" plain>{{ scope.row.danmuMonitor ? '开启' : '关闭' }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="avgYesterday" label="昨日平均" min-width="100"></el-table-column>
          <el-table-column prop="recordYesterday" label="昨日录制" min-width="120"></el-table-column>
          <el-table-column prop="folder" label="文件夹" min-width="150">
            <template v-slot="scope">
              <el-button type="info" size="mini" plain>打开</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="operation" label="操作" min-width="120">
            <template v-slot="scope">
              <el-button type="primary" size="mini" class="edit-btn">编辑</el-button>
              <el-button type="danger" size="mini" class="delete-btn">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LiveList',
  methods: {
    handleExpand() {
      // 立即扩容的处理逻辑
      console.log('立即扩容');
    },
    handleSearch() {
      // 搜索处理逻辑
      console.log('搜索关键词:', this.searchKeyword);
    },
    handleSizeChange(size) {
      // 页面大小改变处理
      console.log('每页条数改变:', size);
      this.pagination.pageSize = size;
    },
    handleCurrentChange(current) {
      // 页码改变处理
      console.log('当前页码改变:', current);
      this.pagination.currentPage = current;
    },
    handleRecordAnalysis() {
      // 录制分析的处理逻辑
      console.log('录制分析');
    }
  },
  data() {
    return {
      // 选项卡状态
      activeTab: 'all',
      
      // 搜索关键词
      searchKeyword: '',
      
      // 统计数据
      stats: {
        totalStreamers: 1,
        liveNow: 0,
        recordingNow: 0,
        aiAnalysisHours: '599.81',
        detectedCount: 0
      },
      
      // 筛选条件
      accountFilter: 'all',
      videoFormat: '',
      videoQuality: '',
      
      // 表格数据
      streamerData: [
        {
          id: 1,
          nickname: '测试主播001',
          autoRecord: true,
          dataDashboard: true,
          danmuMonitor: true,
          avgYesterday: '2小时',
          recordYesterday: '1.5小时',
          folder: 'folder-001'
        },
        {
          id: 2,
          nickname: '测试主播002',
          autoRecord: false,
          dataDashboard: true,
          danmuMonitor: false,
          avgYesterday: '3.5小时',
          recordYesterday: '2小时',
          folder: 'folder-002'
        },
        {
          id: 3,
          nickname: '测试主播003',
          autoRecord: true,
          dataDashboard: false,
          danmuMonitor: true,
          avgYesterday: '1.8小时',
          recordYesterday: '1.2小时',
          folder: 'folder-003'
        },
        {
          id: 4,
          nickname: '测试主播004',
          autoRecord: true,
          dataDashboard: true,
          danmuMonitor: true,
          avgYesterday: '4小时',
          recordYesterday: '3小时',
          folder: 'folder-004'
        },
        {
          id: 5,
          nickname: '测试主播005',
          autoRecord: false,
          dataDashboard: false,
          danmuMonitor: false,
          avgYesterday: '0.5小时',
          recordYesterday: '0小时',
          folder: 'folder-005'
        },
        {
          id: 6,
          nickname: '测试主播006',
          autoRecord: true,
          dataDashboard: true,
          danmuMonitor: true,
          avgYesterday: '2.5小时',
          recordYesterday: '1.8小时',
          folder: 'folder-006'
        },
        {
          id: 7,
          nickname: '测试主播007',
          autoRecord: true,
          dataDashboard: true,
          danmuMonitor: false,
          avgYesterday: '3小时',
          recordYesterday: '2.5小时',
          folder: 'folder-007'
        },
        {
          id: 8,
          nickname: '测试主播008',
          autoRecord: false,
          dataDashboard: true,
          danmuMonitor: true,
          avgYesterday: '1.5小时',
          recordYesterday: '1小时',
          folder: 'folder-008'
        },
        {
          id: 9,
          nickname: '测试主播009',
          autoRecord: true,
          dataDashboard: false,
          danmuMonitor: false,
          avgYesterday: '2小时',
          recordYesterday: '1.5小时',
          folder: 'folder-009'
        },
        {
          id: 10,
          nickname: '测试主播010',
          autoRecord: true,
          dataDashboard: true,
          danmuMonitor: true,
          avgYesterday: '3.2小时',
          recordYesterday: '2.8小时',
          folder: 'folder-010'
        }
      ],
      // 分页数据
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 50
      }
    }
  },
  mounted() {
    console.log('直播列表页面已加载');
  }
}
</script>

<style scoped>
/* ========== 容器样式 ========== */
.live-list-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa; /* 明确设置浅灰色背景 */
  gap: 0;
  overflow-y: auto;
}

/* 美化滚动条 */
.live-list-container::-webkit-scrollbar {
  width: 6px;
}

.live-list-container::-webkit-scrollbar-track {
  background-color: transparent;
}

.live-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.live-list-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.25);
}

/* ========== 顶部区域样式 ========== */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* ========== 选项卡样式 ========== */
.custom-tabs {
  display: flex;
  gap: 8px;
}

.tab-item {
  padding: 8px 20px;
  color: #606266;
  cursor: pointer;
  transition: all 0.25s;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background-color: #f5f7fa;
  border: 1px solid transparent;
}

.tab-item:hover {
  color: #409eff;
  background-color: #ecf5ff;
  border-color: #c6e2ff;
}

.tab-item.active {
  color: #fff;
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
}

/* ========== 添加主播按钮 ========== */
.add-streamer-btn {
  background: linear-gradient(90deg, #67c23a 0%, #85ce61 100%);
  border: none;
  color: #fff;
  font-weight: 500;
  border-radius: 6px;
  padding: 8px 20px;
  transition: all 0.25s;
}

.add-streamer-btn:hover {
  background: linear-gradient(90deg, #85ce61 0%, #95d475 100%);
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

/* ========== 主要卡片样式 ========== */
.main-card {
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.25s;
}

.main-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.main-card >>> .el-card__body {
  padding: 20px;
}

/* ========== 搜索区域 ========== */
.search-area {
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.search-left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.search-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 320px;
}

.search-input >>> .el-input__inner {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #606266;
  border-radius: 6px;
  transition: all 0.25s;
}

.search-input >>> .el-input__inner:focus {
  background-color: #fff;
  border-color: #409eff;
}

.search-input >>> .el-input__prefix {
  color: #909399;
}

.search-btn {
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  border: none;
  color: #fff;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.25s;
}

.search-btn:hover {
  background: linear-gradient(90deg, #66b1ff 0%, #79bbff 100%);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.record-analysis-btn {
  background: linear-gradient(90deg, #e6a23c 0%, #f0b659 100%);
  border: none;
  color: #fff;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.25s;
}

.record-analysis-btn:hover {
  background: linear-gradient(90deg, #f0b659 0%, #f3c173 100%);
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
}

/* ========== 筛选区域 ========== */
.filter-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.account-filter >>> .el-radio-button__inner {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #606266;
  border-radius: 6px;
  transition: all 0.25s;
}

.account-filter >>> .el-radio-button__inner:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.account-filter >>> .el-radio-button.is-active .el-radio-button__inner {
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  border-color: #409eff;
  color: #fff;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
}

.filter-right {
  display: flex;
  gap: 12px;
}

.format-select,
.quality-select {
  width: 140px;
}

.format-select >>> .el-input__inner,
.quality-select >>> .el-input__inner {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #606266;
  border-radius: 6px;
  transition: all 0.25s;
}

.format-select >>> .el-input__inner:focus,
.quality-select >>> .el-input__inner:focus {
  background-color: #fff;
  border-color: #409eff;
}

/* ========== 数据统计卡片 ========== */
.stats-card {
  margin: 0 0 20px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 24px;
  align-items: center;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background-color: #f5f7fa;
  transition: all 0.25s;
}

.stats-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
}

.stats-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stats-value.online {
  color: #67c23a;
}

.stats-value.recording {
  color: #f56c6c;
}

.stats-action {
  justify-self: stretch;
  background-color: transparent;
}

.stats-action:hover {
  background-color: transparent;
  transform: none;
}

.expand-btn {
  width: 100%;
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  border: none;
  color: #fff;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.25s;
}

.expand-btn:hover {
  background: linear-gradient(90deg, #66b1ff 0%, #79bbff 100%);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* ========== 表格区域 ========== */
.table-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-header-container {
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.fixed-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  color: #303133;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.card-header span::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 16px;
  background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
  border-radius: 2px;
  margin-right: 10px;
}

.table-card {
  flex: 1;
  border-radius: 0 0 8px 8px;
  border: 1px solid #e4e7ed;
  border-top: none;
  background-color: #fff;
  overflow: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-card >>> .el-card__body {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ========== 表格样式 ========== */
.custom-table {
  flex: 1;
}

.custom-table >>> .el-table__header-wrapper {
  background-color: #fafafa;
}

.custom-table >>> .el-table__header th {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px 0;
}

.custom-table >>> .el-table__body tr {
  transition: all 0.25s;
}

.custom-table >>> .el-table__body tr:hover {
  background-color: #f5f7fa;
}

.custom-table >>> .el-table__body td {
  border-bottom: 1px solid #f0f2f5;
  padding: 12px 0;
  color: #606266;
}

/* ========== 开关样式 ========== */
.custom-table >>> .el-switch__core {
  background-color: #dcdfe6;
  border-color: #dcdfe6;
}

.custom-table >>> .el-switch.is-checked .el-switch__core {
  background-color: #409eff;
  border-color: #409eff;
}

/* ========== 按钮样式 ========== */
.custom-table >>> .el-button--primary.is-plain {
  color: #409eff;
  background-color: #ecf5ff;
  border-color: #b3d8ff;
}

.custom-table >>> .el-button--primary.is-plain:hover {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.custom-table >>> .el-button--success.is-plain {
  color: #67c23a;
  background-color: #f0f9ff;
  border-color: #c2e7b0;
}

.custom-table >>> .el-button--success.is-plain:hover {
  background-color: #67c23a;
  border-color: #67c23a;
  color: #fff;
}

.custom-table >>> .el-button--info.is-plain {
  color: #909399;
  background-color: #f4f4f5;
  border-color: #d3d4d6;
}

.custom-table >>> .el-button--info.is-plain:hover {
  background-color: #909399;
  border-color: #909399;
  color: #fff;
}

.edit-btn {
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  border: none;
  color: #fff;
  margin-right: 8px;
  transition: all 0.25s;
}

.edit-btn:hover {
  background: linear-gradient(90deg, #66b1ff 0%, #79bbff 100%);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.delete-btn {
  background: linear-gradient(90deg, #f56c6c 0%, #f78989 100%);
  border: none;
  color: #fff;
  transition: all 0.25s;
}

.delete-btn:hover {
  background: linear-gradient(90deg, #f78989 0%, #f9a3a3 100%);
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3);
}

/* ========== 分页样式 ========== */
.pagination-container {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
}

.pagination-container >>> .el-pagination {
  font-weight: 400;
}

.pagination-container >>> .el-pagination .btn-prev,
.pagination-container >>> .el-pagination .btn-next,
.pagination-container >>> .el-pagination .el-pager li {
  background-color: #f5f7fa;
  color: #606266;
  border-radius: 4px;
  margin: 0 4px;
  transition: all 0.25s;
}

.pagination-container >>> .el-pagination .btn-prev:hover,
.pagination-container >>> .el-pagination .btn-next:hover,
.pagination-container >>> .el-pagination .el-pager li:hover {
  color: #409eff;
}

.pagination-container >>> .el-pagination .el-pager li.active {
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
}

/* ========== 响应式设计 ========== */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .search-input {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-action {
    grid-column: span 2;
  }
  
  .filter-area {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    flex-direction: column;
  }
  
  .search-left,
  .search-right {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .format-select,
  .quality-select {
    width: 100%;
  }
}
</style>