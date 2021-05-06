"use strict"

var err;
var gl;

var script = {
  
  setupWebGL: function(evt) {
    window.removeEventListener(evt.type, script.setupWebGL, false);
    
    err = document.querySelector("p");
    
    try {
      gl = glhelper.getRenderingContext();
      
      glObjects.init();
      //testRender.init();
      renderAnts.init();
      renderToScreen.init();
      
      window.requestAnimationFrame(script.draw);
    } catch (e) {
      err.innerHTML = e.message;
      throw e;
    }
  },

  draw: function() {
    try {
      window.requestAnimationFrame(script.draw);
      
      if (script.shouldSkipFrame())
        return;
      
      //glObjects.swap();
      
      //var pheremoneOut = glObjects.pheremoneOut;
      
      renderAnts.draw(glObjects.pheremoneOut, glObjects.antsIn, glObjects.antsOut);
      //testRender.draw(glObjects.pheremoneOut);
      renderToScreen.draw(glObjects.pheremoneOut);
      
    } catch (e) {
      err.innerHTML = e.message;
      throw e;
    }
  },

  last: -1000,
  fpsThreshold: 0,
  shouldSkipFrame: function () {
    var now = performance.now() / 1000;
    var dt = Math.min(now - script.last, 1);
    script.last = now;
    
    if (wallpaper.properties.fps <= 0)
      return false;
    
    script.fpsThreshold += dt;
    if (script.fpsThreshold < 1.0 / wallpaper.properties.fps)
        return true;
    
    script.fpsThreshold -= 1.0 / wallpaper.properties.fps;
    
    return false;
  },

};

window.addEventListener("load", script.setupWebGL, false);