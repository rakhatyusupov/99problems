#ifdef GL_ES
precision mediump float;
#endif

/*  p5.filterShader-format
    ---------------------
    varying vec2  pos;                     // UV in [0,1]
    uniform sampler2D filter_background;   // previous frame (or canvas)
    uniform vec2  filter_res;              // (width,height)
    uniform float millis;                  // time in ms
*/
varying vec2  pos;
uniform sampler2D filter_background;
uniform vec2  filter_res;
uniform float millis;

/* ---- original constants ---- */
const float Scale1 = 0.3;
const float Scale2 = 3.5;
const float Amp    = 20.0;
const float FreqX  = 30.0;
const float FreqY  = 30.0;

/* ---- iq noise helpers (3-D) ---- */
mat3 m = mat3(  0.00,  0.80,  0.60,
               -0.80,  0.36, -0.48,
               -0.60, -0.48,  0.64 );

float hash(float n){ return fract(sin(n)*43758.5453); }

float noise(vec3 x){
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);

    float n = p.x + p.y*57.0 + 113.0*p.z;

    float res = mix(mix(mix(hash(n+0.0),   hash(n+1.0),   f.x),
                        mix(hash(n+57.0),  hash(n+58.0),  f.x), f.y),
                    mix(mix(hash(n+113.0), hash(n+114.0), f.x),
                        mix(hash(n+170.0), hash(n+171.0), f.x), f.y), f.z);
    return res;
}

float mynoise(vec3 p){ return noise(p); }

float myfbm(vec3 p){
    float f;
    f  = 0.05000*mynoise( p ); p = m*p*0.02;
    f += 0.02500*mynoise( p ); p = m*p*0.03;
    f += 0.01250*mynoise( p ); p = m*p*0.01;
    f += 0.00*mynoise( p ); p = m*p*0.05;
    f += 0.03125*mynoise( p );p = m*p*0.02;
    f += 0.015625*mynoise( p );
    return f;
}

/* ---- main ---- */
void main(){
    /* uv in 0–1, keep shadertoy’s aspect trick */
    vec2 uv = pos * vec2(filter_res.x, filter_res.y) / filter_res.y;

    /* millis -> seconds */
    float t = millis * 0.001;

    vec3 p  = Scale2 * vec3(uv,0.0) - vec3(t)*0.1;
    float x = myfbm(p);

    vec3 offset =
        (0.5 + 0.5 * sin(x * vec3(FreqX,FreqY,1.0) * Scale1)) / Scale1;

    offset *= Amp * 0.0005;   /* small shift */

    vec3 col = texture2D(filter_background, pos + offset.xy).rgb;
    gl_FragColor = vec4(col, 1.0);
}
