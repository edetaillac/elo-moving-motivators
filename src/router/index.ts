import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import GameView from '../views/GameView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'game',
    component: GameView
  },
  {
    path: '/reveal',
    name: 'reveal',
    // Lazy-loaded: the manager reveal page is a separate, occasional entry point.
    component: () => import(/* webpackChunkName: "reveal" */ '../views/RevealView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
