import * as glhelper from './glhelper.js';
import * as glObjects from './glObjects.js';
import * as testRender from './testRender.js';
import * as renderToScreen from './renderToScreen.js';
import * as renderAnts from './renderAnts.js';
import * as moveAnts from './moveAnts.js';
import * as constants from './constants.js';
import wallpaperEngine from './wallpaperEngine.js';

var err;

function setupWebGL(evt) {
  window.removeEventListener(evt.type, setupWebGL, false);
  
  err = document.querySelector("p");
  
  try {
    gl = glhelper.getRenderingContext();
    
    glObjects.init();
    //testRender.init();
    moveAnts.init();
    renderAnts.init();
    renderToScreen.init();
    
    window.requestAnimationFrame(draw);
  } catch (e) {
    err.innerHTML = e.message;
    throw e;
  }
}

var firstDraw = true;
function draw() {
  try {
    window.requestAnimationFrame(draw);
    
    if (shouldSkipFrame())
      return;
    
    //glObjects.swapPheremone();
    glObjects.swapAnts();
    
    //var pheremoneOut = glObjects.pheremoneOut;
    
    moveAnts.draw(glObjects.antsOut, glObjects.antsIn, glObjects.pheremoneIn);
    renderAnts.draw(glObjects.pheremoneOut, glObjects.antsIn, glObjects.antsOut);
    //testRender.draw(glObjects.pheremoneOut);
    renderToScreen.draw(glObjects.pheremoneOut);
    
    if (firstDraw)
    {
      // this allows only one frame to be rendered on the first draw, and then it needs to wait for the next one
      fpsThreshold = 0;
      firstDraw = false;
    }
    
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