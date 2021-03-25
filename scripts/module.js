//import HudContextMenu from './hudContextMenu';





Hooks.once('init', async function() {
    const MCCONFIG = {
        /**
        * Available Camera Effects implementations
        * @type {Object}
        */
        cameraEffects: {
            NONE: {name: "FALEMOS.camera.effects.none", data: "none"},
            BW: {name: "FALEMOS.camera.effects.bw", data: "grayscale(1)"},
            Sepia: {name: "FALEMOS.camera.effects.sepia", data: "sepia(1)"},
            Noise: {name: "FALEMOS.camera.effects.noise", data: "url('#noise')"},
            Warp: {name: "FALEMOS.camera.effects.warp", data: "url('#warp')"}
        },
        cameraGeometry: {
            rectangle: {name: "FALEMOS.camera.geometry.rectangle", data: "clip-path: none;"},
            circle: {name: "FALEMOS.camera.geometry.circle", data: "clip-path: circle(41% at 41% 50%);"},
            triangle: {name: "FALEMOS.camera.geometry.triangle", data: "clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"},
            shield: {name: "FALEMOS.camera.geometry.shield", data: "clip-path: inset(0% 15% 0% 15% round 0% 0% 50% 50%);"}
        },
        sceneFit: {
            nofit: {name: "FALEMOS.scene.fit.nofit", data: "nofit"},
            cover: {name: "FALEMOS.scene.fit.cover", data: "cover"},
            contain: {name: "FALEMOS.scene.fit.contain", data: "contain"}
        }
    }
    CONFIG.FALEMOS = MCCONFIG;
});

Hooks.once('ready', async function() {
    //CONFIG.debug.hooks=true
    versionChangesPopup();
        
    //sockets
    game.socket.on('module.falemos', async (data) => {
       onSocketData(data); 
    });
    
    
    //svg filters
    let svghtml = await renderTemplate("modules/falemos/templates/filter/filter.html", {});
    document.body.insertAdjacentHTML('beforeend', svghtml);
    //jQuery(svghtml).appendTo(document.body);
    
    //shorcuts
    document.onkeydown = function(e) {//TODO use sockets for all players
        if (e.ctrlKey && e.altKey && e.which == 70) { //TODO toggle UI fit options in current scene (F)
            let tempFit = game.scenes.viewed.data.flags?.falemos?.config[game.userId]?.fit
            switch (tempFit) {
                case 'cover':
                    game.socket.emit('module.falemos', {event: "toggleFitHotkey", action:'command', data: {user: game.user, scene: game.scenes.viewed, mode: "contain"}});
                    //game.scenes.viewed.setFlag('falemos', `config.${game.userId}.fit`, 'contain').then(()=>canvasFit('contain', true));
                    break;
                case 'contain':
                    game.socket.emit('module.falemos', {event: "toggleFitHotkey", action:'command', data: {user: game.user, scene: game.scenes.viewed, mode: "nofit"}});
                    //game.scenes.viewed.setFlag('falemos', `config.${game.userId}.fit`, 'nofit').then(()=>canvasFit('nofit', true));
                    break;
                default:
                    game.socket.emit('module.falemos', {event: "toggleFitHotkey", action:'command', data: {user: game.user, scene: game.scenes.viewed, mode: "cover"}});                    
                    //game.scenes.viewed.setFlag('falemos', `config.${game.userId}.fit`, 'cover').then(()=>canvasFit('cover', true));
                    break;
            }
            
        };
        if (e.ctrlKey && e.altKey && e.which == 72) { //TODO toggle UI visibility in current scene (H) ONLY GM
            if (!game.user.isGm) return;
            let tempUI = game.scenes.viewed.data.flags?.falemos?.config?.hide?.mode
            switch (tempUI) {
                case 'all':
                    game.scenes.viewed.setFlag('falemos', 'config.hide.mode', 'scene');
                    break;
                case 'none':
                    game.scenes.viewed.setFlag('falemos', 'config.hide.mode', 'all');
                    break;
                default:
                    let currentVisibility =Object.assign({}, game.scenes.viewed.data.flags.falemos.config.hide); 
                    if (Object.values(currentVisibility).reduce((a, value) => a + value, 0) == Object.keys(currentVisibility).length){//all visible
                        Object.keys(currentVisibility).forEach(key=>currentVisibility[key] = false)
                        //hideUi(currentVisibility);
                        game.scenes.viewed.setFlag('falemos', 'config.hide.mode', 'none');
                    }else if(Object.values(currentVisibility).reduce((a, value) => a + value, 0) == 0){//all hide
                        Object.keys(currentVisibility).forEach(key=>currentVisibility[key] = true)
                        //hideUi(currentVisibility);
                        game.scenes.viewed.setFlag('falemos', 'config.hide.mode', 'all');
                    }else{
                        game.scenes.viewed.setFlag('falemos', 'config.hide.mode', 'none');
                    }
                    
            }
            
            
            
            //scene.update({id: game.scenes.viewed.data._id, 'flags.falemos.config.hide': currentVisibility});
//             .then(function(){
//                 game.socket.emit('module.falemos', {event: "toggleUiHotkey", action:'command', data: {command: 'game.scenes.viewed.view()'}});
//                 onSocketData({event: "toggleUiHotkey", action:'command', data: {command: 'game.scenes.viewed.view()'}});
//             });
            
        };
    };
    
    
});


Hooks.on('renderCameraViews', async function(cameraviews, html) {
    if (game.scenes.viewed.data.flags.falemos?.config?.enable){

        html.find('.camera-view').each((index, camera)=>{
            camera.dataset.scene = game.scenes.viewed.data._id;
            camera.parentNode.dataset.scene = game.scenes.viewed.data._id;
        })
        html.find('.user-avatar').each((index, avatar)=>{
            avatar.insertAdjacentHTML('afterend', `<div class="falemos-camera-overlay"></div>`)
            avatar.insertAdjacentHTML('afterend', `<div class="falemos-name-overlay"></div>`)            
            avatar.insertAdjacentHTML('afterend', `<div class="falemos-chat-overlay"></div>`)            
        })
        
        html.find('.control-bar.bottom').each((index, avcontrol) => {
            avcontrol.insertAdjacentHTML('beforeend', '<a class="av-control toggle" title="" data-action="toggle-isolate"><i class="fas fa-users"></i></a>')
        });
        html.find('.av-control[data-action="toggle-isolate"]').click((ev)=>{
            
            game.users.get(ev.currentTarget.closest('.camera-view').dataset.user).setFlag('falemos', 'isolated', !game.users.get(ev.currentTarget.closest('.camera-view').dataset.user).data.flags.falemos?.isolated);            
            Hooks.call('updateFalemosIsolated', game.users);
            
        });
        
        camerasToPopout(html);
        camerasStyling(html);
        canvasFit();
    }
            
});

/*
Hooks.on('updateFalemosIsolated'. async function(data) {
    console.log(data);
    game.users.entities.each((user)=>{
        console.log(user);//TODO: sear if isolated user and apply
    });
});*/




Hooks.on('renderSceneConfig', async function(sceneConfig, html, data) {
                
        let falemosconfig = game.scenes.get(data.entity._id).getFlag('falemos', 'config') ? game.scenes.get(data.entity._id).getFlag('falemos', 'config') : null;
        let users = game.users.entries;
                
        //renderTemplate con campos y data saliendo de los flags        
        let mchtml = await renderTemplate("modules/falemos/templates/scene/mc-config.html", {falemosconfig: falemosconfig, users:users, falemos: CONFIG.FALEMOS})
        
        
        //insert mc html template
        html.find('button[name="submit"]').before(mchtml);
        
        // enable listeners
        html.find('.capture-current').each(function(index) {
            $(this).on("click", function(ev){
                let offset = jQuery(`.camera-view[data-user="${ev.currentTarget.dataset.user}"] video`).first().offset()
                jQuery(`[name='flags.falemos.config.${ev.currentTarget.dataset.user}.x']`).first().val(offset.left);
                jQuery(`[name='flags.falemos.config.${ev.currentTarget.dataset.user}.y']`).first().val(offset.top);
            });
        });
        
        
        sceneConfig.activateListeners(html)
        //html.find('button.file-picker').each((i, button) => this._activateFilePicker(button));


})


Hooks.on('closeSceneConfig', async function(sceneConfig, html, data) {
    
    if (game.scenes.viewed.data.flags.falemos?.config?.enable){
        let camerashtml = jQuery("#camera-views");
        camerashtml.find('.camera-view').each((index, camera)=>{
            camera.dataset.scene = game.scenes.viewed.data._id;
            camera.parentNode.dataset.scene = game.scenes.viewed.data._id;
        })
        camerasToPopout(camerashtml);
        camerasStyling(camerashtml);
    
        switch (game.scenes.viewed.data.flags.falemos.config[game.userId].fit){
            case 'cover':
                canvasFit('cover');
                break;
            case 'contain':
                canvasFit('contain');
                break;
        }
        
    }
});


Hooks.on('renderSceneNavigation', async function(scene, html) { //TODO get form values and save in flag
        if (game.scenes.viewed.data.flags.falemos?.config?.enable){
            let camerashtml = jQuery("#camera-views");
            camerashtml.find('.camera-view').each((index, camera)=>{
                camera.dataset.scene = game.scenes.viewed.data._id;
                camera.parentNode.dataset.scene = game.scenes.viewed.data._id;
            })
            camerasToPopout(camerashtml);
            camerasStyling(camerashtml);
            hideUi(game.scenes.viewed.data.flags.falemos.config.hide);
            canvasFit(game.scenes.viewed.data.flags.falemos.config[game.userId].fit, true);
        }else{
            let camerashtml = jQuery("#camera-views");
            camerashtml.find('.camera-view').each((index, camera)=>{
                camera.removeAttribute('data-scene');
                camera.parentNode.removeAttribute('data-scene');
            })
            cameraToDOck(camerashtml);
            hideUi({}, 'all');
        }
});


//TODO: chat under camera test implementation (best with screenshot?)
// Hooks.on('renderChatMessage', async function(chatMessage, html) {
//     let _html = await html[0].outerHTML
//     let userChatOverlay = document.querySelector(`#camera-views-user-${chatMessage.data.user}[data-scene="${game.scenes.viewed.data._id}"] .falemos-chat-overlay`);
//     userChatOverlay.innerHTML =_html;
//     console.log(userChatOverlay);
//     jQuery(userChatOverlay).fadeIn('fast');
//     
//     setTimeout(function() {
//         jQuery(userChatOverlay).fadeOut('slow');
//     }, 5000);
//     
// });



Hooks.on('rtcSettingsChanged', async function(cameraviews, html) {//TODO: for isolate audio for groups

});

Hooks.on('canvasInit', async function(){
    game.scenes.viewed.setFlag('falemos','config.hide.mode','scene');
});

Hooks.on('canvasPan', async function(canvas, view){
    
    if (!game.scenes.viewed.data.flags?.falemos?.config?.enable){return;}
    
    switch (game.scenes.viewed.data.flags.falemos.config[game.userId].fit){
        case 'cover':
            canvasFit('cover');
            break;
        case 'contain':
            canvasFit('contain');
            break;
    }
    
        
    
});

function canvasFit(mode='contain', force=false){ //TODO avoid view parameter for get scale x and y
    
    if(!canvas) return;
    
    
    let view = {
        scale: canvas.stage.scale._x,
        x: canvas.stage.pivot._x,
        y: canvas.stage.pivot._y
    }
    
    let scaleW = window.innerWidth / canvas.dimensions.sceneWidth;
    let scaleH = window.innerHeight / canvas.dimensions.sceneHeight;
    let scaleContain = Math.round(Math.min(scaleW, scaleH)*100)/100;
    let scaleCover = Math.round(Math.max(scaleW, scaleH)*100)/100;

    let scale = mode=='contain' ? scaleContain : scaleCover;
    let x = canvas.dimensions.paddingX + window.innerWidth/scale/2;
    let y = canvas.dimensions.paddingY + window.innerHeight/scale/2;
    
    
    if (Math.abs(view.scale-scale)>0.01 || Math.abs(view.x-x)>1 || Math.abs(view.y-y)>1 || force){
        canvas.pan({
            x: canvas.dimensions.paddingX + window.innerWidth/scale/2, 
            y: canvas.dimensions.paddingY + window.innerHeight/scale/2, 
            scale: scale});
        //let scaleToH = scaleW > scaleH ? true : false;//if Horizontal is large side (in contain image not cover horizontal, in cover cut image in vertical)
        createSceneStyles(mode);
    }
     
     
}



function hideUi (data, mode=null){ //hide/shoe UI elements
    mode ? data.mode = mode : null;
        switch (data.mode){
            case 'all':
                $('#navigation').show(); 
                $('#controls').show();
                $('#players').show();
                $('#sidebar').show();
                $('#hotbar').show();
                break;
            case 'none':
                $('#navigation').hide(); 
                $('#controls').hide();
                $('#players').hide();
                $('#sidebar').hide();
                $('#hotbar').hide();
                break;
            default:
                data.navigation ? $('#navigation').hide() : $('#navigation').show(); 
                data.controls ? $('#controls').hide() : $('#controls').show();
                data.players ? $('#players').hide() : $('#players').show();
                data.sidebar ? $('#sidebar').hide() : $('#sidebar').show();
                data.hotbar ? $('#hotbar').hide() : $('#hotbar').show();
        };
}

//if famelos is enabled return px or vw units based in current values. This function exists to maintain backwards compatibility.
function getCameraMode(sceneId){
    if (!game.scenes.get(sceneId).data.flags?.falemos?.config?.enable){
        console.err('this scene have not config for Falemos, sceneId: '+ sceneId);
        return;
    }
    return Object.values(game.scenes.get(sceneId).data.flags.falemos.config).find(el=>el.x>100) ? 'px': 'vw';
}


function cameraToDOck(html){
        game.users.entries.forEach((user)=>{
            let userCamera = html.find(`.camera-view[data-user="${user.id}"]`);
            if (userCamera.length != 1) return; //no camera, next. 

            if (userCamera[0].classList.contains(`camera-box-popout`)){ //camera is docked => click to popout
                userCamera[0].querySelector(`[data-action="toggle-popout"]`).click();
                return;
            }
    })
}

function camerasToPopout(html){
    game.users.entries.forEach((user)=>{
            let userCamera = html.find(`.camera-view[data-user="${user.id}"]`);
            if (userCamera.length != 1) return; //no camera, next. 

            if (userCamera[0].classList.contains(`camera-box-dock`)){ //camera is docked => click to popout
                userCamera[0].querySelector(`[data-action="toggle-popout"]`).click();
                return;
            }
    })
}

function camerasStyling(html){

    game.users.entries.forEach((user)=>{        
            //let popout = html.find(`#camera-views-user-${user.id}`)[0];
            //if(!popout) return;
            //let box = popout.querySelector(".camera-view");
            //let currentCamPop = new CameraPopoutAppWrapper(this, box.dataset.user, $(popout));
            //currentCamPop.setPosition({ left: game.scenes.viewed.data.flags.falemos.config[user.id].x , top: game.scenes.viewed.data.flags.falemos.config[user.id].y, width: game.scenes.viewed.data.flags.falemos.config[user.id].width });
            if(game.scenes.viewed.data.flags.falemos.config[user.id].cameraName) {
                
                let el = jQuery(`#camera-views-user-${user.id} .falemos-name-overlay`);
                if (el[0]) 
                    el[0].innerHTML = game.scenes.viewed.data.flags.falemos.config[user.id].cameraName;
                
            }

    })
    createSceneStyles();
   
}

function createSceneStyles(imageFormat=null){

    document.getElementById('falemosStyles') ? document.getElementById('falemosStyles').remove() : null;
    
    let css=""
    let scene = game.scenes.viewed;
    game.users.entries.forEach((user)=>{
        if (scene.data.flags.falemos && scene.data.flags.falemos.config.enable === true){
            
            
            let filterKey = scene.data.flags.falemos.config[user.id].filter;
            let geometryKey = scene.data.flags.falemos.config[user.id].geometry ? game.scenes.viewed.data.flags.falemos.config[user.id].geometry : "rectangle";
            
            
            let overlayImg = scene.data.flags.falemos.config[user.id].overlayImg;
            let overlayName = scene.data.flags.falemos.config[user.id].overlayName;
            let overlayHSize = scene.data.flags.falemos.config[user.id].overlayLeft + scene.data.flags.falemos.config[user.id].overlayRight;
            let overlayVSize = scene.data.flags.falemos.config[user.id].overlayTop + scene.data.flags.falemos.config[user.id].overlayBottom;
            let overlayLeft = scene.data.flags.falemos.config[user.id].overlayLeft;
            let overlayTop = scene.data.flags.falemos.config[user.id].overlayTop;
            
            //let originalW = scene.data.flags.falemos.config.window ? scene.data.flags.falemos.config.window.width/100 : 19.2;
            //let originalH = game.scenes.viewed.data.flags.falemos.config.window.height/100;
            
            
            if(!overlayHSize) {overlayHSize=0;}
            if(!overlayVSize) {overlayVSize=0;}
            if(!overlayLeft) {overlayLeft=0;}
            if(!overlayTop) {overlayTop=0;}
            
            //base style
            css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] { background: transparent; padding: 0; box-shadow: none; }\r\n `;//disable shadows an background
            css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .control-bar.left, #camera-views-user-${user.id}[data-scene="${scene.data._id}"] .window-resizable-handle { display: none; } `;
            css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .camera-view { background-image: none; background: rgba(250,250,250,0); border: 0px; /*indicador de hablando*/ box-shadow: none;  padding: 0px !important; /*Tamaño borde*/ }\r\n `;
            css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .player-name { display: none; }\r\n `;//hidde player name
            //custom style
            css += `.camera-view[data-user="${user.id}"][data-scene="${scene.data._id}"] video { object-fit: cover; filter: ${CONFIG.FALEMOS.cameraEffects[filterKey].data}; }\r\n `; //video filter
            css += `.camera-view[data-user="${user.id}"][data-scene="${scene.data._id}"] video { ${CONFIG.FALEMOS.cameraGeometry[geometryKey].data} }\r\n `; //video geometry
            
            
            let mode = getCameraMode(scene.data._id);
            
            if (mode=='px'){//old fixed units
                console.warn(`Scene [${scene.data._id} - ${scene.data.name}] use old fixed units, please reconfigure using percent values for sizes and positions (ex: 0.1 or 12.3 but not 150`);
                
                css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-camera-overlay { display: inherit; background-image: url('${overlayImg}'); width: calc(100% + ${overlayHSize}px); height: calc(100% + ${overlayVSize}px); top: -${overlayTop}px; left: -${overlayLeft}px; }\r\n `;//show camera overlay
                
                //css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-chat-overlay { display: inherit; width: 300px; top: calc(100% + 10px); left: 0px; }\r\n `;//positioning chat overlay
                
                css += `@font-face{font-family: ${scene.data._id}${user.id}; src: ${game.scenes.viewed.data.flags.falemos.config[user.id].cameraNameFont};}\r\n`;
                
                css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-name-overlay { display: inherit; top: ${game.scenes.viewed.data.flags.falemos.config[user.id].cameraNameOffsetY}px; left:${game.scenes.viewed.data.flags.falemos.config[user.id].cameraNameOffsetX}px; font-family: ${scene.data._id}${user.id}; font-size: ${game.scenes.viewed.data.flags.falemos.config[user.id].cameraNameFontSize}px; color: ${game.scenes.viewed.data.flags.falemos.config[user.id].cameraNameColor}}\r\n `;//show name overlay */
            
            }else{//new relative units (vw) TODO: tener en cuenta para modo cover cual es el lado del cual no se ve aprte de la imagen (ahora solo funciona si el width se ve entero
                
                let cssWidth = "";
                let currentLeft = game.scenes.viewed.data.flags.falemos.config[user.id].x*window.innerWidth/100;
                let currentTop = game.scenes.viewed.data.flags.falemos.config[user.id].y*window.innerWidth/100;
                
                if (imageFormat == 'contain'){
                    let maxWidth = (game.scenes.viewed.data.width * game.scenes.viewed._viewPosition.scale / 100) * game.scenes.viewed.data.flags.falemos.config[user.id].width;
                    cssWidth = `max-width: ${maxWidth}px !important;`;
                    
                    let maxTop =(game.scenes.viewed.data.width * game.scenes.viewed._viewPosition.scale / 100) * game.scenes.viewed.data.flags.falemos.config[user.id].y;
                    currentTop = Math.min(maxTop, game.scenes.viewed.data.flags.falemos.config[user.id].y*window.innerWidth/100);
                    
                    let maxLeft =(game.scenes.viewed.data.width * game.scenes.viewed._viewPosition.scale / 100) * game.scenes.viewed.data.flags.falemos.config[user.id].x;
                    currentLeft = Math.min(maxLeft, game.scenes.viewed.data.flags.falemos.config[user.id].x*window.innerWidth/100);
                    
                }else if (imageFormat == 'cover'){
                    let minWidth = (game.scenes.viewed.data.width * game.scenes.viewed._viewPosition.scale / 100) * game.scenes.viewed.data.flags.falemos.config[user.id].width;
                    cssWidth = `min-width: ${minWidth}px !important;`;

                    let minTop =(game.scenes.viewed.data.width * game.scenes.viewed._viewPosition.scale / 100) * game.scenes.viewed.data.flags.falemos.config[user.id].y;
                    currentTop = Math.max(minTop, game.scenes.viewed.data.flags.falemos.config[user.id].y*window.innerWidth/100);
                    
                    let minLeft =(game.scenes.viewed.data.width * game.scenes.viewed._viewPosition.scale / 100) * game.scenes.viewed.data.flags.falemos.config[user.id].x;
                    currentLeft = Math.max(minLeft, game.scenes.viewed.data.flags.falemos.config[user.id].x*window.innerWidth/100);
                    
                }
                
                css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] {
                            width: ${game.scenes.viewed.data.flags.falemos.config[user.id].width}vw !important; 
                            ${cssWidth}
                            top: ${currentTop}px !important;
                            left: ${currentLeft}px !important; }`;
        
                css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-camera-overlay { 
                            display: inherit; 
                            background-image: url('${overlayImg}'); 
                            width: calc(100% + ${overlayHSize}%); 
                            height: calc(100% + ${overlayVSize}%); 
                            top: -${overlayTop}%; 
                            left: -${overlayLeft}%;}\r\n `;//show camera overlay
                    
                //css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-chat-overlay { display: inherit; width: 300px; top: calc(100% + 10px); left: 0px; }\r\n `;//positioning chat overlay
                
                css += `@font-face {
                            font-family: ${scene.data._id}${user.id}; 
                            src: ${game.scenes.viewed.data.flags.falemos.config[user.id].cameraNameFont};}\r\n`;
                
                css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-name-overlay { 
                            display: inherit; 
                            top: ${game.scenes.viewed.data.flags.falemos.config[user.id].cameraNameOffsetY}%; 
                            left:${game.scenes.viewed.data.flags.falemos.config[user.id].cameraNameOffsetX}%; 
                            font-family: ${scene.data._id}${user.id}; 
                            font-size: ${game.scenes.viewed.data.flags.falemos.config[user.id].cameraNameFontSize}vw; 
                            color: ${game.scenes.viewed.data.flags.falemos.config[user.id].cameraNameColor}}\r\n `;//show name overlay
            }
            
            
            
                                

        }
    })    
    
    
    jQuery(`<style id='falemosStyles'>`).text(css).appendTo(document.head);
}


function onSocketData(data){
    let event = data.event;
    let sceneId = data.data.scene._id;
    let userId = data.data.user._id;
    switch (event) {
        case "toggleFitHotkey":
            game.scenes.get(sceneId).setFlag('falemos', `config.${userId}.fit`, data.data.mode);
            break;
        default:
            console.error(event + " not is a Falemos event");
            break;
    }
}











function versionChangesPopup(){

    game.settings.register("falemos", "NoteV0.3.0", {
        scope: "world",
        config: false,
        default: false,
        type: Boolean,
    });
    
  if (game.settings.get("falemos","NoteV0.3.0") == false && game.user.isGM) {
    let d = new Dialog({
      title: "falemos update 0.3.0",
      content: `
            <h3>Changes in version 0.3.0</h3>
            <p>The configuration units for the camera change from pixels to % screen to achieve an adaptive layout for the window. The previous pixel scenes still work but should be adapted to the new units as in the future the pixel scenes will no longer work.<br/>
            Also the overlay and label units have been changed to a percentage of the camera size for the same purpose as mentioned above.</p>
            <p>An optional scene setting is added, allowing the scene to be set to cover (the whole window is displayed without empty spaces) or contain (the image is always displayed in its full aspect ratio).</p>
            <p>All this together allows a camera to adjust to a part of the scene image as if it were part of the scene.</p>
            <p><input type="checkbox" name="hide" data-dtype="Boolean">Don't show this screen again</p>`,
      buttons: {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: "OK"
      }
      },
      default: "OK",
      close: html => {
        if (html.find("input[name ='hide']").is(":checked")) game.settings.set("falemos","NoteV0.3.0",true);
      }
    });
    d.render(true);
  }
}












Handlebars.registerHelper('lookupProp', function (obj, key, prop) {
    if (!obj) return null;
    return obj[key] && obj[key][prop];
});

Handlebars.registerHelper('concat3', function(a, b, c) {
    return a + b +c;
});

Handlebars.registerHelper("log", function(data) {
  console.log(data);
});



