import * as constants from './constants.js';
import wallpaperEngine from './wallpaperEngine.js';

export function draw(antsOut, antsIn, pheremoneIn) {
  bindFrameBuffer(antsOut);
  
  gl.useProgram(programInfo.program);
  setUniforms(antsIn, pheremoneIn);
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
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
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
  const attachments = [
    { format: gl.RGBA32F, mag: gl.NEAREST },
  ];
  frameBufferInfo = twgl.createFramebufferInfo(gl, attachments, constants.antsWidth, constants.antsHeight);
}

function bindFrameBuffer(antsOut) {
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0; // why??
  
  twgl.bindFramebufferInfo(gl, frameBufferInfo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, antsOut, level);
}

function unbindFrameBuffer() {
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0; // why??

  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, null, level);
  twgl.bindFramebufferInfo(gl);
}

function setUniforms(antsIn, pheremoneIn) {
  var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  var uniforms = {
    u_antsIn: antsIn,
    u_antsOut: pheremoneIn,
    u_aspectRatio: aspectRatio,
  };
  
  twgl.setUniforms(programInfo, uniforms);
}
  
const fragShader = `#version 300 es
precision mediump float;
in vec2 textureCoord;
out vec4 FragColor;

uniform float u_aspectRatio;
uniform sampler2D u_antsIn;
uniform sampler2D u_pheremoneIn;

vec2 angleToComponents(float angle) {
  return vec2(sin(angle), cos(angle));
}

vec2 adjustCoords(vec2 coord) {
  return vec2(coord.x, coord.y*u_aspectRatio);
}

vec2 unadjustCoords(vec2 coord) {
  return vec2(coord.x, coord.y/u_aspectRatio);
}

void main() {
  vec4 ant = texture(u_antsIn, textureCoord);
  
  vec2 antPos = adjustCoords(ant.rg); // adjustCoords transforms to the screen aspect ratio
  float antAngle = ant.b;
  float antRandSeed = ant.a;
  
  vec2 antAngleComponents = angleToComponents(antAngle);
  
  antPos += antAngleComponents * 0.001;
  
  // back to square
  antPos = unadjustCoords(antPos);
  
  
  FragColor = vec4(antPos, antAngle, antRandSeed);
}
`;