import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/BabyProfile.vue')
  },
  {
    path: '/weekly',
    name: 'weekly',
    component: () => import('../views/WeeklyPlan.vue')
  },
  {
    path: '/daily/:dayIndex',
    name: 'daily',
    component: () => import('../views/DailyPlan.vue'),
    props: true
  },
  {
    path: '/recipe/:id',
    name: 'recipe',
    component: () => import('../views/RecipeDetail.vue'),
    props: true
  },
  {
    path: '/add-recipe',
    name: 'addRecipe',
    component: () => import('../views/AddRecipe.vue')
  },
  {
    path: '/recipes',
    name: 'recipes',
    component: () => import('../views/RecipeList.vue')
  },
  {
    path: '/meal-prep',
    name: 'mealPrep',
    component: () => import('../views/MealPrep.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
