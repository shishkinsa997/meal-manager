import { el } from "./utils.js";

export function buildUI(root) {
  const app = el("div", { id: "app" });

  // start screen
  const startScreen = el("main", {
    className: "main",
  });
  app.append(startScreen);
  root.appendChild(app);
}
