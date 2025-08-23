<template>
  <Dialog
    :visible="modelValue"
    @update:visible="close"
    modal
    :closable="true"
    :draggable="false"
    :breakpoints="{ '960px': '32rem', '640px': '90vw' }"
    :style="{ width: '32rem' }"
    dismissableMask
  >
    <template #header>
      <div class="hdr">
        <div class="hdr__title">Sign in to continue</div>
        <div class="hdr__sub">Use your university or personal email.</div>
      </div>
    </template>

    <div class="wrap">
      <!-- 错误提示 -->
      <Message v-if="errorMsg" severity="error" :closable="false" class="mb-3" aria-live="polite">
        {{ errorMsg }}
      </Message>

      <form class="form" @submit.prevent="onSubmit">
        <div class="field">
          <label for="email" class="lbl">Email</label>
          <span class="p-input-icon-left wfull">
            <i class="pi pi-envelope" />
            <InputText
              id="email"
              v-model.trim="email"
              type="email"
              class="wfull"
              autocomplete="email"
              placeholder="you@example.com"
              :invalid="touched && !emailOK"
              @blur="touched = true"
              required
            />
          </span>
          <small v-if="touched && !emailOK" class="err">Please enter a valid email.</small>
        </div>

        <div class="field">
          <label for="password" class="lbl">Password</label>
          <span class="p-input-icon-left wfull">
            <i class="pi pi-lock" />
            <InputText
              :type="showPwd ? 'text' : 'password'"
              id="password"
              v-model.trim="password"
              class="wfull"
              autocomplete="current-password"
              placeholder="Enter password"
              :invalid="touched && !pwdOK"
              @blur="touched = true"
              required
            />
          </span>
          <div class="row">
            <Checkbox v-model="showPwd" :binary="true" inputId="showpwd" />
            <label for="showpwd">Show password</label>
          </div>
          <small v-if="touched && !pwdOK" class="err">Password must be at least 6 characters.</small>
        </div>

        <div class="row">
          <Checkbox v-model="createMode" :binary="true" inputId="create" />
          <label for="create">Create a new account</label>
        </div>

        <Button
          type="submit"
          :label="createMode ? 'Create account' : 'Sign in'"
          class="btn-primary wfull"
          :loading="loading"
          icon="pi pi-check"
        />
      </form>

      <div class="divider">
        <span>or</span>
      </div>

      <Button
        class="btn-google wfull"
        icon="pi pi-google"
        label="Continue with Google"
        @click="onGoogle"
        :loading="loadingGoogle"
      />

      <div class="guest">
        <Button link label="Continue as guest" @click="onGuest" />
      </div>

      <p class="disclaimer">
        This app provides self-help tools and general information about mental wellbeing.
        It does not replace professional diagnosis or treatment. In emergencies,
        contact local emergency services.
      </p>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Message from 'primevue/message'

// 这里使用你现有的 Firebase 方法名（如与你的文件不一致，把名字改成你当前 firebase.js 导出的即可）
import {
  emailSignIn,
  emailSignUp,
  googleSignIn,
} from '@/firebase.js'
import { store } from '@/store'
const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const email = ref('')
const password = ref('')
const createMode = ref(false)
const showPwd = ref(false)
const touched = ref(false)

const loading = ref(false)
const loadingGoogle = ref(false)
const errorMsg = ref('')

const emailOK = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const pwdOK = computed(() => (password.value || '').length >= 6)

function close(v) {
  emit('update:modelValue', v)
}
function reset() {
  email.value = ''
  password.value = ''
  createMode.value = false
  showPwd.value = false
  touched.value = false
  errorMsg.value = ''
}

async function onSubmit() {
  touched.value = true
  errorMsg.value = ''
  if (!emailOK.value || !pwdOK.value) return

  loading.value = true
  try {
    if (createMode.value) {
      await emailSignUp(email.value, password.value)
    } else {
      await emailSignIn(email.value, password.value)
    }
    reset()
    close(false)
  } catch (e) {
    errorMsg.value = toMsg(e)
  } finally {
    loading.value = false
  }
}

async function onGoogle() {
  errorMsg.value = ''
  loadingGoogle.value = true
  try {
    await googleSignIn()
    reset()
    close(false)
  } catch (e) {
    errorMsg.value = toMsg(e)
  } finally {
    loadingGoogle.value = false
  }
}

async function onGuest() {
  errorMsg.value = ''
  loading.value = true
  try {
    // 不走 Firebase，直接设成本地游客
    store.isLoggedIn.value = true
    store.currentUser.value = { uid: 'guest', displayName: 'Guest' }
    store.currentRole.value = 'guest'
    reset()
    close(false)
  } catch (e) {
    errorMsg.value = toMsg(e)
  } finally {
    loading.value = false
  }
}


function toMsg(e) {
  const txt = String(e?.message || e || '')
  // 更友好的错误文案
  if (/invalid-credential|wrong-password|user-not-found/i.test(txt)) return 'Email or password is incorrect.'
  if (/email-already-in-use/i.test(txt)) return 'This email is already in use.'
  if (/popup-closed|cancelled/i.test(txt)) return 'The sign-in popup was closed.'
  if (/network-request-failed/i.test(txt)) return 'Network error. Please try again.'
  return txt.replace(/^Firebase:\s*/i, '')
}
</script>

<style scoped>
/* Header */
.hdr { display:flex; flex-direction:column; gap:2px; }
.hdr__title { font-weight:700; font-size:18px; color:#123; }
.hdr__sub { font-size:12px; color:#6b7280; }

/* Layout */
.wrap { display:flex; flex-direction:column; gap:12px; }
.form { display:flex; flex-direction:column; gap:12px; }
.field { display:flex; flex-direction:column; gap:6px; }
.lbl { font-size:13px; color:#334155; }
.row { display:flex; align-items:center; gap:8px; }

/* Buttons */
.btn-primary { background:#10b981; border:0; }
.btn-primary:hover { filter: brightness(0.95); }

.btn-google {
  background:#fff; color:#374151; border:1px solid #e5e7eb;
}
.btn-google:hover { background:#f8fafc; }

/* Divider */
.divider {
  display:flex; align-items:center; gap:10px; color:#94a3b8; font-size:12px; user-select:none;
}
.divider::before, .divider::after {
  content:''; height:1px; flex:1; background: #e5e7eb;
}

/* Helpers */
.wfull { width:100%; }
.mb-3 { margin-bottom:.75rem; }
.err { color:#dc2626; font-size:12px; }

/* Footer */
.guest { text-align:center; margin-top:4px; }
.disclaimer { color:#6b7280; font-size:12px; line-height:1.45; margin: 6px 0 0; }
</style>
