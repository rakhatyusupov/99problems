window.AppState = {
  params: {
    userText: "Hello/world",
    grainAmp: 0.1,
    useGrain: true,
    useGlitch: true,
    useNoise: false,
    useFresnel: false,
    usePlasma: false,
    useFeedback: false,
    useFlowing: false,
    showImage: true,
    imageCols: 1,
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
  // контейнер + overlay
  const overlayContainer = document.createElement("div");
  overlayContainer.id = "settingsOverlayContainer";

  const overlay = document.createElement("div");
  overlay.id = "settingsOverlay";

  // три колонки
  const col1 = document.createElement("div");
  const col2 = document.createElement("div");
  const col3 = document.createElement("div");
  col1.className = col2.className = col3.className = "overlayColumn";

  // вложение колонок
  overlay.append(col1, col2, col3);
  overlayContainer.appendChild(overlay);
  document.body.appendChild(overlayContainer);

  // заголовки
  col1.appendChild(
    Object.assign(document.createElement("h3"), { innerText: "Шейдеры" })
  );
  col2.appendChild(
    Object.assign(document.createElement("h3"), { innerText: "Текст и сетка" })
  );
  col3.appendChild(
    Object.assign(document.createElement("h3"), { innerText: "Управление" })
  );

  /* ----- COL1 : фильтры ----- */
  [
    { txt: "Grain filter", key: "useGrain" },
    { txt: "Glitch filter", key: "useGlitch" },
    { txt: "Noise filter", key: "useNoise" },
    { txt: "Fresnel", key: "useFresnel" },
    { txt: "Plasma", key: "usePlasma" },
    { txt: "Feedback", key: "useFeedback" },
    { txt: "Flowing", key: "useFlowing" },
  ].forEach(({ txt, key }) => {
    const lbl = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = window.AppState.params[key];
    cb.onchange = (e) => window.AppState.setParam(key, e.target.checked);
    lbl.append(cb, " ", txt);
    col1.appendChild(lbl);
  });

  // grain amp moved to col1
  {
    const lbl = document.createElement("label");
    lbl.innerText = "Grain amp:";
    const r = document.createElement("input");
    r.type = "range";
    r.min = 0;
    r.max = 1;
    r.step = 0.01;
    r.value = window.AppState.params.grainAmp;
    r.oninput = (e) => window.AppState.setParam("grainAmp", +e.target.value);
    lbl.appendChild(r);
    col1.appendChild(lbl);
  }

  /* ----- COL2 : текст, зерно, шрифты, сетка и изображения ----- */
  // текстовая область
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
  // font size
  {
    const lbl = document.createElement("label");
    lbl.innerText = "Font size:";
    const r = document.createElement("input");
    r.type = "range";
    r.min = 12;
    r.max = 200;
    r.step = 1;
    r.value = window.AppState.params.fontSize;
    r.oninput = (e) => window.AppState.setParam("fontSize", +e.target.value);
    lbl.appendChild(r);
    col2.appendChild(lbl);
  }
  // сетка: rows, cols, margin, gap
  const addNum = (txt, key, min, max) => {
    const lbl = document.createElement("label");
    lbl.innerText = txt;
    const n = document.createElement("input");
    n.type = "number";
    n.min = min;
    n.max = max;
    n.value = window.AppState.params[key];
    n.oninput = (e) => window.AppState.setParam(key, +e.target.value);
    lbl.appendChild(n);
    col2.appendChild(lbl);
  };
  addNum("Rows:", "rows", 1, 50);
  addNum("Cols:", "cols", 1, 50);
  addNum("Margin:", "margin", 0, 500);
  addNum("Gap:", "gap", 0, 200);
  // imageCols slider
  {
    const lbl = document.createElement("label");
    lbl.innerText = "Image width (cols):";
    const s = document.createElement("input");
    s.type = "range";
    s.min = 1;
    s.step = 1;
    const updateSlider = () => {
      s.max = window.AppState.params.cols;
      if (window.AppState.params.imageCols > s.max) {
        window.AppState.setParam("imageCols", +s.max);
      }
      s.value = window.AppState.params.imageCols;
    };
    s.oninput = (e) => window.AppState.setParam("imageCols", +e.target.value);
    updateSlider();
    lbl.appendChild(s);
    col2.appendChild(lbl);
  }
  // show image checkbox
  {
    const lbl = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = window.AppState.params.showImage;
    cb.onchange = (e) =>
      window.AppState.setParam("showImage", e.target.checked);
    lbl.append(cb, " Show image");
    col2.appendChild(lbl);
  }

  /* ----- COL3 : кнопки управления ----- */
  [
    { txt: "FPS 20", fn: () => window.setFPS(20) },
    { txt: "FPS 1", fn: () => window.setFPS(1) },
    { txt: "Pause/Resume", fn: () => window.toggleLoop() },
    { txt: "Reset grid pos", fn: () => window.resetAnchors() },
  ].forEach(({ txt, fn }) => {
    const btn = document.createElement("button");
    btn.innerText = txt;
    btn.onclick = fn;
    col3.appendChild(btn);
  });

  // кнопка-шестерёнка
  const gear = document.createElement("button");
  gear.id = "toggleButton";
  gear.innerText = "⚙️";
  gear.onclick = () => {
    overlayContainer.style.display =
      overlayContainer.style.display === "flex" ? "none" : "flex";
  };
  document.body.appendChild(gear);
});
