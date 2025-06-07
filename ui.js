window.AppState = {
  params: {
    userText: "Hello\nworld",
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
  const overlay = Object.assign(document.createElement("div"), {
    id: "settingsOverlay",
  });
  overlay.appendChild(
    Object.assign(document.createElement("h2"), { innerText: "Настройки" })
  );

  const addNum = (lbl, key, min, max) => {
    const l = document.createElement("label");
    l.innerText = lbl;
    const i = Object.assign(document.createElement("input"), {
      type: "number",
      min,
      max,
      value: window.AppState.params[key],
    });
    i.oninput = (e) => window.AppState.setParam(key, +e.target.value);
    l.appendChild(i);
    overlay.appendChild(l);
  };

  const addRange = (lbl, key, min, max, step) => {
    const l = document.createElement("label");
    l.innerText = lbl;
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

  // textarea вместо input
  const ltxt = document.createElement("label");
  ltxt.innerText = "Text:";
  const ta = document.createElement("textarea");
  ta.value = window.AppState.params.userText;
  ta.oninput = (e) => window.AppState.setParam("userText", e.target.value);
  ltxt.appendChild(ta);
  overlay.appendChild(ltxt);

  addRange("Grain amp:", "grainAmp", 0, 1, 0.01);
  addNum("Image size:", "imageSize", 10, 500);
  addRange("Font size:", "fontSize", 12, 200, 1);
  addNum("Rows:", "rows", 1, 50);
  addNum("Cols:", "cols", 1, 50);
  addNum("Margin:", "margin", 0, 500);
  addNum("Gap:", "gap", 0, 200);

  // чекбокс show image
  const cbl = document.createElement("label");
  const cb = Object.assign(document.createElement("input"), {
    type: "checkbox",
    checked: window.AppState.params.showImage,
  });
  cb.onchange = (e) => window.AppState.setParam("showImage", e.target.checked);
  cbl.append(cb, " Show image");
  overlay.appendChild(cbl);

  // кнопки fps / loop
  const fps20 = document.createElement("button");
  fps20.innerText = "FPS 20";
  fps20.onclick = () => window.setFPS(20);
  const fps1 = document.createElement("button");
  fps1.innerText = "FPS 1";
  fps1.onclick = () => window.setFPS(1);
  const loopBtn = document.createElement("button");
  loopBtn.innerText = "Pause / Resume";
  loopBtn.onclick = () => window.toggleLoop();
  overlay.append(fps20, fps1, loopBtn);

  document.body.appendChild(overlay);

  const btn = Object.assign(document.createElement("button"), {
    id: "toggleButton",
    innerText: "⚙️",
  });
  btn.onclick = () =>
    (overlay.style.display =
      overlay.style.display === "block" ? "none" : "block");
  document.body.appendChild(btn);
});
