<template>
  <div class="page">
    <header class="page-header">
      <button class="btn-back" @click="goHome">‹ 返回</button>
      <h1>📅 本周食谱</h1>
      <button class="btn-icon" @click="regenerateAll" title="刷新整周">🔄</button>
    </header>

    <div v-if="store.weeklyPlan.length === 0" class="empty-state">
      <div class="empty-icon">🍳</div>
      <p>还没有食谱，请先设置宝宝信息并生成</p>
      <button class="btn btn-primary" @click="generate">✨ 生成本周食谱</button>
    </div>

    <div v-else class="week-container">
      <div class="week-label">{{ weekLabel }}</div>

      <div v-for="(day, i) in store.weeklyPlan" :key="i" class="card day-card">
        <!-- 点击整块进入详情 -->
        <div class="day-main" @click="goToDay(i)">
          <div class="day-header">
            <span class="day-name">{{ day.day }}</span>
            <span class="day-arrow">›</span>
          </div>
          <div class="meal-grid">
            <div class="meal-item meal-item-full" :class="{ 'is-prep': day.breakfast?.mealPrep }">
              <span class="meal-tag breakfast">🌅 早餐</span>
              <span class="meal-name">{{ day.breakfast?.name || '查看' }}</span>
              <span v-if="day.breakfast?.mealPrep" class="prep-badge">备餐</span>
              <span v-if="day.breakfastSide" class="meal-side">+ {{ day.breakfastSide.name }}</span>
            </div>
            <div class="meal-item meal-item-full" :class="{ 'is-prep': day.lunch?.mealPrep }">
              <span class="meal-tag lunch">☀️ 午餐</span>
              <span class="meal-name">{{ day.lunch?.name || '查看' }}</span>
              <span v-if="day.lunch?.mealPrep" class="prep-badge">备餐</span>
              <span v-if="day.lunchSide" class="meal-side">+ {{ day.lunchSide.name }}</span>
            </div>
            <div class="meal-item meal-item-full" :class="{ 'is-prep': day.dinner?.mealPrep }">
              <span class="meal-tag dinner">🌙 晚餐</span>
              <span class="meal-name">{{ day.dinner?.name || '查看' }}</span>
              <span v-if="day.dinner?.mealPrep" class="prep-badge">备餐</span>
              <span v-if="day.dinnerSide" class="meal-side">+ {{ day.dinnerSide.name }}</span>
            </div>
            <div class="meal-item" :class="{ 'is-prep': day.afternoonSnack?.mealPrep }">
              <span class="meal-tag snack">🍪 加餐</span>
              <span class="meal-name">{{ day.afternoonSnack?.name || day.morningSnack?.name || '查看' }}</span>
              <span v-if="day.afternoonSnack?.mealPrep" class="prep-badge">备餐</span>
            </div>
          </div>
        </div>
        <!-- 刷新当天按钮 -->
        <button class="day-refresh-btn" @click.stop="regenerateDay(i)" title="刷新当天的食谱">
          🔄 换一批
        </button>
      </div>

      <!-- 采购清单 -->
      <div class="card shopping-card" @click="showShoppingList = !showShoppingList">
        <div class="shopping-header">
          <span>🛒 本周采购清单</span>
          <span>{{ showShoppingList ? '收起' : '展开' }} ›</span>
        </div>
        <div v-if="showShoppingList" class="shopping-list">
          <div v-for="item in shoppingList" :key="item" class="shopping-item">
            <input type="checkbox" :id="'shop-' + item" />
            <label :for="'shop-' + item">{{ item }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBabyStore } from '../stores/baby.js'
import { getWeeklyShoppingList, regenerateDay as regenerateDayHelper } from '../utils/helpers.js'

const router = useRouter()
const store = useBabyStore()
const showShoppingList = ref(false)

const weekLabel = computed(() => {
  if (!store.currentWeekStart) return ''
  return `📆 ${store.currentWeekStart} 起`
})

const shoppingList = computed(() => {
  if (!store.weeklyPlan.length) return []
  return getWeeklyShoppingList(store.weeklyPlan)
})

function goHome() {
  router.push('/')
}

function goToDay(index) {
  router.push(`/daily/${index}`)
}

function generate() {
  store.generatePlan()
}

function regenerateAll() {
  if (confirm('重新生成将替换当前一周的食谱，确认？')) {
    store.generatePlan()
  }
}

function regenerateDay(dayIndex) {
  const newDay = regenerateDayHelper(
    store.weeklyPlan,
    dayIndex,
    store.profile.birthDate,
    store.profile.allergies,
    store.profile.disliked
  )
  if (newDay) {
    store.weeklyPlan[dayIndex] = newDay
  }
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.week-label {
  text-align: center;
  color: #999;
  font-size: 13px;
  margin-bottom: 16px;
}

.day-card {
  margin-bottom: 12px;
  padding-bottom: 12px;
}

.day-main {
  cursor: pointer;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.day-name {
  font-size: 18px;
  font-weight: 700;
  color: #ff6b6b;
}

.day-arrow {
  color: #ccc;
  font-size: 24px;
}

.meal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.meal-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: #fafafa;
  border-radius: 8px;
}

.meal-tag {
  font-size: 11px;
  font-weight: 600;
}

.meal-tag.breakfast { color: #e67e22; }
.meal-tag.lunch { color: #27ae60; }
.meal-tag.dinner { color: #8e44ad; }
.meal-tag.snack { color: #e74c3c; }

.meal-name {
  font-size: 13px;
  color: #333;
}

.meal-side {
  font-size: 11px;
  color: #e67e22;
  font-weight: 500;
  margin-top: 2px;
}

.meal-item-full {
  grid-column: 1 / -1;
}

.is-prep {
  background: #fff8f0 !important;
  border: 1px solid #ffe0b0;
}

.prep-badge {
  font-size: 9px;
  background: #e67e22;
  color: white;
  padding: 1px 5px;
  border-radius: 6px;
  align-self: flex-start;
  font-weight: 700;
}

.day-refresh-btn {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 8px;
  background: #fff5f5;
  border: 1px dashed #ffcccc;
  border-radius: 8px;
  color: #ff6b6b;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.day-refresh-btn:hover {
  background: #ffe0e0;
}

.shopping-card {
  cursor: pointer;
}

.shopping-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}

.shopping-list {
  margin-top: 12px;
}

.shopping-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.shopping-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.shopping-item label {
  font-size: 14px;
  color: #555;
}
</style>
