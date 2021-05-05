"use strict"
window.addEventListener("load", setupWebGL, false);
var gl;
var program;
var paragraph;

function setupWebGL (evt) {
  window.removeEventListener(evt.type, setupWebGL, false);
  
  paragraph = document.querySelector("p");
  
  if (!(gl = getRenderingContext()))
    return;
  
  if (!createProgram())
    return;
  
  initializeAttributes();

  gl.useProgram(program);
  gl.drawArrays(gl.POINTS, 0, 1);

  cleanup();
  
  paragraph.innerHtml = "Ok!";
}

function createVertexShader(selector)
{
  var source = document.querySelector(selector).innerHTML;
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader,source);
  gl.compileShader(vertexShader);
  return vertexShader;
}

function createFragmentShader(selector)
{
  var source = document.querySelector(selector).innerHTML;
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader,source);
  gl.compileShader(fragmentShader);
  return fragmentShader;
}

function createProgram()
{
  var vertexShader = createVertexShader("#vertex-shader");
  var fragmentShader = createFragmentShader("#fragment-shader");
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
      + "Error log: " + linkErrLog;
    return false;
  }
  
  return true;
}

function getRenderingContext() {
  var canvas = document.querySelector("canvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  var gl = canvas.getContext("webgl")
    || canvas.getContext("experimental-webgl");
  if (!gl) {
    paragraph.innerHTML = "Failed to get WebGL context."
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
  gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);
}

function cleanup() {
gl.useProgram(null);
if (buffer)
  gl.deleteBuffer(buffer);
if (program)
  gl.deleteProgram(program);
}