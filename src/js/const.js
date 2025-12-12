const state = {
  products: [],
  grid: [],
  rows: 0,
  score: 0,
  targetScore: 100,
  selectedIndices: [],
  timerMs: 0,
  running: false,
  lastMove: null,
  assists: {
    addNumbersUsed: 0,
    shuffleUsed: 0,
    eraserUsed: 0,
  },
  movesMade: 0,
};

const CATEGORY = [
  "id",
  "title",
  "amount",
  "measure",
  "brand",
  "price",
  "shop",
  "macros",
];

const SHOPS = [
  'Магнит',
  'Пятерочка',
  'Перекресток',
  'Чижик',
  'Красное Белое',
]

const MEASURES = [
  'g',
  'ml',
  'pcs',
]

const FALLBACK_PRODUCTS = [
  {
    title: "Молоко",
    amount: 930,
    measure: "ml",
    brand: "Простоквашино",
    price: 68,
    shop: "Магнит",
    calories: 60,
    proteins: 3,
    fats: 3,
    carbs: 5,
  },
  {
    title: "Сахар",
    amount: 500,
    measure: "g",
    brand: null,
    price: 50,
    shop: "Пятёрочка",
    calories: 387,
    proteins: 0,
    fats: 0,
    carbs: 99,
  },
  {
    title: "Чебупели",
    amount: 600,
    measure: "g",
    brand: "Горячая Штучка",
    price: 150,
    shop: "Красное Белое",
    calories: 549,
    proteins: 10,
    fats: 234,
    carbs: 69,
  },
];

export {state, SHOPS, MEASURES, CATEGORY, FALLBACK_PRODUCTS}