<template>
  <div class="page">
    <header class="page-header">
      <button class="btn-back" @click="goBack">‹ 返回</button>
      <h1>📖 全部食谱</h1>
    </header>

    <div class="search-bar">
      <input v-model="keyword" type="text" placeholder="🔍 搜索食谱名称、食材..." class="input" @input="doSearch" />
    </div>

    <div class="filter-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="filteredRecipes.length === 0" class="empty-state">
      <p>没有找到匹配的食谱</p>
    </div>

    <div v-else class="recipe-grid">
      <div
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="card recipe-card"
        @click="goToRecipe(recipe.id)"
      >
        <div class="recipe-card-header">
          <span class="rc-name">{{ recipe.name }}</span>
          <span :class="['rc-badge', recipe.mealType]">{{ recipe.mealType }}</span>
        </div>
        <div class="rc-ingredients">
          <span v-for="ing in recipe.ingredients.slice(0, 4)" :key="ing" class="rc-tag">{{ ing }}</span>
          <span v-if="recipe.ingredients.length > 4" class="rc-tag rc-more">+{{ recipe.ingredients.length - 4 }}</span>
        </div>
        <div class="rc-tags">
          <span v-for="tag in recipe.tags?.slice(0, 3)" :key="tag" class="rc-tag-secondary">{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/recipe.js'
import { useBabyStore } from '../stores/baby.js'

const router = useRouter()
const recipeStore = useRecipeStore()
const babyStore = useBabyStore()

const keyword = ref('')
const activeTab = ref('all')

const tabs = [
  { key: 'all', label: '全部' },
  { key: '早餐', label: '🌅 早餐' },
  { key: '午餐', label: '☀️ 午餐' },
  { key: '晚餐', label: '🌙 晚餐' },
  { key: '加餐', label: '🍪 加餐' }
]

const filteredRecipes = computed(() => {
  let list = recipeStore.search(keyword.value)

  if (activeTab.value !== 'all') {
    list = list.filter(r => r.mealType === activeTab.value)
  }

  // 按年龄排序：适合当前年龄的排在前面
  if (babyStore.ageInMonths) {
    const ageYears = babyStore.ageInMonths / 12
    list = [...list].sort((a, b) => {
      const aFit = ageYears >= a.ageRange[0] && ageYears <= a.ageRange[1] ? 0 : 1
      const bFit = ageYears >= b.ageRange[0] && ageYears <= b.ageRange[1] ? 0 : 1
      return aFit - bFit
    })
  }

  return list
})

function doSearch() {
  // computed handles it
}

function goToRecipe(id) {
  router.push(`/recipe/${id}`)
}

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 12px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 12px;
  -webkit-overflow-scrolling: touch;
}

.tab {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid #e0e0e0;
  background: white;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.recipe-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recipe-card {
  cursor: pointer;
}

.recipe-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rc-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.rc-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.rc-badge.早餐 { background: #fef3e2; color: #e67e22; }
.rc-badge.午餐 { background: #e8f5e9; color: #27ae60; }
.rc-badge.晚餐 { background: #f3e5f5; color: #8e44ad; }
.rc-badge.加餐 { background: #fce4ec; color: #e74c3c; }

.rc-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.rc-tag {
  font-size: 12px;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 10px;
  color: #666;
}

.rc-more {
  background: #eee;
  color: #999;
}

.rc-tags {
  display: flex;
  gap: 4px;
}

.rc-tag-secondary {
  font-size: 11px;
  color: #bbb;
}
</style>
