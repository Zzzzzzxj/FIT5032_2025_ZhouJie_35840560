<script setup>
import { store } from '../store.js'
const emit = defineEmits(['open-login-modal'])
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light fixed-top">
    <div class="container">
      <a class="navbar-brand fw-bold" href="#" @click.prevent="store.navigate('home')">
        <i class="fas fa-heart text-primary me-2"></i>MindHaven
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item" v-if="store.isLoggedIn">
            <a class="nav-link" href="#" @click.prevent="store.navigate('mood-tracker')">
              <i class="fas fa-chart-line me-1"></i>Mood Tracker
            </a>
          </li>
          <li class="nav-item" v-if="store.isLoggedIn">
            <a class="nav-link" href="#" @click.prevent="store.navigate('forum')">
              <i class="fas fa-comments me-1"></i>Community Forum
            </a>
          </li>
          <li class="nav-item" v-if="store.isLoggedIn">
            <a class="nav-link" href="#" @click.prevent="store.navigate('resources')">
              <i class="fas fa-book me-1"></i>Resources
            </a>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item" v-if="!store.isLoggedIn">
            <a class="nav-link" href="#" @click.prevent="emit('open-login-modal')">
              <i class="fas fa-sign-in-alt me-1"></i>Login
            </a>
          </li>
          <li class="nav-item" v-if="store.isLoggedIn">
            <div class="dropdown">
              <a
                class="nav-link dropdown-toggle text-primary fw-bold"
                href="#"
                data-bs-toggle="dropdown"
              >
                <i class="fas fa-user-circle me-1"></i>{{ store.currentUser.username }}
                <span class="badge bg-primary ms-1">{{ store.currentUser.role }}</span>
              </a>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="store.logout()">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                  </a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>