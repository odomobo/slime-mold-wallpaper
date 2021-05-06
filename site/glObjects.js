"use strict"

var glObjects = {
  
  pheremoneIn: null,
  pheremoneOut: null,
  antsIn: null,
  antsOut: null,
  
  init: function() {
    var pheremoneOptions = {
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      format: gl.RGBA,
    };
    
    glObjects.pheremoneIn = twgl.createTexture(gl, pheremoneOptions);
    glObjects.pheremoneOut = twgl.createTexture(gl, pheremoneOptions);
    
    glObjects.createAntsTextures();
  },
  
  swap: function() {
    var pheremoneTemp = glObjects.pheremoneIn;
    glObjects.pheremoneIn = glObjects.pheremoneOut;
    glObjects.pheremoneOut = pheremoneTemp;
    
    var antsTemp = glObjects.antsIn;
    glObjects.antsIn = glObjects.antsOut;
    glObjects.antsOut = antsTemp;
  },
  
  createAntsTextures: function() {
    var data = glObjects.getAntsRandomArray();
    
    glObjects.antsIn = glObjects.createAntsTexture(data);
    glObjects.antsOut = glObjects.createAntsTexture(data);
  },
  
  createAntsTexture: function(data) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, constants.antsWidth, constants.antsHeight, 0, gl.RGBA, gl.FLOAT,
                  data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return tex;
  },
  
  getAntsRandomArray: function() {
    var arr = new Float32Array(constants.antsSize*4);
    for (var i = 0; i < constants.antsSize; i++)
    {
      arr[i*4 + 0] = Math.random(); // x
      arr[i*4 + 1] = Math.random(); // y
      arr[i*4 + 2] = Math.random()*6.28; // angle
      arr[i*4 + 3] = Math.random(); // random seed
    }
    
    return arr;
  },
  
  
};