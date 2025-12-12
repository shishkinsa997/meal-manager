const LS_KEY = "meal-manager-save";
const LS_SETTINGS = "meal-manager-settings";

function saveToLocalStorage(state) {
  const data = {
    products: state.products ?? [],
  };
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function loadFromLocalStorage() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return { products: [] };
  try {
    const parsed = JSON.parse(raw);
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
    };
  } catch {
    return { products: [] };
  }
}

function saveSettings(settings) {
  localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
}
function loadSettings() {
  const raw = localStorage.getItem(LS_SETTINGS);
  if (!raw) return { theme: "dark" };
  try {
    return JSON.parse(raw);
  } catch {
    return { theme: "dark" };
  }
}

export {
  saveToLocalStorage,
  loadFromLocalStorage,
  saveSettings,
  loadSettings,
};
