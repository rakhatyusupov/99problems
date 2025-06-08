// sketch.js  — упрощённая схема: один «обработчик текста»
// --------------------------------------------------------
// --------------------------------------------------------
//  Main p5 sketch with three optional post-filters:
//  grain, glitch, noise
// --------------------------------------------------------
let glitchShader, grainShader, noiseShader;
let drawingSurface, img;

let textObjs = []; // [{ text , pos }]
let imgPos;

let drag = null,
  dragInfo = null; // 'img' | 'dropImg' | 'txt'
let offX = 0,
  offY = 0;
let droppedImages = [];
let isLooping = true;

/* ───────── GRID HELPERS ───────── */
const colSize = () => {
  const p = window.AppState.params;
  return (width - 2 * p.margin - p.gap * (p.cols - 1)) / p.cols;
};
const randGridPos = () => {
  const p = window.AppState.params;
  const cs = colSize();
  const rs = (height - 2 * p.margin - p.gap * (p.rows - 1)) / p.rows;
  const cx = floor(random(p.cols));
  const cy = floor(random(p.rows));
  return createVector(
    p.margin + cx * (cs + p.gap),
    p.margin + cy * (rs + p.gap)
  );
};
const imgDims = (aspect) => {
  const p = window.AppState.params;
  const w = p.imageCols * colSize() + p.gap * (p.imageCols - 1);
  return { w, h: w / aspect };
};

/* ───────── TEXT HANDLER ───────── */
function handleText() {
  const parts = window.AppState.params.userText.split("/").filter(Boolean);
  while (textObjs.length < parts.length)
    textObjs.push({ text: "", pos: randGridPos() });
  while (textObjs.length > parts.length) textObjs.pop();
  parts.forEach((t, i) => (textObjs[i].text = t));
}

/* ───────── PRELOAD / SETUP ───────── */
function preload() {
  glitchShader = loadShader("filter.vert", "glitch.frag");
  grainShader = loadShader("filter.vert", "grain.frag");
  noiseShader = loadShader("filter.vert", "noise.frag");
  fresnelShader = loadShader("filter.vert", "fresnel.frag");
  plasmaShader = loadShader("filter.vert", "plasma.frag");
  feedShader = loadShader("filter.vert", "feedback.frag");
  flowingShader = loadShader("filter.vert", "flowing.frag");

  img = loadImage(
    "P20191_10.jpg",
    () => {},
    () => (img = null)
  );
}
function setup() {
  const cnv = createCanvas(800, 800);
  pixelDensity(2);
  cnv.drop(
    (file) =>
      file.type === "image" &&
      loadImage(file.data, (l) =>
        droppedImages.push({
          img: l,
          aspect: l.width / l.height,
          x: mouseX,
          y: mouseY,
        })
      )
  );
  drawingSurface = createGraphics(width, height);
  textFont("monospace");

  imgPos = randGridPos();
  handleText();

  window.setFPS = (f) => {
    loop();
    frameRate(f);
  };
  window.toggleLoop = () => {
    isLooping ? noLoop() : loop();
    isLooping = !isLooping;
  };
  window.resetAnchors = () => {
    imgPos = randGridPos();
    textObjs.forEach((o) => (o.pos = randGridPos()));
  };
}

/* ───────── DRAW ───────── */
function draw() {
  handleText();
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
  textObjs.forEach((o) => text(o.text, o.pos.x, o.pos.y));

  /* --------- post filters --------- */
  if (p.usePlasma) {
    plasmaShader.setUniform("millis", millis());
    plasmaShader.setUniform("filter_res", [width, height]);
    filterShader(plasmaShader);
  }

  if (p.useGrain) {
    grainShader.setUniform("millis", millis());
    grainShader.setUniform("grainAmp", p.grainAmp);
    filterShader(grainShader);
  }
  if (p.useGlitch) {
    glitchShader.setUniform("noise", noise(millis() / 100.0));
    glitchShader.setUniform("millis", millis());
    filterShader(glitchShader);
  }
  if (p.useNoise) {
    noiseShader.setUniform("millis", millis());
    noiseShader.setUniform("filter_res", [width, height]);
    filterShader(noiseShader);
  }

  if (p.useFresnel) {
    fresnelShader.setUniform("millis", millis());
    fresnelShader.setUniform("filter_res", [width, height]);
    fresnelShader.setUniform("u_mouse", [mouseX / width, mouseY / height]);
    filterShader(fresnelShader);
  }

  if (p.useFeedback) {
    feedShader.setUniform("millis", millis());
    feedShader.setUniform("filter_res", [width, height]);
    filterShader(feedShader);
  }

  if (p.useFlowing) {
    flowingShader.setUniform("millis", millis());
    flowingShader.setUniform("filter_res", [width, height]);
    filterShader(flowingShader);
  }
}

/* ───────── DRAG ───────── */
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
    const o = droppedImages[i],
      { w, h } = imgDims(o.aspect);
    if (mouseX > o.x && mouseX < o.x + w && mouseY > o.y && mouseY < o.y + h) {
      drag = "dropImg";
      dragInfo = { idx: i };
      offX = mouseX - o.x;
      offY = mouseY - o.y;
      return;
    }
  }
  for (let i = textObjs.length - 1; i >= 0; i--) {
    const o = textObjs[i],
      tw = textWidth(o.text),
      th = p.fontSize;
    if (
      mouseX > o.pos.x &&
      mouseX < o.pos.x + tw &&
      mouseY > o.pos.y &&
      mouseY < o.pos.y + th
    ) {
      drag = "txt";
      dragInfo = { idx: i };
      offX = mouseX - o.pos.x;
      offY = mouseY - o.pos.y;
      return;
    }
  }
}
function mouseDragged() {
  if (!drag) return;
  const p = window.AppState.params;
  const stepX = colSize() + p.gap,
    stepY = (height - 2 * p.margin - p.gap * (p.rows - 1)) / p.rows + p.gap,
    snap = (x, y) => ({
      nx: p.margin + round((x - p.margin) / stepX) * stepX,
      ny: p.margin + round((y - p.margin) / stepY) * stepY,
    });

  if (drag === "img") {
    const { nx, ny } = snap(mouseX - offX, mouseY - offY);
    imgPos.set(nx, ny);
  } else if (drag === "dropImg") {
    const o = droppedImages[dragInfo.idx],
      { nx, ny } = snap(mouseX - offX, mouseY - offY);
    o.x = nx;
    o.y = ny;
  } else if (drag === "txt") {
    const o = textObjs[dragInfo.idx],
      { nx, ny } = snap(mouseX - offX, mouseY - offY);
    o.pos.set(nx, ny);
  }
}
function mouseReleased() {
  drag = null;
  dragInfo = null;
}
