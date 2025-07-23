<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login, isAuthenticated } from '@/stores/authStore'; // Import authentication state and login function

const router = useRouter();

const username = ref('');
const password = ref('');
const loginError = ref('');
const loginSuccess = ref(false); // New ref to control success message visibility

/**
 * Handles the submission of the login form.
 */
const handleLogin = () => {
  loginError.value = ''; // Clear previous error messages
  loginSuccess.value = false; // Clear previous success message

  if (login(username.value, password.value)) {
    loginSuccess.value = true; // Set success message to visible
    // Delay redirection slightly to allow user to see the success message
    setTimeout(() => {
      router.push('/about');
    }, 1500); // Redirect after 1.5 seconds
  } else {
    loginError.value = 'Invalid username or password.'; // Display error message
  }
};

// If the user is already authenticated, redirect them directly to the About page
// to prevent showing the login page again.
if (isAuthenticated.value) {
  router.push('/about');
}
</script>

<template>
  <div class="login-container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h2 class="text-center mb-4">Login to Your Account</h2>
        <form @submit.prevent="handleLogin" class="p-4 border rounded shadow-sm">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input
              type="text"
              class="form-control"
              id="username"
              v-model="username"
              required
            />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="password"
              required
            />
          </div>
          <div v-if="loginError" class="alert alert-danger" role="alert">
            {{ loginError }}
          </div>
          <div v-if="loginSuccess" class="alert alert-success" role="alert">
            Login successful! Redirecting...
          </div>
          <div class="d-grid">
            <button type="submit" class="btn btn-primary">Login</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  margin-top: 50px;
  padding: 20px;
}
</style>
