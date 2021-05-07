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

window.wallpaperEnginePropertyListener = {
  
  applyGeneralProperties: function(properties) {
    if (properties.fps) {
      fps = properties.fps;
    }
  },
  
  applyUserProperties: function(properties) {
    // TODO: remove this and replace with something useful
    if (properties.bgcolor)
    {
      var bgColorStrArr = properties.bgcolor.value.split(" ");
      rendercolor = bgColorStrArr.map(parseFloat);
    }
  },
  
};

//export default wallpaperEngine;