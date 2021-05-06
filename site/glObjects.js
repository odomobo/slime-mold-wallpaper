"use strict"

var glObjects = {
  
  pheremoneOut: null,
  
  init: function() {
    var pheremoneOptions = {
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
    };
    
    var pheremoneOut = twgl.createTexture(gl, pheremoneOptions);
    
    glObjects.pheremoneOut = pheremoneOut;
  },
  
};