// ui.js
window.AppState = {
  params: {
    userText: "Hello\nworld",
    grainAmp: 0.1,
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

  /* helpers */
  const addNum = (txt, key, min, max) => {
    const l = document.createElement("label");
    l.innerText = txt;
    const i = Object.assign(document.createElement("input"), {
      type: "number",
      min,
      max,
      value: window.AppState.params[key],
    });
    i.oninput = (e) => {
      window.AppState.setParam(key, +e.target.value);
      updateImageSliderMax();
    };
    l.appendChild(i);
    overlay.appendChild(l);
  };
  const addRange = (txt, key, min, max, step) => {
    const l = document.createElement("label");
    l.innerText = txt;
    const i = Object.assign(document.createElement("input"), {
      type: "range",
      min,
      max,
      step,
      value: window.AppState.params[key],
    });
    i.oninput = (e) => window.AppState.setParam(key, +e.target.value);
    l.appendChild(i);
    overlay.appendChild(l);
  };

  /* textarea for text */
  const lblText = document.createElement("label");
  lblText.innerText = "Text:";
  const ta = document.createElement("textarea");
  ta.rows = 4;
  ta.value = window.AppState.params.userText;
  ta.oninput = (e) => window.AppState.setParam("userText", e.target.value);
  lblText.appendChild(ta);
  overlay.appendChild(lblText);

  /* numeric + range controls */
  addRange("Grain amp:", "grainAmp", 0, 1, 0.01);
  addRange("Font size:", "fontSize", 12, 200, 1);
  addNum("Rows:", "rows", 1, 50);
  addNum("Cols:", "cols", 1, 50);
  addNum("Margin:", "margin", 0, 500);
  addNum("Gap:", "gap", 0, 200);

  /* image width slider (1..cols) */
  const imgLbl = document.createElement("label");
  imgLbl.innerText = "Image width (cols):";
  const imgSlider = document.createElement("input");
  imgSlider.type = "range";
  imgSlider.min = "1";
  imgSlider.step = "1";
  const updateImageSliderMax = () => {
    imgSlider.max = String(window.AppState.params.cols);
    if (window.AppState.params.imageCols > window.AppState.params.cols) {
      window.AppState.setParam("imageCols", window.AppState.params.cols);
    }
    imgSlider.value = window.AppState.params.imageCols;
  };
  imgSlider.oninput = (e) =>
    window.AppState.setParam("imageCols", +e.target.value);
  updateImageSliderMax();
  imgLbl.appendChild(imgSlider);
  overlay.appendChild(imgLbl);

  /* checkbox show image */
  const showLbl = document.createElement("label");
  const showCb = Object.assign(document.createElement("input"), {
    type: "checkbox",
    checked: window.AppState.params.showImage,
  });
  showCb.onchange = (e) =>
    window.AppState.setParam("showImage", e.target.checked);
  showLbl.append(showCb, " Show image");
  overlay.appendChild(showLbl);

  /* buttons */
  const b20 = document.createElement("button");
  b20.innerText = "FPS 20";
  b20.onclick = () => window.setFPS(20);
  const b1 = document.createElement("button");
  b1.innerText = "FPS 1";
  b1.onclick = () => window.setFPS(1);
  const bLoop = document.createElement("button");
  bLoop.innerText = "Pause / Resume";
  bLoop.onclick = () => window.toggleLoop();
  const bReset = document.createElement("button");
  bReset.innerText = "Reset grid pos";
  bReset.onclick = () => window.resetAnchors();
  overlay.append(b20, b1, bLoop, bReset);

  document.body.appendChild(overlay);

  /* gear button */
  const gear = Object.assign(document.createElement("button"), {
    id: "toggleButton",
    innerText: "⚙️",
  });
  gear.onclick = () =>
    (overlay.style.display =
      overlay.style.display === "block" ? "none" : "block");
  document.body.appendChild(gear);
});
