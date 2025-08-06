<script setup>
import { useRouter } from 'vue-router';
import { isAuthenticated, logout } from '@/stores/authStore'; // Import authentication state and logout function

const router = useRouter();

/**
 * Handles the logout action.
 */
const handleLogout = () => {
  logout(); // Call the logout function
  router.push('/login'); // Redirect to the login page after logout
};
</script>

<template>
  <header class="d-flex justify-content-center py-3">
    <ul class="nav nav-pills">
      <li class="nav-item">
        <router-link to="/" class="nav-link" active-class="active" aria-current="page"
          >Home (Week 5)</router-link
        >
      </li>
      <li class="nav-item">
        <router-link to="/about" class="nav-link" active-class="active">About</router-link>
      </li>
      <li class="nav-item" v-if="!isAuthenticated">
        <router-link to="/addbook" class="nav-link" active-class="active">Add Book</router-link>
      </li>
      <li class="nav-item" v-if="!isAuthenticated">
        <router-link to="/login" class="nav-link" active-class="active">Login</router-link>
      </li>
      <li class="nav-item" v-else>
        <a href="#" @click.prevent="handleLogout" class="nav-link">Logout</a>
      </li>
      <li class="nav-item">
        <router-link to="/Firelogin" class="nav-link" active-class="active">Firebase Login</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/FireRegister" class="nav-link" active-class="active">Firebase Register</router-link>
      </li>
      <li>
        <router-link to="/WeatherCheck" class="nav-link" active-class="active">Get Weather</router-link>
      </li>
      <li>
        <router-link to="/CountBookAPI" class="nav-link" active-class="active">Count Book API</router-link>
      </li>
    </ul>
  </header>
</template>

<style scoped>
/* Keep empty or include only styles specific to this component */
</style>
