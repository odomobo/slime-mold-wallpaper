import * as constants from './constants.js';
import * as parameters from './parameters.js';

export function draw(pheremoneOut, antsActive, antsLast) {
  resizeFrameBufferInfoIfNecessary();
  bindFrameBuffer(pheremoneOut);
  
  gl.useProgram(programInfo.program);
  setUniforms(antsActive, antsLast);
  updateBufferDataIfNecessary();
  bindBuffer();
  
  gl.enable(gl.BLEND);
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // normal blending
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // attitive blending
  gl.drawArrays(gl.LINES, 0, parameters.antsTextureSize()*2); // 2 points per ant is 1 line per ant
  gl.flush();
  
  
  unbindFrameBuffer();
  gl.disable(gl.BLEND);
}

var programInfo;
export function init() {
  programInfo = twgl.createProgramInfo(gl, [vertShader, fragShader]);
  initializeFrameBufferInfo();
  initializeBuffer();
}

var drawBuffer;
function initializeBuffer() {
  drawBuffer = gl.createBuffer();
  updateBufferDataIfNecessary();
}

var lastAntsTextureSize = -1;
function updateBufferDataIfNecessary() {
  if (lastAntsTextureSize == parameters.antsTextureSize())
    return;
  
  var vertices = new Float32Array(parameters.antsTextureSize()*4);
  for (var i = 0; i < parameters.antsTextureSize(); i++) {
    for (var j = 0; j < 2; j++) {
      vertices[i*4 + j*2 + 0] = i;
      vertices[i*4 + j*2 + 1] = j;
    }
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  lastAntsTextureSize = parameters.antsTextureSize();
}

function bindBuffer() {
  gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
  // TODO: get correct location instead of assuming 0
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

var frameBufferInfo;
function initializeFrameBufferInfo() {
  // TODO: currently unused; can I use this to get blending working?
  const attachments = [
    { format: gl.RGBA, mag: gl.LINEAR },
  ];
  frameBufferInfo = twgl.createFramebufferInfo(gl);
}

function resizeFrameBufferInfoIfNecessary() {
  if (frameBufferInfo.width != gl.drawingBufferWidth || frameBufferInfo.height != gl.drawingBufferHeight)
    twgl.resizeFramebufferInfo(gl, frameBufferInfo);
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


function setUniforms(antsActive, antsLast) {
  var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight; // TODO: calculate this in parameters???
  
  var uniforms = {
    u_antsActive: antsActive,
    u_antsLast: antsLast,
    u_opacity: parameters.antOpacity(),
    u_antsHeight: parameters.antsTextureHeight(),
    u_antsWidth: constants.antsTextureWidth,
    u_antsSize: parameters.antsTextureSize(),
    u_aspectRatio: aspectRatio,
    u_screenHeight: gl.drawingBufferHeight,
    u_numberOfAnts: parameters.numberOfAnts(),
  };
  
  twgl.setUniforms(programInfo, uniforms);
}

const vertShader = `#version 300 es
const vec2 madd=vec2(0.5,0.5);
in vec2 vertexIn;
out float adjustedOpacity;
out vec2 textureCoord;

uniform sampler2D u_antsActive;
uniform sampler2D u_antsLast;
uniform float u_opacity;
uniform int u_antsHeight;
uniform int u_antsWidth;
uniform int u_antsSize;
uniform float u_aspectRatio;
uniform int u_screenHeight;
uniform int u_numberOfAnts;

const float PI = 3.1415926535897932384626433832795;

// ant variables; see documentation.md to see how these are stored in the texture.
vec2 antPos; // always the adjusted value
uint antState;
float antAngle;
uint antRandomSeed;

vec2 angleToComponents(float angle) {
  return vec2(sin(angle), cos(angle));
}

vec2 adjustCoords(vec2 coord) {
  return vec2(coord.x*u_aspectRatio, coord.y);
}

vec2 unadjustCoords(vec2 coord) {
  return vec2(coord.x/u_aspectRatio, coord.y);
}

void storeAntVariables(vec4 ant) {
  antPos = adjustCoords(ant.rg); // adjustCoords transforms to the screen aspect ratio
  float antStateF;
  antAngle = modf(ant.b, antStateF)*2.0*PI;
  // make sure this is from 0 to 1
  if (antAngle < 0.0)
    antAngle += 1.0;
  antState = uint(antStateF);
  antRandomSeed = floatBitsToUint(ant.a);
}

float adjustOpacity(float opacity, float angle)
{
  //return opacity;
  vec2 components = angleToComponents(angle);
  float maxComponent = max(abs(components.x), abs(components.y));
  return opacity / maxComponent; // max component determines how many pixels are drawn; we want the inverse of this for opacity
}

void main() {
  int antIndex = int(vertexIn.x);
  float textureIndex = vertexIn.y;
  
  // don't draw any more ants than the user requested
  if (antIndex >= u_numberOfAnts)
  {
    textureCoord = vec2(-10.0, -10.0);
    gl_Position = vec4(-10.0, -10.0, 0.0, 1.0);
    return;
  }
  
  int antXCoordIndex = antIndex/u_antsHeight;
  float antXCoord = (0.5 + float(antXCoordIndex)) / float(u_antsWidth);
  
  int antYCoordIndex = antIndex%u_antsHeight;
  float antYCoord = (0.5 + float(antYCoordIndex)) / float(u_antsHeight);
  
  
  if (textureIndex == 0.0)
    storeAntVariables(texture(u_antsActive, vec2(antXCoord, antYCoord)));
  else
    storeAntVariables(texture(u_antsLast, vec2(antXCoord, antYCoord)));
  
  adjustedOpacity = adjustOpacity(u_opacity, antAngle);
  
  // back to square when setting the position
  textureCoord = unadjustCoords(antPos);
  gl_Position = vec4((textureCoord*2.0-1.0), 0.0, 1.0);
}
`;


const fragShader = `#version 300 es
precision mediump float;
in float adjustedOpacity;
in vec2 textureCoord;
out vec4 FragColor;


void main() {
  FragColor = vec4(1, 1, 1, adjustedOpacity);
}
`;