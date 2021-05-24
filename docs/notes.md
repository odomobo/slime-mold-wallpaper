# Slime Mold Wallpaper

## TODOs

Add parameter tweaking to dev version.

If you want to have n random numbers, added together, have the same standard deviation as m random numbers, 
you have to multiply each random number by sqrt(1/n) or sqrt(1/m), respectively.
For example, if you want to rotate by rand()*10 degrees each second, but you will be
updating at 30 frames per second, then you want to rotate by rand()*10*sqrt(1/30) every frame.

Why the heck can I get huge static bars under a lot of conditions? I guess it's a positive feedback loop where all wisps conform with each other.

Instead of using sensing to determine agoraphobia, do a single sample at the head after moving to determine brightness.

TODO: make draws at edges be consistent, so there's no black border which causes line borders. This can happen by teleporting after overdraw, and as part of teleporting, back up the ant into the screen. Then, don't teleport ant if it's facing the right way. See keep note.

If agoraphobia teleportation, teleport at random, so wisps can cross without destroying the cluster (instead of instant TP).

Agoraphobia shouldn't even be an option; should just be hardcoded. It's basically required when wisps are additive instead of blending.
Or maybe when disabling agoraphobia, we should also change to blend instead of additive.

Dissipation and opacity are inversely related; maybe control the ratio with 1 parameter, and the screen brightness with another. 
I think that would give better control. How should I name it? Maybe "Screen Density" and "Wisp Trail Length"?

How to make opacity invariant with number of wisps?
A. I guess scale inversely proportional to number of wisps.

How to make opacity invariant with speed? 
A. Calculate pixel size, and then calculate average length based on that.
Then scale opacity inversely with average length.

How to make opacity invariant with screen resolution?

How to make rotation invariant with speed? 
A. hmm... inversely proportional I guess

Sensor lead seconds has too large of a range; should cap at like .3 seconds or something.
Maybe call it "lookahead distance" and range from 1 to 30.

Speed either has too high of a range, or an incorrect scaling curve. Maybe both.

-Sensor angle should be calculated from rotation speed and lookahead.-
Strike that, lookahead should be calculated from sensor angle and rotation speed.
User should enter 2x sensor angle, called "Wisp field of vision".

The lookahead should be the amount of time where the sensor angle matches rotation speed.

The lookahead should be skewed by a value called "sensor bias" or something like that, centered on 0.

Positive bias (that is, wider sensor than is optimal, that is shorter lookahead) causes fanning.
Negative bias causes dull, narrowing behavior.

## Overall Goal

To make a wallpaper for wallpaper engine that follows sebastian lague's work shown here:

https://www.youtube.com/watch?v=kzwT3wQWAHE

https://www.youtube.com/watch?v=X-iSQQgOd1A

https://github.com/SebLague/Slime-Simulation

Uses the web wallpaper engine, because the shaders supported by wallpaper engine can't save to a texture or a buffer, and no compute shader support.

## New features I definitely want

Make opacity invariant with number of wisps.

Make opacity invariant with speed (correct with average tendril length).

Make opacity invariant with screen resolution

Make blur invariant with screen resolution???

Instantly adjust parameters whenever user touches them.

Logic to randomly vary the parameters, based on hyper parameters:

* there'll be a master parameter called "Enable Randomness" or something
* then, when that's enabled, each parameter will have an option called like "Enable randomness for Wisp Density"
* then when that's enabled, there'll be another parameter called something like "Wisp Density - To (randomly picks value between base Wisp Density and this value)" or something... it'll just be the other end of the scale, and it'll be random between those two points
* scene color will have that, except it'll be hue and saturation randomness amounts, so a little different.
* new option, "Update every x seconds", which itself can also be randomized

Update webpack build to do everything for me - no manual steps.

## Additional ideas to play around with

Add randomness to boids, with parameter to control boid randomness.

-Or, give boids an "individualism" parameter instead of randomness. Individualism will adjust bias, wihch determines how much the boids will follow or stray from the path.-
I don't like this idea.

Different boid sensing logic: try seb lague's logic, but also try to adjust angle depending on absolute difference between center and side sensor. Maybe...

Foreground and background color.

Background image?

Foreground image???

## Mentions

Jam3, https://github.com/Jam3/glsl-fast-gaussian-blur
Sebastian Lague, https://github.com/SebLague/Slime-Simulation/