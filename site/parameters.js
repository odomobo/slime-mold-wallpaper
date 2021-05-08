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
  targetFps = wallpaperEngine.fps;
  
  targetRenderColor = wallpaperEngine.renderColor;
  targetBrightness = wallpaperEngine.brightness;
  valueInverted = wallpaperEngine.inverted;

  targetBlurAmount = wallpaperEngine.blurAmount;
  targetDissipation = wallpaperEngine.dissipation;
  targetAntSpeed = wallpaperEngine.antSpeed;
  targetAntOpacity = wallpaperEngine.antOpacity;
  valueNumberOfAnts = wallpaperEngine.numberOfAnts;
  targetAgoraphobic = wallpaperEngine.agoraphobic;

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


var targetFps;

var targetRenderColor;
var targetBrightness;
var valueInverted;

var targetBlurAmount;
var targetDissipation;
var targetAntSpeed;
var targetAntOpacity;
var valueNumberOfAnts;
var targetAgoraphobic;

var targetRotationSpeed;
var targetSenseAngle;
var targetSenseLead;


export function fps(){return targetFps;};

export function renderColor(){return targetRenderColor;} // TODO: this needs to be more sophisticated, converting hsv to rgb
export function brightness(){return targetBrightness;}
export function inverted(){return valueInverted;}

export function blurAmount(){return targetBlurAmount;}
export function dissipation(){return targetDissipation;}
export function antSpeed(){return targetAntSpeed;}
export function antOpacity(){return targetAntOpacity;}
export function numberOfAnts(){return valueNumberOfAnts;}
export function agoraphobic(){return targetAgoraphobic;}

export function rotationSpeed(){return targetRotationSpeed;}
export function senseAngle(){return targetSenseAngle;}
export function senseLead(){return targetSenseLead;}