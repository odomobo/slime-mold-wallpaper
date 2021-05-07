import * as constants from './constants.js';

export var fps = constants.defaultFps;

export var renderColor = constants.defaultRenderColor;
export var brightness = constants.defaultBrightness;

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
