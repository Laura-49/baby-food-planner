<template>
  <div class="page">
    <header class="page-header">
      <button class="btn-back" @click="goBack">‹ 返回</button>
      <h1>{{ dayPlan?.day || '每日食谱' }}</h1>
    </header>

    <div v-if="!dayPlan" class="empty-state">
      <p>没有找到该天的食谱，请先生成周食谱</p>
    </div>

    <div v-else>
      <!-- 早餐 -->
      <div class="card meal-card" @click="goToRecipe(dayPlan.breakfast?.id)">
        <div class="meal-header">
          <span class="meal-icon">🌅</span>
          <span class="meal-label">早餐</span>
          <span class="meal-arrow">›</span>
        </div>
        <div class="meal-title">{{ dayPlan.breakfast?.name }}</div>
        <div v-if="dayPlan.breakfastSide" class="meal-side-item">+ {{ dayPlan.breakfastSide.name }}</div>
        <div v-if="dayPlan.breakfast?.ingredients" class="meal-ingredients">
          <span v-for="(ing, i) in dayPlan.breakfast.ingredients" :key="i" class="ingredient-tag">{{ ing }}</span>
        </div>
      </div>

      <!-- 早点（如果有） -->
      <div v-if="dayPlan.morningSnack" class="card meal-card snack-card" @click="goToSimpleSnack(dayPlan.morningSnack)">
        <div class="meal-header">
          <span class="meal-icon">🍎</span>
          <span class="meal-label">早点</span>
        </div>
        <div class="meal-title">{{ dayPlan.morningSnack.name }}</div>
      </div>

      <!-- 午餐 -->
      <div class="card meal-card" @click="goToRecipe(dayPlan.lunch?.id)">
        <div class="meal-header">
          <span class="meal-icon">☀️</span>
          <span class="meal-label">午餐</span>
          <span class="meal-arrow">›</span>
        </div>
        <div class="meal-title">{{ dayPlan.lunch?.name }}</div>
        <div v-if="dayPlan.lunchSide" class="meal-side-item">+ {{ dayPlan.lunchSide.name }}</div>
        <div v-if="dayPlan.lunch?.ingredients" class="meal-ingredients">
          <span v-for="(ing, i) in dayPlan.lunch.ingredients" :key="i" class="ingredient-tag">{{ ing }}</span>
        </div>
      </div>

      <!-- 午点 -->
      <div class="card meal-card" @click="goToRecipe(dayPlan.afternoonSnack?.id)">
        <div class="meal-header">
          <span class="meal-icon">🍪</span>
          <span class="meal-label">午点 / 加餐</span>
          <span class="meal-arrow">›</span>
        </div>
        <div class="meal-title">{{ dayPlan.afternoonSnack?.name }}</div>
        <div v-if="dayPlan.afternoonSnack?.ingredients" class="meal-ingredients">
          <span v-for="(ing, i) in dayPlan.afternoonSnack.ingredients" :key="i" class="ingredient-tag">{{ ing }}</span>
        </div>
      </div>

      <!-- 晚餐 -->
      <div class="card meal-card" @click="goToRecipe(dayPlan.dinner?.id)">
        <div class="meal-header">
          <span class="meal-icon">🌙</span>
          <span class="meal-label">晚餐</span>
          <span class="meal-arrow">›</span>
        </div>
        <div class="meal-title">{{ dayPlan.dinner?.name }}</div>
        <div v-if="dayPlan.dinnerSide" class="meal-side-item">+ {{ dayPlan.dinnerSide.name }}</div>
        <div v-if="dayPlan.dinner?.ingredients" class="meal-ingredients">
          <span v-for="(ing, i) in dayPlan.dinner.ingredients" :key="i" class="ingredient-tag">{{ ing }}</span>
        </div>
      </div>

      <!-- 营养提示 -->
      <div class="card nutrition-tip" v-if="dayPlan.nutritionSummary">
        <h3>🥛 营养提示</h3>
        <p>{{ dayPlan.nutritionSummary.milk }}</p>
        <p v-if="dayPlan.nutritionSummary.note" class="note">{{ dayPlan.nutritionSummary.note }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBabyStore } from '../stores/baby.js'

const props = defineProps({
  dayIndex: [String, Number]
})

const router = useRouter()
const route = useRoute()
const store = useBabyStore()

const dayPlan = computed(() => {
  const idx = parseInt(props.dayIndex)
  return store.weeklyPlan[idx] || null
})

function goBack() {
  router.push('/weekly')
}

function goToRecipe(id) {
  if (id) router.push(`/recipe/${id}`)
}

function goToSimpleSnack(snack) {
  // 简单加餐无需查看详情
}
</script>

<style scoped>
.meal-card {
  margin-bottom: 12px;
  cursor: pointer;
}

.meal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.meal-icon {
  font-size: 20px;
}

.meal-label {
  font-weight: 700;
  color: #555;
  flex: 1;
}

.meal-arrow {
  color: #ccc;
  font-size: 20px;
}

.meal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.meal-side-item {
  font-size: 14px;
  color: #e67e22;
  font-weight: 500;
  margin-bottom: 6px;
  padding-left: 4px;
}

.meal-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ingredient-tag {
  font-size: 12px;
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 12px;
  color: #666;
}

.snack-card {
  background: #fffaf0;
}

.nutrition-tip {
  background: #e8f5e9;
}

.nutrition-tip h3 {
  font-size: 15px;
  margin: 0 0 8px;
  color: #2e7d32;
}

.nutrition-tip p {
  font-size: 13px;
  color: #555;
  margin: 0 0 4px;
}

.note {
  font-size: 12px;
  color: #999;
}
</style>
