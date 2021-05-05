"use strict"
window.addEventListener("load", setupWebGL, false);

var paragraph;
function setupWebGL (evt) {
  window.removeEventListener(evt.type, setupWebGL, false);
  
  paragraph = document.querySelector("p");
  
  try {
    if (!(gl = getRenderingContext()))
      return;
    
    if (!createProgram())
      return;
    
    initializeAttributes();
    gl.useProgram(program);
    
    setUniforms();
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    cleanup();
    
    paragraph.innerHtml = "Ok!";
  } catch (e) {
    paragraph.innerHtml = e.message;
  }
}

function createVertexShader(selector) {
  var source = document.querySelector(selector).innerHTML;
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader,source);
  gl.compileShader(vertexShader);
  var compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (!compiled)
  {
    paragraph.innerHTML = "Vertex shader error for " + selector + ":\n" + gl.getShaderInfoLog(fragmentShader);
    return null;
  }
  return vertexShader;
}

function createFragmentShader(selector) {
  var source = document.querySelector(selector).innerHTML;
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader,source);
  gl.compileShader(fragmentShader);
  var compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (!compiled)
  {
    paragraph.innerHTML = "Fragment shader error for " + selector + ":\n" + gl.getShaderInfoLog(fragmentShader);
    return null;
  }
  return fragmentShader;
}

var program;
function createProgram() {
  var vertexShader = createVertexShader("#vertex-shader");
  if (vertexShader == null)
    return false;
  
  var fragmentShader = createFragmentShader("#fragment-shader");
  if (fragmentShader == null)
    return false;
  
  program = gl.createProgram();
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
    paragraph.innerHTML =
      "Shader program did not link successfully. "
      + "Error log:\n" + linkErrLog;
    return false;
  }
  
  return true;
}

var gl;
function getRenderingContext() {
  var canvas = document.querySelector("canvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  var gl = canvas.getContext("webgl")
    || canvas.getContext("experimental-webgl");
  if (!gl) {
    paragraph.innerHTML = "Failed to get WebGL context.\n"
      + "Your browser or device may not support WebGL.";
    return null;
  }
  gl.viewport(0, 0,
    gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return gl;
}

var buffer;
function initializeAttributes() {
  gl.enableVertexAttribArray(0);
  buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  var vertices = [-1,-1, -1,1, 1,1, 1,-1]; // 4 corners, going in a circle fashion which is what drawing to triangle fan wants
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function setUniforms() {
  var widthLoc = gl.getUniformLocation(program, "u_width");
  var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  gl.uniform1f(widthLoc, aspectRatio);
  
  var bgColorLoc = gl.getUniformLocation(program, "u_bgColor");
  gl.uniform4f(bgColorLoc, 0, 1, 0, 1);
}

function cleanup() {
gl.useProgram(null);
if (buffer)
  gl.deleteBuffer(buffer);
if (program)
  gl.deleteProgram(program);
}