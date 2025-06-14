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
    // Объект для управления размерами холста
    canvasSize: {
      mode: "1:1", // '1:1', '2:3', '3:2', 'full-width', 'custom'
      width: 800,
      height: 800,
    },
  },
  setParam(k, v) {
    // Специальная обработка для размеров холста
    if (k === "canvasSizeMode") {
      this.params.canvasSize.mode = v;
      this.updateCanvasSize();
    } else if (k === "canvasWidth") {
      this.params.canvasSize.width = v;
      this.params.canvasSize.mode = "custom";
    } else if (k === "canvasHeight") {
      this.params.canvasSize.height = v;
      this.params.canvasSize.mode = "custom";
    } else {
      this.params[k] = v;
    }
  },

  // Метод для обновления размеров холста в зависимости от режима
  updateCanvasSize() {
    const size = this.params.canvasSize;

    switch (size.mode) {
      case "1:1":
        size.width = 800;
        size.height = 800;
        break;
      case "2:3":
        size.width = 800;
        size.height = 1200;
        break;
      case "3:2":
        size.width = 1200;
        size.height = 800;
        break;
      case "full-width":
        size.width = window.innerWidth;
        size.height = window.innerHeight;
        break;
      // Для custom размеры остаются как есть
    }
  },
};

// Инициализация размеров холста
window.AppState.updateCanvasSize();

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

  /* ----- COL3 : кнопки управления и настройки ----- */
  // Заголовок для настроек холста
  col3.appendChild(
    Object.assign(document.createElement("h4"), { innerText: "Размер холста" })
  );

  // Выпадающий список для выбора соотношения
  const aspectSelect = document.createElement("select");
  aspectSelect.style.width = "100%";
  aspectSelect.style.marginBottom = "12px";

  const aspectOptions = [
    { value: "1:1", text: "1:1 (800×800)" },
    { value: "2:3", text: "2:3 (800×1200)" },
    { value: "3:2", text: "3:2 (1200×800)" },
    { value: "full-width", text: "Во всю ширину" },
    { value: "custom", text: "Кастомный размер" },
  ];

  aspectOptions.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.text = opt.text;
    option.selected = window.AppState.params.canvasSize.mode === opt.value;
    aspectSelect.appendChild(option);
  });

  aspectSelect.onchange = (e) => {
    window.AppState.setParam("canvasSizeMode", e.target.value);
    customSizeGroup.style.display =
      e.target.value === "custom" ? "flex" : "none";
  };

  col3.appendChild(aspectSelect);

  // Контейнер для кастомных размеров
  const customSizeGroup = document.createElement("div");
  customSizeGroup.style.display =
    window.AppState.params.canvasSize.mode === "custom" ? "flex" : "none";
  customSizeGroup.style.flexDirection = "column";
  customSizeGroup.style.gap = "8px";

  // Поле для ширины
  {
    const lbl = document.createElement("label");
    lbl.innerText = "Ширина:";
    const input = document.createElement("input");
    input.type = "number";
    input.min = 100;
    input.max = 5000;
    input.value = window.AppState.params.canvasSize.width;
    input.oninput = (e) =>
      window.AppState.setParam("canvasWidth", +e.target.value);
    lbl.appendChild(input);
    customSizeGroup.appendChild(lbl);
  }

  // Поле для высоты
  {
    const lbl = document.createElement("label");
    lbl.innerText = "Высота:";
    const input = document.createElement("input");
    input.type = "number";
    input.min = 100;
    input.max = 5000;
    input.value = window.AppState.params.canvasSize.height;
    input.oninput = (e) =>
      window.AppState.setParam("canvasHeight", +e.target.value);
    lbl.appendChild(input);
    customSizeGroup.appendChild(lbl);
  }

  col3.appendChild(customSizeGroup);

  // Кнопка применения размеров
  const applySizeBtn = document.createElement("button");
  applySizeBtn.textContent = "Применить размер";
  applySizeBtn.style.marginTop = "10px";
  applySizeBtn.onclick = () => {
    localStorage.setItem(
      "canvasSettings",
      JSON.stringify(window.AppState.params.canvasSize)
    );
    location.reload();
  };
  col3.appendChild(applySizeBtn);

  // Разделитель
  const separator = document.createElement("hr");
  separator.style.margin = "20px 0";
  col3.appendChild(separator);

  // Кнопки управления
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
