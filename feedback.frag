#ifdef GL_ES
precision mediump float;
#endif

/* p5.filterShader I/O ----------------------------------------------------- */
varying  vec2  pos;
uniform  sampler2D filter_background;   // прошлый кадр
uniform  vec2  filter_res;              // (w,h)
uniform  float millis;                  // ms since start

/* ---------- helpers (из common) ----------------------------------------- */
float hash11(float p){
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}
float hash12(vec2 p){
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
vec2 hash21(float p){
    vec3 p3 = fract(vec3(p) * vec3(.1031,.1030,.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

/* ------------------------------------------------------------------------ */
void main(){
    vec2 uv    = pos;                           // 0-1
    vec2 p     = (pos*filter_res - filter_res*0.5) / filter_res.y;
    float unit = 1.0 / filter_res.y;

    float time  = millis * 0.01;                // iTime*10.
    float anim  = fract(time);
    float index = floor(time);

    /* смещение */
    vec2  rnd1   = hash21(index)*2.0 - 1.0;
    vec2  target = p + rnd1;
    float mask   = hash12(floor(uv*hash11(index+78.0)*32.0)+index);
    float a      = 6.283 * floor(hash11(index*72.0)*4.0)/4.0;
    vec2  dir    = vec2(cos(a),sin(a));
    vec2  offset = mask * dir * unit * 10.0 *
                   hash12(floor(uv*16.0));

    /* случайный respawn: вместо iChannel1 берём тот же canvas */
    bool  spawn = hash12(floor(uv*hash11(index+78.0)*8.0)+index) > 0.9;

    vec3 col;
    if (spawn) col = texture2D(filter_background, uv).rgb;
    else       col = texture2D(filter_background, uv - offset).rgb;

    gl_FragColor = vec4(col,1.0);
}
