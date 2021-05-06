"use strict"

var glhelper = {
  
  createProgram: function(vertexSelector, fragmentSelector) {
    var vertexShader = glhelper.createVertexShader(vertexSelector);
    var fragmentShader = glhelper.createFragmentShader(fragmentSelector);
    
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      var linkErrLog = gl.getProgramInfoLog(program);
      throw new Error("Shader program did not link successfully. Error log:\n" + linkErrLog);
    }
    
    return program;
  },
  
  createVertexShader: function (selector) {
    var source = document.querySelector(selector).innerHTML;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader,source);
    gl.compileShader(vertexShader);
    var compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!compiled)
      throw new Error("Vertex shader error for " + selector + ":\n" + gl.getShaderInfoLog(fragmentShader));
    
    return vertexShader;
  },

  createFragmentShader: function(selector) {
    var source = document.querySelector(selector).innerHTML;
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader,source);
    gl.compileShader(fragmentShader);
    var compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!compiled)
      throw new Error("Fragment shader error for " + selector + ":\n" + gl.getShaderInfoLog(fragmentShader));
    
    return fragmentShader;
  },
  
  getRenderingContext: function() {
    var canvas = document.querySelector("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    var gl = canvas.getContext("webgl")
      || canvas.getContext("experimental-webgl");
    if (!gl) 
      throw new Error("Failed to get WebGL context.\nYour browser or device may not support WebGL.");
    
    gl.viewport(0, 0,
      gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
  },
  
};