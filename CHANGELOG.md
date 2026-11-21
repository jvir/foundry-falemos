# 2.0.0

- **Compatibilidad exclusiva con Foundry VTT v14** (verificado en 14.370). Ya no funciona en v12 ni anteriores.
- Reescrito para el nuevo sistema de cámaras (`CameraViews` + `CameraPopout`, ApplicationV2). Al activar Falemos en una escena, se sacan todas las cámaras del dock a ventanas libres y Falemos controla su posición, tamaño, marco, nombre, forma y filtro con `setPosition`, sin CSS global ni `!important`.
- Al desactivar Falemos solo se devuelven al dock las cámaras que sacó Falemos (no las que el usuario sacó a mano).
- Ya no se recarga la página al cambiar la configuración: los cambios se aplican con el hook `updateScene`.
- Pestaña Falemos de la configuración de escena adaptada a `SceneConfig` (ApplicationV2): `<file-picker>`, `selectOptions`, hooks con `HTMLElement`.
- Atajos (Ctrl+Alt+F/H/V/D) migrados a `game.keybindings` (reasignables). H, V y D son solo GM. El ciclo de H es ahora: todo, escena, nada.
- Los jugadores piden el cambio de ajuste (Ctrl+Alt+F) por socket y lo aplica el GM activo.
- Falemos Vaccinator 0.20: `Dialog` sustituido por `DialogV2` (sin `<script>` ni `onclick` incrustados). El cálculo de la rejilla no cambia.
- Las macros exportadas ahora serializan los datos con `JSON.stringify` (se mantienen compatibles las macros antiguas).
- Eliminados ficheros sin uso: `html2canvas`, `templates/hud/camera-views.html`, `styles/test.css`, `styles/module.css.bak`.

# 1.3.0

- Reset to left positioning: When disabling falemos using macros, it resets the camera dock to left, to avoid the 100px limit set by falemos, as a workaround since I am not able to reset it back to 240px
- Updated to v11 compatibility
- Updated Vaccinator macro: now allows to resize window
- Modified nofit mode: now it wont reset scene adjust to fit to width/height when there are no changes to mode
