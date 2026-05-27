<template>
  <div class="page">
    <header class="page-header">
      <button class="btn-back" @click="goBack">‹ 返回</button>
      <h1>🥟 本周备餐计划</h1>
    </header>

    <div class="card intro-card">
      <h3>🧑‍🍳 一次性备好一周的量</h3>
      <p>这些食谱适合提前做好冷冻保存，吃的时候只需要加热或简单烹饪。周末花2小时备餐，工作日轻松搞定。</p>
    </div>

    <!-- 本周食谱中的备餐推荐 -->
    <div v-if="mealPrepFromWeekPlan.length > 0" class="card">
      <h3>📅 本周食谱中可备餐的菜</h3>
      <p class="hint-text">以下是你本周食谱里可以提前做的菜👇</p>
      <div v-for="(item, i) in mealPrepFromWeekPlan" :key="i" class="prep-day-section">
        <div class="prep-day-title">{{ item.day }}</div>
        <div v-for="recipe in item.recipes" :key="recipe.id" class="prep-recipe-row" @click="goToRecipe(recipe.id)">
          <span class="prep-icon">{{ getMealIcon(recipe.mealType) }}</span>
          <div class="prep-recipe-info">
            <span class="prep-recipe-name">{{ recipe.name }}</span>
            <span class="prep-recipe-note">{{ recipe.prepNote || '可冷冻备餐' }}</span>
          </div>
          <span class="arrow">›</span>
        </div>
      </div>
    </div>

    <!-- 所有备餐食谱分类浏览 -->
    <div class="card">
      <h3>📚 全部备餐食谱</h3>
      <p class="hint-text">按类别快速浏览，周末安排上👇</p>
    </div>

    <div v-for="cat in categories" :key="cat.key" class="card">
      <div class="category-header" @click="toggleCategory(cat.key)">
        <span class="category-icon">{{ cat.icon }}</span>
        <span class="category-name">{{ cat.name }}</span>
        <span class="category-count">{{ cat.recipes.length }}个</span>
        <span class="toggle-icon">{{ expandedCategories[cat.key] ? '▼' : '▶' }}</span>
      </div>
      <div v-if="expandedCategories[cat.key]" class="category-recipes">
        <div v-for="recipe in cat.recipes" :key="recipe.id" class="prep-recipe-row" @click="goToRecipe(recipe.id)">
          <span class="prep-recipe-name">{{ recipe.name }}</span>
          <span v-if="recipe.prepNote" class="prep-recipe-note">{{ recipe.prepNote }}</span>
          <span class="arrow">›</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBabyStore } from '../stores/baby.js'
import { useRecipeStore } from '../stores/recipe.js'

const router = useRouter()
const babyStore = useBabyStore()
const recipeStore = useRecipeStore()

const expandedCategories = ref({
  'steamed': true,
  'bread': false,
  'dumplings': false,
  'meatballs': false,
  'snacks': false
})

// 所有备餐食谱
const allMealPrepRecipes = computed(() => {
  return recipeStore.allRecipes.filter(r => r.mealPrep)
})

// 本周食谱中可备餐的
const mealPrepFromWeekPlan = computed(() => {
  if (!babyStore.weeklyPlan.length) return []

  const result = []
  for (const day of babyStore.weeklyPlan) {
    const meals = ['breakfast', 'lunch', 'dinner', 'afternoonSnack']
    const prepRecipes = []
    for (const mealType of meals) {
      const meal = day[mealType]
      if (meal && meal.mealPrep) {
        prepRecipes.push(meal)
      }
    }
    if (prepRecipes.length > 0) {
      result.push({ day: day.day, recipes: prepRecipes })
    }
  }
  return result
})

const categories = computed(() => [
  {
    key: 'steamed',
    icon: '🥟',
    name: '中式面点（馒头/包子/花卷）',
    recipes: allMealPrepRecipes.value.filter(r => ['馒头', '包子'].includes(r.category))
  },
  {
    key: 'bread',
    icon: '🍞',
    name: '面包/西式面点',
    recipes: allMealPrepRecipes.value.filter(r => r.category === '面包' || r.category === '西式' || r.name.includes('披萨') || r.name.includes('华夫'))
  },
  {
    key: 'dumplings',
    icon: '🥟',
    name: '饺子/馄饨/锅贴/蒸饺',
    recipes: allMealPrepRecipes.value.filter(r => r.category === '面食' && !r.name.includes('面包'))
  },
  {
    key: 'meatballs',
    icon: '🍡',
    name: '丸子/肉饼/肠/午餐肉',
    recipes: allMealPrepRecipes.value.filter(r => r.category === '自制半成品')
  },
  {
    key: 'snacks',
    icon: '🍪',
    name: '点心/零食',
    recipes: allMealPrepRecipes.value.filter(r =>
      !['馒头', '包子', '面包', '西式', '面食', '自制半成品'].includes(r.category)
    )
  }
])

function getMealIcon(mealType) {
  const icons = { '早餐': '🌅', '午餐': '☀️', '晚餐': '🌙', '加餐': '🍪' }
  return icons[mealType] || '🍽️'
}

function toggleCategory(key) {
  expandedCategories.value[key] = !expandedCategories.value[key]
}

function goToRecipe(id) {
  if (id) router.push(`/recipe/${id}`)
}

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.intro-card {
  background: linear-gradient(135deg, #fff5f5, #fff0f0);
  border: 1px solid #ffe0e0;
}

.intro-card h3 {
  color: #e67e22;
}

.intro-card p {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
  margin: 8px 0 0;
}

.hint-text {
  font-size: 13px;
  color: #999;
  margin-top: -8px;
  margin-bottom: 12px;
}

.prep-day-section {
  margin-bottom: 12px;
}

.prep-day-title {
  font-weight: 700;
  color: #ff6b6b;
  font-size: 14px;
  margin-bottom: 6px;
  padding-left: 4px;
}

.prep-recipe-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}

.prep-recipe-row:last-child {
  border-bottom: none;
}

.prep-recipe-row:hover {
  background: #fafafa;
  border-radius: 8px;
}

.prep-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.prep-recipe-info {
  flex: 1;
  min-width: 0;
}

.prep-recipe-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 2px;
}

.prep-recipe-note {
  font-size: 12px;
  color: #e67e22;
  display: block;
  line-height: 1.4;
}

.arrow {
  color: #ccc;
  font-size: 18px;
  flex-shrink: 0;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 0;
}

.category-icon {
  font-size: 20px;
}

.category-name {
  flex: 1;
  font-weight: 600;
  color: #444;
  font-size: 15px;
}

.category-count {
  font-size: 12px;
  color: #bbb;
}

.toggle-icon {
  font-size: 12px;
  color: #ccc;
}

.category-recipes {
  margin-top: 8px;
  border-top: 1px solid #f5f5f5;
  padding-top: 4px;
}
</style>
