import * as constants from './constants.js';
import * as parameters from './parameters.js';

export function draw(texture) {
  twgl.bindFramebufferInfo(gl);
  
  gl.useProgram(programInfo.program);
  setUniforms(texture);
  bindBuffer();
  
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  gl.flush();
}

var programInfo;
export function init() {
  programInfo = twgl.createProgramInfo(gl, [constants.commonVertShader, fragShader]);
  initializeBuffer();
}

var drawBuffer;
function initializeBuffer() {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  var vertices = [-1,-1, -1,1, 1,1, 1,-1]; // 4 corners, going in a circle fashion which is what drawing to triangle fan wants
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  
  drawBuffer = buffer;
}

function bindBuffer() {
  gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
  // TODO: get correct location instead of assuming 0
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

function setUniforms(texture) {
  var renderColor = parameters.renderColor();
  var uniforms = {
    u_aspectRatio: parameters.getAspectRatio(),
    u_renderColor: [renderColor[0], renderColor[1], renderColor[2], 1],
    u_brightness: parameters.brightness(),
    u_inverted: parameters.inverted(),
    u_texture0: texture,
  };
  
  twgl.setUniforms(programInfo, uniforms);
}

const fragShader = `#version 300 es
precision mediump float;
in vec2 textureCoord;
out vec4 FragColor;

uniform float u_aspectRatio;
uniform vec4 u_renderColor;
uniform float u_brightness;
uniform bool u_inverted;
uniform sampler2D u_texture0;
void main() {
  float value = texture(u_texture0, textureCoord).r;
  
  value = value * u_brightness;
  
  vec4 blackColor = vec4(0.0);
  vec4 whiteColor = vec4(1.0);

  if (u_inverted)
  {
    blackColor = vec4(1.0);
    whiteColor = vec4(0.0);
  }

  value = value * 2.0;
  if (value < 1.0) {
    FragColor = mix(blackColor, u_renderColor, value - 0.0);
  } else if (value < 2.0) {
    FragColor = mix(u_renderColor, whiteColor, value - 1.0);
  } else if (value < 3.0) {
    FragColor = mix(whiteColor, u_renderColor, value - 2.0); 
  } else {
    FragColor = mix(u_renderColor, blackColor, value - 3.0);
  }
  
  //FragColor = texture(u_texture0, textureCoord);
}
`;