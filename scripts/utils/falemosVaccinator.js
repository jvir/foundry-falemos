//
// falemos vaccinator 0.12
// by Viriato139ac
//

// Número de jugadores y listado de nombres

let jugadores = [];
for (let user of game.users.keys()) {
  // console.log(game.users.get(user).data.name)
  jugadores.push(game.users.get(user).data.name);
}
const numeroJugadores = jugadores.length;
const nombresJugadores = jugadores.join();
const numeracionJugadores = Array(jugadores.length).fill().map((element, index) => index + 1).join();

let roles = [];
for (let user of game.users.keys())
  roles.push(game.users.get(user).data.role);
const rolesJugadores = roles.join();

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
for (let i = numeroJugadores + 1; i <= slotsOptimo.slots; i++)
  temp4.push(i);
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

function redondeardec(num) {
  return (Math.round(num * 10000)) / 10000
}

// Esta función calcula las posiciones y anchos de los jugadores óptimas para una composición dada

function falemosCalculator(
  idimensiones,
  imargenes,
  irejilla,
  ioverlays,
  iseparacionminima,
  ihuecosvacios,
  iusers,
  inames,
  iorden) {
  // 1. Lo primero creamos la composición de una rejilla perfecta con los márgenes y overlays que se han establecido

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
      Number(irejilla[i]));
  // console.log(temp1);
  let temp2 = [];
  for (let i = 0; i < coorfin.length; i++)
    temp2.push(
      (temp1[i] * ventanalayout[coorfin.length - i - 1]) / ventanalayout[i]);
  // console.log(temp2);

  const wlayoutoptimo = Math.min(temp1[0], temp2[1]);
  const hlayoutoptimo = Math.min(temp1[1], temp2[0]);
  //console.log("Layout optimo (ancho): " + wlayoutoptimo);
  //console.log("Layout optimo (alto): " + hlayoutoptimo);

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
  //console.log("Ventana final layout: " + ventanafinallayout);
  //console.log("Ventana final: " + ventanafinal);

  let espacios = [];
  for (let i = 0; i < coorfin.length; i++)
    espacios.push(
      (coorfin[i] - coorini[i] - ventanafinallayout[i] * Number(irejilla[i])) /
      (Number(irejilla[i]) + 1));
  //console.log("Espacios: " + espacios);

  const resultado = twoDimensionArray(
      Number(irejilla[0]) * Number(irejilla[1]),
      16);

  let k = 0;
  let l = 0;
  for (let i = 0; i < irejilla[1]; i++) {
    for (let j = 0; j < irejilla[0]; j++) {
      let resultadoi = [
        i + 1,
        j + 1,
        redondeardec(
          coorini[0] +
          espacios[0] * (j + 1) +
          ventanafinallayout[0] * j +
          (ventanafinal[0] * Number(ioverlays[0])) / 100),
        redondeardec(
          coorini[1] +
          espacios[1] * (i + 1) +
          ventanafinallayout[1] * i +
          (ventanafinal[1] * Number(ioverlays[1])) / 100),
        redondeardec(ventanafinal[0]),
        redondeardec(ventanafinal[1]),
        espacios[0],
        espacios[1],
        redondeardec(
          coorini[0] +
          espacios[0] * (j + 1) +
          ventanafinallayout[0] * j +
          (ventanafinal[0] * Number(ioverlays[0])) / 100 -
          (ventanafinal[0] * Number(ioverlays[0])) / 100),
        redondeardec(
          coorini[1] +
          espacios[1] * (i + 1) +
          ventanafinallayout[1] * i +
          (ventanafinal[1] * Number(ioverlays[1])) / 100 -
          (ventanafinal[1] * Number(ioverlays[1])) / 100),
        redondeardec(ventanafinallayout[0]),
        redondeardec(ventanafinallayout[1]),
        redondeardec(
          ((coorini[0] +
              espacios[0] * (j + 1) +
              ventanafinallayout[0] * j +
              (ventanafinal[0] * Number(ioverlays[0])) / 100) /
            Number(idimensiones[0])) *
          100),
        redondeardec(
          ((coorini[1] +
              espacios[1] * (i + 1) +
              ventanafinallayout[1] * i +
              (ventanafinal[1] * Number(ioverlays[1])) / 100) /
            Number(idimensiones[1])) *
          100),
        redondeardec((ventanafinal[0] / Number(idimensiones[0])) * 100),
        redondeardec((ventanafinal[1] / Number(idimensiones[1])) * 100),
      ];

      resultado[k] = resultadoi;
      k++;
    }
  }

  // 2. Ahora añadimos los huecos vacíos que tendrá la composición

  for (var i = 0; i < resultado.length; i++)
    resultado[i].push(ihuecosvacios.every((num) => num !== i + 1));

  let resultadoLibres = resultado.filter((arr) => arr[16] === true);
  let resultadoLibresNulo = [
    0,
    0,
    0,
    0,
    10,
    10,
    10,
    10,
    0,
    0,
    10,
    10,
    -100,
    -100,
    10,
    10,
    false,
  ];

  // 3. Y ahora asignamos nombres y la ordenacion. Los nombres son los que tienen que establecer el orden en el que aparecen en falemos y la variable iorden establece el
  // orden en el lienzo y si aparecen o no (con 0 no aparecen), pero el resultado debe ser que para esos iusers tendrá unos parámetros

  const iordenmax = 1 + Math.max(...iorden);
  let iordenfix = iorden.slice(0, iusers.length);

  iordenfix.forEach(function (item, i) {
    if (item < 1)
      iordenfix[i] = iordenmax;
  });

  if (iusers.length > iordenfix.length)
    iordenfix = iordenfix.concat(
        Array(iusers.length - iordenfix.length).fill(iordenmax));

  var iordenfixindices = new Array(iordenfix.length);
  for (var i = 0; i < iordenfix.length; ++i)
    iordenfixindices[i] = i;
  iordenfixindices.sort(function (a, b) {
    return iordenfix[a] < iordenfix[b]
     ? -1
     : iordenfix[a] > iordenfix[b]
     ? 1
     : 0;
  });
  //console.log(iorden);
  //console.log(iordenfix);
  //console.log(iordenfixindices);
  let inamesfix = inames.slice(0, iusers.length);
  if (iusers.length > inamesfix.length)
    inamesfix = inamesfix.concat(Array(iusers.length - inamesfix.length).fill(""));

  var resultadofinal = new Array(iusers.length);
  for (var i = 0; i < Math.min(resultadoLibres.length, iusers.length); ++i) {
    resultadofinal[iordenfixindices[i]] = resultadoLibres[i].concat(
        iusers[iordenfixindices[i]], inamesfix[iordenfixindices[i]]);
  }
  for (var i = 0; i < resultadofinal.length; ++i) {
    if (resultadofinal[i] === undefined || iordenfix[i] >= iordenmax)
      resultadofinal[i] = resultadoLibresNulo.concat(iusers[i], inamesfix[i]);
  }
  //console.log(resultadofinal);

  return resultadofinal;
}

// Aquí se comienza a definir el formulario de entrada de datos

let applyChanges = false;
let saveCustomMacro = false;
let saveDisableMacro = false;

const myDialogOptions2 = {
  width: 800,
  height: 800,
  top: 500,
  left: 500
};

new Dialog({
  title: `${game.i18n.localize("FALEMOS.vaccinator.title")}`,
  content: `
  <script>
function selectImage() {
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
  <script>
function selectImageMult() {
  const fp2 = new FilePicker({
    type: "image",
    button: "image-picker",
    callback: (url) => {
      $("#marcos").val() === ""
       ? $("#marcos").val(url)
       : $("#marcos").val([$("#marcos").val(), url].join());
    }
  });
  fp2.browse();
}
  </script>
  <script>
function simularTabla(
  nuFilas,
  nuColumnas,
  orden,
  huecos,
  nombres,
  usuarios,
  roles) {

  const irejilla = [nuColumnas, nuFilas];
  const ihuecosvaciostxt = huecos.split(",");
  const ihuecosvacios = ihuecosvaciostxt.map((num) => Number(num));
  const inames = nombres.split(",");
  const iordentxt = orden.split(",");
  const iorden = iordentxt.map((num) => Number(num));
  const iusers = usuarios.split(",");
  const irolestxt = roles.split(",");
  const iroles = irolestxt.map((num) => Number(num));

  let resultado = [];
  for (let i = 0; i < Number(irejilla[0]) * Number(irejilla[1]); i++) {
    for (let j = 0; j < 2; j++) {
      resultado[i] = [];
    }
  }
  for (let i = 0; i < Number(irejilla[0]) * Number(irejilla[1]); i++) {
    for (let j = 0; j < 2; j++) {
      resultado[i][j] = j;
    }
  }

  let k = 0;
  for (let i = 0; i < irejilla[1]; i++) {
    for (let j = 0; j < irejilla[0]; j++) {
      let resultadoi = [
        i + 1,
        j + 1
      ];
      resultado[k] = resultadoi;
      k++;
    }
  }

  for (var i = 0; i < resultado.length; i++)
    resultado[i].push(ihuecosvacios.every((num) => num !== i + 1));

  let resultadoLibres = resultado.filter((arr) => arr[2] === true);
  let resultadoLibresNulo = [
    0,
    0,
    false
  ];

  const iordenmax = 1 + Math.max(...iorden);
  let iordenfix = iorden.slice(0, iusers.length);

  iordenfix.forEach(function (item, i) {
    if (item < 1)
      iordenfix[i] = iordenmax;
  });

  if (iusers.length > iordenfix.length)
    iordenfix = iordenfix.concat(
        Array(iusers.length - iordenfix.length).fill(iordenmax));

  var iordenfixindices = new Array(iordenfix.length);
  for (var i = 0; i < iordenfix.length; ++i)
    iordenfixindices[i] = i;
  iordenfixindices.sort(function (a, b) {
    return iordenfix[a] < iordenfix[b]
     ? -1
     : iordenfix[a] > iordenfix[b]
     ? 1
     : 0;
  });
  let inamesfix = inames.slice(0, iusers.length);
  if (iusers.length > inamesfix.length)
    inamesfix = inamesfix.concat(Array(iusers.length - inamesfix.length).fill(""));

  var resultadofinal = new Array(iusers.length);
  for (var i = 0; i < Math.min(resultadoLibres.length, iusers.length); ++i) {
    resultadofinal[iordenfixindices[i]] = resultadoLibres[i].concat(
        iusers[iordenfixindices[i]], inamesfix[iordenfixindices[i]], iroles[iordenfixindices[i]]);
  }
  for (var i = 0; i < resultadofinal.length; ++i) {
    if (resultadofinal[i] === undefined || iordenfix[i] >= iordenmax)
      resultadofinal[i] = resultadoLibresNulo.concat(iusers[i], inamesfix[i], iroles[i]);
  }

  let datostabla = [];
  for (let i = 0; i < irejilla[1]; i++) {
    for (let j = 0; j < irejilla[0]; j++) {
      let datostablai = resultadofinal.filter((arr) => arr[0] === i + 1 && arr[1] === j + 1)[0];
      if (datostablai === undefined)
        datostablai = [i + 1, j + 1].concat([false, '', '', 0]);
      datostabla.push(datostablai);
    }
  }

  console.log(datostabla);

  let tabla = '<table align="center" style="margin: 0px auto;"">' + '\\n' + '<tbody>\\n';
  k = 0;
  let colorCelda;
  for (let i = 0; i < nuFilas; i++) {
    tabla = tabla + '<tr>\\n';
    for (let j = 0; j < nuColumnas; j++) {
      switch (datostabla[k][5]) {
      case 1:
        colorCelda = "#ffffcc";
        break;
      case 2:
        colorCelda = "#a1dab4";
        break;
      case 3:
        colorCelda = "#41b6c4";
        break;
      case 4:
        colorCelda = "#225ea8";
        break;
      default:
        colorCelda = "#EC7063";
      }
      if (datostabla[k][2] === true) {
        tabla = tabla + '<td style="text-align:center;background-color:' + colorCelda + '">' + 'u: ' + datostabla[k][3] + '</br>n: ' + datostabla[k][4] + '</br>r: ' + datostabla[k][5] + '</td>\\n';
      } else {
        tabla = tabla + '<td style="text-align:center;background-color:' + colorCelda + '">' + '${game.i18n.localize("FALEMOS.vaccinator.simulateEmpty")}' + '</td>\\n';
      }
      k++
    }
    tabla = tabla + '</tr>\\n';
  }
  tabla = tabla + '</tbody>\\n</table>';

  const myDialogOptions1 = {
    width: 640,
    top: 500,
    left: 500
  };

  new Dialog({
    title: '${game.i18n.localize("FALEMOS.vaccinator.simulateTable")}',
    content: tabla,
    buttons: {
      yes: {
        icon: "<i class='fas fa-chevron-circle-left'></i>",
        label: '${game.i18n.localize("FALEMOS.vaccinator.return")}',
      },
    },
  default:
    "yes",
    close: (html) => {},
  }, myDialogOptions1).render(true);
}
  </script>
  <form>
    <style type="text/css">
    .tg  {border-collapse:collapse;border-color:#ccc;border-spacing:0;}
    .tg td{background-color:#fff;border-color:#ccc;border-style:solid;border-width:1px;color:#333;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:2px 2px;word-break:normal;}
    .tg .tg-bzmm{background-color:#34696d;border-color:#ffffff;font-family:"Courier New", Courier, monospace !important;;text-align:left;vertical-align:middle}
    .tg .tg-d6y8{border-color:#efefef;font-family:"Courier New", Courier, monospace !important;;text-align:left;vertical-align:middle}
    .tg .tg-ly6r{border-color:#efefef;text-align:left;vertical-align:middle}
    .tg .tg-r5a9{background-color:#34696d;border-color:#efefef;color:#ffffff;font-family:"Courier New", Courier, monospace !important;;text-align:left;vertical-align:middle}
    .tg .tg-049l{background-color:#f0f0f0;border-color:#efefef;font-family:"Courier New", Courier, monospace !important;;font-size:12px;text-align:left;vertical-align:middle}  
    </style>
    <table class="tg">
    <tbody>
      <tr>
        <td class="tg-r5a9" colspan="10"><span style="color:#FFF"><b>${game.i18n.localize("FALEMOS.vaccinator.canvas")}</b></span></td>
      </tr>
      <tr>
        <td class="tg-d6y8" colspan="2">${game.i18n.localize("FALEMOS.vaccinator.width")}:</td>
        <td class="tg-d6y8" colspan="3"><input type="number" id="ancho" name="ancho" min=1 value=${window.innerWidth}></td>
        <td class="tg-d6y8" colspan="2">${game.i18n.localize("FALEMOS.vaccinator.height")}:</td>
        <td class="tg-d6y8" colspan="3"><input type="number" id="alto" name="alto" min=1 value=${window.innerHeight}></td>
      </tr>
      <tr>
        <td class="tg-d6y8" colspan="6">${game.i18n.localize("FALEMOS.vaccinator.margins")}:</td>
        <td class="tg-d6y8" colspan="1"><input type="number" id="marizq" name="marizq" min=0 value=${document.getElementById("controls").clientWidth}></td>
        <td class="tg-d6y8" colspan="1"><input type="number" id="mararr" name="mararr" min=0 value=${document.getElementById("scene-list") === null ? 50 : document.getElementById("scene-list").clientHeight}></td>
        <td class="tg-d6y8" colspan="1"><input type="number" id="marder" name="marder" min=0 value=${document.getElementById("sidebar").offsetWidth}></td>
        <td class="tg-d6y8" colspan="1"><input type="number" id="maraba" name="maraba" min=0 value=${document.getElementById("macro-list").clientHeight}></td>
      </tr>
      <tr>
        <td class="tg-049l" colspan="10"><b>${game.i18n.localize("FALEMOS.vaccinator.width")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.widthHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.height")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.heightHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.margins")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.marginsHint")}</td>
      </tr>
      <tr>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.HideNavigation")}:</td>
        <td class="tg-d6y8" colspan="1"><input type="checkbox" id="cbnavigation" name="cbnavigation" value="ocultar"></td>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.HideControls")}:</td>
        <td class="tg-d6y8" colspan="1"><input type="checkbox" id="cbcontrols" name="cbcontrols" value="ocultar"></td>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.HidePlayers")}:</td>
		<td class="tg-d6y8" colspan="1"><input type="checkbox" id="cbplayers" name="cbplayers" value="ocultar"></td>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.HideSidebar")}:</td>
        <td class="tg-d6y8" colspan="1"><input type="checkbox" id="cbsidebar" name="cbsidebar" value="ocultar"></td>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.HideHotbar")}:</td>
        <td class="tg-d6y8" colspan="1"><input type="checkbox" id="cbhotbar" name="cbhotbar" value="ocultar"></td>
      </tr>
      <tr>
        <td class="tg-049l" colspan="10">${game.i18n.localize("FALEMOS.vaccinator.hideHint")}</td>
      </tr>
      <tr>
        <td class="tg-r5a9" colspan="10"><span style="color:#FFF"><b>${game.i18n.localize("FALEMOS.vaccinator.world")}</b></span></td>
      </tr>
      <tr>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.vaccinator.users")}:</td>
        <td class="tg-d6y8" colspan="1"><input type="number" id="nuusers" name="nuusers" value=${numeroJugadores} disabled></td>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.vaccinator.rows")}:</td>
        <td class="tg-d6y8" colspan="1"><input type="number" id="nRows" name="nRows" min=1 value=${slotsOptimo.rows}></td>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.vaccinator.columns")}:</td>
        <td class="tg-d6y8" colspan="1"><input type="number" id="nCols" name="nCols" min=1 value=${slotsOptimo.columns}></td>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.vaccinator.emptyslots")}:</td>
        <td class="tg-d6y8" colspan="3"><input type="text" id="huecos" name="huecos" value="${emptySlots}"></td>
      </tr>
      <tr>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.vaccinator.usernames")}:</td>
        <td class="tg-d6y8" colspan="9"><input type="text" id="usuarios" name="usuarios" value="${nombresJugadores}" disabled></td>
      </tr>
      <tr>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.vaccinator.roles")}:</td>
        <td class="tg-d6y8" colspan="3"><input type="text" id="roles" name="roles" value="${rolesJugadores}" disabled></td>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.vaccinator.playerorder")}:</td>
        <td class="tg-d6y8" colspan="3"><input type="text" id="orden" name="orden" value="${numeracionJugadores}"></td>
        <td class="tg-d6y8" colspan="2"><button id="simular" onclick="simularTabla(document.getElementById('nRows').value,
        document.getElementById('nCols').value,
        document.getElementById('orden').value,
        document.getElementById('huecos').value,
        document.getElementById('nombres').value,
        document.getElementById('usuarios').value,
        document.getElementById('roles').value)" type="button">${game.i18n.localize("FALEMOS.vaccinator.simulate")}</button></td>
      </tr>
      <tr>
        <td class="tg-049l" colspan="10">
      <b>${game.i18n.localize("FALEMOS.vaccinator.users")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.usersHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.rows")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.rowsHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.columns")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.columnsHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.emptyslots")}</b>:  ${game.i18n.localize("FALEMOS.vaccinator.emptyslotsHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.usernames")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.usernamesHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.roles")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.rolesHint")} (1: ${game.i18n.localize("USER.RolePlayer")}, 2: ${game.i18n.localize("USER.RoleTrusted")}, 3: ${game.i18n.localize("USER.RoleAssistant")}, 4: ${game.i18n.localize("USER.RoleGamemaster")}); <b>${game.i18n.localize("FALEMOS.vaccinator.playerorder")}</b>:  ${game.i18n.localize("FALEMOS.vaccinator.playerorderHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.simulate")}</b>:  ${game.i18n.localize("FALEMOS.vaccinator.simulateHint")}</td>
      </tr>
      <tr>
        <td class="tg-r5a9" colspan="10"><b>${game.i18n.localize("FALEMOS.vaccinator.layout")}</b></td>
      </tr>
      <tr>
        <td class="tg-d6y8" colspan="2">${game.i18n.localize("FALEMOS.vaccinator.separation")}:</td>
        <td class="tg-d6y8" colspan="2"><input type="number" id="sepmin" name="sepmin" min=0 value=10></td>
        <td class="tg-d6y8" colspan="2">${game.i18n.localize("FALEMOS.vaccinator.overlays")}:</td>
        <td class="tg-d6y8" colspan="1"><input type="number" id="oveizq" name="oveizq" min="0" value="0"></td>
        <td class="tg-d6y8" colspan="1"><input type="number" id="ovearr" name="ovearr" min="0" value="0"></td>
        <td class="tg-d6y8" colspan="1"><input type="number" id="oveder" name="oveder" min="0" value="0"></td>
        <td class="tg-d6y8" colspan="1"><input type="number" id="oveaba" name="oveaba" min="0" value="0"></td>
      </tr>
      <tr>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.vaccinator.names")}:</td>
        <td class="tg-d6y8" colspan="9"><input type="text" id="nombres" name="nombres" value="${nombresJugadores}"></td>
      </tr>
      <tr>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.CameraNameFontText")}:</td>
        <td class="tg-d6y8" colspan="5"><input type="text" id="fuente" name="fuente" value="url('//db.onlinewebfonts.com/t/fe2027c27b6a24505f548c6fd2e1076d.woff2') format('woff2')"></td>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.CameraNameFontSize")}:</td>
        <td class="tg-d6y8" colspan="1"><input type="number" id="fontsize" name="fontsize" min="0" value="2"></td>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.CameraNameColor")}:</td>
        <td class="tg-d6y8" colspan="1"><input type="color" id="namecolor" name="namecolor"></td>
      </tr>
			<tr>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.vaccinator.frames")}:</td>
        <td class="tg-d6y8" colspan="8"><input type="text" id="marcos" name="marcos" value=""></td>
        <td class="tg-d6y8" colspan="1"><button id="marcosSeleccionar" onclick="selectImageMult()" type="button">${game.i18n.localize("File Path")}</button></td>
      </tr>
      <tr>
        <td class="tg-049l" colspan="10"><b>${game.i18n.localize("FALEMOS.vaccinator.separation")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.separationHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.overlays")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.overlaysHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.names")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.namesHint")}; <b>${game.i18n.localize("FALEMOS.CameraNameFontText")}</b>: ${game.i18n.localize("FALEMOS.CameraNameFontNotes")}; <b>${game.i18n.localize("FALEMOS.CameraNameFontSize")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.CameraNameFontSizeHint")}; <b>${game.i18n.localize("FALEMOS.CameraNameColor")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.CameraNameColorHint")}; <b>${game.i18n.localize("FALEMOS.vaccinator.frames")}</b>: ${game.i18n.localize("FALEMOS.vaccinator.framesHint")}</td>
      </tr>  
      <tr>
        <td class="tg-r5a9" colspan="10"><b>${game.i18n.localize("FALEMOS.vaccinator.othersettings")}</b></td>
      </tr>
      <tr>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.CameraGeometryText")}:</td>
        <td class="tg-d6y8" colspan="2"><select id="geometria" name="geometria">
        <option value="rectangle">${game.i18n.localize("FALEMOS.camera.geometry.rectangle")}</option>
        <option value="circle">${game.i18n.localize("FALEMOS.camera.geometry.circle")}</option>
        <option value="triangle">${game.i18n.localize("FALEMOS.camera.geometry.triangle")}</option>
        <option value="rhombus">${game.i18n.localize("FALEMOS.camera.geometry.rhombus")}</option>
        <option value="hexagon">${game.i18n.localize("FALEMOS.camera.geometry.hexagon")}</option>
        <option value="star">${game.i18n.localize("FALEMOS.camera.geometry.star")}</option>
        <option value="shield">${game.i18n.localize("FALEMOS.camera.geometry.shield")}</option>
      </select></td>
        <td class="tg-d6y8" colspan="1">${game.i18n.localize("FALEMOS.CameraEffectText")}:</td>
        <td class="tg-d6y8" colspan="2"><select id="efecto" name="efecto">
          <option value="NONE">${game.i18n.localize("FALEMOS.camera.effects.none")}</option>
          <option value="BW">${game.i18n.localize("FALEMOS.camera.effects.bw")}</option>
          <option value="Sepia">${game.i18n.localize("FALEMOS.camera.effects.sepia")}</option>
          <option value="Noise">${game.i18n.localize("FALEMOS.camera.effects.noise")}</option>
          <option value="Warp">${game.i18n.localize("FALEMOS.camera.effects.warp")}</option>
          <option value="Blue">${game.i18n.localize("FALEMOS.camera.effects.blue")}</option>
          <option value="Red">${game.i18n.localize("FALEMOS.camera.effects.red")}</option>
          <option value="Edges">${game.i18n.localize("FALEMOS.camera.effects.edges")}</option>
          <option value="Green">${game.i18n.localize("FALEMOS.camera.effects.green")}</option>
        </select></td>
        <td class="tg-d6y8" colspan="2">${game.i18n.localize("FALEMOS.SceneFitText")}:</td>
        <td class="tg-d6y8" colspan="2"><select id="ajuste" name="ajuste">
          <option value="nofit">${game.i18n.localize("FALEMOS.scene.fit.nofit")}</option>
          <option value="cover">${game.i18n.localize("FALEMOS.scene.fit.cover")}</option>
          <option value="contain">${game.i18n.localize("FALEMOS.scene.fit.contain")}</option>
        </select></td>
      </tr>
      <tr>
        <td class="tg-049l" colspan="10"><b>${game.i18n.localize("FALEMOS.CameraGeometryText")}</b>: ${game.i18n.localize("FALEMOS.CameraGeometryNotes")}; <b>${game.i18n.localize("FALEMOS.CameraEffectText")}</b>: ${game.i18n.localize("FALEMOS.CameraEffectNotes")}; <b>${game.i18n.localize("FALEMOS.SceneFitText")}</b>: ${game.i18n.localize("FALEMOS.SceneFitNotes")}</td>
      </tr>    
    </tbody>
    </table>
  </form>
  `,
  buttons: {
    apply: {
      icon: "<i class='fas fa-check-circle'></i>",
      label: `${game.i18n.localize("FALEMOS.vaccinator.apply")}`,
      callback: () => {
        applyChanges = true;
        saveCustomMacro = false;
        saveDisableMacro = false;
      },
    },
    macrocustom: {
      icon: "<i class='fas fa-plus-circle'></i>",
      label: `${game.i18n.localize("FALEMOS.vaccinator.ExportCustomToMacro")}`,
      callback: () => {
        applyChanges = true;
        saveCustomMacro = true;
        saveDisableMacro = false;
      },
    },
    macrodisable: {
      icon: "<i class='fas fa-minus-circle'></i>",
      label: `${game.i18n.localize("FALEMOS.vaccinator.ExportDisableToMacro")}`,
      callback: () => {
        applyChanges = false;
        saveCustomMacro = false;
        saveDisableMacro = true;
      },
    },
    cancel: {
      icon: "<i class='fas fa-times-circle'></i>",
      label: `${game.i18n.localize("FALEMOS.vaccinator.cancel")}`,
      callback: () => {
        applyChanges = false;
        saveCustomMacro = false;
        saveDisableMacro = false;
      },
    },
  },
default:
  "cancel",
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
      let orden = html.find('[name="orden"]')[0].value || 1;
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
      let fontsize = html.find('[name="fontsize"]')[0].value;
      let namecolor = html.find('[name="namecolor"]')[0].value;
	  
      const idimensiones = [ancho, alto];
      const imargenes = [marizq, mararr, marder, maraba];
      const ioverlays = [oveizq, ovearr, oveder, oveaba];
      const irejilla = [nCols, nRows];
      const iseparacionminima = sepmin;
      const iordentxt = orden.split(",");
      const iorden = iordentxt.map((num) => Number(num));
      const ihuecosvaciostxt = huecos.split(",");
      const ihuecosvacios = ihuecosvaciostxt.map((num) => Number(num));
      const inames = nombres.split(",");
      const imarcos = marcos.split(",");

      let iusers = [];
      for (let user of game.users.keys()) {
        // console.log(game.users.get(user).data.name)
        iusers.push(game.users.get(user).data.name);
      }

      console.log("---------------------------------");
      console.log("----   Falemos vaccinator   -----");
      console.log("---------------------------------");
      console.log("Dimensiones: " + idimensiones);
      console.log("Márgenes: " + imargenes);
      console.log("Rejilla: " + irejilla);
      console.log("Overlays del marco: " + ioverlays);
      console.log("Separación mínima: " + iseparacionminima);
      console.log("Marcos: " + imarcos);
      console.log("Huecos vacíos: " + ihuecosvacios);
      console.log("Usuarios: " + iusers);
      console.log("Nombres: " + inames);
      console.log("Orden jugadores: " + iorden);
      console.log("Número de jugadores: " + numeroJugadores);
      console.log("Nombres de jugadores: " + nombresJugadores);
	  
	    console.log("Ocultar navegación: " + html.find('[name="cbnavigation"]')[0].checked);
	    console.log("Ocultar controles: " + html.find('[name="cbcontrols"]')[0].checked);
	    console.log("Ocultar jugadores: " + html.find('[name="cbplayers"]')[0].checked);
	    console.log("Ocultar barra: " + html.find('[name="cbsidebar"]')[0].checked);
	    console.log("Ocultar atajos: " + html.find('[name="cbhotbar"]')[0].checked);

      console.log("---------------------------------");

      let resultadofinal = falemosCalculator(
          idimensiones,
          imargenes,
          irejilla,
          ioverlays,
          iseparacionminima,
          ihuecosvacios,
          iusers,
          inames,
          iorden);

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

      let newfontsize;
      fontsize === "0" || fontsize === ""
       ? (newfontsize = sNombre)
       : (newfontsize = fontsize);

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
          cameraNameFontSize: newfontsize,
          cameraNameColor: namecolor,
          cameraNameFont: fuente,
          fit: ajuste,
        };
      }
	  
      let sceneData2 = {
        enable: true,
        hide: {
          navigation: html.find('[name="cbnavigation"]')[0].checked,
          controls: html.find('[name="cbcontrols"]')[0].checked,
          players: html.find('[name="cbplayers"]')[0].checked,
          sidebar: html.find('[name="cbsidebar"]')[0].checked,
          hotbar: html.find('[name="cbhotbar"]')[0].checked,
        },
      };

      let sceneData = {
        ...sceneData1,
        ...sceneData2
      };

      console.log("Datos de la escena:");
      console.log(sceneData);
      console.log("---------------------------------");
      console.log("---------------------------------");

      game.falemos.putSceneConfig(null, JSON.stringify(sceneData));
      if (saveCustomMacro)
        game.falemos.sceneConfigToMacro(game.scenes.viewed.data._id, sceneData);
    }
    if (saveDisableMacro) {
      let sceneDataDisable = {
        enable: false,
        hide: {
          navigation: false,
          controls: false,
          players: false,
          sidebar: false,
          hotbar: false,
        },
      };
	  
      console.log("Datos de la escena:");
      console.log(sceneDataDisable);
      console.log("---------------------------------");
      console.log("---------------------------------");
      game.falemos.sceneConfigToMacro(game.scenes.viewed.data._id, sceneDataDisable);
    }
  },
}, myDialogOptions2).render(true);
