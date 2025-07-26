<script setup>
import Navbar from '../components/Navbar.vue'
const emit = defineEmits(['signup', 'login'])
</script>

<template>
  <div class="home-root">
    <Navbar @signup="emit('signup')" @login="emit('login')" />
    <!-- 下面是原有内容 -->
    <!-- 顶部导航栏 -->
    <!-- <div class="custom-navbar">
      <div class="navbar-left">
        <span class="brand">MindHaven</span>
      </div>
      <div class="navbar-center">
        <a class="nav-link active" href="#">Home</a>
        <a class="nav-link" href="#">Community</a>
        <a class="nav-link" href="#">Mood Tracker</a>
        <a class="nav-link" href="#">Resources</a>
      </div>
      <div class="navbar-right">
        <button class="nav-btn" @click="emit('open-login-modal')">Log in</button>
        <button class="nav-btn" @click="emit('open-signup-modal')">Sign up</button>
        <i class="fas fa-cog nav-icon"></i>
        <i class="fas fa-user-circle nav-icon"></i>
      </div>
    </div> -->

    <!-- 主标题 -->
    <div class="main-title">
      <h1>Welcome to MindHaven:<br />You Are Not Alone</h1>
    </div>

    <!-- 三大功能区 -->
    <div class="features-row">
      <div class="feature-card">
        <i class="fas fa-users fa-3x feature-icon"></i>
        <div class="feature-title">Community</div>
        <div class="feature-desc">Join discussions with other members</div>
      </div>
      <div class="feature-card">
        <i class="fas fa-chart-line fa-3x feature-icon"></i>
        <div class="feature-title">Mood Tracker</div>
        <div class="feature-desc">Track your emotional well-being</div>
      </div>
      <div class="feature-card">
        <i class="fas fa-book fa-3x feature-icon"></i>
        <div class="feature-title">Resources</div>
        <div class="feature-desc">Access articles and coping tools</div>
      </div>
    </div>

    <!-- 社区快照 -->
    <div class="community-snapshot">
      <div class="snapshot-title">Community Snapshot</div>
      <div class="snapshot-desc">Here's a brief look at our supportive community</div>
      <div class="snapshot-box">
        <!-- 可放置社区统计或示例内容 -->
        <div class="snapshot-line"></div>
        <div class="snapshot-line"></div>
        <div class="snapshot-line"></div>
      </div>
    </div>

    <!-- 底部链接 -->
    <div class="footer-links">
      <a href="#">Contact</a>
      <a href="#">Privacy Policy</a>
      <a href="#">About us</a>
    </div>
  </div>
</template>

<style scoped>
.home-root {
  background: #eafafc;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}
/* 其余样式同首页 */
.custom-navbar {
  width: 100%;
  background: #baf3f3;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 32px;
  box-sizing: border-box;
  margin-bottom: 12px;
}
.brand {
  font-size: 2rem;
  font-weight: bold;
  color: #218c7e;
}
.navbar-center {
  display: flex;
  gap: 32px;
}
.nav-link {
  font-size: 1.15rem;
  color: #218c7e;
  text-decoration: none;
  padding: 4px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}
.nav-link.active,
.nav-link:hover {
  background: #eafafc;
  font-weight: bold;
}
.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.nav-btn {
  border: 2px solid #218c7e;
  background: #fff;
  border-radius: 24px;
  padding: 6px 22px;
  font-size: 1rem;
  margin-right: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.nav-btn:hover {
  background: #eafafc;
}
.nav-icon {
  font-size: 1.5rem;
  color: #218c7e;
  margin-left: 4px;
}

.main-title {
  margin: 32px 0 24px 0;
  text-align: center;
}
.main-title h1 {
  font-size: 2.5rem;
  font-weight: 500;
  color: #218c7e;
  line-height: 1.2;
}

.features-row {
  display: flex;
  justify-content: center;
  gap: 48px;
  background: #d2f7f7;
  border-radius: 16px;
  padding: 32px 0;
  width: 80%;
  margin-bottom: 32px;
}
.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 220px;
  background: #eafafc;
  border-radius: 12px;
  padding: 18px 12px;
  box-shadow: 0 2px 8px rgba(33,140,126,0.08);
}
.feature-icon {
  color: #218c7e;
  margin-bottom: 12px;
}
.feature-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 6px;
  color: #218c7e;
}
.feature-desc {
  font-size: 1rem;
  color: #218c7e;
  text-align: center;
}

.community-snapshot {
  width: 80%;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 32px;
  padding: 24px 32px;
  box-shadow: 0 2px 8px rgba(33,140,126,0.06);
  text-align: left;
}
.snapshot-title {
  font-size: 1.15rem;
  font-weight: bold;
  color: #218c7e;
  margin-bottom: 8px;
}
.snapshot-desc {
  color: #218c7e;
  margin-bottom: 16px;
}
.snapshot-box {
  border: 2px solid #baf3f3;
  border-radius: 12px;
  padding: 16px;
  min-height: 60px;
  background: #eafafc;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.snapshot-line {
  height: 8px;
  background: #baf3f3;
  border-radius: 4px;
  margin-bottom: 4px;
}

.footer-links {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 48px;
  padding: 18px 0;
  border-top: 2px solid #baf3f3;
  background: #eafafc;
  border-radius: 0 0 12px 12px;
  position: fixed;
  bottom: 0;
  left: 0;
}
.footer-links a {
  color: #218c7e;
  font-size: 1.1rem;
  text-decoration: none;
  font-weight: 500;
  transition: text-decoration 0.2s;
}
.footer-links a:hover {
  text-decoration: underline;
}
@media (max-width: 900px) {
  .features-row {
    flex-direction: column;
    gap: 24px;
    width: 95%;
    padding: 24px 0;
  }
  .community-snapshot {
    width: 95%;
    padding: 18px 12px;
  }
}
</style>