module.exports = class ScreenCorners {
  constructor(screen) {
    const { CURSOR_POSITIONS } = require("../common/constants");
    const size = screen.getPrimaryDisplay().size;
    const w = size.width, h = size.height;

    this.positions = {
      [CURSOR_POSITIONS.MIDDLE_TOP]: { x: Math.floor(w / 2), y: 0 },

      [CURSOR_POSITIONS.TOP_RIGHT]: { x: w - 1, y: 0 },

      [CURSOR_POSITIONS.MIDDLE_RIGHT]: { x: w - 1, y: Math.floor(h / 2) },

      [CURSOR_POSITIONS.BOTTON_RIGHT]: { x: w - 1, y: h - 1 },

      [CURSOR_POSITIONS.MIDDLE_BOTTOM]: { x: Math.floor(w / 2), y: h - 1 },

      [CURSOR_POSITIONS.BOTTOM_LEFT]: { x: 0, y: h - 1 },

      [CURSOR_POSITIONS.MIDDLE_LEFT]: { x: 0, y: Math.floor(h / 2) },

      [CURSOR_POSITIONS.TOP_LEFT]: { x: 0, y: 0 },
    };
  }

  getPosition(positionKey) {
    return this.positions[positionKey];
  }
}
