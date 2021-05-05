helper globals:
* err: a paragraph that you can see innerHTML to show error message.
* gl: the opengl object

All shaders live in the html. 

There are helpers to load shaders and programs in glhelper.js. 

renderer.js has all logic to render to the screen. It will also set the correct color mapping for pheremones.

wallpaper.js handles extracting the properties for wallpaper engine.

boids.js will handle compute shader processing for the boids. Renders into a 1024x1024 texture, each pixel stores x, y, direction, rnd.
Final step, it paints a pixel on the pheremone texture.
The texture will be randomize on program startup... somehow.

pheremone.js will handle blurring the pheremone. It manages the pheremone texture.