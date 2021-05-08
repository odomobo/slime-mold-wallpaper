
var canvas;
export function getRenderingContext() {
  canvas = document.querySelector("canvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  var gl = canvas.getContext("webgl2");
  if (!gl) 
    throw new Error("Failed to get WebGL context.\nYour browser or device may not support WebGL.");
  
  if (!gl.getExtension('EXT_color_buffer_float'))
    throw new Error("Float buffers not allowed");
  
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return gl;
}
  
export function resizeIfNecessary() {
  if (
    canvas.width == canvas.clientWidth 
    && canvas.height == canvas.clientHeight
  )
    return;
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}