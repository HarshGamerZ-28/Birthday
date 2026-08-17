import React from "react";
import ReactDOM from "react-dom/client";
import App from "./BirthdayApp.jsx";

window.storage = {
  get: async (k) => {
    const v = localStorage.getItem(k);
    if (v === null) throw new Error("not found");
    return { key: k, value: v };
  },
  set: async (k, v) => { localStorage.setItem(k, v); return { key: k, value: v }; },
  delete: async (k) => { localStorage.removeItem(k); return { key: k, deleted: true }; },
  list: async () => ({ keys: Object.keys(localStorage) }),
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);