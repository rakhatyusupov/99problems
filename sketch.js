let glitchShader, grainShader;
let drawingSurface, img;
let textPos,
  imgPos,
  drag = null,
  offX = 0,
  offY = 0,
  isLooping = true;

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
  resetGridAnchors();

  window.setFPS = (f) => (loop(), frameRate(f));
  window.toggleLoop = () => (
    isLooping ? noLoop() : loop(), (isLooping = !isLooping)
  );
  window.resetAnchors = resetGridAnchors;
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
  if (showImage && img) image(img, imgPos.x, imgPos.y, imageSize, imageSize);

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
    mouseX < imgPos.x + p.imageSize &&
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
