# Pokemon-a-Day Calendar

A digital calendar that gives everyone the same deterministic random pokemon for each day.
The Pokedex entry that you get is random but specific to each person (determined using browser fingerprint).

Go to next or previous days using the right and left arrow keys (respectively), or tapping/clicking the right or left sides of the screen (also respectively).

More settings like auto-advance the day are WIP

## Set up for Raspberry Pi w/ Official Screen

This was designed with a Raspberry Pi and the official Pi Screen in mind (i.e., an 800x480 screen).

### Install app and run in full-screen on startup

1. Navigate to [pokemon-a.day](https://pokemon-a.day) in a Chromium-based browser and install the site as a Web App (should be somewhere to the right of the address bar)
   * Make sure to create a desktop shortcut for it, it makes it easier to locate
2. Open up the desktop app with a text editor and find the command used for `Exec` (everything after the `=`), and copy that somewhere or just take note of it.
3. Create a `.service` file in /home/pi/.config/systemd/user/ (I called mine `poke-cal.service`).
4. Place the following code into that file

```shell
[Unit]
Description=Pokemon-a-day PWA
After=multi-user.target
PartOf=graphical-session.target

[Service]
Type=simple
Environment="DISPLAY=:0"
Environment="XAUTHORITY=/home/pi/.Xauthority"
ExecStart=/usr/bin/chromium-browser --profile-directory=Default --app-id=<your-app-id> --start-fullscreen


[Install]
WantedBy=graphical.target
```

5. You can see on the `ExecStart` line I have pasted the code we copied earlier, but took out the specific app-id. Basically you want the same line but with the app-id your browser created
   * Also take note of the `--start-fullscreen` that wasn't in the original `Exec` line
6. Enable the service to run on start up with the following commands
7. Restart and see if it worked :grin:

```
systemctl --user enable <what-you-named>.service
systemctl --user daemon-reload
```

### Auto Dim Screen

I wanted this thing to run all the time but having the screen maxed out always can be annoying for several reasons.
There's no build in way to achieve auto-dimming on a timer (that I could find), so I spruced up an old [script I found on github](https://github.com/eskdale/pi-touchscreen-dimmer) to do the job.

At the time of writing, the original script has not accepted the changes I made to fix it for modern hardware, so [you can use my fork](https://github.com/gabeklavans/pi-touchscreen-dimmer) in the meantime.

