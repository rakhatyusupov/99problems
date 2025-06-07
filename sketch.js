// sketch.js
let glitchShader, grainShader;
let drawingSurface, img;
let textPos, imgPos;
// drag modes: 'img', 'txt'
let drag = null,
  offX = 0,
  offY = 0;
// dropped images drag info
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

function draw() {
  const p = window.AppState.params;
  image(drawingSurface, 0, 0);

  // initial image
  if (p.showImage && img) {
    const h0 = p.imageSize;
    const w0 = h0 * (img.width / img.height);
    image(img, imgPos.x, imgPos.y, w0, h0);
  }

  // dropped images
  droppedImages.forEach((o) => {
    const h0 = p.imageSize;
    const w0 = h0 * o.aspect;
    image(o.img, o.x, o.y, w0, h0);
  });

  // text
  fill(255);
  noStroke();
  textSize(p.fontSize);
  textAlign(LEFT, TOP);
  text(p.userText, textPos.x, textPos.y);

  // shaders
  grainShader.setUniform("millis", millis());
  grainShader.setUniform("grainAmp", p.grainAmp);
  filterShader(grainShader);

  glitchShader.setUniform("noise", millis() / 100);
  glitchShader.setUniform("millis", millis());
  filterShader(glitchShader);
}

function mousePressed() {
  const p = window.AppState.params;

  // drag initial image
  if (p.showImage && img) {
    const h0 = p.imageSize;
    const w0 = h0 * (img.width / img.height);
    if (
      mouseX > imgPos.x &&
      mouseX < imgPos.x + w0 &&
      mouseY > imgPos.y &&
      mouseY < imgPos.y + h0
    ) {
      drag = "img";
      offX = mouseX - imgPos.x;
      offY = mouseY - imgPos.y;
      return;
    }
  }

  // drag dropped images
  for (let i = droppedImages.length - 1; i >= 0; i--) {
    const o = droppedImages[i];
    const h0 = p.imageSize;
    const w0 = h0 * o.aspect;
    if (
      mouseX > o.x &&
      mouseX < o.x + w0 &&
      mouseY > o.y &&
      mouseY < o.y + h0
    ) {
      dragInfo = { idx: i };
      offX = mouseX - o.x;
      offY = mouseY - o.y;
      return;
    }
  }

  // drag text
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
  const colSize = (width - 2 * p.margin - p.gap * (p.cols - 1)) / p.cols;
  const rowSize = (height - 2 * p.margin - p.gap * (p.rows - 1)) / p.rows;

  // snap-drag initial or text
  if (drag) {
    let nx = mouseX - offX;
    let ny = mouseY - offY;
    nx =
      p.margin + round((nx - p.margin) / (colSize + p.gap)) * (colSize + p.gap);
    ny =
      p.margin + round((ny - p.margin) / (rowSize + p.gap)) * (rowSize + p.gap);
    if (drag === "img") imgPos.set(nx, ny);
    else textPos.set(nx, ny);
  }
  // snap-drag dropped
  else if (dragInfo) {
    const o = droppedImages[dragInfo.idx];
    let nx = mouseX - offX;
    let ny = mouseY - offY;
    nx =
      p.margin + round((nx - p.margin) / (colSize + p.gap)) * (colSize + p.gap);
    ny =
      p.margin + round((ny - p.margin) / (rowSize + p.gap)) * (rowSize + p.gap);
    o.x = nx;
    o.y = ny;
  }
}

function mouseReleased() {
  drag = null;
  dragInfo = null;
}
