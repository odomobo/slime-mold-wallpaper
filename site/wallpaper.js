"use strict"

var wallpaperProperties = {
  bgcolor: [1, 0, 1],
  fps: 30
};

window.wallpaperPropertyListener = {
  
  applyUserProperties: function(properties) {
    // TODO: remove this and replace with something useful
    if (properties.bgcolor)
    {
      var bgColorStrArr = properties.bgcolor.value.split(" ");
      wallpaperProperties.bgcolor = bgColorStrArr.map(parseFloat);
    }
  },
  
  applyGeneralProperties: function(properties) {
    if (properties.fps) {
      generalData.fps = wallpaperProperties.fps;
    }
  }
    
};
