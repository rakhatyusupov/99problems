window.AppState = {
  params: {
    userText: "Hello/world",
    grainAmp: 0.1,
    useGrain: true,
    useGlitch: true,
    useNoise: false,
    showImage: true,
    useFresnel: false,
    usePlasma: false,
    useFeedback: false,
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
  const overlay = Object.assign(document.createElement("div"), {
    id: "settingsOverlay",
  });
  overlay.style.display = "none";
  overlay.appendChild(
    Object.assign(document.createElement("h2"), { innerText: "Настройки" })
  );

  // три колонки-div
  const col1 = document.createElement("div"),
    col2 = document.createElement("div"),
    col3 = document.createElement("div");
  col1.className = col2.className = col3.className = "overlayColumn";
  overlay.append(col1, col2, col3);

  /* ----- COL1 : фильтры + кнопки ----- */
  [
    { txt: "Grain filter", key: "useGrain" },
    { txt: "Glitch filter", key: "useGlitch" },
    { txt: "Noise filter", key: "useNoise" },
    { txt: "Fresnel", key: "useFresnel" },
    { txt: "Plasma", key: "usePlasma" },
    { txt: "Feedback", key: "useFeedback" },
  ].forEach(({ txt, key }) => {
    const lbl = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = window.AppState.params[key];
    cb.onchange = (e) => window.AppState.setParam(key, e.target.checked);
    lbl.append(cb, " ", txt);
    col1.appendChild(lbl);
  });

  /* управление FPS / loop */
  [
    { t: "FPS 20", fn: () => window.setFPS(20) },
    { t: "FPS 1", fn: () => window.setFPS(1) },
    { t: "Pause/Resume", fn: () => window.toggleLoop() },
    { t: "Reset grid pos", fn: () => window.resetAnchors() },
  ].forEach(({ t, fn }) => {
    const b = document.createElement("button");
    b.innerText = t;
    b.onclick = fn;
    col1.appendChild(b);
  });

  /* ----- COL2 : текст и слайдеры ----- */
  const addRange = (txt, key, min, max, step) => {
    const lbl = document.createElement("label");
    lbl.innerText = txt;
    const r = Object.assign(document.createElement("input"), {
      type: "range",
      min,
      max,
      step,
      value: window.AppState.params[key],
    });
    r.oninput = (e) => window.AppState.setParam(key, +e.target.value);
    lbl.appendChild(r);
    col2.appendChild(lbl);
  };
  const lblT = document.createElement("label");
  lblT.innerText = "Text:";
  const ta = document.createElement("textarea");
  ta.rows = 4;
  ta.value = window.AppState.params.userText;
  ta.oninput = (e) => window.AppState.setParam("userText", e.target.value);
  lblT.appendChild(ta);
  col2.appendChild(lblT);
  addRange("Grain amp:", "grainAmp", 0, 1, 0.01);
  addRange("Font size:", "fontSize", 12, 200, 1);

  /* ----- COL3 : числа + image width ----- */
  const addNum = (txt, key, min, max) => {
    const lbl = document.createElement("label");
    lbl.innerText = txt;
    const n = document.createElement("input");
    n.type = "number";
    n.min = min;
    n.max = max;
    n.value = window.AppState.params[key];
    n.oninput = (e) => {
      window.AppState.setParam(key, +e.target.value);
      updateImgSlider();
    };
    lbl.appendChild(n);
    col3.appendChild(lbl);
  };
  addNum("Rows:", "rows", 1, 50);
  addNum("Cols:", "cols", 1, 50);
  addNum("Margin:", "margin", 0, 500);
  addNum("Gap:", "gap", 0, 200);

  // slider imageCols
  const lblImg = document.createElement("label");
  lblImg.innerText = "Image width (cols):";
  const s = document.createElement("input");
  s.type = "range";
  s.min = 1;
  s.step = 1;
  const updateImgSlider = () => {
    s.max = window.AppState.params.cols;
    if (window.AppState.params.imageCols > +s.max)
      window.AppState.setParam("imageCols", +s.max);
    s.value = window.AppState.params.imageCols;
  };
  s.oninput = (e) => window.AppState.setParam("imageCols", +e.target.value);
  updateImgSlider();
  lblImg.appendChild(s);
  col3.appendChild(lblImg);

  // show image
  const lblShow = document.createElement("label");
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = window.AppState.params.showImage;
  cb.onchange = (e) => window.AppState.setParam("showImage", e.target.checked);
  lblShow.append(cb, " Show image");
  col3.appendChild(lblShow);

  document.body.appendChild(overlay);

  const gear = document.createElement("button");
  gear.id = "toggleButton";
  gear.innerText = "⚙️";
  gear.onclick = () =>
    (overlay.style.display =
      overlay.style.display === "block" ? "none" : "block");
  document.body.appendChild(gear);
});
