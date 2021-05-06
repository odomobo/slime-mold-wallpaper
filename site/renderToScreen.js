"use strict"

var renderToScreen = {
  
  draw: function() {
    gl.useProgram(renderToScreen.program.program);
    renderToScreen.setUniforms();
    gl.bindBuffer(gl.ARRAY_BUFFER, renderToScreen.buffer);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  },
  
  program: null,
  init: function() {
    renderToScreen.program = twgl.createProgramInfo(gl, ["vertex-shader", "renderToScreen-frag"]);
    renderToScreen.initializeVertexBuffer();
  },
  
  buffer: null,
  initializeVertexBuffer: function() {
    gl.enableVertexAttribArray(0);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    var vertices = [-1,-1, -1,1, 1,1, 1,-1]; // 4 corners, going in a circle fashion which is what drawing to triangle fan wants
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    renderToScreen.buffer = buffer;
  },
  
  setUniforms: function() {
    var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    var bgColor = wallpaper.properties.bgcolor;
    var uniforms = {
      u_width: aspectRatio ,
      u_bgColor: [bgColor[0], bgColor[1], bgColor[2], 1],
    };
    
    twgl.setUniforms(renderToScreen.program, uniforms);
  },
  
};