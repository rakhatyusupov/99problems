let glitchShader;
let grainShader;

let drawingSurface;

function preload() {
  glitchShader = loadShader("filter.vert", "glitch.frag");
  grainShader = loadShader("filter.vert", "grain.frag");
}

function setup() {
  createCanvas(800, 800);

  drawingSurface = createGraphics(width, height);

  // drawingSurface.background(50);
  drawingSurface.stroke(255);
  drawingSurface.strokeWeight();
}

function draw() {
  if (mouseIsPressed) {
    drawingSurface.line(mouseX, mouseY, pmouseX, pmouseY);
  }

  image(drawingSurface, 0, 0);

  grainShader.setUniform("millis", millis());
  grainShader.setUniform("grainAmp", 0.1);
  filterShader(grainShader);

  glitchShader.setUniform("noise", getNoiseValue());
  filterShader(glitchShader);
}

function getNoiseValue() {
  let v = noise(millis() / 100);
  const cutOff = 0.4;

  if (v < cutOff) {
    return 0;
  }

  v = pow(((v - cutOff) * 1) / (1 - cutOff), 2);

  return v;
}
