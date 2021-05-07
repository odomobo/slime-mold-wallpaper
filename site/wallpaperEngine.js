
export var wallpaperEngine = {
  bgcolor: [1, 0, 1],
  fps: 30
};

window.wallpaperEnginePropertyListener = {
  
  applyUserProperties: function(properties) {
    // TODO: remove this and replace with something useful
    if (properties.bgcolor)
    {
      var bgColorStrArr = properties.bgcolor.value.split(" ");
      wallpaperEngine.bgcolor = bgColorStrArr.map(parseFloat);
    }
  },
  
  applyGeneralProperties: function(properties) {
    if (properties.fps) {
      wallpaperEngine.fps = properties.fps;
    }
  },
    
};

export default wallpaperEngine;