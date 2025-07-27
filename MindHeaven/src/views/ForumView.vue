<script setup>
import Navbar from '../components/Navbar.vue'
import { ref, computed, onMounted } from 'vue'
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
  { value: 'students', name: 'Student Zone' },
])
const selectedCategories = ref(categories.value.map((c) => c.value))

// Computed property for filtering posts
const filteredPosts = computed(() => {
  return store.forumPosts.filter((post) => selectedCategories.value.includes(post.category))
})

function getCategoryName(categoryValue) {
  const category = categories.value.find((c) => c.value === categoryValue)
  return category ? category.name : categoryValue
}

function isValidPost() {
  const content = newPost.value.content.trim()
  if (content.length === 0 || content.length > 1000) return false
  if (/[<>]/.test(content)) return false // 禁止输入 < >
  return true
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
    userId: store.currentUser.id,
  }
  store.forumPosts.unshift(post) // Add to the beginning of the array
  newPost.value = { content: '', category: 'general' }
  store.showAlert('Post published successfully', 'success')
}

function deletePost(postId) {
  const idx = store.forumPosts.findIndex((p) => p.id === postId)
  if (idx !== -1) {
    store.forumPosts.splice(idx, 1)
    store.showAlert('Post deleted', 'success')
  }
}

//function likePost(postId) {
//const post = store.forumPosts.find(p => p.id === postId)
//if (post) post.likes++
//}

function addReply(post) {
  if (!replyText.value.trim()) return
  const reply = {
    id: Date.now(),
    content: replyText.value,
    date: new Date().toLocaleDateString(),
    userId: store.currentUser.id,
  }
  post.replies.push(reply)
  replyText.value = ''
  activePostIdForReply.value = null
  store.showAlert('Reply added.', 'success')
}

function toggleReplies(post) {
  post.showReplies = !post.showReplies
}

const emit = defineEmits(['signup', 'login'])

onMounted(() => {
  if (!store.isLoggedIn) {
    store.navigate('login')
  }
})
</script>

<template>
  <div class="forum-root">
    <Navbar @signup="emit('signup')" @login="emit('login')" />
    <div class="container">
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
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="d-flex align-items-center gap-2">
                <span class="forum-category-badge">{{ getCategoryName(post.category) }}</span>
                <span class="forum-like-badge">{{ post.likes }}</span>
                <small class="text-muted ms-3">{{ post.date }} • Anonymous User</small>
              </div>
              <div class="d-flex align-items-center gap-2">
                <small class="text-muted">{{ post.replies.length }} Replies</small>
                <button
                  v-if="store.currentUser?.role === 'admin'"
                  class="btn btn-sm btn-danger"
                  @click="deletePost(post.id)"
                >
                  Delete
                </button>
              </div>
            </div>
            <p class="mb-3">{{ post.content }}</p>

            <div class="mt-3">
              <button
                class="btn btn-sm btn-link text-decoration-none p-0"
                @click="toggleReplies(post)"
              >
                {{ post.showReplies ? 'Hide Replies' : 'View Replies' }}
              </button>
              <div v-if="post.showReplies" class="border-top pt-3 mt-2">
                <div
                  v-for="reply in post.replies"
                  :key="reply.id"
                  class="bg-light p-2 rounded mb-2"
                >
                  <p class="mb-1">{{ reply.content }}</p>
                  <small class="text-muted d-block text-end"
                    >Anonymous Reply • {{ reply.date }}</small
                  >
                </div>
                <form @submit.prevent="addReply(post)" class="mt-2">
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      v-model="replyText"
                      placeholder="Add a reply..."
                      required
                    />
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
            <div class="card-header">
              <h6><i class="fas fa-heart me-2"></i>Community Guidelines</h6>
            </div>
            <div class="card-body">
              <ul class="list-unstyled small">
                <li class="mb-2">
                  <i class="fas fa-check-circle text-success me-2"></i>Be respectful and empathetic.
                </li>
                <li class="mb-2">
                  <i class="fas fa-check-circle text-success me-2"></i>Share constructive advice.
                </li>
                <li class="mb-2">
                  <i class="fas fa-check-circle text-success me-2"></i>Protect personal privacy.
                </li>
                <li class="mb-2">
                  <i class="fas fa-times-circle text-danger me-2"></i>No hate speech or bullying.
                </li>
                <li class="mb-2">
                  <i class="fas fa-times-circle text-danger me-2"></i>Do not share personal info.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forum-root {
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
  max-width: 1100px;
  margin: 0 auto;
}
.card {
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: none;
  margin-bottom: 24px;
}
.forum-post {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 28px;
  box-shadow: 0 4px 24px rgba(33, 140, 126, 0.1);
  border-left: 6px solid #6c5ce7;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}
.forum-post:hover {
  box-shadow: 0 8px 32px rgba(33, 140, 126, 0.18);
  transform: translateY(-2px);
}
.badge {
  font-size: 1em;
  padding: 6px 14px;
  border-radius: 12px;
  background: #6c5ce7;
  color: #fff;
}
.btn-danger,
.btn-outline-success {
  border-radius: 20px;
  padding: 6px 22px;
  font-size: 1.08em;
}
input.form-control,
textarea.form-control {
  border-radius: 10px;
  font-size: 1.05em;
  padding: 10px 18px;
}
.card-header {
  background: linear-gradient(90deg, #74b9ff 0%, #6c5ce7 100%);
  color: #fff;
  border-radius: 15px 15px 0 0;
}
.reply-form {
  margin-top: 12px;
}
.bg-light {
  background: #f8f9fa !important;
  border-radius: 10px;
  margin-bottom: 8px;
  padding: 10px 14px;
}
.forum-category-badge {
  background: #6c5ce7;
  color: #fff;
  font-size: 1.05em;
  font-weight: 500;
  border-radius: 16px;
  padding: 6px 18px;
  margin-right: 8px;
  box-shadow: 0 2px 8px rgba(108, 92, 231, 0.08);
  display: inline-block;
}

.forum-like-badge {
  background: #f8f9fa;
  color: #6c5ce7;
  font-size: 1em;
  font-weight: bold;
  border-radius: 50%;
  padding: 6px 14px;
  border: 2px solid #6c5ce7;
  margin-right: 8px;
  display: inline-block;
  min-width: 32px;
  text-align: center;
}

@media (max-width: 900px) {
  .container {
    max-width: 98vw;
    padding: 0 5px;
  }
  .forum-post {
    padding: 12px;
  }
}
</style>
