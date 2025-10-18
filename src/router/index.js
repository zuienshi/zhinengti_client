import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import SmsLogin from '@/views/SmsLogin.vue'
import LiveList from '@/views/LiveList.vue'
import AddStreamer from '@/views/AddStreamer.vue'
import AiReview from '@/views/AiReview.vue'

Vue.use(Router)

const router = new Router({
  mode: 'hash',
  base: '/',
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: {
        requiresAuth: false // 临时移除登录要求，方便查看修改效果
      },
      children: [
        {
          path: 'live-list',
          name: 'LiveList',
          component: LiveList,
          meta: {
            requiresAuth: false
          }
        },
        {
          path: 'add-streamer',
          name: 'AddStreamer',
          component: AddStreamer,
          meta: {
            requiresAuth: false
          }
        },
        {
          path: 'ai-review',
          name: 'AiReview',
          component: AiReview,
          meta: {
            requiresAuth: false
          }
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        requiresAuth: false // 不需要登录
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: {
        requiresAuth: false // 不需要登录
      }
    },
    {
      path: '/sms-login',
      name: 'SmsLogin',
      component: SmsLogin,
      meta: {
        requiresAuth: false // 不需要登录
      }
    },
    // 404页面
    {
      path: '*',
      redirect: '/'
    }
  ]
})

// 全局路由守卫，用于检查登录状态
router.beforeEach((to, from, next) => {
  try {
    // 获取store中的登录状态
    const isAuthenticated = window.localStorage.getItem('userToken') !== null
    
    // 如果路由需要登录且用户未登录，则重定向到登录页
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      next({ path: '/login', replace: true })
    } 
    // 不自动从登录相关页面重定向到首页，保持窗口尺寸的一致性
    else {
      next()
    }
  } catch (error) {
    console.error('路由守卫错误:', error)
    next()
  }
})

export default router