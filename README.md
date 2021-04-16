![](https://img.shields.io/badge/Foundry-v0.7.9-informational) ![Latest Release Download Count](https://img.shields.io/github/downloads/jvir/foundry-falemos/module.zip) ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ffalemos&colorB=4aa94a)

<a href='https://ko-fi.com/C0C43ZT90' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi2.png?v=2' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

# Falemos (Let's talk)

This is a module for Camera management in Foundry VTT. Falemos is a Galician word meaning "let's talk".

This module allows you to customise the style and position of the cameras in each scene and can be used for direct streaming from the foundry screen or simply for a more interesting presentation.

## Features by scene:
- Hide/Show controls (navigation, sidebar, controls, hotbar, players).
- Custom camera positon by player.
- Custom camera overlay by player.
- Custom video geometry.
- Custom video filters.
- Custom name with custom color, font and position by player.
- Shorcuts
    - Cicle UI visibility (Onlye GM): ctrl+alt+h(ide)
    - Cicle Scene Fit: ctrl+alt+f(it)


## Usage

**NOTE:** *If you have used Falemos before your old scenes will still work the same, but it is advisable to change them to the new percentage system as the old pixel system is considered deprecated and will be removed in future versions.
The new system is considered better as it respects the proportions on any screen size and the GM can know that all players see it the same (same proportions).*

Falemos is scene-dependent. In the configuration of each scene we have the configuration parameters:

- Global
    - General enabled/disabled control.
    - UI elements display control.

![Global config](https://github.com/jvir/foundry-falemos/blob/main/doc/img/globalconfig.png?raw=true)


- Per user:
    - Camera position and size (units are in percent of windows size).
    - image overlay.
    - Image overlay settings (units are in percent of camera size).
    - Geometry and effect applicable to the video
    - Colour, position, size and font of the label.
    - Set optional scene fit, scene fit, an adjusted scene has the consequence that the cameras remain in the same position in the image and can always be used to simulate the anchoring of the camera to an area of the image.

![User config](https://github.com/jvir/foundry-falemos/blob/main/doc/img/userconfig.png?raw=true)


## Thanks

- To bug reporters: Viriato139ac, Gorion, Dick-K.
- To pull requesters: Viriato139ac, Xurxo Diz.
- To translators: Gorion, Xurxo Diz.
- To all users, without them this module makes no sense.

## Changelog
- 0.3.5 Fix circle video position (thanks for report to Viriato139AC), updated translations.
- 0.3.3 Fix issue 7 by lozalojo, add missing localization strings, fix calculate current cam position button, fix camera height under certain circunstances.
- 0.3.0 Scene fit options by user, change fixed px units to relative vw units, hotkey for cicle fit options by user.
- 0.2.0 Change scene config retrieve from active to viewed.
- 0.1.0 Initial Alfa version, codename (Alfalfa).

