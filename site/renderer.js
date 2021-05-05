"use strict"

var renderer = {
  
  draw: function() {
    gl.useProgram(renderer.program);
    renderer.setUniforms();
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  },
  
  program: null,
  init: function() {
    if (!(renderer.program = glhelper.createProgram("#vertex-shader", "#renderer-fragment-shader")))
      return false;
    
    renderer.initializeVertexBuffer();
    return true;
  },
  
  buffer: null,
  initializeVertexBuffer: function() {
    gl.enableVertexAttribArray(0);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    var vertices = [-1,-1, -1,1, 1,1, 1,-1]; // 4 corners, going in a circle fashion which is what drawing to triangle fan wants
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    renderer.buffer = buffer;
  },
  
  setUniforms: function() {
    var widthLoc = gl.getUniformLocation(renderer.program, "u_width");
    var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    gl.uniform1f(widthLoc, aspectRatio);
    
    var bgColorLoc = gl.getUniformLocation(renderer.program, "u_bgColor");
    var bgColor = wallpaper.properties.bgcolor;
    gl.uniform4f(bgColorLoc, bgColor[0], bgColor[1], bgColor[2], 1);
  },
  
};