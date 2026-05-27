import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { recipes, filterRecipesByAge, filterRecipesByAllergies } from '../data/recipes.js'
import { searchRecipes } from '../utils/helpers.js'

export const useRecipeStore = defineStore('recipe', () => {
  const customRecipes = ref([])
  const searchResults = ref([])
  const currentRecipe = ref(null)

  const allRecipes = computed(() => [...recipes, ...customRecipes.value])

  function search(keyword) {
    searchResults.value = searchRecipes(keyword)
    return searchResults.value
  }

  function addCustomRecipe(recipe) {
    const newId = `custom_${Date.now()}`
    customRecipes.value.push({
      id: newId,
      ...recipe,
      isCustom: true
    })
    return newId
  }

  function removeCustomRecipe(id) {
    customRecipes.value = customRecipes.value.filter(r => r.id !== id)
  }

  function updateRecipe(id, data) {
    // 如果是自定义食谱，直接更新
    const idx = customRecipes.value.findIndex(r => r.id === id)
    if (idx !== -1) {
      customRecipes.value[idx] = { ...customRecipes.value[idx], ...data }
      return true
    }

    // 内置食谱：把用户修改存到 localStorage 覆盖
    try {
      const overrides = JSON.parse(localStorage.getItem('baby-recipe-overrides') || '{}')
      const existing = overrides[id] || {}
      // 只存用户能改的字段：notes, links, photo, ingredients, steps 等
      const allowed = {}
      if (data.notes !== undefined) allowed.notes = data.notes
      if (data.links !== undefined) allowed.links = data.links
      if (data.photo !== undefined) allowed.photo = data.photo
      if (data.ingredients !== undefined) allowed.ingredients = data.ingredients
      if (data.steps !== undefined) allowed.steps = data.steps
      if (data.tags !== undefined) allowed.tags = data.tags
      overrides[id] = { ...existing, ...allowed }
      localStorage.setItem('baby-recipe-overrides', JSON.stringify(overrides))
      return true
    } catch (e) {
      return false
    }
  }

  function getRecipeById(id) {
    const base = allRecipes.value.find(r => r.id === id)
    if (!base) return null

    // 合并用户的覆盖编辑
    try {
      const overrides = JSON.parse(localStorage.getItem('baby-recipe-overrides') || '{}')
      const userData = overrides[id]
      if (userData) {
        return { ...base, ...userData }
      }
    } catch (e) { /* ignore */ }

    return base
  }

  function getRecipesByAge(months, allergies = [], disliked = []) {
    let suitable = filterRecipesByAge(allRecipes.value, months)
    suitable = filterRecipesByAllergies(suitable, allergies, disliked)
    return suitable
  }

  return {
    customRecipes,
    searchResults,
    currentRecipe,
    allRecipes,
    search,
    addCustomRecipe,
    removeCustomRecipe,
    updateRecipe,
    getRecipeById,
    getRecipesByAge
  }
})
