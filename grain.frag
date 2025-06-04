#ifdef GL_ES
precision mediump float;
#endif

varying vec2 pos;

uniform sampler2D filter_background; // текстура предыдущего шага
uniform vec2 filter_res;             // разрешение (может не использоваться)
uniform float grainAmp;              // из UI
uniform float millis;                // из sketch.js

const float tau = 6.2831855;

float rand(vec2 co, float salt) {
  return fract(sin(dot(co, vec2(12.9898, 78.233) + salt + millis)) * 43758.5453);
}

void main() {
  // 1) читаем цвет из предыдущего изображения
  vec4 col = texture2D(filter_background, pos);

  // 2) добавляем шум по каждому каналу отдельно
  col.r += sin(rand(pos, 0.0) * tau) * grainAmp;
  col.g += sin(rand(pos, 1.0) * tau) * grainAmp;
  col.b += sin(rand(pos, 2.0) * tau) * grainAmp;

  // 3) выдаём итоговый цвет
  gl_FragColor = col;
}
