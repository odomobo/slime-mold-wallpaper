import * as constants from './constants.js';

export var fps = constants.defaultFps;

export var renderColor = constants.defaultRenderColor;
export var brightness = constants.defaultBrightness;
export var inverted = constants.defaultInverted;

export var blurAmount = constants.defaultBlurAmount;
export var dissipation = constants.defaultDissipation;
export var antSpeed = constants.defaultAntSpeed;
export var antOpacity = constants.defaultAntOpacity;
export var numberOfAnts = constants.defaultNumberOfAnts;
export var agoraphobic = constants.defaultAgoraphobic;

export var rotationSpeed = constants.defaultRotationSpeed;
export var senseAngle = constants.defaultSenseAngle;
export var senseLead = constants.defaultSenseLead;

function applyUserProperties(properties) {
  // TODO: remove this and replace with something useful
  try {
    
    if (properties.schemecolor)
      renderColor = properties.schemecolor.value.split(" ").map(parseFloat);
    
    if (properties.agoraphobictendrils)
      agoraphobic = properties.agoraphobictendrils.value;
    
    if (properties.bluramount)
      blurAmount = properties.bluramount.value;
    
    if (properties.brightness)
      brightness = properties.brightness.value;
    
    if (properties.dissipation)
      dissipation = properties.dissipation.value;
    
    if (properties.inverted)
      inverted = properties.inverted.value;
    
    if (properties.numberoftendrils)
      numberOfAnts = properties.numberoftendrils.value;
    
    if (properties.rotationspeed)
      rotationSpeed = properties.rotationspeed.value;
    
    if (properties.speed)
      antSpeed = properties.speed.value;
    
    if (properties.tendrilopacity)
      antOpacity = properties.tendrilopacity.value;
    
    if (properties.tendrilsensorangle)
      senseAngle = properties.tendrilsensorangle.value;
    
    if (properties.tendrilsensorleadseconds)
      senseLead = properties.tendrilsensorleadseconds.value;
    
    
  } catch (e) {
    err.innerHTML = e.message;
    throw e;
  }
}

function applyGeneralProperties(properties) {
  try {
    if (properties.fps)
      fps = properties.fps;
    
  } catch (e) {
    err.innerHTML = e.message;
    throw e;
  }
}

window.wallpaperPropertyListener = {
  applyGeneralProperties: applyGeneralProperties,
  applyUserProperties: applyUserProperties,
};
