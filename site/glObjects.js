import * as constants from './constants.js';

export var pheremoneActive = null;
export var pheremoneTemp = null;
var pheremoneLastSize = [-1, -1];
export var antsActive = null;
export var antsTemp = null;
var antsLastHeight = -1;

export function init() {
  createPheremoneTextures();
  
  createAntsTextures();
}

export function resizeIfNecessary() {
  if (pheremoneLastSize[0] != gl.drawingBufferWidth || pheremoneLastSize[1] != gl.drawingBufferHeight)
    resizePheremone();
  
  if (antsLastHeight != constants.antsTextureHeight)
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
  if (pheremoneActive != null)
    gl.deleteTexture(pheremoneActive);
  
  if (pheremoneTemp != null)
    gl.deleteTexture(pheremoneTemp);
  
  createPheremoneTextures()
}

function resizeAnts() {
  if (antsActive != null)
    gl.deleteTexture(antsActive);
  
  if (antsTemp != null)
    gl.deleteTexture(antsTemp);
  
  createAntsTextures()
}

function createPheremoneTextures() {
  var pheremoneOptions = {
    width: gl.drawingBufferWidth,
    height: gl.drawingBufferHeight,
    internalFormat: gl.RGBA16F,
    format: gl.RGBA,
    type: gl.HALF_FLOAT,
  };
  
  pheremoneActive = twgl.createTexture(gl, pheremoneOptions);
  pheremoneTemp = twgl.createTexture(gl, pheremoneOptions);
  
  pheremoneLastSize = [gl.drawingBufferWidth, gl.drawingBufferHeight];
}

function createAntsTextures() {
  var data = getAntsRandomArray();
  
  antsActive = createAntsTexture(data);
  antsTemp = createAntsTexture(data);
  
  antsLastHeight = constants.antsTextureHeight;
}

function createAntsTexture(data) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, constants.antsTextureWidth, constants.antsTextureHeight, 0, gl.RGBA, gl.FLOAT, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return tex;
}

function getAntsRandomArray() {
  var arr = new Float32Array(constants.antsTextureSize*4);
  for (var i = 0; i < constants.antsTextureSize; i++)
  {
    arr[i*4 + 0] = Math.random(); // x
    arr[i*4 + 1] = Math.random(); // y
    arr[i*4 + 2] = Math.random()*2*Math.PI; // angle
    arr[i*4 + 3] = Math.random(); // random seed
  }
  
  return arr;
}

