#ifdef GL_ES
precision mediump float;
#endif

varying  vec2  pos;
uniform  sampler2D filter_background;   // предыдущий кадр
uniform  vec2  filter_res;
uniform  float millis;

float hash11(float n){ return fract(sin(n)*43758.5453); }

void main(){
    vec2 uv   = pos;
    vec2 p    = (pos*filter_res - filter_res/2.0)/filter_res.y;
    float unit= 1.0/filter_res.y;

    float time = millis*0.01;          // iTime*10.
    float anim = fract(time);
    float idx  = floor(time);

    // случайное смещение
    float a    = 6.283 * floor(hash11(idx*72.)*4.)/4.;
    vec2  dir  = vec2(cos(a),sin(a));
    vec2  off  = dir * unit * 10.0 * hash11(idx+uv.x*13.);

    vec3 col = texture2D(filter_background, uv - off).rgb;
    gl_FragColor = vec4(col,1.0);
}
