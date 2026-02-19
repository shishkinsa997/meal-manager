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
  const startScreen = el("main", {
    className: "main flex flex-col items-center justify-center w-screen min-h-screen bg-gray-900 p-10 text-md text-gray-400 font-medium"
  });
  const tableFlex = el("div", {
    className: "flex flex-col my-6 max-w-full"
  });
  const tableContainer = el("div", {
    className: "table-container shadow overflow-hidden sm:rounded-lg"
  });
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
      attrs: { role: "table min-w-full text-sm text-gray-400" }
    });
    const tableHead = el("thead", {
      className: "thead bg-gray-800 text-xs uppercase font-medium"
    });
    const tableBody = el("tbody", {
      className: "tbody bg-gray-800",
      id: "tbody"
    });
    categories.forEach(function(p) {
      const th = el("th", {
        className: "px-6 py-3 text-left tracking-wider",
        text: p
      });
      tableHead.append(th);
    });
    const thEmpty = el("th", {
      className: "px-6 py-3 text-left tracking-wider",
      text: ""
    });
    tableHead.append(thEmpty);
    const saved2 = loadFromLocalStorage();
    console.log("LS: ", saved2.products);
    list.forEach((p) => {
      const tr = el("tr", { className: "tr bg-black/20", id: p.id });
      categories.forEach((key) => {
        if (key === "macros") {
          const { calories, proteins, fats, carbs } = p.macros;
          const td2 = el("td", {
            className: "td px-6 py-4 whitespace-nowrap",
            text: `ккал: ${calories}, бжу: ${proteins}/${fats}/${carbs}`
          });
          tr.append(td2);
          return;
        }
        const td = el("td", {
          className: "td px-6 py-4 whitespace-nowrap",
          text: p[key] ?? ""
        });
        tr.append(td);
      });
      const delButton = el("button", {
        className: "px-6 py-3 text-left tracking-wider cursor-pointer",
        attrs: { type: "button" },
        html: `<svg class="w-4 fill-current text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
									</svg>`
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
    className: "form-container flex flex-col my-6"
  });
  const form = el("form", {
    className: "form flex flex-col gap-4 p-8 max-w-lg shadow sm:rounded-lg align-middle min-w-full text-sm text-gray-400 bg-gray-800 uppercase font-medium"
  });
  let lastProduct = loadFromLocalStorage().products.at(-1) || FALLBACK_PRODUCTS.at(-1);
  console.log("Last: ", lastProduct);
  const labelTitle = el("label", {
    text: "Title",
    attrs: {
      for: "required"
    }
  });
  const inputTitle = el("input", {
    className: "shadow appearance-none border rounded w-full py-2 px-3 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
    attrs: {
      type: "text",
      placeholder: "Введите продукт",
      value: `${lastProduct.title}`,
      name: "title",
      required: "required"
    }
  });
  const labelAmount = el("label", {
    text: "Amount",
    attrs: {
      for: "required"
    }
  });
  const inputAmount = el("input", {
    className: "shadow appearance-none border rounded w-full py-2 px-3 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
    attrs: {
      type: "number",
      value: `${lastProduct.amount}`,
      placeholder: "Введите количество",
      name: "amount",
      required: "required",
      min: "0"
    }
  });
  const labelMeasure = el("label", {
    text: "Measure",
    attrs: {
      for: "required"
    }
  });
  const inputMeasure = el("select", {
    className: "shadow appearance-none border rounded w-full py-2 px-3 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
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
  const labelBrand = el("label", {
    text: "Brand",
    attrs: {
      for: "required"
    }
  });
  const inputBrand = el("input", {
    className: "shadow appearance-none border rounded w-full py-2 px-3 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
    attrs: {
      type: "text",
      value: `${lastProduct.brand}`,
      placeholder: "Введите производителя",
      name: "brand"
    }
  });
  const labelPrice = el("label", {
    text: "Price",
    attrs: {
      for: "required"
    }
  });
  const inputPrice = el("input", {
    className: "shadow appearance-none border rounded w-full py-2 px-3 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
    attrs: {
      type: "number",
      placeholder: "Введите цену",
      value: `${lastProduct.price}`,
      name: "price",
      required: "required",
      min: "0"
    }
  });
  const labelShop = el("label", {
    text: "Shop",
    attrs: {
      for: "required"
    }
  });
  const inputShop = el("select", {
    className: "shadow appearance-none border rounded w-full py-2 px-3 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
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
  const labelMacros = el("label", {
    text: "Macros",
    attrs: {
      for: "required"
    }
  });
  const macrosContainer = el("div", { className: "macros flex flex-wrap gap-4" });
  const inputCalories = el("input", {
    className: "shadow appearance-none border rounded py-2 px-3 flex-1 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
    attrs: {
      type: "number",
      placeholder: "Калории",
      value: `${lastProduct.calories}`,
      name: "calories",
      min: "0"
    }
  });
  const inputProtein = el("input", {
    className: "shadow appearance-none border rounded py-2 px-3 flex-1 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
    attrs: {
      type: "number",
      placeholder: "Белки",
      value: `${lastProduct.proteins}`,
      name: "proteins",
      min: "0"
    }
  });
  const inputFats = el("input", {
    className: "shadow appearance-none border rounded py-2 px-3 flex-1 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
    attrs: {
      type: "number",
      placeholder: "Жиры",
      value: `${lastProduct.fats}`,
      name: "fats",
      min: "0"
    }
  });
  const inputCarbs = el("input", {
    className: "shadow appearance-none border rounded py-2 px-3 flex-1 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
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
    labelTitle,
    inputTitle,
    labelAmount,
    inputAmount,
    labelMeasure,
    inputMeasure,
    labelBrand,
    inputBrand,
    labelPrice,
    inputPrice,
    labelShop,
    inputShop,
    labelMacros,
    macrosContainer
  );
  const submitForm = el("input", {
    className: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer",
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
  tableFlex.append(tableContainer), startScreen.append(tableFlex, formContainer);
  app.append(startScreen);
  root.appendChild(app);
}
document.addEventListener("DOMContentLoaded", () => {
  buildUI(document.body);
});
