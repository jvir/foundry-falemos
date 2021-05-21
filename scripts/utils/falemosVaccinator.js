//
// falemos vaccinator 0.6
// by Viriato139ac
//

function falemosCalculator(
  idimensiones,
  imargenes,
  ioverlays,
  irejilla,
  iseparacionminima,
  iposiciongm,
  ihuecosvacios,
  inames
) {
  // Comprobaciones previas
  // GM no puede ser nulo
  if (iposiciongm === undefined) iposiciongm = 1;
  // console.log("Posición del GM: " + iposiciongm);
  // Si GM es una de las posiciones vacías, se elimina esa posición vacía
  if (!ihuecosvacios.every((num) => num !== iposiciongm))
    ihuecosvacios = ihuecosvacios.filter((num) => num !== iposiciongm);
  // console.log("Huecos vacíos: " + ihuecosvacios);

  const coorini = [Number(imargenes[0]), Number(imargenes[1])];
  const coorfin = [
    Number(idimensiones[0]) - Number(imargenes[2]),
    Number(idimensiones[1]) - Number(imargenes[3]),
  ];
  // console.log("Coordenadas iniciales: " + coorini);
  // console.log("Coordenadas finales: " + coorfin);

  const ventana = [400, 300];
  const ventanalayout = [
    ventana[0] +
      (ventana[0] * (Number(ioverlays[0]) + Number(ioverlays[2]))) / 100,
    ventana[1] +
      (ventana[1] * (Number(ioverlays[1]) + Number(ioverlays[3]))) / 100,
  ];
  // console.log("Ventana: " + ventana);
  // console.log("Ventana: layout: " + ventanalayout);

  let temp1 = [];
  for (let i = 0; i < coorfin.length; i++)
    temp1.push(
      (coorfin[i] -
        coorini[i] -
        Number(iseparacionminima) * (Number(irejilla[i]) + 1)) /
        Number(irejilla[i])
    );
  // console.log(temp1);
  let temp2 = [];
  for (let i = 0; i < coorfin.length; i++)
    temp2.push(
      (temp1[i] * ventanalayout[coorfin.length - i - 1]) / ventanalayout[i]
    );
  // console.log(temp2);

  const wlayoutoptimo = Math.min(temp1[0], temp2[1]);
  const hlayoutoptimo = Math.min(temp1[1], temp2[0]);
  // console.log("Layout optimo (ancho): " + wlayoutoptimo);
  // console.log("Layout optimo (alto): " + hlayoutoptimo);

  const ventanafinallayout = [
    wlayoutoptimo,
    (wlayoutoptimo * ventanalayout[1]) / ventanalayout[0],
  ];
  const ventanafinal = [
    ventanafinallayout[0] /
      (1 + (Number(ioverlays[0]) + Number(ioverlays[2])) / 100),
    ventanafinallayout[1] /
      (1 + (Number(ioverlays[1]) + Number(ioverlays[3])) / 100),
  ];
  // console.log("Ventana final layout: " + ventanafinallayout);
  // console.log("Ventana final: " + ventanafinal);

  let espacios = [];
  for (let i = 0; i < coorfin.length; i++)
    espacios.push(
      (coorfin[i] - coorini[i] - ventanafinallayout[i] * Number(irejilla[i])) /
        (Number(irejilla[i]) + 1)
    );
  // console.log("Espacios: " + espacios);

  function twoDimensionArray(a, b) {
    let arr = [];
    for (let i = 0; i < a; i++) {
      for (let j = 0; j < b; j++) {
        arr[i] = [];
      }
    }
    for (let i = 0; i < a; i++) {
      for (let j = 0; j < b; j++) {
        arr[i][j] = j;
      }
    }
    return arr;
  }

  const resultado = twoDimensionArray(
    Number(irejilla[0]) * Number(irejilla[1]),
    16
  );

  let k = 0;
  let l = 0;
  for (let i = 0; i < irejilla[1]; i++) {
    for (let j = 0; j < irejilla[0]; j++) {
      let resultadoi = [
        i + 1,
        j + 1,
        Math.round(
          coorini[0] +
            espacios[0] * (j + 1) +
            ventanafinallayout[0] * j +
            (ventanafinal[0] * Number(ioverlays[0])) / 100
        ),
        Math.round(
          coorini[1] +
            espacios[1] * (i + 1) +
            ventanafinallayout[1] * i +
            (ventanafinal[1] * Number(ioverlays[1])) / 100
        ),
        Math.round(ventanafinal[0]),
        Math.round(ventanafinal[1]),
        espacios[0],
        espacios[1],
        Math.round(
          coorini[0] +
            espacios[0] * (j + 1) +
            ventanafinallayout[0] * j +
            (ventanafinal[0] * Number(ioverlays[0])) / 100 -
            (ventanafinal[0] * Number(ioverlays[0])) / 100
        ),
        Math.round(
          coorini[1] +
            espacios[1] * (i + 1) +
            ventanafinallayout[1] * i +
            (ventanafinal[1] * Number(ioverlays[1])) / 100 -
            (ventanafinal[1] * Number(ioverlays[1])) / 100
        ),
        Math.round(ventanafinallayout[0]),
        Math.round(ventanafinallayout[1]),
        Math.round(
          ((coorini[0] +
            espacios[0] * (j + 1) +
            ventanafinallayout[0] * j +
            (ventanafinal[0] * Number(ioverlays[0])) / 100) /
            Number(idimensiones[0])) *
            100
        ),
        Math.round(
          ((coorini[1] +
            espacios[1] * (i + 1) +
            ventanafinallayout[1] * i +
            (ventanafinal[1] * Number(ioverlays[1])) / 100) /
            Number(idimensiones[1])) *
            100
        ),
        Math.round((ventanafinal[0] / Number(idimensiones[0])) * 100),
        Math.round((ventanafinal[1] / Number(idimensiones[1])) * 100),
      ];

      resultadoi.push(ihuecosvacios.every((num) => num !== k + 1));
      resultadoi.push(Number(iposiciongm) === k + 1);
      if (ihuecosvacios.every((num) => num !== k + 1)) {
        resultadoi.push(inames[l]);
        l++;
      } else {
        resultadoi.push("Vacío");
      }

      resultado[k] = resultadoi;
      k++;
    }
  }
  // console.log(resultado);

  const resultadofinal1 = resultado.filter((arr) => arr[17]);
  const resultadofinal2 = resultado.filter((arr) => arr[16] && !arr[17]);
  // console.log(resultadofinal1)
  // console.log(resultadofinal2)
  const resultadofinal = resultadofinal1.concat(resultadofinal2);
  // console.log(resultadofinal)
  return resultadofinal;
}

let applyChanges = false;
new Dialog({
  title: `${game.i18n.localize("FALEMOS.vaccinator.title")}`,
  content: `
<form>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.width")}:</label>
    <input type="number" id="ancho" name="ancho" min=1 value=${
      window.innerWidth
    }>
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.widthHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.height")}:</label>
    <input type="number" id="alto" name="alto" min=1 value=${
      window.innerHeight
    }>
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.heightHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.margins")}:</label>
    <input type="number" id="marizq" name="marizq" min=0 value=${
      2 * document.getElementById("controls").clientWidth
    }>
    <input type="number" id="mararr" name="mararr" min=0 value=${
    document.getElementById("scene-list").clientHeight
  }>
  <input type="number" id="marder" name="marder" min=0 value=${
    document.getElementById("sidebar").offsetWidth
  }>
  <input type="number" id="maraba" name="maraba" min=0 value=${
    document.getElementById("macro-list").clientHeight
  }>
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.marginsHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.rows")}:</label>
    <input type="number" id="nRows" name="nRows" min=1 value=2>
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.rowsHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.columns")}:</label>
    <input type="number" id="nCols" name="nCols" min=1 value=2>
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.columnsHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.separation")}:</label>
    <input type="number" id="sepmin" name="sepmin" min=0 value=10>
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.separationHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.gmposition")}:</label>
    <input type="number" id="posgm" name="posgm" min=1 value=1>
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.gmpositionHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.emptyslots")}:</label>
    <input type="text" id="huecos" name="huecos" value="3">
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.emptyslotsHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.frame")}:</label>
    <input type="text" id="marco" name="marco" value="">
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.frameHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.overlays")}:</label>
    <input type="number" id="oveizq" name="oveizq" min="0" value="0">
    <input type="number" id="ovearr" name="ovearr" min="0" value="0">
    <input type="number" id="oveder" name="oveder" min="0" value="0">
    <input type="number" id="oveaba" name="oveaba" min="0" value="0">
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.overlaysHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.names")}:</label>
    <input type="text" id="nombres" name="nombres" value="a,b,c">
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.namesHint")}</p>
</form>
`,
  buttons: {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: `${game.i18n.localize("FALEMOS.vaccinator.apply")}`,
      callback: () => (applyChanges = true),
    },
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: `${game.i18n.localize("FALEMOS.vaccinator.cancel")}`,
    },
  },
  default: "yes",
  close: (html) => {
    if (applyChanges) {
      let ancho = html.find('[name="ancho"]')[0].value || 1;
      let alto = html.find('[name="alto"]')[0].value || 1;
      let marizq = html.find('[name="marizq"]')[0].value || 0;
      let mararr = html.find('[name="mararr"]')[0].value || 0;
      let marder = html.find('[name="marder"]')[0].value || 0;
      let maraba = html.find('[name="maraba"]')[0].value || 0;
      let nRows = html.find('[name="nRows"]')[0].value || 1;
      let nCols = html.find('[name="nCols"]')[0].value || 1;
      let sepmin = html.find('[name="sepmin"]')[0].value || 0;
      let posgm = html.find('[name="posgm"]')[0].value || 1;
      let huecos = html.find('[name="huecos"]')[0].value;
      let marco = html.find('[name="marco"]')[0].value;
      let oveizq = html.find('[name="oveizq"]')[0].value || 0;
      let ovearr = html.find('[name="ovearr"]')[0].value || 0;
      let oveder = html.find('[name="oveder"]')[0].value || 0;
      let oveaba = html.find('[name="oveaba"]')[0].value || 0;
      let nombres = html.find('[name="nombres"]')[0].value;

      const idimensiones = [ancho, alto];
      const imargenes = [marizq, mararr, marder, maraba];
      const ioverlays = [oveizq, ovearr, oveder, oveaba];
      const irejilla = [nCols, nRows];
      const iseparacionminima = sepmin;
      const iposiciongm = posgm;
      const ihuecosvaciostxt = huecos.split(",");
      const ihuecosvacios = ihuecosvaciostxt.map((num) => Number(num));
      const inames = nombres.split(",");

      console.log("---------------------------------");
      console.log("----   Falemos vaccinator   -----");
      console.log("---------------------------------");
      console.log("Dimensiones: " + idimensiones);
      console.log("Márgenes: " + imargenes);
      console.log("Marco: " + marco);
      console.log("Overlays del marco: " + ioverlays);
      console.log("Rejilla: " + irejilla);
      console.log("Separación mínima: " + iseparacionminima);
      console.log("Posición GM: " + iposiciongm);
      console.log("Huecos vacíos: " + ihuecosvacios);
      console.log("Nombres: " + inames);
      console.log("---------------------------------");

      let resultadofinal = falemosCalculator(
        idimensiones,
        imargenes,
        ioverlays,
        irejilla,
        iseparacionminima,
        iposiciongm,
        ihuecosvacios,
        inames
      );
      console.log("Resultado final: ");
      console.log(resultadofinal);
      console.log("---------------------------------");

      let sceneData1 = {};
      for (let i = 0; i < resultadofinal.length; i++)
        sceneData1[i.toString()] = {
          x: resultadofinal[i][12],
          y: resultadofinal[i][13],
          width: resultadofinal[i][14],
          overlayImg: marco,
          overlayLeft: Number(ioverlays[0]),
          overlayRight: Number(ioverlays[2]),
          overlayTop: Number(ioverlays[1]),
          overlayBottom: Number(ioverlays[3]),
          geometry: "rectangle",
          filter: "NONE",
          cameraName: resultadofinal[i][18],
          cameraNameOffsetX: null,
          cameraNameOffsetY: null,
          cameraNameFontSize: null,
          cameraNameColor: "#000000",
          cameraNameFont: "",
          fit: "nofit",
        };
      let sceneData2 = {
        enable: true,
        hide: {
          navigation: false,
          controls: false,
          players: false,
          sidebar: false,
          hotbar: false,
          mode: "scene",
        },
      };

      let sceneData = { ...sceneData1, ...sceneData2 };

      console.log("Datos de la escena:");
      console.log(sceneData);
      console.log("---------------------------------");
      console.log("---------------------------------");

      game.falemos.putSceneConfig(null, JSON.stringify(sceneData));
    }
  },
}).render(true);
