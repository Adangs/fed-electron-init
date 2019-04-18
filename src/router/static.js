import Layout from '~/views/layout/index'
export default [
  {
    path: '/',
    component: Layout,
    children: [{
      path: '',
      name: '矿工助手',
      component: () => import(/* webpackChunkName: "common" */ '~/views/home/index'),
      meta: { title: '矿工助手' }
    }]
  },
  {
    path: '/update',
    name: '下载更新',
    component: () => import(/* webpackChunkName: "common" */ '~/views/update/index'),
    meta: { title: '下载更新' }
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "common" */ '~/views/404/index')
  }
]
