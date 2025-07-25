<script setup>
import { ref } from 'vue'
import { store } from './store.js'

// Import Components
import Navbar from './components/Navbar.vue'
import LoginModal from './components/LoginModal.vue'

// Import Views
import HomeView from './views/HomeView.vue'
import MoodTrackerView from './views/MoodTrackerView.vue'
import ForumView from './views/ForumView.vue'
import ResourcesView from './views/ResourcesView.vue'

const showLoginModal = ref(false)

function getAlertIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    danger: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  }
  return icons[type] || 'fa-info-circle'
}
</script>

<template>
  <Navbar @open-login-modal="showLoginModal = true" />

  <main>
    <HomeView v-if="store.currentPage === 'home'" @open-login-modal="showLoginModal = true" />
    <MoodTrackerView v-if="store.currentPage === 'mood-tracker'" />
    <ForumView v-if="store.currentPage === 'forum'" />
    <ResourcesView v-if="store.currentPage === 'resources'" />
  </main>
  
  <LoginModal v-if="showLoginModal" @close-modal="showLoginModal = false" />
  
  <div class="alert-container">
    <div
      v-for="alert in store.alerts"
      :key="alert.id"
      class="alert alert-dismissible fade show shadow-lg"
      :class="`alert-${alert.type}`"
      role="alert"
    >
      <i class="fas me-2" :class="getAlertIcon(alert.type)"></i>
      {{ alert.message }}
      <button
        type="button"
        class="btn-close"
        @click="store.removeAlert(alert.id)"
      ></button>
    </div>
  </div>
</template>