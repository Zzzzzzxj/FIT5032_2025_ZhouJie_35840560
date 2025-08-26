<script setup>
import Navbar from '../components/Navbar.vue'
import { ref, computed, watch } from 'vue'
import { store } from '../store.js'

const emit = defineEmits(['signup', 'login'])

const props = defineProps({
  mode: { type: String, default: 'login' },
})

const isRegistering = ref(props.mode === 'signup')
const loginError = ref('')
const loginForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  role: 'user',
})

watch(
  () => props.mode,
  (val) => {
    isRegistering.value = val === 'signup'
  },
)

const isValidEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.value.email))

const isValidLoginForm = computed(() => {
  const form = loginForm.value
  if (form.username.length < 3 || form.username.length > 20) return false
  if (form.password.length < 6) return false
  if (isRegistering.value && form.password !== form.confirmPassword) return false
  if (isRegistering.value && !isValidEmail.value) return false
  return true
})

function handleLogin() {
  const user = store.users.find(
    (u) => u.username === loginForm.value.username && u.password === loginForm.value.password,
  )
  if (user) {
    store.login(user)
    store.navigate('mood-tracker')
  } else {
    loginError.value = 'Invalid username or password.'
  }
}

function handleRegister() {
  if (!isValidLoginForm.value) return
  const existingUser = store.users.find((u) => u.username === loginForm.value.username)
  if (existingUser) {
    loginError.value = 'This username is already taken.'
    return
  }
  const newUser = {
    id: Date.now(),
    username: loginForm.value.username,
    password: loginForm.value.password,
    role: loginForm.value.role,
  }
  store.users.push(newUser)
  store.login(newUser)
  store.navigate('mood-tracker')
}

function handleSubmit() {
  loginError.value = ''
  if (isRegistering.value) {
    handleRegister()
  } else {
    handleLogin()
  }
}
</script>

<template>
  <div class="login-root">
    <Navbar @signup="emit('signup')" @login="emit('login')" />
    <div class="login-page">
      <div class="login-form card mx-auto" style="max-width: 400px">
        <div class="card-body">
          <h3 class="mb-4 text-center">{{ isRegistering ? 'Create Account' : 'Login' }}</h3>
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input
                type="text"
                class="form-control"
                v-model="loginForm.username"
                required
                minlength="3"
                maxlength="20"
              />
              <div class="form-text" v-if="loginForm.username.length < 3">
                Must be 3-20 characters.
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                v-model="loginForm.password"
                required
                minlength="6"
              />
              <div class="form-text" v-if="loginForm.password.length < 6">
                Must be at least 6 characters.
              </div>
            </div>
            <div class="mb-3" v-if="isRegistering">
              <label class="form-label">Confirm Password</label>
              <input
                type="password"
                class="form-control"
                v-model="loginForm.confirmPassword"
                required
              />
              <div
                class="form-text text-danger"
                v-if="loginForm.password !== loginForm.confirmPassword && loginForm.confirmPassword"
              >
                Passwords do not match.
              </div>
            </div>
            <div class="mb-3" v-if="isRegistering">
              <label class="form-label">Role</label>
              <select class="form-select" v-model="loginForm.role">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="mb-3" v-if="isRegistering">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="loginForm.email" required />
              <div class="form-text text-danger" v-if="loginForm.email && !isValidEmail">
                Invalid email format.
              </div>
            </div>
            <div class="alert alert-danger" v-if="loginError">{{ loginError }}</div>
            <button type="submit" class="btn btn-primary w-100" :disabled="!isValidLoginForm">
              {{ isRegistering ? 'Register' : 'Login' }}
            </button>
          </form>
          <div class="text-center mt-3">
            <a
              href="#"
              @click.prevent="isRegistering = !isRegistering"
              class="text-decoration-none"
            >
              {{
                isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"
              }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-root {
  background: #eafafc;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.login-form.card {
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(108, 92, 231, 0.12);
  border: none;
  max-width: 350px;
  margin: 0 auto;
}
.card-body {
  padding: 32px 24px;
}
.form-label {
  font-weight: 500;
  color: #6c5ce7;
}
input.form-control,
select.form-select {
  border-radius: 14px;
  font-size: 1.05em;
  padding: 10px 18px;
}
.btn-primary {
  border-radius: 20px;
  font-size: 1.08em;
  padding: 10px 0;
  font-weight: 500;
  margin-top: 12px;
}
.form-text {
  font-size: 0.95em;
}
.mb-3 {
  margin-bottom: 1.2rem !important;
}
.text-center.mt-3 {
  margin-top: 2rem !important;
}
@media (max-width: 600px) {
  .login-form.card {
    max-width: 98vw;
    padding: 0 4px;
  }
  .card-body {
    padding: 18px 8px;
  }
}
</style>
