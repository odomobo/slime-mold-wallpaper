import * as constants from './constants.js';

export var pheremoneIn;
export var pheremoneOut;
export var antsIn;
export var antsOut;

export function init() {
  var pheremoneOptions = {
    width: gl.drawingBufferWidth,
    height: gl.drawingBufferHeight,
    format: gl.RGBA,
  };
  
  pheremoneIn = twgl.createTexture(gl, pheremoneOptions);
  pheremoneOut = twgl.createTexture(gl, pheremoneOptions);
  
  createAntsTextures();
}

export function swapPheremone() {
  var pheremoneTemp = pheremoneIn;
  pheremoneIn = pheremoneOut;
  pheremoneOut = pheremoneTemp;
}

export function swapAnts() {
  var antsTemp = antsIn;
  antsIn = antsOut;
  antsOut = antsTemp;
}

function createAntsTextures() {
  var data = getAntsRandomArray();
  
  antsIn = createAntsTexture(data);
  antsOut = createAntsTexture(data);
}

function createAntsTexture(data) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, constants.antsWidth, constants.antsHeight, 0, gl.RGBA, gl.FLOAT, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return tex;
}

function getAntsRandomArray() {
  var arr = new Float32Array(constants.antsSize*4);
  for (var i = 0; i < constants.antsSize; i++)
  {
    arr[i*4 + 0] = Math.random(); // x
    arr[i*4 + 1] = Math.random(); // y
    arr[i*4 + 2] = Math.random()*6.28; // angle
    arr[i*4 + 3] = Math.random(); // random seed
  }
  
  return arr;
}

