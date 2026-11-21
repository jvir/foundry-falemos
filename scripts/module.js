/**
 * Falemos (let's talk) - Foundry VTT v14
 *
 * Modo "habilitar": cuando la escena tiene Falemos activado se oculta el dock de
 * cámaras (sacando todas las cámaras a ventanas libres de v14, `CameraPopout`) y
 * Falemos toma el control de su posición, tamaño, marco, nombre, forma y filtro.
 */

const MODULE_ID = "falemos";
const MACRO_PATH = `modules/${MODULE_ID}/scripts/utils/falemosVaccinator.js`;
const TEMPLATE_SCENE = `modules/${MODULE_ID}/templates/scene/mc-config.html`;
const TEMPLATE_FILTERS = `modules/${MODULE_ID}/templates/filter/filter.html`;
const FIT_CYCLE = ["cover", "covercenter", "contain", "containcenter", "nofit"];

const renderTemplate = (path, data) =>
  foundry.applications.handlebars.renderTemplate(path, data);

/* -------------------------------------------------------------------------- */
/*  Helpers de estado                                                          */
/* -------------------------------------------------------------------------- */

/** Configuración Falemos de una escena (por defecto la que se está viendo). */
const cfgOf = (scene = game.scenes.viewed) =>
  scene?.getFlag(MODULE_ID, "config") ?? null;

const isEnabled = (scene = game.scenes.viewed) => !!cfgOf(scene)?.enable;

const myFit = (cfg = cfgOf()) => cfg?.[game.userId]?.fit ?? "nofit";

const num = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);

/** Dock de cámaras (CameraViews). */
function getCameraViews() {
  const CameraViews = foundry.applications.apps.av.CameraViews;
  if (ui.webrtc instanceof CameraViews) return ui.webrtc;
  return (
    [...foundry.applications.instances.values()].find(
      (app) => app instanceof CameraViews
    ) ?? null
  );
}

let active = false; // ¿Falemos está controlando las cámaras ahora mismo?

/* -------------------------------------------------------------------------- */
/*  Init                                                                       */
/* -------------------------------------------------------------------------- */

Hooks.once("init", () => {
  CONFIG.FALEMOS = {
    /** Efectos de cámara disponibles */
    cameraEffects: {
      NONE: { name: "FALEMOS.camera.effects.none", data: "none" },
      BW: { name: "FALEMOS.camera.effects.bw", data: "grayscale(1)" },
      Sepia: { name: "FALEMOS.camera.effects.sepia", data: "sepia(1)" },
      Noise: { name: "FALEMOS.camera.effects.noise", data: "url('#noise')" },
      Warp: { name: "FALEMOS.camera.effects.warp", data: "url('#warp')" },
      Blue: { name: "FALEMOS.camera.effects.blue", data: "url('#bluefill')" },
      Red: { name: "FALEMOS.camera.effects.red", data: "url('#redfill')" },
      Green: { name: "FALEMOS.camera.effects.green", data: "url('#greenfill')" },
      Edges: { name: "FALEMOS.camera.effects.edges", data: "url('#edges')" },
    },
    cameraGeometry: {
      rectangle: { name: "FALEMOS.camera.geometry.rectangle", data: "clip-path: none;" },
      circle: { name: "FALEMOS.camera.geometry.circle", data: "clip-path: circle(41% at 50% 50%);" },
      triangle: { name: "FALEMOS.camera.geometry.triangle", data: "clip-path: polygon(50% 0%, 0% 100%, 100% 100%);" },
      rhombus: { name: "FALEMOS.camera.geometry.rhombus", data: "clip-path: polygon(50% 0%, 83.4% 50%, 50% 100%, 16.6% 50%);" },
      hexagon: { name: "FALEMOS.camera.geometry.hexagon", data: "clip-path: polygon(25% 0%, 75% 0%, 95% 50%, 75% 100%, 25% 100%, 5% 50%);" },
      star: { name: "FALEMOS.camera.geometry.star", data: "clip-path: polygon(50% 0, 61% 25%, 90% 25%, 74% 50%, 90% 75%, 61% 75%, 50% 100%, 38% 75%, 10% 75%, 26% 50%, 10% 25%, 38% 25%);" },
      shield: { name: "FALEMOS.camera.geometry.shield", data: "clip-path: inset(0% 15% 0% 15% round 0% 0% 50% 50%);" },
      square: { name: "FALEMOS.camera.geometry.square", data: "clip-path: polygon(12.5% 0%, 12.5% 100%, 87.5% 100%, 87.5% 0%);" },
      trapezoid: { name: "FALEMOS.camera.geometry.trapezoid", data: "clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);" },
      bevel: { name: "FALEMOS.camera.geometry.bevel", data: "clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);" },
      rabbet: { name: "FALEMOS.camera.geometry.rabbet", data: "clip-path: polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%);" },
    },
    sceneFit: {
      nofit: { name: "FALEMOS.scene.fit.nofit", data: "nofit" },
      cover: { name: "FALEMOS.scene.fit.cover", data: "cover" },
      covercenter: { name: "FALEMOS.scene.fit.covercenter", data: "covercenter" },
      contain: { name: "FALEMOS.scene.fit.contain", data: "contain" },
      containcenter: { name: "FALEMOS.scene.fit.containcenter", data: "containcenter" },
    },
  };

  game.settings.register(MODULE_ID, "enableAlwaysMicrophone", {
    config: true,
    scope: "client",
    name: `${game.i18n.localize("WEBRTC.VoiceMode")} '${game.i18n.localize("WEBRTC.VoiceModeAlways")}'`,
    hint: game.i18n.localize("FALEMOS.VoiceModeAlwaysHint"),
    type: Boolean,
    default: true,
  });

  // Cámaras que ha sacado Falemos (para devolver al dock solo esas al desactivarse)
  game.settings.register(MODULE_ID, "poppedByFalemos", {
    config: false,
    scope: "client",
    type: Object,
    default: { ids: [] },
  });

  registerKeybindings();

  Handlebars.registerHelper("lookupProp", (obj, key, prop) => {
    if (!obj) return null;
    return obj[key] && obj[key][prop];
  });
  Handlebars.registerHelper("concat3", (a, b, c) => a + b + c);
  Handlebars.registerHelper("log", (data) => console.log(data));
});

/* -------------------------------------------------------------------------- */
/*  Atajos de teclado (API oficial de keybindings)                             */
/* -------------------------------------------------------------------------- */

function registerKeybindings() {
  const M = foundry.helpers?.interaction?.KeyboardManager?.MODIFIER_KEYS ?? {
    CONTROL: "Control",
    ALT: "Alt",
  };
  const combo = (key) => [{ key, modifiers: [M.CONTROL, M.ALT] }];

  // Ctrl+Alt+F: ciclo de ajuste de escena (por usuario)
  game.keybindings.register(MODULE_ID, "toggleFit", {
    name: "FALEMOS.keybindings.toggleFit",
    editable: combo("KeyF"),
    onDown: () => {
      if (!game.scenes.viewed) return false;
      const i = FIT_CYCLE.indexOf(cfgOf()?.[game.userId]?.fit);
      setMyFit(FIT_CYCLE[(i + 1) % FIT_CYCLE.length]);
      return true;
    },
  });

  // Ctrl+Alt+H: ciclo de visibilidad de la interfaz (solo GM): todo → escena → nada
  game.keybindings.register(MODULE_ID, "toggleUi", {
    name: "FALEMOS.keybindings.toggleUi",
    editable: combo("KeyH"),
    restricted: true,
    onDown: () => {
      const scene = game.scenes.viewed;
      if (!scene) return false;
      const next = { all: "scene", scene: "none", none: "all" };
      const mode = cfgOf(scene)?.hide?.mode ?? "scene";
      scene.setFlag(MODULE_ID, "config.hide.mode", next[mode] ?? "scene");
      return true;
    },
  });

  // Ctrl+Alt+V: Falemos Vaccinator
  game.keybindings.register(MODULE_ID, "runVaccinator", {
    name: "FALEMOS.keybindings.runVaccinator",
    editable: combo("KeyV"),
    restricted: true,
    onDown: () => {
      const macro = game.macros.find((m) => m.name.startsWith("Falemos Vaccinator"));
      macro?.execute();
      return true;
    },
  });

  // Ctrl+Alt+D: activar/desactivar Falemos en la escena
  game.keybindings.register(MODULE_ID, "toggleEnable", {
    name: "FALEMOS.keybindings.toggleEnable",
    editable: combo("KeyD"),
    restricted: true,
    onDown: () => {
      const scene = game.scenes.viewed;
      if (!scene) return false;
      scene.setFlag(MODULE_ID, "config.enable", !isEnabled(scene));
      return true;
    },
  });
}

/** Cambia el ajuste de escena del usuario actual (los jugadores lo piden por socket al GM). */
function setMyFit(mode) {
  const scene = game.scenes.viewed;
  if (!scene) return;
  if (game.user.isGM) {
    scene.setFlag(MODULE_ID, `config.${game.userId}.fit`, mode);
  } else {
    game.socket.emit(`module.${MODULE_ID}`, {
      event: "toggleFitHotkey",
      sceneId: scene.id,
      userId: game.userId,
      mode,
    });
  }
}

function onSocketData(data, senderId) {
  if (data?.event !== "toggleFitHotkey") {
    console.error(`Falemos | ${data?.event} no es un evento de Falemos`);
    return;
  }
  // Solo procesa el GM activo (los jugadores no pueden modificar escenas)
  if (game.users.activeGM?.id !== game.user.id) return;
  if (!(data.mode in CONFIG.FALEMOS.sceneFit)) return;
  const userId = senderId ?? data.userId;
  game.scenes.get(data.sceneId)?.setFlag(MODULE_ID, `config.${userId}.fit`, data.mode);
}

/* -------------------------------------------------------------------------- */
/*  Ready                                                                      */
/* -------------------------------------------------------------------------- */

Hooks.once("ready", async () => {
  await forceAlwaysMicrophone();

  game.socket.on(`module.${MODULE_ID}`, onSocketData);

  if (game.user.isGM) updateMacro().catch((e) => console.error("Falemos | macro", e));

  game.falemos = {
    getSceneConfig,
    putSceneConfig,
    sceneConfigToMacro,
    camToTile,
  };

  // Filtros SVG (ruido, deformación, colores, bordes)
  const svg = await renderTemplate(TEMPLATE_FILTERS, {});
  document.body.insertAdjacentHTML("beforeend", svg);

  window.addEventListener("resize", () => {
    if (active) scheduleRefresh({ force: true });
  });

  scheduleRefresh({ force: true });
});

async function forceAlwaysMicrophone() {
  if (!game.settings.get(MODULE_ID, "enableAlwaysMicrophone")) return;
  try {
    const rtc = foundry.utils.deepClone(game.settings.get("core", "rtcClientSettings"));
    if (rtc?.voice && rtc.voice.mode !== "always") {
      rtc.voice.mode = "always";
      await game.settings.set("core", "rtcClientSettings", rtc);
    }
  } catch (err) {
    console.warn("Falemos | No se pudo forzar el modo de voz 'siempre'", err);
  }
}

/** Instala o actualiza la macro Falemos Vaccinator (solo GM). */
async function updateMacro() {
  const res = await fetch(foundry.utils.getRoute(MACRO_PATH));
  if (!res.ok) return;
  const content = await res.text();
  const grab = (key) => content.match(new RegExp(`const\\s+${key}\\s*=\\s*"([^"]*)"`))?.[1];
  const macroName = grab("macroName");
  const macroImage = grab("macroImage");
  const macroVersion = parseFloat(grab("macroVersion"));
  if (!macroName || Number.isNaN(macroVersion)) {
    console.warn("Falemos | No se pudo leer name/version de la macro");
    return;
  }

  const installed = game.macros.getName(macroName);
  const installedVersion = parseFloat(
    installed?.getFlag(MODULE_ID, "version") ?? installed?.flags?.version ?? 0
  );
  const data = {
    name: macroName,
    type: "script",
    img: macroImage,
    command: content,
    flags: { [MODULE_ID]: { version: macroVersion } },
  };
  if (!installed) {
    console.log(`Falemos | Creamos macro ${macroName} v${macroVersion}`);
    await Macro.create(data);
  } else if (!(installedVersion >= macroVersion)) {
    console.log(`Falemos | Actualizamos macro ${macroName} ${installedVersion} -> ${macroVersion}`);
    await installed.update(data);
  }
}

/* -------------------------------------------------------------------------- */
/*  API expuesta (game.falemos) - misma firma que en v12                       */
/* -------------------------------------------------------------------------- */

function getSceneConfig(sceneId) {
  const data = { ...(game.scenes.get(sceneId)?.getFlag(MODULE_ID, "config") ?? {}) };
  const newData = {};
  Array.from(game.users).forEach((user, i) => {
    newData[i] = data[user.id];
  });
  newData.enable = data.enable;
  newData.hide = data.hide;
  return newData;
}

async function putSceneConfig(sceneId, json) {
  if (!game.scenes.viewed) {
    ui.notifications.error("Ninguna escena activa");
    return;
  }
  sceneId ||= game.scenes.viewed.id;
  const data = JSON.parse(json);
  const newData = {};
  Array.from(game.users).forEach((user, i) => {
    newData[user.id] = data[i];
  });
  newData.enable = data.enable;
  newData.hide = data.hide;
  // El hook updateScene aplica o revierte el modo Falemos sin recargar la página
  return game.scenes.get(sceneId).setFlag(MODULE_ID, "config", newData);
}

async function sceneConfigToMacro(sceneId, data) {
  if (!game.scenes.viewed) {
    ui.notifications.error("Ninguna escena activa");
    return;
  }
  sceneId ||= game.scenes.viewed.id;
  data ||= getSceneConfig(sceneId);
  const dataJSON = JSON.stringify(data);

  const name = await foundry.applications.api.DialogV2.prompt({
    window: { title: `Falemos: ${game.i18n.localize("FALEMOS.DialogTitleSaveSceneConfig")}` },
    content: `<div class="form-group"><label>${game.i18n.localize("FALEMOS.DialogContentMacroName")}</label>
      <div class="form-fields"><input type="text" name="falemosMacroName" autofocus></div></div>`,
    ok: {
      label: game.i18n.localize("FALEMOS.CreateMacro"),
      icon: "fa-solid fa-file-export",
      callback: (event, button) => button.form.elements.falemosMacroName.value,
    },
    rejectClose: false,
  });
  if (!name) return;
  return Macro.create({
    name,
    type: "script",
    img: `modules/${MODULE_ID}/assets/img/falemos.svg`,
    command: `game.falemos.putSceneConfig(null, ${JSON.stringify(dataJSON)});`,
  });
}

/** Proyecta la cámara de un usuario como sprite sobre el canvas (toggle). */
function camToTile(userId) {
  if (game.falemos.sprite && !game.falemos.sprite.destroyed) {
    game.falemos.sprite.destroy();
    return;
  }
  const video = getCameraViews()?.getUserVideoElement(userId);
  if (!video) return;
  const sprite = new PIXI.Sprite(PIXI.Texture.from(video));
  canvas.primary.addChild(sprite);
  sprite.width = canvas.dimensions.width;
  sprite.height = canvas.dimensions.height;
  video.play?.();
  game.falemos.sprite = sprite;
}

/* -------------------------------------------------------------------------- */
/*  Ciclo de vida: activar / desactivar el modo Falemos                        */
/* -------------------------------------------------------------------------- */

let refreshTimer = null;
function scheduleRefresh({ force = false } = {}) {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => refresh({ force }), 50);
}

let refreshing = false;
let refreshAgain = null;

async function refresh({ force = false } = {}) {
  if (!game.ready) return;
  // Un refresco a la vez: si llega otro mientras trabajamos, se repite una sola vez al final
  if (refreshing) {
    refreshAgain = { force: force || !!refreshAgain?.force };
    return;
  }
  refreshing = true;
  try {
    await doRefresh({ force });
  } finally {
    refreshing = false;
    if (refreshAgain) {
      const next = refreshAgain;
      refreshAgain = null;
      scheduleRefresh(next);
    }
  }
}

async function doRefresh({ force = false } = {}) {
  const scene = game.scenes.viewed;
  const cfg = cfgOf(scene);

  if (scene && cfg?.enable) {
    if (!active) popTries.clear();
    active = true;
    await popOutAll();
    hideUi(cfg.hide ?? {});
    applyFonts(scene, cfg);
    layoutAll();
    canvasFit(myFit(cfg), force);
  } else {
    const wasActive = active;
    active = false;
    popTries.clear();
    await dockPopped();
    undecorateAll();
    removeFonts();
    if (wasActive) hideUi({}, "all");
  }
}

/**
 * Ids de usuarios con cámara en ventana libre. Se consultan tanto `cv.popouts` como las
 * instancias de CameraPopout abiertas, porque una ventana recién creada puede tardar
 * en aparecer en `cv.popouts`.
 */
function poppedUserIds(cv) {
  const ids = new Set(cv.popouts.map((p) => p.user?.id));
  const CameraPopout = foundry.applications.apps.av.CameraPopout;
  for (const app of foundry.applications.instances.values()) {
    if (app instanceof CameraPopout) ids.add(app.user?.id);
  }
  return ids;
}

// Protección anti-bucle: cuántas veces y cuándo pulsamos "sacar del dock" por usuario.
// Pulsar el botón de una cámara que ya es ventana la devolvería al dock (y repetiría el ciclo).
const POP_COOLDOWN_MS = 3000;
const POP_MAX_TRIES = 3;
const popTries = new Map(); // userId -> { n, t }

/** Saca del dock todas las cámaras que aún no son ventanas libres. */
async function popOutAll() {
  const cv = getCameraViews();
  if (!cv?.rendered || !cv.element) return;
  const popped = poppedUserIds(cv);
  const ids = new Set(game.settings.get(MODULE_ID, "poppedByFalemos")?.ids ?? []);
  const now = Date.now();
  let changed = false;

  for (const user of game.users) {
    if (popped.has(user.id)) {
      popTries.delete(user.id); // ya es ventana: se reinicia el contador
      continue;
    }
    const tries = popTries.get(user.id) ?? { n: 0, t: 0 };
    if (now - tries.t < POP_COOLDOWN_MS) continue; // acabamos de intentarlo
    if (tries.n >= POP_MAX_TRIES) continue; // no insistir: evita el parpadeo infinito

    // Solo se pulsa un botón que esté DENTRO del dock (nunca el de una ventana)
    const view = cv.getUserCameraView(user.id);
    if (!view || !cv.element.contains(view)) continue; // sin cámara o no está en el dock
    const button = view.querySelector('[data-action="toggleDocked"]');
    if (!button) continue;

    popTries.set(user.id, { n: tries.n + 1, t: now });
    if (tries.n + 1 >= POP_MAX_TRIES) {
      console.warn(`Falemos | No se pudo sacar del dock la cámara de ${user.name}; se deja de insistir`);
    }
    button.click();
    ids.add(user.id);
    changed = true;
  }
  if (changed) await game.settings.set(MODULE_ID, "poppedByFalemos", { ids: [...ids] });
}

/** Devuelve al dock únicamente las cámaras que sacó Falemos. */
async function dockPopped() {
  const ids = game.settings.get(MODULE_ID, "poppedByFalemos")?.ids ?? [];
  if (!ids.length) return;
  const cv = getCameraViews();
  if (!cv) return;
  for (const popout of [...cv.popouts]) {
    if (!ids.includes(popout.user?.id)) continue;
    const button = popout.element?.querySelector('[data-action="toggleDocked"]');
    if (button) button.click();
    else popout.close();
  }
  await game.settings.set(MODULE_ID, "poppedByFalemos", { ids: [] });
}

/* -------------------------------------------------------------------------- */
/*  Aspecto y posición de cada cámara                                          */
/* -------------------------------------------------------------------------- */

const geometryValue = (key) =>
  (CONFIG.FALEMOS.cameraGeometry[key] ?? CONFIG.FALEMOS.cameraGeometry.rectangle).data
    .replace(/^\s*clip-path:\s*/, "")
    .replace(/;\s*$/, "");

function ensureChild(host, cls, tag = "div") {
  let el = host.querySelector(`:scope > .${cls}`);
  if (!el) {
    el = document.createElement(tag);
    el.className = cls;
    host.append(el);
  }
  return el;
}

function decoratePopout(app) {
  const el = app?.element;
  const userId = app?.user?.id;
  if (!el || !userId) return;

  const scene = game.scenes.viewed;
  const cfg = cfgOf(scene);
  const uc = scene && cfg?.enable ? cfg[userId] : null;
  if (!uc) return undecoratePopout(app);

  el.dataset.falemos = "";
  el.dataset.falemosUser = userId;
  el.dataset.falemosScene = scene.id;

  const host = app.window?.content ?? el;
  host.classList.add("falemos-host");

  const video = el.querySelector("video");
  if (video) {
    video.style.objectFit = "cover";
    video.style.filter = CONFIG.FALEMOS.cameraEffects[uc.filter]?.data ?? "none";
    video.style.clipPath = geometryValue(uc.geometry);
  }

  // Marco
  const frame = ensureChild(host, "falemos-camera-overlay");
  const h = num(uc.overlayLeft) + num(uc.overlayRight);
  const v = num(uc.overlayTop) + num(uc.overlayBottom);
  frame.style.backgroundImage = uc.overlayImg ? `url(${JSON.stringify(uc.overlayImg)})` : "none";
  frame.style.width = `calc(100% + ${h}%)`;
  frame.style.height = `calc(100% + ${v}%)`;
  frame.style.top = `-${num(uc.overlayTop)}%`;
  frame.style.left = `-${num(uc.overlayLeft)}%`;

  // Nombre
  const name = ensureChild(host, "falemos-name-overlay");
  if (uc.cameraName || uc.cameraName === "") {
    name.innerHTML = foundry.utils.cleanHTML(String(uc.cameraName));
  }
  name.style.top = `${num(uc.cameraNameOffsetY)}%`;
  name.style.left = `${num(uc.cameraNameOffsetX)}%`;
  name.style.fontFamily = `"${scene.id}${userId}"`;
  name.style.fontSize = `${num(uc.cameraNameFontSize, 2)}vw`;
  if (uc.cameraNameColor) name.style.color = uc.cameraNameColor;

  // Chat (reservado, igual que en v12)
  ensureChild(host, "falemos-chat-overlay");

  // Botón "cámara como tile"
  if (!host.querySelector(":scope > .falemos-tile-btn")) {
    const btn = document.createElement("a");
    btn.className = "falemos-tile-btn";
    btn.innerHTML = '<i class="fas fa-map"></i>';
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      camToTile(userId);
    });
    host.append(btn);
  }

  layoutPopout(app, scene, cfg, uc);
}

function undecoratePopout(app) {
  const el = app?.element;
  if (!el || !("falemos" in el.dataset)) return;
  delete el.dataset.falemos;
  delete el.dataset.falemosUser;
  delete el.dataset.falemosScene;
  el.querySelectorAll(
    ".falemos-camera-overlay, .falemos-name-overlay, .falemos-chat-overlay, .falemos-tile-btn"
  ).forEach((n) => n.remove());
  const video = el.querySelector("video");
  if (video) video.style.cssText = "";
}

/** Calcula y aplica posición y ancho (relativos a la ventana y al ajuste de escena). */
function layoutPopout(app, scene, cfg, uc) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = num(uc.width);
  if (!width) return;

  let w = (width * vw) / 100;
  let left = (num(uc.x) * vw) / 100;
  let top = (num(uc.y) * vh) / 100;

  const mode = myFit(cfg);
  const scale = canvas.stage?.scale?.x ?? 1;
  const sceneW = (scene.dimensions?.sceneWidth ?? scene.width ?? vw) * scale;
  const sceneH = (scene.dimensions?.sceneHeight ?? scene.height ?? vh) * scale;
  const relW = (sceneW / 100) * width;
  const relLeft = (sceneW / 100) * num(uc.x);
  const relTop = (sceneH / 100) * num(uc.y);

  if (mode === "contain" || mode === "containcenter") {
    w = Math.min(w, relW);
    left = Math.min(left, relLeft);
    top = Math.min(top, relTop);
  } else if (mode === "cover" || mode === "covercenter") {
    w = Math.max(w, relW);
    left = Math.max(left, relLeft);
    top = Math.max(top, relTop);
  }

  app.element.style.setProperty("--av-width", "100px");
  app.setPosition({
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(w),
    height: "auto",
  });
}

let layoutFrame = null;
function layoutAll() {
  cancelAnimationFrame(layoutFrame);
  layoutFrame = requestAnimationFrame(() => {
    const cv = getCameraViews();
    cv?.popouts.forEach((app) => decoratePopout(app));
  });
}

function undecorateAll() {
  getCameraViews()?.popouts.forEach((app) => undecoratePopout(app));
}

function applyFonts(scene, cfg) {
  let css = "";
  for (const user of game.users) {
    const font = cfg[user.id]?.cameraNameFont;
    if (!font) continue;
    const safe = String(font).replace(/[{}<>]/g, "");
    css += `@font-face { font-family: "${scene.id}${user.id}"; src: ${safe}; }\n`;
  }
  let style = document.getElementById("falemos-fonts");
  if (!css) return style?.remove();
  if (!style) {
    style = document.createElement("style");
    style.id = "falemos-fonts";
    document.head.append(style);
  }
  style.textContent = css;
}
const removeFonts = () => document.getElementById("falemos-fonts")?.remove();

/* -------------------------------------------------------------------------- */
/*  Interfaz de Foundry (ocultar / mostrar)                                    */
/* -------------------------------------------------------------------------- */

const UI_PARTS = {
  navigation: { app: "nav", ids: ["scene-navigation", "navigation"] },
  controls: { app: "controls", ids: ["scene-controls", "controls"] },
  players: { app: "players", ids: ["players"] },
  sidebar: { app: "sidebar", ids: ["sidebar"] },
  hotbar: { app: "hotbar", ids: ["hotbar"] },
};

function uiElement(key) {
  const part = UI_PARTS[key];
  return (
    ui[part.app]?.element ??
    part.ids.map((id) => document.getElementById(id)).find(Boolean) ??
    null
  );
}

/** mode: "all" muestra todo, "none" oculta todo, otro valor usa las marcas por elemento. */
function hideUi(data = {}, mode = null) {
  const m = mode ?? data.mode;
  for (const key of Object.keys(UI_PARTS)) {
    const el = uiElement(key);
    if (!el) continue;
    const hide = m === "all" ? false : m === "none" ? true : !!data[key];
    el.style.display = hide ? "none" : "";
  }
}

/* -------------------------------------------------------------------------- */
/*  Ajuste de la escena al tamaño de la ventana                                */
/* -------------------------------------------------------------------------- */

function canvasFit(mode = "nofit", force = false) {
  const scene = game.scenes.viewed;
  if (!canvas?.stage || !scene?.dimensions) return;
  try {
    const iw = window.innerWidth;
    const ih = window.innerHeight;
    const { sceneWidth, sceneHeight } = scene.dimensions;
    const gridSize = scene.grid.size;
    const init = scene.initial ?? {};
    const initScale = init.scale || 1;

    const padWidth = Math.ceil((sceneWidth * scene.padding) / gridSize) * gridSize;
    const padHeight = Math.ceil((sceneHeight * scene.padding) / gridSize) * gridSize;
    const scaleW = iw / sceneWidth;
    const scaleH = ih / sceneHeight;
    const lo = Math.min(scaleW, scaleH);
    const hi = Math.max(scaleW, scaleH);

    let zoom, px, py;
    switch (mode) {
      case "nofit":
        zoom = initScale;
        px = (padWidth - (init.x ?? 0)) * initScale + iw / 2;
        py = (padHeight - (init.y ?? 0)) * initScale + ih / 2;
        break;
      case "contain":
        [zoom, px, py] = [lo, 0, 0];
        break;
      case "containcenter":
        [zoom, px, py] = [lo, (iw - sceneWidth * lo) / 2, (ih - sceneHeight * lo) / 2];
        break;
      case "cover":
        [zoom, px, py] = [hi, 0, 0];
        break;
      case "covercenter":
        [zoom, px, py] = [hi, (iw - sceneWidth * hi) / 2, (ih - sceneHeight * hi) / 2];
        break;
      default:
        return;
    }

    const viewNew = {
      scale: zoom,
      x: (iw / 2 - px) / zoom + padWidth,
      y: (ih / 2 - py) / zoom + padHeight,
    };
    const old = { scale: canvas.stage.scale.x, x: canvas.stage.pivot.x, y: canvas.stage.pivot.y };
    const changed =
      Math.abs(old.scale - viewNew.scale) > 0.01 ||
      Math.abs(old.x - viewNew.x) > 1 ||
      Math.abs(old.y - viewNew.y) > 1;

    if (changed || force) {
      if (mode !== "nofit") canvas.pan(viewNew);
      layoutAll();
    }
  } catch (err) {
    console.warn("Falemos | canvasFit falló", err);
  }
}

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                      */
/* -------------------------------------------------------------------------- */

// El dock se ha (re)renderizado: puede haber cámaras nuevas que sacar a ventana
Hooks.on("renderCameraViews", () => {
  if (isEnabled() || active) scheduleRefresh();
});

// Cada cámara en ventana libre: aplicar el estilo Falemos
Hooks.on("renderCameraPopout", (app) => decoratePopout(app));

// Cambios en la configuración Falemos de la escena que se está viendo
Hooks.on("updateScene", (scene, changes) => {
  if (scene.id !== game.scenes.viewed?.id) return;
  if (foundry.utils.hasProperty(changes, `flags.${MODULE_ID}`)) scheduleRefresh({ force: true });
});

Hooks.on("canvasReady", () => scheduleRefresh({ force: true }));

Hooks.on("canvasPan", () => {
  if (!active) return;
  const mode = myFit();
  if (mode !== "nofit") canvasFit(mode);
});

/* -------------------------------------------------------------------------- */
/*  Pestaña Falemos en la configuración de escena (SceneConfig, ApplicationV2) */
/* -------------------------------------------------------------------------- */

Hooks.on("renderSceneConfig", async (app, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  const scene = app.document;
  if (!root || !scene || root.querySelector('.tab[data-tab="falemos"]')) return;

  const content = await renderTemplate(TEMPLATE_SCENE, {
    falemosconfig: scene.getFlag(MODULE_ID, "config") ?? null,
    users: Array.from(game.users),
    sceneid: scene.id,
    falemos: CONFIG.FALEMOS,
  });
  if (root.querySelector('.tab[data-tab="falemos"]')) return; // render concurrente

  const nav = root.querySelector("nav.tabs, nav.sheet-tabs");
  const group = nav?.querySelector("[data-group]")?.dataset.group ?? "sheet";

  const link = document.createElement("a");
  link.dataset.action = "tab";
  link.dataset.group = group;
  link.dataset.tab = "falemos";
  link.innerHTML = '<i class="fas fa-camera"></i> <span>Falemos</span>';
  nav?.append(link);

  const tpl = document.createElement("template");
  tpl.innerHTML = content.trim();
  const tab = tpl.content.firstElementChild;
  tab.dataset.group = group;
  const footer = root.querySelector("footer.form-footer, .sheet-footer");
  if (footer) footer.before(tab);
  else (root.querySelector("form") ?? root).append(tab);

  // Captura la posición actual de la cámara (ventana libre) en los campos x/y
  tab.querySelectorAll(".capture-current").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      const userId = ev.currentTarget.dataset.user;
      const popout = getCameraViews()?.popouts.find((p) => p.user?.id === userId);
      const rect = (popout?.element?.querySelector("video") ?? popout?.element)?.getBoundingClientRect();
      if (!rect) return ui.notifications.warn(game.i18n.localize("FALEMOS.NoPopoutToCapture"));
      const round = (n) => Math.round(n * 100) / 100;
      const set = (prop, value) => {
        const input = tab.querySelector(`[name="flags.falemos.config.${userId}.${prop}"]`);
        if (input) input.value = round(value);
      };
      set("x", rect.left / (window.innerWidth / 100));
      set("y", rect.top / (window.innerHeight / 100));
    });
  });

  if (app.tabGroups?.[group] === "falemos") app.changeTab("falemos", group, { force: true });
});
