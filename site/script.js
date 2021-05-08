import * as glhelper from './glhelper.js';
import * as glObjects from './glObjects.js';
import * as renderToScreen from './renderToScreen.js';
import * as renderAnts from './renderAnts.js';
import * as moveAnts from './moveAnts.js';
import * as blurPheremone from './blurPheremone.js';
import * as constants from './constants.js';
import * as parameters from './parameters.js';

function setupWebGL(evt) {
  window.removeEventListener(evt.type, setupWebGL, false);
  
  err = document.querySelector("p");
  
  try {
    gl = glhelper.getRenderingContext();
    
    parameters.init();
    glObjects.init();
    blurPheremone.init();
    moveAnts.init();
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
    
    // need to update parameters before resizing!
    parameters.update();
    
    // glObjects needs to be resized after glhelper!
    glhelper.resizeIfNecessary();
    glObjects.resizeIfNecessary();
    
    // each frame, we want to: 
    // 1. blur the pheremone trail, to prepare for moving the ants
    // 2. move the ants
    // 3. draw the ants in their new position, onto the pheremone texture
    // 4. render the pheremone texture to the screen
    
    blurPheremone.draw(glObjects.pheremoneTemp, glObjects.pheremoneActive, 0);
    glObjects.swapPheremone();
    blurPheremone.draw(glObjects.pheremoneTemp, glObjects.pheremoneActive, 1);
    glObjects.swapPheremone();
    
    moveAnts.draw(glObjects.antsTemp, glObjects.antsActive, glObjects.pheremoneActive);
    glObjects.swapAnts();
    
    renderAnts.draw(glObjects.pheremoneActive, glObjects.antsActive, glObjects.antsTemp);
    
    renderToScreen.draw(glObjects.pheremoneActive);
    
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
  
  if (parameters.fps() <= 0)
    return false;
  
  fpsThreshold += dt;
  if (fpsThreshold < 1.0 / parameters.fps())
      return true;
  
  fpsThreshold -= 1.0 / parameters.fps();
  
  // don't queue up frames to render
  if (fpsThreshold > 0.9 / parameters.fps())
    fpsThreshold = 0.9 / parameters.fps();
  
  return false;
}

window.addEventListener("load", setupWebGL, false);