<script setup>
const emit = defineEmits(['open-login-modal'])
</script>

<template>
  <div>
    <div class="hero-section">
      <div class="container">
        <h1 class="display-4 fw-bold mb-4">Welcome to MindHaven</h1>
        <p class="lead mb-5">Your mental health support platform - find understanding, tools, and hope here.</p>
        <button class="btn btn-primary btn-lg" @click="emit('open-login-modal')">
          <i class="fas fa-rocket me-2"></i>Start Your Journey
        </button>
      </div>
    </div>

    <div class="container my-5">
      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="card h-100 text-center">
            <div class="card-body">
              <i class="fas fa-chart-line fa-3x text-primary mb-3"></i>
              <h5 class="card-title">Mood Tracker</h5>
              <p class="card-text">
                Record and visualize your daily mood changes to discover patterns and improve your well-being.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card h-100 text-center">
            <div class="card-body">
              <i class="fas fa-comments fa-3x text-success mb-3"></i>
              <h5 class="card-title">Community Support</h5>
              <p class="card-text">
                Anonymously share experiences, get peer support, and build meaningful connections.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card h-100 text-center">
            <div class="card-body">
              <i class="fas fa-book fa-3x text-warning mb-3"></i>
              <h5 class="card-title">Professional Resources</h5>
              <p class="card-text">
                Access verified articles, videos, and information on professional mental health services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>