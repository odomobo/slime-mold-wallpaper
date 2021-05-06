"use strict"

var testRender = {
  
  draw: function(texture) {
    gl.useProgram(testRender.programInfo.program);
    testRender.setUniforms();
    gl.bindBuffer(gl.ARRAY_BUFFER, testRender.buffer);
    testRender.bindFrameBuffer(texture);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  },
  
  programInfo: null,
  init: function() {
    testRender.programInfo = twgl.createProgramInfo(gl, ["vertex-shader", "testRender-frag"]);
    testRender.initializeFrameBufferInfo();
    testRender.initializeVertexBuffer();
  },
  
  buffer: null,
  initializeVertexBuffer: function() {
    gl.enableVertexAttribArray(0);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    var vertices = [-1,-1, -1,1, 1,1, 1,-1]; // 4 corners, going in a circle fashion which is what drawing to triangle fan wants
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    testRender.buffer = buffer;
  },
  
  frameBufferInfo: null,
  initializeFrameBufferInfo: function() {
    testRender.frameBufferInfo = twgl.createFramebufferInfo(gl);
  },
  
  bindFrameBuffer: function(texture) {
    twgl.bindFramebufferInfo(gl, testRender.frameBufferInfo);
    
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0; // why??
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, level);
  },
  
  setUniforms: function() {
    var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    var bgColor = wallpaper.properties.bgcolor;
    var uniforms = {
      u_width: aspectRatio,
      u_bgColor: [.8, .8, 1, 1],
    };
    
    twgl.setUniforms(testRender.programInfo, uniforms);
  },
  
};