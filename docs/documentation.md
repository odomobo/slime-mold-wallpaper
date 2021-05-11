helper globals:
* err: a paragraph that you can see innerHTML to show error message.
* gl: the opengl object

All shaders live in the html. 

Update to use twgl.

There are helpers to load shaders and programs in glhelper.js. 

wallpaper.js handles extracting the properties for wallpaper engine.

moveAnts.js will handle compute shader processing to move the ants around. Renders into a 1Mx1 texture, each pixel stores x, y, direction, rnd.
The texture will be randomize on program startup... somehow.

blurPheremone.js will handle blurring the pheremone.

renderAnts.js will handle rendering the ants onto the pheremone texture.

renderToScreen.js will handle rendering the pheremone texture to the screen. It will also set the correct color mapping for pheremones.

glObjects.js will store textures and buffers.

=============

Well have the following textures:

antsIn and antsOut, which are 4 channels per pixel, with a float32 per channel:

{
  r: the x coordinate on the screen, scaled from 0 to 1. To make the coords square, this should be multiplied by the aspect ratio.
  g: the y coordinate on the screen, scaled from 0 to 1.
  b: The floating point of this is the angle, scaled from 0 to 1 (exclusive). To turn this into the angle, it should be multiplied by 2pi.
     If the number is negative, then 1 needs to be added to the floating point value to bring it between 0 and 1.
     The whole part of this is a state value, which can be used for any purpose needed for ant logic. This should be 0 for normal operation.
  a: The random seed. This is a uint32, so it needs a reinterpret cast to get from float to int and back.
}
No mipmapping, and sampling for nearest. The values will be init to random noise on each channel from 0 to 1.

pheremonesIn and pheremonesOut, which are grayscale at 8 bits per pixel. There should be mipmapping on this. Sampling linear.
pheremonesIn will be init to black.

There will be a vertex buffer antsDrawBuffer of 2M 2d vertices. This will be set to [0,0, 0,1, 1,0, 1,1, 2,0, 2,1, ... 1M,0, 1M,1].
These are the indices that will help draw the ants as lines onto the pheremonesOut buffer.

We'll need 4 programs, as seen before. Each of these should be its own module.

With all of this, the algorithm works as follows:

### Swap in and out textures
old out needs to become new in.

### Blur pheremones
render onto pheremonesOut, with a quad write, taking pheremonesIn as a uniform to the frag shader.
The frag shader samples the values around the location to determine the new pixel value.

### Move ants
render onto antsOut, with a quad write, taking antsIn and pheremonesOut as uniforms to the frag shader.
For each ant, samples a couple areas in front of the ant (in pheremonesOut) to determine new angle, updates angle, and advances ant (with wall collision logic).
Saves new values (including new random seed).

### Render ants
render onto pheremonesOut, with a batched line call, using pairs on antsDrawBuffer as the start and end indices.
Takes antsIn and antsOut as uniforms to the vert shader. Simple frag shader draws a transluscent white.
Vert shader uses y to determine if antsIn or antsOut (0 or 1), and then x to determine lookup into the
appropriate texture. Uses r and g from the ants texture to pass as coords to the frag shader.

### Render to screen
render pheremonesOut to screen, with a quad write. Use a color mapping to make it look interesting.
