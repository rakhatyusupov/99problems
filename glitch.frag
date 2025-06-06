#ifdef GL_ES
precision mediump float;
#endif

varying vec2 pos;

uniform sampler2D filter_background; // текстура после grain-frag
uniform vec2 filter_res;             // разрешение (не используется ниже, но может понадобиться)
uniform float noise;                 // из sketch.js: getNoiseValue()
uniform float millis;                //  использоваесли нужно, можемть в эффектах

#define SIN01(a) (sin(a) * 0.5 + 0.5)

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(
      abs(q.z + (q.w - q.y) / (6.0 * d + e)),
      d / (q.x + e),
      q.x
    );
}

void main() {
    vec2 uv = pos;
    vec3 rgb = texture2D(filter_background, uv).rgb;
    vec3 hsv = rgb2hsv(rgb);

    // Пример простого глитч-эффекта на основе HSV и малого вращения
    float angle = hsv.x + atan(uv.y - 0.5, uv.x - 0.5) + millis * 0.0001;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

    float offsetAmount = log(max(SIN01(millis * 0.0007) - 0.2, 0.0) * 0.20 + 1.0);
    vec2 offset = rot * vec2(offsetAmount, 0.0) * hsv.y;

    vec3 col = texture2D(filter_background, uv + offset).rgb;
    gl_FragColor = vec4(col, 1.0);
}
