import * as constants from './constants.js';

export var bgcolor = [1, 0, 1]; // TODO: remove?
export var fps = constants.defaultFps;
export var blurAmount = constants.defaultBlurAmount;
export var dissipation = constants.defaultDissipation;
export var antSpeed = constants.defaultAntSpeed;
export var antOpacity = constants.defaultAntOpacity;

window.wallpaperEnginePropertyListener = {
  
  applyUserProperties: function(properties) {
    // TODO: remove this and replace with something useful
    if (properties.bgcolor)
    {
      var bgColorStrArr = properties.bgcolor.value.split(" ");
      bgcolor = bgColorStrArr.map(parseFloat);
    }
  },
  
  applyGeneralProperties: function(properties) {
    if (properties.fps) {
      fps = properties.fps;
    }
  },
    
};

//export default wallpaperEngine;