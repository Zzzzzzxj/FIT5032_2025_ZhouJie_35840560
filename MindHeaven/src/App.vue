<script setup>
import { ref } from 'vue'
import { store } from './store.js'

import { onMounted } from 'vue'
import { listenAuth } from './firebase.js'
import { store } from './store'
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



onMounted(() => {
  listenAuth((user) => {
    if (user) {
      store.isLoggedIn.value = true
      store.currentUser.value = {
        uid: user.uid,
        displayName: user.displayName || 'User'

      }

    } else {
      store.isLoggedIn.value = false
      store.currentUser.value = null
    }
  })
})


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