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
    { format: gl.RGBA, mag: gl.NEAREST },
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
    u_antSpeed: 0.0001,
  };
  
  twgl.setUniforms(programInfo, uniforms);
}
  
const fragShader = `#version 300 es
precision mediump float;
in vec2 textureCoord;
out vec4 FragColor;

uniform float u_aspectRatio;
uniform float u_antSpeed;
uniform sampler2D u_antsIn;
uniform sampler2D u_pheremoneIn;

vec2 angleToComponents(float angle) {
  return vec2(sin(angle), cos(angle));
}

float componentsToAngle(vec2 components)
{
  return float(atan(components.x, components.y));
}

vec2 adjustCoords(vec2 coord) {
  return vec2(coord.x*u_aspectRatio, coord.y);
}

vec2 unadjustCoords(vec2 coord) {
  return vec2(coord.x/u_aspectRatio, coord.y);
}

void main() {
  vec4 ant = texture(u_antsIn, textureCoord);
  
  vec2 antPos = adjustCoords(ant.rg); // adjustCoords transforms to the screen aspect ratio
  float antAngle = ant.b;
  float antRandSeed = ant.a;
  
  vec2 antAngleComponents = angleToComponents(antAngle);
  
  antPos += antAngleComponents * u_antSpeed;
  
  if (antPos.x < 0.0 && antAngleComponents.x < 0.0)
    antAngleComponents.x *= -1.0;
  
  if (antPos.y < 0.0 && antAngleComponents.y < 0.0)
    antAngleComponents.y *= -1.0;
  
  if (antPos.x > u_aspectRatio && antAngleComponents.x > 0.0)
    antAngleComponents.x *= -1.0;
  
  if (antPos.y > 1.0 && antAngleComponents.y > 0.0)
    antAngleComponents.y *= -1.0;
  
  // components back to angle
  antAngle = componentsToAngle(antAngleComponents);
  
  // back to square
  antPos = unadjustCoords(antPos);
  
  
  FragColor = vec4(antPos, antAngle, antRandSeed);
}
`;