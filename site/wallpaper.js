"use strict"

var wallpaper = {
  properties: {
    bgcolor: [1, 0, 1],
    fps: 10
  }
};

window.wallpaperPropertyListener = {
  
  applyUserProperties: function(properties) {
    // TODO: remove this and replace with something useful
    if (properties.bgcolor)
    {
      var bgColorStrArr = properties.bgcolor.value.split(" ");
      wallpaper.properties.bgcolor = bgColorStrArr.map(parseFloat);
    }
  },
  
  applyGeneralProperties: function(properties) {
    if (properties.fps) {
      wallpaper.properties.fps = properties.fps;
    }
  },
    
};
