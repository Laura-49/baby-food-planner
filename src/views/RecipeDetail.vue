<template>
  <div class="page">
    <header class="page-header">
      <button class="btn-back" @click="goBack">‹ 返回</button>
      <h1>{{ recipe?.name || '食谱详情' }}</h1>
      <button v-if="!editing" class="btn-icon" @click="startEdit" title="编辑食谱">✏️</button>
      <button v-if="editing" class="btn-icon" @click="cancelEdit" title="取消">❌</button>
    </header>

    <div v-if="!recipe" class="empty-state">
      <p>未找到该食谱</p>
    </div>

    <div v-else>
      <!-- 非编辑模式：展示 -->
      <template v-if="!editing">
        <div class="card">
          <div class="recipe-title">
            <h2>{{ recipe.name }}</h2>
            <span class="meal-badge">{{ mealTypeLabel }}</span>
          </div>
          <div class="recipe-meta">
            <span>👶 适合 {{ recipe.ageRange[0] }}岁 - {{ recipe.ageRange[1] === 99 ? '所有' : recipe.ageRange[1] + '岁' }}</span>
            <span>🏷️ {{ recipe.tags?.join('、') }}</span>
          </div>
        </div>

        <div class="card photo-placeholder" v-if="!localPhoto">
          <div class="photo-empty">📸 暂无照片</div>
        </div>
        <div class="card" v-else>
          <img :src="localPhoto" :alt="recipe.name" class="recipe-photo" />
        </div>

        <div class="card">
          <h3 class="section-title">🥘 食材清单</h3>
          <div class="ingredient-list">
            <div v-for="(ing, i) in recipe.ingredients" :key="i" class="ingredient-item">
              <span class="ing-bullet">•</span>
              <span>{{ ing }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="section-title">📝 做法步骤</h3>
          <div class="steps-list">
            <div v-for="(step, i) in recipe.steps" :key="i" class="step-item">
              <div class="step-number">{{ i + 1 }}</div>
              <div class="step-text">{{ step }}</div>
            </div>
          </div>
        </div>

        <!-- 外部链接 -->
        <div class="card" v-if="localLinks.length > 0">
          <h3 class="section-title">🔗 参考链接</h3>
          <div v-for="(link, i) in localLinks" :key="i" class="link-item">
            <a :href="link" target="_blank" rel="noopener" class="external-link">
              🔗 {{ getLinkLabel(link) }}
            </a>
          </div>
        </div>

        <!-- 用户备注 -->
        <div class="card note-card" v-if="localNotes">
          <h3 class="section-title">📝 我的备注</h3>
          <p class="note-text">{{ localNotes }}</p>
        </div>

        <!-- 备餐提示 -->
        <div class="card prep-tip-card" v-if="recipe.mealPrep">
          <div class="prep-tip-header">🥟 备餐指南</div>
          <p class="prep-tip-text">{{ recipe.prepNote || '适合提前做好冷冻保存' }}</p>
        </div>

        <!-- 编辑按钮 -->
        <button class="btn btn-primary btn-block edit-btn" @click="startEdit">✏️ 编辑这个食谱</button>

        <div class="card" v-if="recipe.isCustom">
          <button class="btn btn-danger btn-block" @click="removeRecipe">🗑️ 删除此食谱</button>
        </div>
      </template>

      <!-- 编辑模式 -->
      <template v-if="editing">
        <div class="card">
          <div class="form-group">
            <label>食谱名称</label>
            <input v-model="editForm.name" type="text" class="input" />
          </div>
          <div class="form-group">
            <label>餐别</label>
            <select v-model="editForm.mealType" class="input">
              <option value="早餐">早餐</option>
              <option value="午餐">午餐</option>
              <option value="晚餐">晚餐</option>
              <option value="加餐">加餐</option>
            </select>
          </div>
          <div class="form-group">
            <label>食材（每行一个）</label>
            <textarea v-model="editForm.ingredientsText" rows="4" class="input"></textarea>
          </div>
          <div class="form-group">
            <label>做法步骤（每行一步）</label>
            <textarea v-model="editForm.stepsText" rows="5" class="input"></textarea>
          </div>
          <div class="form-group">
            <label>标签（逗号分隔）</label>
            <input v-model="editForm.tagsText" type="text" class="input" />
          </div>
          <div class="form-group">
            <label>📝 我的备注</label>
            <textarea v-model="editForm.notes" rows="3" class="input" placeholder="比如：这个菜宝宝很爱吃、做的时候少放盐等"></textarea>
          </div>
          <div class="form-group">
            <label>🔗 参考链接</label>
            <div v-for="(link, i) in editForm.links" :key="i" class="link-edit-row">
              <input v-model="editForm.links[i]" type="url" class="input" placeholder="https://xiaohongshu.com/..." />
              <button class="btn-sm btn-secondary" @click="removeLink(i)">✕</button>
            </div>
            <button class="btn btn-sm btn-secondary add-link-btn" @click="addLink">➕ 添加链接</button>
            <p class="hint">支持小红书、抖音、下厨房等链接，点击即可跳转</p>
          </div>
          <button class="btn btn-primary btn-block" @click="saveEdit">💾 保存修改</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRecipeStore } from '../stores/recipe.js'

const props = defineProps({
  id: String
})

const router = useRouter()
const route = useRoute()
const recipeStore = useRecipeStore()

const editing = ref(false)
const localNotes = ref('')
const localLinks = ref([])
const localPhoto = ref('')

const recipe = computed(() => {
  return recipeStore.getRecipeById(props.id)
})

const mealTypeLabel = computed(() => {
  if (!recipe.value) return ''
  const map = { '早餐': '🌅 早餐', '午餐': '☀️ 午餐', '晚餐': '🌙 晚餐', '加餐': '🍪 加餐' }
  return map[recipe.value.mealType] || recipe.value.mealType
})

// 编辑表单
const editForm = ref({
  name: '',
  mealType: '午餐',
  ingredientsText: '',
  stepsText: '',
  tagsText: '',
  notes: '',
  links: []
})

onMounted(() => {
  loadLocalData()
})

function loadLocalData() {
  if (!recipe.value) return
  localNotes.value = recipe.value.notes || ''
  localLinks.value = recipe.value.links || []
  localPhoto.value = recipe.value.photo || ''
}

function startEdit() {
  if (!recipe.value) return
  editForm.value = {
    name: recipe.value.name,
    mealType: recipe.value.mealType,
    ingredientsText: recipe.value.ingredients.join('\n'),
    stepsText: recipe.value.steps.join('\n'),
    tagsText: (recipe.value.tags || []).join('、'),
    notes: localNotes.value,
    links: [...localLinks.value]
  }
  if (editForm.value.links.length === 0) editForm.value.links.push('')
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

function addLink() {
  editForm.value.links.push('')
}

function removeLink(index) {
  editForm.value.links.splice(index, 1)
  if (editForm.value.links.length === 0) editForm.value.links.push('')
}

function saveEdit() {
  if (!recipe.value) return

  const ingredients = editForm.value.ingredientsText.split('\n').filter(s => s.trim())
  const steps = editForm.value.stepsText.split('\n').filter(s => s.trim())
  const tags = editForm.value.tagsText ? editForm.value.tagsText.split(/[，,、\s]+/).filter(s => s.trim()) : []
  const links = editForm.value.links.filter(l => l.trim())

  const updated = {
    ...recipe.value,
    name: editForm.value.name.trim(),
    mealType: editForm.value.mealType,
    ingredients,
    steps,
    tags,
    notes: editForm.value.notes.trim(),
    links
  }

  recipeStore.updateRecipe(props.id, updated)
  localNotes.value = updated.notes
  localLinks.value = updated.links
  editing.value = false
  alert('修改已保存！')
}

function getLinkLabel(url) {
  if (!url) return '链接'
  if (url.includes('xiaohongshu') || url.includes('xhslink')) return '📕 小红书'
  if (url.includes('douyin')) return '🎵 抖音'
  if (url.includes('xiachufang')) return '👩‍🍳 下厨房'
  if (url.includes('bilibili')) return '📺 B站'
  if (url.includes('youtube')) return '▶️ YouTube'
  return url.length > 40 ? url.slice(0, 40) + '...' : url
}

function goBack() {
  router.back()
}

function removeRecipe() {
  if (confirm(`确定删除 "${recipe.value?.name}" 吗？`)) {
    recipeStore.removeCustomRecipe(props.id)
    router.push('/')
  }
}
</script>

<style scoped>
.recipe-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.recipe-title h2 {
  margin: 0;
  font-size: 20px;
}

.meal-badge {
  font-size: 12px;
  background: #ff6b6b;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  white-space: nowrap;
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #999;
}

.photo-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 160px;
  background: #fafafa;
}

.photo-empty {
  font-size: 16px;
  color: #ccc;
}

.recipe-photo {
  width: 100%;
  border-radius: 10px;
}

.section-title {
  font-size: 16px;
  margin: 0 0 12px;
  color: #444;
}

.ingredient-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
}

.ing-bullet {
  color: #ff6b6b;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  gap: 12px;
}

.step-number {
  width: 28px;
  height: 28px;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.step-text {
  font-size: 14px;
  color: #555;
  padding-top: 4px;
  line-height: 1.6;
}

.link-item {
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.link-item:last-child {
  border-bottom: none;
}

.external-link {
  color: #1a73e8;
  text-decoration: none;
  font-size: 14px;
  display: block;
  padding: 4px 0;
}

.external-link:active {
  opacity: 0.7;
}

.note-card {
  background: #fffef5;
  border: 1px solid #f0e68c;
}

.note-text {
  font-size: 14px;
  color: #886644;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.prep-tip-card {
  background: #fff8f0;
  border: 1px solid #ffe0b0;
}

.prep-tip-header {
  font-weight: 700;
  color: #e67e22;
  font-size: 15px;
  margin-bottom: 8px;
}

.prep-tip-text {
  font-size: 14px;
  color: #886644;
  line-height: 1.6;
  margin: 0;
}

.edit-btn {
  margin: 16px 0;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #ff6b6b;
}

textarea.input {
  resize: vertical;
  line-height: 1.6;
}

select.input {
  background: white;
}

.link-edit-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.link-edit-row .input {
  flex: 1;
}

.btn-sm {
  padding: 10px 16px;
  font-size: 14px;
  white-space: nowrap;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-secondary {
  background: #f0f0f0;
  color: #555;
}

.add-link-btn {
  margin-top: 4px;
  background: #f5f5f5;
  color: #888;
  width: 100%;
}

.hint {
  font-size: 12px;
  color: #bbb;
  margin-top: 6px;
}
</style>
