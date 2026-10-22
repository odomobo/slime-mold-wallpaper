
var canvas;
export var float32PheremoneSupported = false;
export function getRenderingContext() {
  canvas = document.querySelector("canvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  var gl = canvas.getContext("webgl2");
  if (!gl) 
    throw new Error("Failed to get WebGL context.\nYour browser or device may not support WebGL.");
  
  if (!gl.getExtension('EXT_color_buffer_float'))
    throw new Error("Float buffers not allowed");

  // optional; f32 pheremone needs linear filtering (blur + sensing) and blending (rendering ants)
  float32PheremoneSupported = !!gl.getExtension('OES_texture_float_linear') && !!gl.getExtension('EXT_float_blend');

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