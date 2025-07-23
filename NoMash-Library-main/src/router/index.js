import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutView from '../views/AboutView.vue';
import LoginView from '../views/LoginView.vue'; // Import the login view
import { isAuthenticated } from '@/stores/authStore'; // Import the authentication state

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { requiresAuth: true } // Add meta field, marking this route as requiring authentication
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    }
  ]
});

// Global before guard
router.beforeEach((to, from, next) => {
  // Check if the target route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // If authentication is required but the user is not logged in, redirect to the login page
    next({ name: 'login' });
  } else if (to.name === 'login' && isAuthenticated.value) {
    // If the user is already logged in but tries to access the login page, redirect to the About page (or any other desired page)
    next({ name: 'about' });
  } else {
    // Otherwise, proceed with navigation
    next();
  }
});

export default router;
