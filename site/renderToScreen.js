"use strict"

var renderToScreen = {
  
  draw: function(texture) {
    gl.useProgram(renderToScreen.programInfo.program);
    renderToScreen.setUniforms(texture);
    renderToScreen.bindBuffer();
    twgl.bindFramebufferInfo(gl);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  },
  
  programInfo: null,
  init: function() {
    renderToScreen.programInfo = twgl.createProgramInfo(gl, ["render-vert", "renderToScreen-frag"]);
    renderToScreen.initializeBuffer();
  },
  
  drawBuffer: null,
  initializeBuffer: function() {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    var vertices = [-1,-1, -1,1, 1,1, 1,-1]; // 4 corners, going in a circle fashion which is what drawing to triangle fan wants
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    renderToScreen.drawBuffer = buffer;
  },
  
  bindBuffer: function() {
    gl.bindBuffer(gl.ARRAY_BUFFER, renderToScreen.drawBuffer);
    // TODO: get correct location instead of assuming 0
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  },
  
  setUniforms: function(texture) {
    var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    var bgColor = wallpaper.properties.bgcolor;
    var uniforms = {
      u_aspectRatio: aspectRatio,
      u_bgColor: [bgColor[0], bgColor[1], bgColor[2], 1],
      u_texture0: texture,
    };
    
    twgl.setUniforms(renderToScreen.programInfo, uniforms);
  },
  
};