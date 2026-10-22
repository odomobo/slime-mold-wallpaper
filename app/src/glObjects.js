import * as constants from './constants.js';
import * as parameters from './parameters.js';

export var pheremoneActive = null;
export var pheremoneTemp = null;
// downsampled pheremone, used by blurPheremone: pheremoneLevels[level] is 1/2^level the size (index 0 is unused)
export var pheremoneLevels = [];
var pheremoneLastSize = [-1, -1];
var pheremoneLastFloat32 = null;
export var antsActive = null;
export var antsTemp = null;
var antsLastHeight = -1;

export function init() {
  createPheremoneTextures();
  
  createAntsTextures();
}

export function resizeIfNecessary() {
  if (pheremoneLastSize[0] != gl.drawingBufferWidth || pheremoneLastSize[1] != gl.drawingBufferHeight
    || pheremoneLastFloat32 != parameters.pheremoneFloat32())
    resizePheremone();
  
  if (antsLastHeight != parameters.antsTextureHeight())
    resizeAnts();
}

export function swapPheremone() {
  var pheremoneSwap = pheremoneActive;
  pheremoneActive = pheremoneTemp;
  pheremoneTemp = pheremoneSwap;
}

export function swapAnts() {
  var antsSwap = antsActive;
  antsActive = antsTemp;
  antsTemp = antsSwap;
}

function resizePheremone() {
  var oldActive = pheremoneActive;
  var oldSize = pheremoneLastSize;

  if (pheremoneTemp != null)
    gl.deleteTexture(pheremoneTemp);

  createPheremoneTextures()

  // if only the format changed (f16/f32 A/B testing), keep the existing trails
  if (oldActive != null && oldSize[0] == pheremoneLastSize[0] && oldSize[1] == pheremoneLastSize[1])
    copyTexture(oldActive, pheremoneActive, oldSize[0], oldSize[1]);

  if (oldActive != null)
    gl.deleteTexture(oldActive);
}

function copyTexture(src, dst, width, height) {
  var readFrameBuffer = gl.createFramebuffer();
  var drawFrameBuffer = gl.createFramebuffer();

  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, readFrameBuffer);
  gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, src, 0);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, drawFrameBuffer);
  gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dst, 0);

  gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, gl.COLOR_BUFFER_BIT, gl.NEAREST);

  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
  gl.deleteFramebuffer(readFrameBuffer);
  gl.deleteFramebuffer(drawFrameBuffer);
}

function resizeAnts() {
  if (antsActive != null)
    gl.deleteTexture(antsActive);
  
  if (antsTemp != null)
    gl.deleteTexture(antsTemp);
  
  createAntsTextures()
}

function createPheremoneTextures() {
  var float32 = parameters.pheremoneFloat32();
  var pheremoneOptions = {
    width: gl.drawingBufferWidth,
    height: gl.drawingBufferHeight,
    // single channel; R16F is renderable and blendable under EXT_color_buffer_float, same as RGBA16F
    internalFormat: float32 ? gl.R32F : gl.R16F,
    format: gl.RED,
    type: float32 ? gl.FLOAT : gl.HALF_FLOAT,
    //wrap: gl.REPEAT, // TODO: set this programmatically depending on what's being done with the edge; regenerate (or change texture options) when wrapping mode changes
    wrap: gl.CLAMP_TO_EDGE,
    // otherwise twgl generates (never updated) mipmaps for power-of-2 sizes, and samples them
    auto: false,
    min: gl.LINEAR,
    mag: gl.LINEAR,
  };

  pheremoneActive = twgl.createTexture(gl, pheremoneOptions);
  pheremoneTemp = twgl.createTexture(gl, pheremoneOptions);
  createPheremoneLevels(pheremoneOptions);

  pheremoneLastSize = [gl.drawingBufferWidth, gl.drawingBufferHeight];
  pheremoneLastFloat32 = float32;
}

function createPheremoneLevels(pheremoneOptions) {
  for (var level = 1; level < pheremoneLevels.length; level++)
    gl.deleteTexture(pheremoneLevels[level].texture);
  pheremoneLevels = [null];

  // padded, because blurPheremone offsets the pyramid grid by up to 2^maxLevel pixels
  var padding = 1 << constants.pheremoneMaxLevel;
  for (var level = 1; level <= constants.pheremoneMaxLevel; level++) {
    var width = Math.ceil((gl.drawingBufferWidth + padding) / (1 << level));
    var height = Math.ceil((gl.drawingBufferHeight + padding) / (1 << level));
    var options = Object.assign({}, pheremoneOptions, { width: width, height: height });
    pheremoneLevels.push({ texture: twgl.createTexture(gl, options), width: width, height: height });
  }
}

function createAntsTextures() {
  var data = getAntsRandomArray();
  
  antsActive = createAntsTexture(data);
  antsTemp = createAntsTexture(data);
  
  antsLastHeight = parameters.antsTextureHeight();
}

function createAntsTexture(data) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, constants.antsTextureWidth, parameters.antsTextureHeight(), 0, gl.RGBA, gl.FLOAT, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return tex;
}

function getAntsRandomArray() {
  var arr = new Float32Array(parameters.antsTextureSize()*4);
  for (var i = 0; i < parameters.antsTextureSize(); i++)
  {
    arr[i*4 + 0] = Math.random()*.98 + 0.01; // x
    arr[i*4 + 1] = Math.random()*.98 + 0.01; // y
    arr[i*4 + 2] = Math.random(); // angle (this should be from 0 to 1, which translates from 0 to 2*PI)
    arr[i*4 + 3] = Math.random(); // random seed
  }
  
  return arr;
}

