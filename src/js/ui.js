import { el } from "./utils.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getAllCategories,
  initProducts,
} from "./stock.js";
import { state, SHOPS, MEASURES, FALLBACK_PRODUCTS } from "./const.js";
import { saveToLocalStorage, loadFromLocalStorage } from "./store.js";

export function buildUI(root) {
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
        el("p", { className: "empty", text: "Добавьте продукт, чтобы начать" }),
      );
      return;
    }

    const table = el("table", {
      className: "table",
      attrs: { role: "table" },
    });
    const tableHead = el("thead", { className: "thead" });
    const tableBody = el("tbody", { className: "tbody", id: "tbody" });

    categories.forEach(function (p) {
      const th = el("th", {
        className: "thead",
        text: p,
      });
      tableHead.append(th);
    });
    const saved = loadFromLocalStorage();
    console.log("LS: ", saved.products);

    list.forEach((p) => {
      const tr = el("tr", { className: "tr", id: p.id });

      categories.forEach((key) => {
        if (key === "macros") {
          const { calories, proteins, fats, carbs } = p.macros;
          const td = el("td", {
            className: "tr",
            text: `ккал: ${calories}, бжу: ${proteins}/${fats}/${carbs}`,
          });
          tr.append(td);
          return;
        }
        const td = el("td", { className: "tr", text: p[key] ?? "" });
        tr.append(td);
      });

      const delButton = el("button", {
        text: "Удалить",
        attrs: { type: "button" },
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
    className: "form-container",
  });
  const form = el("form", {
    className: "form",
  });
  let lastProduct =
    loadFromLocalStorage().products.at(-1) || FALLBACK_PRODUCTS.at(-1);
  console.log("Last: ", lastProduct);
  const inputTitle = el("input", {
    attrs: {
      type: "text",
      placeholder: "Введите продукт",
      value: `${lastProduct.title}`,
      name: "title",
      required: "required",
    },
  });
  const inputAmount = el("input", {
    attrs: {
      type: "number",
      value: `${lastProduct.amount}`,
      placeholder: "Введите количество",
      name: "amount",
      required: "required",
      min: "0",
    },
  });
  const inputMeasure = el("select", {
    attrs: {
      placeholder: "Выберите меру",
      name: "measure",
      required: "required",
    },
  });
  MEASURES.forEach((m) =>
    inputMeasure.append(
      el("option", {
        text: m,
        attrs: { value: m },
        name: m,
      }),
    ),
  );

  const inputBrand = el("input", {
    attrs: {
      type: "text",
      value: `${lastProduct.brand}`,
      placeholder: "Введите производителя",
      name: "brand",
    },
  });
  const inputPrice = el("input", {
    attrs: {
      type: "number",
      placeholder: "Введите цену",
      value: `${lastProduct.price}`,
      name: "price",
      required: "required",
      min: "0",
    },
  });
  const inputShop = el("select", {
    attrs: {
      placeholder: "Выберите магазин",
      name: "shop",
    },
  });
  SHOPS.forEach((s) =>
    inputShop.append(
      el("option", {
        text: s,
        attrs: { value: s },
      }),
    ),
  );

  const macrosContainer = el("div", { className: "macros" });
  const inputCalories = el("input", {
    attrs: {
      type: "number",
      placeholder: "Калории",
      value: `${lastProduct.calories}`,
      name: "calories",
      min: "0",
    },
  });
  const inputProtein = el("input", {
    attrs: {
      type: "number",
      placeholder: "Белки",
      value: `${lastProduct.proteins}`,
      name: "proteins",
      min: "0",
    },
  });
  const inputFats = el("input", {
    attrs: {
      type: "number",
      placeholder: "Жиры",
      value: `${lastProduct.fats}`,
      name: "fats",
      min: "0",
    },
  });
  const inputCarbs = el("input", {
    attrs: {
      type: "number",
      placeholder: "Углеводы",
      value: `${lastProduct.carbs}`,
      name: "carbs",
      min: "0",
    },
  });
  macrosContainer.append(inputCalories, inputProtein, inputFats, inputCarbs);

  form.append(
    inputTitle,
    inputAmount,
    inputMeasure,
    inputBrand,
    inputPrice,
    inputShop,
    macrosContainer,
  );

  const submitForm = el("input", {
    attrs: {
      type: "submit",
      value: "Добавить",
    },
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
      carbs: Number(data.carbs) || 0,
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
