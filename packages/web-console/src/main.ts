/**
 * @auto-test-agent/web-console
 *
 * 网页控制台入口
 */

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './index.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: App
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#root')
