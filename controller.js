const kodi = require('kodi-jsonrpc-http-post');

/*
* Device Controller
* Events on that device from the Brain will be forwarded here for handling.
*/
module.exports.onButtonPressed = function onButtonPressed(deviceid, name) {
  var cmd;
  switch(deviceid) {
    case 'POWER OFF':
        cmd = {"jsonrpc": "2.0", "method": "System.Shutdown", "id": 1};
        break;
    case 'POWER ON':
        //Insert Wake on lan. here
        break;
    case 'POWER TOGGLE':
        //Lol power toggle, as if we want to use that. but if you do here it is.
        break;
    case 'PLAY':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "play"}, "id": 1};
        break;
    case 'PAUSE':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "pause"}, "id": 1};
        break;
    case 'STOP':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "stop"}, "id": 1};
        break;
    case 'SKIP BACKWARD':
        cmd = {"jsonrpc":"2.0","method":"Player.Seek","params":{ "playerid":1,"value":"smallbackward"},"id":1}
        break;
    case 'SKIP FORWARD':
        cmd = {"jsonrpc":"2.0","method":"Player.Seek","params":{ "playerid":1,"value":"smallforward"},"id":1}
        break;
    case 'FORWARD':
        cmd = {"jsonrpc": "2.0", "method": "Player.SetSpeed", "params": {"playerid":1, "speed":2}, "id":1};
        break;
    case 'PREVIOUS':
        cmd = {"jsonrpc": "2.0", "method": "Player.GoTo", "params": { "playerid":1, "to": "previous"}, "id":1}
        break;
    case 'NEXT':
        cmd = {"jsonrpc": "2.0", "method": "Player.GoTo", "params": { "playerid":1, "to": "next"}, "id":1} 
        break;
    case 'REVERSE':
        cmd = {"jsonrpc": "2.0", "method": "Player.SetSpeed", "params": {"playerid":1, "speed":-2}, "id":1};
        break;
    case 'PLAY PAUSE TOGGLE':
        cmd = {"jsonrpc": "2.0", "method": "Input.PlayPause", "id": 1};
        break;
    case 'INFO':
        cmd = {"jsonrpc": "2.0", "method": "Input.Info", "id": 1};
        break;
    case 'CHANNEL UP':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "channelup"}, "id": 1};
        break;
    case 'CHANNEL DOWN':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "channeldown"}, "id": 1};
        break;
    case 'CHANNEL SEARCH'://nextchannelgroup
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "nextchannelgroup"}, "id": 1};
        break;
    case 'FAVORITE':
        cmd = {"jsonrpc":"2.0","id":1,"method":"GUI.ActivateWindow","params":{"window":"pvrosdchannels"}};
        break;
    case 'DIGIT 0':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "number0"}, "id": 1};
        break;
    case 'DIGIT 1':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "number1"}, "id": 1};
        break;
    case 'DIGIT 2':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "number2"}, "id": 1};
        break;
    case 'DIGIT 3':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "number3"}, "id": 1};
        break;
    case 'DIGIT 4':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "number4"}, "id": 1};
        break;
    case 'DIGIT 5':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "number5"}, "id": 1};
        break;
    case 'DIGIT 6':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "number6"}, "id": 1};
        break;
    case 'DIGIT 7':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "number7"}, "id": 1};
        break;
    case 'DIGIT 8':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "number8"}, "id": 1};
        break;
    case 'DIGIT 9':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "number9"}, "id": 1};
        break;
    case 'DIGIT SEPARATOR':
        cmd = {"jsonrpc": "2.0", "method": "Input.xxxx", "id": 1};
        break;
    case 'BACK':
        cmd = {"jsonrpc": "2.0", "method": "Input.Back", "id": 1};
        break;
    case 'CURSOR DOWN':
        cmd = {"jsonrpc": "2.0", "method": "Input.down", "id": 1};
        break;
    case 'CURSOR LEFT':
        cmd = {"jsonrpc": "2.0", "method": "Input.Left", "id": 1};
        break;
    case 'CURSOR RIGHT':
        cmd = {"jsonrpc": "2.0", "method": "Input.right", "id": 1};
        break;
    case 'CURSOR UP':
        cmd = {"jsonrpc": "2.0", "method": "Input.up", "id": 1};
        break;
    case 'ENTER':
        cmd = {"jsonrpc": "2.0", "method": "Input.Select", "id": 1};
        break;
    case 'EXIT':
        cmd = {"jsonrpc": "2.0", "method": "Input.back", "id": 1};
        break;
    case 'HOME':
        cmd = {"jsonrpc": "2.0", "method": "Input.menu", "id": 1};
        break;
    case 'MENU':
        cmd = {"jsonrpc": "2.0", "method": "Input.ContextMenu", "id": 1};
        break;
    case 'VOLUME UP':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "volumeup"}, "id": 1};
        break;
    case 'VOLUME DOWN':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "volumedown"}, "id": 1};
        break;
    case 'MUTE TOGGLE':
        cmd = {"jsonrpc": "2.0", "method": "Input.ExecuteAction","params":{ "action": "mute"}, "id": 1};
        break;
    }

    kodi.sendCommand(cmd).then((response) => {
      console.log("- Kodi - Command success: ", response);
    }).catch((err) => {
      console.error("- Kodi - Command error!", err);
    });
};