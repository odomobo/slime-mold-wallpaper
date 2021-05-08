# Slime Mold Wallpaper

## Current problems

Need to fix performance issues; maybe scale back number of ants for now. I'm thinking the issues might be that all the textures are floats, so it's inherently slower.

How to make opacity invariant with number of wisps?
A. I guess scale inversely proportional to number of wisps.

How to make rotation invariant with speed? 
A. I don't think I should; their speed should influence their turning radius.

How to make opacity invariant with speed? 
A. Calculate pixel size, and then calculate average length based on that (adding root2 pixels, to correlate with fudge factor in shader).
Then scale opacity inversely with average length.

## Overall Goal

To make a wallpaper for wallpaper engine that follows sebastian lague's work shown here:

https://www.youtube.com/watch?v=kzwT3wQWAHE

https://www.youtube.com/watch?v=X-iSQQgOd1A

https://github.com/SebLague/Slime-Simulation

Uses the web wallpaper engine, because the shaders supported by wallpaper engine can't save to a texture or a buffer, and no compute shader support.

## New features I definitely want

Make opacity invariant with number of wisps.

Make opacity invariant with speed (correct with average tendril length).

Instantly adjust parameters whenever user touches them.

Dynamically resize ants texture when changing number of ants; this will improve efficiency by quite a bit.
This includes reading ant texture size through parameters module, and regenerating the ants textures
whenever this updates from its previous size.

Logic to randomly vary the parameters, based on hyper parameters:

* there'll be a master parameter called "Enable Randomness" or something
* then, when that's enabled, each parameter will have an option called like "Enable randomness for _____"
* then when that's enabled, there'll be another parameter called something like "___ Rand Amount" or something... it'll just be the other end of the scale, and it'll be random between those two points
* scene color will have that, except it'll be hue and saturation randomness amounts, so a little different.
* new option, "Update every x seconds", which itself can also be randomized

Update webpack build to do everything for me - no manual steps. Have bea help with that.

## Additional ideas to play around with

Add randomness to boids, with parameter to control boid randomness.

Different boid sensing logic: try seb lague's logic, but also try to adjust angle depending on absolute difference between center and side sensor.

Play around with edge algorithms: edge avoidance (as currently), wall bouncing at normal (as currently), 
wall bouncing at random angle, teleporting (to opposite edge, or to random location?).
Teleporting has the problem that it mustn't leave streaks across the screen... how????

Foreground and background color?

Foreground and background images????
