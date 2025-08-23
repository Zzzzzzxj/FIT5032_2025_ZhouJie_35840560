<template>
  <section class="wrap home">
    <!-- Hero -->
    <div class="hero-section">
      <h1 class="page-title">Welcome to MindHaven</h1>
      <h2 class="page-subtitle">You Are Not Alone</h2>
      <p class="page-desc">
        Tools for tracking your mood, learning coping skills, and finding support.
      </p>
    </div>

    <!-- function card -->
    <div class="features-row">
      <div class="card feature-card" @click="store.navigate('forum')" role="button" tabindex="0">
        <i class="pi pi-users" style="font-size: 2rem;"></i>
        <h3>Community</h3>
        <p class="muted">Join discussions with other members</p>
      </div>

      <div class="card feature-card" @click="store.navigate('mood-tracker')" role="button" tabindex="0">
        <i class="pi pi-chart-line" style="font-size: 2rem;"></i>
        <h3>Mood Tracker</h3>
        <p class="muted">Track your emotional well-being</p>
      </div>

      <div class="card feature-card" @click="store.navigate('resources')" role="button" tabindex="0">
        <i class="pi pi-book" style="font-size: 2rem;"></i>
        <h3>Resources</h3>
        <p class="muted">Access articles and coping tools</p>
      </div>
    </div>

    <!-- Community Snapshot -->
    <Card class="card-panel">
      <template #title>Community Snapshot</template>
      <template #content>
        <p class="muted">Here’s a brief look at our supportive community.</p>

        <ul v-if="latestPosts.length" class="snapshot-list">
          <li v-for="p in latestPosts" :key="p.id">
            <strong class="snap-title">{{ p.title }}</strong>
            <span class="meta">
              • {{ p.category }} · {{ formatDate(p.createdAt) }}
              <template v-if="p.tags?.length"> · {{ p.tags.join(', ') }}</template>
            </span>
          </li>
        </ul>

        <div v-else class="snapshot-empty">
          <i class="pi pi-info-circle"></i>
          <span>No posts yet. Be the first to share with the community!</span>
        </div>

        <div class="right">
          <Button label="View All Posts" icon="pi pi-arrow-right" @click="store.navigate('forum')" />
        </div>
      </template>
    </Card>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { store } from '@/store'
import Card from 'primevue/card'
const latestPosts = computed(() => {
  const list = (store.forumPosts.value || [])
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 3)
  return list
})

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleDateString()
  } catch {
    return '-'
  }
}
</script>

<style scoped>
.right { display:flex; justify-content:flex-end; }

.snapshot-list {
  list-style: none;
  padding: 0;
  margin: 10px 0 16px;
}
.snapshot-list li {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.45;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}
.snap-title { color: #222; }
.meta { color: #777; font-size: 12px; margin-top: 2px; }

.snapshot-empty{
  display:flex; align-items:center; gap:8px;
  color:#6b7280; background:#f8f9fb; border-radius:8px; padding:10px 14px;
}

/* from earlier: layout spacing */
.wrap.home{ max-width: 1100px; margin: 0 auto; padding: 0 16px 28px; }
.features-row{ display:grid; grid-template-columns: repeat(3,1fr); gap:16px; margin:6px 0 18px; }
.feature-card{ text-align:center; padding:22px 16px; cursor:pointer; }
@media (max-width:980px){ .features-row{ grid-template-columns: repeat(2,1fr);} }
@media (max-width:640px){ .features-row{ grid-template-columns: 1fr;} }
</style>
