import { createRouter, createWebHistory } from "vue-router";
import TargetsView from "@/modules/participant/targets/TargetsView.vue";
import { isAuthenticated } from "@/services/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "",
      redirect: (to) => {
        if (isAuthenticated()) {
          return { name: "targets" };
        } else {
          return { name: "login", query: { redirect: to.fullPath } };
        }
      },
    },
    {
      path: "",
      component: () => import("@/modules/auth/AuthLayout.vue"),
      children: [
        {
          path: "/login",
          name: "login",
          component: () => import("@/modules/auth/LoginView.vue"),
          meta: {
            guestOnly: true,
          },
        },
        {
          path: "/register",
          name: "register",
          component: () => import("@/modules/auth/RegisterView.vue"),
          meta: {
            guestOnly: true,
          },
        },
      ],
    },

    {
      path: "",
      component: () => import("@/modules/participant/ParticipantLayout.vue"),
      children: [
        {
          path: "/targets",
          name: "targets",
          component: TargetsView,
          meta: {
            requiresAuth: true,
          },
        },
        {
          path: "/targets/create",
          name: "target-create",
          component: () => import("@/modules/participant/targets/TargetCreateView.vue"),
          meta: {
            requiresAuth: true,
          },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && isAuthenticated()) {
    return { name: "targets" };
  }

  return true;
});

export default router;
