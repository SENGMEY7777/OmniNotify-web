import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/admin',
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../components/layouts/DashbaordLayout.vue'),
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
  ],
})

export default router
