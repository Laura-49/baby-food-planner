/**
 * 工具函数集
 */
import { recipes, filterRecipesByAge, filterRecipesByAllergies, getRecipesByMealType } from '../data/recipes.js'
import { getNutritionByAge, getAgeKey, kindergartenMealPlan } from '../data/nutrition.js'

/**
 * 根据生日计算月龄
 */
export function calcAgeInMonths(birthDate) {
  const bd = new Date(birthDate)
  const now = new Date()
  let months = (now.getFullYear() - bd.getFullYear()) * 12
  months += now.getMonth() - bd.getMonth()
  if (now.getDate() < bd.getDate()) months--
  return Math.max(0, months)
}

/**
 * 根据月龄返回文字描述
 */
export function getAgeText(months) {
  if (months < 12) return `${months}个月`
  const years = Math.floor(months / 12)
  const remain = months % 12
  return remain > 0 ? `${years}岁${remain}个月` : `${years}岁`
}

/**
 * 根据月龄获取年龄阶段key
 */
export function getAgeStage(months) {
  return getAgeKey(months)
}

/**
 * 组合一餐：从食谱池中选多个组件，确保不重复
 * @param {object[]} pool - 该餐可选的食谱池
 * @param {object} componentMap - 需要的组件配置 {component: count, ...}
 * @param {string[]} excludeIds - 要排除的食谱id
 * @returns {object[]} 选中的食谱数组
 */
function composeMeal(pool, componentMap, excludeIds = []) {
  const result = []
  const used = [...excludeIds]
  for (const [comp, count] of Object.entries(componentMap)) {
    const candidates = pool.filter(r => r.component === comp && !used.includes(r.id))
    const picked = randomPick(candidates, count, used)
    for (const p of picked) {
      if (p) {
        result.push(p)
        used.push(p.id)
      }
    }
  }
  // 如果某个组件没选到，从池里随便补
  for (const [comp, count] of Object.entries(componentMap)) {
    const haveCount = result.filter(r => r.component === comp).length
    if (haveCount < count) {
      const extra = randomPick(pool, count - haveCount, used)
      for (const e of extra) {
        if (e) {
          result.push(e)
          used.push(e.id)
        }
      }
    }
  }
  return result
}

/**
 * 随机选取元素
 */
function randomPick(arr, count = 1, exclude = []) {
  const available = arr.filter(item => !exclude.includes(item.id || item))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * 生成一周食谱
 * @param {string} birthDate - 生日 YYYY-MM-DD
 * @param {string[]} allergies - 过敏食物
 * @param {string[]} disliked - 不喜欢食物
 * @returns {object[]} 一周七天的食谱数组
 */
export function generateWeeklyPlan(birthDate, allergies = [], disliked = []) {
  const months = calcAgeInMonths(birthDate)
  const nutrition = getNutritionByAge(months)
  const ageStage = getAgeStage(months)

  // 3岁以上用幼儿园食谱作为参考
  if (ageStage === '36-60' || ageStage === '60-84') {
    return generateKindergartenStylePlan(months, allergies, disliked)
  }

  // 3岁以下：用内置食谱库智能组合
  return generateBabyStylePlan(months, allergies, disliked)
}

/**
 * 3岁以下用内置食谱生成
 */
function generateBabyStylePlan(months, allergies, disliked) {
  let suitable = filterRecipesByAge(recipes, months)
  suitable = filterRecipesByAllergies(suitable, allergies, disliked)

  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const weekPlan = []
  const usedWeekIds = []

  for (const day of days) {
    const breakfastPool = getRecipesByMealType(suitable, '早餐')
    const lunchPool = getRecipesByMealType(suitable, '午餐')
    const dinnerPool = getRecipesByMealType(suitable, '晚餐')
    const snackPool = getRecipesByMealType(suitable, '加餐')

    // 早餐：主食 + 粥/糊 + 蛋白质（蒸蛋/肠/饼等）
    const breakfasts = composeMeal(breakfastPool, { staple: 1, porridge: 1 }, usedWeekIds)
    // 如果选不到两样，至少一个主食
    if (breakfasts.length < 2) {
      const extra = randomPick(breakfastPool, 2 - breakfasts.length, [...usedWeekIds, ...breakfasts.map(r => r.id)])
      breakfasts.push(...extra)
    }

    // 午餐：主菜 + 主食/汤
    const lunchComposition = { mainDish: 1 }
    // 每周二四六安排海鲜
    const seafoodDays = ['周二', '周四', '周六']
    if (seafoodDays.includes(day)) {
      const seafoodPool = lunchPool.filter(r => r.tags?.includes('海鲜'))
      if (seafoodPool.length > 0) {
        lunchComposition.mainDish = 1  // 会被海鲜覆盖
      }
    }
    let lunches = composeMeal(lunchPool, lunchComposition, usedWeekIds)
    // 再补一个主食或汤
    const riceSoupPool = lunchPool.filter(r => ['饭类', '面食', '汤类'].includes(r.category))
    const extraLunch = randomPick(riceSoupPool, 1, [...usedWeekIds, ...lunches.map(r => r.id)])[0]
    if (extraLunch) lunches.push(extraLunch)
    if (lunches.length < 2) {
      const fill = randomPick(lunchPool, 1, [...usedWeekIds, ...lunches.map(r => r.id)])[0]
      if (fill) lunches.push(fill)
    }

    // 晚餐：发酵面食/汤面 + 素菜汤
    let dinners = composeMeal(dinnerPool, { fermented: 1 }, usedWeekIds)
    if (dinners.length < 1) {
      dinners = composeMeal(dinnerPool, { soupMeal: 1 }, usedWeekIds)
    }
    if (dinners.length < 1) {
      const first = randomPick(dinnerPool, 1, usedWeekIds)[0]
      if (first) dinners.push(first)
    }
    // 再补一个清淡菜
    const lightPool = dinnerPool.filter(r => r.component === 'lightMeal' || r.tags?.some(t => ['好消化', '素菜', '清淡'].includes(t)))
    const extraDinner = randomPick(lightPool, 1, [...usedWeekIds, ...dinners.map(r => r.id)])[0]
    if (extraDinner) dinners.push(extraDinner)
    if (dinners.length < 2) {
      const fill = randomPick(dinnerPool, 1, [...usedWeekIds, ...dinners.map(r => r.id)])[0]
      if (fill) dinners.push(fill)
    }

    // 加餐
    const pickSnack = randomPick(snackPool, 1)[0] || snackPool[0]

    // 记录使用
    const dayIds = [...breakfasts.map(r => r.id), ...lunches.map(r => r.id), ...dinners.map(r => r.id), pickSnack?.id].filter(Boolean)
    usedWeekIds.push(...dayIds)
    // 每3天清空
    if (['周三', '周六'].includes(day)) usedWeekIds.splice(0, usedWeekIds.length)

    weekPlan.push({
      day,
      breakfast: breakfasts[0],
      breakfastSide: breakfasts[1] || null,
      morningSnack: null,
      lunch: lunches[0],
      lunchSide: lunches[1] || null,
      afternoonSnack: pickSnack,
      dinner: dinners[0],
      dinnerSide: dinners[1] || null,
      nutritionSummary: {
        milk: months >= 12 ? '建议早晚各一杯奶（约400ml）' : '配方奶600-800ml/日',
        note: '三餐两点制'
      }
    })
  }

  return weekPlan
}

/**
 * 3岁以上按幼儿园食谱风格生成，用内置食谱替换具体菜式
 */
function generateKindergartenStylePlan(months, allergies, disliked) {
  // 3岁以上同样用组合餐逻辑，但参考幼儿园结构加备注
  const plan = generateBabyStylePlan(months, allergies, disliked)
  for (let i = 0; i < plan.length; i++) {
    const ref = kindergartenMealPlan[i] || kindergartenMealPlan[0]
    plan[i].nutritionSummary = {
      milk: '早晚各一杯奶（约350-500ml/日）',
      note: ref ? `参考：${ref.lunch} 等幼儿园搭配` : ''
    }
  }
  return plan
}

/**
 * 搜索菜谱（从内置库中搜索）
 */
export function searchRecipes(keyword) {
  const kw = keyword.toLowerCase().trim()
  if (!kw) return recipes
  return recipes.filter(r =>
    r.name.toLowerCase().includes(kw) ||
    r.ingredients.some(i => i.toLowerCase().includes(kw)) ||
    r.tags.some(t => t.toLowerCase().includes(kw))
  )
}

/**
 * 重新生成某一天的食谱（不改变其他天）
 */
export function regenerateDay(plan, dayIndex, birthDate, allergies = [], disliked = []) {
  const months = calcAgeInMonths(birthDate)
  const ageStage = getAgeStage(months)
  let suitable = filterRecipesByAge(recipes, months)
  suitable = filterRecipesByAllergies(suitable, allergies, disliked)

  // 收集其他天用过的食谱ID（避免同一天重复）
  const usedIds = []
  for (let i = 0; i < plan.length; i++) {
    if (i === dayIndex) continue
    const d = plan[i]
    if (d.breakfast?.id) usedIds.push(d.breakfast.id)
    if (d.lunch?.id) usedIds.push(d.lunch.id)
    if (d.dinner?.id) usedIds.push(d.dinner.id)
    if (d.afternoonSnack?.id) usedIds.push(d.afternoonSnack.id)
  }

  const breakfasts = getRecipesByMealType(suitable, '早餐')
  const lunches = getRecipesByMealType(suitable, '午餐')
  const dinners = getRecipesByMealType(suitable, '晚餐')
  const snacks = getRecipesByMealType(suitable, '加餐')

  // 组合模式生成单天替换
  const bfCombo = composeMeal(breakfasts, { staple: 1, porridge: 1 }, usedIds)
  if (bfCombo.length < 2) {
    bfCombo.push(...randomPick(breakfasts, 2 - bfCombo.length, [...usedIds, ...bfCombo.map(r => r.id)]))
  }
  const pickBreakfast = bfCombo[0] || breakfasts[0]
  const pickBreakfastSide = bfCombo[1] || null

  const dayName = ['周一','周二','周三','周四','周五','周六','周日'][parseInt(dayIndex)]
  let lunchCombo
  const seafoodPool = lunches.filter(r => r.tags?.includes('海鲜'))
  if (['周二', '周四', '周六'].includes(dayName) && seafoodPool.length > 0) {
    const seaf = randomPick(seafoodPool, 1, usedIds)[0]
    lunchCombo = seaf ? [seaf] : []
  } else {
    lunchCombo = composeMeal(lunches, { mainDish: 1 }, usedIds)
  }
  if (lunchCombo.length < 1) lunchCombo = randomPick(lunches, 1, usedIds)
  const riceSoupExtra = randomPick(lunches.filter(r => ['饭类', '面食', '汤类'].includes(r.category)), 1, [...usedIds, ...lunchCombo.map(r => r.id)])[0]
  if (riceSoupExtra) lunchCombo.push(riceSoupExtra)
  const pickLunch = lunchCombo[0] || lunches[0]
  const pickLunchSide = lunchCombo[1] || null

  let dinnerCombo = composeMeal(dinners, { fermented: 1 }, usedIds)
  if (dinnerCombo.length < 1) dinnerCombo = composeMeal(dinners, { soupMeal: 1 }, usedIds)
  if (dinnerCombo.length < 1) dinnerCombo = randomPick(dinners, 1, usedIds)
  const lightDinner = randomPick(dinners.filter(r => r.component === 'lightMeal' || r.tags?.some(t => ['好消化', '素菜', '清淡'].includes(t))), 1, [...usedIds, ...dinnerCombo.map(r => r.id)])[0]
  if (lightDinner) dinnerCombo.push(lightDinner)
  const pickDinner = dinnerCombo[0] || dinners[0]
  const pickDinnerSide = dinnerCombo[1] || null

  const pickSnack = randomPick(snacks, 1)[0] || snacks[0]

  const ref = ageStage === '36-60' || ageStage === '60-84'
    ? kindergartenMealPlan[dayIndex] || kindergartenMealPlan[0]
    : null

  return {
    ...plan[dayIndex],
    breakfast: pickBreakfast,
    breakfastSide: pickBreakfastSide,
    morningSnack: ref ? { name: ref.morningSnack, mealType: '加餐', isSimple: true } : null,
    lunch: pickLunch,
    lunchSide: pickLunchSide,
    afternoonSnack: pickSnack,
    dinner: pickDinner,
    dinnerSide: pickDinnerSide,
    nutritionSummary: {
      milk: months >= 12 ? '建议早晚各一杯奶（约400ml）' : '配方奶600-800ml/日',
      note: ref ? `参考：${ref.lunch} 等幼儿园搭配` : ''
    }
  }
}

/**
 * 获取推荐的一周食谱（带完整的食材清单）
 */
export function getWeeklyShoppingList(weekPlan) {
  const allIngredients = new Set()
  for (const day of weekPlan) {
    for (const mealType of ['breakfast', 'breakfastSide', 'lunch', 'lunchSide', 'dinner', 'dinnerSide', 'afternoonSnack']) {
      const meal = day[mealType]
      if (meal && meal.ingredients) {
        meal.ingredients.forEach(ing => allIngredients.add(ing))
      }
    }
  }
  return [...allIngredients]
}

/**
 * 从localStorage读取宝宝档案
 */
export function loadBabyProfile() {
  try {
    const data = localStorage.getItem('baby-food-profile')
    if (data) return JSON.parse(data)
  } catch (e) { /* ignore */ }
  return null
}

/**
 * 保存宝宝档案到localStorage
 */
export function saveBabyProfile(profile) {
  localStorage.setItem('baby-food-profile', JSON.stringify(profile))
}

/**
 * 从localStorage读取周食谱
 */
export function loadWeeklyPlan() {
  try {
    const data = localStorage.getItem('baby-food-weekly-plan')
    if (data) return JSON.parse(data)
  } catch (e) { /* ignore */ }
  return null
}

/**
 * 保存周食谱到localStorage
 */
export function saveWeeklyPlan(plan) {
  localStorage.setItem('baby-food-weekly-plan', JSON.stringify(plan))
}

/**
 * 保存周标记
 */
export function saveWeekStart(dateStr) {
  localStorage.setItem('baby-food-week-start', dateStr)
}

export function loadWeekStart() {
  return localStorage.getItem('baby-food-week-start') || ''
}

/**
 * 检查保存的周食谱是否是本周的（如果是上周的则自动清空）
 */
export function isCurrentWeekPlan(savedWeekStart) {
  if (!savedWeekStart) return false
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (now.getDay() || 7) + 1)
  const thisWeek = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
  return savedWeekStart === thisWeek
}
