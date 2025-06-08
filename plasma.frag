#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.1415926

/* p5.filterShader I/O */
varying  vec2  pos;                 // 0‒1 UV
uniform  sampler2D filter_background;
uniform  vec2  filter_res;
uniform  float millis;

/* tweakables */
const float THRES   = 0.7;          // same visual “glitch threshold”
const float MAX_OFF = 0.03;         // max horizontal offset (as % of width)

/* ------- helper: plasma field (same formula) ------- */
float plasma(vec2 uv,float t){
    /* original k = 9   (cell size) */
    const float k = 9.0;
    vec2 c = uv*k - k*0.5;

    float v = 0.0;
    v += sin(c.x + t);
    v += sin((c.y + t) / 2.0);
    v += sin((c.x + c.y + t)/3.0);

    c += k*0.5 * vec2( sin(t/3.2), cos(t/2.7) );
    v /= 2.0;
    return v;                       // range roughly (-3 .. 3)
}

void main(){
    float t   = millis * 0.001;     // seconds
    vec2  uv  = pos;                // 0-1

    /* evaluate field at this pixel and its transpose */
    float psin = sin(plasma( uv          , t));
    float pcos = cos(plasma( uv.yx       , t));

    float diff = abs(psin - pcos);

    /* if diff exceeds threshold -> compute shift */
    float shift = step(THRES, diff) *   /* 0 or 1  */
                  MAX_OFF * diff;       /* proportional */

    vec2  uvShift = uv + vec2(shift,0.0);
    uvShift = fract(uvShift);           // wrap-around

    vec3 col = texture2D(filter_background, uvShift).rgb;
    gl_FragColor = vec4(col,1.0);
}
