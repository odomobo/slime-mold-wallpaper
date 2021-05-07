import * as constants from './constants.js';
import * as wallpaperEngine from './wallpaperEngine.js';

export function draw(texture) {
  gl.useProgram(programInfo.program);
  setUniforms();
  bindBuffer();
  bindFrameBuffer(texture);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
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
  frameBufferInfo = twgl.createFramebufferInfo(gl);
}

function bindFrameBuffer(texture) {
  twgl.bindFramebufferInfo(gl, frameBufferInfo);
  
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0; // why??
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, level);
}

function setUniforms() {
  var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  var bgColor = wallpaperEngine.bgcolor;
  var uniforms = {
    u_aspectRatio: aspectRatio,
    u_bgColor: [.8, .8, 1, 1],
  };
  
  twgl.setUniforms(programInfo, uniforms);
}
  
const fragShader = `#version 300 es
precision mediump float;
in vec2 textureCoord;
out vec4 FragColor;

uniform float u_aspectRatio;
uniform vec4 u_bgColor;
void main() {
  vec2 coord = textureCoord;
  coord.x = coord.x * u_aspectRatio;
  
  bool isCorner = false;
  isCorner = isCorner || distance(coord, vec2(0, 0)) < .1;
  isCorner = isCorner || distance(coord, vec2(u_aspectRatio, 0)) < .1;
  isCorner = isCorner || distance(coord, vec2(0, 1)) < .1;
  isCorner = isCorner || distance(coord, vec2(u_aspectRatio, 1)) < .1;
  
  if (isCorner)
    FragColor = vec4(1.0, 1.0, 0.0, 1.0);
  else
    FragColor = u_bgColor;
}
`;