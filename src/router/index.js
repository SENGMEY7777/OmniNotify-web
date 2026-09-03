import { createRouter, createWebHistory } from 'vue-router'
import { getCookie } from '@/utils/cookies'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot',
      component: () => import('@/views/auth/ForgotPasswordView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPasswordView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('@/views/auth/VerifyEmailView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/',
      name: 'home',
      redirect: '/login',
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/components/layout/DashboardLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/AdminDashboardView.vue'),
        },
        {
          path: 'manage-user',
          name: 'manage-user',
          component: () => import('@/views/admin/ManageUserView.vue'),
        },
        {
          path: 'notification',
          name: 'notification',
          component: () => import('@/views/admin/ManageNotificationView.vue'),
        },
        {
          path: 'template',
          name: 'template',
          component: () => import('@/views/admin/TemplateDashboardView.vue'),
        },
        {
          path: 'delivery-log',
          name: 'delivery-log',
          component: () => import('@/views/admin/DeliveryLogView.vue'),
        },
        {
          path: 'audit-log',
          name: 'audit-log',
          component: () => import('@/views/admin/AuditLogView.vue'),
        },
        {
          path: 'setting',
          name: 'setting',
          component: () => import('@/views/admin/SettingView.vue'),
        }
      ],
    },
    {
      path: '/dashboard',
      redirect: '/admin',
    },
    {
      path: '/user',
      name: 'user-home',
      component: () => import('@/views/user/UserHomeView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
  ],
})

router.beforeEach((to) => {
  const hasToken = Boolean(getCookie('token') || localStorage.getItem('token'))
  if (to.meta.requiresAuth && !hasToken) return { name: 'login' }
  if (to.meta.guestOnly && hasToken) return { name: JSON.parse(localStorage.getItem('user') || '{}').role === 'user' ? 'user-home' : 'admin-dashboard' }
  const role = JSON.parse(localStorage.getItem('user') || '{}').role
  if (to.meta.role && role && to.meta.role !== role) return { name: role === 'user' ? 'user-home' : 'admin-dashboard' }
})

export default router
