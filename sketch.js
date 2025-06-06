let glitchShader;
let grainShader;
let drawingSurface;
let img;

function preload() {
  glitchShader = loadShader("filter.vert", "glitch.frag");
  grainShader = loadShader("filter.vert", "grain.frag");

  img = loadImage(
    "P20191_10.jpg",
    () => {},
    () => {
      // Если не удалось загрузить, просто сделаем img = null
      img = null;
    }
  );
}

function setup() {
  createCanvas(800, 800);
  drawingSurface = createGraphics(width, height);
  drawingSurface.stroke(255);
  drawingSurface.strokeWeight(2);

  textFont("monospace");
}

function draw() {
  // 1) получаем параметры из global AppState
  const { userText, grainAmp, showImage, imageSize, fontSize } =
    window.AppState.params;

  // 2) Динамическая толщина линии (как было раньше)
  let dynamicWeight = sin(millis() * 0.002) * 2.5 + 2.5;
  drawingSurface.strokeWeight(dynamicWeight);

  // 3) Рисуем на drawingSurface, если зажата мышка
  if (mouseIsPressed) {
    drawingSurface.line(mouseX, mouseY, pmouseX, pmouseY);
  }

  // 4) Показываем нарисованное
  image(drawingSurface, 0, 0);

  // 5) Если включено showImage и картинка загрузилась, рисуем её
  if (showImage && img) {
    image(img, mouseX, mouseY, imageSize, imageSize);
  }

  // 6) Рисуем текст (из UI) рядом с мышкой
  fill(255);
  noStroke();
  textSize(fontSize);
  text(userText, mouseX + imageSize + 20, mouseY + fontSize / 2);

  // 7) Передаём параметры в шейдеры:

  // Grain-шейдер (передаём время и величину grainAmp)
  grainShader.setUniform("millis", millis());
  grainShader.setUniform("grainAmp", grainAmp);
  filterShader(grainShader);

  // Glitch-шейдер (передаём только noise; millis можно захардкодить, если нужно)
  glitchShader.setUniform("noise", getNoiseValue());
  glitchShader.setUniform("millis", millis());
  filterShader(glitchShader);
}

function getNoiseValue() {
  let v = noise(millis() / 100);
  const cutOff = 0.4;
  if (v < cutOff) return 0;
  return pow((v - cutOff) / (1 - cutOff), 2);
}
