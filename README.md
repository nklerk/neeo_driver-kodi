"# NEEO, Kodi driver"

Install with: npm install

...DO NOT USE THIS DRIVER IF NOT SPECIFICALLY REQUESTED TO DO SO...

This driver is in an early alpha stage and won't work with the current NEEO version or the current SDK version.
Feel free to have a look though.

In Kodi make sure to enable the following settings: 
  - "Announce services to other systems", 
  - "Allow remote control via HTTP",
  - "Allow remote control from applications on other systems". 

Caviats.
- Kodi password must be set to nothing. Username/Password is not handled.
- Code Spagetti. Code needs to be cleaned but general work as intended.
- WoL is using both code 7 and 9 and should work but i haven't been able to get it fully working. (local PC issue.)
- Library tvShows, PVR and Music have to be fully rewritten (like i did with Movies.)

Drivers features:
- Discovering Kodi installation using MDNS.
- Wake on Lan as POWER ON command.
- Browse through movies and recent Movies. (add the <Directory> Movie Library as shortcut)
- All known commands are exposed as buttons.
- Update Audio Library.
- Update Video Library.

Upcomming features:
- Browse through Music Albums, Tracks and Music video's.
- Browse through TV Shows and episodes.
- Browse through TV Channels, Radio Channels and recordings.


# Version 1.0.3
- Rewritten BrowserService for TV Shows

# Version 1.0.2
- Restructured discovery process.
- Restructured controller for Kodi.
- Rewritten BrowserService for Movies.
- Added BrowserService for music
- Added BrowserService for pvr
- Added BrowserService for TV Shows

