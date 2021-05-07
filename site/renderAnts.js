import * as constants from './constants.js';

export function draw(pheremoneOut, antsIn, antsOut) {
  bindFrameBuffer(pheremoneOut);
  
  gl.useProgram(programInfo.program);
  setUniforms(antsIn, antsOut);
  bindBuffer();
  
  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.drawArrays(gl.LINES, 0, constants.antsSize*2); // 2 points per ant is 1 line per ant
  gl.flush();
  
  unbindFrameBuffer();
}

var programInfo;
export function init() {
  programInfo = twgl.createProgramInfo(gl, [vertShader, fragShader]);
  initializeFrameBufferInfo();
  initializeBuffer();
}

var drawBuffer;
function initializeBuffer() {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  
  var vertices = new Float32Array(constants.antsSize*4);
  for (var i = 0; i < constants.antsSize; i++) {
    for (var j = 0; j < 2; j++) {
      vertices[i*4 + j*2 + 0] = i;
      vertices[i*4 + j*2 + 1] = j;
    }
  }
  
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
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
  // TODO: currently unused; can I use this to get blending working?
  const attachments = [
    { format: gl.RGBA, mag: gl.LINEAR },
  ];
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


function setUniforms(antsIn, antsOut) {
  var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  
  var uniforms = {
    u_antsIn: antsIn,
    u_antsOut: antsOut,
    u_opacity: 1.0, // why doesnt this work?
    u_antsHeight: constants.antsHeight,
    u_antsWidth: constants.antsWidth,
    u_antsSize: constants.antsSize,
    u_aspectRatio: aspectRatio,
    u_screenHeight: gl.drawingBufferHeight,
  };
  
  twgl.setUniforms(programInfo, uniforms);
}

const vertShader = `#version 300 es
const vec2 madd=vec2(0.5,0.5);
in vec2 vertexIn;
out vec2 textureCoord;

uniform sampler2D u_antsIn;
uniform sampler2D u_antsOut;
uniform int u_antsHeight;
uniform int u_antsWidth;
uniform int u_antsSize;
uniform float u_aspectRatio;
uniform int u_screenHeight;

vec2 angleToComponents(float angle) {
  return vec2(sin(angle), cos(angle));
}

float getPixelSize() {
  return 1.0 / float(u_screenHeight);
}

float getRoot2PixelSize() {
  return getPixelSize() * sqrt(2.0);
}

vec2 adjustCoords(vec2 coord) {
  return vec2(coord.x, coord.y*u_aspectRatio);
}

vec2 unadjustCoords(vec2 coord) {
  return vec2(coord.x, coord.y/u_aspectRatio);
}

void main() {
  int antIndex = int(vertexIn.x);
  float textureIndex = vertexIn.y;
  
  // only render 128 for now
  // TODO: make this configurable
  if (antIndex >= 1000)
  {
    textureCoord = vec2(-10.0, -10.0);
    gl_Position = vec4(-10.0, -10.0, 0.0, 1.0);
    return;
  }
  
  int antXCoordIndex = antIndex/u_antsHeight;
  float antXCoord = (0.5 + float(antXCoordIndex)) / float(u_antsWidth);
  
  int antYCoordIndex = antIndex%u_antsHeight;
  float antYCoord = (0.5 + float(antYCoordIndex)) / float(u_antsHeight);
  
  
  vec4 ant;
  if (textureIndex == 0.0)
    ant = texture(u_antsIn, vec2(antXCoord, antYCoord));
  else
    ant = texture(u_antsOut, vec2(antXCoord, antYCoord));
    
  vec2 antPos = adjustCoords(ant.rg); // adjustCoords transforms to the screen aspect ratio
  float antAngle = ant.b;
  float antRandSeed = ant.a;
  
  vec2 antAngleComponents = angleToComponents(antAngle);
  
  // This is a crazy hack to make sure tiny line segments are drawn. 
  // Near-0-length line segments aren't drawn, so we want to give each line segment at least root 2 length.
  if (textureIndex == 0.0)
  {
    antPos -= antAngleComponents * getRoot2PixelSize();
  }
  
  // back to square
  antPos = unadjustCoords(antPos);
  
  textureCoord = antPos;
  //gl_Position = vec4((textureCoord*1.8-0.9), 0.0, 1.0); // this is the wrong thing, but for testing purposes
  gl_Position = vec4((textureCoord*2.0-1.0), 0.0, 1.0);
}
`;


const fragShader = `#version 300 es
precision mediump float;
in vec2 textureCoord;
out vec4 FragColor;

uniform float u_opacity;
void main() {
  FragColor = vec4(1, 1, 1, u_opacity);
}
`;