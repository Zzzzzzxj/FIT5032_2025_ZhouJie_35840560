<template>
  <nav class="nav">
    <div class="nav__inner">
      <div class="nav__brand" @click="go('home')">MindHaven</div>

      <ul class="nav__links">
        <li><button :class="tab('home')" @click="go('home')">Home</button></li>
        <li><button :class="tab('forum')" @click="go('forum')">Community</button></li>
        <li><button :class="tab('mood-tracker')" @click="go('mood-tracker')">Mood Tracker</button></li>
        <li><button :class="tab('resources')" @click="go('resources')">Resources</button></li>
      </ul>

      <div class="nav__actions">
        <template v-if="!isLoggedIn">
          <button class="btn-pill" @click="$emit('open-login')">Log in</button>
          <button class="btn-pill" @click="$emit('open-login')">Sign up</button>
        </template>
        <template v-else>
          <span class="nav__hello">Hi, {{ displayName }}</span>
          <button class="btn-pill" @click="$emit('logout')">Sign out</button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
const props = defineProps({
  currentPage: { type: String, default: 'home' },
  isLoggedIn: { type: Boolean, default: false },
  displayName: { type: String, default: 'User' }
})
const emit = defineEmits(['navigate', 'open-login', 'logout'])
function go(p){ emit('navigate', p) }
function tab(p){ return ['tab', props.currentPage===p ? 'tab--active' : ''].join(' ') }
</script>

<style scoped>
.nav{
  position: sticky; top: 0; z-index: 50;
  background: linear-gradient(90deg,#21b0a5,#6d80ff);
  color: #fff; box-shadow: 0 1px 10px rgba(0,0,0,.08);
}
.nav__inner{ max-width: 1100px; margin: 0 auto; padding: 10px 16px;
  height: 60px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.nav__brand{ font-size: 20px; font-weight: 700; letter-spacing:.3px; cursor: pointer; }
.nav__links{ list-style: none; display: flex; gap: 8px; margin:0; padding:0; }
.tab{ padding:8px 12px; border-radius: 999px; border: 0; background: transparent; color:#fff; cursor:pointer; }
.tab:hover{ background: rgba(255,255,255,.18); }
.tab--active{ background:#fff; color:#1d6c6b; box-shadow:0 2px 6px rgba(0,0,0,.12); }
.nav__actions{ display:flex; align-items:center; gap:8px; }
.btn-pill{ padding:8px 12px; border-radius: 999px; background:#fff; color:#1d6c6b; border:0; cursor:pointer; }
.btn-pill:hover{ filter: brightness(0.95); }
.nav__hello{ opacity:.85; margin-right:6px; font-size: 14px; }
</style>
