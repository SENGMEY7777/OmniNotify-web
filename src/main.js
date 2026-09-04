import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initTheme } from '@/utils/theme'

import App from './App.vue'
import router from './router'

initTheme()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
