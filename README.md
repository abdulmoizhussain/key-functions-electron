<img src="https://github.com/abdulmoizhussain/key-functions-electron/blob/master/images/key-functions.PNG" alt="thats how i look like">

# Key Functions <a href="https://github.com/abdulmoizhussain/key-functions-electron/releases">Download here</a>

#### * Removes cursor from front while typing.
#### * Keeps your clipboard's texts & images in memory to be reused later <a href="https://www.addictivetips.com/windows-tips/view-clipboard-history-on-windows-10/">(like that of windows 10)</a>.
#### * Cleans special characters from clipboard-text to be easily searched at google <a href="https://github.com/abdulmoizhussain/key-functions#clean-special-characters-from-clipboard">(how to use it)</a>.
#### * Increase/Decrease volume by 10% with `Ctrl + Alt + Shift + Up/Down` keys.

### Versions used during development are:
NodeJS -> 10.0.0 <br>
electron -> 2.0.18 <br>
robotjs -> 0.5.1 <br>

#### Want to customize? Clone and `npm i`
After `npm i` do the following steps:

#### Step 1:
For **robotjs** to build after `npm i`

`npm rebuild --runtime=electron --target=2.0.18 --disturl=https://atom.io/download/atom-shell --abi=64`

#### Step 2:
For **win-audio** to build after `npm i`

`node_modules\.bin\electron-rebuild`

#### Libraries used:
https://github.com/sidharth0094/robotjs

https://www.npmjs.com/package/win-audio

https://www.npmjs.com/package/system-control

https://www.npmjs.com/package/iohook <br>
https://wilix-team.github.io/iohook/installation.html <br>
https://wilix-team.github.io/iohook/usage.html <br>

https://www.npmjs.com/package/electron-abi


#### NodeJS Previous Releases:
https://nodejs.org/en/download/releases/
https://nodejs.org/dist/


#### Some library related issues were resolved with help of the following links:

https://stackoverflow.com/questions/31130150/in-electron-framework-can-i-access-clipboard

https://github.com/octalmage/robotjs/wiki/Electron

https://github.com/octalmage/robotjs/issues/486

https://github.com/octalmage/robotjs/releases/tag/v0.5.1

https://github.com/Streampunk/naudiodon/issues/12
