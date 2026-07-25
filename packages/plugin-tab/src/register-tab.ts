import { register } from "./tab.js";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    register();
  });
} else {
  register();
}
