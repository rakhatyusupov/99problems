let glitchShader;
let grainShader;
let drawingSurface;
let userInputField;
let userInput = "ВАЛИДОЛ TYPE BEAT";

function preload() {
  glitchShader = loadShader("filter.vert", "glitch.frag");
  grainShader = loadShader("filter.vert", "grain.frag");
}

function setup() {
  createCanvas(800, 800);

  drawingSurface = createGraphics(width, height);
  drawingSurface.stroke(255);
  drawingSurface.strokeWeight(2);

  // Создаём поле ввода
  userInputField = createInput("Hello");
  userInputField.position(10, height + 10); // Под холстом
  userInputField.input(() => {
    userInput = userInputField.value();
  });

  textFont("monospace");
}

function draw() {
  // Изменяем толщину линии по синусоиде во времени (от 0 до 5)
  let dynamicWeight = sin(millis() * 0.002) * 2.5 + 2.5;
  drawingSurface.strokeWeight(dynamicWeight);

  // Рисуем линии мышкой
  if (mouseIsPressed) {
    drawingSurface.line(mouseX, mouseY, pmouseX, pmouseY);
  }

  // Выводим нарисованное
  image(drawingSurface, 0, 0);

  // Отображаем текст, следующий за мышкой
  fill(255);
  noStroke();
  textSize(64);
  text(userInput, mouseX, mouseY);

  // Применяем шейдер зерна
  grainShader.setUniform("millis", millis());
  grainShader.setUniform("grainAmp", 0.1);
  filterShader(grainShader);

  // Применяем глитч-шейдер
  glitchShader.setUniform("noise", getNoiseValue());
  filterShader(glitchShader);
}

function getNoiseValue() {
  let v = noise(millis() / 100);
  const cutOff = 0.4;
  if (v < cutOff) return 0;
  return pow((v - cutOff) / (1 - cutOff), 2);
}
