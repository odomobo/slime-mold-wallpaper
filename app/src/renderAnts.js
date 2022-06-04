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
  var uniforms = {
    u_antsActive: antsActive,
    u_antsLast: antsLast,
    u_opacity: parameters.antOpacity(),
    u_antsHeight: parameters.antsTextureHeight(),
    u_antsWidth: constants.antsTextureWidth,
    u_antsSize: parameters.antsTextureSize(),
    u_antDistancePerFrame: parameters.antDistancePerFrame(),
    u_aspectRatio: parameters.getAspectRatio(),
    u_screenHeight: gl.drawingBufferHeight,
    u_numberOfAnts: parameters.numberOfAnts(),
  };
  
  twgl.setUniforms(programInfo, uniforms);
}

const vertShader = `#version 300 es` +
constants.commonShaderLibrary +
`
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
uniform float u_antDistancePerFrame;
uniform float u_aspectRatio;
uniform int u_screenHeight;
uniform int u_numberOfAnts;

const float DISTANCE_FUDGE_FACTOR = 1.1;

Ant antLast;
Ant antActive;

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
  
  antLast = vec4ToAnt(texture(u_antsActive, vec2(antXCoord, antYCoord)), u_aspectRatio);
  antActive = vec4ToAnt(texture(u_antsLast, vec2(antXCoord, antYCoord)), u_aspectRatio);
  
  // if we've moved further than possible, then we teleported which means we shouldn't draw this frame
  float movedDistance = distance(antLast.pos, antActive.pos);
  if (movedDistance > u_antDistancePerFrame*DISTANCE_FUDGE_FACTOR)
  {
    textureCoord = vec2(-10.0, -10.0);
    gl_Position = vec4(-10.0, -10.0, 0.0, 1.0);
    return;
  }
  
  adjustedOpacity = adjustOpacity(u_opacity, antLast.angle);
  
  // back to square when setting the position
  if (textureIndex == 0.0)
    textureCoord = unadjustCoords(antLast.pos, u_aspectRatio);
  else
    textureCoord = unadjustCoords(antActive.pos, u_aspectRatio);
  
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