let glitchShader;
let grainShader;
let drawingSurface;
let userInputField;
let userInput = "Hello";
let img;

function preload() {
  glitchShader = loadShader("filter.vert", "glitch.frag");
  grainShader = loadShader("filter.vert", "grain.frag");
  img = loadImage("./blue-clouds-day-fluffy-53594 (1).jpeg");
}

function setup() {
  createCanvas(800, 800);

  drawingSurface = createGraphics(width, height);
  drawingSurface.stroke(255);
  drawingSurface.strokeWeight(2);

  textFont("monospace");

  // --- Controls ---
  const toggleButton = createButton("⚙️");
  toggleButton.position(width - 50, 10);
  toggleButton.style("z-index", "1000");
  toggleButton.mousePressed(toggleOverlay);

  const overlay = createDiv("");
  overlay.id("settingsOverlay");

  createP("Настройки здесь").parent(overlay);

  userInputField = createInput("Hello");
  userInputField.parent(overlay);
  userInputField.input(() => {
    userInput = userInputField.value();
  });

  function toggleOverlay() {
    const el = select("#settingsOverlay");
    const visible = el.style("display") === "block";
    el.style("display", visible ? "none" : "block");
  }
}

function draw() {
  let dynamicWeight = sin(millis() * 0.002) * 2.5 + 2.5;
  drawingSurface.strokeWeight(dynamicWeight);

  if (mouseIsPressed) {
    drawingSurface.line(mouseX, mouseY, pmouseX, pmouseY);
  }

  image(drawingSurface, 0, 0);

  // Draw image at mouse position
  image(img, mouseX, mouseY, 400, 400);

  // Draw text at mouse position
  fill(255);
  noStroke();
  textSize(240);
  text(userInput, mouseX, mouseY + 24);

  grainShader.setUniform("millis", millis());
  grainShader.setUniform("grainAmp", 0.1);
  filterShader(grainShader);

  glitchShader.setUniform("noise", getNoiseValue());
  filterShader(glitchShader);
}

function getNoiseValue() {
  let v = noise(millis() / 100);
  const cutOff = 0.4;
  if (v < cutOff) return 0;
  return pow((v - cutOff) / (1 - cutOff), 2);
}
