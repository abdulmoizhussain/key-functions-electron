function _breakAndTurnIntoTitleCase(sentence = "") {
  sentence = sentence.replace(/_/g, " ").toLowerCase();
  const words = sentence.split(" ");
  let result = "";
  for (let i = 0, len = words.length; i < len; i++) {
    result += words[i][0].toUpperCase() + words[i].slice(1);
  }
  return result;
}

module.exports = function (cursorPositions = {}) {
  let result = '';
  const cursorPositionKeys = Object.keys(cursorPositions);
  for (let i = 0, len = cursorPositionKeys.length; i < len; i++) {
    const key = cursorPositionKeys[i];

    result += `<div>
      <input name="set_cursor" type="radio" id="${key}">
      <label for="${key}">${_breakAndTurnIntoTitleCase(key)}</label>
    </div>`;
  }
  return result;
}