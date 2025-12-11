function generateId() {
  return crypto.randomUUID();
}

function counter() {
  let counter = 0;
  function inner() {
    counter++;
    return counter;
  }

  return inner;
}

const countId = counter();

function createProductIdGenerator() {
  // let lastId = parseInt(localStorage.getItem('lastProductId')) || 0;
  let lastId = 0;
  return {
    generate: function() {
      lastId++;
      // localStorage.setItem('lastProductId', lastId.toString());
      const paddedId = lastId.toString().padStart(4, '0');
      return `prod_${paddedId}`;
    },

    getLastId: function() {
      return lastId;
    },

    reset: function() {
      lastId = 0;
      // localStorage.removeItem('lastProductId');
    }
  };
}

const productIdGenerator = createProductIdGenerator();

class Product {
  constructor(title, amount, measure, brand, priсe, shop, calories, proteins, fats, carbs, ...rest) {
    this.id = productIdGenerator.generate();
    this.title = title;
    this.amount = amount;
    this.measure = measure;
    this.brand = brand;
    this.price = priсe || 0;
    this.shop = shop;
    this.macros = {
      calories, proteins, fats, carbs
    }
    this.rest = rest
  }
}

const products = [];

function addProduct(...args) {
  const product = new Product(...args);
  products.push(product || 0);
  console.log(product.id)
  return product;
}

function getProduct(id) {
  return products.find(p => p.id === id) || null;
}

function getAllProducts() {
  return products;
}

function getAllCategories() {
  return Object.keys(new Product());
}

function updateProduct(id, data) {
  const product = getProduct(id);
  if (!product) return false;

  Object.assign(product, data);

  return true;
}

function deleteProduct(id) {
  console.log(id)
  console.log(typeof id)
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return false;

  products.splice(index, 1);
  return true;
}


const p1 = addProduct("Молоко", 930, "ml", "Простоквашино", null, "Магнит", 100, 6, 3, 4);
const p2 = addProduct("Сахар", 500, "g", null, 50, "Пятёрочка", 387, 0, 0, 99, 86);

console.log("ALL:", getAllProducts());
console.log("Categories:", getAllCategories());

// deleteProduct(p1.id);
// updateProduct(p2.id, { price: 99, amount: 2, etc: 67 })
// console.log("After:", getAllProducts());

export {addProduct, updateProduct, deleteProduct, getProduct, getAllProducts, getAllCategories, products, productIdGenerator, Product}