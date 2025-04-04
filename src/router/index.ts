// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import UserListView from '@/views/UserListView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      props: route => ({ userId: Number(route.query.userId) })
    },
    {
      path: '/users',
      name: 'users',
      component: UserListView
    },
    {
      path: '/auth/callback',
      name: 'googleCallback',
      component: () => import('@/views/GoogleCallbackView.vue')
    }
  ]
});

export default router;