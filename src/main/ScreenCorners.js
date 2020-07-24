module.exports = class ScreenCorners {
  constructor(screen) {
    const { CURSOR_POSITIONS } = require("../common/constants");
    const size = screen.getPrimaryDisplay().size;
    const w = size.width, h = size.height;
    const halfOfWidth = Math.floor(w / 2), halfOfHeight = Math.floor(h / 2);

    this.positions = {
      [CURSOR_POSITIONS.MIDDLE_TOP]: { x: halfOfWidth, y: 0 },

      [CURSOR_POSITIONS.TOP_RIGHT]: { x: w - 1, y: 0 },

      [CURSOR_POSITIONS.MIDDLE_RIGHT]: { x: w - 1, y: halfOfHeight },

      [CURSOR_POSITIONS.BOTTOM_RIGHT]: { x: w - 1, y: h - 1 },

      [CURSOR_POSITIONS.MIDDLE_BOTTOM]: { x: halfOfWidth, y: h - 1 },

      [CURSOR_POSITIONS.BOTTOM_LEFT]: { x: 0, y: h - 1 },

      [CURSOR_POSITIONS.MIDDLE_LEFT]: { x: 0, y: halfOfHeight },

      [CURSOR_POSITIONS.TOP_LEFT]: { x: 0, y: 0 },
    };
  }

  getPosition(positionKey) {
    return this.positions[positionKey];
  }
};
