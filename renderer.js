// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// const { globalShortcut } = require("electron");
const { ipcRenderer } = require("electron");
const electron = require("electron");
// const robot = require("robotjs");

// const robot = require("robotjs");

(() => {
  // console.log(electron);
  // console.log(electron.app);
  // robot.moveMouse(0, 0);
})();

ipcRenderer.on("ping", (event, msg) => {
  console.log(msg);
});