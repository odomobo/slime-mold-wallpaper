# Slime Mold Wallpaper

## TODOs

Control edge behavior through constants in move ants shader

Use randomization to make wisps turn for a random number of frames.
Agoraphobia increases the chance that the wisps will turn when in a dense area, as measured by the max brightness.
This will allow them to create new tendrils, instead of making lanes.

Dissipation and opacity are inversely related; maybe control the ratio with 1 parameter, and the screen brightness with another. 
I think that would give better control. How should I name it? Maybe "Screen Density" and "Wisp Trail Length"?

How to make opacity invariant with number of wisps?
A. I guess scale inversely proportional to number of wisps.

How to make opacity invariant with speed? 
A. Calculate pixel size, and then calculate average length based on that (adding root2 pixels, to correlate with fudge factor in shader).
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
* then, when that's enabled, each parameter will have an option called like "Enable randomness for _____"
* then when that's enabled, there'll be another parameter called something like "___ Rand Amount" or something... it'll just be the other end of the scale, and it'll be random between those two points
* scene color will have that, except it'll be hue and saturation randomness amounts, so a little different.
* new option, "Update every x seconds", which itself can also be randomized

Update webpack build to do everything for me - no manual steps. Have bea help with that.

## Additional ideas to play around with

Add randomness to boids, with parameter to control boid randomness.

Or, give boids an "individualism" parameter instead of randomness. Individualism will adjust bias, wihch determines how much the boids will follow or stray from the path.

Different boid sensing logic: try seb lague's logic, but also try to adjust angle depending on absolute difference between center and side sensor.

Play around with edge algorithms: edge avoidance (as currently), wall bouncing at normal (as currently), 
wall bouncing at random angle, teleporting (to opposite edge, or to random location?).
Teleporting has the problem that it mustn't leave streaks across the screen... how????

Foreground and background color?

Foreground and background images????

## Mentions

Jam3, https://github.com/Jam3/glsl-fast-gaussian-blur
Sebastian Lague, https://github.com/SebLague/Slime-Simulation/