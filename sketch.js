// functions/grid.js
// Пусто – логика грида в sketch.js

// sketch.js
let glitchShader, grainShader;
let drawingSurface, img;
let textPos,
  imgPos,
  drag = null,
  offX = 0,
  offY = 0,
  isLooping = true;
let droppedImages = [];

function createGrid({ rows, cols, margin, gap, w, h }) {
  const col = (w - 2 * margin - gap * (cols - 1)) / cols;
  const row = (h - 2 * margin - gap * (rows - 1)) / rows;
  const cx = floor(random(cols));
  const cy = floor(random(rows));
  const x0 = margin + cx * (col + gap);
  const y0 = margin + cy * (row + gap);
  return [
    [x0, y0],
    [x0 + col, y0],
    [x0, y0 + row],
    [x0 + col, y0 + row],
  ];
}

function preload() {
  glitchShader = loadShader("filter.vert", "glitch.frag");
  grainShader = loadShader("filter.vert", "grain.frag");
  img = loadImage(
    "P20191_10.jpg",
    () => {},
    () => (img = null)
  );
}

function setup() {
  const cnv = createCanvas(800, 800);
  cnv.drop(handleFile);
  drawingSurface = createGraphics(width, height);
  drawingSurface.stroke(255).strokeWeight(2);
  textFont("monospace");
  resetGridAnchors();

  window.setFPS = (f) => (loop(), frameRate(f));
  window.toggleLoop = () => (
    isLooping ? noLoop() : loop(), (isLooping = !isLooping)
  );
  window.resetAnchors = resetGridAnchors;
}

function handleFile(file) {
  if (file.type === "image") {
    loadImage(file.data, (loaded) => {
      droppedImages.push({
        img: loaded,
        x: mouseX,
        y: mouseY,
        aspect: loaded.width / loaded.height,
      });
    });
  }
}

function resetGridAnchors() {
  const p = window.AppState.params;
  const c = createGrid({ ...p, w: width, h: height });
  textPos = createVector(...random(c));
  imgPos = createVector(...random(c));
}

function draw() {
  const { userText, grainAmp, showImage, imageSize, fontSize } =
    window.AppState.params;

  image(drawingSurface, 0, 0);

  if (showImage && img) {
    image(
      img,
      imgPos.x,
      imgPos.y,
      imageSize * (img.width / img.height),
      imageSize
    );
  }

  droppedImages.forEach((o) => {
    const h = imageSize;
    const w = h * o.aspect;
    image(o.img, o.x, o.y, w, h);
  });

  fill(255);
  noStroke();
  textSize(fontSize);
  textAlign(LEFT, TOP);
  text(userText, textPos.x, textPos.y);

  grainShader.setUniform("millis", millis());
  grainShader.setUniform("grainAmp", grainAmp);
  filterShader(grainShader);

  glitchShader.setUniform("noise", noise(millis() / 100));
  glitchShader.setUniform("millis", millis());
  filterShader(glitchShader);
}

function mousePressed() {
  const p = window.AppState.params;
  if (
    p.showImage &&
    img &&
    mouseX > imgPos.x &&
    mouseX < imgPos.x + p.imageSize * (img.width / img.height) &&
    mouseY > imgPos.y &&
    mouseY < imgPos.y + p.imageSize
  ) {
    drag = "img";
    offX = mouseX - imgPos.x;
    offY = mouseY - imgPos.y;
    return;
  }
  const tw = textWidth(p.userText),
    th = p.fontSize;
  if (
    mouseX > textPos.x &&
    mouseX < textPos.x + tw &&
    mouseY > textPos.y &&
    mouseY < textPos.y + th
  ) {
    drag = "txt";
    offX = mouseX - textPos.x;
    offY = mouseY - textPos.y;
  }
}

function mouseDragged() {
  if (!drag) return;
  const { cols, rows, margin, gap } = window.AppState.params;
  const colSize = (width - 2 * margin - gap * (cols - 1)) / cols;
  const rowSize = (height - 2 * margin - gap * (rows - 1)) / rows;
  let nx = mouseX - offX;
  let ny = mouseY - offY;
  nx = margin + round((nx - margin) / (colSize + gap)) * (colSize + gap);
  ny = margin + round((ny - margin) / (rowSize + gap)) * (rowSize + gap);
  if (drag === "img") imgPos.set(nx, ny);
  else textPos.set(nx, ny);
}

function mouseReleased() {
  drag = null;
}

// ui.js
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
  const overlay = document.createElement("div");
  overlay.id = "settingsOverlay";
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

  const ltxt = document.createElement("label");
  ltxt.innerText = "Text:";
  const ta = document.createElement("textarea");
  ta.rows = 4;
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

  const cbl = document.createElement("label");
  const cb = Object.assign(document.createElement("input"), {
    type: "checkbox",
    checked: window.AppState.params.showImage,
  });
  cb.onchange = (e) => window.AppState.setParam("showImage", e.target.checked);
  cbl.append(cb, " Show image");
  overlay.appendChild(cbl);

  const fps20 = document.createElement("button");
  fps20.innerText = "FPS 20";
  fps20.onclick = () => window.setFPS(20);
  const fps1 = document.createElement("button");
  fps1.innerText = "FPS 1";
  fps1.onclick = () => window.setFPS(1);
  const loopBtn = document.createElement("button");
  loopBtn.innerText = "Pause / Resume";
  loopBtn.onclick = () => window.toggleLoop();
  const resetBtn = document.createElement("button");
  resetBtn.innerText = "Reset grid pos";
  resetBtn.onclick = () => {
    if (!isLooping) window.resetAnchors();
  };

  overlay.append(fps20, fps1, loopBtn, resetBtn);

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
