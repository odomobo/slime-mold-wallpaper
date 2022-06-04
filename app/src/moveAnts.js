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
  var uniforms = {
    u_antsActive: antsActive,
    u_pheremoneActive: pheremoneActive,
    u_aspectRatio: parameters.getAspectRatio(),
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
precision mediump float;` +
constants.commonShaderLibrary +
`
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

const float MAX_BOUNCE_ANGLE = 80.0;
const float MAX_BOUNCE_ANGLE_RAD = MAX_BOUNCE_ANGLE * (TAU / 360.0);

// hardcoded parameters
const int sensePointsCount = 9;
const float agoraphobiaThreshold = 1.0;
const bool teleportOnAgoraphobia = false;
const bool wallWrapping = false;
const bool wallAvoidance = false;
const bool doRandomBounce = false;
const bool hidePastWall = true;

Ant ant;
bool sensedAgoraphobia = false;

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
    vec2 unadjustedSenseCoord = unadjustCoords(adjustedSenseCoord, u_aspectRatio);

    if (hidePastWall && (unadjustedSenseCoord.x < 0.0 || unadjustedSenseCoord.x > 1.0 || unadjustedSenseCoord.y < 0.0 || unadjustedSenseCoord.y > 1.0))
      continue;
    
    float val = texture(u_pheremoneActive, unadjustedSenseCoord).r;
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
  //return texture(u_pheremoneActive, unadjustCoords(adjustedCoord, u_aspectRatio)).r;
  float sensedValue = senseCircle(adjustedCoord, senseCircleRadius());
  
  if (wallAvoidance)
    sensedValue = reduceSenseNearEdge(sensedValue, adjustedCoord);
  
  if (sensedValue > agoraphobiaThreshold)
    sensedAgoraphobia = true;
  
  return sensedValue;
}

void setRandomAgoraphobiaDuration() {
  uint added = 0u;
  if (getRandomFloat(ant) > .5)
    added = 100u; // TODO: parameterize
  
  ant.state = uint(getRandomFloat(ant, 1.0, float(u_fps/2))) + added; // TODO: parameterize
}

float senseForDirection(vec2 adjustedCoord, float direction) {
  float c = sense(adjustedCoord, u_senseDistance, direction);
  float l = sense(adjustedCoord, u_senseDistance, direction - u_senseAngle);
  float r = sense(adjustedCoord, u_senseDistance, direction + u_senseAngle);
  
  if (c >= l && c >= r)
    return direction;
  
  if (l > c && r > c)
  {
    // random direction
    //float angleMult = -1.0;
    //if (getRandomFloat(ant) > .5)
    //  angleMult = 1.0;
    //
    //return direction + u_rotationAnglePerFrame*angleMult;
    
    // seek weaker direction
    if (l > r)
      return direction + u_rotationAnglePerFrame;
    else
      return direction - u_rotationAnglePerFrame;
  }
  
  if (l > r)
    return direction - u_rotationAnglePerFrame;
  else
    return direction + u_rotationAnglePerFrame;
}

void wallWrap() {
  if (ant.pos.x < 0.0)
    ant.pos.x += u_aspectRatio;
  else if (ant.pos.x > u_aspectRatio)
    ant.pos.x -= u_aspectRatio;
  
  if (ant.pos.y < 0.0)
    ant.pos.y += 1.0;
  else if (ant.pos.y > 1.0)
    ant.pos.y -= 1.0;
}

// TODO: make a small chance of a huge direction change
float randomizeDirection(float direction)
{
  float angle = 0.1 * u_rotationAnglePerFrame;
  return direction + getRandomFloat(ant, -angle, angle);
}

void physicalBounce() {
  vec2 antAngleComponents = angleToComponents(ant.angle);
  
  if (ant.pos.x < 0.0 && antAngleComponents.x < 0.0)
    antAngleComponents.x *= -1.0;
  
  if (ant.pos.y < 0.0 && antAngleComponents.y < 0.0)
    antAngleComponents.y *= -1.0;
  
  if (ant.pos.x > u_aspectRatio && antAngleComponents.x > 0.0)
    antAngleComponents.x *= -1.0;
  
  if (ant.pos.y > 1.0 && antAngleComponents.y > 0.0)
    antAngleComponents.y *= -1.0;
  
  // components back to angle
  ant.angle = componentsToAngle(antAngleComponents);
}

void randomBounce() {
  if (ant.pos.x < 0.0) {
    float normalAngle = TAU * .25;
    ant.angle = getRandomFloat(ant, normalAngle - MAX_BOUNCE_ANGLE_RAD, normalAngle + MAX_BOUNCE_ANGLE_RAD);
    ant.pos.x = 0.0;
  }
  
  if (ant.pos.y < 0.0) {
    float normalAngle = TAU * .00;
    ant.angle = getRandomFloat(ant, normalAngle - MAX_BOUNCE_ANGLE_RAD, normalAngle + MAX_BOUNCE_ANGLE_RAD);
    ant.pos.y = 0.0;
  }
  
  if (ant.pos.x > u_aspectRatio) {
    float normalAngle = TAU * .75;
    ant.angle = getRandomFloat(ant, normalAngle - MAX_BOUNCE_ANGLE_RAD, normalAngle + MAX_BOUNCE_ANGLE_RAD);
    ant.pos.x = u_aspectRatio;
  }
  
  if (ant.pos.y > 1.0) {
    float normalAngle = TAU * .50;
    ant.angle = getRandomFloat(ant, normalAngle - MAX_BOUNCE_ANGLE_RAD, normalAngle + MAX_BOUNCE_ANGLE_RAD);
    ant.pos.y = 1.0;
  }
}

bool isInState() {
  if (ant.state == 100u) // TODO: parameterize
    ant.state = 0u;
  
  return ant.state > 0u;
}

float getDirectionFromState() {
  ant.state -= 1u;
  
  float rotationDirection = 1.0;
  if (ant.state >= 100u) // TODO: parameterize
    rotationDirection = -1.0;
  
  return ant.angle + u_rotationAnglePerFrame*rotationDirection;
}

void main() {
  ant = vec4ToAnt(texture(u_antsActive, textureCoord), u_aspectRatio);
  
  // move
  ant.pos += angleToComponents(ant.angle) * u_antDistancePerFrame;
  
  // TODO: make this parameterized
  if (wallWrapping)
    wallWrap();
  else if (doRandomBounce)
    randomBounce();
  else
    physicalBounce();
  
  if (!isInState()) {
    ant.angle = senseForDirection(ant.pos, ant.angle);
    //ant.angle = randomizeDirection(ant.angle);
    if (sensedAgoraphobia && teleportOnAgoraphobia) {
      ant.pos.x = getRandomFloat(ant) * u_aspectRatio;
      ant.pos.y = getRandomFloat(ant);
      ant.angle = getRandomFloat(ant) * TAU;
    }
    else if (sensedAgoraphobia && u_agoraphobic) {
      setRandomAgoraphobiaDuration();
    }
  }
  else
    ant.angle = getDirectionFromState();
  
  
  FragColor = antToVec4(ant, u_aspectRatio);
}
`;