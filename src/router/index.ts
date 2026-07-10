import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home-page.vue')
  },
  {
    path: '/text-homepage',
    name: 'TextHomePage',
    component: () => import('@/views/text-homepage.vue')
  },
  {
    path: '/article/:id',
    name: 'TextRead',
    component: () => import('@/views/text-read.vue'),
    props: true
  },
  {
    path: '/classification/:category?',
    name: 'ClassificationPage',
    component: () => import('@/views/classification-page.vue'),
    props: true
  },
  {
    path: '/personal',
    name: 'PersonalHomepage',
    component: () => import('@/views/personal-homepage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
