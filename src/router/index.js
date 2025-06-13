import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Notificaciones from '../components/Notificaciones.vue' // 👈 Esta línea es nueva

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/notificaciones',
      name: 'notificaciones',
      component: Notificaciones,
    }
  ],
})

export default router
