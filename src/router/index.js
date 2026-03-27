// src/router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import HomePage from '../views/home-page.vue'
import TextHomePage from '../views/text-homepage.vue'
import TextRead from '../views/text-read.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/text-homepage',
    name: 'TextHomePage',
    component: TextHomePage
  },
  {
    path: '/article/:id',
    name: 'TextRead',
    component: TextRead,
    props: true
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router