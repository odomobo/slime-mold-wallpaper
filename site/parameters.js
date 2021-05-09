import * as constants from './constants.js';
import * as wallpaperEngine from './wallpaperEngine.js';

var startTimeMs;
export function init() {
  // TODO: logic to prevent smooth transition during the first 100ms or so, and instead do instant transitions
  startTimeMs = performance.now();
  initialUpdate();
}

const initializationPeriodMs = 100;
function isInInitializationPeriod() {
  var elapsedTimeMs = performance.now()-startTimeMs;
  return elapsedTimeMs <= initializationPeriodMs;
}

export function update() {
  // Logic to prevent smooth transition during the first 100ms or so, and instead do instant transitions.
  // This is because we want to wait until wallpaper engine has sent its inital update.
  // TODO: instead have wallpaperEngine mark when it's received its first update, and then use that information.
  // TODO: We also have to keep track of when we received the first update from wallpaperEngine so we don't transition to the initial update
  if (isInInitializationPeriod())
  {
    initialUpdate();
    return;
  }
  
  // TODO:
  var randomnessEnabled = false;
  if (randomnessEnabled)
    ongoingUpdate();
  else
    initialUpdate();
}

function initialUpdate() {
  targetRenderColor = wallpaperEngine.renderColor;
  targetBrightness = wallpaperEngine.brightness;

  targetBlurAmount = wallpaperEngine.blurAmount;
  targetDissipation = wallpaperEngine.dissipation;
  targetAntSpeed = wallpaperEngine.antSpeed;
  targetAntOpacity = wallpaperEngine.antOpacity;

  targetRotationSpeed = wallpaperEngine.rotationSpeed;
  targetSenseAngle = wallpaperEngine.senseAngle;
  targetSenseLead = wallpaperEngine.senseLead;
}

// This means: get 90% of the way there in 1 second.
const transitionTimeSeconds = 1;
const transitionAmount = 0.9;
function getTransitionAmountPerFrame() {
  var transitionDistance = 1 - transitionAmount; // this is how far we want to be from the target after transition time.
  var transitionFrames = wallpaperEngine.fps * transitionTimeSeconds;
  
  // If we want to be at a .1 difference after 30 frames, then we want the 30th root of 0.1, or 0.93 .
  // If we reduce the distance from the target to 0.93 every frame, then by 1 second, we'll have a distance of ~0.1 .
  var transitionDistancePerFrame = Math.pow(transitionDistance, 1/transitionFrames);
  
  // if we want the distance to be 0.93 per frame, then we want to only adjust by 0.07 per frame.
  var transitionAmountPerFrame = 1 - transitionDistancePerFrame;
  return transitionAmountPerFrame;
}

function ongoingUpdate() {
  // TODO
  throw new Error("Not yet implemented");
}


var targetRenderColor;
var targetBrightness;

var targetBlurAmount;
var targetDissipation;
var targetAntSpeed;
var targetAntOpacity;

var targetRotationSpeed;
var targetSenseAngle;
var targetSenseLead;


export function antsTextureHeight() {
  return Math.ceil(wallpaperEngine.numberOfAnts / constants.antsTextureWidth);
}

export function antsTextureSize() {
  return antsTextureHeight() * constants.antsTextureWidth;
}

export function fps(){return wallpaperEngine.fps;};

export function renderColor(){return targetRenderColor;} // TODO: this needs to be more sophisticated, converting hsv to rgb
export function brightness(){return targetBrightness;}
export function inverted(){return wallpaperEngine.inverted;}

export function blurAmountPerFrame() {
    var blurAmount = targetBlurAmount / wallpaperEngine.fps;
    if (blurAmount < 1)
      return blurAmount;
    else
      return 1;
}
export function dissipationPerFrame(){return targetDissipation / wallpaperEngine.fps;}
export function antDistancePerFrame(){return targetAntSpeed / wallpaperEngine.fps;} // adjust speed to speed per frame

// We want antOpacity to be invariant to frame rate, resolution, number of ants, and speed.
// TODO: include speed calculation in here also, adjusting for minimum length of root2?
export function antOpacity() {
  return 1.0
  //return targetAntOpacity / wallpaperEngine.fps;
}
export function numberOfAnts(){return wallpaperEngine.numberOfAnts;}
export function agoraphobic(){return wallpaperEngine.agoraphobic;}

export function rotationAnglePerFrame(){return ( targetRotationSpeed * (Math.PI/180) ) / wallpaperEngine.fps;} // converts degrees per second into radians per frame
export function senseAngle(){return targetSenseAngle * (Math.PI/180);} // converts degrees to radians
export function senseDistance(){return targetSenseLead * targetAntSpeed;} // distance is lead amount * speed