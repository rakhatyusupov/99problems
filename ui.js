window.AppState = {
  params: {
    userText: "Hello",
    grainAmp: 0.1,
    showImage: true,
    imageSize: 100,
    fontSize: 24,
    rows: 4,
    cols: 4,
    margin: 20,
    gap: 10,
  },
  setParam(k, v) {
    this.params[k] = v;
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.createElement("button");
  btn.id = "toggleButton";
  btn.innerText = "⚙️";
  document.body.appendChild(btn);

  const overlay = document.createElement("div");
  overlay.id = "settingsOverlay";
  const addInput = (labelTxt, key, type, attrs = {}) => {
    const label = document.createElement("label");
    label.innerText = labelTxt;
    const input = document.createElement("input");
    input.type = type;
    Object.assign(input, attrs);
    input.value = window.AppState.params[key];
    input.addEventListener("input", (e) =>
      window.AppState.setParam(
        key,
        type === "checkbox"
          ? e.target.checked
          : type === "number" || type === "range"
          ? +e.target.value
          : e.target.value
      )
    );
    label.appendChild(input);
    overlay.appendChild(label);
  };

  overlay.appendChild(
    Object.assign(document.createElement("h2"), { innerText: "Настройки" })
  );
  addInput("Text:", "userText", "text");
  addInput("Grain amp:", "grainAmp", "range", { min: 0, max: 1, step: 0.01 });
  addInput("Image size:", "imageSize", "number", { min: 10, max: 500 });
  addInput("Font size:", "fontSize", "range", { min: 12, max: 200 });
  addInput("Rows:", "rows", "number", { min: 1, max: 50 });
  addInput("Cols:", "cols", "number", { min: 1, max: 50 });
  addInput("Margin:", "margin", "number", { min: 0, max: 500 });
  addInput("Gap:", "gap", "number", { min: 0, max: 200 });
  addInput("Show image", "showImage", "checkbox");

  document.body.appendChild(overlay);
  btn.addEventListener("click", () => {
    overlay.style.display =
      overlay.style.display === "block" ? "none" : "block";
  });
});
