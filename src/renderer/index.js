// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer, screen } = require("electron"),
  KEYS = require("../main/KEYS.js"),
  setCursorOptions = require("./set_cursor_options.js"),
  setCursorE = document.getElementById("set_cursor"),
  cleanClipE = document.getElementById("clean-clipboard"),
  controlVolE = document.getElementById("control-volume"),
  maintainClipE = document.getElementById("maintain-clipboard"),
  preventSleepE = document.getElementById("control-prevent-sleep"),
  preventSleepTimeE = document.getElementById("control-prevent-sleep-time"),
  clipBoardE = document.getElementById("clipboard-history");
let _setNewClipListenerState, clipHistory = [];

// console.log(screen.getAllDisplays().map(d => d));

document.getElementById("set_cursor_options").innerHTML = setCursorOptions(KEYS.CURSOR_POSITIONS);

setCursorE.addEventListener("click", function () {
  const setCursorElements = document.getElementsByName("set_cursor");
  for (let i = 0, len = setCursorElements.length; i < len; i++) {
    const setCursorElement = setCursorElements[i];
    if (setCursorElement.checked) {
      break;
    }
  }

  ipcRenderer.send(KEYS.SET_CURSOR, { setCursorE.checked, position:  });
}, false);


controlVolE.addEventListener("click", function () {
  ipcRenderer.send(KEYS.CONTROL_VOLUME, controlVolE.checked);
}, false);


cleanClipE.addEventListener("click", function () {
  ipcRenderer.send(KEYS.CLEAN_CLIPBOARD, cleanClipE.checked);
  checkAndToggle();
}, false);

maintainClipE.addEventListener("click", function () {
  ipcRenderer.send(KEYS.MAINTAIN_CLIPBOARD, maintainClipE.checked);
  checkAndToggle();
}, false);

preventSleepE.addEventListener("click", function () {
  preventSleepTimeE.disabled = preventSleepE.checked;
  ipcRenderer.send(KEYS.PREVENT_SLEEP, preventSleepE.checked, preventSleepTimeE.value);
}, false);

function checkAndToggle() {
  if (maintainClipE.checked || cleanClipE.checked) {
    if (!_setNewClipListenerState) {
      ipcRenderer.on(KEYS.NEW_CLIP, addNewClipListener);
      _setNewClipListenerState = true;
    }
  } else {
    ipcRenderer.removeListener(KEYS.NEW_CLIP, addNewClipListener);
    _setNewClipListenerState = false;
  }
}

function addNewClipListener(_, arg = "") {
  if (clipHistory.includes(arg)) {
    return;
  }
  clipHistory.push(arg);
  clipBoardE.innerHTML = `<div>
  <button class="button-cp" onclick="copyToClip(${clipHistory.length - 1})"
  ><i class="fa fa-copy"></i></button>&nbsp;&nbsp;
    ${typeof arg == "string" ?
      escHtml(arg.substr(0, 45)) + (arg.length > 45 ? "...." : "")
      :
      `Image <img src="${arg.icon}" alt="icon-image" titl>`
    }</div>` + clipBoardE.innerHTML;

  // https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
  function escHtml(htm = "") {
    return htm
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

function copyToClip(index) {
  const data = clipHistory[parseInt(index)];
  ipcRenderer.send(KEYS.SET_CLIP, typeof data == "string" ? data : data.index);
}
