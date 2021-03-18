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
        }
    }
    CONFIG.FALEMOS = MCCONFIG;
});

Hooks.once('ready', async function() {
    //CONFIG.debug.hooks=true
    
        
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
        if (e.ctrlKey && e.altKey && e.which == 70) { //TODO toggle falemos in current scene
            alert('falemos');
        };
        if (e.ctrlKey && e.altKey && e.which == 72) { //TODO toggle UI visibility in current scene
            let tempUI = game.scenes.active.data.flags?.falemos?.config?.hide?.mode
            switch (tempUI) {
                case 'all':
                    game.scenes.active.setFlag('falemos', 'config.hide.mode', 'scene');
                    break;
                case 'none':
                    game.scenes.active.setFlag('falemos', 'config.hide.mode', 'all');
                    break;
                default:
                    let currentVisibility =Object.assign({}, game.scenes.active.data.flags.falemos.config.hide); 
                    if (Object.values(currentVisibility).reduce((a, value) => a + value, 0) == Object.keys(currentVisibility).length){//all visible
                        Object.keys(currentVisibility).forEach(key=>currentVisibility[key] = false)
                        //hideUi(currentVisibility);
                        game.scenes.active.setFlag('falemos', 'config.hide.mode', 'none');
                    }else if(Object.values(currentVisibility).reduce((a, value) => a + value, 0) == 0){//all hide
                        Object.keys(currentVisibility).forEach(key=>currentVisibility[key] = true)
                        //hideUi(currentVisibility);
                        game.scenes.active.setFlag('falemos', 'config.hide.mode', 'all');
                    }else{
                        game.scenes.active.setFlag('falemos', 'config.hide.mode', 'none');
                    }
                    
            }
            
            
            
            //scene.update({id: game.scenes.active.data._id, 'flags.falemos.config.hide': currentVisibility});
//             .then(function(){
//                 game.socket.emit('module.falemos', {event: "toggleUiHotkey", action:'command', data: {command: 'game.scenes.active.view()'}});
//                 onSocketData({event: "toggleUiHotkey", action:'command', data: {command: 'game.scenes.active.view()'}});
//             });
            
        };
    };
    
    
});

Hooks.on('renderCameraViews', async function(cameraviews, html) {
    if (game.scenes.active.data.flags.falemos?.config?.enable){

        html.find('.camera-view').each((index, camera)=>{
            camera.dataset.scene = game.scenes.active.data._id;
            camera.parentNode.dataset.scene = game.scenes.active.data._id;
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
    if (game.scenes.active.data.flags.falemos?.config?.enable){
        let camerashtml = jQuery("#camera-views");
        camerashtml.find('.camera-view').each((index, camera)=>{
            camera.dataset.scene = game.scenes.active.data._id;
            camera.parentNode.dataset.scene = game.scenes.active.data._id;
        })
        camerasToPopout(camerashtml);
        camerasStyling(camerashtml);
    }
})


Hooks.on('renderSceneNavigation', async function(scene, html) { //TODO get form values and save in flag
        if (game.scenes.active.data.flags.falemos?.config?.enable){
            let camerashtml = jQuery("#camera-views");
            camerashtml.find('.camera-view').each((index, camera)=>{
                camera.dataset.scene = game.scenes.active.data._id;
                camera.parentNode.dataset.scene = game.scenes.active.data._id;
            })
            camerasToPopout(camerashtml);
            camerasStyling(camerashtml);
            hideUi(game.scenes.active.data.flags.falemos.config.hide);
        }else{
            let camerashtml = jQuery("#camera-views");
            camerashtml.find('.camera-view').each((index, camera)=>{
                camera.removeAttribute('data-scene');
                camera.parentNode.removeAttribute('data-scene');
            })
            cameraToDOck(camerashtml);
            hideUi({}, 'all');
        }
})


//TODO: chat under camera test implementation (best with screenshot?)
// Hooks.on('renderChatMessage', async function(chatMessage, html) {
//     let _html = await html[0].outerHTML
//     let userChatOverlay = document.querySelector(`#camera-views-user-${chatMessage.data.user}[data-scene="${game.scenes.active.data._id}"] .falemos-chat-overlay`);
//     userChatOverlay.innerHTML =_html;
//     console.log(userChatOverlay);
//     jQuery(userChatOverlay).fadeIn('fast');
//     
//     setTimeout(function() {
//         jQuery(userChatOverlay).fadeOut('slow');
//     }, 5000);
//     
// });



Hooks.on('rtcSettingsChanged', async function(cameraviews, html) {

});

Hooks.on('canvasInit', async function(){
    game.scenes.active.setFlag('falemos','config.hide.mode','scene');
});

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
            let popout = html.find(`#camera-views-user-${user.id}`)[0];
            if(!popout) return;
            let box = popout.querySelector(".camera-view");
            let currentCamPop = new CameraPopoutAppWrapper(this, box.dataset.user, $(popout));
            currentCamPop.setPosition({ left: game.scenes.active.data.flags.falemos.config[user.id].x , top: game.scenes.active.data.flags.falemos.config[user.id].y, width: game.scenes.active.data.flags.falemos.config[user.id].width });
            if(game.scenes.active.data.flags.falemos.config[user.id].cameraNameFont) {jQuery(`#camera-views-user-${user.id} .falemos-name-overlay`)[0].innerHTML = game.scenes.active.data.flags.falemos.config[user.id].cameraName;}

    })
    createSceneStyles();
}

function createSceneStyles(){
    document.getElementById('falemosStyles') ? document.getElementById('falemosStyles').remove() : null;
    
    let css=""
    game.scenes.entries.forEach((scene)=>{
        game.users.entries.forEach((user)=>{
            if (scene.data.flags.falemos && scene.data.flags.falemos.config.enable === true){
                
                
                let filterKey = game.scenes.active.data.flags.falemos.config[user.id].filter;
                let geometryKey = game.scenes.active.data.flags.falemos.config[user.id].geometry ? game.scenes.active.data.flags.falemos.config[user.id].geometry : "rectangle";
                
                
                let overlayImg = game.scenes.active.data.flags.falemos.config[user.id].overlayImg;
                let overlayName = game.scenes.active.data.flags.falemos.config[user.id].overlayName;
                let overlayHSize = game.scenes.active.data.flags.falemos.config[user.id].overlayLeft + game.scenes.active.data.flags.falemos.config[user.id].overlayRight;
                let overlayVSize = game.scenes.active.data.flags.falemos.config[user.id].overlayTop + game.scenes.active.data.flags.falemos.config[user.id].overlayBottom;
                let overlayLeft = game.scenes.active.data.flags.falemos.config[user.id].overlayLeft;
                let overlayTop = game.scenes.active.data.flags.falemos.config[user.id].overlayTop;
                
                
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
                css += `.camera-view[data-user="${user.id}"][data-scene="${scene.data._id}"] video { filter: ${CONFIG.FALEMOS.cameraEffects[filterKey].data}; }\r\n `; //video filter
                css += `.camera-view[data-user="${user.id}"][data-scene="${scene.data._id}"] video { ${CONFIG.FALEMOS.cameraGeometry[geometryKey].data} }\r\n `; //video geometry
                css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-camera-overlay { display: inherit; background-image: url('${overlayImg}'); width: calc(100% + ${overlayHSize}px); height: calc(100% + ${overlayVSize}px); top: -${overlayTop}px; left: -${overlayLeft}px; }\r\n `;//show camera overlay
                css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-chat-overlay { display: inherit; width: 300px; top: calc(100% + 10px); left: 0px; }\r\n `;//positioning chat overlay
                css += `@font-face{font-family: ${scene.data._id}${user.id}; src: ${game.scenes.active.data.flags.falemos.config[user.id].cameraNameFont};}\r\n`;
                css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-name-overlay { display: inherit; top: ${game.scenes.active.data.flags.falemos.config[user.id].cameraNameOffsetY}px; left:${game.scenes.active.data.flags.falemos.config[user.id].cameraNameOffsetX}px; font-family: ${scene.data._id}${user.id}; font-size: ${game.scenes.active.data.flags.falemos.config[user.id].cameraNameFontSize}px; color: ${game.scenes.active.data.flags.falemos.config[user.id].cameraNameColor}}\r\n `;//show name overlay
                                    

            }
        })    
    })
    
    jQuery(`<style id='falemosStyles'>`).text(css).appendTo(document.head);
}


function onSocketData(data){
    data.action == 'command' ? eval(data.data.command) : null;
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



