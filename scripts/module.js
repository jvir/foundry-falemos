//import HudContextMenu from './hudContextMenu';











Hooks.once('init', async function() {
    const MCCONFIG = {
        /**
        * Available Camera Effects implementations
        * @type {Object}
        */
        cameraEffects: {
            NONE: {name: game.i18n.localize("FALEMOS.camera.effects.none"), data: "none"},
            BW: {name: game.i18n.localize("FALEMOS.camera.effects.bw"), data: "grayscale(1)"},
            Sepia: {name: game.i18n.localize("FALEMOS.camera.effects.sepia"), data: "sepia(1)"},
            Noise: {name: game.i18n.localize("FALEMOS.camera.effects.noise"), data: "url('#noise')"},
            Warp: {name: game.i18n.localize("FALEMOS.camera.effects.warp"), data: "url('#warp')"}
        },
        cameraGeometry: {
            rectangle: {name: game.i18n.localize("FALEMOS.camera.geometry.rectangle"), data: "grayscale(1)"},
            square: {name: game.i18n.localize("FALEMOS.camera.geometry.square"), data: "grayscale(1)"},
            circle: {name: game.i18n.localize("FALEMOS.camera.geometry.circle"), data: "grayscale(1)"},
            triangle: {name: game.i18n.localize("FALEMOS.camera.geometry.triagle"), data: "grayscale(1)"},
        }
    }
    CONFIG.FALEMOS = MCCONFIG;
});

Hooks.once('ready', async function() {
    CONFIG.debug.hooks=true
    let svghtml = await renderTemplate("modules/falemos/templates/filter/filter.html", {});
    jQuery(svghtml).appendTo(document.body);
});

Hooks.on('renderCameraViews', async function(cameraviews, html) {
    if (game.scenes.active.data.flags.falemos?.config?.enable){
        console.log(html.find('.camera-view'));
        html.find('.camera-view').each((index, camera)=>{
//             console.log('scene');
//             console.log(camera);
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
            console.log(game.users.get(ev.currentTarget.closest('.camera-view').dataset.user).data.flags.falemos);
            
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
        
//         if (game.scenes.get(data.entity._id).getFlag('falemos', 'config') === undefined)
//         {
//             TODO create initial config
//         }
        
        let falemosconfig = game.scenes.get(data.entity._id).getFlag('falemos', 'config') ? game.scenes.get(data.entity._id).getFlag('falemos', 'config') : null;
        let users = game.users.entries;
                
        //renderTemplate con campos y data saliendo de los flags        
        let mchtml = await renderTemplate("modules/falemos/templates/scene/mc-config.html", {falemosconfig: falemosconfig, users:users, falemos: CONFIG.FALEMOS})
        
        
        //insert mc html template
        html.find('button[name="submit"]').before(mchtml);
        
        // enable listeners
        html.find('.capture-current').each(function(index) {
            $(this).on("click", function(ev){
                console.log(ev.currentTarget.dataset.user); 
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
            console.log('scene');
            console.log(camera);
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
//                 console.log('scene');
//                 console.log(camera);
                camera.dataset.scene = game.scenes.active.data._id;
                camera.parentNode.dataset.scene = game.scenes.active.data._id;
            })
            camerasToPopout(camerashtml);
            camerasStyling(camerashtml);
        }else{
            let camerashtml = jQuery("#camera-views");
            camerashtml.find('.camera-view').each((index, camera)=>{
//                 console.log('scene');
//                 console.log(camera);
                camera.removeAttribute('data-scene');
                camera.parentNode.removeAttribute('data-scene');
            })
            cameraToDOck(camerashtml);
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

})




function cameraToDOck(html){
        game.users.entries.forEach((user)=>{
            let userCamera = html.find(`.camera-view[data-user="${user.id}"]`);
            if (userCamera.length != 1) return; //no camera, next. 
                                            console.log(userCamera[0]);

            if (userCamera[0].classList.contains(`camera-box-popout`)){ //camera is docked => click to popout
//                 console.log(user.id)
//                 console.log(userCamera[0].querySelector(`[data-action="toggle-popout"]`));
                userCamera[0].querySelector(`[data-action="toggle-popout"]`).click();
                return;
            }
    })
}

function camerasToPopout(html){
    game.users.entries.forEach((user)=>{
            let userCamera = html.find(`.camera-view[data-user="${user.id}"]`);
            if (userCamera.length != 1) return; //no camera, next. 
                                            console.log(userCamera[0]);

            if (userCamera[0].classList.contains(`camera-box-dock`)){ //camera is docked => click to popout
//                 console.log(user.id)
//                 console.log(userCamera[0].querySelector(`[data-action="toggle-popout"]`));
                userCamera[0].querySelector(`[data-action="toggle-popout"]`).click();
                return;
            }
    })
}

function camerasStyling(html){
    console.log('camerastiling');
    console.log(html);
    game.users.entries.forEach((user)=>{        
            let popout = html.find(`#camera-views-user-${user.id}`)[0];
            if(!popout) return;
            console.log('userStyle');
            console.log(popout);
            let box = popout.querySelector(".camera-view");
            let currentCamPop = new CameraPopoutAppWrapper(this, box.dataset.user, $(popout));
            currentCamPop.setPosition({ left: game.scenes.active.data.flags.falemos.config[user.id].x , top: game.scenes.active.data.flags.falemos.config[user.id].y, width: game.scenes.active.data.flags.falemos.config[user.id].width });
//             console.log(game.scenes.active.data.flags.falemos[user.id]);
//             console.log(html.find('video'));
            //html.find('video') ? html.find('video')[0].style.filter= game.scenes.active.data.flags.falemos.config[user.id].filter : comsole.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
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
                css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-camera-overlay { display: inherit; background-image: url('${overlayImg}'); width: calc(100% + ${overlayHSize}px); height: calc(100% + ${overlayVSize}px); top: -${overlayTop}px; left: -${overlayLeft}px; }\r\n `;//show camera overlay
                css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-chat-overlay { display: inherit; width: 300px; top: calc(100% + 10px); left: 0px; }\r\n `;//positioning chat overlay
                css += `@font-face{font-family: ${scene.data._id}${user.id}; src: url(${game.scenes.active.data.flags.falemos.config[user.id].cameraNameFont});}\r\n`;
                css += `#camera-views-user-${user.id}[data-scene="${scene.data._id}"] .falemos-name-overlay { display: inherit; top: 0; left:0; font-family: ${scene.data._id}${user.id}; font-size: ${game.scenes.active.data.flags.falemos.config[user.id].cameraNameFontSize}px; color: ${game.scenes.active.data.flags.falemos.config[user.id].cameraNameColor}}\r\n `;//show name overlay
                                    

            }
        })    
    })
    
    jQuery(`<style id='falemosStyles'>`).text(css).appendTo(document.head);
}



Handlebars.registerHelper('lookupProp', function (obj, key, prop) {
    console.log('lookupProp');
    console.log(obj);
    console.log(key);
    console.log(prop);
    if (!obj) return null;
    return obj[key] && obj[key][prop];
});

Handlebars.registerHelper('concat3', function(a, b, c) {
    return a + b +c;
});

Handlebars.registerHelper("log", function(data) {
  console.log(data);
});



