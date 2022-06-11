import * as constants from '../src/constants.js';
import * as parameters from '../src/parameters.js';
import * as wallpaperEngine from '../src/wallpaperEngine.js';

export var fps = constants.defaultFps;

export var renderColor = constants.defaultRenderColor;
export var brightness = constants.defaultBrightness;
export var inverted = constants.defaultInverted;

export var blurAmount = constants.defaultBlurAmount;
export var dissipation = constants.defaultDissipation;
export var antSpeed = constants.defaultAntSpeed;
export var density = constants.defaultDensity;
export var numberOfAnts = constants.defaultNumberOfAnts;
export var agoraphobic = constants.defaultAgoraphobic;

export var rotationSpeed = constants.defaultRotationSpeed;
export var senseAngle = constants.defaultSenseAngle;
export var senseLead = constants.defaultSenseLead;

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

function load() {

    let colorInput = document.querySelector("#color");
    colorInput.oninput  = function(){
        let hexColor = colorInput.value;
        let components = hexToRgb(hexColor);
        renderColor = [components.r/255, components.g/255, components.b/255];
    };

    let brightnessInput = document.querySelector("#brightness");
    brightnessInput.value = brightness;
    brightnessInput.oninput = function(){brightness = brightnessInput.value;};

    let fpsInput = document.querySelector("#fps");
    fpsInput.value = fps;
    fpsInput.onchange = function(){fps = fpsInput.value;};

    let blurAmountInput = document.querySelector("#blurAmount");
    blurAmountInput.value = blurAmount;
    blurAmountInput.oninput = function(){blurAmount = blurAmountInput.value;};

    let dissipationInput = document.querySelector("#dissipation");
    dissipationInput.value = dissipation;
    dissipationInput.oninput = function(){dissipation = dissipationInput.value;};

    let antSpeedInput = document.querySelector("#antSpeed");
    antSpeedInput.value = antSpeed;
    antSpeedInput.oninput = function(){antSpeed = antSpeedInput.value;};

    let densityInput = document.querySelector("#density");
    densityInput.value = density;
    densityInput.oninput = function(){density = densityInput.value;};

    let numberOfAntsInput = document.querySelector("#numberOfAnts");
    numberOfAntsInput.value = numberOfAnts;
    numberOfAntsInput.oninput = function(){numberOfAnts = numberOfAntsInput.value;};

    let rotationSpeedInput = document.querySelector("#rotationSpeed");
    rotationSpeedInput.value = rotationSpeed;
    rotationSpeedInput.oninput = function(){rotationSpeed = rotationSpeedInput.value;};

    let senseAngleInput = document.querySelector("#senseAngle");
    senseAngleInput.value = senseAngle;
    senseAngleInput.oninput = function(){senseAngle = senseAngleInput.value;};

    let senseLeadInput = document.querySelector("#senseLead");
    senseLeadInput.value = senseLead;
    senseLeadInput.oninput = function(){senseLead = senseLeadInput.value;};
    
    /*
    let agoraphobicInput = document.querySelector("#agoraphobic");
    agoraphobicInput.value = agoraphobic;
    agoraphobicInput.onchange = function(){agoraphobic = agoraphobicInput.value == "true";};

    /*
    let xxxInput = document.querySelector("#xxx");
    xxxInput.value = xxx;
    xxxInput.onchange = function(){xxx = xxxInput.value;};

    /*
    let xxxInput = document.querySelector("#xxx");
    xxxInput.value = xxx;
    xxxInput.onchange = function(){xxx = xxxInput.value;};

    
    */
}

window.addEventListener("load", load, false);