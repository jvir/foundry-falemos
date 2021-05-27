//
// falemos vaccinator 0.9
// by Viriato139ac
//

// Número de jugadores y listado de nombres

let jugadores = [];
for (let user of game.users.keys()) {
  // console.log(game.users.get(user)._data.name)
  jugadores.push(game.users.get(user)._data.name);
}

const numeroJugadores = jugadores.length;
const nombresJugadores = jugadores.join();

// Calculo de la composición óptima en base al número de jugadores, 7 jugadores = 2x4, 4 jugadores = 2x2, lo hace minimizando filas+columnas

let temp1 = [];
let k = 1;
for (let i = 0; i < numeroJugadores; i++) {
  for (let j = 0; j < numeroJugadores; j++) {
    temp1.push({
      rows: i + 1,
      columns: j + 1,
      slots: (j + 1) * (i + 1),
      sum: j + i + 2,
      valid: (j + 1) * (i + 1) >= numeroJugadores,
    });
    k++;
  }
}

let temp2 = temp1.filter((nnn) => nnn.valid);
let temp3 = temp2.sort(function (a, b) {
  return a.sum - b.sum || a.rows - b.rows;
});
const slotsOptimo = temp3[0];
//console.log(slotsOptimo.rows + 'x' + slotsOptimo.columns)

// Cálculo de los huecos vacíos por defecto, basado en el número de jugadores y los huecos disponibles
let temp4 = [];
for (let i = numeroJugadores + 1; i <= slotsOptimo.slots; i++) temp4.push(i);
const emptySlots = temp4.join();

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

// Redondear 2 decimales

function redondear2dec(num) {
	return (Math.round(num*100))/100
}

// Esta función calcula las posiciones y anchos de los jugadores óptimas para una composición dada

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
        redondear2dec(
          coorini[0] +
            espacios[0] * (j + 1) +
            ventanafinallayout[0] * j +
            (ventanafinal[0] * Number(ioverlays[0])) / 100
        ),
        redondear2dec(
          coorini[1] +
            espacios[1] * (i + 1) +
            ventanafinallayout[1] * i +
            (ventanafinal[1] * Number(ioverlays[1])) / 100
        ),
        redondear2dec(ventanafinal[0]),
        redondear2dec(ventanafinal[1]),
        espacios[0],
        espacios[1],
        redondear2dec(
          coorini[0] +
            espacios[0] * (j + 1) +
            ventanafinallayout[0] * j +
            (ventanafinal[0] * Number(ioverlays[0])) / 100 -
            (ventanafinal[0] * Number(ioverlays[0])) / 100
        ),
        redondear2dec(
          coorini[1] +
            espacios[1] * (i + 1) +
            ventanafinallayout[1] * i +
            (ventanafinal[1] * Number(ioverlays[1])) / 100 -
            (ventanafinal[1] * Number(ioverlays[1])) / 100
        ),
        redondear2dec(ventanafinallayout[0]),
        redondear2dec(ventanafinallayout[1]),
        redondear2dec(
          ((coorini[0] +
            espacios[0] * (j + 1) +
            ventanafinallayout[0] * j +
            (ventanafinal[0] * Number(ioverlays[0])) / 100) /
            Number(idimensiones[0])) *
            100
        ),
        redondear2dec(
          ((coorini[1] +
            espacios[1] * (i + 1) +
            ventanafinallayout[1] * i +
            (ventanafinal[1] * Number(ioverlays[1])) / 100) /
            Number(idimensiones[1])) *
            100
        ),
        redondear2dec((ventanafinal[0] / Number(idimensiones[0])) * 100),
        redondear2dec((ventanafinal[1] / Number(idimensiones[1])) * 100),
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

// Aquí se comienza a definir el formulario de entrada de datos

let applyChanges = false;
let saveMacro = false;
new Dialog({
  title: `${game.i18n.localize("FALEMOS.vaccinator.title")}`,
  content: `
  <script>function selectImage(){
    const fp1 = new FilePicker({
       type: "image",
       button: "image-picker",
       callback: (url) => {
          $("#marcos").val(url);
       }
    });
    fp1.browse();
    }
  </script>
  <script>function selectImageMult() {
    const fp2 = new FilePicker({
       type: "image",
       button: "image-picker",
       callback: (url) => {
        $("#marcos").val() === ""
        ? $("#marcos").val(url) 
        : $("#marcos").val([$("#marcos").val(),url].join());
       }
    });
    fp2.browse();
    }
  </script>
  <script>function simularTabla(nuFilas, nuColumnas,nuJugadores,poGM,poHuecos,naJugadores){
    nuFilas= Number(nuFilas)
    nuColumnas= Number(nuColumnas)
    nuJugadores= Number(nuJugadores)
    poGM= Number(poGM)
    // Si hay más jugadores que la disposición
    nuJugadores = Math.min(nuFilas*nuColumnas,nuJugadores);
    // Si GM> nuJugadores o GM<1
    if (poGM<1) poGM=1;
    if (poGM>nuJugadores) poGM=nuJugadores;
    let poHuecosa = poHuecos.split(",").map(num => Number(num));
    let naJugadoresa = naJugadores.split(",");
    // Si GM es una de las posiciones vacías, se elimina esa posición vacía
    if (!poHuecosa.every((num) => num !== poGM))
    poHuecosa = poHuecosa.filter((num) => num !== poGM);
    //console.log('GM:' + poGM + ' Ju:' + nuJugadores + ' Hu:' + poHuecosa)
	//console.log('Nombres:' + naJugadoresa)
    let tabla = '<table align="center" style="margin: 0px auto;"">' + '\\n' + '<tbody>\\n';
    let k = 1;
    let h = 1;
    let l = 1;
    for (let i=0;i<nuFilas;i++){
        tabla = tabla + '<tr>\\n';
        for (let j=0;j<nuColumnas;j++){
		    //console.log(i+1 + 'x' + j+1 + '=' + k + h + l);
            if (poHuecosa.some(num => num === k)){
                tabla = tabla + '<td style="text-align:center;background-color:#EC7063">' + '${game.i18n.localize("FALEMOS.vaccinator.simulateEmpty")}' + '</td>\\n';
            }else if(k === poGM){
                if(naJugadoresa[0]=== undefined || naJugadoresa[0]===""){
                    tabla = tabla + '<td style="text-align:center;background-color:#3498DB">' + '${game.i18n.localize("FALEMOS.vaccinator.simulateEmpty")}' + '</td>\\n';
                }else{
                    tabla = tabla + '<td style="text-align:center;background-color:#3498DB">' + naJugadoresa[0] + '</td>\\n';
                }
            }else if(l>(nuJugadores-1)){
                tabla = tabla + '<td style="text-align:center;background-color:#EC7063">' + '${game.i18n.localize("FALEMOS.vaccinator.simulateEmpty")}' + '</td>\\n';
            }else if(naJugadoresa[h]=== undefined || naJugadoresa[h]===""){
                tabla = tabla + '<td style="text-align:center;background-color:#F7DC6F">' + '${game.i18n.localize("FALEMOS.vaccinator.simulateUndefined")}' + '</td>\\n';
                l++;
            }else{
                tabla = tabla + '<td style="text-align:center;background-color:#58D68D">' + naJugadoresa[h]+ '</td>\\n';
                h++;
                l++;
            }
            k++
        }    
        tabla = tabla + '</tr>\\n';
    }
    tabla = tabla + '</tbody>\\n</table>';
    //console.log(tabla)
    new Dialog({
        title: '${game.i18n.localize("FALEMOS.vaccinator.simulateTable")}',
        content: tabla ,
        buttons: {
          yes: {
            icon: "<i class='fas fa-chevron-circle-left'></i>",
            label: '${game.i18n.localize("FALEMOS.vaccinator.return")}',
          },
        },
        default: "yes",
        close: (html) => {
        },
      }).render(true);
    }
  </script>  
  <form>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.width")}:</label>
    <input type="number" id="ancho" name="ancho" min=1 value=${
      window.innerWidth
    }>
    <label>${game.i18n.localize("FALEMOS.vaccinator.height")}:</label>
    <input type="number" id="alto" name="alto" min=1 value=${
      window.innerHeight
    }>
  </div>
  <p class="notes">
  <b>${game.i18n.localize(
    "FALEMOS.vaccinator.width"
  )}</b>: ${game.i18n.localize(
    "FALEMOS.vaccinator.widthHint"
  )}; <b>${game.i18n.localize(
    "FALEMOS.vaccinator.height"
  )}</b>: ${game.i18n.localize("FALEMOS.vaccinator.heightHint")}</p>
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
  <label>${game.i18n.localize("FALEMOS.vaccinator.users")}:</label>
  <input type="number" id="nuusers" name="nuusers" value=${numeroJugadores} disabled><br><br>
    <label>${game.i18n.localize("FALEMOS.vaccinator.rows")}:</label>
    <input type="number" id="nRows" name="nRows" min=1 value=${
      slotsOptimo.rows
    }>
    <label>${game.i18n.localize("FALEMOS.vaccinator.columns")}:</label>
    <input type="number" id="nCols" name="nCols" min=1 value=${
      slotsOptimo.columns
    }>
  </div>
  <p class="notes"><b>${game.i18n.localize(
    "FALEMOS.vaccinator.rows"
  )}</b>: ${game.i18n.localize(
    "FALEMOS.vaccinator.rowsHint"
  )}; <b>${game.i18n.localize(
    "FALEMOS.vaccinator.columns"
  )}</b>: ${game.i18n.localize("FALEMOS.vaccinator.columnsHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.gmposition")}:</label>
    <input type="number" id="posgm" name="posgm" min=1 value=1>
    <label>${game.i18n.localize("FALEMOS.vaccinator.emptyslots")}:</label>
    <input type="text" id="huecos" name="huecos" value="${emptySlots}">
	<button id="simular" onclick='simularTabla(document.getElementById("nRows").value,
		document.getElementById("nCols").value,
		document.getElementById("nuusers").value,
		document.getElementById("posgm").value,
		document.getElementById("huecos").value,
		document.getElementById("nombres").value)' type="button">${game.i18n.localize("FALEMOS.vaccinator.simulate")}</button>
  </div>
  <p class="notes"><b>${game.i18n.localize("FALEMOS.vaccinator.gmposition")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.gmpositionHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.emptyslots")}</b>:  ${game.i18n.localize("FALEMOS.vaccinator.emptyslotsHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.simulate")}</b>:  ${game.i18n.localize("FALEMOS.vaccinator.simulateHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.separation")}:</label>
    <input type="number" id="sepmin" name="sepmin" min=0 value=10>
  </div>
  <p class="notes">${game.i18n.localize(
    "FALEMOS.vaccinator.separationHint"
  )}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.frames")}:</label>
    <input type="text" id="marcos" name="marcos" value="">
    <button id="marcosSeleccionar" onclick="selectImageMult()" type="button">${game.i18n.localize(
      "File Path"
    )}</button>
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.framesHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.overlays")}:</label>
    <input type="number" id="oveizq" name="oveizq" min="0" value="0">
    <input type="number" id="ovearr" name="ovearr" min="0" value="0">
    <input type="number" id="oveder" name="oveder" min="0" value="0">
    <input type="number" id="oveaba" name="oveaba" min="0" value="0">
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.overlaysHint")}</p>
  <div class="form-group">
  <label>${game.i18n.localize("FALEMOS.CameraGeometryText")}:</label>
  <select id="geometria" name="geometria">
    <option value="rectangle">${game.i18n.localize(
      "FALEMOS.camera.geometry.rectangle"
    )}</option>
    <option value="circle">${game.i18n.localize(
      "FALEMOS.camera.geometry.circle"
    )}</option>
    <option value="triangle">${game.i18n.localize(
      "FALEMOS.camera.geometry.triangle"
    )}</option>
    <option value="rhombus">${game.i18n.localize(
      "FALEMOS.camera.geometry.rhombus"
    )}</option>
    <option value="hexagon">${game.i18n.localize(
      "FALEMOS.camera.geometry.hexagon"
    )}</option>
    <option value="star">${game.i18n.localize(
      "FALEMOS.camera.geometry.star"
    )}</option>
    <option value="shield">${game.i18n.localize(
      "FALEMOS.camera.geometry.shield"
    )}</option>
  </select>
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.CameraGeometryNotes")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.CameraEffectText")}:</label>
    <select id="efecto" name="efecto">
      <option value="NONE">${game.i18n.localize(
        "FALEMOS.camera.effects.none"
      )}</option>
      <option value="BW">${game.i18n.localize(
        "FALEMOS.camera.effects.bw"
      )}</option>
      <option value="Sepia">${game.i18n.localize(
        "FALEMOS.camera.effects.sepia"
      )}</option>
      <option value="Noise">${game.i18n.localize(
        "FALEMOS.camera.effects.noise"
      )}</option>
      <option value="Warp">${game.i18n.localize(
        "FALEMOS.camera.effects.warp"
      )}</option>
    </select>
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.CameraEffectNotes")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.vaccinator.names")}:</label>
    <input type="text" id="nombres" name="nombres" value="${nombresJugadores}">
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.vaccinator.namesHint")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.CameraNameFontText")}:</label>
	<input type="text" id="fuente" name="fuente" value="url('//db.onlinewebfonts.com/t/fe2027c27b6a24505f548c6fd2e1076d.woff') format('woff')">
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.CameraNameFontNotes")}</p>
  <div class="form-group">
    <label>${game.i18n.localize("FALEMOS.SceneFitText")}:</label>
    <select id="ajuste" name="ajuste">
      <option value="nofit">${game.i18n.localize(
        "FALEMOS.scene.fit.nofit"
      )}</option>
      <option value="cover">${game.i18n.localize(
        "FALEMOS.scene.fit.cover"
      )}</option>
      <option value="contain">${game.i18n.localize(
        "FALEMOS.scene.fit.contain"
      )}</option>
    </select>
  </div>
  <p class="notes">${game.i18n.localize("FALEMOS.SceneFitNotes")}</p>
</form>
`,
  buttons: {
    yes: {
      icon: "<i class='fas fa-check-circle'></i>",
      label: `${game.i18n.localize("FALEMOS.vaccinator.apply")}`,
      callback: () => (applyChanges = true),
    },
    no: {
      icon: "<i class='fas fa-times-circle'></i>",
      label: `${game.i18n.localize("FALEMOS.vaccinator.cancel")}`,
    },
    save: {
      icon: "<i class='fas fa-plus-circle'></i>",
      label: `${game.i18n.localize("FALEMOS.ExportConfigToMacro")}`,
      callback: () => {
        applyChanges = true;
        saveMacro = true;
      },
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
      let marcos = html.find('[name="marcos"]')[0].value;
      let oveizq = html.find('[name="oveizq"]')[0].value || 0;
      let ovearr = html.find('[name="ovearr"]')[0].value || 0;
      let oveder = html.find('[name="oveder"]')[0].value || 0;
      let oveaba = html.find('[name="oveaba"]')[0].value || 0;
      let nombres = html.find('[name="nombres"]')[0].value;
      let geometria = html.find('[name="geometria"]')[0].value;
      let efecto = html.find('[name="efecto"]')[0].value;
      let fuente = html.find('[name="fuente"]')[0].value;
      let ajuste = html.find('[name="ajuste"]')[0].value;

      const idimensiones = [ancho, alto];
      const imargenes = [marizq, mararr, marder, maraba];
      const ioverlays = [oveizq, ovearr, oveder, oveaba];
      const irejilla = [nCols, nRows];
      const iseparacionminima = sepmin;
      const iposiciongm = posgm;
      const ihuecosvaciostxt = huecos.split(",");
      const ihuecosvacios = ihuecosvaciostxt.map((num) => Number(num));
      const inames = nombres.split(",");
      const imarcos = marcos.split(",");

      console.log("---------------------------------");
      console.log("----   Falemos vaccinator   -----");
      console.log("---------------------------------");
      console.log("Dimensiones: " + idimensiones);
      console.log("Márgenes: " + imargenes);
      console.log("Marcos: " + imarcos);
      console.log("Overlays del marco: " + ioverlays);
      console.log("Rejilla: " + irejilla);
      console.log("Separación mínima: " + iseparacionminima);
      console.log("Posición GM: " + iposiciongm);
      console.log("Huecos vacíos: " + ihuecosvacios);
      console.log("Nombres: " + inames);
      console.log("Número de jugadores: " + numeroJugadores);
      console.log("Nombres de jugadores: " + nombresJugadores);

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

      // calculos del tamaño de fuente, en base a la longitud del texto del usuario y el hueco disponible (el ancho del marco)
      const porcNombre = 75;
      let xNombre;
      let yNombre;
      let cName;
      let sNombre;
      let nMarco;
      let sceneData1 = {};

      const ljug = inames.map((num) => num.length);

      inames[0] === "" && inames.length === 1
        ? (sNombre = null)
        : (sNombre =
            ((resultadofinal[0][14] / Math.max(...ljug)) * porcNombre * 2) /
            100);

      for (let i = 0; i < resultadofinal.length; i++) {
        cName = resultadofinal[i][18];

        cName === undefined
          ? (xNombre = null)
          : (xNombre =
              100 * (1 - porcNombre / 100) * 0.5 +
              ((1 - cName.length / Math.max(...ljug)) * porcNombre) / 2);

        cName === undefined
          ? (yNombre = null)
          : (yNombre = 100 + Number(oveaba));

        if (imarcos.length === 1) {
          nMarco = imarcos[0];
        } else {
          i < imarcos.length ? (nMarco = imarcos[i]) : (nMarco = "");
        }

        sceneData1[i.toString()] = {
          x: resultadofinal[i][12],
          y: resultadofinal[i][13],
          width: resultadofinal[i][14],
          overlayImg: nMarco,
          overlayLeft: Number(ioverlays[0]),
          overlayRight: Number(ioverlays[2]),
          overlayTop: Number(ioverlays[1]),
          overlayBottom: Number(ioverlays[3]),
          geometry: geometria,
          filter: efecto,
          cameraName: cName,
          cameraNameOffsetX: xNombre,
          cameraNameOffsetY: yNombre,
          cameraNameFontSize: sNombre,
          cameraNameColor: "#000000",
          cameraNameFont: fuente,
          fit: ajuste,
        };
      }
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
    if (saveMacro) game.falemos.sceneConfigToMacro();
  },
}).render(true);
