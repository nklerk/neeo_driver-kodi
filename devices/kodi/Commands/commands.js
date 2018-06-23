"use strict";

module.exports.neeoCommands = function() {
  return {
    //"POWER OFF":{"method": "System.Shutdown","params":{},"cac":false},
    "POWER OFF": { method: "System.Shutdown", params: {}, cac: false },
    "POWER OFF Forced": { method: "System.Shutdown", params: {}, cac: false },
    "POWER ON": { method: "WOL", params: {}, cac: false },
    "POWER ON Forced": { method: "WOL", params: {}, cac: false },
    PLAY: { method: "Input.ExecuteAction", params: { action: "play" }, cac: false },
    PAUSE: { method: "Input.ExecuteAction", params: { action: "pause" }, cac: false },
    STOP: { method: "Input.ExecuteAction", params: { action: "stop" }, cac: false },
    "SKIP BACKWARD": { method: "Input.ExecuteAction", params: { action: "skipprevious" }, cac: false },
    "SKIP FORWARD": { method: "Input.ExecuteAction", params: { action: "skipnext" }, cac: false },
    FORWARD: { method: "Player.SetSpeed", params: { playerid: 1, speed: 2 }, cac: true },
    PREVIOUS: { method: "Player.GoTo", params: { playerid: 1, to: "previous" }, cac: false },
    NEXT: { method: "Player.GoTo", params: { playerid: 1, to: "next" }, cac: false },
    REVERSE: { method: "Player.SetSpeed", params: { playerid: 1, speed: -2 }, cac: true },
    "PLAY PAUSE TOGGLE": { method: "Input.PlayPause", params: {}, cac: false },
    INFO: { method: "Input.ExecuteAction", params: { action: "info" }, cac: false },
    "CHANNEL UP": { method: "Input.ExecuteAction", params: { action: "channelup" }, cac: false },
    "CHANNEL DOWN": { method: "Input.ExecuteAction", params: { action: "channeldown" }, cac: false },
    "CHANNEL SEARCH": { method: "Input.ExecuteAction", params: { action: "nextchannelgroup" }, cac: false },
    FAVORITE: { method: "GUI.ActivateWindow", params: { window: "pvrosdchannels" }, cac: false },
    "DIGIT 0": { method: "Input.ExecuteAction", params: { action: "number0" }, cac: false },
    "DIGIT 1": { method: "Input.ExecuteAction", params: { action: "number1" }, cac: false },
    "DIGIT 2": { method: "Input.ExecuteAction", params: { action: "number2" }, cac: false },
    "DIGIT 3": { method: "Input.ExecuteAction", params: { action: "number3" }, cac: false },
    "DIGIT 4": { method: "Input.ExecuteAction", params: { action: "number4" }, cac: false },
    "DIGIT 5": { method: "Input.ExecuteAction", params: { action: "number5" }, cac: false },
    "DIGIT 6": { method: "Input.ExecuteAction", params: { action: "number6" }, cac: false },
    "DIGIT 7": { method: "Input.ExecuteAction", params: { action: "number7" }, cac: false },
    "DIGIT 8": { method: "Input.ExecuteAction", params: { action: "number8" }, cac: false },
    "DIGIT 9": { method: "Input.ExecuteAction", params: { action: "number9" }, cac: false },
    "DIGIT SEPARATOR": { method: "Input.xxxx", params: {}, cac: false },
    BACK: { method: "Input.Back", params: {}, cac: false },
    "CURSOR DOWN": { method: "Input.down", params: {}, cac: true },
    "CURSOR LEFT": { method: "Input.left", params: {}, cac: true },
    "CURSOR RIGHT": { method: "Input.right", params: {}, cac: true },
    "CURSOR UP": { method: "Input.up", params: {}, cac: true },
    "CURSOR ENTER": { method: "Input.select", params: {}, cac: true },
    //"CURSOR DOWN":{"method": "Input.ExecuteAction","params":{ "action": "down"},"cac":true},
    //"CURSOR LEFT":{"method": "Input.ExecuteAction","params":{ "action": "left"},"cac":true},
    //"CURSOR RIGHT":{"method": "Input.ExecuteAction","params":{ "action": "right"},"cac":true},
    //"CURSOR UP":{"method": "Input.ExecuteAction","params":{ "action": "up"},"cac":true},
    //"CURSOR ENTER":{"method": "Input.ExecuteAction","params":{ "action": "select"},"cac":true},
    EXIT: { method: "Input.back", params: {}, cac: false },
    HOME: { method: "Input.menu", params: {}, cac: false },
    MENU: { method: "Input.ContextMenu", params: {}, cac: false },
    "VOLUME UP": { method: "Input.ExecuteAction", params: { action: "volumeup" }, cac: false },
    "VOLUME DOWN": { method: "Input.ExecuteAction", params: { action: "volumedown" }, cac: false },
    "MUTE TOGGLE": { method: "Input.ExecuteAction", params: { action: "mute" }, cac: false },
    ///"Page Up":{"method": "Input.ExecuteAction","params":{ "action": "pageup"},"cac":false},
    "Scan Video Library": { method: "VideoLibrary.Scan", params: {}, cac: false },
    "Scan Audio Library": { method: "AudioLibrary.Scan", params: {}, cac: false },
    ///"Page Down":{"method": "Input.ExecuteAction","params":{ "action": "pagedown"},"cac":false},
    ///"Parent Dir":{"method": "Input.ExecuteAction","params":{ "action": "parentdir"},"cac":false},
    ///"Parent Folder":{"method": "Input.ExecuteAction","params":{ "action": "parentfolder"},"cac":false},
    ///"Previous Menu":{"method": "Input.ExecuteAction","params":{ "action": "previousmenu"},"cac":false},
    Fullscreen: { method: "Input.ExecuteAction", params: { action: "fullscreen" }, cac: false }
    ///"Aspectratio":{"method": "Input.ExecuteAction","params":{ "action": "aspectratio"},"cac":false},
    ///"OSD":{"method": "Input.ExecuteAction","params":{ "action": "osd"},"cac":false},
    ///"Show Subtitles":{"method": "Input.ExecuteAction","params":{ "action": "showsubtitles"},"cac":false},
    ///"Next Subtitle":{"method": "Input.ExecuteAction","params":{ "action": "nextsubtitle"},"cac":false},
    //////"Cycle Subtitle":{"method": "Input.ExecuteAction","params":{ "action": "cyclesubtitle"},"cac":false},
    ///"Player Debug":{"method": "Input.ExecuteAction","params":{ "action": "playerdebug"},"cac":false},
    ///"Codec Info":{"method": "Input.ExecuteAction","params":{ "action": "codecinfo"},"cac":false},
    ///"Player Processinfo":{"method": "Input.ExecuteAction","params":{ "action": "playerprocessinfo"},"cac":false},
    ///"Next Picture":{"method": "Input.ExecuteAction","params":{ "action": "nextpicture"},"cac":false},
    ///"Previous Picture":{"method": "Input.ExecuteAction","params":{ "action": "previouspicture"},"cac":false},
    ///"Zoomout":{"method": "Input.ExecuteAction","params":{ "action": "zoomout"},"cac":false},
    ///"Zoomin":{"method": "Input.ExecuteAction","params":{ "action": "zoomin"},"cac":false},
    ///"Playlist":{"method": "Input.ExecuteAction","params":{ "action": "playlist"},"cac":false},
    ///"Queue":{"method": "Input.ExecuteAction","params":{ "action": "queue"},"cac":false},
    ///"Zoom normal":{"method": "Input.ExecuteAction","params":{ "action": "zoomnormal"},"cac":false},
    ///"Zoomlevel 1":{"method": "Input.ExecuteAction","params":{ "action": "zoomlevel1"},"cac":false},
    ///"Zoomlevel 2":{"method": "Input.ExecuteAction","params":{ "action": "zoomlevel2"},"cac":false},
    ///"Zoomlevel 3":{"method": "Input.ExecuteAction","params":{ "action": "zoomlevel3"},"cac":false},
    ///"Zoomlevel 4":{"method": "Input.ExecuteAction","params":{ "action": "zoomlevel4"},"cac":false},
    ///"Zoomlevel 5":{"method": "Input.ExecuteAction","params":{ "action": "zoomlevel5"},"cac":false},
    ///"Zoomlevel 6":{"method": "Input.ExecuteAction","params":{ "action": "zoomlevel6"},"cac":false},
    ///"Zoomlevel 7":{"method": "Input.ExecuteAction","params":{ "action": "zoomlevel7"},"cac":false},
    ///"Zoomlevel 8":{"method": "Input.ExecuteAction","params":{ "action": "zoomlevel8"},"cac":false},
    ///"Zoomlevel 9":{"method": "Input.ExecuteAction","params":{ "action": "zoomlevel9"},"cac":false},
    ///"Next Calibration":{"method": "Input.ExecuteAction","params":{ "action": "nextcalibration"},"cac":false},
    ///"Reset Calibration":{"method": "Input.ExecuteAction","params":{ "action": "resetcalibration"},"cac":false},
    ///"Analog Move":{"method": "Input.ExecuteAction","params":{ "action": "analogmove"},"cac":false},
    ///"Analog Move X":{"method": "Input.ExecuteAction","params":{ "action": "analogmovex"},"cac":false},
    ///"Analog Move Y":{"method": "Input.ExecuteAction","params":{ "action": "analogmovey"},"cac":false},
    ///"Rotate":{"method": "Input.ExecuteAction","params":{ "action": "rotate"},"cac":false},
    ///"Rotate CCW":{"method": "Input.ExecuteAction","params":{ "action": "rotateccw"},"cac":false},
    ///"Subtitledelay -":{"method": "Input.ExecuteAction","params":{ "action": "subtitledelayminus"},"cac":false},
    ///"Subtitledelay":{"method": "Input.ExecuteAction","params":{ "action": "subtitledelay"},"cac":false},
    ///"Subtitledelay +":{"method": "Input.ExecuteAction","params":{ "action": "subtitledelayplus"},"cac":false},
    ///"Audiodelay -":{"method": "Input.ExecuteAction","params":{ "action": "audiodelayminus"},"cac":false},
    ///"Audiodelay":{"method": "Input.ExecuteAction","params":{ "action": "audiodelay"},"cac":false},
    ///"Audiodelay +":{"method": "Input.ExecuteAction","params":{ "action": "audiodelayplus"},"cac":false},
    ///"Subtitle shift up":{"method": "Input.ExecuteAction","params":{ "action": "subtitleshiftup"},"cac":false},
    ///"Subtitle shift down":{"method": "Input.ExecuteAction","params":{ "action": "subtitleshiftdown"},"cac":false},
    ///"Subtitle align":{"method": "Input.ExecuteAction","params":{ "action": "subtitlealign"},"cac":false},
    ///"Audio next language":{"method": "Input.ExecuteAction","params":{ "action": "audionextlanguage"},"cac":false},
    ///"Vertical shift up":{"method": "Input.ExecuteAction","params":{ "action": "verticalshiftup"},"cac":false},
    ///"Vertical shift down":{"method": "Input.ExecuteAction","params":{ "action": "verticalshiftdown"},"cac":false},
    ///"Next resolution":{"method": "Input.ExecuteAction","params":{ "action": "nextresolution"},"cac":false},
    ///"Audio toggle digita":{"method": "Input.ExecuteAction","params":{ "action": "audiotoggledigita"},"cac":false},
    ///"Switch player":{"method": "Input.ExecuteAction","params":{ "action": "switchplayer"},"cac":false},
    ///"Delete":{"method": "Input.ExecuteAction","params":{ "action": "delete"},"cac":false},
    ///"Copy":{"method": "Input.ExecuteAction","params":{ "action": "copy"},"cac":false},
    ///"Move":{"method": "Input.ExecuteAction","params":{ "action": "move"},"cac":false},
    ///"Screenshot":{"method": "Input.ExecuteAction","params":{ "action": "screenshot"},"cac":false},
    ///"Rename":{"method": "Input.ExecuteAction","params":{ "action": "rename"},"cac":false},
    ///"Toggle watched":{"method": "Input.ExecuteAction","params":{ "action": "togglewatched"},"cac":false},
    ///"Scan item":{"method": "Input.ExecuteAction","params":{ "action": "scanitem"},"cac":false},
    ///"Reload keymaps":{"method": "Input.ExecuteAction","params":{ "action": "reloadkeymaps"},"cac":false},
    ///"Scrollup":{"method": "Input.ExecuteAction","params":{ "action": "scrollup"},"cac":false},
    ///"Scrolldown":{"method": "Input.ExecuteAction","params":{ "action": "scrolldown"},"cac":false},
    ///"Analog fastforward":{"method": "Input.ExecuteAction","params":{ "action": "analogfastforward"},"cac":false},
    ///"Analog rewind":{"method": "Input.ExecuteAction","params":{ "action": "analogrewind"},"cac":false},
    ///"Move item up":{"method": "Input.ExecuteAction","params":{ "action": "moveitemup"},"cac":false},
    ///"Move item down":{"method": "Input.ExecuteAction","params":{ "action": "moveitemdown"},"cac":false},
    ///"Contextmenu":{"method": "Input.ExecuteAction","params":{ "action": "contextmenu"},"cac":false},
    ///"Shift":{"method": "Input.ExecuteAction","params":{ "action": "shift"},"cac":false},
    ///"Symbols":{"method": "Input.ExecuteAction","params":{ "action": "symbols"},"cac":false},
    ///"Cursor left":{"method": "Input.ExecuteAction","params":{ "action": "cursorleft"},"cac":false},
    ///"Cursor right":{"method": "Input.ExecuteAction","params":{ "action": "cursorright"},"cac":false},
    ///"Showtime":{"method": "Input.ExecuteAction","params":{ "action": "showtime"},"cac":false},
    ///"Analog seek forward":{"method": "Input.ExecuteAction","params":{ "action": "analogseekforward"},"cac":false},
    ///"Analog seek back":{"method": "Input.ExecuteAction","params":{ "action": "analogseekback"},"cac":false},
    ///"Show preset":{"method": "Input.ExecuteAction","params":{ "action": "showpreset"},"cac":false},
    ///"Next preset":{"method": "Input.ExecuteAction","params":{ "action": "nextpreset"},"cac":false},
    ///"Previous preset":{"method": "Input.ExecuteAction","params":{ "action": "previouspreset"},"cac":false},
    ///"Lock preset":{"method": "Input.ExecuteAction","params":{ "action": "lockpreset"},"cac":false},
    ///"Random preset":{"method": "Input.ExecuteAction","params":{ "action": "randompreset"},"cac":false},
    ///"Increase vis rating":{"method": "Input.ExecuteAction","params":{ "action": "increasevisrating"},"cac":false},
    ///"Decrease vis rating":{"method": "Input.ExecuteAction","params":{ "action": "decreasevisrating"},"cac":false},
    ///"Show video menu":{"method": "Input.ExecuteAction","params":{ "action": "showvideomenu"},"cac":false},
    ///"Increase rating":{"method": "Input.ExecuteAction","params":{ "action": "increaserating"},"cac":false},
    ///"Decrease rating":{"method": "Input.ExecuteAction","params":{ "action": "decreaserating"},"cac":false},
    ///"Set rating":{"method": "Input.ExecuteAction","params":{ "action": "setrating"},"cac":false},
    ///"Toggle fullscreen":{"method": "Input.ExecuteAction","params":{ "action": "togglefullscreen"},"cac":false},
    ///"Next letter":{"method": "Input.ExecuteAction","params":{ "action": "nextletter"},"cac":false},
    ///"Prev letter":{"method": "Input.ExecuteAction","params":{ "action": "prevletter"},"cac":false},
    ///"jump sms 2":{"method": "Input.ExecuteAction","params":{ "action": "jumpsms2"},"cac":false},
    ///"jump sms 3":{"method": "Input.ExecuteAction","params":{ "action": "jumpsms3"},"cac":false},
    ///"jump sms 4":{"method": "Input.ExecuteAction","params":{ "action": "jumpsms4"},"cac":false},
    ///"jump sms 5":{"method": "Input.ExecuteAction","params":{ "action": "jumpsms5"},"cac":false},
    ///"jump sms 6":{"method": "Input.ExecuteAction","params":{ "action": "jumpsms6"},"cac":false},
    ///"jump sms 7":{"method": "Input.ExecuteAction","params":{ "action": "jumpsms7"},"cac":false},
    ///"jump sms 8":{"method": "Input.ExecuteAction","params":{ "action": "jumpsms8"},"cac":false},
    ///"jump sms 9":{"method": "Input.ExecuteAction","params":{ "action": "jumpsms9"},"cac":false},
    ///"Filter":{"method": "Input.ExecuteAction","params":{ "action": "filter"},"cac":false},
    ///"Filter clear":{"method": "Input.ExecuteAction","params":{ "action": "filterclear"},"cac":false},
    ///"filter sms 2":{"method": "Input.ExecuteAction","params":{ "action": "filtersms2"},"cac":false},
    ///"filter sms 3":{"method": "Input.ExecuteAction","params":{ "action": "filtersms3"},"cac":false},
    ///"filter sms 4":{"method": "Input.ExecuteAction","params":{ "action": "filtersms4"},"cac":false},
    ///"filter sms 5":{"method": "Input.ExecuteAction","params":{ "action": "filtersms5"},"cac":false},
    ///"filter sms 6":{"method": "Input.ExecuteAction","params":{ "action": "filtersms6"},"cac":false},
    ///"filter sms 7":{"method": "Input.ExecuteAction","params":{ "action": "filtersms7"},"cac":false},
    ///"filter sms 8":{"method": "Input.ExecuteAction","params":{ "action": "filtersms8"},"cac":false},
    ///"filter sms 9":{"method": "Input.ExecuteAction","params":{ "action": "filtersms9"},"cac":false},
    ///"Firstpage":{"method": "Input.ExecuteAction","params":{ "action": "firstpage"},"cac":false},
    ///"Lastpage":{"method": "Input.ExecuteAction","params":{ "action": "lastpage"},"cac":false},
    ///"GUI Profile":{"method": "Input.ExecuteAction","params":{ "action": "guiprofile"},"cac":false},
    ///"Red":{"method": "Input.ExecuteAction","params":{ "action": "red"},"cac":false},
    ///"Green":{"method": "Input.ExecuteAction","params":{ "action": "green"},"cac":false},
    ///"Yellow":{"method": "Input.ExecuteAction","params":{ "action": "yellow"},"cac":false},
    ///"Blue":{"method": "Input.ExecuteAction","params":{ "action": "blue"},"cac":false},
    ///"Increase par":{"method": "Input.ExecuteAction","params":{ "action": "increasepar"},"cac":false},
    ///"Decrease par":{"method": "Input.ExecuteAction","params":{ "action": "decreasepar"},"cac":false},
    ///"Vol amp up":{"method": "Input.ExecuteAction","params":{ "action": "volampup"},"cac":false},
    ///"Vol amp down":{"method": "Input.ExecuteAction","params":{ "action": "volampdown"},"cac":false},
    ///"Volume amplification":{"method": "Input.ExecuteAction","params":{ "action": "volumeamplification"},"cac":false},
    ///"Create bookmark":{"method": "Input.ExecuteAction","params":{ "action": "createbookmark"},"cac":false},
    ///"Create episode bookmark":{"method": "Input.ExecuteAction","params":{ "action": "createepisodebookmark"},"cac":false},
    ///"Settings reset":{"method": "Input.ExecuteAction","params":{ "action": "settingsreset"},"cac":false},
    ///"Settings level change":{"method": "Input.ExecuteAction","params":{ "action": "settingslevelchange"},"cac":false},
    ///"Stereo mode":{"method": "Input.ExecuteAction","params":{ "action": "stereomode"},"cac":false},
    ///"Next stereo mode":{"method": "Input.ExecuteAction","params":{ "action": "nextstereomode"},"cac":false},
    ///"Previous stereo mode":{"method": "Input.ExecuteAction","params":{ "action": "previousstereomode"},"cac":false},
    ///"Toggle stereo mode":{"method": "Input.ExecuteAction","params":{ "action": "togglestereomode"},"cac":false},
    ///"Stereo mode to mono":{"method": "Input.ExecuteAction","params":{ "action": "stereomodetomono"},"cac":false},
    ///"Previous channel group":{"method": "Input.ExecuteAction","params":{ "action": "previouschannelgroup"},"cac":false},
    ///"Next channel group":{"method": "Input.ExecuteAction","params":{ "action": "nextchannelgroup"},"cac":false},
    ///"Play pvr":{"method": "Input.ExecuteAction","params":{ "action": "playpvr"},"cac":false},
    ///"Play pvr tv":{"method": "Input.ExecuteAction","params":{ "action": "playpvrtv"},"cac":false},
    ///"Play pvr radio":{"method": "Input.ExecuteAction","params":{ "action": "playpvrradio"},"cac":false},
    ///"Record":{"method": "Input.ExecuteAction","params":{ "action": "record"},"cac":false},
    ///"Toggle comm skip":{"method": "Input.ExecuteAction","params":{ "action": "togglecommskip"},"cac":false},
    ///"Show timerrule":{"method": "Input.ExecuteAction","params":{ "action": "showtimerrule"},"cac":false},
    ///"Leftclick":{"method": "Input.ExecuteAction","params":{ "action": "leftclick"},"cac":false},
    ///"Rightclick":{"method": "Input.ExecuteAction","params":{ "action": "rightclick"},"cac":false},
    ///"Middleclick":{"method": "Input.ExecuteAction","params":{ "action": "middleclick"},"cac":false},
    ///"Doubleclick":{"method": "Input.ExecuteAction","params":{ "action": "doubleclick"},"cac":false},
    ///"Longclick":{"method": "Input.ExecuteAction","params":{ "action": "longclick"},"cac":false},
    ///"Wheelup":{"method": "Input.ExecuteAction","params":{ "action": "wheelup"},"cac":false},
    ///"Wheeldown":{"method": "Input.ExecuteAction","params":{ "action": "wheeldown"},"cac":false},
    ///"Mousedrag":{"method": "Input.ExecuteAction","params":{ "action": "mousedrag"},"cac":false},
    ///"Mousemove":{"method": "Input.ExecuteAction","params":{ "action": "mousemove"},"cac":false},
    ///"Tap":{"method": "Input.ExecuteAction","params":{ "action": "tap"},"cac":false},
    ///"Longpress":{"method": "Input.ExecuteAction","params":{ "action": "longpress"},"cac":false},
    ///"Pangesture":{"method": "Input.ExecuteAction","params":{ "action": "pangesture"},"cac":false},
    ///"Zoomgesture":{"method": "Input.ExecuteAction","params":{ "action": "zoomgesture"},"cac":false},
    ///"Rotategesture":{"method": "Input.ExecuteAction","params":{ "action": "rotategesture"},"cac":false},
    ///"Swipe left":{"method": "Input.ExecuteAction","params":{ "action": "swipeleft"},"cac":false},
    ///"Swipe right":{"method": "Input.ExecuteAction","params":{ "action": "swiperight"},"cac":false},
    ///"Swipe up":{"method": "Input.ExecuteAction","params":{ "action": "swipeup"},"cac":false},
    ///"Swipe down":{"method": "Input.ExecuteAction","params":{ "action": "swipedown"},"cac":false},
    ///"Error":{"method": "Input.ExecuteAction","params":{ "action": "error"},"cac":false},
    ///"Noop":{"method": "Input.ExecuteAction","params":{ "action": "noop"},"params":{},"cac":false},
  };
};
