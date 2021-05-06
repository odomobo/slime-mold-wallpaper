# Slime Mold Wallpaper

## Current problems

None right now

## Overall Goal

To make a wallpaper for wallpaper engine that follows sebastian lague's work shown here:

https://www.youtube.com/watch?v=kzwT3wQWAHE

https://www.youtube.com/watch?v=X-iSQQgOd1A

https://github.com/SebLague/Slime-Simulation

Uses the web wallpaper engine, because the shaders supported by wallpaper engine can't save to a texture or a buffer, and no compute shader support.

## Steps

1. [x] Launch in browser (should use simple web server thingie).

2. [x] Get a simple vertex shader working in webgl. Should display red to the screen, with yellow circle corners.

3. [x] Save to github.

4. [x] Get working in wallpaper engine.

5. [x] Get simple parameter working in wallpaper engine, to change the background color for example.

6. [x] Get rendering to texture working.

7. [ ] Initialize ants texture with noise.

8. [ ] Render ants texture to screen.

9. [ ] Paint ants to screen from ants texture.

x. [ ] Step 1 from seb lague. Compute buffer with all boid information, initialized with maybe random values. Pheremone texture initialized to black. Compute shader that moves boids and paints to pheremone texture. Fragment shader that draws pheremone texture.

x. [ ] Have boids bounce off walls.

x. [ ] Compute shader that blurs pheremone texture.

x. [ ] Have boids follow pheremones (scanning 3 points in front to determine direction).

x. [ ] Add randomness to boids.

## Additional step ideas:

Use color mapping when painting pheremone texture. Mapping can be programmatically passed into shader. Simple way to pass this information is with hue, saturation.

Parameter to control boid randomness.

Parameter to control boid speed.

Parameter to control blur diffusion.

Logic to programmatically vary the parameters, based on hyper parameters:

* enable randomness for color, or use fixed color
* for the other three values, set average value and variance amount.
* set average duration between changing and variance amount.
