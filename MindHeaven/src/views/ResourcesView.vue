<script setup>
import { ref, computed } from 'vue'
import { store } from '../store.js'
import RatingModal from '../components/RatingModal.vue'

// Local state for filtering and sorting
const resourceSearchTerm = ref('')
const resourceFilter = ref('') // 'article', 'video', 'contact'
const sortBy = ref('rating') // 'rating', 'date', 'title'

// State for the rating modal
const showRatingModal = ref(false)
const selectedResourceForRating = ref(null)

// A computed property to get filtered and sorted resources from the store
const filteredResources = computed(() => {
  let resources = [...store.resources]

  // Filter by search term and type
  resources = resources.filter(resource => {
    const matchesSearch =
      resource.title.toLowerCase().includes(resourceSearchTerm.value.toLowerCase()) ||
      resource.description.toLowerCase().includes(resourceSearchTerm.value.toLowerCase())
    const matchesType = !resourceFilter.value || resource.type === resourceFilter.value
    return matchesSearch && matchesType
  })

  // Sort the filtered resources
  resources.sort((a, b) => {
    switch (sortBy.value) {
      case 'rating':
        return b.rating - a.rating
      case 'date':
        return new Date(b.date) - new Date(a.date)
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })
  return resources
})

function getResourceTypeBadge(type) {
  const badges = { article: 'bg-primary', video: 'bg-success', contact: 'bg-warning' }
  return badges[type] || 'bg-secondary'
}

function getResourceTypeIcon(type) {
  const icons = { article: 'fas fa-file-alt', video: 'fas fa-play-circle', contact: 'fas fa-phone' }
  return icons[type] || 'fas fa-question'
}

function getResourceTypeName(type) {
  const names = { article: 'Article', video: 'Video', contact: 'Contact' }
  return names[type] || type
}

function viewResource(resource) {
  resource.views++
  store.showAlert(`Viewing: ${resource.title}`, 'info')
  // In a real app, you would navigate to a detailed view page
}

// Function to open the rating modal
function openRatingModal(resource) {
  selectedResourceForRating.value = resource
  showRatingModal.value = true
}

// Function to handle the submitted rating
function handleRatingSubmit({ resourceId, rating }) {
  const resource = store.resources.find(r => r.id === resourceId)
  if (resource) {
    const oldRatingTotal = resource.rating * resource.ratingCount
    const newTotal = oldRatingTotal + rating
    resource.ratingCount++
    resource.rating = newTotal / resource.ratingCount
    store.showAlert('Thank you for your rating!', 'success')
  }
  showRatingModal.value = false
}
</script>

<template>
  <div class="container" style="margin-top: 100px;">
    <div class="card mb-4">
      <div class="card-header">
        <h4><i class="fas fa-book me-2"></i>Mental Health Resource Library</h4>
      </div>
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-md-5">
            <input
              type="text"
              class="form-control"
              v-model="resourceSearchTerm"
              placeholder="Search resources..."
            />
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="resourceFilter">
              <option value="">All Types</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="contact">Contact</option>
            </select>
          </div>
          <div class="col-md-3">
             <select class="form-select" v-model="sortBy">
                <option value="rating">Sort by Rating</option>
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div
        v-if="filteredResources.length > 0"
        v-for="resource in filteredResources"
        :key="resource.id"
        class="col-md-6 mb-4"
      >
        <div class="resource-item card h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="card-title mb-1">{{ resource.title }}</h5>
                <span :class="getResourceTypeBadge(resource.type)" class="badge">
                  <i :class="getResourceTypeIcon(resource.type)" class="me-1"></i>
                  {{ getResourceTypeName(resource.type) }}
                </span>
              </div>
              <div class="text-end">
                <div class="rating-stars mb-1">
                  <span
                    v-for="star in 5"
                    :key="star"
                    :class="star <= Math.round(resource.rating) ? 'fas fa-star' : 'far fa-star'"
                  ></span>
                </div>
                <small class="text-muted">{{ resource.rating.toFixed(1) }}/5.0</small>
              </div>
            </div>
            <p class="card-text text-muted flex-grow-1">{{ resource.description }}</p>
            <div class="d-flex justify-content-between align-items-center mt-3">
               <div>
                  <small class="text-muted">{{ resource.date }}</small>
                  <span class="mx-2">•</span>
                  <small class="text-muted">{{ resource.views }} views</small>
                </div>
              <div>
                <button class="btn btn-sm btn-outline-primary me-2" @click="viewResource(resource)">View</button>
                <button class="btn btn-sm btn-outline-warning" @click="openRatingModal(resource)">Rate</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="col-12 text-center py-5">
        <p class="text-muted">No resources found matching your criteria.</p>
      </div>
    </div>
  </div>

  <RatingModal
    v-if="showRatingModal"
    :resource="selectedResourceForRating"
    @close-modal="showRatingModal = false"
    @submit-rating="handleRatingSubmit"
  />
</template>