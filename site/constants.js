
export const antsHeight = 1024;
export const antsWidth = 1024;
export const antsSize = 1024*1024;

export const defaultFps = 144;
export const defaultBlurAmount = 20;
export const defaultDissipation = 1.50;
export const defaultAntSpeed = 0.4;
export const defaultAntOpacity = 1.0;
export const defaultNumberOfAnts = 2000000;

export const defaultRotationSpeed = 720;
export const defaultSenseAngle = 40;
export const defaultSenseLead = 0.05;

  
export const commonVertShader = `#version 300 es
const vec2 madd=vec2(0.5,0.5);
in vec2 vertexIn;
out vec2 textureCoord;
void main() {
  textureCoord = vertexIn.xy*madd+madd; // scale vertex attribute to [0-1] range
  gl_Position = vec4(vertexIn.xy,0.0,1.0);
}
`;