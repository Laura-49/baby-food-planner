import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { calcAgeInMonths, getAgeText, generateWeeklyPlan, loadBabyProfile, saveBabyProfile, loadWeeklyPlan, saveWeeklyPlan, loadWeekStart, saveWeekStart, isCurrentWeekPlan } from '../utils/helpers.js'

export const useBabyStore = defineStore('baby', () => {
  const profile = ref(loadBabyProfile() || {
    name: '宝宝',
    birthDate: '',
    allergies: [],
    disliked: []
  })

  const weeklyPlan = ref([])
  const currentWeekStart = ref('')

  const ageInMonths = computed(() => {
    if (!profile.value.birthDate) return 0
    return calcAgeInMonths(profile.value.birthDate)
  })

  const ageText = computed(() => {
    if (!profile.value.birthDate) return '请设置宝宝生日'
    return getAgeText(ageInMonths.value)
  })

  const hasProfile = computed(() => !!profile.value.birthDate)

  // 启动时自动恢复本周食谱
  function restorePlan() {
    const savedStart = loadWeekStart()
    if (savedStart && isCurrentWeekPlan(savedStart)) {
      const savedPlan = loadWeeklyPlan()
      if (savedPlan && savedPlan.length > 0) {
        weeklyPlan.value = savedPlan
        currentWeekStart.value = savedStart
        return true
      }
    }
    return false
  }

  function updateProfile(data) {
    profile.value = { ...profile.value, ...data }
    saveBabyProfile(profile.value)
  }

  function generatePlan() {
    if (!profile.value.birthDate) return
    const plan = generateWeeklyPlan(
      profile.value.birthDate,
      profile.value.allergies,
      profile.value.disliked
    )
    weeklyPlan.value = plan
    saveWeeklyPlan(plan)

    // 标记当前周的起始日
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (now.getDay() || 7) + 1)
    const weekStart = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
    currentWeekStart.value = weekStart
    saveWeekStart(weekStart)
  }

  function getDayPlan(dayIndex) {
    return weeklyPlan.value[dayIndex] || null
  }

  return {
    profile,
    weeklyPlan,
    currentWeekStart,
    ageInMonths,
    ageText,
    hasProfile,
    restorePlan,
    updateProfile,
    generatePlan,
    getDayPlan
  }
})
