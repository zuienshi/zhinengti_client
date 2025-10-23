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
      redirect: to => {
        // 检查登录状态，决定重定向到哪里
        const token = localStorage.getItem('userToken')
        return token ? '/home' : '/login'
      }
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: {
        requiresAuth: true // 恢复登录要求
      },
      children: [
        {
          path: 'live-list',
          name: 'LiveList',
          component: LiveList,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'add-streamer',
          name: 'AddStreamer',
          component: AddStreamer,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'ai-review',
          name: 'AiReview',
          component: AiReview,
          meta: {
            requiresAuth: true
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
    // 获取登录状态
    const isAuthenticated = localStorage.getItem('userToken') !== null
    
    console.log('路由守卫:', {
      to: to.path,
      from: from.path,
      isAuthenticated,
      requiresAuth: to.matched.some(record => record.meta.requiresAuth)
    })
    
    // 如果路由需要登录且用户未登录，则重定向到登录页
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      console.log('未登录，重定向到登录页')
      next({ path: '/login', replace: true })
    } 
    // 如果已登录且访问登录页，重定向到首页
    else if (isAuthenticated && to.path === '/login') {
      console.log('已登录，从登录页重定向到首页')
      next({ path: '/home', replace: true })
    }
    else {
      next()
    }
  } catch (error) {
    console.error('路由守卫错误:', error)
    next()
  }
})

export default router