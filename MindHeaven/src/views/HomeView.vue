<template>
  <section class="wrap">
    <!-- Hero -->
    <header class="hero">
      <h1>Welcome to MindHaven</h1>
      <h2>You Are Not Alone</h2>
      <p>Tools for tracking your mood, learning coping skills, and finding support.</p>
    </header>

    <!-- 三个功能卡片 -->
    <div class="cards">
      <article class="card" @click="go('forum')" tabindex="0" @keyup.enter="go('forum')">
        <div class="icon">👥</div>
        <h3>Community</h3>
        <p>Join discussions with other members</p>
      </article>

      <article class="card" @click="go('mood-tracker')" tabindex="0" @keyup.enter="go('mood-tracker')">
        <div class="icon">📈</div>
        <h3>Mood Tracker</h3>
        <p>Track your emotional well-being</p>
      </article>

      <article class="card" @click="go('resources')" tabindex="0" @keyup.enter="go('resources')">
        <div class="icon">📘</div>
        <h3>Resources</h3>
        <p>Access articles and coping tools</p>
      </article>
    </div>

    <!-- Snapshot 占位 -->
    <section class="panel">
      <h3>Community Snapshot</h3>
      <p class="muted">Here’s a brief look at our supportive community.</p>
      <div class="sk-wrap">
        <div class="sk"></div><div class="sk"></div><div class="sk"></div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { store } from '@/store'
function go(p){ store.navigate(p) }
</script>

<style scoped>
.wrap{ max-width: 1100px; margin: 0 auto; padding: 24px 16px 40px; }
.hero{ text-align:center; margin: 10px 0 24px; }
.hero h1{ font-size: 32px; color:#115e5c; margin:0 0 6px; }
.hero h2{ font-size: 26px; color:#1d7c7a; margin:0 0 10px; }
.hero p{ color:#566; margin:0 auto; max-width: 640px; }
.cards{ display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-top: 20px; }
.card{ background:#fff; border-radius:14px; padding:18px; text-align:center; box-shadow: 0 6px 20px rgba(0,0,0,.06);
  cursor:pointer; transition: transform .18s ease, box-shadow .18s ease; }
.card:hover{ transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,.10); }
.card .icon{ font-size: 28px; }
.card h3{ margin: 8px 0 6px; color:#135; }
.card p{ margin:0; color:#667; font-size: 14px; }
.panel{ background:#fff; border-radius:14px; padding:18px; margin-top: 24px; box-shadow: 0 6px 20px rgba(0,0,0,.05);}
.panel h3{ margin:0 0 6px; color:#135; }
.muted{ color:#667; font-size: 14px; margin:0; }
.sk-wrap{ margin-top:10px; display:grid; gap:8px; }
.sk{ height:10px; border-radius:6px; background: linear-gradient(90deg,#e8f6f5,#e1ecff); }
</style>
