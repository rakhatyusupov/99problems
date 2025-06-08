// ui.js
window.AppState = {
  params: {
    userText: "Hello\nworld",
    grainAmp: 0.1,
    useGrain: true,
    useGlitch: true,
    showImage: true,
    imageCols: 1, // ширина картинки в колонках сетки
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
  const overlay = document.createElement("div");
  overlay.id = "settingsOverlay";
  overlay.style.display = "none";
  overlay.appendChild(
    Object.assign(document.createElement("h2"), { innerText: "Настройки" })
  );

  // три колонки
  const col1 = document.createElement("div");
  col1.className = "overlayColumn";
  const col2 = document.createElement("div");
  col2.className = "overlayColumn";
  const col3 = document.createElement("div");
  col3.className = "overlayColumn";
  overlay.append(col1, col2, col3);

  // --------- COL1: фильтры и кнопки ---------
  // Grain filter
  {
    const lbl = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = window.AppState.params.useGrain;
    cb.onchange = (e) => window.AppState.setParam("useGrain", e.target.checked);
    lbl.append(cb, " Grain filter");
    col1.appendChild(lbl);
  }
  // Glitch filter
  {
    const lbl = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = window.AppState.params.useGlitch;
    cb.onchange = (e) =>
      window.AppState.setParam("useGlitch", e.target.checked);
    lbl.append(cb, " Glitch filter");
    col1.appendChild(lbl);
  }
  // кнопки управления
  [
    { txt: "FPS 20", fn: () => window.setFPS(20) },
    { txt: "FPS 1", fn: () => window.setFPS(1) },
    { txt: "Pause/Resume", fn: () => window.toggleLoop() },
    { txt: "Reset grid pos", fn: () => window.resetAnchors() },
  ].forEach(({ txt, fn }) => {
    const btn = document.createElement("button");
    btn.innerText = txt;
    btn.onclick = fn;
    col1.appendChild(btn);
  });

  // --------- COL2: текст и слайдеры ---------
  // textarea для текста
  {
    const lbl = document.createElement("label");
    lbl.innerText = "Text:";
    const ta = document.createElement("textarea");
    ta.rows = 4;
    ta.value = window.AppState.params.userText;
    ta.oninput = (e) => window.AppState.setParam("userText", e.target.value);
    lbl.appendChild(ta);
    col2.appendChild(lbl);
  }
  // Grain amplitude
  {
    const lbl = document.createElement("label");
    lbl.innerText = "Grain amp:";
    const input = document.createElement("input");
    input.type = "range";
    input.min = 0;
    input.max = 1;
    input.step = 0.01;
    input.value = window.AppState.params.grainAmp;
    input.oninput = (e) =>
      window.AppState.setParam("grainAmp", +e.target.value);
    lbl.appendChild(input);
    col2.appendChild(lbl);
  }
  // Font size
  {
    const lbl = document.createElement("label");
    lbl.innerText = "Font size:";
    const input = document.createElement("input");
    input.type = "range";
    input.min = 12;
    input.max = 200;
    input.step = 1;
    input.value = window.AppState.params.fontSize;
    input.oninput = (e) =>
      window.AppState.setParam("fontSize", +e.target.value);
    lbl.appendChild(input);
    col2.appendChild(lbl);
  }

  // --------- COL3: числовые настройки и imageCols ---------
  const addNum = (txt, key, min, max) => {
    const lbl = document.createElement("label");
    lbl.innerText = txt;
    const input = document.createElement("input");
    input.type = "number";
    input.min = min;
    input.max = max;
    input.value = window.AppState.params[key];
    input.oninput = (e) => {
      window.AppState.setParam(key, +e.target.value);
      updateImageColsMax();
    };
    lbl.appendChild(input);
    col3.appendChild(lbl);
  };
  addNum("Rows:", "rows", 1, 50);
  addNum("Cols:", "cols", 1, 50);
  addNum("Margin:", "margin", 0, 500);
  addNum("Gap:", "gap", 0, 200);

  // Image width in cols
  {
    const lbl = document.createElement("label");
    lbl.innerText = "Image width (cols):";
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 1;
    slider.step = 1;
    const updateImageColsMax = () => {
      const max = window.AppState.params.cols;
      slider.max = String(max);
      if (window.AppState.params.imageCols > max) {
        window.AppState.setParam("imageCols", max);
      }
      slider.value = window.AppState.params.imageCols;
    };
    slider.oninput = (e) =>
      window.AppState.setParam("imageCols", +e.target.value);
    updateImageColsMax();
    lbl.appendChild(slider);
    col3.appendChild(lbl);
  }
  // Show image checkbox
  {
    const lbl = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = window.AppState.params.showImage;
    cb.onchange = (e) =>
      window.AppState.setParam("showImage", e.target.checked);
    lbl.append(cb, " Show image");
    col3.appendChild(lbl);
  }

  document.body.appendChild(overlay);

  // gear button
  const gear = document.createElement("button");
  gear.id = "toggleButton";
  gear.innerText = "⚙️";
  gear.onclick = () =>
    (overlay.style.display =
      overlay.style.display === "block" ? "none" : "block");
  document.body.appendChild(gear);
});
