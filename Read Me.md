#Key Functions
#<a href="https://drive.google.com/open?id=15QgUQuEK-Qh63yRwi7v4UYU-pOE_0Q25">Download for Windows</a>

###Versions used during development are:
NodeJS -> 10.0.0
electron -> 2.0.18
robotjs -> 0.5.1

####Want to customize? Clone and do `npm i`
After `npm i` do the following steps:

####Step 1:
For **robotjs** to build after `npm i`
`npm rebuild --runtime=electron --target=2.0.18 --disturl=https://atom.io/download/atom-shell --abi=64`

####Step 2:
For **win-audio** to build after `npm i`
`node_modules\.bin\electron-rebuild`

####Libraries used:
https://github.com/sidharth0094/robotjs

https://www.npmjs.com/package/win-audio

https://www.npmjs.com/package/system-control

https://www.npmjs.com/package/iohook
https://wilix-team.github.io/iohook/installation.html
https://wilix-team.github.io/iohook/usage.html

https://www.npmjs.com/package/electron-abi


####NodeJS Previous Releases:
https://nodejs.org/en/download/releases/


####Some library related issues were resolved with help of the following links:

https://stackoverflow.com/questions/31130150/in-electron-framework-can-i-access-clipboard

https://github.com/octalmage/robotjs/wiki/Electron

https://github.com/octalmage/robotjs/issues/486

https://github.com/octalmage/robotjs/releases/tag/v0.5.1

https://github.com/Streampunk/naudiodon/issues/12
