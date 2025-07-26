<script setup>
import { ref, computed, onMounted } from 'vue'
import { store } from '../store.js'
import RatingModal from '../components/RatingModal.vue'
import Navbar from '../components/Navbar.vue'

const emit = defineEmits(['signup', 'login'])

onMounted(() => {
  if (!store.isLoggedIn) {
    store.navigate('login')
  }
})

const resourceSearchTerm = ref('')
const resourceFilter = ref('') // 'article', 'video', 'contact'
const sortBy = ref('rating') // 'rating', 'date', 'title'

// State for the rating modal
const showRatingModal = ref(false)
const selectedResourceForRating = ref(null)

// State for adding a new resource
const showAddResource = ref(false)
const newResource = ref({
  title: '',
  description: '',
  type: 'article',
})

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

// Function to add a new resource
function addResource() {
  if (!newResource.value.title || !newResource.value.description) return
  store.resources.unshift({
    id: Date.now(),
    title: newResource.value.title,
    description: newResource.value.description,
    type: newResource.value.type,
    date: new Date().toISOString().slice(0, 10),
    rating: 0,
    ratingCount: 0,
    views: 0
  })
  store.showAlert('Resource added!', 'success')
  showAddResource.value = false
  newResource.value = { title: '', description: '', type: 'article' }
}
</script>

<template>
  <div class="resources-root">
    <Navbar @signup="emit('signup')" @login="emit('login')" />
    <div class="container">
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

      <!-- 仅admin可见的添加资源按钮 -->
      <div v-if="store.currentUser?.role === 'admin'" class="mb-3">
        <button class="btn btn-success" @click="showAddResource = true">
          Add Resource
        </button>
      </div>

      <!-- 添加资源弹窗或表单 -->
      <div v-if="showAddResource" class="card mb-4">
        <div class="card-body">
          <h5>Add New Resource</h5>
          <form @submit.prevent="addResource">
            <input v-model="newResource.title" class="form-control mb-2" placeholder="Title" required />
            <textarea v-model="newResource.description" class="form-control mb-2" placeholder="Description" required />
            <select v-model="newResource.type" class="form-select mb-2">
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="contact">Contact</option>
            </select>
            <button class="btn btn-primary" type="submit">Submit</button>
            <button class="btn btn-secondary ms-2" type="button" @click="showAddResource = false">Cancel</button>
          </form>
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
  </div>
</template>

<style scoped>
.resources-root {
  background: #eafafc;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
  padding-bottom: 32px;
}
.container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}
.card {
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(108, 92, 231, 0.12);
  border: none;
  margin-bottom: 28px;
}
.resource-item {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 28px;
  box-shadow: 0 4px 24px rgba(108, 92, 231, 0.10);
  transition: box-shadow 0.2s, transform 0.2s;
}
.resource-item:hover {
  box-shadow: 0 8px 32px rgba(108, 92, 231, 0.18);
  transform: translateY(-2px);
}
.rating-stars {
  color: #ffd700;
  font-size: 1.5em;
  transition: transform 0.2s;
}
.rating-stars span:hover {
  transform: scale(1.2);
}
.badge {
  font-size: 1em;
  padding: 6px 14px;
  border-radius: 12px;
  background: #6c5ce7;
  color: #fff;
}
input.form-control, select.form-select, textarea.form-control {
  border-radius: 10px;
  font-size: 1.05em;
  padding: 10px 18px;
  margin-bottom: 12px;
}
.btn-success, .btn-primary, .btn-outline-primary, .btn-outline-warning, .btn-secondary {
  border-radius: 20px !important;
  font-size: 1.08em;
  padding: 8px 24px;
  min-width: 100px;
  margin-right: 8px;
}
.btn-sm {
  font-size: 1em;
  padding: 6px 18px;
}
.card-header {
  background: linear-gradient(90deg, #74b9ff 0%, #6c5ce7 100%);
  color: #fff;
  border-radius: 15px 15px 0 0;
}
.resource-toolbar .form-control,
.resource-toolbar .form-select {
  border-radius: 20px;
  font-size: 1.05em;
  padding: 10px 18px;
  margin-bottom: 0;
}
.resource-toolbar {
  margin-bottom: 28px;
}
@media (max-width: 900px) {
  .container {
    max-width: 98vw;
    padding: 0 5px;
  }
  .resource-item {
    padding: 12px;
  }
  .resource-toolbar .col-md-5, .resource-toolbar .col-md-4, .resource-toolbar .col-md-3 {
    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 8px;
  }
  .resource-toolbar {
    flex-direction: column;
    gap: 8px;
  }
}
</style>