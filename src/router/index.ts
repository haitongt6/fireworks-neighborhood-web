import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue')
        },
        {
          path: 'products',
          component: () => import('../views/ProductLayout.vue'),
          redirect: { name: 'ProductList' },
          children: [
            {
              path: '',
              name: 'ProductList',
              component: () => import('../views/ProductList.vue')
            },
            {
              path: 'add',
              name: 'ProductAdd',
              component: () => import('../views/ProductForm.vue')
            },
            {
              path: 'edit/:id',
              name: 'ProductEdit',
              component: () => import('../views/ProductForm.vue')
            },
            {
              path: 'categories',
              redirect: { path: '/category' }
            }
          ]
        },
        {
          path: 'category',
          name: 'CategoryList',
          component: () => import('../views/CategoryList.vue')
        },
        {
          path: 'orders',
          name: 'Orders',
          component: () => import('../views/OrderList.vue')
        },
        {
          path: 'points',
          name: 'Points',
          component: () => import('../views/PointList.vue')
        },
        {
          path: 'settings',
          component: () => import('../views/SettingsLayout.vue'),
          redirect: { name: 'UserList' },
          children: [
            {
              path: 'users',
              name: 'UserList',
              component: () => import('../views/UserList.vue')
            },
            {
              path: 'roles',
              name: 'RoleList',
              component: () => import('../views/RoleList.vue')
            },
            {
              path: 'menus',
              name: 'MenuList',
              component: () => import('../views/MenuList.vue')
            }
          ]
        }
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next({ path: '/login', replace: true })
  } else if (to.path === '/login' && token) {
    next({ path: '/', replace: true })
  } else if (to.path === '/settings/settings/users') {
    next({ path: '/settings/users', replace: true })
  } else if (to.path === '/settings/settings/roles') {
    next({ path: '/settings/roles', replace: true })
  } else if (to.path === '/settings/settings/menus') {
    next({ path: '/settings/menus', replace: true })
  } else {
    next()
  }
})

export default router
