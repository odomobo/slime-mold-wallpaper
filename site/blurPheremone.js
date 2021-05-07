import * as constants from './constants.js';

export function draw(pheremoneOut, pheremoneIn, passNumber) {
  bindFrameBuffer(pheremoneOut);
  
  gl.useProgram(programInfo.program);
  setUniforms(pheremoneIn, passNumber);
  bindBuffer();
  
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  gl.flush();
  
  unbindFrameBuffer();
}

var programInfo;
export function init() {
  programInfo = twgl.createProgramInfo(gl, [constants.commonVertShader, fragShader]);
  initializeFrameBufferInfo();
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

var frameBufferInfo;
function initializeFrameBufferInfo() {
  frameBufferInfo = twgl.createFramebufferInfo(gl);
}

function bindFrameBuffer(texture) {
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0; // why??

  twgl.bindFramebufferInfo(gl, frameBufferInfo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, level);
}

function unbindFrameBuffer() {
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0; // why??
  
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, null, level);
  twgl.bindFramebufferInfo(gl);
}


function setUniforms(pheremoneIn, passNumber) {
  var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  
  var uniforms = {
    u_pheremoneIn: pheremoneIn,
    u_aspectRatio: aspectRatio,
    u_passNumber: passNumber,
    u_resolution: [gl.drawingBufferWidth, gl.drawingBufferHeight],
    u_blurAmount: 0.1,
    u_dissipation: 0.01,
  };
  
  twgl.setUniforms(programInfo, uniforms);
}


const fragShader = `#version 300 es
precision mediump float;
in vec2 textureCoord;
out vec4 FragColor;

vec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3333333333333333) * direction;
  color += texture(image, uv) * 0.29411764705882354;
  color += texture(image, uv + (off1 / resolution)) * 0.35294117647058826;
  color += texture(image, uv - (off1 / resolution)) * 0.35294117647058826;
  return color; 
}

vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture(image, uv) * 0.2270270270;
  color += texture(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}

uniform sampler2D u_pheremoneIn;
uniform float u_aspectRatio;
uniform int u_passNumber;
uniform vec2 u_resolution;
uniform float u_blurAmount;
uniform float u_dissipation;
void main() {
  vec2 direction;
  if (u_passNumber == 0)
    direction = vec2(1.0, 0.0);
  else
    direction = vec2(0.0, 1.0);
  
  vec4 originalValue = texture(u_pheremoneIn, textureCoord);
  vec4 blurredValue = blur9(u_pheremoneIn, textureCoord, u_resolution, direction);
  FragColor = mix(originalValue, blurredValue, u_blurAmount) * (1.0-u_dissipation);
  //FragColor = blurredValue;
  //FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;