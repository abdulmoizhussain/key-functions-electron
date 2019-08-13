// To get CPU usage:
// https://gist.github.com/bag-man/5570809
// https://nodejs.org/api/os.html#os_os_cpus

const robot = require("robotjs");

module.exports = class PreventSleep {
  /**
   * After every defined minutes, will check if computer is on idle state. Will move mouse pointer, to prevent idleness.
   * @param {number} minutes 
   */
  constructor(minutes = 15) {
    minutes = minutes > 15 ? 15 : minutes;
    this.intervalSeconds = 1000 * (60 * minutes / 5);
    this.mousePositions = Array(5).fill({ x: 0, y: 0 });
  }

  start() {
    this.intervalId = setInterval(() => {

      this.mousePositions.shift();
      const lastPosition = robot.getMousePos();
      this.mousePositions.push(lastPosition);

      {
        const p1 = this.mousePositions[0];
        for (const p2 of this.mousePositions)
          if (p1.x != p2.x || p1.y != p2.y)
            return;
      }
      console.log("change");
      // when x is already at 0 pixel.
      robot.moveMouse(lastPosition.x == 0 ? 1 : 0, lastPosition.y);
      // now move back to previous pixel, leaving pointer's position visually unchanged.
      robot.moveMouse(lastPosition.x, lastPosition.y);

    }, this.intervalSeconds);
  }

  stop() {
    clearInterval(this.intervalId);
    return null;
  }
}
