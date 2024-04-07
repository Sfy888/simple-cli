import { createApp } from 'vue'
import App from './App.vue'
import elementPlus from 'element-plus'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import 'element-plus/dist/index.css'


const app = createApp(App)

app.use(elementPlus)

app.mount('#app')
