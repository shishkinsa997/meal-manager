import { CATEGORY } from "./const";

function generateId() {
  return crypto.randomUUID();
}

function createProductIdGenerator() {
  let lastId = parseInt(localStorage.getItem('lastProductId')) || 0;
  // let lastId = 0;
  return {
    generate: function () {
      lastId++;
      localStorage.setItem('lastProductId', lastId.toString());
      const paddedId = lastId.toString().padStart(4, "0");
      return `prod_${paddedId}`;
    },

    getLastId: function () {
      return lastId;
    },

    reset: function () {
      lastId = 0;
      localStorage.removeItem('lastProductId');
    },
  };
}

const productIdGenerator = createProductIdGenerator();

class Product {
  constructor({
    id = productIdGenerator.generate(),
    title = "",
    amount = 0,
    measure = "",
    brand = "",
    price = 0,
    shop = "",
    calories = 0,
    proteins = 0,
    fats = 0,
    carbs = 0,
  } = {}) {
    this.id = id;
    this.title = title;
    this.amount = Number(amount) || 0;
    this.measure = measure;
    this.brand = brand;
    this.price = Number(price) || 0;
    this.shop = shop;
    this.macros = {
      calories: Number(calories) || 0,
      proteins: Number(proteins) || 0,
      fats: Number(fats) || 0,
      carbs: Number(carbs) || 0,
    };
  }
}

const products = [];

function initProducts(list = []) {
  products.splice(0, products.length, ...list.map((item) => new Product(item)));
}

function addProduct(data) {
  const product = new Product(data);
  products.push(product);
  return product;
}

function getProduct(id) {
  return products.find((p) => p.id === id) || null;
}

function getAllProducts() {
  return [...products];
}

function getAllCategories() {
  return [...CATEGORY];
}

function updateProduct(id, data) {
  const product = getProduct(id);
  if (!product) return null;
  const updated = new Product({ ...product, ...data, id });
  Object.assign(product, updated);
  return product;
}

function deleteProduct(id) {
  console.log(id);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

export {
  Product,
  addProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getAllProducts,
  getAllCategories,
  initProducts,
  products,
};
