import { reactive, watchEffect } from 'vue'

// Load data
function load(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

// Save data
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

export const store = reactive({
  // App state
  currentPage: 'home', // 'home', 'mood-tracker', 'forum', 'resources'
  isLoggedIn: false,
  currentUser: null,
  alerts: [],

  // Data
  users: load('users', [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, username: 'user', password: 'user123', role: 'user' }
  ]),
  moodEntries: load('moodEntries', []),
  forumPosts: load('forumPosts', [
    {
      id: 1001,
      content: 'How do you cope with stress during exams?',
      category: 'students',
      date: '2025-07-20',
      likes: 3,
      replies: [
        { id: 2001, content: 'I take short walks and listen to music.', date: '2025-07-21', userId: 2 }
      ],
      showReplies: false,
      userId: 2
    },
    {
      id: 1002,
      content: 'Anyone has tips for managing anxiety?',
      category: 'anxiety',
      date: '2025-07-18',
      likes: 5,
      replies: [],
      showReplies: false,
      userId: 1
    }
  ]),
  resources: load('resources', [
    {
      id: 3001,
      title: 'Coping with Exam Stress',
      description: 'Practical strategies to manage stress during exam periods.',
      type: 'article',
      date: '2025-07-10',
      rating: 4.5,
      ratingCount: 4,
      views: 12
    },
    {
      id: 3002,
      title: 'Guided Meditation for Anxiety',
      description: 'A 10-minute guided meditation video to help reduce anxiety.',
      type: 'video',
      date: '2025-07-12',
      rating: 4.8,
      ratingCount: 6,
      views: 20
    },
    {
      id: 3003,
      title: '24/7 Support Hotline',
      description: 'Contact our support hotline for immediate help.',
      type: 'contact',
      date: '2025-07-01',
      rating: 5.0,
      ratingCount: 2,
      views: 8
    }
 ]),

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

// Autosave
watchEffect(() => {
  save('users', store.users)
  save('moodEntries', store.moodEntries)
  save('forumPosts', store.forumPosts)
  save('resources', store.resources)
})