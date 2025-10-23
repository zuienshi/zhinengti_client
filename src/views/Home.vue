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
            <el-dropdown trigger="click" class="user-dropdown" @command="handleCommand">
              <span class="user-info">
                <el-avatar size="small" icon="el-icon-user"></el-avatar>
                <span class="user-name">管理员</span>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="profile">个人设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
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
    // 检查登录状态
    this.checkLoginStatus()
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = localStorage.getItem('userToken')
      console.log('Home页面检查登录状态:', token ? '已登录' : '未登录')
      if (!token) {
        console.log('未登录，重定向到登录页')
        this.$router.replace('/login')
      }
    },
    
    // 处理下拉菜单命令
    handleCommand(command) {
      console.log('菜单命令:', command)
      if (command === 'logout') {
        this.handleLogout()
      } else if (command === 'profile') {
        this.$message.info('个人设置功能开发中...')
      }
    },
    
    // 处理退出登录
    handleLogout() {
      console.log('开始退出登录流程')
      
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('用户确认退出登录')
        
        // 清除登录状态
        localStorage.removeItem('userToken')
        this.$store.commit('LOGOUT')
        
        console.log('登录状态已清除')
        
        // 通知主进程退出登录
        try {
          if (window.electronAPI && window.electronAPI.logout) {
            console.log('调用 window.electronAPI.logout')
            window.electronAPI.logout()
          } else {
            console.log('使用备用方案发送 logout IPC')
            const { ipcRenderer } = require('electron')
            ipcRenderer.send('logout')
          }
        } catch (e) {
          console.error('发送 IPC 消息失败:', e)
        }
        
        // 延迟跳转，等待主进程处理
        setTimeout(() => {
          console.log('跳转到登录页')
          this.$router.replace('/login')
        }, 300)
        
        this.$message.success('退出登录成功')
      }).catch(() => {
        console.log('用户取消退出登录')
      })
    },
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
/* ========== 全局布局样式 ========== */
.app-wrapper {
  width: 100%;
  height: 100vh;
  background-color: #f5f7fa; /* 更浅的背景色 */
}

.app-container {
  height: 100%;
  overflow: hidden;
  background-color: #f5f7fa;
  color: rgba(0, 0, 0, 0.85);
  display: flex;
}

/* ========== 侧边栏样式 ========== */
.sidebar-container {
  width: 200px;
  height: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%); /* 白色渐变背景 */
  border-right: 1px solid #e4e7ed;
  box-shadow: 2px 0 8px 0 rgba(0, 0, 0, 0.04);
  flex-shrink: 0; /* 不允许缩小 */
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px;
}

.logo-container img {
  max-width: 85%;
  height: auto;
  max-height: 40px;
}

/* ========== 自定义菜单容器样式 ========== */
.custom-menu-container {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
}

/* 滚动条美化 */
.custom-menu-container::-webkit-scrollbar {
  width: 4px;
}

.custom-menu-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.custom-menu-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

/* ========== 菜单项样式 ========== */
.menu-item-wrapper {
  width: 100%;
  margin-bottom: 4px;
}

.menu-item {
  color: #606266;
  height: 42px;
  line-height: 42px;
  padding: 0 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background-color: transparent;
}

.menu-item:hover {
  background-color: #f0f2f5;
  color: #409eff;
}

.menu-item.active {
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

/* ========== 菜单图标样式 ========== */
.menu-icon {
  margin-right: 10px;
  font-size: 16px;
  width: 18px;
  text-align: center;
  opacity: 0.8;
}

.menu-item:hover .menu-icon,
.menu-item.active .menu-icon {
  opacity: 1;
}

/* ========== 展开/收起图标 ========== */
.expand-icon {
  margin-left: auto;
  transition: transform 0.3s;
  font-size: 12px;
  opacity: 0.6;
}

.menu-item:hover .expand-icon {
  opacity: 1;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

/* ========== 子菜单样式 ========== */
.submenu-container {
  background-color: transparent;
  overflow: hidden;
  padding-left: 12px;
}

.submenu-item {
  color: #606266;
  height: 36px;
  line-height: 36px;
  padding: 0 12px 0 28px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px;
  transition: all 0.25s;
  margin-bottom: 2px;
  position: relative;
}

.submenu-item::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #c0c4cc;
  transition: all 0.25s;
}

.submenu-item:hover {
  background-color: #f0f2f5;
  color: #409eff;
}

.submenu-item:hover::before {
  background-color: #409eff;
  transform: translateY(-50%) scale(1.2);
}

.submenu-item.active {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.submenu-item.active::before {
  background-color: #409eff;
  width: 6px;
  height: 6px;
}

.submenu-icon {
  font-size: 12px;
  opacity: 0;
  transition: all 0.25s;
}

.submenu-item:hover .submenu-icon,
.submenu-item.active .submenu-icon {
  opacity: 1;
}

/* ========== 内容容器样式 ========== */
.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  min-width: 0; /* 防止flex子项溢出 */
}

/* ========== 顶部导航栏样式 ========== */
.header-container {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  flex-shrink: 0;
}

.header-left {
  flex: 1;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
}

.header-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 16px;
  background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
  border-radius: 2px;
  margin-right: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* ========== 通知徽章 ========== */
.notification-badge {
  cursor: pointer;
}

.notification-badge .el-button {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  color: #606266;
  transition: all 0.25s;
}

.notification-badge .el-button:hover {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
  color: #409eff;
}

/* ========== 用户下拉菜单 ========== */
.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.25s;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
}

.user-info:hover {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
}

.user-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

/* ========== 主内容区域样式 ========== */
.main-container {
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 美化主内容区滚动条 */
.main-container::-webkit-scrollbar {
  width: 6px;
}

.main-container::-webkit-scrollbar-track {
  background-color: transparent;
}

.main-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.main-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.25);
}

/* ========== Element UI 组件样式覆盖 ========== */
/* 头像样式 */
.el-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
}

/* 下拉菜单样式 */
::v-deep .el-dropdown-menu {
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px 0;
}

::v-deep .el-dropdown-menu__item {
  padding: 8px 20px;
  font-size: 14px;
  color: #606266;
  transition: all 0.25s;
}

::v-deep .el-dropdown-menu__item:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

/* 徽章样式 */
::v-deep .el-badge__content {
  background-color: #f56c6c;
  border: 2px solid #fff;
  font-weight: 500;
}

/* ========== 响应式设计 - 只保留小屏幕优化 ========== */
@media (max-width: 768px) {
  .main-container {
    padding: 16px;
  }
  
  .header-container {
    padding: 0 16px;
  }
  
  .header-title {
    font-size: 14px;
  }
}

/* 小屏幕时也保持侧边栏完整显示 */
@media (max-width: 1200px) {
  /* 不再收起侧边栏，保持200px宽度 */
}
</style>