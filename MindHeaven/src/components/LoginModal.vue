<script setup>
import { ref, computed } from 'vue'
import { store } from '../store.js'

const emit = defineEmits(['close-modal'])

// Local state for the modal
const isRegistering = ref(false)
const loginError = ref('')
const loginForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  role: 'user'
})

// Validation
const isValidLoginForm = computed(() => {
  const form = loginForm.value
  if (form.username.length < 3 || form.username.length > 20) return false
  if (form.password.length < 6) return false
  if (isRegistering.value && form.password !== form.confirmPassword) return false
  return true
})

function handleLogin() {
  const user = store.users.find(
    u => u.username === loginForm.value.username && u.password === loginForm.value.password
  )
  if (user) {
    store.login(user) // Use the central login method
    emit('close-modal')
  } else {
    loginError.value = 'Invalid username or password.'
  }
}

function handleRegister() {
  if (!isValidLoginForm.value) return
  const existingUser = store.users.find(u => u.username === loginForm.value.username)
  if (existingUser) {
    loginError.value = 'This username is already taken.'
    return
  }

  const newUser = {
    id: Date.now(),
    username: loginForm.value.username,
    password: loginForm.value.password,
    role: loginForm.value.role
  }

  store.users.push(newUser)
  store.login(newUser) // Log in the new user immediately
  emit('close-modal')
}

function handleSubmit() {
    loginError.value = '';
    if (isRegistering.value) {
        handleRegister();
    } else {
        handleLogin();
    }
}
</script>

<template>
  <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" @click.self="emit('close-modal')">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title">{{ isRegistering ? 'Create Account' : 'Login' }}</h5>
          <button type="button" class="btn-close" @click="emit('close-modal')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input type="text" class="form-control" v-model="loginForm.username" required minlength="3" maxlength="20" />
              <div class="form-text">Must be 3-20 characters.</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" v-model="loginForm.password" required minlength="6" />
               <div class="form-text">Must be at least 6 characters.</div>
            </div>
            <div class="mb-3" v-if="isRegistering">
              <label class="form-label">Confirm Password</label>
              <input type="password" class="form-control" v-model="loginForm.confirmPassword" required />
              <div
                class="form-text text-danger"
                v-if="loginForm.password !== loginForm.confirmPassword && loginForm.confirmPassword"
              >
                Passwords do not match.
              </div>
            </div>
            <div class="alert alert-danger" v-if="loginError">{{ loginError }}</div>
            <button type="submit" class="btn btn-primary w-100" :disabled="!isValidLoginForm">
              {{ isRegistering ? 'Register' : 'Login' }}
            </button>
          </form>
          <div class="text-center mt-3">
            <a href="#" @click.prevent="isRegistering = !isRegistering" class="text-decoration-none">
              {{ isRegistering ? 'Already have an account? Login' : "Don't have an account? Register" }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>