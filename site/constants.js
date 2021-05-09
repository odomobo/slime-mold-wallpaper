
export const antsTextureWidth = 1024;

export const defaultRenderColor = [0.40, 0.50, 0.56];
export const defaultBrightness = 1.0;
export const defaultInverted = false;

export const defaultFps = 30;
export const defaultBlurAmount = 20;
export const defaultDissipation = 0.5;
export const defaultAntSpeed = 0.15;
export const defaultAntOpacity = 2;
export const defaultNumberOfAnts = 100000;
export const defaultAgoraphobic = false;

export const defaultRotationSpeed = 180;
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