import constants from './constants.js';

export function draw(pheremoneOut, antsIn, antsOut) {
  gl.useProgram(programInfo.program);
  setUniforms(antsIn, antsOut);
  bindBuffer();
  bindFrameBuffer(pheremoneOut);
  gl.drawArrays(gl.LINES, 0, constants.antsSize*2); // 2 points per ant is 1 line per ant
}

var programInfo;
export function init() {
  programInfo = twgl.createProgramInfo(gl, ["renderAnts-vert", "renderAnts-frag"]);
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
  frameBufferInfo = twgl.createFramebufferInfo(gl);
}

function bindFrameBuffer(texture) {
  twgl.bindFramebufferInfo(gl, frameBufferInfo);
  
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0; // why??
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, level);
}

function setUniforms(antsIn, antsOut) {
  var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  
  var uniforms = {
    u_antsIn: antsIn,
    u_antsOut: antsOut,
    u_opacity: 1,
    u_antsHeight: constants.antsHeight,
    u_antsWidth: constants.antsWidth,
    u_antsSize: constants.antsSize,
    u_aspectRatio: aspectRatio,
    u_screenHeight: gl.drawingBufferHeight,
  };
  
  twgl.setUniforms(programInfo, uniforms);
}
