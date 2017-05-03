'use strict';
/*
* Edit the folowing setting.
* 
*/

const kodi_ip = '10.2.1.28';
const kodi_port = 8080;
const kodi_login = 'kodi';
const kodi_password = '';


/*
* Driver:
* 
*/
const kodi = require('kodi-jsonrpc-http-post');
const neeoapi = require('neeo-sdk');
const controller = require('./controller');
console.log('NEEO SDK Kodi Driver');
console.log('---------------------------------------------');

/*
* Adapter - an Adapter contains one or more DEVICES. In this case we only use a single very
* simple 2 button device.
*/

// first we set the device info, used to identify it on the Brain
const customLightDevice = neeoapi.buildDevice('Mediaplayer remote')
  .setManufacturer('KODI')
  .addAdditionalSearchToken('foo')
  .setType('MEDIAPLAYER')

  // Then we add the capabilities of the device
    .addButton({ name: 'POWER OFF', label: 'POWER OFF' })
    .addButton({ name: 'POWER ON', label: 'POWER ON' })
    .addButton({ name: 'POWER TOGGLE', label: 'POWER TOGGLE' })
    .addButton({ name: 'PLAY', label: 'PLAY' })
    .addButton({ name: 'PAUSE', label: 'PAUSE' })
    .addButton({ name: 'STOP', label: 'STOP' })
    .addButton({ name: 'SKIP BACKWARD', label: 'SKIP BACKWARD' })
    .addButton({ name: 'SKIP FORWARD', label: 'SKIP FORWARD' })
    .addButton({ name: 'FORWARD', label: 'FORWARD' })
    .addButton({ name: 'PREVIOUS', label: 'PREVIOUS' })
    .addButton({ name: 'NEXT', label: 'NEXT' })
    .addButton({ name: 'REVERSE', label: 'REVERSE' })
    .addButton({ name: 'PLAY PAUSE TOGGLE', label: 'PLAY PAUSE TOGGLE' })
    .addButton({ name: 'INFO', label: 'INFO' })
    .addButton({ name: 'CHANNEL UP', label: 'CHANNEL UP' })
    .addButton({ name: 'CHANNEL DOWN', label: 'CHANNEL DOWN' })
    .addButton({ name: 'CHANNEL SEARCH', label: 'CHANNEL SEARCH' })
    .addButton({ name: 'FAVORITE', label: 'FAVORITE' })
    .addButton({ name: 'DIGIT 0', label: 'DIGIT 0' })
    .addButton({ name: 'DIGIT 1', label: 'DIGIT 1' })
    .addButton({ name: 'DIGIT 2', label: 'DIGIT 2' })
    .addButton({ name: 'DIGIT 3', label: 'DIGIT 3' })
    .addButton({ name: 'DIGIT 4', label: 'DIGIT 4' })
    .addButton({ name: 'DIGIT 5', label: 'DIGIT 5' })
    .addButton({ name: 'DIGIT 6', label: 'DIGIT 6' })
    .addButton({ name: 'DIGIT 7', label: 'DIGIT 7' })
    .addButton({ name: 'DIGIT 8', label: 'DIGIT 8' })
    .addButton({ name: 'DIGIT 9', label: 'DIGIT 9' })
    .addButton({ name: 'DIGIT SEPARATOR', label: 'DIGIT SEPARATOR' })
    .addButton({ name: 'BACK', label: 'BACK' })
    .addButton({ name: 'CURSOR DOWN', label: 'CURSOR DOWN' })
    .addButton({ name: 'CURSOR LEFT', label: 'CURSOR LEFT' })
    .addButton({ name: 'CURSOR RIGHT', label: 'CURSOR RIGHT' })
    .addButton({ name: 'CURSOR UP', label: 'CURSOR UP' })
    .addButton({ name: 'ENTER', label: 'ENTER' })
    .addButton({ name: 'EXIT', label: 'EXIT' })
    .addButton({ name: 'HOME', label: 'HOME' })
    .addButton({ name: 'MENU', label: 'MENU' })
    .addButton({ name: 'VOLUME UP', label: 'VOLUME UP' })
    .addButton({ name: 'VOLUME DOWN', label: 'VOLUME DOWN' })
    .addButton({ name: 'MUTE TOGGLE', label: 'MUTE TOGGLE' })
    .addButton({ name: 'pageup', label: 'Page Up' })
    .addButton({ name: 'pagedown', label: 'Page Down' })
    .addButton({ name: 'parentdir', label: 'Parent Dir' })
    .addButton({ name: 'parentfolder', label: 'Parent Folder' })
    .addButton({ name: 'previousmenu', label: 'Previous Menu' })
    .addButton({ name: 'fullscreen', label: 'Fullscreen' })
    .addButton({ name: 'aspectratio', label: 'Aspectratio' })
    .addButton({ name: 'osd', label: 'OSD' })
    .addButton({ name: 'showsubtitles', label: 'Show Subtitles' })
    .addButton({ name: 'nextsubtitle', label: 'Next Subtitle' })
    .addButton({ name: 'cyclesubtitle', label: 'Cycle Subtitle' })
    .addButton({ name: 'playerdebug', label: 'Player Debug' })
    .addButton({ name: 'codecinfo', label: 'Codec Info' })
    .addButton({ name: 'playerprocessinfo', label: 'Player Processinfo' })
    .addButton({ name: 'nextpicture', label: 'Next Picture' })
    .addButton({ name: 'previouspicture', label: 'Previous Picture' })
    .addButton({ name: 'zoomout', label: 'Zoomout' })
    .addButton({ name: 'zoomin', label: 'Zoomin' })
    .addButton({ name: 'playlist', label: 'Playlist' })
    .addButton({ name: 'queue', label: 'Queue' })
    .addButton({ name: 'zoomnormal', label: 'Zoom normal' })
    .addButton({ name: 'zoomlevel1', label: 'Zoomlevel 1' })
    .addButton({ name: 'zoomlevel2', label: 'Zoomlevel 2' })
    .addButton({ name: 'zoomlevel3', label: 'Zoomlevel 3' })
    .addButton({ name: 'zoomlevel4', label: 'Zoomlevel 4' })
    .addButton({ name: 'zoomlevel5', label: 'Zoomlevel 5' })
    .addButton({ name: 'zoomlevel6', label: 'Zoomlevel 6' })
    .addButton({ name: 'zoomlevel7', label: 'Zoomlevel 7' })
    .addButton({ name: 'zoomlevel8', label: 'Zoomlevel 8' })
    .addButton({ name: 'zoomlevel9', label: 'Zoomlevel 9' })
    .addButton({ name: 'nextcalibration', label: 'Next Calibration' })
    .addButton({ name: 'resetcalibration', label: 'Reset Calibration' })
    .addButton({ name: 'analogmove', label: 'Analog Move' })
    .addButton({ name: 'analogmovex', label: 'Analog Move X' })
    .addButton({ name: 'analogmovey', label: 'Analog Move Y' })
    .addButton({ name: 'rotate', label: 'Rotate' })
    .addButton({ name: 'rotateccw', label: 'Rotate CCW' })
    .addButton({ name: 'subtitledelayminus', label: 'Subtitledelay -' })
    .addButton({ name: 'subtitledelay', label: 'Subtitledelay' })
    .addButton({ name: 'subtitledelayplus', label: 'Subtitledelay +' })
    .addButton({ name: 'audiodelayminus', label: 'Audiodelay -' })
    .addButton({ name: 'audiodelay', label: 'Audiodelay' })
    .addButton({ name: 'audiodelayplus', label: 'Audiodelay +' })
    .addButton({ name: 'subtitleshiftup', label: 'Subtitle shift up' })
    .addButton({ name: 'subtitleshiftdown', label: 'Subtitle shift down' })
    .addButton({ name: 'subtitlealign', label: 'Subtitle align' })
    .addButton({ name: 'audionextlanguage', label: 'Audio next language' })
    .addButton({ name: 'verticalshiftup', label: 'Vertical shift up' })
    .addButton({ name: 'verticalshiftdown', label: 'Vertical shift down' })
    .addButton({ name: 'nextresolution', label: 'Next resolution' })
    .addButton({ name: 'audiotoggledigita', label: 'Audio toggle digita' })
    .addButton({ name: 'switchplayer', label: 'Switch player' })
    .addButton({ name: 'delete', label: 'Delete' })
    .addButton({ name: 'copy', label: 'Copy' })
    .addButton({ name: 'move', label: 'Move' })
    .addButton({ name: 'screenshot', label: 'Screenshot' })
    .addButton({ name: 'rename', label: 'Rename' })
    .addButton({ name: 'togglewatched', label: 'Toggle watched' })
    .addButton({ name: 'scanitem', label: 'Scan item' })
    .addButton({ name: 'reloadkeymaps', label: 'Reload keymaps' })
    .addButton({ name: 'scrollup', label: 'Scrollup' })
    .addButton({ name: 'scrolldown', label: 'Scrolldown' })
    .addButton({ name: 'analogfastforward', label: 'Analog fastforward' })
    .addButton({ name: 'analogrewind', label: 'Analog rewind' })
    .addButton({ name: 'moveitemup', label: 'Move item up' })
    .addButton({ name: 'moveitemdown', label: 'Move item down' })
    .addButton({ name: 'contextmenu', label: 'Contextmenu' })
    .addButton({ name: 'shift', label: 'Shift' })
    .addButton({ name: 'symbols', label: 'Symbols' })
    .addButton({ name: 'cursorleft', label: 'Cursor left' })
    .addButton({ name: 'cursorright', label: 'Cursor right' })
    .addButton({ name: 'showtime', label: 'Showtime' })
    .addButton({ name: 'analogseekforward', label: 'Analog seek forward' })
    .addButton({ name: 'analogseekback', label: 'Analog seek back' })
    .addButton({ name: 'showpreset', label: 'Show preset' })
    .addButton({ name: 'nextpreset', label: 'Next preset' })
    .addButton({ name: 'previouspreset', label: 'Previous preset' })
    .addButton({ name: 'lockpreset', label: 'Lock preset' })
    .addButton({ name: 'randompreset', label: 'Random preset' })
    .addButton({ name: 'increasevisrating', label: 'Increase vis rating' })
    .addButton({ name: 'decreasevisrating', label: 'Decrease vis rating' })
    .addButton({ name: 'showvideomenu', label: 'Show video menu' })
    .addButton({ name: 'increaserating', label: 'Increase rating' })
    .addButton({ name: 'decreaserating', label: 'Decrease rating' })
    .addButton({ name: 'setrating', label: 'Set rating' })
    .addButton({ name: 'togglefullscreen', label: 'Toggle fullscreen' })
    .addButton({ name: 'nextletter', label: 'Next letter' })
    .addButton({ name: 'prevletter', label: 'Prev letter' })
    .addButton({ name: 'jumpsms2', label: 'jump sms 2' })
    .addButton({ name: 'jumpsms3', label: 'jump sms 3' })
    .addButton({ name: 'jumpsms4', label: 'jump sms 4' })
    .addButton({ name: 'jumpsms5', label: 'jump sms 5' })
    .addButton({ name: 'jumpsms6', label: 'jump sms 6' })
    .addButton({ name: 'jumpsms7', label: 'jump sms 7' })
    .addButton({ name: 'jumpsms8', label: 'jump sms 8' })
    .addButton({ name: 'jumpsms9', label: 'jump sms 9' })
    .addButton({ name: 'filter', label: 'Filter' })
    .addButton({ name: 'filterclear', label: 'Filter clear' })
    .addButton({ name: 'filtersms2', label: 'filter sms 2' })
    .addButton({ name: 'filtersms3', label: 'filter sms 3' })
    .addButton({ name: 'filtersms4', label: 'filter sms 4' })
    .addButton({ name: 'filtersms5', label: 'filter sms 5' })
    .addButton({ name: 'filtersms6', label: 'filter sms 6' })
    .addButton({ name: 'filtersms7', label: 'filter sms 7' })
    .addButton({ name: 'filtersms8', label: 'filter sms 8' })
    .addButton({ name: 'filtersms9', label: 'filter sms 9' })
    .addButton({ name: 'firstpage', label: 'Firstpage' })
    .addButton({ name: 'lastpage', label: 'Lastpage' })
    .addButton({ name: 'guiprofile', label: 'GUI Profile' })
    .addButton({ name: 'red', label: 'Red' })
    .addButton({ name: 'green', label: 'Green' })
    .addButton({ name: 'yellow', label: 'Yellow' })
    .addButton({ name: 'blue', label: 'Blue' })
    .addButton({ name: 'increasepar', label: 'Increase par' })
    .addButton({ name: 'decreasepar', label: 'Decrease par' })
    .addButton({ name: 'volampup', label: 'Vol amp up' })
    .addButton({ name: 'volampdown', label: 'Vol amp down' })
    .addButton({ name: 'volumeamplification', label: 'Volume amplification' })
    .addButton({ name: 'createbookmark', label: 'Create bookmark' })
    .addButton({ name: 'createepisodebookmark', label: 'Create episode bookmark' })
    .addButton({ name: 'settingsreset', label: 'Settings reset' })
    .addButton({ name: 'settingslevelchange', label: 'Settings level change' })
    .addButton({ name: 'stereomode', label: 'Stereo mode' })
    .addButton({ name: 'nextstereomode', label: 'Next stereo mode' })
    .addButton({ name: 'previousstereomode', label: 'Previous stereo mode' })
    .addButton({ name: 'togglestereomode', label: 'Toggle stereo mode' })
    .addButton({ name: 'stereomodetomono', label: 'Stereo mode to mono' })
    .addButton({ name: 'previouschannelgroup', label: 'Previous channel group' })
    .addButton({ name: 'nextchannelgroup', label: 'Next channel group' })
    .addButton({ name: 'playpvr', label: 'Play pvr' })
    .addButton({ name: 'playpvrtv', label: 'Play pvr tv' })
    .addButton({ name: 'playpvrradio', label: 'Play pvr radio' })
    .addButton({ name: 'record', label: 'Record' })
    .addButton({ name: 'togglecommskip', label: 'Toggle comm skip' })
    .addButton({ name: 'showtimerrule', label: 'Show timerrule' })
    .addButton({ name: 'leftclick', label: 'Leftclick' })
    .addButton({ name: 'rightclick', label: 'Rightclick' })
    .addButton({ name: 'middleclick', label: 'Middleclick' })
    .addButton({ name: 'doubleclick', label: 'Doubleclick' })
    .addButton({ name: 'longclick', label: 'Longclick' })
    .addButton({ name: 'wheelup', label: 'Wheelup' })
    .addButton({ name: 'wheeldown', label: 'Wheeldown' })
    .addButton({ name: 'mousedrag', label: 'Mousedrag' })
    .addButton({ name: 'mousemove', label: 'Mousemove' })
    .addButton({ name: 'tap', label: 'Tap' })
    .addButton({ name: 'longpress', label: 'Longpress' })
    .addButton({ name: 'pangesture', label: 'Pangesture' })
    .addButton({ name: 'zoomgesture', label: 'Zoomgesture' })
    .addButton({ name: 'rotategesture', label: 'Rotategesture' })
    .addButton({ name: 'swipeleft', label: 'Swipe left' })
    .addButton({ name: 'swiperight', label: 'Swipe right' })
    .addButton({ name: 'swipeup', label: 'Swipe up' })
    .addButton({ name: 'swipedown', label: 'Swipe down' })
    .addButton({ name: 'error', label: 'Error' })
    .addButton({ name: 'noop', label: 'Noop' })
  .addButtonHander(controller.onButtonPressed);

console.log('- discover one NEEO Brain...');
neeoapi.discoverOneBrain()
  .then((brain) => {
    console.log('- Brain discovered:', brain.name);

    // Init kodi settings:
    kodi.init(kodi_ip,kodi_port,kodi_login,kodi_password).then(() => {
      console.log("- Kodi - Init complete");
    }).catch((err) => {
      console.error('ERROR!', err);
    });

    console.log('- NEEO-SDK Start server');
    return neeoapi.startServer({
      brain,
      port: 6336,
      name: 'simple-adapter-one',
      devices: [customLightDevice]
    });
  })
  .then(() => {
    console.log('# READY! use the NEEO app to search for "KODI Mediaplayer remote".');
  })
  .catch((err) => {
    console.error('ERROR!', err);
    process.exit(1);
  });