// CONFIGURACIÓN INICIAL
const ID_PLANTILLA = "1_gwrNkbF9_dSH55A2L1jSEKVdoSvIz0VVqmDXW_5LRg"; 
const ID_CARPETA_DESTINO = "1ALwK3_buhUId7-4oV0UM6mZaahg57YAA";

function alEditarCasilla(e) {
  if (!e || !e.range) return;
  
  const hoja = e.range.getSheet();
  if (hoja.getName() !== "CLIENTE") return;
  
  const fila = e.range.getRow();
  const columna = e.range.getColumn();
  const valor = e.value;
  
  if (fila < 2 || valor !== "TRUE") return;
  
  // MAGIA MATEMÁTICA: 
  // La casilla PDF de Enero es la 13. Febrero la 23, Marzo la 33...
  // Si le restamos 13 y es múltiplo de 10, sabemos que es un checkbox de PDF.
  if (columna >= 13 && (columna - 13) % 10 === 0) { 
    const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    const indiceMes = (columna - 13) / 10; // 0=Enero, 1=Febrero, etc.
    
    if (indiceMes < 12) {
      crearFacturaDinamica(fila, meses[indiceMes], indiceMes);
      e.range.setValue(false); // Desmarca la casilla
    }
  }
}

function crearFacturaDinamica(fila, mes, indiceMes) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CLIENTE");
  
  // 1. Datos fijos del cliente (Columnas A, B, C)
  const cliente = hoja.getRange("A" + fila).getValue();
  const ivaPorcentaje = Number(hoja.getRange("B" + fila).getValue()) || 0;
  const irpfPorcentaje = Number(hoja.getRange("C" + fila).getValue()) || 0;
  
  if (!cliente) {
    Browser.msgBox("Falta el nombre del cliente en esta fila.");
    return;
  }

  // 2. Localizar las columnas dinámicas según el mes
  // Enero (0) = 4. Febrero (1) = 14...
  const colHoras = 4 + (indiceMes * 10);
  const colTipoCobro = 8 + (indiceMes * 10);
  const colBase = 9 + (indiceMes * 10);
  const colObs = 11 + (indiceMes * 10);

  // Extraer valores usando el número de columna exacto
  const horasReales = hoja.getRange(fila, colHoras).getValue();
  const tipoCobro = hoja.getRange(fila, colTipoCobro).getValue();
  const baseImponible = Number(hoja.getRange(fila, colBase).getValue()) || 0;
  const observaciones = hoja.getRange(fila, colObs).getValue();
  
  SpreadsheetApp.getActiveSpreadsheet().toast("Generando factura para " + cliente + " (" + mes + ")...", "🤖 Procesando");
  
  const archivoPlantilla = DriveApp.getFileById(ID_PLANTILLA);
  const carpetaDestino = DriveApp.getFolderById(ID_CARPETA_DESTINO);
  const copia = archivoPlantilla.makeCopy("Factura_" + cliente + "_" + mes, carpetaDestino);
  const doc = DocumentApp.openById(copia.getId());
  const cuerpo = doc.getBody();
  
  let textoHoras = "";
  let precioUnidad = 0;
  
  if (tipoCobro === "MENSUALIDAD") {
    textoHoras = "Mensualidad";
    precioUnidad = baseImponible;
  } else {
    textoHoras = horasReales.toString();
    precioUnidad = (horasReales > 0) ? (baseImponible / horasReales) : 0;
  }
  
  const importeIva = baseImponible * (ivaPorcentaje / 100);
  const importeIrpf = baseImponible * (irpfPorcentaje / 100);
  const totalPagar = baseImponible + importeIva - importeIrpf;

  const formatearMoneda = (numero) => {
    return numero.toFixed(2).replace(".", ",") + " €";
  };
  
  cuerpo.replaceText("{{NUM_FACTURA}}", "2026-001"); 
  cuerpo.replaceText("{{FECHA}}", Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy"));
  cuerpo.replaceText("{{CLIENTE}}", cliente);
  cuerpo.replaceText("{{NIF_CLIENTE}}", "Pendiente de rellenar"); 
  cuerpo.replaceText("{{MES}}", mes);
  
  cuerpo.replaceText("{{HORAS}}", textoHoras);
  cuerpo.replaceText("{{PRECIO_HORA}}", formatearMoneda(precioUnidad));
  cuerpo.replaceText("{{BASE_IMPONIBLE}}", formatearMoneda(baseImponible));
  
  const textoLineaIva = (ivaPorcentaje > 0) ? "IVA (" + ivaPorcentaje + "%): " + formatearMoneda(importeIva) : "";
  const textoLineaIrpf = (irpfPorcentaje > 0) ? "IRPF (" + irpfPorcentaje + "%): - " + formatearMoneda(importeIrpf) : "";
  
  cuerpo.replaceText("{{LINEA_IVA}}", textoLineaIva);
  cuerpo.replaceText("{{LINEA_IRPF}}", textoLineaIrpf);
  cuerpo.replaceText("{{TOTAL}}", formatearMoneda(totalPagar));
  
  cuerpo.replaceText("{{OBSERVACIONES}}", observaciones ? observaciones.toString() : "Sin observaciones");
  
  doc.saveAndClose();
  const blobPDF = copia.getAs(MimeType.PDF);
  carpetaDestino.createFile(blobPDF).setName("Factura_" + cliente + "_" + mes + ".pdf");
  copia.setTrashed(true);
  
  SpreadsheetApp.getActiveSpreadsheet().toast("¡PDF de " + mes + " guardado en Drive!", "✅ Éxito");
}