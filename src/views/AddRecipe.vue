<template>
  <div class="page">
    <header class="page-header">
      <button class="btn-back" @click="goBack">‹ 返回</button>
      <h1>🧑‍🍳 添加食谱</h1>
    </header>

    <div class="card">
      <div class="form-group">
        <label>食谱名称</label>
        <div class="search-row">
          <input v-model="recipeName" type="text" placeholder="如：南瓜馒头" class="input flex-1" />
          <button class="btn btn-sm btn-secondary" @click="searchOnline" :disabled="searching">
            {{ searching ? '搜索中...' : '🔍 搜索' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="card">
      <h3>搜索结果</h3>
      <div v-for="(r, i) in searchResults" :key="i" class="search-result-item" @click="selectResult(r)">
        <div class="result-name">{{ r.name }}</div>
        <div class="result-meta">{{ r.mealType }} · {{ r.ingredients?.slice(0, 3).join('、') }}{{ r.ingredients?.length > 3 ? '...' : '' }}</div>
      </div>
    </div>

    <div v-if="searchMessage" class="card info-card">
      <p>{{ searchMessage }}</p>
    </div>

    <!-- 拍照识别幼儿园食谱 -->
    <div class="card scan-card" @click="scanKindergartenMenu">
      <div class="scan-content">
        <span class="scan-icon">📷</span>
        <div class="scan-text">
          <span class="scan-title">拍照识别幼儿园食谱</span>
          <span class="scan-desc">上传照片，自动提取食谱内容</span>
        </div>
        <span class="arrow">›</span>
      </div>
    </div>

    <!-- 手动输入表单 -->
    <div class="card">
      <h3>📝 食谱详情</h3>

      <div class="form-group">
        <label>餐别</label>
        <select v-model="form.mealType" class="input">
          <option value="早餐">🌅 早餐</option>
          <option value="午餐">☀️ 午餐</option>
          <option value="晚餐">🌙 晚餐</option>
          <option value="加餐">🍪 加餐/点心</option>
        </select>
      </div>

      <div class="form-group">
        <label>适合年龄（最小）</label>
        <select v-model="form.ageMin" class="input">
          <option :value="0.5">6个月+</option>
          <option :value="1">1岁+</option>
          <option :value="1.5">1.5岁+</option>
          <option :value="2">2岁+</option>
          <option :value="3">3岁+</option>
        </select>
      </div>

      <div class="form-group">
        <label>食材（每行一个）</label>
        <textarea v-model="form.ingredientsText" rows="4" class="input" placeholder="面粉&#10;南瓜&#10;酵母"></textarea>
      </div>

      <div class="form-group">
        <label>做法步骤（每行一步）</label>
        <textarea v-model="form.stepsText" rows="5" class="input" placeholder="南瓜蒸熟压泥&#10;面粉加酵母和南瓜泥揉面团&#10;发酵后整形&#10;上锅蒸15分钟"></textarea>
      </div>

      <div class="form-group">
        <label>标签（逗号分隔）</label>
        <input v-model="form.tagsText" type="text" placeholder="如：快手、蒸菜、补钙" class="input" />
      </div>

      <button class="btn btn-primary btn-block" @click="saveRecipe">保存食谱</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/recipe.js'

const router = useRouter()
const recipeStore = useRecipeStore()

const recipeName = ref('')
const searching = ref(false)
const searchResults = ref([])
const searchMessage = ref('')

const form = ref({
  mealType: '午餐',
  ageMin: 1,
  ingredientsText: '',
  stepsText: '',
  tagsText: ''
})

async function searchOnline() {
  const name = recipeName.value.trim()
  if (!name) {
    alert('请输入食谱名称')
    return
  }

  searching.value = true
  searchResults.value = []
  searchMessage.value = ''

  // 先从内置食谱库搜索
  const builtinResults = recipeStore.search(name)
  if (builtinResults.length > 0) {
    searchResults.value = builtinResults
    searchMessage.value = `在内置食谱中找到 ${builtinResults.length} 个匹配`
  } else {
    // 内置库没有，提示需要手动输入
    searchMessage.value = `未找到"${name}"的公开食谱，请在下方手动填写`
  }

  // 填充表单
  form.value.name = name

  // 如果搜索到唯一结果，自动填充
  if (searchResults.value.length === 1) {
    fillForm(searchResults.value[0])
  }

  searching.value = false
}

function fillForm(recipe) {
  form.value.mealType = recipe.mealType
  form.value.ageMin = recipe.ageRange[0]
  form.value.ingredientsText = recipe.ingredients.join('\n')
  form.value.stepsText = recipe.steps.join('\n')
  form.value.tagsText = (recipe.tags || []).join('、')
}

function selectResult(recipe) {
  fillForm(recipe)
  recipeName.value = recipe.name
}

function saveRecipe() {
  if (!recipeName.value.trim()) {
    alert('请输入食谱名称')
    return
  }
  if (!form.value.ingredientsText.trim()) {
    alert('请输入食材清单')
    return
  }
  if (!form.value.stepsText.trim()) {
    alert('请输入做法步骤')
    return
  }

  const ingredients = form.value.ingredientsText.split('\n').filter(s => s.trim())
  const steps = form.value.stepsText.split('\n').filter(s => s.trim())
  const tags = form.value.tagsText ? form.value.tagsText.split(/[，,、\s]+/).filter(s => s.trim()) : []

  const newRecipe = {
    name: recipeName.value.trim(),
    ageRange: [form.value.ageMin, 99],
    mealType: form.value.mealType,
    ingredients,
    steps,
    tags,
    photo: '',
    notes: '',
    links: []
  }

  recipeStore.addCustomRecipe(newRecipe)
  alert('食谱保存成功！')
  router.push('/')
}

/**
 * 拍照识别幼儿园食谱
 * 用 file input 调起手机拍照，然后把图片传给 vision 分析
 */
function scanKindergartenMenu() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  // 手机上优先调相机
  input.capture = 'environment'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 显示 loading
    searchMessage.value = '📷 正在识别食谱图片...'

    // 用 FileReader 转 base64
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target.result

      try {
        // 调用 Hermes 的 vision 来分析
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            prompt: '这是一张幼儿园食谱图片。请识别出其中所有的食谱内容，包括：日期/星期、餐次（早餐/午餐/晚餐/加餐）、菜名。请按天整理成结构化的JSON格式返回。'
          })
        })

        if (!response.ok) {
          // Vision API 不可用，降级为手动输入模式
          searchMessage.value = '⚠️ 当前环境不支持自动识别。请参考图片内容，在下方手动输入食谱。你也可以点击添加菜单的链接，把链接发给我，我帮你看。'
          return
        }

        const result = await response.json()
        if (result.recipes && result.recipes.length > 0) {
          // 自动填充第一个识别出的食谱
          const first = result.recipes[0]
          recipeName.value = first.name || '识别食谱'
          form.value.mealType = first.mealType || '午餐'
          form.value.ingredientsText = (first.ingredients || []).join('\n')
          form.value.stepsText = (first.steps || []).join('\n')
          searchMessage.value = `✅ 成功识别！已自动填充"${first.name}"，核对后保存即可。`
        } else {
          searchMessage.value = '✅ 识别完成！请参考图片内容在下方手动输入。你也可以把图片链接发给我，我来帮你提取。'
        }
      } catch (err) {
        searchMessage.value = '⚠️ 识别服务暂时不可用，请在下方手动输入食谱。'
      }
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.search-row {
  display: flex;
  gap: 8px;
}

.flex-1 {
  flex: 1;
}

.btn-sm {
  padding: 10px 16px;
  font-size: 14px;
  white-space: nowrap;
}

.search-result-item {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: #f9f9f9;
  margin: 0 -16px;
  padding: 12px 16px;
  border-radius: 8px;
}

.result-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.result-meta {
  font-size: 12px;
  color: #999;
}

.info-card {
  background: #e8f5e9;
}

.info-card p {
  margin: 0;
  font-size: 14px;
  color: #2e7d32;
}

.scan-card {
  cursor: pointer;
  border: 2px dashed #ff6b6b;
  background: #fff5f5;
  margin-bottom: 20px;
}

.scan-card:active {
  background: #ffe0e0;
}

.scan-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scan-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.scan-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.scan-title {
  font-weight: 700;
  font-size: 15px;
  color: #e74c3c;
}

.scan-desc {
  font-size: 12px;
  color: #e67e22;
  margin-top: 2px;
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
  transition: border-color 0.2s;
  font-family: inherit;
  -webkit-appearance: none;
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
</style>
