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
    useFlowing: false,
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
  // Создаем контейнер для overlay
  const overlayContainer = Object.assign(document.createElement("div"), {
    id: "settingsOverlayContainer",
  });

  // Создаем сам overlay
  const overlay = Object.assign(document.createElement("div"), {
    id: "settingsOverlay",
  });

  // Добавляем заголовок

  // Создаем три колонки
  const col1 = document.createElement("div"),
    col2 = document.createElement("div"),
    col3 = document.createElement("div");

  col1.className = col2.className = col3.className = "overlayColumn";
  overlay.append(col1, col2, col3);

  // Добавляем заголовки для второй и третьей колонки

  col1.appendChild(
    Object.assign(document.createElement("h3"), { innerText: "Заголовок 1" })
  );
  col2.appendChild(
    Object.assign(document.createElement("h3"), { innerText: "Заголовок 2" })
  );
  col3.appendChild(
    Object.assign(document.createElement("h3"), { innerText: "Заголовок 3" })
  );

  /* ----- COL1 : фильтры + кнопки ----- */
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

  /* ----- COL1 : текст и слайдеры ----- */
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
    col1.appendChild(lbl);
  };

  const lblT = document.createElement("label");
  lblT.innerText = "Text:";
  const ta = document.createElement("textarea");
  ta.rows = 4;
  ta.value = window.AppState.params.userText;
  ta.oninput = (e) => window.AppState.setParam("userText", e.target.value);
  lblT.appendChild(ta);
  col1.appendChild(lblT);

  addRange("Grain amp:", "grainAmp", 0, 1, 0.01);
  addRange("Font size:", "fontSize", 12, 200, 1);

  /* ----- COL1 : числа + image width ----- */
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
    col1.appendChild(lbl);
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
    if (window.AppState.params.imageCols > +s.max) {
      window.AppState.setParam("imageCols", +s.max);
    }
    s.value = window.AppState.params.imageCols;
  };

  s.oninput = (e) => window.AppState.setParam("imageCols", +e.target.value);
  updateImgSlider();
  lblImg.appendChild(s);
  col1.appendChild(lblImg);

  // show image
  const lblShow = document.createElement("label");
  const cbShow = document.createElement("input");
  cbShow.type = "checkbox";
  cbShow.checked = window.AppState.params.showImage;
  cbShow.onchange = (e) =>
    window.AppState.setParam("showImage", e.target.checked);
  lblShow.append(cbShow, " Show image");
  col1.appendChild(lblShow);

  // Добавляем overlay в контейнер и контейнер в body
  overlayContainer.appendChild(overlay);
  document.body.appendChild(overlayContainer);

  // Кнопка переключения overlay
  const gear = document.createElement("button");
  gear.id = "toggleButton";
  gear.innerText = "⚙️";
  gear.onclick = () => {
    overlayContainer.style.display =
      overlayContainer.style.display === "flex" ? "none" : "flex";
  };
  document.body.appendChild(gear);
});
