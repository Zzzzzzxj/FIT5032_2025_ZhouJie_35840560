<script setup>
import { store } from '../store.js'
const emit = defineEmits(['signup', 'login'])

function go(page) {
  store.navigate(page)
}
function goSignup() {
  emit('signup')
}
function goLogin() {
  emit('login')
}
function logout() {
  store.logout()
}
</script>

<template>
  <div class="custom-navbar">
    <div class="navbar-left">
      <span class="brand">MindHaven</span>
    </div>
    <div class="navbar-center">
      <a class="nav-link" :class="{active: store.currentPage === 'home'}" @click="go('home')">Home</a>
      <a class="nav-link" :class="{active: store.currentPage === 'forum'}" @click="go('forum')">Community</a>
      <a class="nav-link" :class="{active: store.currentPage === 'mood-tracker'}" @click="go('mood-tracker')">Mood Tracker</a>
      <a class="nav-link" :class="{active: store.currentPage === 'resources'}" @click="go('resources')">Resources</a>
    </div>
    <div class="navbar-right">
      <button class="nav-btn" v-if="!store.isLoggedIn" @click="goLogin">Log in</button>
      <button class="nav-btn" v-if="!store.isLoggedIn" @click="goSignup">Sign up</button>
      <button class="nav-btn" v-if="store.isLoggedIn" @click="logout">Logout</button>
      <!-- 已移除两个图标按钮 -->
    </div>
  </div>
</template>

<style scoped>
.custom-navbar {
  width: 100%;
  background: #baf3f3;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 32px;
  box-sizing: border-box;
  margin-bottom: 12px;
}
.brand {
  font-size: 2rem;
  font-weight: bold;
  color: #218c7e;
}
.navbar-center {
  display: flex;
  gap: 32px;
}
.nav-link {
  font-size: 1.15rem;
  color: #218c7e;
  text-decoration: none;
  padding: 4px 12px;
  border-radius: 8px;
  transition: background 0.2s;
  cursor: pointer;
}
.nav-link.active,
.nav-link:hover {
  background: #eafafc;
  font-weight: bold;
}
.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.nav-btn {
  border: 2px solid #218c7e;
  background: #fff;
  border-radius: 24px;
  padding: 6px 22px;
  font-size: 1rem;
  margin-right: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.nav-btn:hover {
  background: #eafafc;
}
.nav-icon {
  font-size: 1.5rem;
  color: #218c7e;
  margin-left: 4px;
}
</style>