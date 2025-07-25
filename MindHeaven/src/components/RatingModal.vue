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