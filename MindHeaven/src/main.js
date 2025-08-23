import { createApp } from 'vue'
import App from './App.vue'

// PrimeVue core (v4)
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'   // ✅ v4 主题预设（不是 .css）

// PrimeVue components（按需增减）
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'

// 只需要 primeicons（不需要 primevue/resources/*.css 了）
import 'primeicons/primeicons.css'

// 你的全局样式
import './assets/main.css'

const app = createApp(App)

// ✅ 用 JS 主题预设激活主题（可加可选项）
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      // 可选：暗色/自定义前缀等
      // darkModeSelector: '.dark',
      // prefix: 'p'
    }
  }
})

app.use(ToastService)

// 全局注册常用组件
app.component('Button', Button)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Card', Card)
app.component('Dropdown', Dropdown)
app.component('InputText', InputText)
app.component('Calendar', Calendar)
app.component('Dialog', Dialog)
app.component('Textarea', Textarea)
app.component('Tag', Tag)
app.component('Message', Message)
app.component('Toast', Toast)

app.mount('#app')
