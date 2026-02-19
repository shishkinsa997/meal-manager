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
  const startScreen = el("main", {
    className:
      "main flex flex-col items-center justify-center w-screen min-h-screen bg-gray-900 p-10 text-md text-gray-400 font-medium",
  });
  const tableFlex = el("div", {
    className: "flex flex-col my-6 max-w-full",
  });
  const tableContainer = el("div", {
    className: "table-container shadow overflow-hidden sm:rounded-lg",
  });
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
      attrs: { role: "table min-w-full text-sm text-gray-400" },
    });
    const tableHead = el("thead", {
      className: "thead bg-gray-800 text-xs uppercase font-medium",
    });
    const tableBody = el("tbody", {
      className: "tbody bg-gray-800",
      id: "tbody",
    });

    categories.forEach(function (p) {
      const th = el("th", {
        className: "px-6 py-3 text-left tracking-wider",
        text: p,
      });
      tableHead.append(th);
    });
    const thEmpty = el("th", {
      className: "px-6 py-3 text-left tracking-wider",
      text: "",
    });
    tableHead.append(thEmpty);

    const saved = loadFromLocalStorage();
    console.log("LS: ", saved.products);

    list.forEach((p) => {
      const tr = el("tr", { className: "tr bg-black/20", id: p.id });

      categories.forEach((key) => {
        if (key === "macros") {
          const { calories, proteins, fats, carbs } = p.macros;
          const td = el("td", {
            className: "td px-6 py-4 whitespace-nowrap",
            text: `ккал: ${calories}, бжу: ${proteins}/${fats}/${carbs}`,
          });
          tr.append(td);
          return;
        }
        const td = el("td", {
          className: "td px-6 py-4 whitespace-nowrap",
          text: p[key] ?? "",
        });
        tr.append(td);
      });

      const delButton = el("button", {
        className: "px-6 py-3 text-left tracking-wider cursor-pointer",
        attrs: { type: "button" },
        html: `<svg class="w-4 fill-current text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
									</svg>`,
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
    className: "form-container flex flex-col my-6",
  });
  const form = el("form", {
    className:
      "form flex flex-col gap-4 p-8 max-w-lg shadow sm:rounded-lg align-middle min-w-full text-sm text-gray-400 bg-gray-800 uppercase font-medium",
  });
  let lastProduct =
    loadFromLocalStorage().products.at(-1) || FALLBACK_PRODUCTS.at(-1);
  console.log("Last: ", lastProduct);
  const labelTitle = el("label", {
    text: "Title",
    attrs: {
      for: "required",
    },
  });
  const inputTitle = el("input", {
    className: 'shadow appearance-none border rounded w-full py-2 px-3 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
    attrs: {
      type: "text",
      placeholder: "Введите продукт",
      value: `${lastProduct.title}`,
      name: "title",
      required: "required",
    },
  });
  const labelAmount = el("label", {
    text: "Amount",
    attrs: {
      for: "required",
    },
  });
  const inputAmount = el("input", {
    className: 'shadow appearance-none border rounded w-full py-2 px-3 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
    attrs: {
      type: "number",
      value: `${lastProduct.amount}`,
      placeholder: "Введите количество",
      name: "amount",
      required: "required",
      min: "0",
    },
  });
  const labelMeasure = el("label", {
    text: "Measure",
    attrs: {
      for: "required",
    },
  });
  const inputMeasure = el("select", {
    className: 'shadow appearance-none border rounded w-full py-2 px-3 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
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
  const labelBrand = el("label", {
    text: "Brand",
    attrs: {
      for: "required",
    },
  });
  const inputBrand = el("input", {
    className: 'shadow appearance-none border rounded w-full py-2 px-3 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
    attrs: {
      type: "text",
      value: `${lastProduct.brand}`,
      placeholder: "Введите производителя",
      name: "brand",
    },
  });
  const labelPrice = el("label", {
    text: "Price",
    attrs: {
      for: "required",
    },
  });
  const inputPrice = el("input", {
    className: 'shadow appearance-none border rounded w-full py-2 px-3 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
    attrs: {
      type: "number",
      placeholder: "Введите цену",
      value: `${lastProduct.price}`,
      name: "price",
      required: "required",
      min: "0",
    },
  });
  const labelShop = el("label", {
    text: "Shop",
    attrs: {
      for: "required",
    },
  });
  const inputShop = el("select", {
    className: 'shadow appearance-none border rounded w-full py-2 px-3 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
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
  const labelMacros = el("label", {
    text: "Macros",
    attrs: {
      for: "required",
    },
  });
  const macrosContainer = el("div", { className: "macros flex flex-wrap gap-4" });
  const inputCalories = el("input", {
    className: 'shadow appearance-none border rounded py-2 px-3 flex-1 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
    attrs: {
      type: "number",
      placeholder: "Калории",
      value: `${lastProduct.calories}`,
      name: "calories",
      min: "0",
    },
  });
  const inputProtein = el("input", {
    className: 'shadow appearance-none border rounded py-2 px-3 flex-1 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
    attrs: {
      type: "number",
      placeholder: "Белки",
      value: `${lastProduct.proteins}`,
      name: "proteins",
      min: "0",
    },
  });
  const inputFats = el("input", {
    className: 'shadow appearance-none border rounded py-2 px-3 flex-1 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
    attrs: {
      type: "number",
      placeholder: "Жиры",
      value: `${lastProduct.fats}`,
      name: "fats",
      min: "0",
    },
  });
  const inputCarbs = el("input", {
    className: 'shadow appearance-none border rounded py-2 px-3 flex-1 bg-white/80 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
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
    macrosContainer,
  );

  const submitForm = el("input", {
    className:
      "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer",
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
  (tableFlex.append(tableContainer),
    startScreen.append(tableFlex, formContainer));
  app.append(startScreen);
  root.appendChild(app);
}
