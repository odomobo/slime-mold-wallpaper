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
  var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  var renderColor = parameters.renderColor();
  var uniforms = {
    u_aspectRatio: aspectRatio,
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
  
  if (u_inverted)
    value = 1.0 - value;
  
  if (value < 0.5) {
    float scaledValue = value*2.0;
    FragColor = mix(vec4(0.0), u_renderColor, scaledValue);
  } else {
    float scaledValue = (value-0.5)*2.0;
    FragColor = mix(u_renderColor, vec4(1.0), scaledValue);
  }
  
  //FragColor = texture(u_texture0, textureCoord);
}
`;