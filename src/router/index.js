import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/AuthView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/AuthView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot',
      component: () => import('../views/AuthView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('../views/VerifyEmailView.vue'),
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
      component: () => import('../components/layouts/DashbaordLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/AdminDashboardView.vue'),
        },
        {
          path: 'manage-user',
          name: 'manage-user',
          component: () => import('../views/admin/ManageUser.vue'),
        },
        {
          path: 'notification',
          name: 'notification',
          component: () => import('../views/admin/ManageNotification.vue'),
        },
        {
          path: 'template',
          name: 'template',
          component: () => import('../views/admin/TemplateDashbard.vue'),
        },
        {
          path: 'delivery-log',
          name: 'delivery-log',
          component: () => import('../views/admin/DeliveryLog.vue'),
        },
        {
          path: 'audit-log',
          name: 'audit-log',
          component: () => import('../views/admin/AuditLog.vue'),
        },
        {
          path: 'setting',
          name: 'setting',
          component: () => import('../views/pages/profileAdmin/Setting.vue'),
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
      component: () => import('../views/UserHomeView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
  ],
})

router.beforeEach((to) => {
  const hasToken = Boolean(localStorage.getItem('token'))
  if (to.meta.requiresAuth && !hasToken) return { name: 'login' }
  if (to.meta.guestOnly && hasToken) return { name: JSON.parse(localStorage.getItem('user') || '{}').role === 'user' ? 'user-home' : 'admin-dashboard' }
  const role = JSON.parse(localStorage.getItem('user') || '{}').role
  if (to.meta.role && role && to.meta.role !== role) return { name: role === 'user' ? 'user-home' : 'admin-dashboard' }
})

export default router
