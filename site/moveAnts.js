import * as constants from './constants.js';
import * as parameters from './parameters.js';

export function draw(antsOut, antsActive, pheremoneActive) {
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
  const attachments = [
    { format: gl.RGBA, mag: gl.NEAREST },
  ];
  frameBufferInfo = twgl.createFramebufferInfo(gl, attachments, constants.antsWidth, constants.antsHeight);
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
    u_antSpeed: parameters.antSpeed() / parameters.fps(),
    u_senseDistance: parameters.senseLead() * parameters.antSpeed(),
    u_senseAngle: parameters.senseAngle() * (Math.PI/180),
    u_rotationSpeed: ( parameters.rotationSpeed() * (Math.PI/180) ) / parameters.fps(), // degrees per second
    u_agoraphobic: parameters.agoraphobic(),
  };
  
  twgl.setUniforms(programInfo, uniforms);
}
  
const fragShader = `#version 300 es
precision mediump float;
in vec2 textureCoord;
out vec4 FragColor;

uniform float u_aspectRatio;
uniform float u_antSpeed;
uniform sampler2D u_antsActive;
uniform sampler2D u_pheremoneActive;
uniform float u_senseDistance;
uniform float u_senseAngle;
uniform float u_rotationSpeed;
uniform bool u_agoraphobic;

const int sensePointsCount = 9;
const float PI = 3.1415926535897932384626433832795;

vec2 angleToComponents(float angle) {
  return vec2(sin(angle), cos(angle));
}

float componentsToAngle(vec2 components)
{
  return float(atan(components.x, components.y));
}

vec2 adjustCoords(vec2 coord) {
  return vec2(coord.x*u_aspectRatio, coord.y);
}

vec2 unadjustCoords(vec2 coord) {
  return vec2(coord.x/u_aspectRatio, coord.y);
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
    float angle = anglePercentage * 2.0 * PI;
    vec2 angleComponents = angleToComponents(angle);
    vec2 adjustedSenseCoord = adjustedCenterCoord + angleComponents*radius;
    float val = texture(u_pheremoneActive, unadjustCoords(adjustedSenseCoord)).r;
    //ret = max(ret, val);
    ret += val;
  }
  return ret / float(sensePointsCount); // return the average
}

// if a sensor gets senseDistance + senseCircleRadius from the edge, then let's interpolate it down to 0
float reduceSenseNearEdge(float value, vec2 adjustedCoord) {
  float minDistance = 1.0;
  minDistance = min(minDistance, adjustedCoord.x - 0.0);
  minDistance = min(minDistance, adjustedCoord.y - 0.0);
  minDistance = min(minDistance, u_aspectRatio - adjustedCoord.x);
  minDistance = min(minDistance, 1.0 - adjustedCoord.y);
  
  float scaledDistance = minDistance / (u_senseDistance + senseCircleRadius());
  scaledDistance = clamp(scaledDistance, 0.0, 1.0);
  
  return value * scaledDistance;
}

float adjustSenseAgoraphobia(float value) {
  if (!u_agoraphobic)
    return value;
  
  if (value <= 0.75)
    return value;
  else
    return clamp(0.75-value, 0.0, 1.0);
}

float sense(vec2 adjustedCoord, float distance, float angle) {
  vec2 angleComponents = angleToComponents(angle);
  adjustedCoord = adjustedCoord + angleComponents*distance;
  //return texture(u_pheremoneActive, unadjustCoords(adjustedCoord)).r;
  float sensedValue = senseCircle(adjustedCoord, senseCircleRadius());
  sensedValue = adjustSenseAgoraphobia(sensedValue);
  sensedValue = reduceSenseNearEdge(sensedValue, adjustedCoord);
  return sensedValue;
}

float getNewDirection(vec2 adjustedCoord, float direction) {
  float c = sense(adjustedCoord, u_senseDistance, direction);
  float l = sense(adjustedCoord, u_senseDistance, direction - u_senseAngle);
  float r = sense(adjustedCoord, u_senseDistance, direction + u_senseAngle);
  
  if (l > c && l > r)
    return direction - u_rotationSpeed;
  
  if (r > c)
    return direction + u_rotationSpeed;
  
  return direction;
}

void main() {
  vec4 ant = texture(u_antsActive, textureCoord);
  
  vec2 antPos = adjustCoords(ant.rg); // adjustCoords transforms to the screen aspect ratio
  float antAngle = ant.b;
  float antRandSeed = ant.a;
  
  vec2 antAngleComponents = angleToComponents(antAngle);
  
  antPos += antAngleComponents * u_antSpeed;
  
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
  
  antAngle = getNewDirection(antPos, antAngle);
  
  // back to square
  antPos = unadjustCoords(antPos);
  
  
  FragColor = vec4(antPos, antAngle, antRandSeed);
}
`;