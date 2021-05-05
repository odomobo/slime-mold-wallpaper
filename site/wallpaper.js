"use strict"

var wallpaperProperties = {
  bgcolor: [1, 0, 1],
  fps: 30
};

window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
      if (properties.bgcolor)
      {
        var bgColorStrArr = properties.bgcolor.value.split(" ");
        wallpaperProperties.bgcolor = bgColorStrArr.map(parseFloat);
      }
    }
};
