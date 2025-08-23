<template>
  <Navbar
    :current-page="store.currentPage.value"
    :is-logged-in="store.isLoggedIn.value"
    :display-name="store.currentUser.value?.displayName || 'User'"
    @navigate="onNavigate"
    @open-login="showLogin = true"
    @logout="onLogout"
  />

  <Toast position="top-right" />

  <main class="min-h-screen">
    <HomeView v-if="store.currentPage.value === 'home'" />
    <ForumView v-else-if="store.currentPage.value === 'forum'" />
    <MoodTrackerView v-else-if="store.currentPage.value === 'mood-tracker'" />
    <ResourcesView v-else-if="store.currentPage.value === 'resources'" />
    <HomeView v-else />
  </main>

  <LoginModal v-model="showLogin" />
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { store } from './store'
import { listenAuth, logout as fbLogout } from './firebase.js'
import Navbar from './components/Navbar.vue'
import LoginModal from './components/LoginModal.vue'
import HomeView from './views/HomeView.vue'
import ForumView from './views/ForumView.vue'
import MoodTrackerView from './views/MoodTrackerView.vue'
import ResourcesView from './views/ResourcesView.vue'

const showLogin = ref(false)

onMounted(() => {
  listenAuth((user) => {
    if (user) {
      store.isLoggedIn.value = true
      store.currentUser.value = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || ''
      }
      store.currentRole.value = store.resolveRoleFor(user)
    } else {
      store.isLoggedIn.value = false
      store.currentUser.value = null
      store.currentRole.value = 'guest'
    }
  })
})

function onNavigate(page) {
  store.navigate(page)
}

async function onLogout() {
  await fbLogout().catch(() => {})
  store.logout()       
}
</script>

<style scoped>
.alerts { position: fixed; right: 12px; bottom: 12px; display: grid; gap: 8px; z-index: 60; }
.alert {
  background: #fff; color: #123; border-left: 4px solid #8aa; border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,.08);
  padding: 10px 12px; cursor: pointer; min-width: 220px; max-width: 360px;
  font-size: 14px;
}
.alert[data-type="success"]{ border-left-color: #17b26a; }
.alert[data-type="info"]{ border-left-color: #2e90fa; }
.alert[data-type="warn"]{ border-left-color: #fdb022; }
.alert[data-type="error"]{ border-left-color: #f04438; }
</style>
