// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer, clipboard } = require("electron"),
  KEYS = require("../js/KEYS.js"),
  setCursorE = document.getElementById("set-cursor"),
  cleanClipE = document.getElementById("clean-clipboard"),
  controlVolE = document.getElementById("control-volume"),
  maintainClipE = document.getElementById("maintain-clipboard");
let _setNewClipListenerState, clipHistory = [];

setCursorE.addEventListener("click", function () {
  ipcRenderer.send(KEYS.SET_CURSOR, setCursorE.checked);
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


function checkAndToggle() {
  if (maintainClipE.checked || cleanClipE.checked) {
    if (!_setNewClipListenerState) {
      ipcRenderer.on(KEYS.SET_NEW_CLIP, addNewClipListener);
      _setNewClipListenerState = true;
    }
  } else {
    ipcRenderer.removeListener(KEYS.SET_NEW_CLIP, addNewClipListener);
    _setNewClipListenerState = false;
  }
}


function addNewClipListener(_, arg) {
  if (clipHistory.includes(arg)) {
    return;
  }
  clipHistory.push(arg);
  const clipBoardE = document.getElementById("clipboard-history");
  clipBoardE.innerHTML =
    `<button style="font-size:12px" onclick="setClip('${clipHistory.length - 1}')"><i class="fa fa-copy"></i></button>
      &nbsp;&nbsp;
      ${arg.length > 45 ? arg.substr(0, 45) + "<span class='text-24'>...</span>" : arg}<br>` + clipBoardE.innerHTML;
}

function setClip(index) {
  clipboard.writeText(clipHistory[parseInt(index)]);
}