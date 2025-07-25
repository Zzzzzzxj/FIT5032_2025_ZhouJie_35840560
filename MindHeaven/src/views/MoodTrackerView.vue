<script setup>
import { ref, computed } from 'vue';
import { store } from '../store.js';

// Local state for the form
const newMoodEntry = ref({
  mood: 5,
  notes: ''
});

// Computed property to get mood entries for the current user
const userMoodEntries = computed(() => {
  if (!store.currentUser) return [];
  // Filter global entries and sort by date
  return store.moodEntries
    .filter(entry => entry.userId === store.currentUser.id)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
});

const recentMoodEntries = computed(() => {
  return userMoodEntries.value.slice(-7);
});

const averageMood = computed(() => {
  if (userMoodEntries.value.length === 0) return 0;
  const sum = userMoodEntries.value.reduce((acc, entry) => acc + parseInt(entry.mood, 10), 0);
  return sum / userMoodEntries.value.length;
});

// Validation
const isValidMoodEntry = computed(() => {
  return newMoodEntry.value.notes.length <= 500;
});

function getMoodBadgeClass(mood) {
  if (mood >= 8) return 'bg-success';
  if (mood >= 6) return 'bg-warning';
  if (mood >= 4) return 'bg-info';
  return 'bg-danger';
}

function getMoodDescription(mood) {
  if (mood >= 8) return 'Feeling Great';
  if (mood >= 6) return 'Feeling Good';
  if (mood >= 4) return 'Feeling Okay';
  return 'Feeling Down';
}

function addMoodEntry() {
  if (!isValidMoodEntry.value) return;
  const entry = {
    id: Date.now(),
    mood: newMoodEntry.value.mood,
    notes: newMoodEntry.value.notes,
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    userId: store.currentUser.id
  };
  store.moodEntries.push(entry);
  store.showAlert('Mood entry saved!', 'success');
  // Reset form
  newMoodEntry.value = { mood: 5, notes: '' };
}
</script>

<template>
  <div class="container" style="margin-top: 100px;">
    <div class="row">
      <div class="col-lg-8 mb-4">
        <div class="card">
          <div class="card-header">
            <h4><i class="fas fa-chart-line me-2"></i>Today's Mood Entry</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="addMoodEntry">
              <div class="mb-4">
                <label class="form-label fw-bold">How are you feeling today? (1-10)</label>
                <input type="range" class="mood-slider" v-model.number="newMoodEntry.mood" min="1" max="10" />
                <div class="d-flex justify-content-between mt-2">
                  <small class="text-muted">Very Down</small>
                  <span class="text-primary fw-bold fs-5">{{ newMoodEntry.mood }}</span>
                  <small class="text-muted">Very Good</small>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Notes for today (optional)</label>
                <textarea
                  class="form-control"
                  v-model="newMoodEntry.notes"
                  rows="3"
                  placeholder="Describe what happened or how you feel..."
                ></textarea>
                <div class="form-text" :class="{ 'text-danger': !isValidMoodEntry }">
                  {{ newMoodEntry.notes.length }}/500 characters
                </div>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="!isValidMoodEntry">
                <i class="fas fa-save me-2"></i>Save Entry
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-4 mb-4">
        <div class="card">
          <div class="card-header">
            <h5><i class="fas fa-chart-bar me-2"></i>7-Day Mood Trend</h5>
          </div>
          <div class="card-body">
            <div class="mood-chart">
              <div v-for="(entry, index) in recentMoodEntries" :key="index"
                   class="mood-bar"
                   :style="{ height: entry.mood * 25 + 'px' }"
                   :title="`${entry.date}: ${entry.mood}/10`">
              </div>
            </div>
            <div class="mt-3 text-center">
              <small class="text-muted">7-Day Average: {{ averageMood.toFixed(1) }}/10</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-2">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between">
            <h5><i class="fas fa-history me-2"></i>Mood History</h5>
            <small class="text-muted">{{ userMoodEntries.length }} entries total</small>
          </div>
          <div class="card-body" style="max-height: 400px; overflow-y: auto;">
            <div v-if="userMoodEntries.length === 0" class="text-center text-muted py-4">
              <p>No mood entries yet. Start by adding one today!</p>
            </div>
            <div v-else>
              <div v-for="entry in [...userMoodEntries].reverse()" :key="entry.id" class="border-bottom py-3">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">{{ entry.date }}</h6>
                    <div class="d-flex align-items-center mb-2">
                      <span class="badge" :class="getMoodBadgeClass(entry.mood)">Mood: {{ entry.mood }}/10</span>
                      <span class="ms-3 text-muted">{{ getMoodDescription(entry.mood) }}</span>
                    </div>
                    <p v-if="entry.notes" class="text-muted mb-0">{{ entry.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>