//import HudContextMenu from './hudContextMenu';

Hooks.once("init", async function () {
  const MCCONFIG = {
    /**
     * Available Camera Effects implementations
     * @type {Object}
     */
    cameraEffects: {
      NONE: { name: "FALEMOS.camera.effects.none", data: "none" },
      BW: { name: "FALEMOS.camera.effects.bw", data: "grayscale(1)" },
      Sepia: { name: "FALEMOS.camera.effects.sepia", data: "sepia(1)" },
      Noise: { name: "FALEMOS.camera.effects.noise", data: "url('#noise')" },
      Warp: { name: "FALEMOS.camera.effects.warp", data: "url('#warp')" },
      Blue: { name: "FALEMOS.camera.effects.blue", data: "url('#bluefill')" },
      Red: { name: "FALEMOS.camera.effects.red", data: "url('#redfill')" },
      Green: {
        name: "FALEMOS.camera.effects.green",
        data: "url('#greenfill')",
      },
      Edges: { name: "FALEMOS.camera.effects.edges", data: "url('#edges')" },
    },
    cameraGeometry: {
      rectangle: {
        name: "FALEMOS.camera.geometry.rectangle",
        data: "clip-path: none;",
      },
      circle: {
        name: "FALEMOS.camera.geometry.circle",
        data: "clip-path: circle(41% at 50% 50%);",
      },
      triangle: {
        name: "FALEMOS.camera.geometry.triangle",
        data: "clip-path: polygon(50% 0%, 0% 100%, 100% 100%);",
      },
      rhombus: {
        name: "FALEMOS.camera.geometry.rhombus",
        data: "clip-path: polygon(50% 0%, 83.4% 50%, 50% 100%, 16.6% 50%);",
      },
      hexagon: {
        name: "FALEMOS.camera.geometry.hexagon",
        data: "clip-path: polygon(25% 0%, 75% 0%, 95% 50%, 75% 100%, 25% 100%, 5% 50%);",
      },
      star: {
        name: "FALEMOS.camera.geometry.star",
        data: "clip-path: polygon(50% 0, 61% 25%, 90% 25%, 74% 50%, 90% 75%, 61% 75%, 50% 100%, 38% 75%, 10% 75%, 26% 50%, 10% 25%, 38% 25%);",
      },
      shield: {
        name: "FALEMOS.camera.geometry.shield",
        data: "clip-path: inset(0% 15% 0% 15% round 0% 0% 50% 50%);",
      },
      square: {
        name: "FALEMOS.camera.geometry.square",
        data: "clip-path: polygon(12.5% 0%, 12.5% 100%, 87.5% 100%, 87.5% 0%);",
      },
      trapezoid: {
        name: "FALEMOS.camera.geometry.trapezoid",
        data: "clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);",
      },
      bevel: {
        name: "FALEMOS.camera.geometry.bevel",
        data: "clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);",
      },
      rabbet: {
        name: "FALEMOS.camera.geometry.rabbet",
        data: "clip-path: polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%);",
      },
    },
    sceneFit: {
      nofit: { name: "FALEMOS.scene.fit.nofit", data: "nofit" },
      cover: { name: "FALEMOS.scene.fit.cover", data: "cover" },
      covercenter: {
        name: "FALEMOS.scene.fit.covercenter",
        data: "covercenter",
      },
      contain: { name: "FALEMOS.scene.fit.contain", data: "contain" },
      containcenter: {
        name: "FALEMOS.scene.fit.containcenter",
        data: "containcenter",
      },
    },
  };
  CONFIG.FALEMOS = MCCONFIG;
});

Hooks.once("ready", async function () {
  //CONFIG.debug.hooks=true
  //versionChangesPopup();
  //_addChatListeners();

  //config Audio to always
  game.settings.register("falemos", "enableAlwaysMicrophone", {
    config: true,
    scope: "client",
    name:
      game.i18n.localize("WEBRTC.VoiceMode") +
      " '" +
      game.i18n.localize("WEBRTC.VoiceModeAlways") +
      "'",
    hint: game.i18n.localize("FALEMOS.VoiceModeAlwaysHint"),
    type: Boolean,
    default: true,
  });

  let rtcconfiguration = Object.assign(
    {},
    game.settings.get("core", "rtcClientSettings")
  );
  if (
    rtcconfiguration != "always" &&
    game.settings.get("falemos", "enableAlwaysMicrophone")
  ) {
    rtcconfiguration.voice.mode = "always";
    game.settings.set("core", "rtcClientSettings", rtcconfiguration);
  }

  //sockets
  game.socket.on("module.falemos", async (data) => {
    onSocketData(data);
  });

  function updateMacro(macroFile) {
    fetch(macroFile)
      .then((res) => res.text())
      .then((content) => {
        let macroContents = content.split(`\n`);
        let versionLine = -1;
        for (var i = 0; i < macroContents.length; i++) {
          if (macroContents[i].search(/macroVersion/) > -1) {
            versionLine = i;
            break;
          }
        }
        let macroVersion = parseFloat(
          macroContents[versionLine]
            .split("=")[1]
            .replace(/\;/g, "")
            .replace(/\"/g, "")
        );
        let nameLine = -1;
        for (var i = 0; i < macroContents.length; i++) {
          if (macroContents[i].search(/macroName/) > -1) {
            nameLine = i;
            break;
          }
        }
        let macroName = macroContents[nameLine]
          .split("=")[1]
          .replace(/\;/g, "")
          .replace(/\"/g, "")
          .trim();
        let imageLine = -1;
        for (var i = 0; i < macroContents.length; i++) {
          if (macroContents[i].search(/macroImage/) > -1) {
            imageLine = i;
            break;
          }
        }
        let macroImage = macroContents[imageLine]
          .split("=")[1]
          .replace(/\;/g, "")
          .replace(/\"/g, "")
          .trim();

        let instMacro = game.macros.getName(macroName);
        let instVersion = instMacro ? instMacro.flags.version : 0;
        console.log("Analizando: " + macroFile);

        if (
          !instMacro ||
          instVersion === undefined ||
          parseFloat(instVersion) < macroVersion
        ) {
          if (instMacro) {
            console.log(
              "Macro: " +
                macroName +
                ", Versión: " +
                macroVersion +
                ", Instalada: ",
              instVersion,
              " --- Actualizamos macro actual"
            );

            instMacro.update({
              name: macroName,
              type: "script",
              img: macroImage,
              command: content,
              flags: {
                version: macroVersion,
              },
            });
          } else {
            console.log(
              "Macro: " +
                macroName +
                ", Versión: " +
                macroVersion +
                ", Instalada: ",
              instVersion,
              " --- Creamos macro"
            );

            Macro.create({
              name: macroName,
              type: "script",
              img: macroImage,
              command: content,
              flags: {
                version: macroVersion,
              },
            });
          }
        } else {
          console.log(
            "Macro: " +
              macroName +
              ", Versión: " +
              macroVersion +
              ", Instalada: ",
            instVersion,
            " --- No hacemos nada"
          );
        }
      });
  }

  //create macro vaccinator if not exist or not updated
  if (game.user.isGM) {
    updateMacro("/modules/falemos/scripts/utils/falemosVaccinator.js");
  }

  //exposed functions
  game.falemos = {
    getSceneConfig: function (sceneId) {
      //TODO changes avoid issue share macros
      let data = { ...game.scenes.get(sceneId).flags.falemos.config };
      let newData = {};

      //console.log(data);
      let users = Array.from(game.users);
      let i = 0;

      users.forEach((user) => {
        newData[i] = data[user.id];
        i++;
      });
      newData.enable = data.enable;
      newData.hide = data.hide;
      return newData;
    },
    putSceneConfig: function (sceneId, json) {
      if (game.scenes.viewed === undefined) {
        ui.notifications.error(`Ninguna escena activa`);
        return;
      }
      if (!sceneId) {
        sceneId = game.scenes.viewed.id;
      }

      let data = JSON.parse(json);
      let newData = {};
      //console.log(data);

      let users = Array.from(game.users);
      let i = 0;

      users.forEach((user) => {
        newData[user.id] = data[i];
        i++;
      });
      newData.enable = data.enable;
      newData.hide = data.hide;

      if (!data.enable && game.scenes.viewed.flags.falemos.config.enable) {
        let rtcSett = game.settings.get("core", "rtcClientSettings");

        rtcSett.dockPosition = "left";
        rtcSett.hideDock = false;
        for (let [k, v] of Object.entries(
          game.settings.get("core", "rtcClientSettings").users
        )) {
          v.popout = false;
          rtcSett.users[k] = v;
        }
        game.settings.set("core", "rtcClientSettings", rtcSett);
      }
      game.scenes.get(sceneId).setFlag("falemos", "config", newData);
    },
    sceneConfigToMacro: function (sceneId, data) {
      if (game.scenes.viewed === undefined) {
        ui.notifications.error(`Ninguna escena activa`);
        return;
      }

      if (!sceneId) sceneId = game.scenes.viewed.id;
      if (!data) data = game.falemos.getSceneConfig(sceneId);
      let dataJSON = JSON.stringify(data).replace(/[\']/g, "&apos;");

      new Dialog({
        title:
          "Falemos: " +
          game.i18n.localize("FALEMOS.DialogTitleSaveSceneConfig"),
        content: `<table style="width:100%"><tr><th style="width:50%"><label>${game.i18n.localize(
          "FALEMOS.DialogContentMacroName"
        )}:</label></th><td style="width:50%"><input type="text" name="falemosMacroName"/></td></tr></table>`,
        buttons: {
          Create: {
            label: game.i18n.localize("FALEMOS.CreateMacro"),
            callback: (html) => {
              let macro = Macro.create({
                name: html.find("input").val(),
                type: "script",
                img: "modules/falemos/assets/img/falemos.svg",
                command:
                  "let sceneData = `" +
                  dataJSON +
                  "`; game.falemos.putSceneConfig(null, sceneData);",
              });
            },
          },
        },
      }).render(true);
    },
    camToTile: function (userId) {
      if (game.falemos.sprite && !game.falemos.sprite._destroyed) {
        game.falemos.sprite.destroy();
        return;
      }
      let video = document.querySelectorAll(
        `.camera-view[data-user="${userId}"] video`
      )[0];

      game.falemos.sprite = new PIXI.Sprite(PIXI.Texture.from(video));

      canvas.primary.addChild(game.falemos.sprite);

      game.falemos.sprite.width = canvas.dimensions.width;
      game.falemos.sprite.height = canvas.dimensions.height;

      game.falemos.sprite.texture.baseTexture.resource.source.play();
    },
  };

  //svg filters
  let svghtml = await renderTemplate(
    "modules/falemos/templates/filter/filter.html",
    {}
  );
  document.body.insertAdjacentHTML("beforeend", svghtml);
  //jQuery(svghtml).appendTo(document.body);

  //shorcuts
  document.onkeydown = function (e) {
    //TODO use sockets for all players
    if (game.scenes.viewed === undefined) return;
    if (e.ctrlKey && e.altKey && e.which == 70) {
      //TODO toggle UI fit options in current scene (F)
      //console.log(`${game.user.name} Toggle fit scene mode`);
      let tempFit = game.scenes.viewed.flags?.falemos?.config[game.userId]?.fit;
      switch (tempFit) {
        case "cover":
          game.socket.emit("module.falemos", {
            event: "toggleFitHotkey",
            action: "command",
            data: {
              user: game.user,
              scene: game.scenes.viewed,
              mode: "covercenter",
            },
          });
          //game.scenes.viewed.setFlag('falemos', `config.${game.userId}.fit`, 'contain').then(()=>canvasFit('contain', true));
          break;
        case "covercenter":
          game.socket.emit("module.falemos", {
            event: "toggleFitHotkey",
            action: "command",
            data: {
              user: game.user,
              scene: game.scenes.viewed,
              mode: "contain",
            },
          });
          //game.scenes.viewed.setFlag('falemos', `config.${game.userId}.fit`, 'contain').then(()=>canvasFit('contain', true));
          break;
        case "contain":
          game.socket.emit("module.falemos", {
            event: "toggleFitHotkey",
            action: "command",
            data: {
              user: game.user,
              scene: game.scenes.viewed,
              mode: "containcenter",
            },
          });
          //game.scenes.viewed.setFlag('falemos', `config.${game.userId}.fit`, 'nofit').then(()=>canvasFit('nofit', true));
          break;
        case "containcenter":
          game.socket.emit("module.falemos", {
            event: "toggleFitHotkey",
            action: "command",
            data: { user: game.user, scene: game.scenes.viewed, mode: "nofit" },
          });
          //game.scenes.viewed.setFlag('falemos', `config.${game.userId}.fit`, 'nofit').then(()=>canvasFit('nofit', true));
          break;
        default:
          game.socket.emit("module.falemos", {
            event: "toggleFitHotkey",
            action: "command",
            data: { user: game.user, scene: game.scenes.viewed, mode: "cover" },
          });
          //game.scenes.viewed.setFlag('falemos', `config.${game.userId}.fit`, 'cover').then(()=>canvasFit('cover', true));
          break;
      }
    }
    if (e.ctrlKey && e.altKey && e.which == 72) {
      //TODO toggle UI visibility in current scene (H) ONLY GM
      if (!game.user.isGM) return;
      //console.log("GM Toggle UI visibiity");
      let tempUI = game.scenes.viewed.flags?.falemos?.config?.hide?.mode;
      switch (tempUI) {
        case "all":
          game.scenes.viewed.setFlag("falemos", "config.hide.mode", "scene");
          break;
        case "none":
          game.scenes.viewed.setFlag("falemos", "config.hide.mode", "all");
          break;
        default:
          let currentVisibility = Object.assign(
            {},
            game.scenes.viewed.flags.falemos.config.hide
          );
          if (
            Object.values(currentVisibility).reduce(
              (a, value) => a + value,
              0
            ) == Object.keys(currentVisibility).length
          ) {
            //all visible
            Object.keys(currentVisibility).forEach(
              (key) => (currentVisibility[key] = false)
            );
            //hideUi(currentVisibility);
            game.scenes.viewed.setFlag("falemos", "config.hide.mode", "none");
          } else if (
            Object.values(currentVisibility).reduce(
              (a, value) => a + value,
              0
            ) == 0
          ) {
            //all hide
            Object.keys(currentVisibility).forEach(
              (key) => (currentVisibility[key] = true)
            );
            //hideUi(currentVisibility);
            game.scenes.viewed.setFlag("falemos", "config.hide.mode", "all");
          } else {
            game.scenes.viewed.setFlag("falemos", "config.hide.mode", "none");
          }
      }
    }
    if (e.ctrlKey && e.altKey && e.which == 86) {
      //run Falemos Vaccinator by Viriato139ac [V]
      console.log("Executing Falemos Vaccinator by Viriato139ac");
      game.macros.getName("Falemos Vaccinator by Viriato139ac").execute();
    }
    if (e.ctrlKey && e.altKey && e.which == 68) {
      // Cicle enable/disable Falemos [D]
      console.log("Executing enable/disable Falemos shorcut");
      game.scenes.viewed.setFlag(
        "falemos",
        "config.enable",
        !game.scenes.viewed.flags.falemos.config.enable
      );
    }
  };
});

Hooks.on("renderCameraViews", async function (cameraviews, html) {
  if (game.scenes.viewed !== undefined)
    if (game.scenes.viewed.flags.falemos?.config?.enable) {
      html.find(".camera-view").each((index, camera) => {
        camera.dataset.scene = game.scenes.viewed.id;
        camera.parentNode.dataset.scene = game.scenes.viewed.id;
      });
      html.find(".user-avatar").each((index, avatar) => {
        avatar.insertAdjacentHTML(
          "afterend",
          `<div class="falemos-camera-overlay"></div>`
        );
        avatar.insertAdjacentHTML(
          "afterend",
          `<div class="falemos-name-overlay"></div>`
        );
        avatar.insertAdjacentHTML(
          "afterend",
          `<div class="falemos-chat-overlay"></div>`
        );
      });

      html.find(".control-bar.bottom").each((index, avcontrol) => {
        //avcontrol.insertAdjacentHTML('beforeend', '<a class="av-control toggle" title="" data-action="toggle-isolate"><i class="fas fa-users"></i></a>');
        avcontrol.insertAdjacentHTML(
          "beforeend",
          '<a class="av-control toggle" title="" data-action="toggle-tile"><i class="fas fa-map"></i></a>'
        );
      });
      html.find('.av-control[data-action="toggle-isolate"]').click((ev) => {
        game.users
          .get(ev.currentTarget.closest(".camera-view").dataset.user)
          .setFlag(
            "falemos",
            "isolated",
            !game.users.get(
              ev.currentTarget.closest(".camera-view").dataset.user
            ).data.flags.falemos?.isolated
          );
        Hooks.call("updateFalemosIsolated", game.users);
      });
      html.find('.av-control[data-action="toggle-tile"]').click((ev) => {
        game.falemos.camToTile(
          ev.currentTarget.closest(".camera-view").dataset.user
        );
      });

      camerasToPopout(html);
      camerasStyling(html);
      canvasFit(game.scenes.viewed.flags.falemos.config[game.userId].fit, true);
    } else {
      // when falemos is disabled, revert css styling (for example, the min-width of falemos of 100px return to 240px by default
      document.getElementById("falemosStyles")
        ? document.getElementById("falemosStyles").remove()
        : null;
    }
});

Hooks.on("renderSceneConfig", async function (sceneConfig, html, scene) {
  console.log("renderSceneConfig:INI");
  console.log(game.scenes.viewed.flags.falemos?.config);
  // I create this flag to reload the window at closeSceneConfig when switching from falemos disabled to falemos enabled, I reload to clean the falemos css
  game.scenes.viewed.setFlag(
    "falemos",
    "config.previouslyDisabled",
    !game.scenes.viewed.flags.falemos?.config?.enable
  );

  let falemosconfig = game.scenes
    .get(scene.data._id)
    .getFlag("falemos", "config")
    ? game.scenes.get(scene.data._id).getFlag("falemos", "config")
    : null;
  let users = Array.from(game.users);

  console.log("renderSceneConfig:ANTES DE PINTAR EL DIALOGO");
  console.log(falemosconfig);
  console.log(users);
  console.log(scene.data._id);
  console.log(CONFIG.FALEMOS);

  //renderTemplate con campos y data saliendo de los flags
  let mchtml = await renderTemplate(
    "modules/falemos/templates/scene/mc-config.html",
    {
      falemosconfig: falemosconfig,
      users: users,
      sceneid: scene.data._id,
      falemos: CONFIG.FALEMOS,
    }
  );

  //insert tab (v12 change)
  //html.find('nav a:last').after('<a class="item" data-tab="falemos"><i class="fas fa-camera"></i> Falemos</a>');
  html
    .find("nav a:eq(3)")
    .after(
      '<a class="item" data-tab="falemos"><i class="fas fa-camera"></i> Falemos</a>'
    );

  //insert mc html template (v12 change)
  //html.find('button>i.fa-save').parent().before(mchtml);
  html.find("button").parent().before(mchtml);

  // enable listeners
  html.find(".capture-current").each(function (index) {
    $(this).on("click", function (ev) {
      let offset = jQuery(
        `.camera-view[data-user="${ev.currentTarget.dataset.user}"] video`
      )
        .first()
        .offset();
      jQuery(`[name='flags.falemos.config.${ev.currentTarget.dataset.user}.x']`)
        .first()
        .val(offset.left / (window.innerWidth / 100));
      jQuery(`[name='flags.falemos.config.${ev.currentTarget.dataset.user}.y']`)
        .first()
        .val(offset.top / (window.innerHeight / 100));
    });
  });

  sceneConfig.activateListeners(html);
  //html.find('button.file-picker').each((i, button) => this._activateFilePicker(button));
  console.log("renderSceneConfig:FIN");
  console.log(game.scenes.viewed.flags.falemos?.config);
});

Hooks.on("closeSceneConfig", async function (sceneConfig, html, data) {
  console.log("closeSceneConfig:INI");
  console.log(game.scenes.viewed.flags.falemos?.config);
  if (game.scenes.viewed.flags.falemos?.config?.enable) {
    let camerashtml = jQuery("#camera-views");
    camerashtml.find(".camera-view").each((index, camera) => {
      camera.dataset.scene = game.scenes.viewed.id;
      camera.parentNode.dataset.scene = game.scenes.viewed.id;
    });
    camerasToPopout(camerashtml);
    camerasStyling(camerashtml);

    switch (game.scenes.viewed.flags.falemos.config[game.userId].fit) {
      case "nofit":
        canvasFit("nofit");
        break;
      case "cover":
        canvasFit("cover");
        break;
      case "contain":
        canvasFit("contain");
        break;
      case "covercenter":
        canvasFit("covercenter");
        break;
      case "covercenter":
        canvasFit("covercenter");
        break;
    }
    // I created this flag to reload the window at closeSceneConfig when switching from falemos disabled to falemos enabled, I reload to clean the falemos css
    game.scenes.viewed.flags.falemos?.config?.previouslyDisabled
      ? location.reload()
      : null;
  } else {
    canvasFit("nofit");
    !game.scenes.viewed.flags.falemos?.config?.previouslyDisabled
      ? location.reload()
      : null;
  }
  console.log("closeSceneConfig:FIN");
  console.log(game.scenes.viewed.flags.falemos?.config);
});

Hooks.on("renderSceneNavigation", async function (scene, html) {
  console.log("renderSceneNavigation:INI");
  console.log(game.scenes.viewed.flags.falemos?.config);
  //TODO get form values and save in flag
  if (game.scenes.viewed !== undefined)
    if (game.scenes.viewed.flags.falemos?.config?.enable) {
      let camerashtml = jQuery("#camera-views");
      camerashtml.find(".camera-view").each((index, camera) => {
        camera.dataset.scene = game.scenes.viewed.id;
        camera.parentNode.dataset.scene = game.scenes.viewed.id;
      });
      camerasToPopout(camerashtml);
      camerasStyling(camerashtml);
      hideUi(game.scenes.viewed.flags.falemos.config.hide);
      canvasFit(game.scenes.viewed.flags.falemos.config[game.userId].fit, true);
    } else {
      let camerashtml = jQuery("#camera-views");
      camerashtml.find(".camera-view").each((index, camera) => {
        camera.removeAttribute("data-scene");
        camera.parentNode.removeAttribute("data-scene");
      });
      cameraToDock(camerashtml);
      hideUi({}, "all");
    }
  console.log("renderSceneNavigation:FIN");
  console.log(game.scenes.viewed.flags.falemos?.config);
});

Hooks.on("rtcSettingsChanged", async function (cameraviews, html) {
  //TODO: for isolate audio for groups
});

Hooks.on("canvasPan", async function (canvas, view) {
  if (!game.scenes.viewed.flags?.falemos?.config?.enable) {
    return;
  }

  switch (game.scenes.viewed.flags.falemos.config[game.userId].fit) {
    case "cover":
      canvasFit("cover");
      break;
    case "contain":
      canvasFit("contain");
      break;
    case "covercenter":
      canvasFit("covercenter");
      break;
    case "containcenter":
      canvasFit("containcenter");
      break;
  }
});

Hooks.on("renderDrawingHUD", async function (app, html, data) {
  //TODO
  //console.log(html);
  html.find(".control-icon.sort-down");
});

function canvasFit(mode = "contain", force = false) {
  if (!canvas.stage) return;
  // Calculate padding
  let padUnitsWidth = Math.ceil(
    (game.scenes.viewed.dimensions.sceneWidth * game.scenes.viewed.padding) /
      game.scenes.viewed.grid.size
  );
  let padUnitsHeight = Math.ceil(
    (game.scenes.viewed.dimensions.sceneHeight * game.scenes.viewed.padding) /
      game.scenes.viewed.grid.size
  );
  let padWidth = padUnitsWidth * game.scenes.viewed.grid.size; // igual que game.scenes.viewed.dimensions.sceneX
  let padHeight = padUnitsHeight * game.scenes.viewed.grid.size; // igual que  game.scenes.viewed.dimensions.sceneY

  // aspectratios
  let scaleW = window.innerWidth / game.scenes.viewed.dimensions.sceneWidth;
  let scaleH = window.innerHeight / game.scenes.viewed.dimensions.sceneHeight;

  // input values to calculate the initial values for canvas.pan
  let inputValues;
  if (mode === "nofit") {
    inputValues = {
      initialZoom: game.scenes.viewed.initial.scale
        ? game.scenes.viewed.initial.scale
        : 1,
      imagePosX1:
        (padWidth -
          (game.scenes.viewed.initial.x ? game.scenes.viewed.initial.x : 0)) *
          (game.scenes.viewed.initial.scale
            ? game.scenes.viewed.initial.scale
            : 1) +
        window.innerWidth / 2,
      imagePosY1:
        (padHeight -
          (game.scenes.viewed.initial.y ? game.scenes.viewed.initial.y : 0)) *
          (game.scenes.viewed.initial.scale
            ? game.scenes.viewed.initial.scale
            : 1) +
        window.innerHeight / 2,
    };
  } else if (mode === "contain") {
    inputValues = {
      initialZoom: Math.min(scaleW, scaleH),
      imagePosX1: 0,
      imagePosY1: 0,
    };
  } else if (mode === "containcenter") {
    inputValues = {
      initialZoom: Math.min(scaleW, scaleH),
      imagePosX1:
        (window.innerWidth -
          game.scenes.viewed.dimensions.sceneWidth * Math.min(scaleW, scaleH)) /
        2,
      imagePosY1:
        (window.innerHeight -
          game.scenes.viewed.dimensions.sceneHeight *
            Math.min(scaleW, scaleH)) /
        2,
    };
  } else if (mode === "cover") {
    inputValues = {
      initialZoom: Math.max(scaleW, scaleH),
      imagePosX1: 0,
      imagePosY1: 0,
    };
  } else if (mode === "covercenter") {
    inputValues = {
      initialZoom: Math.max(scaleW, scaleH),
      imagePosX1:
        (window.innerWidth -
          game.scenes.viewed.dimensions.sceneWidth * Math.max(scaleW, scaleH)) /
        2,
      imagePosY1:
        (window.innerHeight -
          game.scenes.viewed.dimensions.sceneHeight *
            Math.max(scaleW, scaleH)) /
        2,
    };
  } else return;

  let viewOld = {
    scale: canvas.stage.scale._x,
    x: canvas.stage.pivot._x,
    y: canvas.stage.pivot._y,
  };
  let viewNew = {
    scale: inputValues.initialZoom,
    x:
      (window.innerWidth / 2 - inputValues.imagePosX1) /
        inputValues.initialZoom +
      padWidth,
    y:
      (window.innerHeight / 2 - inputValues.imagePosY1) /
        inputValues.initialZoom +
      padHeight,
  };

  if (
    Math.abs(viewOld.scale - viewNew.scale) > 0.01 ||
    Math.abs(viewOld.x - viewNew.x) > 1 ||
    Math.abs(viewOld.y - viewNew.y) > 1 ||
    force
  ) {
    if (mode !== "nofit") canvas.pan(viewNew);
    createSceneStyles(mode);
  }
}

function hideUi(data, mode = null) {
  //hide/shoe UI elements
  mode ? (data.mode = mode) : null;
  switch (data.mode) {
    case "all":
      $("#navigation").show();
      $("#controls").show();
      $("#players").show();
      $("#sidebar").show();
      $("#hotbar").show();
      break;
    case "none":
      $("#navigation").hide();
      $("#controls").hide();
      $("#players").hide();
      $("#sidebar").hide();
      $("#hotbar").hide();
      break;
    default:
      data.navigation ? $("#navigation").hide() : $("#navigation").show();
      data.controls ? $("#controls").hide() : $("#controls").show();
      data.players ? $("#players").hide() : $("#players").show();
      data.sidebar ? $("#sidebar").hide() : $("#sidebar").show();
      data.hotbar ? $("#hotbar").hide() : $("#hotbar").show();
  }
}

function cameraToDock(html) {
  Array.from(game.users).forEach((user) => {
    let userCamera = html.find(`.camera-view[data-user="${user.id}"]`);
    if (userCamera.length != 1) return; //no camera, next.

    if (userCamera[0].classList.contains(`camera-box-popout`)) {
      //camera is docked => click to popout
      userCamera[0].querySelector(`[data-action="toggle-popout"]`).click();
      return;
    }
  });
}

function camerasToPopout(html) {
  Array.from(game.users).forEach((user) => {
    let userCamera = html.find(`.camera-view[data-user="${user.id}"]`);
    if (userCamera.length != 1) return; //no camera, next.

    if (userCamera[0].classList.contains(`camera-box-dock`)) {
      //camera is docked => click to popout
      userCamera[0].querySelector(`[data-action="toggle-popout"]`).click();
      return;
    }
  });
}

function camerasStyling(html) {
  Array.from(game.users).forEach((user) => {
    if (
      game.scenes.viewed.flags.falemos.config[user.id].cameraName ||
      game.scenes.viewed.flags.falemos.config[user.id].cameraName === ""
    ) {
      let el = jQuery(`#camera-views-user-${user.id} .falemos-name-overlay`);
      if (el[0])
        el[0].innerHTML =
          game.scenes.viewed.flags.falemos.config[user.id].cameraName;
    }
  });
  createSceneStyles();
}

function createSceneStyles(imageFormat = null) {
  document.getElementById("falemosStyles")
    ? document.getElementById("falemosStyles").remove()
    : null;

  let css = "";
  let scene = game.scenes.viewed;
  Array.from(game.users).forEach((user) => {
    if (scene.flags.falemos && scene.flags.falemos.config.enable === true) {
      let filterKey = scene.flags.falemos.config[user.id].filter;
      let geometryKey = scene.flags.falemos.config[user.id].geometry
        ? game.scenes.viewed.flags.falemos.config[user.id].geometry
        : "rectangle";

      let overlayImg = scene.flags.falemos.config[user.id].overlayImg;
      let overlayName = scene.flags.falemos.config[user.id].overlayName;
      let overlayHSize =
        scene.flags.falemos.config[user.id].overlayLeft +
        scene.flags.falemos.config[user.id].overlayRight;
      let overlayVSize =
        scene.flags.falemos.config[user.id].overlayTop +
        scene.flags.falemos.config[user.id].overlayBottom;
      let overlayLeft = scene.flags.falemos.config[user.id].overlayLeft;
      let overlayTop = scene.flags.falemos.config[user.id].overlayTop;

      if (!overlayHSize) {
        overlayHSize = 0;
      }
      if (!overlayVSize) {
        overlayVSize = 0;
      }
      if (!overlayLeft) {
        overlayLeft = 0;
      }
      if (!overlayTop) {
        overlayTop = 0;
      }

      //base style
      css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] { background: transparent; padding: 0; box-shadow: none; }\r\n `; //disable shadows and background
      css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .control-bar.left, #camera-views-user-${user.id}[data-scene="${scene.data._id}"] .window-resizable-handle { display: none; } `;
      css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .camera-view { background-image: none; background: rgba(250,250,250,0); border: 0px; /*indicador de hablando*/ box-shadow: none;  padding: 0px !important; /*Tamaño borde*/ }\r\n `;
      css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .player-name { display: none; }\r\n `; //hidde player name
      //custom style
      css += `.camera-view[data-user="${user.id}"][data-scene="${scene.data._id}"] video { object-fit: cover; filter: ${CONFIG.FALEMOS.cameraEffects[filterKey].data}; }\r\n `; //video filter
      css += `.camera-view[data-user="${user.id}"][data-scene="${scene.data._id}"] video { ${CONFIG.FALEMOS.cameraGeometry[geometryKey].data} }\r\n `; //video geometry
      css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .camera-box-popout { background: transparent !important; }\r\n `; // quita el fondo de color del video
      css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-camera-overlay { z-index: 1; }\r\n `; // el marco lo pongo por encima de la camara pero por debajo de los controles de av
      css += `div#camera-views { --av-width: 100px; }\r\n `; // minimo tamaño de video a 100px (por defecto esta en 240px)

      //new relative units (vw) TODO: tener en cuenta para modo cover cual es el lado del cual no se ve aprte de la imagen (ahora solo funciona si el width se ve entero

      let cssWidth = "";
      let currentLeft =
        (game.scenes.viewed.flags.falemos.config[user.id].x *
          window.innerWidth) /
        100;
      let currentTop =
        (game.scenes.viewed.flags.falemos.config[user.id].y *
          window.innerHeight) /
        100;

      if (imageFormat === "contain" || imageFormat === "containcenter") {
        let maxWidth =
          ((game.scenes.viewed.width * game.scenes.viewed._viewPosition.scale) /
            100) *
          game.scenes.viewed.flags.falemos.config[user.id].width;
        cssWidth = `max-width: ${maxWidth}px !important;`;

        let maxTop =
          ((game.scenes.viewed.height *
            game.scenes.viewed._viewPosition.scale) /
            100) *
          game.scenes.viewed.flags.falemos.config[user.id].y;
        currentTop = Math.min(
          maxTop,
          (game.scenes.viewed.flags.falemos.config[user.id].y *
            window.innerHeight) /
            100
        );

        let maxLeft =
          ((game.scenes.viewed.width * game.scenes.viewed._viewPosition.scale) /
            100) *
          game.scenes.viewed.flags.falemos.config[user.id].x;
        currentLeft = Math.min(
          maxLeft,
          (game.scenes.viewed.flags.falemos.config[user.id].x *
            window.innerWidth) /
            100
        );
      } else if (imageFormat == "cover" || imageFormat == "covercenter") {
        let minWidth =
          ((game.scenes.viewed.width * game.scenes.viewed._viewPosition.scale) /
            100) *
          game.scenes.viewed.flags.falemos.config[user.id].width;
        cssWidth = `min-width: ${minWidth}px !important;`;

        let minTop =
          ((game.scenes.viewed.height *
            game.scenes.viewed._viewPosition.scale) /
            100) *
          game.scenes.viewed.flags.falemos.config[user.id].y;
        currentTop = Math.max(
          minTop,
          (game.scenes.viewed.flags.falemos.config[user.id].y *
            window.innerHeight) /
            100
        );

        let minLeft =
          ((game.scenes.viewed.width * game.scenes.viewed._viewPosition.scale) /
            100) *
          game.scenes.viewed.flags.falemos.config[user.id].x;
        currentLeft = Math.max(
          minLeft,
          (game.scenes.viewed.flags.falemos.config[user.id].x *
            window.innerWidth) /
            100
        );
      }

      css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] {
                            width: ${
                              game.scenes.viewed.flags.falemos.config[user.id]
                                .width
                            }vw !important; 
                            ${cssWidth}
                            height: auto !important; 
                            top: ${currentTop}px !important;
                            left: ${currentLeft}px !important; }`;

      css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-camera-overlay { 
                            display: inherit; 
                            background-image: url('${overlayImg}'); 
                            width: calc(100% + ${overlayHSize}%); 
                            height: calc(100% + ${overlayVSize}%); 
                            top: -${overlayTop}%; 
                            left: -${overlayLeft}%;}\r\n `; //show camera overlay

      //css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-chat-overlay { display: inherit; width: 300px; top: calc(100% + 10px); left: 0px; }\r\n `;//positioning chat overlay

      css += `@font-face {
                            font-family: ${scene.data._id}${user.id}; 
                            src: ${
                              game.scenes.viewed.flags.falemos.config[user.id]
                                .cameraNameFont
                            };}\r\n`;

      css += `.camera-view .shadow { visibility: hidden; }\r\n`; // quita el sombreado de la camara

      css += `#camera-views-user-${user.id}[data-scene="${
        scene.data._id
      }"] .falemos-name-overlay { 
                            display: inherit; 
                            top: ${
                              game.scenes.viewed.flags.falemos.config[user.id]
                                .cameraNameOffsetY
                            }%; 
                            left:${
                              game.scenes.viewed.flags.falemos.config[user.id]
                                .cameraNameOffsetX
                            }%; 
                            font-family: ${scene.data._id}${user.id}; 
                            font-size: ${
                              game.scenes.viewed.flags.falemos.config[user.id]
                                .cameraNameFontSize
                            }vw; 
                            color: ${
                              game.scenes.viewed.flags.falemos.config[user.id]
                                .cameraNameColor
                            }}\r\n `; //show name overlay
    }
  });

  jQuery(`<style id='falemosStyles'>`).text(css).appendTo(document.head);
}

function onSocketData(data) {
  let event = data.event;
  let sceneId = data.scene.data._id;
  let userId = data.user._id;
  switch (event) {
    case "toggleFitHotkey":
      game.scenes
        .get(sceneId)
        .setFlag("falemos", `config.${userId}.fit`, data.mode);
      break;
    default:
      console.error(event + " not is a Falemos event");
      break;
      const resultado = document.querySelector(".resultado");
      resultado.textContent = `Te gusta el sabor ${event.target.value}`;
  }
}

Handlebars.registerHelper("lookupProp", function (obj, key, prop) {
  if (!obj) return null;
  return obj[key] && obj[key][prop];
});

Handlebars.registerHelper("concat3", function (a, b, c) {
  return a + b + c;
});

Handlebars.registerHelper("log", function (data) {
  console.log(data);
});
