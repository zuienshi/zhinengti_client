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
.live-list-container {
  padding: 20px;
  color: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  gap: 8px;
}

/* 主要卡片样式 */
.main-card {
  border-radius: 8px;
  margin-bottom: 16px;
}

/* 深色卡片样式 */
.dark-card {
  background-color: #1a1a1a;
  border: 1px solid #333;
}

.operation-card {
  margin: 16px 0;
}

.dark-card >>> .el-card__body {
  background-color: #1a1a1a;
  padding: 20px;
}

/* 白色卡片样式 */
.white-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
}

.white-card >>> .el-card__body {
  background-color: #ffffff;
  padding: 0;
}

/* 独立头部区域样式 */
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 8px;
    background-color: #1a1a1a;
    padding: 0px;
  }

.custom-tabs {
  flex: 1;
  display: flex;
  background-color: transparent; /* 透明背景 */
  border-radius: 8px;
  padding: 0;
  gap: 4px;
}

.tab-item {
  padding: 10px 24px;
  text-align: center;
  color: #8a8a8a;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background-color: #1a1a1a;
  border: 1px solid #333;
}

.tab-item:hover {
  color: #45ff93;
  border-color: #45ff93;
  box-shadow: 0 0 8px rgba(69, 255, 147, 0.15);
}

.tab-item.active {
  color: #ffffff;
  background: linear-gradient(135deg, #45ff93 0%, #2cb868 100%);
  border-color: #45ff93;
  box-shadow: 0 0 12px rgba(69, 255, 147, 0.3);
}

/* 添加主播按钮 */
.add-streamer-btn {
  background: linear-gradient(135deg, #45ff93 0%, #2cb868 100%);
  border: none;
  color: #ffffff;
  font-weight: bold;
  border-radius: 4px;
  margin-left: 16px;
}

.add-streamer-btn:hover {
  background: linear-gradient(135deg, #50ff9c 0%, #36d374 100%);
}



/* 搜索区域 */
.search-area {
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.search-btn {
  background: linear-gradient(135deg, #45ff93 0%, #2cb868 100%);
  border: none;
  color: #ffffff;
  font-weight: bold;
}

.record-analysis-btn {
  background: linear-gradient(135deg, #ff9345 0%, #ff6b6b 100%);
  border: none;
  color: #ffffff;
  font-weight: bold;
}

.record-analysis-btn:hover {
  background: linear-gradient(135deg, #ff9c52 0%, #ff7979 100%);
}

.search-input .el-input__inner {
  background-color: #2a2a2a;
  border-color: #444;
  color: #ffffff;
}

.search-input .el-input__suffix-inner {
  color: #999;
}

/* 数据统计Card样式 */
.stats-card {
  margin: 16px 0;
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
  padding: 8px;
}

.stats-label {
  font-size: 14px;
  color: #8a8a8a;
  margin-bottom: 4px;
}

.stats-value {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}

.stats-value.online {
  color: #45ff93;
}

.stats-value.recording {
  color: #ff4545;
}

.stats-action {
  justify-self: end;
}

.expand-btn {
  background-color: #1c3f3c;
  border-color: #45ff93;
  color: #45ff93;
}

/* 筛选区域 */
.filter-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  color: #b0b0b0;
  font-size: 14px;
}

.account-filter .el-radio-button__inner {
  background-color: #1a1a1a;
  border-color: #333;
  color: #b0b0b0;
}

.account-filter .el-radio-button__inner:hover {
  color: #45ff93;
  border-color: #45ff93;
}

.account-filter .is-active .el-radio-button__inner {
  background-color: #1c3f3c;
  border-color: #45ff93;
  color: #45ff93;
}

.filter-right {
  display: flex;
  gap: 16px;
}

.format-select, .quality-select {
  width: 120px;
}

.format-select .el-input__inner,
.quality-select .el-input__inner {
  background-color: #1a1a1a;
  border-color: #333;
  color: #ffffff;
}

/* 表格区域 */
.table-section {
  flex: 1;
  overflow: hidden;
}

.table-header-container {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.fixed-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.table-card {
  border-radius: 0 0 8px 8px;
  height: calc(100% - 60px);
  overflow: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.card-header span {
  color: #333333;
  font-weight: bold;
  font-size: 16px;
}

/* 移除卡片自带的header样式，使用我们自定义的固定header */
.table-card >>> .el-card__header {
  padding: 0 !important;
  border-bottom: none !important;
}

/* 表格样式 */
.custom-table {
  color: #333333;
}

/* 分页样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.custom-table .el-table__header {
  border-bottom: 1px solid #333;
}

.custom-table .el-table__header th {
  background-color: #f5f7fa;
  color: #606266;
  border-bottom: none;
}

.custom-table .el-table__body {
  background-color: #ffffff;
}

.custom-table .el-table__row {
  border-bottom: 1px solid #ebeef5;
}

.custom-table .el-table__row:hover {
  background-color: #f5f7fa;
}

.custom-table .el-table__cell {
  border-bottom: 1px solid #ebeef5;
}

.custom-table .el-switch__core {
  background-color: #555;
  border: #333;
}

.custom-table .el-switch__core:after {
  background-color: #888;
}

.custom-table .is-checked .el-switch__core {
  background-color: #45ff93;
}

.custom-table .is-checked .el-switch__core:after {
  background-color: #ffffff;
}

.custom-table .el-button--primary.is-plain {
  color: #45ff93;
  border-color: #45ff93;
}

.custom-table .el-button--success.is-plain {
  color: #45ff93;
  border-color: #45ff93;
}

.custom-table .el-button--info.is-plain {
  color: #7370f7;
  border-color: #7370f7;
}

.edit-btn {
  background-color: #1c3f3c;
  border-color: #45ff93;
  color: #45ff93;
  margin-right: 8px;
}

.delete-btn {
  background-color: #452424;
  border-color: #ff4545;
  color: #ff4545;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .card-value {
    font-size: 16px;
  }
  
  .search-input {
    width: 250px;
  }
}

@media (max-width: 992px) {
  .overview-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .overview-card {
    padding: 12px;
  }
  
  .card-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
    margin-right: 10px;
  }
  
  .card-value {
    font-size: 16px;
  }
  
  .expand-tag {
    font-size: 9px;
    padding: 1px 6px;
  }
  
  .filter-area {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-left, .search-right {
    width: 100%;
  }
  
  .search-right {
    justify-content: flex-end;
    margin-top: 12px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .format-select, .quality-select {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-action {
    grid-column: span 2;
    justify-self: center;
  }
}

@media (max-width: 576px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .overview-card {
    gap: 10px;
  }
}
</style>