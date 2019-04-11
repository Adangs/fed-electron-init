import Layout from '~/views/layout/index'

export default [
  {
    path: '/demo',
    component: Layout,
    children: [
      {
        path: '',
        name: 'demo',
        component: () => import(/* webpackChunkName: "common" */ '~/views/demo/index'),
        meta: { title: 'DEMO' }
      }]
  },
  { path: '*', redirect: '/404', hidden: true }
]
