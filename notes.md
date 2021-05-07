# Slime Mold Wallpaper

## Current problems

Need to fix performance issues; maybe scale back number of ants for now.

## Overall Goal

To make a wallpaper for wallpaper engine that follows sebastian lague's work shown here:

https://www.youtube.com/watch?v=kzwT3wQWAHE

https://www.youtube.com/watch?v=X-iSQQgOd1A

https://github.com/SebLague/Slime-Simulation

Uses the web wallpaper engine, because the shaders supported by wallpaper engine can't save to a texture or a buffer, and no compute shader support.

## Additional step ideas:

Add randomness to boids.

Use color mapping when painting pheremone texture. Mapping can be programmatically passed into shader. Simple way to pass this information is with hue, saturation.

Parameter to control boid randomness.

Logic to programmatically vary the parameters, based on hyper parameters:

* enable randomness for color, or use fixed color
* for the other three values, set average value and variance amount.
* set average duration between changing and variance amount.
