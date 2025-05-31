#ifdef GL_ES
precision mediump float;
#endif

// Pixel position
varying vec2 pos;

// Uniforms set by filterShader
uniform sampler2D filter_background; // contains the image being filtered
uniform vec2 filter_res; // contains the image resolution in pixels

uniform float grainAmp; // how much variance in grain texture

uniform float millis; // time sketch has been running

const float tau = 6.2831855; // 2 * PI

// The GPU has no random() function, so instead
// do some maths on the position of the pixel to approximate a
// random number between 0 and 1
float rand(vec2 co, float salt){
    return fract(sin(dot(co, vec2(12.9898, 78.233) + salt + millis)) * 43758.5453);
}

void main() {
  // Read colour from image
  vec4 col = texture2D(filter_background, pos);
    
  // Use the rand function to create a random number
  // with a different "salt" value for each colour channel
  // pass that into sin() to get something between -1, 1
  // multiply by the grain variance to set how much noise we want
  col.r += sin(rand(pos, 0.) * tau) * grainAmp;
  col.g += sin(rand(pos, 1.) * tau) * grainAmp;
  col.b += sin(rand(pos, 2.) * tau) * grainAmp;
  
  // Modified colour is our output
  gl_FragColor = col;
}