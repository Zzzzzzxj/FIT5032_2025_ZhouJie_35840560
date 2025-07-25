import { reactive } from 'vue'

export const store = reactive({
  // App state
  currentPage: 'home', // 'home', 'mood-tracker', 'forum', 'resources'
  isLoggedIn: false,
  currentUser: null,
  alerts: [],

  // Data
  users: [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, username: 'user', password: 'user123', role: 'user' }
  ],
  moodEntries: [],
  forumPosts: [],
  resources: [],

  // --- Methods ---

  // Alert methods
  showAlert(message, type = 'info') {
    const alert = { id: Date.now(), message, type }
    this.alerts.push(alert)
    setTimeout(() => this.removeAlert(alert.id), 3500)
  },
  removeAlert(id) {
    const index = this.alerts.findIndex((alert) => alert.id === id)
    if (index > -1) {
      this.alerts.splice(index, 1)
    }
  },

  // Auth methods
  login(user) {
    this.isLoggedIn = true
    this.currentUser = user
    this.currentPage = 'mood-tracker' // Redirect after login
    this.showAlert(`Welcome back, ${user.username}!`, 'success')
  },
  logout() {
    const username = this.currentUser.username
    this.isLoggedIn = false
    this.currentUser = null
    this.currentPage = 'home'
    this.showAlert(`You have been logged out.`, 'info')
  },
  
  // Navigation
  navigate(page) {
    this.currentPage = page
  }
})