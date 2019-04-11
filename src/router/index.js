import Vue from 'vue'
import Router from 'vue-router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import staticRouter from './static' // 静态路由列表

NProgress.configure({ showSpinner: false }) // NProgress Configuration
Vue.use(Router)

const router = new Router({
  mode: 'hash',
  routes: staticRouter
})

// 路由开始钩子
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  next()
})

// 路由结束钩子
router.afterEach((to, from, next) => {
  // 路由发生变化修改页面title
  if (to.meta.title) {
    document.title = to.meta.title
  }
  // finish progress bar
  NProgress.done()
})

export default router
