// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, clipboard: clipElectron } = require("electron"),
  clipExtended = require("electron-clipboard-extended"),
  robot = require("robotjs"),
  ioHook = require("iohook"),
  path = require("path"),
  KEYS = require("./KEYS"),
  // systemControl = require("system-control")(),
  winAudio = require("win-audio"),
  lettersPressed = [], // list of letters/alphabets pressed
  keyTimes = [], // list of milisecond times of lettersPressed.
  LENGTH = 5; // after typing how many keys mouse will be moved from front (set mouse position)

let _setCursorButton, _cleanClipButton, _maintainClipButton, _controlVolumeButton, _keyUpListenerState, _keyDownListenerState, _clipListenerState;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile("src/renderer/index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
})

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on(KEYS.SET_CURSOR, function (_, arg) { _setCursorButton = arg; checkAndToggle(); });
ipcMain.on(KEYS.CONTROL_VOLUME, function (_, arg) { _controlVolumeButton = arg; checkAndToggle(); });
ipcMain.on(KEYS.MAINTAIN_CLIPBOARD, function (_, arg) { _maintainClipButton = arg; checkAndToggle(); });
ipcMain.on(KEYS.CLEAN_CLIPBOARD, function (_, arg) { _cleanClipButton = arg; checkAndToggle(); });

function checkAndToggle() {
  if (_setCursorButton) {
    if (!_keyUpListenerState) {
      ioHook.on("keyup", keyUpListener);
      _keyUpListenerState = true;
    }
  } else {
    ioHook.removeListener("keyup", keyUpListener);
    _keyUpListenerState = false;
  }

  if (_controlVolumeButton) {
    if (!_keyDownListenerState) {
      ioHook.on("keydown", KeyDownListener);
      _keyDownListenerState = true;
    }
  } else {
    ioHook.removeListener("keydown", KeyDownListener);
    _keyDownListenerState = false;
  }

  if (_setCursorButton || _controlVolumeButton) {
    ioHook.start();
  } else {
    ioHook.stop();
    // _keyUpListenerState = false;
  }

  if (_cleanClipButton || _maintainClipButton) {
    if (!_clipListenerState) {
      clipExtended.on("text-changed", maintainClipboard);
      clipExtended.startWatching();
      _clipListenerState = true;
    }
  } else {
    clipExtended.off("text-changed");
    clipExtended.stopWatching();
    _clipListenerState = false;
  }
}

function maintainClipboard() {
  // mis https://www.npmjs.com/package/electron-clipboard-extended
  let clipText = clipElectron.readText("clipboard");
  if (_cleanClipButton) {
    if (clipText.trim().substr(0, 4).toLowerCase() == "mis ") { // must be in start with a space
      clipText = clipText.replace(/[^a-zA-Z0-9]+/g, " ").trim().replace("mis ", "");
    } else if (!_maintainClipButton) {
      return;
    }
  }
  clipElectron.writeText(clipText, "clipboard");
  mainWindow.webContents.send(KEYS.SET_NEW_CLIP, clipText);
}

function keyUpListener(e) {
  // { shiftKey: false, altKey: false, ctrlKey: false, metaKey: false, keycode: 61010, rawcode: 45, type: "keyup" }

  if (_setCursorButton && e.rawcode > 64 & e.rawcode < 91) {

    if (lettersPressed.length == LENGTH) {
      lettersPressed.shift();
    }
    lettersPressed.push(String.fromCharCode(e.rawcode));

    // e.g regex: "a{5,5}" , check if "a" occurs five time in string
    // e.g str to match: asdfg
    if (RegExp(`${lettersPressed[lettersPressed.length - 1]}{${LENGTH},${LENGTH}}`).test(lettersPressed.join(""))) {
      return;
    }

    if (keyTimes.length == LENGTH) {
      keyTimes.shift();
    }
    keyTimes.push(new Date().getTime());

    if (keyTimes.length < 5) { return; }

    const differences = Array(LENGTH - 1).fill(0);
    for (let i = 0; i < differences.length; i++) {
      differences[i] = keyTimes[i + 1] - keyTimes[i];
    }

    if ((differences.reduce((a, b) => a + b, 0) / differences.length) < 300) {
      robot.moveMouse(0, 0);
    }
  }
};

function KeyDownListener(e) {
  // { amount: 3, clicks: 1, direction: 3, rotation: 1, type: 'mousewheel', x: 466, y: 683 }
  if (_controlVolumeButton && e.shiftKey && e.ctrlKey && e.altKey) {
    if (e.rawcode == 38) { // up key
      // systemControl.audio.getSystemVolume().then(console.log);
      // winAudio.speaker.set(Math.round((winAudio.speaker.get() + 10) / 10) * 10);
      winAudio.speaker.set(winAudio.speaker.get() + 10);
    }
    if (e.rawcode == 40) { // down key
      // winAudio.speaker.set(Math.round((winAudio.speaker.get() - 10) / 10) * 10);
      winAudio.speaker.set(winAudio.speaker.get() - 10);
    }
  }
}
