# Parameters Plan

There are 3 areas I'm trying to tackle

1. Making the parameters be fairly independent from each other. That is, changing an individual parameter should
only affect a single aspect of the simulation. You shouldn't have to modify several parameters together to change
only one thing. An example: if you want to preseve the overall color density, you shouldn't have to modify
dissipation and opacity togehter, or speed and opacity together, etc.

2. Making the parameters be intuitive. This also relies on the previous, but also requires good naming and good
parameter ordering in the list. Also, less is more, and some should only show up under "advanced"

3. Making most parameter combinations be fairly pleasing. Currently, a lot of parameter combinations aren't that
great. For example, wisps may fill the entire screen. Or, wisps may be so dark that you can't see anything. Or,
wisps may get stuck in boring localized patterns with little variance.

==================================================

To solve 1, I need to find the principal parameters that a user will want to modify.

2 will be an interative process.

To solve 3, I think I need to analyze the different failure cases and see why they are boring. I think trying to
tackle it by adding additional features (for example, randomness) won't tackle the root issue, but will just be
a band-aid solution that won't help. 3 will be easier to solve once 1 is done. However, here are some observations
I've already made:

Bias (the ratio between sensor angle and rotation speed) will affect randomness: with a high bias (wider sensor 
angle) the wisps will have more individuality and can be more interesting.

Too bright or too dark can be solved by #1 (because then screen density is its own parameter).

==================================================

For #1, I need to pick some parameters, and figure out what they affect. I then need to plot each of them to the 
parameters they affect, which will tell me if any parameters can't be affected.

Wisp density: Affects opacity; influenced by tendril length (related to speed), count, screen size, dissipation

Trail length: Affects dissipation, which in turn affects density (to preserve the density on the screen). Influenced by speed.

Trail blurring: Affects blur

Zoom: (or scale) Affects speed, turning radius, lookahead distance (but not lookahead time), blur, trail length

Speed: Affects speed, but not lookahead distance. Sense angle to turning speed ratio is preserved.

Sense Bias (or: wisp excitement): affects sense angle, to adjust the ratio between sense angle and turning speed.

I guess lookahead time can be fixed for now. Play around with the other parameters to see how this factors in...

==================================================

## Normal layout:

Scene color
Wisp brightness
Number of wisps (lower = better performance)
Trail length
Zoom
Speed
Show advanced options [_]

## Advanced layout:

Scene color
Background color
  Background image (overrides background color)
  Background image mode {Blend, Add, Subtract, Brighten, Darken}
Foreground color
Wisp brightness
Number of wisps (lower = better performance)
Trail length
Zoom
Speed
Show advanced options [x]
Wisp density
Trail blurring
Wisp excitement
Wisp randomness
Edge mode {Wrap, Bounce}
Randomize parameters [_]

## Advanced layout with randomized parameters:

Scene color
  Randomize scene color [x]
  Scene color - hue randomness %
  Scene color - saturation randomness %
Background color
  Background image (overrides background color)
  Background image mode {Blend, Add, Subtract, Brighten, Darken}
Foreground color
Wisp brightness
  Randomize wisp brightness [x]
  Wisp brightness - to (random between this and base value)
Number of wisps (lower = better performance)
Trail length
  Randomize trail length [x]
  Trail length - to (random between this and base value)
Zoom
  Randomize zoom [x]
  Zoom - to (random between this and base value)
Speed
  Randomize speed [x]
  Speed - to (random between this and base value)
Show advanced options [x]
Wisp density
  Randomize wisp density [x]
  Wisp density - to (random between this and base value)
Trail blurring
  Randomize trail blurring [x]
  Trail blurring - to (random between this and base value)
Wisp excitement
  Randomize wisp excitement [x]
  Wisp excitement - to (random between this and base value)
Wisp randomness
  Randomize wisp randomness [x]
  Wisp randomness - to (random between this and base value)
Edge mode {Wrap, Bounce}
  Randomize edge mode [x]
Randomize parameters [x]
Randomization period in seconds
  Randomize randomization period [x]
  Randomization period in seconds - to (random between this and base value)