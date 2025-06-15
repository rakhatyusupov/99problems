// ui.js
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
    // shader control params:
    angel: 1.0,
    rate: 1.0,
    dlta: 1.0,
    // canvas size (existing)...
    canvasSize: {
      mode: "1:1",
      width: 800,
      height: 800,
    },
  },
  setParam(k, v) {
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
  updateCanvasSize() {
    const s = this.params.canvasSize;
    switch (s.mode) {
      case "1:1":
        s.width = 800;
        s.height = 800;
        break;
      case "2:3":
        s.width = 800;
        s.height = 1200;
        break;
      case "3:2":
        s.width = 1200;
        s.height = 800;
        break;
      case "full-width":
        s.width = window.innerWidth;
        s.height = window.innerHeight;
        break;
      // custom stays
    }
  },
};
window.AppState.updateCanvasSize();

document.addEventListener("DOMContentLoaded", () => {
  // style hack for custom classes
  const style = document.createElement("style");
  document.head.appendChild(style);

  // container + overlay
  const overlayContainer = document.createElement("div");
  overlayContainer.id = "settingsOverlayContainer";

  const overlay = document.createElement("div");
  overlay.id = "settingsOverlay";

  // three columns
  const col1 = document.createElement("div");
  const col2 = document.createElement("div");
  const col3 = document.createElement("div");
  col1.className = col2.className = col3.className = "overlayColumn";

  overlay.append(col1, col2, col3);
  overlayContainer.appendChild(overlay);
  document.body.appendChild(overlayContainer);

  // headings
  col1.appendChild(
    Object.assign(document.createElement("h3"), { innerText: "Шейдеры" })
  );
  col2.appendChild(
    Object.assign(document.createElement("h3"), { innerText: "Текст и сетка" })
  );
  col3.appendChild(
    Object.assign(document.createElement("h3"), { innerText: "Управление" })
  );

  /* ----- COL1 : shader toggles ----- */
  const shadersContainer = document.createElement("div");
  shadersContainer.className = "shaders-container";
  [
    { txt: "Grain", key: "useGrain" },
    { txt: "Glitch", key: "useGlitch" },
    { txt: "Noise", key: "useNoise" },
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
    shadersContainer.appendChild(lbl);
  });
  col1.appendChild(shadersContainer);

  /* ----- COL1 : shader param sliders ----- */
  const addShaderRange = (labelText, paramKey, min, max, step) => {
    const lbl = document.createElement("label");
    lbl.innerText = labelText;
    const r = document.createElement("input");
    r.type = "range";
    r.min = min;
    r.max = max;
    r.step = step;
    r.value = window.AppState.params[paramKey];
    r.oninput = (e) => window.AppState.setParam(paramKey, +e.target.value);
    lbl.appendChild(r);
    col1.appendChild(lbl);
  };
  addShaderRange("Angel:", "angel", 0, 1, 0.01);
  addShaderRange("Rate:", "rate", 0, 1, 0.01);
  addShaderRange("DLTA:", "dlta", 0, 1, 0.01);

  /* ----- COL1 : existing grain amp ----- */
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

  /* ----- COL2 : text, font, grid, image ----- */
  // Text
  {
    const lbl = document.createElement("label");
    lbl.innerText = "Text:";
    lbl.className = "fixed-textarea";
    const ta = document.createElement("textarea");
    ta.rows = 4;
    ta.value = window.AppState.params.userText;
    ta.oninput = (e) => window.AppState.setParam("userText", e.target.value);
    lbl.appendChild(ta);
    col2.appendChild(lbl);
  }
  // Font size
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
  // Grid controls
  const gridContainer = document.createElement("div");
  gridContainer.className = "grid-controls";
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
    gridContainer.appendChild(lbl);
  };
  addNum("Rows:", "rows", 1, 50);
  addNum("Cols:", "cols", 1, 50);
  addNum("Margin:", "margin", 0, 500);
  addNum("Gap:", "gap", 0, 200);
  col2.append(gridContainer);

  // Image width (cols)
  {
    const lbl = document.createElement("label");
    lbl.innerText = "Image width (cols):";
    const s = document.createElement("input");
    s.type = "range";
    s.min = 1;
    s.step = 1;
    const update = () => {
      s.max = window.AppState.params.cols;
      if (window.AppState.params.imageCols > s.max)
        window.AppState.setParam("imageCols", s.max);
      s.value = window.AppState.params.imageCols;
    };
    s.oninput = (e) => window.AppState.setParam("imageCols", +e.target.value);
    update();
    lbl.appendChild(s);
    col2.appendChild(lbl);
  }
  // Show image
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

  /* ----- COL3 : canvas settings + controls ----- */
  col3.appendChild(
    Object.assign(document.createElement("h4"), { innerText: "Canvas Size" })
  );
  // aspect selector, custom, apply...
  // existing canvas controls here...

  // control buttons
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

  // gear toggle
  const gear = document.createElement("button");
  gear.id = "toggleButton";
  gear.innerText = "⚙️";
  gear.onclick = () => {
    overlayContainer.style.display =
      overlayContainer.style.display === "flex" ? "none" : "flex";
  };
  document.body.appendChild(gear);
});
