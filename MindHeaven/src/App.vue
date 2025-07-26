<script setup>
import { ref } from 'vue'
import { store } from './store.js'

// Import Views
import HomeView from './views/HomeView.vue'
import MoodTrackerView from './views/MoodTrackerView.vue'
import ForumView from './views/ForumView.vue'
import ResourcesView from './views/ResourcesView.vue'
import LoginView from './views/LoginView.vue'

const loginPageMode = ref('login') // 'login' or 'signup'

function openLoginModal() {
  loginPageMode.value = 'login'
  store.navigate('login')
}
function openSignupModal() {
  loginPageMode.value = 'signup'
  store.navigate('login')
}
</script>

<template>
  <main>
    <HomeView
      v-if="store.currentPage === 'home'"
      @open-login-modal="openLoginModal"
      @open-signup-modal="openSignupModal"
      @signup="openSignupModal"
      @login="openLoginModal"
    />
    <LoginView
      v-if="store.currentPage === 'login'"
      :mode="loginPageMode"
      @signup="openSignupModal"
      @login="openLoginModal"
    />
    <MoodTrackerView
      v-if="store.currentPage === 'mood-tracker'"
      @signup="openSignupModal"
    />
    <ForumView
      v-if="store.currentPage === 'forum'"
      @signup="openSignupModal"
    />
    <ResourcesView
      v-if="store.currentPage === 'resources'"
      @signup="openSignupModal"
    />
  </main>
</template>