Sprite.setTexture has a new `destroyBase` parameter - set this to `true` if you know the base used a generated texture that isn't being used by any other sprites. This will free-up the canvas for further re-use by other calls to `generateTexture` or Text objects.

PIXI.CanvasPool is a new static global created to deal with the issue of resource leaks and continuous DOM node build-up when creating lots of Text or BitmapData objects, or when calling `generateTexture` on any display object. The CanvasPool will do its best to re-use out dated canvas elements rather than filling up the DOM with new ones.

////(1, 0, PIXI.WebGLRenderer);