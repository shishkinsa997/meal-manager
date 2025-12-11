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
function createProductIdGenerator() {
  let lastId = 0;
  return {
    generate: function() {
      lastId++;
      const paddedId = lastId.toString().padStart(4, "0");
      return `prod_${paddedId}`;
    },
    getLastId: function() {
      return lastId;
    },
    reset: function() {
      lastId = 0;
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
      calories,
      proteins,
      fats,
      carbs
    };
    this.rest = rest;
  }
}
const products = [];
function addProduct(...args) {
  const product = new Product(...args);
  products.push(product || 0);
  console.log(product.id);
  return product;
}
function getAllProducts() {
  return products;
}
function getAllCategories() {
  return Object.keys(new Product());
}
function deleteProduct(id) {
  console.log(id);
  console.log(typeof id);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}
addProduct("Молоко", 930, "ml", "Простоквашино", null, "Магнит", 100, 6, 3, 4);
addProduct("Сахар", 500, "g", null, 50, "Пятёрочка", 387, 0, 0, 99, 86);
console.log("ALL:", getAllProducts());
console.log("Categories:", getAllCategories());
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
function buildUI(root) {
  const app = el("div", { id: "app" });
  const startScreen = el("main", {
    className: "main"
  });
  const tableContainer = el("div", {
    className: "table-container"
  });
  const categories = getAllCategories();
  function renderTable() {
    tableContainer.textContent = "";
    const table = el("table", {
      className: "table",
      attrs: {
        role: "table"
      }
    });
    const tableHead = el("thead", {
      className: "thead"
    });
    const tableBody = el("tbody", {
      className: "tbody",
      id: "tbody"
    });
    categories.forEach(function(p) {
      const th = el("th", {
        className: "thead",
        text: p
      });
      tableHead.append(th);
    });
    products.forEach(function(p) {
      const idP = p.id;
      const tr = el("tr", {
        className: "tr",
        id: idP
      });
      for (const key in p) {
        if (key === "macros") {
          const macros = Object.values(p[key]);
          const td = el("td", {
            className: "tr",
            text: `ккал: ${macros[0]}, бжу: ${macros[1]}/${macros[2]}/${macros[3]}`
          });
          tr.append(td);
        } else {
          const td = el("td", {
            className: "tr",
            text: p[key]
          });
          tr.append(td);
        }
      }
      const delButton = el("button", {
        text: "del",
        attrs: {
          type: "button",
          idp: idP
        }
      });
      tr.append(delButton);
      delButton.addEventListener("click", () => {
        const id1 = p.id;
        deleteProduct(id1);
        console.log(id1);
        console.log(typeof id1);
        tr.remove();
      });
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
  const inputTitle = el("input", {
    attrs: {
      type: "text",
      placeholder: `Введите продукт`,
      value: `Чебупели`,
      name: "title",
      required: "required"
    }
  });
  const inputAmount = el("input", {
    attrs: {
      type: "number",
      placeholder: `Введите amount`,
      value: 600,
      name: "amount",
      required: "required"
    }
  });
  const inputMeasure = el("select", {
    attrs: {
      placeholder: `Выберите магазин`,
      value: `Выберите меру`,
      name: "measure"
      // required: 'required',
    }
  });
  MEASURES.forEach((m) => {
    const option = el("option", {
      text: m,
      attrs: {
        type: "select",
        placeholder: `Выберите меру`,
        value: `${m}`,
        name: m
      }
    });
    inputMeasure.append(option);
  });
  const inputBrand = el("input", {
    attrs: {
      type: "text",
      placeholder: `Введите производителя`,
      value: `Горячая Штучка`,
      name: "brand"
    }
  });
  const inputPrice = el("input", {
    attrs: {
      type: "number",
      placeholder: `Введите price`,
      value: 150,
      name: "price",
      required: "required"
    }
  });
  const inputShop = el("select", {
    attrs: {
      placeholder: `Выберите магазин`,
      value: `Выберите магазин`,
      name: "shop"
    }
  });
  SHOPS.forEach((s) => {
    const option = el("option", {
      text: s,
      attrs: {
        type: "select",
        placeholder: `Выберите магазин`,
        value: `${s}`,
        name: s
      }
    });
    inputShop.append(option);
  });
  const macrosContainer = el("dev", {
    className: "macros"
  });
  const inputCalories = el("input", {
    attrs: {
      type: "number",
      placeholder: `Введите calories`,
      value: 250,
      name: "calories"
    }
  });
  const inputProtein = el("input", {
    attrs: {
      type: "number",
      placeholder: `Введите protein`,
      value: 2,
      name: "proteins"
    }
  });
  const inputFats = el("input", {
    attrs: {
      type: "number",
      placeholder: `Введите fats`,
      value: 300,
      name: "fats"
    }
  });
  const inputCarbs = el("input", {
    attrs: {
      type: "number",
      placeholder: `Введите carbs`,
      value: 4,
      name: "carbs"
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
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    console.log("Данные формы:", data);
    const p = {
      title: data.title,
      amount: parseFloat(data.amount),
      measure: data.measure,
      brand: data.brand,
      price: parseFloat(data.price),
      shop: data.shop,
      calories: data.calories,
      proteins: data.proteins,
      fats: data.fats,
      carbs: data.carbs
    };
    addProduct(...Object.values(p));
    renderTable();
    console.log(p);
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
