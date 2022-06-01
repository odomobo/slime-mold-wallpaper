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

function load() {
    let brightnessInput = document.querySelector("#brightness");
    brightnessInput.value = brightness;
    brightnessInput.onchange = function(){brightness = brightnessInput.value;};

    let fpsInput = document.querySelector("#fps");
    fpsInput.value = fps;
    fpsInput.onchange = function(){fps = fpsInput.value;};

    let blurAmountInput = document.querySelector("#blurAmount");
    blurAmountInput.value = blurAmount;
    blurAmountInput.onchange = function(){blurAmount = blurAmountInput.value;};

    let dissipationInput = document.querySelector("#dissipation");
    dissipationInput.value = dissipation;
    dissipationInput.onchange = function(){dissipation = dissipationInput.value;};

    let antSpeedInput = document.querySelector("#antSpeed");
    antSpeedInput.value = antSpeed;
    antSpeedInput.onchange = function(){antSpeed = antSpeedInput.value;};

    let densityInput = document.querySelector("#density");
    densityInput.value = density;
    densityInput.onchange = function(){density = densityInput.value;};

    let numberOfAntsInput = document.querySelector("#numberOfAnts");
    numberOfAntsInput.value = numberOfAnts;
    numberOfAntsInput.onchange = function(){numberOfAnts = numberOfAntsInput.value;};

    let rotationSpeedInput = document.querySelector("#rotationSpeed");
    rotationSpeedInput.value = rotationSpeed;
    rotationSpeedInput.onchange = function(){rotationSpeed = rotationSpeedInput.value;};

    let senseAngleInput = document.querySelector("#senseAngle");
    senseAngleInput.value = senseAngle;
    senseAngleInput.onchange = function(){senseAngle = senseAngleInput.value;};

    let senseLeadInput = document.querySelector("#senseLead");
    senseLeadInput.value = senseLead;
    senseLeadInput.onchange = function(){senseLead = senseLeadInput.value;};
    
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