![](https://img.shields.io/badge/Foundry-v9-informational) ![Latest Release Download Count](https://img.shields.io/github/downloads/jvir/foundry-falemos/module.zip) ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ffalemos&colorB=4aa94a)

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
- Template macros. Export the scene settings to a macro for later reuse.
- Default transmit voice to "Always active". Can be disabled in the module settings
- Camera to background. Place a camera in the background, this allows you to use virtual cameras to show other applications or to make freehand drawings.
- Shorcuts
    - Cicle enable/disable Falemos in current scene: ctrl+alt+d(isable)
    - Cicle UI visibility (Onlye GM): ctrl+alt+h(ide)
    - Cicle Scene Fit: ctrl+alt+f(it)
    - Execute Falemos Vaccinator by Viriato139ac: ctrl+alt+v(accinator)


## Usage

Falemos is scene-dependent. In the configuration of each scene we have the configuration parameters:

- Global
    - General enabled/disabled control.
    - UI elements display control.
    - Export to macro.

![Global config](https://github.com/jvir/foundry-falemos/blob/main/doc/img/globalconfig.png?raw=true)


- Per user:
    - Camera position and size (units are in percent of windows size).
    - image overlay.
    - Image overlay settings (units are in percent of camera size).
    - Geometry and effect applicable to the video
    - Colour, position, size and font of the label.
    - Set optional scene fit, scene fit, an adjusted scene has the consequence that the cameras remain in the same position in the image and can always be used to simulate the anchoring of the camera to an area of the image.

![User config](https://github.com/jvir/foundry-falemos/blob/main/doc/img/userconfig.png?raw=true)


## Assets

This module provides frame images in the folder "assets/img/frames" these files are provided by the community and the respective licenses of use and author are contained in a text file with the same name of the image.
Thanks to the original authors and contributors for their work.


## Example: Setting up the black castle

https://user-images.githubusercontent.com/5990316/117968116-207b1b00-b326-11eb-8c54-c96a2bdf9ac5.mp4




## Thanks

- To contributors (bug reporters, pull requesters, translators): Viriato139ac, Gorion, Dick-K, Xurxo Diz, Montver, Cal, BabyfaceFinlayson, ScriptFeliz, sladecraven.
- To all users, without them this module makes no sense.



