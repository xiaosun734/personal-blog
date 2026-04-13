// src/router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import HomePage from '../views/home-page.vue'
import TextHomePage from '../views/text-homepage.vue'
import TextRead from '../views/text-read.vue'
import ClassificationPage from '../views/classification-page.vue'
import PersonalHomepage from '../views/personal-homepage.vue'

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
  },
  {
    path: '/classification/:category?',
    name: 'ClassificationPage',
    component: ClassificationPage,
    props: true
  },
  {
    path: '/personal',
    name: 'PersonalHomepage',
    component: PersonalHomepage
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router