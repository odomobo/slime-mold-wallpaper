import * as glhelper from './glhelper.js';
import * as glObjects from './glObjects.js';
import * as testRender from './testRender.js';
import * as renderToScreen from './renderToScreen.js';
import * as renderAnts from './renderAnts.js';
import constants from './constants.js';
import wallpaperEngine from './wallpaperEngine.js';

var err;

function setupWebGL(evt) {
  window.removeEventListener(evt.type, setupWebGL, false);
  
  err = document.querySelector("p");
  
  try {
    gl = glhelper.getRenderingContext();
    
    glObjects.init();
    //testRender.init();
    renderAnts.init();
    renderToScreen.init();
    
    window.requestAnimationFrame(draw);
  } catch (e) {
    err.innerHTML = e.message;
    throw e;
  }
}

function draw() {
  try {
    window.requestAnimationFrame(draw);
    
    if (shouldSkipFrame())
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
}

var last = -1000;
var fpsThreshold = 0;
function shouldSkipFrame() {
  var now = performance.now() / 1000;
  var dt = Math.min(now - last, 1);
  last = now;
  
  if (wallpaperEngine.fps <= 0)
    return false;
  
  fpsThreshold += dt;
  if (fpsThreshold < 1.0 / wallpaperEngine.fps)
      return true;
  
  fpsThreshold -= 1.0 / wallpaperEngine.fps;
  
  return false;
}

window.addEventListener("load", setupWebGL, false);