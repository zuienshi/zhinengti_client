<template>
  <div class="app-wrapper">
    <div class="app-container">
        <!-- 侧边栏导航 -->
      <div class="sidebar-container">
        <div class="logo-container">
          <img src="../views/img/logo.png" alt="智能体应用logo" style="width: 150px; height: auto;">
        </div>
        <div class="custom-menu-container">
          <div 
            v-for="menu in menuItems" 
            :key="menu.index"
            class="menu-item-wrapper"
          >
            <!-- 主菜单项 -->
            <div 
              :class="['menu-item', { active: activeMenu === menu.index }]"
              @click="toggleMenu(menu.index)"
            >
              <i :class="['menu-icon', menu.icon]"></i>
              <span>{{ menu.title }}</span>
              <!-- 展开/收起图标 -->
              <i 
                v-if="menu.children && menu.children.length > 0"
                :class="['expand-icon', { expanded: expandedMenus.includes(menu.index) }]"
              >
                <i class="el-icon-arrow-right"></i>
              </i>
            </div>
            
            <!-- 子菜单 -->
            <div 
              v-if="menu.children && menu.children.length > 0 && expandedMenus.includes(menu.index)"
              class="submenu-container"
            >
              <div 
                v-for="submenu in menu.children" 
                :key="submenu.index"
                :class="['submenu-item', { active: activeSubMenu === submenu.index }]"
                @click="selectMenuItem(submenu.index)"
              >
                <span>{{ submenu.title }}</span>
                <i class="submenu-icon el-icon-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
        
      <div class="content-container">
        <!-- 顶部导航栏 -->
        <el-header height="60px" class="header-container">
          <div class="header-left">
            <span class="header-title">{{ currentPageTitle }}</span>
          </div>
          <div class="header-right">
            <el-badge :value="unreadCount" class="notification-badge">
              <el-button size="small" icon="el-icon-bell" circle>
              </el-button>
            </el-badge>
            <el-dropdown trigger="click" class="user-dropdown">
              <span class="user-info">
                <el-avatar size="small" icon="el-icon-user"></el-avatar>
                <span class="user-name">管理员</span>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 主内容区域 -->
        <div class="main-container">
          <!-- 使用router-view显示子路由对应的页面 -->
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      activeMenu: '2',
      currentPageTitle: '直播监控',
      unreadCount: 5,
      totalTasks: 128,
      completedTasks: 96,
      processingTasks: 32,
      taskEfficiency: 75,
      chartDateRange: '30d',
      menuItems: [
      {
        index: '2',
        title: '直播监控',
        icon: 'el-icon-video-camera',
        children: [
          { index: '2-1', title: '直播列表' },
          { index: '2-2', title: '添加主播' },
          { index: '2-3', title: 'AI复盘' }
        ]
      },
        {
          index: '3',
          title: '智能对话',
          icon: 'el-icon-message'
        },
        {
          index: '4',
          title: '系统设置',
          icon: 'el-icon-setting'
        }
      ],
      expandedMenus: [], // 存储展开的菜单
      activeSubMenu: '', // 当前激活的子菜单项
      recentTasks: [
        {
          id: 1,
          title: '智能分析报告生成',
          description: '分析用户行为数据，生成季度报告',
          status: '已完成',
          time: '今天 09:23'
        },
        {
          id: 2,
          title: '模型训练任务',
          description: '训练新的预测模型，预计耗时3小时',
          status: '处理中',
          time: '今天 08:15'
        },
        {
          id: 3,
          title: '系统维护通知',
          description: '系统将于今晚22:00进行例行维护',
          status: '待处理',
          time: '昨天 18:30'
        },
        {
          id: 4,
          title: '用户反馈收集',
          description: '整理最近一周的用户反馈内容',
          status: '已完成',
          time: '昨天 14:20'
        }
      ]
    }
  },
  mounted() {
    console.log('Home页面已加载')
  },
  methods: {
    // 切换菜单展开状态
    toggleMenu(menuIndex) {
      const menu = this.menuItems.find(m => m.index === menuIndex);
      if (!menu || !menu.children) {
        this.selectMenuItem(menuIndex);
        return;
      }
      
      const index = this.expandedMenus.indexOf(menuIndex);
      if (index > -1) {
        this.expandedMenus.splice(index, 1);
      } else {
        this.expandedMenus.push(menuIndex);
      }
      
      // 设置为当前激活的主菜单
      this.activeMenu = menuIndex;
    },
    
    // 选择菜单项
    selectMenuItem(key) {
      // 检查是否是子菜单项
      const subMenuMatch = key.match(/^(\d+)-(\d+)$/);
      
      if (subMenuMatch) {
        const parentIndex = subMenuMatch[1];
        this.activeMenu = parentIndex;
        this.activeSubMenu = key;
        
        // 确保父菜单展开
        if (!this.expandedMenus.includes(parentIndex)) {
          this.expandedMenus.push(parentIndex);
        }
        
        // 查找子菜单标题和进行路由跳转
        const parentMenu = this.menuItems.find(m => m.index === parentIndex);
        if (parentMenu) {
          const subMenu = parentMenu.children.find(sm => sm.index === key);
          if (subMenu) {
            this.currentPageTitle = subMenu.title;
            
            // 根据子菜单索引进行路由跳转
            let routePath = '';
            switch (key) {
              case '2-1':
                routePath = '/home/live-list';
                break;
              case '2-2':
                routePath = '/home/add-streamer';
                break;
              case '2-3':
                routePath = '/home/ai-review';
                break;
              default:
                break;
            }
            
            if (routePath) {
              this.$router.push(routePath);
            }
          }
        }
      } else {
        // 处理主菜单项
        this.activeMenu = key;
        this.activeSubMenu = '';
        
        const selectedMenu = this.menuItems.find(menu => menu.index === key);
        if (selectedMenu) {
          this.currentPageTitle = selectedMenu.title;
        }
      }
      
      console.log('选中菜单:', key);
    },
    getTaskStatusType(status) {
      const statusMap = {
        '已完成': 'success',
        '处理中': 'primary',
        '待处理': 'warning',
        '已取消': 'danger'
      }
      return statusMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
/* 全局布局样式 */
.app-wrapper {
  width: 100%;
  height: 100vh;
}

.app-container {
  height: 100%;
  overflow: hidden;
  background-color: #0a0a0a;
  color: #ffffff;
}

/* 侧边栏样式 */
.sidebar-container {
  width: 240px;
  height: 100%;
  background-color: #000000;
  color: #fff;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.3);
  float: left;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1c3f3c;
  background-color: #000000;
}

.app-logo {
  color: #45ff93;
  margin: 0;
  font-size: 18px;
  width: 100px;
  height: auto;
}

/* 自定义菜单容器样式 */
.custom-menu-container {
  height: calc(100% - 60px);
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #000000;
}

/* 菜单项包装器 */
.menu-item-wrapper {
  width: 100%;
  margin: 4px 0;
}

/* 菜单项样式 */
.menu-item {
  background-color: #092225;
  color: #ffffff;
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  border-radius: 4px;
  margin: 0 20px;
  width: calc(100% - 40px);
  transition: all 0.3s ease;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  border: none;
  font-size: 15px;
  position: relative;
}

/* 菜单项悬停样式 */
.menu-item:hover {
  background-color: #1c3f3c;
  color: #45ff93;
  transform: translateY(-2px);
}

/* 菜单项激活样式 */
.menu-item.active {
  background-color: #1c3f3c;
  color: #45ff93;
  box-shadow: 0 2px 8px rgba(69, 255, 147, 0.3);
}

/* 菜单图标样式 */
.menu-icon {
  color: #ffffff;
  margin-right: 12px;
  font-size: 18px;
  width: 20px;
  text-align: center;
}

/* 激活状态和悬停状态下的图标颜色 */
.menu-item.active .menu-icon,
.menu-item:hover .menu-icon {
  color: #45ff93;
}

/* 展开/收起图标 */
.expand-icon {
  margin-left: auto;
  transition: transform 0.3s ease;
  color: #ffffff;
}

.expand-icon.expanded {
  transform: rotate(90deg);
  color: #45ff93;
}

/* 子菜单容器 */
.submenu-container {
  width: 100%;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-left: 0;
}

/* 子菜单项样式 */
.submenu-item {
  background-color: #0a2a2d;
  color: #ffffff;
  height: 40px;
  line-height: 40px;
  padding: 0 20px;
  margin: 2px 20px;
  width: calc(100% - 40px);
  border-radius: 4px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

/* 子菜单项悬停样式 */
.submenu-item:hover {
  background-color: #1c3f3c;
  color: #45ff93;
}

/* 子菜单项激活样式 */
.submenu-item.active {
  background-color: #1c3f3c;
  color: #45ff93;
}

/* 子菜单图标样式 */
.submenu-icon {
  font-size: 12px;
  color: #ffffff;
  transition: all 0.3s ease;
}

/* 激活和悬停状态的子菜单图标 */
.submenu-item:hover .submenu-icon,
.submenu-item.active .submenu-icon {
  color: #45ff93;
  transform: translateX(2px);
}

/* 顶部导航栏样式 */
.header-container {
  height: 60px;
  background-color: #121212;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #45ff93;
}

.header-right {
  display: flex;
  align-items: center;
}

.notification-badge {
  margin-right: 20px;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  margin-left: 8px;
  font-size: 14px;
  color: #ffffff;
}

/* 内容容器样式 */
.content-container {
  height: 100%;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
}

/* 主内容区域样式 */
.main-container {
  flex: 1;
  background-color: #1a1a1a;
  padding: 20px;
  overflow-y: auto;
  color: #ffffff;
}

/* 数据卡片样式 */
.data-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  background-color: #242424;
  border: 1px solid #333;
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  border-color: #45ff93;
}

.card-content {
  padding: 15px 0;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
  color: #45ff93;
  margin-bottom: 10px;
}

.card-title {
  font-size: 14px;
  color: #b0b0b0;
  margin-bottom: 10px;
}

.card-trend {
  font-size: 12px;
}

.trend-value {
  font-weight: bold;
  margin: 0 5px;
}

.el-icon-caret-top + .trend-value {
  color: #b6ff37;
}

.el-icon-caret-bottom + .trend-value {
  color: #7370f7;
}

.trend-text {
  color: #909399;
}

/* 图表行样式 */
.chart-row {
  margin-top: 0;
}

/* 卡片标题样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: bold;
  color: #ffffff;
}

/* 图表占位样式 */
.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #242424;
  border-radius: 4px;
}

.chart-area {
  text-align: center;
  color: #45ff93;
}

.chart-area .el-icon-pie-chart {
  font-size: 48px;
  margin-bottom: 10px;
  display: block;
  color: #b6ff37;
}

/* 最近任务时间线样式 */
.recent-card .el-timeline-item {
  padding-bottom: 20px;
}

.recent-card .el-card {
  margin-top: 5px;
  background-color: #242424;
  border: 1px solid #333;
  transition: all 0.3s ease;
}

.recent-card .el-card:hover {
  border-color: #7370f7;
}

.recent-card .el-card h4 {
  margin: 0 0 8px 0;
  color: #ffffff;
}

.recent-card .el-card p {
  margin: 0 0 10px 0;
  color: #b0b0b0;
  font-size: 14px;
  line-height: 1.5;
}

.recent-card .el-timeline-item__timestamp {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .el-col.is-16 {
    width: 100% !important;
  }
  .el-col.is-8 {
    width: 100% !important;
  }
}

@media (max-width: 768px) {
  .el-col.is-6 {
    width: 50% !important;
  }
  
  .sidebar-container {
    width: 200px !important;
  }
  
  .content-container {
    margin-left: 200px !important;
  }
  
  .app-logo {
    width: 100px;
    height: auto;
  }
  
  .main-container {
    padding: 10px;
  }
  
  .card-value {
    font-size: 24px;
  }
}
</style>