<template>
  <div class="page home-page">
    <header class="page-header">
      <h1>🥣 宝宝辅食计划</h1>
      <p class="subtitle">{{ store.ageText }}</p>
    </header>

    <div v-if="!store.hasProfile" class="card welcome-card">
      <div class="welcome-icon">👶</div>
      <h2>欢迎使用宝宝辅食计划</h2>
      <p>请先设置宝宝的生日，我会根据年龄自动生成适合的每周食谱。</p>
      <button class="btn btn-primary" @click="goToProfile">设置宝宝信息</button>
    </div>

    <div v-else>
      <div class="card summary-card">
        <div class="summary-row">
          <span class="label">👤 {{ store.profile.name }}</span>
          <span class="value">{{ store.ageText }}</span>
        </div>
        <div v-if="store.profile.allergies.length" class="summary-row">
          <span class="label">⚠️ 过敏</span>
          <span class="value">{{ store.profile.allergies.join('、') }}</span>
        </div>
        <div v-if="store.profile.disliked.length" class="summary-row">
          <span class="label">😐 不爱吃</span>
          <span class="value">{{ store.profile.disliked.join('、') }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn btn-primary btn-large" @click="generateAndGo">
          ✨ 生成本周食谱
        </button>
        <button class="btn btn-outline" @click="goToProfile">
          ⚙️ 修改宝宝信息
        </button>
      </div>

      <div v-if="store.weeklyPlan.length" class="card quick-preview">
        <h3>📅 本周预览</h3>
        <div v-for="(day, i) in store.weeklyPlan" :key="i" class="day-row" @click="goToDay(i)">
          <span class="day-name">{{ day.day }}</span>
          <span class="day-meals">
            {{ day.breakfast?.name?.slice(0,6) }} · {{ day.lunch?.name?.slice(0,6) }} · {{ day.dinner?.name?.slice(0,6) }}
          </span>
          <span class="arrow">›</span>
        </div>
      </div>

      <div class="card link-card" @click="goToRecipes">
        <div class="link-row">
          <span>📖 全部食谱库</span>
          <span class="arrow">›</span>
        </div>
      </div>
      <div class="card link-card" @click="goToAddRecipe">
        <div class="link-row">
          <span>➕ 添加自定义食谱</span>
          <span class="arrow">›</span>
        </div>
      </div>
      <div class="card link-card prep-link" @click="goToMealPrep">
        <div class="link-row">
          <span>🥟 本周备餐计划</span>
          <span class="badge">NEW</span>
          <span class="arrow">›</span>
        </div>
      </div>
    </div>

    <div style="height: 80px"></div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useBabyStore } from '../stores/baby.js'

const router = useRouter()
const store = useBabyStore()

function goToProfile() {
  router.push('/profile')
}

function goToDay(index) {
  router.push(`/daily/${index}`)
}

function goToRecipes() {
  router.push('/recipes')
}

function goToAddRecipe() {
  router.push('/add-recipe')
}

function generateAndGo() {
  store.generatePlan()
  router.push('/weekly')
}

function goToMealPrep() {
  router.push('/meal-prep')
}
</script>

<style scoped>
.home-page {
  padding-bottom: 20px;
}

.welcome-card {
  text-align: center;
  padding: 40px 20px;
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.summary-card {
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-row:last-child {
  border-bottom: none;
}

.label {
  color: #666;
}

.value {
  color: #333;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.quick-preview {
  margin-bottom: 12px;
}

.day-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}

.day-row:last-child {
  border-bottom: none;
}

.day-row:hover {
  background: #f9f9f9;
  margin: 0 -16px;
  padding: 12px 16px;
  border-radius: 8px;
}

.day-name {
  font-weight: 600;
  color: #ff6b6b;
  width: 48px;
  flex-shrink: 0;
}

.day-meals {
  color: #666;
  font-size: 13px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  color: #ccc;
  font-size: 20px;
  margin-left: 8px;
}

.link-card {
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 8px;
}

.link-card:hover {
  background: #f9f9f9;
}

.link-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prep-link .link-row {
  gap: 8px;
}

.badge {
  font-size: 10px;
  background: #ff6b6b;
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>
