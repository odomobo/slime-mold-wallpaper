import * as constants from './constants.js';
import * as wallpaperEngineImport from './wallpaperEngine.js';
import * as devMenu from '../dev-src/dev-menu2.js';

const wallpaperEngine = dev ? devMenu : wallpaperEngineImport;

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
  targetDensity = wallpaperEngine.density;

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
var targetDensity;

var targetRotationSpeed;
var targetSenseAngle;
var targetSenseLead;


export function getAspectRatio()
{
  return gl.drawingBufferWidth / gl.drawingBufferHeight;
}

function aspectRatioScale()
{
  return Math.sqrt( getAspectRatio() / 1.8 );
}

// numberOfAnts is quality, 1-5. 1 is 10,000 ants, 5 is 1,000,000
function getNumberOfAnts() {
  var quality = wallpaperEngine.numberOfAnts;
  quality = Math.max(quality, 1);
  quality = Math.min(quality, 5);
  let numberOfAntsVar = 10000 * Math.pow(10, (quality-1)/2);
  return Math.floor(numberOfAntsVar);
}


export function antsTextureHeight() {
  return Math.ceil(getNumberOfAnts() / constants.antsTextureWidth);
}

export function antsTextureSize() {
  return antsTextureHeight() * constants.antsTextureWidth;
}

export function fps(){return wallpaperEngine.fps;};

export function renderColor(){return targetRenderColor;} // TODO: this needs to be more sophisticated, converting hsv to rgb
export function brightness(){return targetBrightness * 0.6;}
export function inverted(){return wallpaperEngine.inverted;}

function getScale() {
  return targetRotationSpeed * aspectRatioScale();
}

const speedFactor = 0.1;

function getSpeed() {
  return targetAntSpeed * getScale(); // targetRotationSpeed is actually scale
}

function getDissipation() {
  return 0.2 / (targetDissipation * targetRotationSpeed);
}



const blurAmountFactor = 20.0;
export function blurAmountPerFrame() {
    var blurAmount = targetBlurAmount * blurAmountFactor * getSpeed() * getDissipation() / wallpaperEngine.fps;
    if (blurAmount < 1)
      return blurAmount;
    else
      return 1;
}

export function dissipationPerFrame(){return getDissipation() * getSpeed() / wallpaperEngine.fps;}
export function antDistancePerFrame(){return speedFactor * getSpeed() / wallpaperEngine.fps;} // adjust speed to speed per frame

// antOpacity is invariant to frame rate, resolution, number of ants, speed, and dissipation
export function antOpacity() {
  const coeff = 5.2; // makes 2.0 density be a pleasing value... TODO: adjust and get rid of density parameter eventually, as it's not really needed
  return (targetDensity * coeff * gl.drawingBufferWidth * getDissipation()) / ( getNumberOfAnts() );
}
export function numberOfAnts(){return getNumberOfAnts();}
export function agoraphobic(){return wallpaperEngine.agoraphobic;}

function getRotationSpeed(){return 100.0 / getScale();}

export function rotationAnglePerFrame(){return ( getRotationSpeed() * (Math.PI/180) * getSpeed() ) / wallpaperEngine.fps;} // converts degrees per second into radians per frame

// converts degrees to radians; clamp to 60 degrees
export function senseAngle(){
  let senseAngleVal = ( 20 * (Math.PI/180) * targetSenseAngle ) / ( 1 ); // targetSenseLead is assertiveness, targetSenseAngle is independence
  // clamp to 60 degrees
  if (senseAngleVal > Math.PI / 3) {
    senseAngleVal = Math.PI/3;
  }
  return senseAngleVal;
}

const senseFactor = 0.02;

export function senseDistance(){return targetSenseLead * senseFactor * getScale();}