
export const antsHeight = 1024;
export const antsWidth = 1024;
export const antsSize = 1024*1024;

export const defaultFps = 30;
export const defaultBlurAmount = 15;
export const defaultDissipation = 0.1;
export const defaultAntSpeed = 0.01;
export const defaultAntOpacity = 30;

  
export const commonVertShader = `#version 300 es
const vec2 madd=vec2(0.5,0.5);
in vec2 vertexIn;
out vec2 textureCoord;
void main() {
  textureCoord = vertexIn.xy*madd+madd; // scale vertex attribute to [0-1] range
  gl_Position = vec4(vertexIn.xy,0.0,1.0);
}
`;