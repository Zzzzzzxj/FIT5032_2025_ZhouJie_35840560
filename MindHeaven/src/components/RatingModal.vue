<script setup>
import { ref } from 'vue';

const props = defineProps({
  resource: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close-modal', 'submit-rating']);

const newRating = ref(0); // From 1 to 5

function submit() {
  if (newRating.value > 0) {
    emit('submit-rating', {
      resourceId: props.resource.id,
      rating: newRating.value
    });
  }
}
</script>

<template>
  <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" @click.self="emit('close-modal')">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title">Rate this Resource</h5>
          <button type="button" class="btn-close" @click="emit('close-modal')"></button>
        </div>
        <div class="modal-body">
          <h6 class="mb-3 text-center">{{ resource.title }}</h6>
          <div class="text-center mb-4">
            <div class="rating-stars" style="font-size: 2.5em;">
              <span v-for="star in 5" :key="star"
                    :class="star <= newRating ? 'fas fa-star text-warning' : 'far fa-star text-muted'"
                    @click="newRating = star"
                    style="cursor: pointer; transition: transform 0.2s;"
                    @mouseover="event => event.target.style.transform = 'scale(1.2)'"
                    @mouseleave="event => event.target.style.transform = 'scale(1)'">
              </span>
            </div>
            <p class="mt-2 text-muted">Click a star to rate</p>
          </div>
        </div>
        <div class="modal-footer border-0">
           <button class="btn btn-secondary" @click="emit('close-modal')">Cancel</button>
           <button class="btn btn-primary" @click="submit" :disabled="newRating === 0">Submit Rating</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-content {
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(108,92,231,0.18);
  background: #fff;
  padding: 0;
}
.modal-header {
  background: linear-gradient(90deg, #74b9ff 0%, #6c5ce7 100%);
  color: #fff;
  border-radius: 18px 18px 0 0;
  padding: 18px 24px;
}
.modal-title {
  font-weight: 600;
  font-size: 1.25em;
}
.modal-body {
  padding: 24px 24px 8px 24px;
}
.rating-stars {
  font-size: 2.5em;
  color: #ffd700;
  margin-bottom: 8px;
}
.rating-stars .fa-star {
  cursor: pointer;
  transition: transform 0.2s;
}
.rating-stars .fa-star:hover {
  transform: scale(1.2);
}
.modal-footer {
  border-top: none;
  padding: 18px 24px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: transparent;
}
.btn-primary {
  border-radius: 20px;
  background: linear-gradient(90deg, #74b9ff 0%, #6c5ce7 100%);
  border: none;
  color: #fff;
  font-weight: 500;
  font-size: 1.08em;
  padding: 10px 24px;
}
.btn-secondary {
  border-radius: 20px;
  font-size: 1.08em;
  padding: 10px 24px;
}
.text-muted {
  font-size: 1em;
}
</style>