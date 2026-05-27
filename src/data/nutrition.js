/**
 * 各年龄段每日营养参考标准
 * 基于《中国居民膳食指南（2022）》学龄前儿童卷
 */
export const nutritionStandards = {
  '6-12': {
    label: '6-12个月',
    energy: '约 700-900 kcal/日',
    milk: '600-800ml/日（母乳或配方奶）',
    grains: '20-75g/日',
    vegetables: '25-75g/日',
    fruits: '25-100g/日',
    meatFish: '25-75g/日',
    egg: '15-50g/日（逐渐从半个到1个）',
    oil: '0-10g/日',
    salt: '不添加',
    features: [
      '从泥糊状过渡到碎末状、小颗粒',
      '每餐引入新食物需观察3-5天',
      '食物需细腻软烂',
      '禁止蜂蜜、整粒坚果、果冻'
    ],
    mealPattern: '每天 2-3 次辅食 + 4-6 次奶'
  },
  '12-24': {
    label: '1-2岁',
    energy: '约 900-1100 kcal/日',
    milk: '400-600ml/日（配方奶/纯牛奶）',
    grains: '75-125g/日',
    vegetables: '100-150g/日',
    fruits: '100-150g/日',
    meatFish: '50-75g/日',
    egg: '50g/日（1个）',
    oil: '10-20g/日',
    salt: '<1.5g/日（极少）',
    features: [
      '食物从碎末状过渡到软烂小块',
      '尝试小馄饨、软饭、小块蔬菜',
      '完全不加或极少加盐',
      '坚果需碾碎'
    ],
    mealPattern: '每天 3 次正餐 + 2 次加餐 + 奶'
  },
  '24-36': {
    label: '2-3岁',
    energy: '约 1100-1250 kcal/日',
    milk: '350-500ml/日',
    grains: '100-150g/日（包括全谷物20-30g）',
    vegetables: '150-200g/日（深色蔬菜占一半）',
    fruits: '100-150g/日',
    meatFish: '50-75g/日',
    egg: '50g/日（1个）',
    oil: '15-25g/日',
    salt: '<2g/日',
    features: [
      '食物切成1-2cm小块',
      '可以吃家庭餐但需少盐少油',
      '训练独立进食',
      '杜绝整粒坚果、硬糖、果冻'
    ],
    mealPattern: '三餐两点 + 早晚两杯奶'
  },
  '36-60': {
    label: '3-5岁',
    energy: '约 1200-1400 kcal/日',
    milk: '350-500ml/日',
    grains: '100-150g/日（全谷物和杂豆占20-30g）',
    vegetables: '150-200g/日（深色蔬菜占一半以上）',
    fruits: '100-150g/日',
    meatFish: '50-75g/日',
    egg: '50g/日（1个）',
    oil: '15-25g/日',
    salt: '<3g/日',
    features: [
      '接近成人餐但需做调整：更软烂、少盐少油',
      '食物切成1-2cm小块',
      '可以吃带少量骨刺的鱼（需加倍小心）',
      '可以接触少量调味品'
    ],
    mealPattern: '三餐两点 + 早晚各一杯奶'
  },
  '60-84': {
    label: '5-7岁',
    energy: '约 1400-1600 kcal/日',
    milk: '300-400ml/日',
    grains: '150-200g/日（全谷物和杂豆30-50g）',
    vegetables: '200-250g/日',
    fruits: '150-200g/日',
    meatFish: '50-75g/日',
    egg: '50g/日（1个）',
    oil: '20-25g/日',
    salt: '<3g/日',
    features: [
      '基本与成人餐一致',
      '注意食物多样性',
      '控制零食和含糖饮料',
      '培养良好饮食习惯'
    ],
    mealPattern: '三餐 + 1-2 次加餐'
  }
}

/**
 * 根据月龄获取对应的营养标准key
 */
export function getAgeKey(months) {
  if (months <= 12) return '6-12'
  if (months <= 24) return '12-24'
  if (months <= 36) return '24-36'
  if (months <= 60) return '36-60'
  return '60-84'
}

/**
 * 根据月龄获取营养标准对象
 */
export function getNutritionByAge(months) {
  const key = getAgeKey(months)
  return nutritionStandards[key]
}

/**
 * 幼儿园食谱参考（3岁以上用）
 * 参考网上公开的幼儿园一周食谱
 */
export const kindergartenMealPlan = [
  {
    day: '周一',
    breakfast: '牛奶200ml + 小米粥 + 馒头 + 鸡蛋羹',
    morningSnack: '香蕉半根',
    lunch: '软米饭 + 番茄炒蛋 + 清蒸鲈鱼（去刺碎肉） + 菠菜豆腐汤',
    afternoonSnack: '酸奶100g + 小饼干2块',
    dinner: '碎肉青菜面 + 蒸南瓜'
  },
  {
    day: '周二',
    breakfast: '牛奶200ml + 燕麦粥 + 全麦小面包',
    morningSnack: '苹果小块',
    lunch: '二米饭 + 土豆炖牛肉（切碎） + 西蓝花炒胡萝卜 + 紫菜蛋花汤',
    afternoonSnack: '蒸红薯小条 + 牛奶50ml',
    dinner: '菜肉小馄饨 + 蒸玉米段'
  },
  {
    day: '周三',
    breakfast: '牛奶200ml + 鸡蛋软饼 + 蒸山药',
    morningSnack: '橙子剥瓣切小',
    lunch: '软米饭 + 虾仁豆腐 + 清炒小白菜 + 番茄菌菇汤',
    afternoonSnack: '现磨豆浆100ml + 坚果碎小馒头',
    dinner: '番茄肉末意面 + 黄瓜片'
  },
  {
    day: '周四',
    breakfast: '牛奶200ml + 红豆粥 + 小肉包',
    morningSnack: '梨切小块',
    lunch: '紫米饭 + 红烧鸡翅（去骨拆肉） + 蒜蓉生菜 + 海带排骨汤（去油）',
    afternoonSnack: '纯酸奶100g + 燕麦饼干',
    dinner: '南瓜小米粥 + 鸡蛋软饼 + 清炒荷兰豆碎'
  },
  {
    day: '周五',
    breakfast: '牛奶200ml + 蒸饺（猪肉白菜馅）',
    morningSnack: '草莓3-4颗（切半）',
    lunch: '软米饭 + 胡萝卜炒肉丝 + 香菇青菜 + 鲫鱼豆腐汤（去刺）',
    afternoonSnack: '蒸紫薯条 + 牛奶50ml',
    dinner: '牛肉菠菜粥 + 小花卷 + 焯水西芹条'
  },
  {
    day: '周六',
    breakfast: '牛奶200ml + 红薯小米粥 + 煮鸡蛋（半个）',
    morningSnack: '蓝莓一小把',
    lunch: '软米饭 + 菌菇鸡肉烩饭 + 清炒菠菜 + 冬瓜虾皮汤',
    afternoonSnack: '酸奶100g + 小松饼',
    dinner: '番茄鸡蛋面 + 蒸玉米'
  },
  {
    day: '周日',
    breakfast: '牛奶200ml + 黑芝麻糊 + 小花卷',
    morningSnack: '猕猴桃切片',
    lunch: '软米饭 + 鸡蛋炒虾仁 + 蒜蓉西蓝花 + 番茄蛋花汤',
    afternoonSnack: '蒸红薯条 + 牛奶50ml',
    dinner: '白菜猪肉水饺 + 紫菜蛋花汤'
  }
]
