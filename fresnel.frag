#ifdef GL_ES
precision mediump float;
#endif

varying  vec2  pos;
uniform  sampler2D filter_background;
uniform  vec2  filter_res;
uniform  float millis;
uniform  vec2  u_mouse;         // 0-1

uniform float uAngel;
uniform float uRate;
uniform float uDLTA;


const float ring = 5.0;
const float div  = 0.5;

void main() {
    vec2 res     = filter_res;
    float aspect = res.x / res.y;

    /* uv (0-1) и время */
    vec2  uv = pos;
    float t  = millis * 0.00005;      // ≈ iTime * 0.05

    /* кольцевое смещение вокруг курсора */
    vec2 p = vec2(uv.x * aspect + uAngel*0.5, uv.y);
    vec2 m = vec2(u_mouse.x * aspect + uDLTA, u_mouse.y);

    float r = distance(p, m) - t;
          r = fract(r * ring) / div;   // 0‒1 saw

    uv = -1.0 + 2.0 * uv + uRate*0.5;             // -1…1
    uv *= r;
    uv  = uv * .5 + .5;               // обратно 0-1

    vec3 col = texture2D(filter_background, uv).rgb;
    gl_FragColor = vec4(col,1.0);
}
