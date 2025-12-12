(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function el(tag, options = {}) {
  const e = document.createElement(tag);
  if (options.className) e.className = options.className;
  if (options.id) e.id = options.id;
  if (options.text) e.textContent = options.text;
  if (options.html) e.innerHTML = options.html;
  if (options.attrs) {
    for (const k in options.attrs) e.setAttribute(k, options.attrs[k]);
  }
  return e;
}
const state = {
  products: []
};
const CATEGORY = [
  "id",
  "title",
  "amount",
  "measure",
  "brand",
  "price",
  "shop",
  "macros"
];
const SHOPS = [
  "Магнит",
  "Пятерочка",
  "Перекресток",
  "Чижик",
  "Красное Белое"
];
const MEASURES = [
  "g",
  "ml",
  "pcs"
];
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
    carbs: 5
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
    carbs: 99
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
    carbs: 69
  }
];
function createProductIdGenerator() {
  let lastId = parseInt(localStorage.getItem("lastProductId")) || 0;
  return {
    generate: function() {
      lastId++;
      localStorage.setItem("lastProductId", lastId.toString());
      const paddedId = lastId.toString().padStart(4, "0");
      return `prod_${paddedId}`;
    },
    getLastId: function() {
      return lastId;
    },
    reset: function() {
      lastId = 0;
      localStorage.removeItem("lastProductId");
    }
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
    carbs = 0
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
      carbs: Number(carbs) || 0
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
function getAllProducts() {
  return [...products];
}
function getAllCategories() {
  return [...CATEGORY];
}
function deleteProduct(id) {
  console.log(id);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}
const LS_KEY = "meal-manager-save";
function saveToLocalStorage(state2) {
  const data = {
    products: state2.products ?? []
  };
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}
function loadFromLocalStorage() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return { products: [] };
  try {
    const parsed = JSON.parse(raw);
    return {
      products: Array.isArray(parsed.products) ? parsed.products : []
    };
  } catch {
    return { products: [] };
  }
}
function buildUI(root) {
  const saved = loadFromLocalStorage();
  const seed = saved.products?.length ? saved.products : FALLBACK_PRODUCTS;
  initProducts(seed);
  state.products = getAllProducts();
  const app = el("div", { id: "app" });
  const startScreen = el("main", { className: "main" });
  const tableContainer = el("div", { className: "table-container" });
  const categories = getAllCategories();
  function renderTable() {
    const list = getAllProducts();
    tableContainer.textContent = "";
    if (!list.length) {
      tableContainer.append(
        el("p", { className: "empty", text: "Добавьте продукт, чтобы начать" })
      );
      return;
    }
    const table = el("table", {
      className: "table",
      attrs: { role: "table" }
    });
    const tableHead = el("thead", { className: "thead" });
    const tableBody = el("tbody", { className: "tbody", id: "tbody" });
    categories.forEach(function(p) {
      const th = el("th", {
        className: "thead",
        text: p
      });
      tableHead.append(th);
    });
    const saved2 = loadFromLocalStorage();
    console.log("LS: ", saved2.products);
    list.forEach((p) => {
      const tr = el("tr", { className: "tr", id: p.id });
      categories.forEach((key) => {
        if (key === "macros") {
          const { calories, proteins, fats, carbs } = p.macros;
          const td2 = el("td", {
            className: "tr",
            text: `ккал: ${calories}, бжу: ${proteins}/${fats}/${carbs}`
          });
          tr.append(td2);
          return;
        }
        const td = el("td", { className: "tr", text: p[key] ?? "" });
        tr.append(td);
      });
      const delButton = el("button", {
        text: "Удалить",
        attrs: { type: "button" }
      });
      delButton.addEventListener("click", () => {
        deleteProduct(p.id);
        state.products = getAllProducts();
        saveToLocalStorage(state);
        renderTable();
      });
      tr.append(delButton);
      tableBody.append(tr);
    });
    table.appendChild(tableHead);
    table.appendChild(tableBody);
    tableContainer.appendChild(table);
  }
  const formContainer = el("div", {
    className: "form-container"
  });
  const form = el("form", {
    className: "form"
  });
  let lastProduct = loadFromLocalStorage().products.at(-1) || FALLBACK_PRODUCTS.at(-1);
  console.log("Last: ", lastProduct);
  const inputTitle = el("input", {
    attrs: {
      type: "text",
      placeholder: "Введите продукт",
      value: `${lastProduct.title}`,
      name: "title",
      required: "required"
    }
  });
  const inputAmount = el("input", {
    attrs: {
      type: "number",
      value: `${lastProduct.amount}`,
      placeholder: "Введите количество",
      name: "amount",
      required: "required",
      min: "0"
    }
  });
  const inputMeasure = el("select", {
    attrs: {
      placeholder: "Выберите меру",
      name: "measure",
      required: "required"
    }
  });
  MEASURES.forEach(
    (m) => inputMeasure.append(
      el("option", {
        text: m,
        attrs: { value: m }
      })
    )
  );
  const inputBrand = el("input", {
    attrs: {
      type: "text",
      value: `${lastProduct.brand}`,
      placeholder: "Введите производителя",
      name: "brand"
    }
  });
  const inputPrice = el("input", {
    attrs: {
      type: "number",
      placeholder: "Введите цену",
      value: `${lastProduct.price}`,
      name: "price",
      required: "required",
      min: "0"
    }
  });
  const inputShop = el("select", {
    attrs: {
      placeholder: "Выберите магазин",
      name: "shop"
    }
  });
  SHOPS.forEach(
    (s) => inputShop.append(
      el("option", {
        text: s,
        attrs: { value: s }
      })
    )
  );
  const macrosContainer = el("div", { className: "macros" });
  const inputCalories = el("input", {
    attrs: {
      type: "number",
      placeholder: "Калории",
      value: `${lastProduct.calories}`,
      name: "calories",
      min: "0"
    }
  });
  const inputProtein = el("input", {
    attrs: {
      type: "number",
      placeholder: "Белки",
      value: `${lastProduct.proteins}`,
      name: "proteins",
      min: "0"
    }
  });
  const inputFats = el("input", {
    attrs: {
      type: "number",
      placeholder: "Жиры",
      value: `${lastProduct.fats}`,
      name: "fats",
      min: "0"
    }
  });
  const inputCarbs = el("input", {
    attrs: {
      type: "number",
      placeholder: "Углеводы",
      value: `${lastProduct.carbs}`,
      name: "carbs",
      min: "0"
    }
  });
  macrosContainer.append(inputCalories, inputProtein, inputFats, inputCarbs);
  form.append(
    inputTitle,
    inputAmount,
    inputMeasure,
    inputBrand,
    inputPrice,
    inputShop,
    macrosContainer
  );
  const submitForm = el("input", {
    attrs: {
      type: "submit",
      value: "Добавить"
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    console.log("Данные формы:", data);
    const payload = {
      title: data.title,
      amount: Number(data.amount) || 0,
      measure: data.measure,
      brand: data.brand,
      price: Number(data.price) || 0,
      shop: data.shop,
      calories: Number(data.calories) || 0,
      proteins: Number(data.proteins) || 0,
      fats: Number(data.fats) || 0,
      carbs: Number(data.carbs) || 0
    };
    lastProduct = loadFromLocalStorage().products.at(-1);
    addProduct(payload);
    state.products = getAllProducts();
    saveToLocalStorage(state);
    form.reset();
    renderTable();
  });
  form.append(submitForm);
  formContainer.append(form);
  renderTable();
  startScreen.append(tableContainer, formContainer);
  app.append(startScreen);
  root.appendChild(app);
}
document.addEventListener("DOMContentLoaded", () => {
  buildUI(document.body);
});
