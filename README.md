"# NEEO, Kodi driver"

Install with: npm install

...DO NOT USE THIS DRIVER IF NOT SPECIFICALLY REQUESTED TO DO SO...

This driver is in an early alpha stage and won't work with the current NEEO version or the current SDK version.
Feel free to have a look though.

In Kodi make sure to enable the following settings: 
  # "Announce services to other systems", 
  # "Allow remote control via HTTP",
  # "Allow remote control from applications on other systems". 

Caviats.
- Kodi password must be set to nothing. Username/Password is not handled.
- Code Spagetti. Code needs to be cleaned but general work is as intended.
- Requesting library from kodi takes some time, I have chosen to load libraries in background for a more snappy feeling. and less resources.
  downside is the initial browsing to one of the libraries may result in a refresh of the first shown list until loading is finished. (only once per driver start/device).
- WoL is using both code 7 and 9 and should work but i haven't been able to get it fully working.

Drivers features:
- Discovering Kodi installation using MDNS.
- Wake on Lan as POWER ON command.
- Browse through movies and recent Movies. (add the <Directory> Library as shortcut)
- All known commands are exposed as buttons.
- Update Audio Library.
- Update Video Library.

Upcomming features:
- Browse through Music Albums, Tracks and Music video's.
- Browse through TV Shows and episodes.
- Browse through TV Channels, Radio Channels and recordings.