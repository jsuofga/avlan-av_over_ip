import { createRouter, createWebHashHistory } from 'vue-router'
import { useStateStore } from '@/stores/stateStores'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/components/Home.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/components/Dashboard.vue')
  },
  {
    path: '/update',
    name: 'update',
    component: () => import('@/components/Update.vue')
  },
  {
    path: '/namezones',
    name: 'namezones',
    component: () => import('@/components/NameZones.vue')
  },
  {
    path: '/nameoutputs',
    name: 'nameoutputs',
    component: () => import('@/components/NameOutputs.vue')
  },
  {
    path: '/nameinputs',
    name: 'nameinputs',
    component: () => import('@/components/NameInputs.vue')
  },
  {
    path: '/zone/:index',
    name: 'zone',
    component: () => import('@/components/Zone.vue')
  },
  {
    path: '/timer',
    name: 'timer',
    component: () => import('@/components/Timer.vue')
  },
  {
    path: '/videoinputs',
    name: 'videoinputs',
    component: () => import('@/components/VideoInputs.vue')
  },
  {
    path: '/ipaddress',
    name: 'ipaddress',
    component: () => import('@/components/Ipaddress.vue')
  },
  {
    path: '/itach',
    name: 'itach',
    component: () => import('@/components/Itach.vue')
  },
  {
    path: '/remotecontrol/',
    name: 'remotecontrol',
    component: () => import('@/components/RemoteControl.vue'),
    props: true
  },
  {
    path: '/favoritechannels',
    name: 'favoritechannels',
    component: () => import('@/components/Favoritechannels.vue')
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
