// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, clipboard: clipElectron } = require("electron"),
  clipExtended = require("electron-clipboard-extended"),
  robot = require("robotjs"),
  ioHook = require("iohook"),
  path = require("path"),
  KEYS = require("../common/constants"),
  ScreenCorners = require("./ScreenCorners"),
  // systemControl = require("system-control")(),
  winAudio = require("win-audio"),
  PreventSleep = require("./PreventSleep"),
  lettersPressed = [], // list of letters/alphabets pressed
  keyTimes = [], // list of milisecond times of lettersPressed.
  images = [],
  LENGTH = 5; // after typing how many keys mouse will be moved from front (set mouse position)

const _keyCodesToExclude = new Set([8, 9, 13, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 44, 45, 46, 91, 92, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 145, 160, 161, 162, 163, 164, 165]);
let _setCursorButton, _cleanClipButton, _maintainClipButton, _controlVolumeButton, _keyUpListenerState, _keyDownListenerState, _clipListenerState, _imageListenerState, _cursorPosition, _screenCorners;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let _mainWindow;

function createWindow() {
  _screenCorners = new ScreenCorners(require("electron").screen);

  // Create the browser window.
  _mainWindow = new BrowserWindow({
    width: 640,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  _mainWindow.loadFile("src/renderer/index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  _mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    _mainWindow = null;
  });

  _mainWindow.on("minimize", function () {
    // mainWindow.hide();
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
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (_mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on(KEYS.SET_CURSOR, function (_, arg) {
  _setCursorButton = arg.setCursor;
  _cursorPosition = arg.cursorPosition;
  checkAndToggle();
});
ipcMain.on(KEYS.CONTROL_VOLUME, function (_, arg) { _controlVolumeButton = arg; checkAndToggle(); });
ipcMain.on(KEYS.MAINTAIN_CLIPBOARD, function (_, arg) { _maintainClipButton = arg; checkAndToggle(); });
ipcMain.on(KEYS.CLEAN_CLIPBOARD, function (_, arg) { _cleanClipButton = arg; checkAndToggle(); });

function checkAndToggle() {

  // SET_CURSOR
  if (_setCursorButton) {
    if (!_keyUpListenerState) {
      ioHook.on("keyup", keyUpListener);
      _keyUpListenerState = true;
    }
  } else {
    ioHook.removeListener("keyup", keyUpListener);
    _keyUpListenerState = false;
  }

  // CONTROL_VOLUME
  if (_controlVolumeButton) {
    if (!_keyDownListenerState) {
      ioHook.on("keydown", keyDownListener);
      _keyDownListenerState = true;
    }
  } else {
    ioHook.removeListener("keydown", keyDownListener);
    _keyDownListenerState = false;
  }

  if (_setCursorButton || _controlVolumeButton) {
    ioHook.start();
  } else {
    ioHook.stop();
    // _keyUpListenerState = false;
  }

  // CLEAN_CLIPBOARD
  // MAINTAIN_CLIPBOARD
  if (_cleanClipButton || _maintainClipButton) {
    if (!_clipListenerState) {
      clipExtended.on("text-changed", manageTextChange);
      clipExtended.startWatching();
      _clipListenerState = true;
    }
    if (_maintainClipButton) {
      if (!_imageListenerState) {
        clipExtended.on("image-changed", manageImageChange);
        clipExtended.startWatching();
        _imageListenerState = true;
      }
    } else {
      clipExtended.off("image-changed", manageImageChange);
      _imageListenerState = false;
    }
  } else {
    clipExtended.off("text-changed", manageTextChange);
    clipExtended.stopWatching();
    _imageListenerState = _clipListenerState = false;
  }
}

function manageImageChange() {
  const image = clipElectron.readImage("clipboard");
  const icon = image.resize({ width: 16, height: 16 }).toDataURL();
  if (!images.filter(i => i.icon == icon).length) {
    images.push({ image, icon });
    _mainWindow.webContents.send(KEYS.NEW_CLIP, {
      index: images.length - 1,
      icon,
      title: image.resize({ width: 128, height: 128 }).toDataURL(),
    });
  }
}

function manageTextChange() {
  // mis https://www.npmjs.com/package/electron-clipboard-extended
  let clipText = clipElectron.readText("clipboard");
  if (_cleanClipButton) {
    if (clipText.trim().substr(0, 4).toLowerCase() === "mis ") { // must be in start with a space
      clipText = clipText
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .replace("mis ", "")
        .replace("MIS ", "");
    } else if (!_maintainClipButton) {
      return;
    }
  }
  clipElectron.writeText(clipText, "clipboard");
  _mainWindow.webContents.send(KEYS.NEW_CLIP, clipText);
}

function keyUpListener(e) {
  // { shiftKey: false, altKey: false, ctrlKey: false, metaKey: false, keycode: 61010, rawcode: 45, type: "keyup" }

  // stopping only alphabet characters 65 - 90
  // if (_setCursorButton && e.rawcode > 64 & e.rawcode < 91) {
  if (_setCursorButton && !_keyCodesToExclude.has(e.rawcode)) {
    // if (lettersPressed.length == LENGTH) {
    //   lettersPressed.shift();
    // }
    // lettersPressed.push(String.fromCharCode(e.rawcode));

    // e.g regex: "a{5,5}" , check if "a" occurs five time in string
    // e.g str to match: asdfg
    // if (RegExp(`${lettersPressed[lettersPressed.length - 1]}{${LENGTH},${LENGTH}}`).test(lettersPressed.join(""))) {
    //   return;
    // }

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
      const mousePos = robot.getMousePos();
      const cPos = _screenCorners.getPosition(_cursorPosition);

      // if (!mousePos.x) return;
      if (mousePos.x == cPos.x && mousePos.y == cPos.y) return;

      robot.moveMouse(cPos.x, cPos.y);

      setTimeout(function () {
        // this time period is necessary, if we attach listener just after mouse movement at (0, 0), the handler will be immediately called, therefore it needs at least 100 miliseconds.
        ioHook.on("mousemove", handleMouseMove);
        ioHook.on("mousedown", handleMouseMove);
      }, 100);

      function handleMouseMove() {
        ioHook.removeListener("mousemove", handleMouseMove);
        ioHook.removeListener("mousedown", handleMouseMove);
        robot.moveMouse(mousePos.x, mousePos.y);
      }
    }
  }
};

function keyDownListener(e) {
  // { amount: 3, clicks: 1, direction: 3, rotation: 1, type: 'mousewheel', x: 466, y: 683 }
  if (_controlVolumeButton && e.shiftKey && e.ctrlKey && e.altKey) {
    if (e.rawcode === 38) { // up key
      // systemControl.audio.getSystemVolume().then(console.log);
      // winAudio.speaker.set(Math.round((winAudio.speaker.get() + 10) / 10) * 10);
      winAudio.speaker.set(winAudio.speaker.get() + 10);
    }
    if (e.rawcode === 40) { // down key
      // winAudio.speaker.set(Math.round((winAudio.speaker.get() - 10) / 10) * 10);
      winAudio.speaker.set(winAudio.speaker.get() - 10);
    }
  }
}

ipcMain.on(KEYS.SET_CLIP, function (_, indexOrText) {
  if (typeof indexOrText === "number") { // an image to copy to clipboard
    clipElectron.writeImage(images[indexOrText].image, "clipboard");
  } else { // some text to copy to clipboard
    clipElectron.writeText(indexOrText, "clipboard");
  }
});

let mPreventSleep;
ipcMain.on(KEYS.PREVENT_SLEEP, function (_, preventSleepSwitch, preventSleepTime) {
  if (preventSleepSwitch) {
    let timeInMinutes = parseInt(preventSleepTime) || 10;
    mPreventSleep = new PreventSleep(timeInMinutes);
    mPreventSleep.start();
  } else {
    mPreventSleep = mPreventSleep.stop();
  }
});
