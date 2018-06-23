# KODI IP driver for NEEO.

This will be a full featured kodi driver for NEEO.
This driver is in an early beta stage so expect issue.
I kindly request to only report crashes including crashlogs and hold on to feature requests for now.

The driver state: Early BETA

## Features

- Discovering KODI instances.
- Wake on Lan as POWER ON command.
- Browse through movies and recent Movies. (add the <Directory> Movie Library as shortcut).
- Browse through TV Shows and recent episodes. (add the <Directory> TV Shows Library as shortcut).
- Browse through PVR TV Stations and Radio Stations. (add the <Directory> PVR Library as shortcut).
- Browse through Music Albums, recent Albums and Music Video's. (add the <Directory> Music Library as shortcut).
- Large Now playing cover image. (add the <Now Playing Cover (large)> Image as shortcut).
- Small Now playing cover image. (add the <Now Playing Cover (Small)> Image as shortcut).
- Now playing label. (add the <Now Playing> Label as shortcut).
- Volume Slider. (add the <Volume> Slider as shortcut).
- When EPG is available the broadcasted title is shown on TV Channels.
- All known API commands are exposed as buttons.
- Button to update Audio Library.
- Button to update Video Library.
- Content aware controlls.

## Caviats

- Kodi password must be set to nothing. Username/Password is not handled.
- Kodi 17.x on Android is not supported because it lacks Zeroconf, alternatives are using KODI 18 or use LibreElec.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

You will need a copy of Node.js (v6) installed, see http://nodejs.org
On windows you need either Bonjour SDK or iTunes installed for MDNS discovery.

### Installing

Download or clone the github files to a directory of your choosing.
Extract the files.
Use your computers console and go to the path where the files are extracted and Install the package using NPM.

```
npm install
```

## Running the driver

Use your computers console and go to the path where the files are extracted, Start the driver with NPM.

```
npm start
```

## Running the driver the old way or for debugging.

Use your computers console and go to the path where the files are extracted, Edit the file Debug_NEEO_DRIVER-KODI.js to your pesonal setup, then Start the Debug_NEEO_DRIVER-KODI.js file with node.

```
node Debug_NEEO_DRIVER-KODI.js
```

or use <f5> in Visual Studio Code

## KODI Settings

In Kodi make sure to enable the following settings:

- "Announce services to other systems",
- "Allow remote control via HTTP",
- "Allow remote control from applications on other systems".
- set Kodi User/Password to either kodi/kodi or leave the password blank (default).

## Usefull links

- [NEEO](https://neeo.com/) - Official NEEO website.
- [Planet NEEO](https://planet.neeo.com/) - Official NEEO community website.
- [KODI](https://kodi.tv/) - Official KODI website.
- [NEEO-SDK](https://github.com/NEEOInc/neeo-sdk) - NEEO SDK github.
- [NEEO-SDK Docs](https://neeoinc.github.io/neeo-sdk/) - Detailed SDK documentation.

## Authors

- **Niels de Klerk** - _Initial work_ - [Github](https://github.com/nklerk/)
- **michael kohler** - _Debugging and help_
- **NEEO** - _SDK_ - [Website](https://neeo.com/)

# ToDo:

- change the way the MAC address of a kodi instance is discovered.
- ability to add credentials.

# Releases

## Version 1.2.0

- Converted all connection methods to use websocket.
- Added now playing image, Small.
- Added now playing image, Large.
- Added now playing label.
- Added volume slider.

## Version 1.1.4

- Added websocket connection.

## Version 1.1.3

- Reworked the way itemlists are build. now steps of 64 items are fetched.
- Code cleaning.
- Fixed images.

## Version 1.1.2

- fixed reacurring filter issue

## Version 1.1.1

- NPM start fix

## Version 1.1.0

As all basic features are now working i've updated to 1.1.0.

- Fixed an endless discovery bug when a device got offline
- Fixed a WOL bug.
- Added PVR TV stations. Shows a list of TV channels and if EPG info is availeble also the current broadcast title.
- Added PVR Radio stations. Shows a list of Radio channels and if EPG info is availeble also the current broadcast title.
- Added contentaware buttons of Channel UP and Channel Down.
- Added Recent Albums

## Version 1.0.12

- Added support fot Music albums and tracks.
- Added Preloading Music albums.
- Added Library cache and background fetching. (especially nice with huge libraries.)
- Added support for Music Videos.

## Version 1.0.11

- Changed SDK-CLI Start method.

## Version 1.0.10

- added movie filters: All, Watched, Unwatched.

## Version 1.0.9

- added genre to movie list. just to play around, might change.

## Version 1.0.8

- Changed code to use NEEO CLI, Remove old files first!
- Added a debugging file for use with IDE. Debug_NEEO_DRIVER-KODI.js
- Removed Circular dependancies, Thanks to Michael Kohler
- Fixed promise.resolve issues.

## Version 1.0.7

- Changed the way to obtain the MAC address.

## Version 1.0.6

- Added content aware controlls. i.e. using cursor in movie to skip.

## Version 1.0.5

- Added Discovery logging to troubleshoot.
- removed IP in index.
- restructuring code.... (Still ongoing, could take a while)
- Starting to implement content aware buttons to behave like normal ir Remote or Key's

## Version 1.0.4

- Fixed "ENTER" -> "CURSOR ENTER"
- Fixed Button controlls.
- Added Connection banner in KODI.
- Added Offline discovery.
- Automatically reconnect.
- Rewritten WOL, (POWER ON)
- Automatically connect to KODI instance when POWER ON command is send. (maximum boot duration supported is 5 Minutes).
- Manual connect to KODI instance when any command is send. (Command is not queued except for Power ON and Power Off).
- restructured Commands.
- Cleaned NEEO Controller.
- Added logo_NEEO_Twitter to images.
- Removed discovery from browserService-Movie.
- Removed discovery from browserService-TVShow.
- Added timer configuration in KODI Controller.

## Version 1.0.3

- Rewritten BrowserService for TV Shows

## Version 1.0.2

- Restructured discovery process.
- Restructured controller for Kodi.
- Rewritten BrowserService for Movies.
- Added BrowserService for music
- Added BrowserService for pvr
- Added BrowserService for TV Shows
