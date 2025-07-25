<script setup>
import { ref, computed } from 'vue'
import { store } from '../store.js'

// Component state
const newPost = ref({ content: '', category: 'general' })
const replyText = ref('')
const activePostIdForReply = ref(null)

const categories = ref([
  { value: 'general', name: 'General Discussion' },
  { value: 'anxiety', name: 'Anxiety Support' },
  { value: 'depression', name: 'Depression Support' },
  { value: 'stress', name: 'Stress Management' },
  { value: 'students', name: 'Student Zone' }
])
const selectedCategories = ref(categories.value.map(c => c.value))

// Computed property for filtering posts
const filteredPosts = computed(() => {
  return store.forumPosts.filter(post => selectedCategories.value.includes(post.category))
})

function getCategoryName(categoryValue) {
  const category = categories.value.find(c => c.value === categoryValue)
  return category ? category.name : categoryValue
}

function isValidPost() {
  return newPost.value.content.trim().length > 0 && newPost.value.content.length <= 1000
}

function addForumPost() {
  if (!isValidPost()) return
  const post = {
    id: Date.now(),
    content: newPost.value.content,
    category: newPost.value.category,
    date: new Date().toLocaleDateString(),
    likes: 0,
    replies: [],
    showReplies: false,
    userId: store.currentUser.id
  }
  store.forumPosts.unshift(post) // Add to the beginning of the array
  newPost.value = { content: '', category: 'general' }
  store.showAlert('Post published successfully', 'success')
}

// *** BR C.2: Role-based Authorization Implemented Here ***
function deletePost(postId) {
  if (store.currentUser?.role !== 'admin') {
    store.showAlert('You do not have permission to delete posts.', 'danger');
    return;
  }
  const index = store.forumPosts.findIndex(p => p.id === postId)
  if (index > -1) {
    store.forumPosts.splice(index, 1)
    store.showAlert('Post deleted successfully.', 'success')
  }
}

function likePost(postId) {
  const post = store.forumPosts.find(p => p.id === postId)
  if (post) post.likes++
}

function addReply(post) {
    if (!replyText.value.trim()) return
    const reply = {
        id: Date.now(),
        content: replyText.value,
        date: new Date().toLocaleDateString(),
        userId: store.currentUser.id
    };
    post.replies.push(reply);
    replyText.value = '';
    activePostIdForReply.value = null;
    store.showAlert('Reply added.', 'success');
}

function toggleReplies(post) {
    post.showReplies = !post.showReplies
}

</script>

<template>
  <div class="container" style="margin-top: 100px">
    <div class="row">
      <div class="col-md-8">
        <div class="card mb-4">
          <div class="card-header">
            <h4><i class="fas fa-comments me-2"></i>Community Forum</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="addForumPost">
              <div class="mb-3">
                <label class="form-label fw-bold">Share your thoughts or seek support</label>
                <textarea
                  class="form-control"
                  v-model="newPost.content"
                  rows="4"
                  placeholder="What would you like to share? This is a safe space..."
                ></textarea>
                <div class="form-text" :class="{ 'text-danger': newPost.content.length > 1000 }">
                  {{ newPost.content.length }}/1000 characters
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Select a topic</label>
                <select class="form-select" v-model="newPost.category">
                  <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="!isValidPost()">
                <i class="fas fa-paper-plane me-2"></i>Post Anonymously
              </button>
            </form>
          </div>
        </div>

        <div v-for="post in filteredPosts" :key="post.id" class="forum-post">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <span class="badge bg-secondary me-2">{{ getCategoryName(post.category) }}</span>
              <small class="text-muted">{{ post.date }} • Anonymous User</small>
            </div>
            <div class="d-flex align-items-center">
              <button class="btn btn-sm btn-outline-success me-2" @click="likePost(post.id)">
                <i class="fas fa-thumbs-up me-1"></i>{{ post.likes }}
              </button>
              <small class="text-muted me-3">{{ post.replies.length }} Replies</small>
              <button v-if="store.currentUser?.role === 'admin'" @click="deletePost(post.id)" class="btn btn-sm btn-outline-danger">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <p class="mb-3">{{ post.content }}</p>

           <div class="mt-3">
            <button class="btn btn-sm btn-link text-decoration-none p-0" @click="toggleReplies(post)">
              {{ post.showReplies ? 'Hide Replies' : 'View Replies' }}
            </button>
             <div v-if="post.showReplies" class="border-top pt-3 mt-2">
                <div v-for="reply in post.replies" :key="reply.id" class="bg-light p-2 rounded mb-2">
                    <p class="mb-1">{{ reply.content }}</p>
                    <small class="text-muted d-block text-end">Anonymous Reply • {{ reply.date }}</small>
                </div>
                 <form @submit.prevent="addReply(post)" class="mt-2">
                    <div class="input-group">
                      <input type="text" class="form-control" v-model="replyText" placeholder="Add a reply..." required>
                      <button class="btn btn-outline-primary" type="submit">Reply</button>
                    </div>
                 </form>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header">
            <h6><i class="fas fa-filter me-2"></i>Filter Topics</h6>
          </div>
          <div class="card-body">
            <div v-for="cat in categories" :key="cat.value" class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                :value="cat.value"
                v-model="selectedCategories"
                :id="`cat-${cat.value}`"
              />
              <label class="form-check-label" :for="`cat-${cat.value}`">{{ cat.name }}</label>
            </div>
          </div>
        </div>
        <div class="card">
            <div class="card-header"><h6><i class="fas fa-heart me-2"></i>Community Guidelines</h6></div>
            <div class="card-body">
                <ul class="list-unstyled small">
                    <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Be respectful and empathetic.</li>
                    <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Share constructive advice.</li>
                    <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Protect personal privacy.</li>
                    <li class="mb-2"><i class="fas fa-times-circle text-danger me-2"></i>No hate speech or bullying.</li>
                    <li class="mb-2"><i class="fas fa-times-circle text-danger me-2"></i>Do not share personal info.</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>