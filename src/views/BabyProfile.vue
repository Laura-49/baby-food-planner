<template>
  <div class="page">
    <header class="page-header">
      <button class="btn-back" @click="goBack">‹ 返回</button>
      <h1>👶 宝宝信息</h1>
    </header>

    <div class="card">
      <div class="form-group">
        <label>宝宝昵称</label>
        <input v-model="form.name" type="text" placeholder="如：小宝" class="input" />
      </div>

      <div class="form-group">
        <label>出生日期</label>
        <input v-model="form.birthDate" type="date" class="input" />
      </div>

      <div class="form-group">
        <label>过敏食物（可多个，用逗号分隔）</label>
        <input v-model="form.allergiesText" type="text" placeholder="如：鸡蛋、牛奶、花生" class="input" />
        <p class="hint">没有则留空</p>
      </div>

      <div class="form-group">
        <label>不爱吃的食物（可多个，用逗号分隔）</label>
        <input v-model="form.dislikedText" type="text" placeholder="如：胡萝卜、青椒" class="input" />
        <p class="hint">没有则留空</p>
      </div>

      <button class="btn btn-primary btn-block" @click="save">保存</button>
    </div>

    <div v-if="store.hasProfile" class="card">
      <h3>📊 当前年龄阶段</h3>
      <div class="age-info">
        <div class="age-big">{{ store.ageText }}</div>
        <div class="age-stage">{{ stageInfo.label }}营养参考</div>
      </div>
      <div class="nutrition-detail" v-if="stageInfo">
        <div class="nutri-row"><span>🥛 奶类</span><span>{{ stageInfo.milk }}</span></div>
        <div class="nutri-row"><span>🌾 谷类</span><span>{{ stageInfo.grains }}</span></div>
        <div class="nutri-row"><span>🥬 蔬菜</span><span>{{ stageInfo.vegetables }}</span></div>
        <div class="nutri-row"><span>🍎 水果</span><span>{{ stageInfo.fruits }}</span></div>
        <div class="nutri-row"><span>🥩 肉禽鱼</span><span>{{ stageInfo.meatFish }}</span></div>
        <div class="nutri-row"><span>🥚 蛋类</span><span>{{ stageInfo.egg }}</span></div>
        <div class="nutri-row"><span>🛢️ 油</span><span>{{ stageInfo.oil }}</span></div>
        <div class="nutri-row"><span>🧂 盐</span><span>{{ stageInfo.salt }}</span></div>
        <div class="nutri-row nutri-note"><span>📋 进餐模式</span><span>{{ stageInfo.mealPattern }}</span></div>
      </div>
      <div class="features" v-if="stageInfo">
        <h4>注意事项</h4>
        <ul>
          <li v-for="(f, i) in stageInfo.features" :key="i">{{ f }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBabyStore } from '../stores/baby.js'
import { getNutritionByAge } from '../data/nutrition.js'

const router = useRouter()
const store = useBabyStore()

const form = ref({
  name: '',
  birthDate: '',
  allergiesText: '',
  dislikedText: ''
})

onMounted(() => {
  if (store.hasProfile) {
    form.value.name = store.profile.name
    form.value.birthDate = store.profile.birthDate
    form.value.allergiesText = store.profile.allergies.join('、')
    form.value.dislikedText = store.profile.disliked.join('、')
  }
})

const stageInfo = computed(() => {
  if (!store.ageInMonths) return null
  return getNutritionByAge(store.ageInMonths)
})

function parseList(text) {
  if (!text || !text.trim()) return []
  return text.split(/[，,、\s]+/).filter(s => s.trim())
}

function save() {
  if (!form.value.name) {
    alert('请输入宝宝昵称')
    return
  }
  if (!form.value.birthDate) {
    alert('请选择出生日期')
    return
  }
  store.updateProfile({
    name: form.value.name,
    birthDate: form.value.birthDate,
    allergies: parseList(form.value.allergiesText),
    disliked: parseList(form.value.dislikedText)
  })
  alert('保存成功！')
  goBack()
}

function goBack() {
  router.push('/')
}
</script>

<style scoped>
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
  -webkit-appearance: none;
}

.input:focus {
  outline: none;
  border-color: #ff6b6b;
}

.hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.age-info {
  text-align: center;
  padding: 20px 0;
}

.age-big {
  font-size: 28px;
  font-weight: 700;
  color: #ff6b6b;
}

.age-stage {
  color: #999;
  margin-top: 4px;
}

.nutrition-detail {
  margin: 16px 0;
}

.nutri-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
}

.nutri-row:last-child {
  border-bottom: none;
}

.nutri-note {
  font-weight: 500;
  color: #ff6b6b;
}

.features {
  background: #fff8f0;
  border-radius: 10px;
  padding: 16px;
  margin-top: 12px;
}

.features h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #e67e22;
}

.features ul {
  margin: 0;
  padding-left: 20px;
}

.features li {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}
</style>
