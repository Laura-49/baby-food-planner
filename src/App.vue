<template>
  <div id="app">
    <router-view />
    <nav class="bottom-nav" v-if="showNav">
      <router-link to="/" class="nav-item" active-class="nav-active">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">首页</span>
      </router-link>
      <router-link to="/weekly" class="nav-item" active-class="nav-active">
        <span class="nav-icon">📅</span>
        <span class="nav-label">本周</span>
      </router-link>
      <router-link to="/recipes" class="nav-item" active-class="nav-active">
        <span class="nav-icon">📖</span>
        <span class="nav-label">食谱</span>
      </router-link>
      <router-link to="/meal-prep" class="nav-item" active-class="nav-active">
        <span class="nav-icon">🥟</span>
        <span class="nav-label">备餐</span>
      </router-link>
      <router-link to="/profile" class="nav-item" active-class="nav-active">
        <span class="nav-icon">👶</span>
        <span class="nav-label">宝宝</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBabyStore } from './stores/baby.js'

const route = useRoute()
const babyStore = useBabyStore()

onMounted(() => {
  babyStore.restorePlan()
})

const showNav = computed(() => {
  const hideOn = ['recipe', 'daily', 'addRecipe']
  return !hideOn.includes(route.name)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: #f8f8f8;
  color: #333;
  -webkit-font-smoothing: antialiased;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
}

#app {
  padding-bottom: 80px;
}

.page {
  padding: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-top: 8px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  flex: 1;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin-top: -12px;
  margin-bottom: 16px;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.btn-primary {
  background: #ff6b6b;
  color: white;
}

.btn-primary:active {
  background: #e55a5a;
}

.btn-secondary {
  background: #f0f0f0;
  color: #555;
}

.btn-secondary:active {
  background: #e0e0e0;
}

.btn-outline {
  background: white;
  color: #ff6b6b;
  border: 1.5px solid #ff6b6b;
}

.btn-danger {
  background: #fff0f0;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.btn-block {
  width: 100%;
}

.btn-large {
  padding: 16px 24px;
  font-size: 18px;
}

.btn-back {
  background: none;
  border: none;
  font-size: 24px;
  color: #ff6b6b;
  cursor: pointer;
  padding: 4px;
  font-weight: 700;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  padding: 4px;
}

/* Cards */
.card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.card h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #555;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state p {
  margin-bottom: 16px;
}

/* Common form inputs (already scoped, but for clarity) */
.input {
  width: 100%;
  padding: 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  box-sizing: border-box;
  font-family: inherit;
}

.input:focus {
  outline: none;
  border-color: #ff6b6b;
}

/* Bottom nav */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  border-top: 1px solid #f0f0f0;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: #bbb;
  padding: 4px 16px;
  transition: color 0.2s;
}

.nav-active {
  color: #ff6b6b;
}

.nav-icon {
  font-size: 22px;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}
</style>
