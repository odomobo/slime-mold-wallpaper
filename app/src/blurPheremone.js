import * as constants from './constants.js';
import * as parameters from './parameters.js';
import * as glObjects from './glObjects.js';

// Blurring is a diffusion applied a little every frame, along with dissipation.
//
// To allow arbitrarily strong blur at a fixed cost, the blur goes through a pyramid: the pheremone is repeatedly
// downsampled by 2x, then the composite pass mixes in an upsampled level. Each level down roughly quadruples the
// blur variance, so we pick the level (fractionally, by mixing 2 adjacent levels) that gives the variance needed this
// frame. The pyramid's grid is offset by a random amount every frame, so its blockiness never accumulates in one place;
// over many frames, the blur converges to a gaussian.

// The fraction of the blurred value mixed in each frame, once the blur is strong enough to need it. Lower leaves the
// newest trails sharper, with a halo around them; 1 continues the old (pre-pyramid) blur's look, where the mix grew
// with blur strength until it capped out at 1.
const blurMix = 1;

export function draw(pheremoneOut, pheremoneIn) {
  var plan = getBlurPlan(parameters.blurVariancePerFrame());
  var offset = [0, 0];

  if (plan.blurMix > 0) {
    // random grid offset, in whole pixels, over a full texel of the coarsest level used
    var offsetRange = 1 << (plan.level + 1);
    offset = [Math.floor(Math.random() * offsetRange), Math.floor(Math.random() * offsetRange)];
    drawDownsampleChain(pheremoneIn, plan.level + 1, offset);
  }

  drawComposite(pheremoneOut, pheremoneIn, plan, offset);
}

var downsampleProgramInfo;
var compositeProgramInfo;
var frameBuffer;
var drawBuffer;
export function init() {
  downsampleProgramInfo = twgl.createProgramInfo(gl, [constants.commonVertShader, downsampleFragShader]);
  compositeProgramInfo = twgl.createProgramInfo(gl, [constants.commonVertShader, compositeFragShader]);
  frameBuffer = gl.createFramebuffer();
  initializeBuffer();
}

// Per-axis variance (in full-resolution pixels^2) of downsampling to a level and upsampling back:
// each downsample is a 4x4 box (variance 1.25 source texels^2), and the upsample is a cubic B-spline (1/3 texels^2).
function levelVariance(level) {
  var downsampleVariance = 1.25 * (Math.pow(4, level) - 1) / 3;
  var upsampleVariance = Math.pow(4, level) / 3;
  return downsampleVariance + upsampleVariance;
}

// Chooses how to get the requested variance: mix in levelMix of the way from `level` to `level + 1`, by blurMix.
function getBlurPlan(variance) {
  // weak blur: just mix in less of the finest level
  if (variance <= blurMix * levelVariance(1))
    return { level: 1, levelMix: 0, blurMix: variance / levelVariance(1) };

  var targetVariance = variance / blurMix;
  for (var level = 1; level < constants.pheremoneMaxLevel; level++) {
    var lowVariance = levelVariance(level);
    var highVariance = levelVariance(level + 1);
    if (targetVariance <= highVariance)
      return { level: level, levelMix: (targetVariance - lowVariance) / (highVariance - lowVariance), blurMix: blurMix };
  }

  // as strong as it goes
  return { level: constants.pheremoneMaxLevel - 1, levelMix: 1, blurMix: blurMix };
}

function drawDownsampleChain(pheremoneIn, topLevel, offset) {
  gl.useProgram(downsampleProgramInfo.program);
  bindBuffer();

  for (var level = 1; level <= topLevel; level++) {
    var source = level == 1
      ? { texture: pheremoneIn, width: gl.drawingBufferWidth, height: gl.drawingBufferHeight }
      : glObjects.pheremoneLevels[level - 1];
    var target = glObjects.pheremoneLevels[level];

    bindFrameBuffer(target.texture, target.width, target.height);
    twgl.setUniforms(downsampleProgramInfo, {
      u_source: source.texture,
      u_sourceSize: [source.width, source.height],
      u_offset: level == 1 ? offset : [0, 0], // later levels inherit the offset
    });
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  unbindFrameBuffer();
}

function drawComposite(pheremoneOut, pheremoneIn, plan, offset) {
  var levelA = glObjects.pheremoneLevels[plan.level];
  var levelB = glObjects.pheremoneLevels[plan.level + 1];

  gl.useProgram(compositeProgramInfo.program);
  bindBuffer();
  bindFrameBuffer(pheremoneOut, gl.drawingBufferWidth, gl.drawingBufferHeight);
  twgl.setUniforms(compositeProgramInfo, {
    u_pheremoneIn: pheremoneIn,
    u_levelA: levelA.texture,
    u_levelASize: [levelA.width, levelA.height],
    u_levelAScale: 1 << plan.level,
    u_levelB: levelB.texture,
    u_levelBSize: [levelB.width, levelB.height],
    u_offset: offset,
    u_levelMix: plan.levelMix,
    u_blurMix: plan.blurMix,
    u_dissipation: parameters.dissipationPerFrame(),
  });
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  unbindFrameBuffer();
}

function initializeBuffer() {
  drawBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
  var vertices = [-1,-1, -1,1, 1,1, 1,-1]; // 4 corners, going in a circle fashion which is what drawing to triangle fan wants
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function bindBuffer() {
  gl.bindBuffer(gl.ARRAY_BUFFER, drawBuffer);
  // TODO: get correct location instead of assuming 0
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

function bindFrameBuffer(texture, width, height) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, width, height);
}

function unbindFrameBuffer() {
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}

// Coordinates: a level texel coordinate c corresponds to full-resolution pixel coordinate c * 2^level - offset.

const downsampleFragShader = `#version 300 es
precision highp float;
out vec4 FragColor;

uniform sampler2D u_source;
uniform vec2 u_sourceSize;
uniform vec2 u_offset; // in source pixels

void main() {
  // the source texels under this texel are centered here; bilinear samples at +-1 from it each average a 2x2 block,
  // so together they average a 4x4 box
  vec2 center = floor(gl_FragCoord.xy) * 2.0 + 1.0 - u_offset;
  float sum = texture(u_source, (center + vec2(-1.0, -1.0)) / u_sourceSize).r
            + texture(u_source, (center + vec2( 1.0, -1.0)) / u_sourceSize).r
            + texture(u_source, (center + vec2(-1.0,  1.0)) / u_sourceSize).r
            + texture(u_source, (center + vec2( 1.0,  1.0)) / u_sourceSize).r;
  FragColor = vec4(sum * 0.25, 0.0, 0.0, 1.0);
}
`;

const compositeFragShader = `#version 300 es
precision highp float;
out vec4 FragColor;

uniform sampler2D u_pheremoneIn;
uniform sampler2D u_levelA;
uniform vec2 u_levelASize;
uniform float u_levelAScale; // 2^level
uniform sampler2D u_levelB; // the next level down from A
uniform vec2 u_levelBSize;
uniform vec2 u_offset;
uniform float u_levelMix;
uniform float u_blurMix;
uniform float u_dissipation;

// Smooth (cubic B-spline) upsampling from 4 bilinear samples; see GPU Gems 2, chapter 20.
// coord is in texels.
float sampleBSpline(sampler2D tex, vec2 coord, vec2 size) {
  vec2 t = coord - 0.5;
  vec2 i = floor(t);
  vec2 f = t - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;

  // weights of texels i-1, i, i+1, i+2
  vec2 w0 = (1.0 - 3.0*f + 3.0*f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0*f2 + 3.0*f3) / 6.0;
  vec2 w2 = (1.0 + 3.0*f + 3.0*f2 - 3.0*f3) / 6.0;
  vec2 w3 = f3 / 6.0;

  // pairs of texels are combined into single bilinear samples
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 h0 = (i - 1.0 + w1 / g0 + 0.5) / size;
  vec2 h1 = (i + 1.0 + w3 / g1 + 0.5) / size;

  return g0.y * (g0.x * texture(tex, vec2(h0.x, h0.y)).r + g1.x * texture(tex, vec2(h1.x, h0.y)).r)
       + g1.y * (g0.x * texture(tex, vec2(h0.x, h1.y)).r + g1.x * texture(tex, vec2(h1.x, h1.y)).r);
}

void main() {
  float original = texelFetch(u_pheremoneIn, ivec2(gl_FragCoord.xy), 0).r;

  float blurred = original;
  if (u_blurMix > 0.0) {
    vec2 coord = gl_FragCoord.xy + u_offset;
    float a = sampleBSpline(u_levelA, coord / u_levelAScale, u_levelASize);
    float b = sampleBSpline(u_levelB, coord / (u_levelAScale * 2.0), u_levelBSize);
    blurred = mix(a, b, u_levelMix);
  }

  FragColor = vec4(mix(original, blurred, u_blurMix) * (1.0 - u_dissipation), 0.0, 0.0, 1.0);
}
`;
