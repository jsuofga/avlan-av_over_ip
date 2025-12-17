import { createRouter, createWebHashHistory } from 'vue-router'
import { useStateStore } from '@/stores/stateStores'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/Home.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/Dashboard.vue')
  },
  {
    path: '/update',
    name: 'update',
    component: () => import('@/pages/Update.vue')
  },
  {
    path: '/namezones',
    name: 'namezones',
    component: () => import('@/pages/NameZones.vue')
  },
  {
    path: '/nameoutputs',
    name: 'nameoutputs',
    component: () => import('@/pages/NameOutputs.vue')
  },
  {
    path: '/nameinputs',
    name: 'nameinputs',
    component: () => import('@/pages/NameInputs.vue')
  },
  {
    path: '/zone/:index',
    name: 'zone',
    component: () => import('@/pages/Zone.vue')
  },
  {
    path: '/timer',
    name: 'timer',
    component: () => import('@/pages/Timer.vue')
  },
  {
    path: '/videoinputs',
    name: 'videoinputs',
    component: () => import('@/pages/VideoInputs.vue')
  },
  {
    path: '/ipaddress',
    name: 'ipaddress',
    component: () => import('@/pages/Ipaddress.vue')
  },
  {
    path: '/itach',
    name: 'itach',
    component: () => import('@/pages/Itach.vue')
  },
  {
    path: '/remotecontrol/',
    name: 'remotecontrol',
    component: () => import('@/pages/RemoteControl.vue'),
    props: true
  },
  {
    path: '/favoritechannels',
    name: 'favoritechannels',
    component: () => import('@/pages/Favoritechannels.vue')
  }
]

const adminRoutes = [
  '/ipaddress',
  '/namezones',
  '/nameoutputs',
  '/nameinputs',
  '/itach',
  '/favoritechannels',
  '/timer',
  '/update'
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const stateStore = useStateStore()
  if (adminRoutes.includes(to.path)) {
    if (!stateStore.isAuthenticated) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
