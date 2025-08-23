// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'

// —— 全局状态（你已有的 store）——
import { store } from './store'

// —— PrimeVue（v4 写法）——
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'       // 主题预设（不再用老的 CSS 路径）
import 'primeicons/primeicons.css'

// 常用组件（交互表格 / 表单 / 弹窗 等）
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import Calendar from 'primevue/calendar'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip' // 指令

// —— Firebase 初始化（外部认证 D.1）——
import './firebase'

// —— Mapbox 样式（地理位置 E.2）——
import 'mapbox-gl/dist/mapbox-gl.css'

const app = createApp(App)

// 挂载 PrimeVue（使用 Aura 主题预设）
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      // 可按需启用 dark 模式或调色板：
      // dark: true,
      // cssLayer: true
    }
  }
})

// 全局服务
app.use(ToastService)

// 全局组件（需要哪里直接 <DataTable/> 等即可）
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('InputText', InputText)
app.component('Dropdown', Dropdown)
app.component('Button', Button)
app.component('Dialog', Dialog)
app.component('Checkbox', Checkbox)
app.component('Calendar', Calendar)
app.component('Tag', Tag)
app.component('Toast', Toast)

// 指令
app.directive('tooltip', Tooltip)

// 全局注入 store（也可在组件里直接 import { store } 使用）
app.provide('store', store)

app.mount('#app')
