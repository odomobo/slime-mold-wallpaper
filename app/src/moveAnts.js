import * as constants from './constants.js';
import * as parameters from './parameters.js';

export function draw(antsOut, antsActive, pheremoneActive) {
  resizeFrameBufferInfoIfNecessary();
  bindFrameBuffer(antsOut);
  
  gl.useProgram(programInfo.program);
  setUniforms(antsActive, pheremoneActive);
  bindBuffer();
  
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  gl.flush();
  
  unbindFrameBuffer();
}

var programInfo;
export function init() {
  programInfo = twgl.createProgramInfo(gl, [constants.commonVertShader, fragShader]);
  initializeFrameBufferInfo();
  initializeBuffer();
}

var drawBuffer;
function initializeBuffer() {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  var vertices = [-1,-1, -1,1, 1,1, 1,-1]; // 4 corners, going in a circle fashion which is what drawing to triangle fan wants
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  drawBuffer = buffer;
}

function bindBuffer() {
  gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
  // TODO: get correct location instead of assuming 0
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

var frameBufferInfo;
function initializeFrameBufferInfo() {
  const frameBufferAttachments = [
    { format: gl.RGBA, mag: gl.NEAREST },
  ];
  frameBufferInfo = twgl.createFramebufferInfo(gl, frameBufferAttachments, constants.antsTextureWidth, parameters.antsTextureHeight());
}

function resizeFrameBufferInfoIfNecessary() {
  const frameBufferAttachments = [
    { format: gl.RGBA, mag: gl.NEAREST },
  ];
  if (frameBufferInfo.height != parameters.antsTextureHeight())
    twgl.resizeFramebufferInfo(gl, frameBufferInfo, frameBufferAttachments, constants.antsTextureWidth, parameters.antsTextureHeight());
}

function bindFrameBuffer(antsOut) {
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0; // why??
  
  twgl.bindFramebufferInfo(gl, frameBufferInfo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, antsOut, level);
}

function unbindFrameBuffer() {
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0; // why??

  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, null, level);
  twgl.bindFramebufferInfo(gl);
}

function setUniforms(antsActive, pheremoneActive) {
  var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  var uniforms = {
    u_antsActive: antsActive,
    u_pheremoneActive: pheremoneActive,
    u_aspectRatio: aspectRatio,
    u_antDistancePerFrame: parameters.antDistancePerFrame(),
    u_senseDistance: parameters.senseDistance(),
    u_senseAngle: parameters.senseAngle(),
    u_rotationAnglePerFrame: parameters.rotationAnglePerFrame(),
    u_agoraphobic: parameters.agoraphobic(),
    u_fps: parameters.fps(),
  };
  
  twgl.setUniforms(programInfo, uniforms);
}
  
const fragShader = `#version 300 es
precision mediump float;
in vec2 textureCoord;
out vec4 FragColor;

uniform float u_aspectRatio;
uniform float u_antDistancePerFrame;
uniform sampler2D u_antsActive;
uniform sampler2D u_pheremoneActive;
uniform float u_senseDistance;
uniform float u_senseAngle;
uniform float u_rotationAnglePerFrame;
uniform bool u_agoraphobic;
uniform int u_fps;

const float PI = 3.1415926535897932384626433832795;
const float TAU = PI*2.0;
const float MAX_BOUNCE_ANGLE = 80.0;
const float MAX_BOUNCE_ANGLE_RAD = MAX_BOUNCE_ANGLE * (TAU / 360.0);

// hardcoded parameters
const int sensePointsCount = 9;
const float agoraphobiaThreshold = 1.0;
const bool wallAvoidance = false;
const bool doRandomBounce = true;
const float agoraphobiaPercentagePerSecond = 1000.0;

// ant variables; see documentation.md to see how these are stored in the texture.
vec2 antPos; // always the adjusted value
uint antState;
float antAngle;
uint antRandomSeed;

vec2 angleToComponents(float angle) {
  return vec2(sin(angle), cos(angle));
}

float componentsToAngle(vec2 components) {
  return float(atan(components.x, components.y));
}

vec2 adjustCoords(vec2 coord) {
  return vec2(coord.x*u_aspectRatio, coord.y);
}

vec2 unadjustCoords(vec2 coord) {
  return vec2(coord.x/u_aspectRatio, coord.y);
}

void storeAntVariables(vec4 ant) {
  antPos = adjustCoords(ant.rg); // adjustCoords transforms to the screen aspect ratio
  float antStateF;
  antAngle = modf(ant.b, antStateF)*TAU;
  // make sure this is from 0 to 1
  if (antAngle < 0.0)
    antAngle += 1.0;
  antState = uint(antStateF);
  antRandomSeed = floatBitsToUint(ant.a);
}

vec4 retrieveAntVariables() {
  float angleNormalized = antAngle/TAU;
  float _;
  angleNormalized = modf(angleNormalized, _);
  
  // make sure this is from 0 to 1
  if (angleNormalized < 0.0)
    angleNormalized += 1.0;
  
  return vec4(unadjustCoords(antPos), float(antState) + angleNormalized, uintBitsToFloat(antRandomSeed));
}

// Hash function www.cs.ubc.ca/~rbridson/docs/schechter-sca08-turbulence.pdf
uint hash(uint state)
{
    state ^= 2747636419u;
    state *= 2654435769u;
    state ^= state >> 16;
    state *= 2654435769u;
    state ^= state >> 16;
    state *= 2654435769u;
    return state;
}

// [0, 2^32)
uint getRandomInt() {
  antRandomSeed = hash(antRandomSeed);
  return antRandomSeed;
}

// [0.0, 1.0)
float getRandomFloat() {
  return float(getRandomInt() % uint(1<<24)) / float(1<<24);
}

float getRandomFloat(float min, float max) {
  //return min + getRandomFloat()*(max-min);
  return mix(min, max, getRandomFloat());
}

float senseCircleRadius() {
  float senseDiameter = sin(u_senseAngle) * u_senseDistance; // the rough distance between sense points
  return senseDiameter/2.0;
}

float senseCircle(vec2 adjustedCenterCoord, float radius)
{
  float ret = 0.0;
  for (int i = 0; i < sensePointsCount; i++)
  {
    float anglePercentage = (float(i) / float(sensePointsCount));
    float angle = anglePercentage * TAU;
    vec2 angleComponents = angleToComponents(angle);
    vec2 adjustedSenseCoord = adjustedCenterCoord + angleComponents*radius;
    float val = texture(u_pheremoneActive, unadjustCoords(adjustedSenseCoord)).r;
    //ret = max(ret, val);
    ret += val;
  }
  return ret / float(sensePointsCount); // return the average
}

float reductionIfUnder(float minDistance, float actualDistance)
{
  if (actualDistance > minDistance)
    return 0.0;
  
  float unscaledReductionAmount = minDistance - actualDistance;
  return clamp(unscaledReductionAmount / minDistance, 0.0, 1.0) * 100.0; // TODO: parameterize
}

// if a sensor gets senseDistance + senseCircleRadius from the edge, then let's interpolate it down to 0
float reduceSenseNearEdge(float value, vec2 adjustedCoord) {
  float minDistance = 0.1; // TODO: parameterize
  value -= reductionIfUnder(minDistance, adjustedCoord.x - 0.0);
  value -= reductionIfUnder(minDistance, adjustedCoord.y - 0.0);
  value -= reductionIfUnder(minDistance, u_aspectRatio - adjustedCoord.x);
  value -= reductionIfUnder(minDistance, 1.0 - adjustedCoord.y);
  return value;
}

float sense(vec2 adjustedCoord, float distance, float angle) {
  vec2 angleComponents = angleToComponents(angle);
  adjustedCoord = adjustedCoord + angleComponents*distance;
  //return texture(u_pheremoneActive, unadjustCoords(adjustedCoord)).r;
  float sensedValue = senseCircle(adjustedCoord, senseCircleRadius());
  
  if (wallAvoidance)
    sensedValue = reduceSenseNearEdge(sensedValue, adjustedCoord);
  
  return sensedValue;
}

void setRandomAgoraphobiaDuration() {
  uint added = 0u;
  if (getRandomFloat() > .5)
    added = 100u; // TODO: parameterize
  
  antState = uint(getRandomFloat(1.0, float(u_fps/2))) + added; // TODO: parameterize
}

void checkAgoraphobia(float sensed) {
  if (sensed < agoraphobiaThreshold)
    return;
  
  setRandomAgoraphobiaDuration();
}

float senseForDirection(vec2 adjustedCoord, float direction) {
  float c = sense(adjustedCoord, u_senseDistance, direction);
  float l = sense(adjustedCoord, u_senseDistance, direction - u_senseAngle);
  float r = sense(adjustedCoord, u_senseDistance, direction + u_senseAngle);
  
  if (u_agoraphobic)
    checkAgoraphobia( max(c, max(l, r)) );
  
  if (l > c && l > r)
    return direction - u_rotationAnglePerFrame;
  
  if (r > c)
    return direction + u_rotationAnglePerFrame;
  
  return direction;
}

void physicalBounce() {
  vec2 antAngleComponents = angleToComponents(antAngle);
  
  if (antPos.x < 0.0 && antAngleComponents.x < 0.0)
    antAngleComponents.x *= -1.0;
  
  if (antPos.y < 0.0 && antAngleComponents.y < 0.0)
    antAngleComponents.y *= -1.0;
  
  if (antPos.x > u_aspectRatio && antAngleComponents.x > 0.0)
    antAngleComponents.x *= -1.0;
  
  if (antPos.y > 1.0 && antAngleComponents.y > 0.0)
    antAngleComponents.y *= -1.0;
  
  // components back to angle
  antAngle = componentsToAngle(antAngleComponents);
}

void randomBounce() {
  vec2 antAngleComponents = angleToComponents(antAngle);
  
  if (antPos.x < 0.0) {
    float normalAngle = TAU * .25;
    antAngle = getRandomFloat(normalAngle - MAX_BOUNCE_ANGLE_RAD, normalAngle + MAX_BOUNCE_ANGLE_RAD);
    antPos.x = 0.0;
  }
  
  if (antPos.y < 0.0) {
    float normalAngle = TAU * .00;
    antAngle = getRandomFloat(normalAngle - MAX_BOUNCE_ANGLE_RAD, normalAngle + MAX_BOUNCE_ANGLE_RAD);
    antPos.y = 0.0;
  }
  
  if (antPos.x > u_aspectRatio) {
    float normalAngle = TAU * .75;
    antAngle = getRandomFloat(normalAngle - MAX_BOUNCE_ANGLE_RAD, normalAngle + MAX_BOUNCE_ANGLE_RAD);
    antPos.x = u_aspectRatio;
  }
  
  if (antPos.y > 1.0) {
    float normalAngle = TAU * .50;
    antAngle = getRandomFloat(normalAngle - MAX_BOUNCE_ANGLE_RAD, normalAngle + MAX_BOUNCE_ANGLE_RAD);
    antPos.y = 1.0;
  }
}

bool isInState() {
  if (antState == 100u) // TODO: parameterize
    antState = 0u;
  
  return antState > 0u;
}

float getDirectionFromState() {
  antState -= 1u;
  
  float rotationDirection = 1.0;
  if (antState >= 100u) // TODO: parameterize
    rotationDirection = -1.0;
  
  return antAngle + u_rotationAnglePerFrame*rotationDirection;
}

void main() {
  storeAntVariables(texture(u_antsActive, textureCoord));
  
  // move
  antPos += angleToComponents(antAngle) * u_antDistancePerFrame;
  
  // TODO: make this parameterized
  if (doRandomBounce)
    randomBounce();
  else
    physicalBounce();
  
  if (!isInState())
    antAngle = senseForDirection(antPos, antAngle);
  else
    antAngle = getDirectionFromState();
  
  
  FragColor = retrieveAntVariables();
}
`;