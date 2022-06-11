
export const antsTextureWidth = 1024;

export const defaultRenderColor = [0.40, 0.50, 0.56];
export const defaultBrightness = 1.0;
export const defaultInverted = false;

export const defaultFps = 30;
export const defaultBlurAmount = 1.0;
export const defaultDissipation = 1.0;
export const defaultAntSpeed = 1;
export const defaultDensity = 2.0;
export const defaultNumberOfAnts = 3;
export const defaultAgoraphobic = true;

export const defaultRotationSpeed = 1;
export const defaultSenseAngle = 1;
export const defaultSenseLead = 1;

  
export const commonVertShader = `#version 300 es
const vec2 madd=vec2(0.5,0.5);
in vec2 vertexIn;
out vec2 textureCoord;
void main() {
  textureCoord = vertexIn.xy*madd+madd; // scale vertex attribute to [0-1] range
  gl_Position = vec4(vertexIn.xy,0.0,1.0);
}
`;

export const commonShaderLibrary = `
/////////////////////////////////
// Begin Common Shader Library //
/////////////////////////////////

const float PI = 3.1415926535897932384626433832795;
const float TAU = PI*2.0;

// see documentation.md to see how this is stored in the texture.
struct Ant {
  vec2 pos; // always the adjusted value
  uint state;
  float angle;
  uint randomSeed;
};

vec2 angleToComponents(float angle) {
  return vec2(sin(angle), cos(angle));
}

float componentsToAngle(vec2 components) {
  return float(atan(components.x, components.y));
}

vec2 adjustCoords(vec2 coord, float aspectRatio) {
  return vec2(coord.x*aspectRatio, coord.y);
}

vec2 unadjustCoords(vec2 coord, float aspectRatio) {
  return vec2(coord.x/aspectRatio, coord.y);
}

Ant vec4ToAnt(vec4 vec, float aspectRatio) {
  Ant ant;
  ant.pos = adjustCoords(vec.rg, aspectRatio); // adjustCoords transforms to the screen aspect ratio
  float antStateF;
  ant.angle = modf(vec.b, antStateF)*TAU;
  // make sure this is from 0 to 1
  if (ant.angle < 0.0)
    ant.angle += TAU;
  ant.state = uint(antStateF);
  ant.randomSeed = floatBitsToUint(vec.a);
  return ant;
}

vec4 antToVec4(Ant ant, float aspectRatio) {
  float angleNormalized = ant.angle/TAU;
  float _;
  angleNormalized = modf(angleNormalized, _);
  
  // make sure this is from 0 to 1
  if (angleNormalized < 0.0)
    angleNormalized += 1.0;
  
  return vec4(unadjustCoords(ant.pos, aspectRatio), float(ant.state) + angleNormalized, uintBitsToFloat(ant.randomSeed));
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
uint getRandomInt(inout Ant ant) {
  ant.randomSeed = hash(ant.randomSeed);
  return ant.randomSeed;
}

// [0.0, 1.0)
float getRandomFloat(inout Ant ant) {
  return float(getRandomInt(ant) % uint(1<<24)) / float(1<<24);
}

float getRandomFloat(inout Ant ant, float min, float max) {
  //return min + getRandomFloat(ant)*(max-min);
  return mix(min, max, getRandomFloat(ant));
}

///////////////////////////////
// End Common Shader Library //
///////////////////////////////
`;