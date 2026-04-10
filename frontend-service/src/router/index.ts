import { createRouter, createWebHistory } from 'vue-router'
import TargetsView from '@/views/TargetsView.vue'
import { isAuthenticated } from '@/services/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/targets',
    },
    {
      path: '',
      component: () => import('@/modules/auth/AuthLayout.vue'),
      children: [
        {
          path: '/login',
          name: 'login',
          component: () => import("@/modules/auth/LoginView.vue"),
          meta: {
            guestOnly: true,
          },
        },
        {
          path: '/register',
          name: 'register',
          component: () => import("@/modules/auth/RegisterView.vue"),
          meta: {
            guestOnly: true,
          },
        },
      ]
    },

    {
      path: '',
      component: () => import('@/layouts/Layout.vue'),
      children: [
        {
          path: '/targets',
          name: 'targets',
          component: TargetsView,
          meta: {
            requiresAuth: true,
          },
        },
      ]
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && isAuthenticated()) {
    return { name: 'targets' }
  }

  return true
})

export default router

