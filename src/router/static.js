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
    path: '/404',
    component: () => import(/* webpackChunkName: "common" */ '~/views/404/index')
  }
]
