import * as constants from '../src/constants.js';
import * as parameters from '../src/parameters.js';
import * as glhelper from '../src/glhelper.js';
import * as devMenu from './dev-menu2.js';

// Samples the pheremone texture on a strided grid (point samples, not averages, so percentiles stay meaningful),
// reads it back, and shows summary stats in the dev menu. readPixels stalls the pipeline, so only do it periodically.

const probeWidth = 256;
const updateIntervalMs = 250;
const agoraphobiaThreshold = 1.0; // keep in sync with agoraphobiaThreshold in moveAnts.js

var programInfo;
var drawBuffer;
var frameBufferInfo;
var readBuffer = null;
var lastUpdateMs = -Infinity;
var statsElement;

export function init() {
  programInfo = twgl.createProgramInfo(gl, [constants.commonVertShader, fragShader]);
  initializeBuffer();
  statsElement = document.querySelector("#stats");
}

export function update(pheremone) {
  var now = performance.now();
  if (now - lastUpdateMs < updateIntervalMs)
    return;
  lastUpdateMs = now;

  var stride = Math.max(1, Math.ceil(gl.drawingBufferWidth / probeWidth));
  var width = Math.floor(gl.drawingBufferWidth / stride);
  var height = Math.floor(gl.drawingBufferHeight / stride);
  // random offset each update, so the grid doesn't alias with any structure on screen
  var offset = [Math.floor(Math.random() * stride), Math.floor(Math.random() * stride)];

  resizeFrameBufferInfoIfNecessary(width, height);
  twgl.bindFramebufferInfo(gl, frameBufferInfo);

  gl.useProgram(programInfo.program);
  twgl.setUniforms(programInfo, {
    u_pheremone: pheremone,
    u_stride: stride,
    u_offset: offset,
  });
  bindBuffer();
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  if (readBuffer == null || readBuffer.length != width * height * 4)
    readBuffer = new Float32Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, readBuffer);

  twgl.bindFramebufferInfo(gl);

  display(computeStats(readBuffer, width * height));
}

function computeStats(rgba, count) {
  var values = new Float32Array(count);
  var sum = 0;
  var overThreshold = 0;
  for (var i = 0; i < count; i++) {
    var value = rgba[i * 4];
    values[i] = value;
    sum += value;
    if (value > agoraphobiaThreshold)
      overThreshold++;
  }
  values.sort();

  return {
    mean: sum / count,
    p50: values[Math.floor(count * 0.50)],
    p95: values[Math.floor(count * 0.95)],
    max: values[count - 1],
    overThreshold: overThreshold / count,
  };
}

function display(stats) {
  var format = parameters.pheremoneFloat32() ? "f32" : "f16";
  if (devMenu.pheremoneFloat32 && !glhelper.float32PheremoneSupported)
    format += " (f32 unsupported)";

  statsElement.textContent =
    "mean  " + stats.mean.toFixed(4) + "\n" +
    "p50   " + stats.p50.toFixed(4) + "\n" +
    "p95   " + stats.p95.toFixed(4) + "\n" +
    "max   " + stats.max.toFixed(4) + "\n" +
    ">" + agoraphobiaThreshold.toFixed(1) + "  " + (stats.overThreshold * 100).toFixed(2) + "%\n" +
    "fmt   " + format;
}

function initializeBuffer() {
  drawBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
  var vertices = [-1,-1, -1,1, 1,1, 1,-1]; // 4 corners, going in a circle fashion which is what drawing to triangle fan wants
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function bindBuffer() {
  gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

function resizeFrameBufferInfoIfNecessary(width, height) {
  const frameBufferAttachments = [
    { internalFormat: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT, min: gl.NEAREST, mag: gl.NEAREST },
  ];
  if (frameBufferInfo != null && frameBufferInfo.width == width && frameBufferInfo.height == height)
    return;

  // recreate instead of twgl.resizeFramebufferInfo, which ignores internalFormat in this twgl version
  if (frameBufferInfo != null) {
    gl.deleteTexture(frameBufferInfo.attachments[0]);
    gl.deleteFramebuffer(frameBufferInfo.framebuffer);
  }
  frameBufferInfo = twgl.createFramebufferInfo(gl, frameBufferAttachments, width, height);
}

const fragShader = `#version 300 es
precision highp float;
out vec4 FragColor;

uniform sampler2D u_pheremone;
uniform int u_stride;
uniform ivec2 u_offset;
void main() {
  ivec2 coord = ivec2(gl_FragCoord.xy) * u_stride + u_offset;
  FragColor = texelFetch(u_pheremone, coord, 0);
}
`;
