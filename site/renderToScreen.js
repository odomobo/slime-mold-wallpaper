import wallpaperEngine from './wallpaperEngine.js';

export function draw(texture) {
  gl.useProgram(programInfo.program);
  setUniforms(texture);
  bindBuffer();
  twgl.bindFramebufferInfo(gl);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

var programInfo;
export function init() {
  programInfo = twgl.createProgramInfo(gl, ["render-vert", "renderToScreen-frag"]);
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
  var bgColor = wallpaperEngine.bgcolor;
  var uniforms = {
    u_aspectRatio: aspectRatio,
    u_bgColor: [bgColor[0], bgColor[1], bgColor[2], 1],
    u_texture0: texture,
  };
  
  twgl.setUniforms(programInfo, uniforms);
}
