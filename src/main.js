import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles.css'
console.log("🚀 Vue app starting...");

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
console.log("✅ Vue app mounted.");