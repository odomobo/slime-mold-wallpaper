"use strict"

var glObjects = {
  
  pheremoneIn: null,
  pheremoneOut: null,
  antsIn: null,
  antsOut: null,
  
  accessedData: null,
  
  init: function() {
    var pheremoneOptions = {
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      format: gl.RGBA,
    };
    
    glObjects.pheremoneIn = twgl.createTexture(gl, pheremoneOptions);
    glObjects.pheremoneOut = twgl.createTexture(gl, pheremoneOptions);
    
    glObjects.createAnts32();
  },
  
  createAnts8: function() {
    var antsOptions = {
      width: constants.antsWidth,
      height: constants.antsHeight,
      min: gl.NEAREST,
      max: gl.NEAREST,
      auto: false,
      //internalFormat: gl.RGBA32F,
      format: gl.RGBA,
      //type: gl.FLOAT,
      src: glObjects.getAntsRandomArray8(),
    };
    
    glObjects.antsIn = twgl.createTexture(gl, antsOptions);
    glObjects.antsOut = twgl.createTexture(gl, antsOptions);
  },
  
  createAnts32: function() {
    var antsOptions = {
      width: constants.antsWidth,
      height: constants.antsHeight,
      min: gl.NEAREST,
      max: gl.NEAREST,
      auto: false,
      internalFormat: gl.RGBA32F,
      format: gl.RGBA,
      type: gl.FLOAT,
      src: glObjects.getAntsRandomArray32(),
    };
    
    //var antsOptions = {
    //  width: constants.antsWidth,
    //  height: constants.antsHeight,
    //  min: gl.NEAREST,
    //  max: gl.NEAREST,
    //  auto: false,
    //  internalFormat: gl.RGBA,
    //  format: gl.RGBA,
    //  type: gl.FLOAT,
    //  src: glObjects.getAntsRandomArray32(),
    //};
    
    //glObjects.antsIn = twgl.createTexture(gl, antsOptions);
    //glObjects.antsOut = twgl.createTexture(gl, antsOptions);
    
    var data = glObjects.getAntsRandomArray32();
    
    glObjects.antsIn = glObjects.createAntsTexture(data);
    glObjects.antsOut = glObjects.createAntsTexture(data);
    
    const format = gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT);
    const type = gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE);
    
    //glObjects.accessedData = new Float32Array(constants.antsSize*4);
    //gl.readPixels(0, 0, constants.antsWidth, constants.antsHeight, format, type, glObjects.accessedData);
  },
  
  createAntsTexture: function(data) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    //var pixels = glObjects.getAntsRandomArray32();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, constants.antsWidth, constants.antsHeight, 0, gl.RGBA, gl.FLOAT,
                  data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return tex;
  },
  
  swap: function() {
    var pheremoneTemp = glObjects.pheremoneIn;
    glObjects.pheremoneIn = glObjects.pheremoneOut;
    glObjects.pheremoneOut = pheremoneTemp;
    
    var antsTemp = glObjects.antsIn;
    glObjects.antsIn = glObjects.antsOut;
    glObjects.antsOut = antsTemp;
  },
  
  // TODO: remove
  randomizeAntsTexture: function(texture, options) {
    var arr = glObjects.getAntsRandomArray();
    twgl.setTextureFromArray(gl, texture, arr, options);
  },
  
  getAntsRandomArray32: function() {
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
  
  getAntsRandomArrayUI32: function() {
    var arr = new Uint32Array(constants.antsSize*4);
    for (var i = 0; i < constants.antsSize; i++)
    {
      arr[i*4 + 0] = Math.random()*1000000000; // x
      arr[i*4 + 1] = Math.random()*1000000000; // y
      arr[i*4 + 2] = Math.random()*1000000000; // angle
      arr[i*4 + 3] = Math.random()*1000000000; // random seed
    }
    
    return arr;
  },
  
  getAntsRandomArray8: function() {
    var arr = new Uint8Array(constants.antsSize*4);
    for (var i = 0; i < constants.antsSize; i++)
    {
      arr[i*4 + 0] = Math.random()*256; // x
      arr[i*4 + 1] = Math.random()*256; // y
      arr[i*4 + 2] = Math.random()*256; // angle
      arr[i*4 + 3] = Math.random()*256; // random seed
    }
    
    return arr;
  },
  
};