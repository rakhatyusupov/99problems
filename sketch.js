let glitchShader, grainShader;
let drawingSurface, img;

/*────── GRID ──────*/
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
/*──────────────────*/

let textPos,
  imgPos,
  drag = null,
  offX = 0,
  offY = 0,
  isLooping = true;

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
  createCanvas(800, 800);
  drawingSurface = createGraphics(width, height);
  drawingSurface.stroke(255).strokeWeight(2);
  textFont("monospace");

  // начальное размещение на сетке
  const p = window.AppState.params;
  const c = createGrid({ ...p, w: width, h: height });
  textPos = createVector(...random(c));
  imgPos = createVector(...random(c));

  /* публичные управлялки для UI */
  window.setFPS = (f) => (loop(), frameRate(f));
  window.toggleLoop = () => (
    isLooping ? noLoop() : loop(), (isLooping = !isLooping)
  );
}

function draw() {
  const { userText, grainAmp, showImage, imageSize, fontSize } =
    window.AppState.params;

  // динамическая ручная поверхность
  drawingSurface.strokeWeight(sin(millis() * 0.002) * 2.5 + 2.5);
  if (mouseIsPressed) drawingSurface.line(mouseX, mouseY, pmouseX, pmouseY);
  image(drawingSurface, 0, 0);

  // изображение
  if (showImage && img) image(img, imgPos.x, imgPos.y, imageSize, imageSize);

  // текст
  fill(255);
  noStroke();
  textSize(fontSize);
  textAlign(LEFT, TOP);
  text(userText, textPos.x, textPos.y);

  // шейдеры
  grainShader.setUniform("millis", millis());
  grainShader.setUniform("grainAmp", grainAmp);
  filterShader(grainShader);

  glitchShader.setUniform("noise", noise(millis() / 100));
  glitchShader.setUniform("millis", millis());
  filterShader(glitchShader);
}

/* ───── Dragging ───── */
function mousePressed() {
  const p = window.AppState.params;
  // картинка?
  if (
    window.AppState.params.showImage &&
    img &&
    mouseX > imgPos.x &&
    mouseX < imgPos.x + p.imageSize &&
    mouseY > imgPos.y &&
    mouseY < imgPos.y + p.imageSize
  ) {
    drag = "img";
    offX = mouseX - imgPos.x;
    offY = mouseY - imgPos.y;
    return;
  }
  // текст?
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
  if (drag === "img") {
    imgPos.set(mouseX - offX, mouseY - offY);
    return;
  }
  textPos.set(mouseX - offX, mouseY - offY);
}

function mouseReleased() {
  drag = null;
}
