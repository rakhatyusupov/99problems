let glitchShader, grainShader;
let drawingSurface, img;

/* ─────────────  GRID  ───────────── */
function createGrid({ rows, cols, margin, gap, canvasW, canvasH }) {
  const colSize = (canvasW - 2 * margin - gap * (cols - 1)) / cols;
  const rowSize = (canvasH - 2 * margin - gap * (rows - 1)) / rows;

  // случайный сдвиг прямоугольника
  const kx = floor(random(cols));
  const ky = floor(random(rows));

  const x0 = margin + kx * (colSize + gap);
  const y0 = margin + ky * (rowSize + gap);

  return [
    [x0, y0],
    [x0 + colSize, y0],
    [x0, y0 + rowSize],
    [x0 + colSize, y0 + rowSize],
  ];
}
/* ─────────────────────────────────── */

function preload() {
  glitchShader = loadShader("filter.vert", "glitch.frag");
  grainShader = loadShader("filter.vert", "grain.frag");

  img = loadImage(
    "blue-clouds-day-fluffy-53594 (1).jpeg",
    () => {},
    () => {
      img = null;
    }
  );
}

function setup() {
  createCanvas(800, 800);
  drawingSurface = createGraphics(width, height);
  drawingSurface.stroke(255);
  drawingSurface.strokeWeight(2);
  textFont("Arial");
  frameRate(1);
  drawingSurface.background(32);
}

function draw() {
  const {
    userText,
    grainAmp,
    showImage,
    imageSize,
    fontSize,
    rows,
    cols,
    margin,
    gap,
  } = window.AppState.params;

  /* grid-based random placement */
  const pts = createGrid({
    rows,
    cols,
    margin,
    gap,
    canvasW: width,
    canvasH: height,
  });

  const rndCorner = random(pts);
  const [tX, tY] = rndCorner;
  const alignLeft = rndCorner === pts[0] || rndCorner === pts[2];
  textAlign(alignLeft ? LEFT : RIGHT, TOP);

  /* p5 drawing surface */
  let w = sin(millis() * 0.002) * 2.5 + 2.5;
  drawingSurface.strokeWeight(w);

  if (mouseIsPressed) drawingSurface.line(mouseX, mouseY, pmouseX, pmouseY);
  image(drawingSurface, 0, 0);

  if (showImage && img) image(img, tX, tY, imageSize, imageSize);

  fill(255);
  noStroke();
  textSize(fontSize);
  text(userText, tX, tY);

  /* shaders */
  grainShader.setUniform("millis", millis());
  grainShader.setUniform("grainAmp", grainAmp);
  filterShader(grainShader);

  glitchShader.setUniform("noise", noise(millis() / 100));
  glitchShader.setUniform("millis", millis());
  filterShader(glitchShader);
}
