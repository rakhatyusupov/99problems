// sketch.js
let glitchShader, grainShader;
let drawingSurface, img;
let textPos, imgPos;
let drag = null,
  offX = 0,
  offY = 0;
let dragInfo = null;
let droppedImages = [];
let isLooping = true;

function createGrid({ rows, cols, margin, gap, w, h }) {
  const colSize = (w - 2 * margin - gap * (cols - 1)) / cols;
  const rowSize = (h - 2 * margin - gap * (rows - 1)) / rows;
  const cx = floor(random(cols));
  const cy = floor(random(rows));
  const x0 = margin + cx * (colSize + gap);
  const y0 = margin + cy * (rowSize + gap);
  return [
    [x0, y0],
    [x0 + colSize, y0],
    [x0, y0 + rowSize],
    [x0 + colSize, y0 + rowSize],
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
  textFont("monospace");
  resetGridAnchors();

  window.setFPS = (f) => {
    loop();
    frameRate(f);
  };
  window.toggleLoop = () => {
    isLooping ? noLoop() : loop();
    isLooping = !isLooping;
  };
  window.resetAnchors = resetGridAnchors;
}

function handleFile(file) {
  if (file.type === "image") {
    loadImage(file.data, (l) => {
      droppedImages.push({
        img: l,
        aspect: l.width / l.height,
        x: mouseX,
        y: mouseY,
      });
    });
  }
}

function resetGridAnchors() {
  const p = window.AppState.params;
  const corners = createGrid({
    rows: p.rows,
    cols: p.cols,
    margin: p.margin,
    gap: p.gap,
    w: width,
    h: height,
  });
  textPos = createVector(...random(corners));
  imgPos = createVector(...random(corners));
}

function colSize() {
  const p = window.AppState.params;
  return (width - 2 * p.margin - p.gap * (p.cols - 1)) / p.cols;
}

// Вычисляет размеры картинки в колонках p.imageCols
function imgDims(aspect) {
  const p = window.AppState.params;
  const w = p.imageCols * colSize() + p.gap * (p.imageCols - 1);
  return { w, h: w / aspect };
}

function draw() {
  const p = window.AppState.params;
  image(drawingSurface, 0, 0);

  if (p.showImage && img) {
    const { w, h } = imgDims(img.width / img.height);
    image(img, imgPos.x, imgPos.y, w, h);
  }

  droppedImages.forEach((o) => {
    const { w, h } = imgDims(o.aspect);
    image(o.img, o.x, o.y, w, h);
  });

  fill(255);
  noStroke();
  textSize(p.fontSize);
  textAlign(LEFT, TOP);
  text(p.userText, textPos.x, textPos.y);

  grainShader.setUniform("millis", millis());
  grainShader.setUniform("grainAmp", p.grainAmp);
  filterShader(grainShader);

  glitchShader.setUniform("noise", noise(millis() / 100));
  glitchShader.setUniform("millis", millis());
  filterShader(glitchShader);
}

function mousePressed() {
  const p = window.AppState.params;

  if (p.showImage && img) {
    const { w, h } = imgDims(img.width / img.height);
    if (
      mouseX > imgPos.x &&
      mouseX < imgPos.x + w &&
      mouseY > imgPos.y &&
      mouseY < imgPos.y + h
    ) {
      drag = "img";
      offX = mouseX - imgPos.x;
      offY = mouseY - imgPos.y;
      return;
    }
  }

  for (let i = droppedImages.length - 1; i >= 0; i--) {
    const o = droppedImages[i];
    const { w, h } = imgDims(o.aspect);
    if (mouseX > o.x && mouseX < o.x + w && mouseY > o.y && mouseY < o.y + h) {
      dragInfo = { idx: i };
      offX = mouseX - o.x;
      offY = mouseY - o.y;
      return;
    }
  }

  const tw = textWidth(p.userText);
  const th = p.fontSize;
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
  const p = window.AppState.params;
  const stepX = colSize() + p.gap;
  const stepY = (height - 2 * p.margin - p.gap * (p.rows - 1)) / p.rows + p.gap;

  const snap = (x, y) => ({
    nx: p.margin + round((x - p.margin) / stepX) * stepX,
    ny: p.margin + round((y - p.margin) / stepY) * stepY,
  });

  if (drag) {
    const { nx, ny } = snap(mouseX - offX, mouseY - offY);
    if (drag === "img") imgPos.set(nx, ny);
    else textPos.set(nx, ny);
  } else if (dragInfo) {
    const { nx, ny } = snap(mouseX - offX, mouseY - offY);
    const o = droppedImages[dragInfo.idx];
    o.x = nx;
    o.y = ny;
  }
}

function mouseReleased() {
  drag = null;
  dragInfo = null;
}
