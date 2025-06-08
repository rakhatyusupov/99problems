#ifdef GL_ES
precision mediump float;
#endif

varying  vec2  pos;
uniform  sampler2D filter_background;
uniform  vec2  filter_res;
uniform  float millis;

float noise1(float n){ return fract(cos(n*89.42)*343.42); }

float shake(float x){
    return sin(x)*sin(x*4.0)*cos(x*8.0)*sin(x*12.0);
}

void main(){
    vec2 uv = pos;
    float t = millis*0.001;
    float s = shake(uv.y + t) * noise1(uv.x);
    vec2  offs = vec2(0.0, 0.5*s);
    vec3  col  = texture2D(filter_background, uv + offs).rgb;
    gl_FragColor = vec4(col,1.0);
}
