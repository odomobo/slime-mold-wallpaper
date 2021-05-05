"use strict"

var glhelper = {
  
  createProgram: function(vertexSelector, fragmentSelector) {
    var vertexShader = glhelper.createVertexShader(vertexSelector);
    if (vertexShader == null)
      return null;
    
    var fragmentShader = glhelper.createFragmentShader(fragmentSelector);
    if (fragmentShader == null)
      return null;
    
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
      cleanup();
      err.innerHTML =
        "Shader program did not link successfully. "
        + "Error log:\n" + linkErrLog;
      return null;
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
    {
      err.innerHTML = "Vertex shader error for " + selector + ":\n" + gl.getShaderInfoLog(fragmentShader);
      return null;
    }
    return vertexShader;
  },

  createFragmentShader: function(selector) {
    var source = document.querySelector(selector).innerHTML;
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader,source);
    gl.compileShader(fragmentShader);
    var compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!compiled)
    {
      err.innerHTML = "Fragment shader error for " + selector + ":\n" + gl.getShaderInfoLog(fragmentShader);
      return null;
    }
    return fragmentShader;
  },
  
  getRenderingContext: function() {
    var canvas = document.querySelector("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    var gl = canvas.getContext("webgl")
      || canvas.getContext("experimental-webgl");
    if (!gl) {
      err.innerHTML = "Failed to get WebGL context.\n"
        + "Your browser or device may not support WebGL.";
      return null;
    }
    gl.viewport(0, 0,
      gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
  },
  
};