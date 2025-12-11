import { el } from "./utils.js";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getAllProducts,
  getAllCategories,
  products,
  productIdGenerator,
  Product,
} from "./stock.js";
import { SHOPS, MEASURES } from "./const.js";

export function buildUI(root) {
  const app = el("div", { id: "app" });
  // start screen
  const startScreen = el("main", {
    className: "main",
  });
  const tableContainer = el("div", {
    className: "table-container",
  });
  const categories = getAllCategories();

  function renderTable() {
    tableContainer.textContent = "";
    const table = el("table", {
      className: "table",
      attrs: {
        role: "table",
      },
    });
    const tableHead = el("thead", {
      className: "thead",
    });
    const tableBody = el("tbody", {
      className: "tbody",
      id: "tbody",
    });

    categories.forEach(function (p) {
      const th = el("th", {
        className: "thead",
        text: p,
      });
      tableHead.append(th);
    });
    products.forEach(function (p) {
      const idP = p.id;
      const tr = el("tr", {
        className: "tr",
        id: idP,
      });

      for (const key in p) {
        // if (key === "id") {
        //   const id = key;
        //   this.id = id;
        // }
        if (key === "macros") {
          const macros = Object.values(p[key]);
          const td = el("td", {
            className: "tr",
            text: `ккал: ${macros[0]}, бжу: ${macros[1]}/${macros[2]}/${macros[3]}`,
          });
          tr.append(td);
        } else {
          const td = el("td", {
            className: "tr",
            text: p[key],
          });
          tr.append(td);
        }
      }
      const delButton = el("button", {
        text: "del",
        attrs: {
          type: "button",
          idp: idP,
        },
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
    // for (let i = 0; i < products.length; i++) {
    //   const val = products[i] ?? null;

    //   const btn = el("button", {
    //     className: "cell",
    //     attrs: {
    //       "data-index": String(i),
    //       role: "gridcell",
    //       "aria-selected": state.selectedIndices.includes(i) ? "true" : "false",
    //       "aria-label": val != null ? `Cell ${val}` : "Empty cell",
    //     },
    //     text: val != null ? String(val) : "",
    //   });

    //   if (val == null) btn.setAttribute("disabled", "");
    //   if (state.selectedIndices.includes(i))
    //     btn.classList.add("cell--selected");
    //   btn.addEventListener("click", () => onCellClick(i));
    //   table.appendChild(btn);
    // }
    table.appendChild(tableHead);
    table.appendChild(tableBody);
    tableContainer.appendChild(table);
  }

  // function updateHud() {
  //   currentScore.textContent = `Score: ${state.score} of 100`;
  //   // hints
  //   const available = countValidMoves(state);
  //   hintsCounterText.textContent = available >= 6 ? "5+" : String(available);
  //   modeTitle.textContent =
  //     state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
  //   const addLeft = Math.max(0, 10 - state.assists.addNumbersUsed);
  //   const shLeft = Math.max(0, 5 - state.assists.shuffleUsed);
  //   const erLeft = Math.max(0, 5 - state.assists.eraserUsed);
  //   addNumbersCounterText.textContent = String(addLeft);
  //   shuffleCounterText.textContent = String(shLeft);
  //   eraserCounterText.textContent = String(erLeft);
  //   if (addLeft === 0) addNumbersBtn.setAttribute("disabled", "");
  //   else addNumbersBtn.removeAttribute("disabled");
  //   if (shLeft === 0) shuffleBtn.setAttribute("disabled", "");
  //   else shuffleBtn.removeAttribute("disabled");
  //   if (erLeft === 0) eraserBtn.setAttribute("disabled", "");
  //   else eraserBtn.removeAttribute("disabled");
  //   if (state.lastMove && state.lastMove.type === "pair") {
  //     revertBtn.removeAttribute("disabled");
  //   } else {
  //     revertBtn.setAttribute("disabled", "");
  //   }
  // }
  const formContainer = el("div", {
    className: "form-container",
  });
  const form = el("form", {
    className: "form",
  });
  const inputTitle = el("input", {
    attrs: {
      type: "text",
      placeholder: `Введите продукт`,
      value: `Чебупели`,
      name: "title",
      required: "required",
    },
  });
  const inputAmount = el("input", {
    attrs: {
      type: "number",
      placeholder: `Введите amount`,
      value: 600,
      name: "amount",
      required: "required",
    },
  });
  const inputMeasure = el("select", {
    attrs: {
      placeholder: `Выберите магазин`,
      value: `Выберите меру`,
      name: "measure",
      // required: 'required',
    },
  });
  MEASURES.forEach((m) => {
    const option = el("option", {
      text: m,
      attrs: {
        type: "select",
        placeholder: `Выберите меру`,
        value: `${m}`,
        name: m,
      },
    });
    inputMeasure.append(option);
  });
  const inputBrand = el("input", {
    attrs: {
      type: "text",
      placeholder: `Введите производителя`,
      value: `Горячая Штучка`,
      name: "brand",
    },
  });
  const inputPrice = el("input", {
    attrs: {
      type: "number",
      placeholder: `Введите price`,
      value: 150,
      name: "price",
      required: "required",
    },
  });
  const inputShop = el("select", {
    attrs: {
      placeholder: `Выберите магазин`,
      value: `Выберите магазин`,
      name: "shop",
    },
  });
  SHOPS.forEach((s) => {
    const option = el("option", {
      text: s,
      attrs: {
        type: "select",
        placeholder: `Выберите магазин`,
        value: `${s}`,
        name: s,
      },
    });
    inputShop.append(option);
  });
  const macrosContainer = el("dev", {
    className: "macros",
  });
  const inputCalories = el("input", {
    attrs: {
      type: "number",
      placeholder: `Введите calories`,
      value: 250,
      name: "calories",
    },
  });
  const inputProtein = el("input", {
    attrs: {
      type: "number",
      placeholder: `Введите protein`,
      value: 2,
      name: "proteins",
    },
  });
  const inputFats = el("input", {
    attrs: {
      type: "number",
      placeholder: `Введите fats`,
      value: 300,
      name: "fats",
    },
  });
  const inputCarbs = el("input", {
    attrs: {
      type: "number",
      placeholder: `Введите carbs`,
      value: 4,
      name: "carbs",
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
  form.addEventListener("submit", function (event) {
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
      carbs: data.carbs,
    };

    addProduct(...Object.values(p));
    getAllProducts();
    renderTable();

    console.log(p);
    // for (const key in p) {
    //   // if (key === "id") {
    //   //   const id = key;
    //   //   this.id = id;
    //   // }
    //   if (key === "macros") {
    //     const macros = Object.values(p[key]) || '0/0/0';
    //     const td = el("td", {
    //       className: "tr",
    //       text: `ккал: ${macros[0]}, бжу: ${macros[1]}/${macros[2]}/${macros[3]}`,
    //     });
    //     tr.append(td);
    //   } else {
    //     const td = el("td", {
    //       className: "tr",
    //       text: p[key],
    //     });
    //     tr.append(td);
    //   }
    // }
    // const delButton = el("button", {
    //   text: "del",
    //   attrs: {
    //     type: "button",
    //     idp: idP,
    //   },
    // });
    // tr.append(delButton);
    // delButton.addEventListener("click", (idP) => {
    //   deleteProduct(idP);
    //   tr.remove();
    // });
    // const tableBody = document.getElementById("tbody");
    // tableBody.append(tr);
  });
  form.append(submitForm);
  formContainer.append(form);
  renderTable();
  // form.append(inputForm)
  startScreen.append(tableContainer, formContainer);
  app.append(startScreen);
  root.appendChild(app);
}
