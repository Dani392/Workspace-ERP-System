function darDeAltaEmpleado() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaAlta = ss.getSheetByName("ALTA_PERSONAL");
  
 // 1. LEER DATOS DEL FORMULARIO AMPLIADO
  var nombre = hojaAlta.getRange("C4").getValue();
  var apellidos = hojaAlta.getRange("C5").getValue();
  var dni = hojaAlta.getRange("C6").getValue();
  var email = hojaAlta.getRange("C7").getValue();
  var telefono = hojaAlta.getRange("C8").getValue();
  var rol = hojaAlta.getRange("C9").getValue();
  var hContratadas = hojaAlta.getRange("C10").getValue();
  var precioHora = hojaAlta.getRange("C11").getValue();
  var pHoraExtra = hojaAlta.getRange("C12").getValue();
  
  // 2. VALIDACIÓN ESTRICTA (Celdas grises)
  if(nombre === "" || rol === "" || hContratadas === "" || precioHora === "" || pHoraExtra === "") {
    SpreadsheetApp.getUi().alert("❌ Error: Faltan campos obligatorios (los marcados en gris).");
    return; 
  }
  
  // 3. CONFIGURACIÓN DE IDs
  var idPlantilla = "1WuF8vLeEgS_WHUOQ_fTUPQLhkEDRkTeOTNbcOHeYUWk";
  var idCarpeta = "1VLVzVq5FDRSCMjg18tfKi7H0nBi23GmL"; 
  
  // 4. CLONACIÓN DEL ARCHIVO Y PERSONALIZACIÓN PREMIUM
  var plantilla = DriveApp.getFileById(idPlantilla);
  var carpeta = DriveApp.getFolderById(idCarpeta);
  
  var nombreArchivo = "APP - " + nombre + " (" + rol + ")";
  var nuevoArchivo = plantilla.makeCopy(nombreArchivo, carpeta);
  
  var idNuevoArchivo = nuevoArchivo.getId();
  var urlNuevoArchivo = nuevoArchivo.getUrl(); 
  var ssNuevo = SpreadsheetApp.openById(idNuevoArchivo);
  
  var hojaAgenda = ssNuevo.getSheetByName("AGENDA");
  if(hojaAgenda) {
    hojaAgenda.getRange("D1").setValue(nombre.toUpperCase()); 
  }
  
  if(rol === "Trabajador") {
    var hojaGastos = ssNuevo.getSheetByName("GASTOS");
    var hojaDespGastos = ssNuevo.getSheetByName("DESP.GASTOS");
    if(hojaGastos) { ssNuevo.deleteSheet(hojaGastos); }
    if(hojaDespGastos) { ssNuevo.deleteSheet(hojaDespGastos); }
  }
  
  // 5. EL PUENTE (DUPLICAR PLANTILLAS E INYECTAR IMPORTRANGE)
  
  var nombrePestañaHoras = "Horas_" + nombre;
  var plantillaTabHoras = ss.getSheetByName("PLANTILLA_TAB_HORAS");
  var nuevaHojaHoras = plantillaTabHoras.copyTo(ss);
  nuevaHojaHoras.setName(nombrePestañaHoras);
  
  var formulaHoras = '=IMPORTRANGE("' + urlNuevoArchivo + '"; "AGENDA!A:Z")';
  nuevaHojaHoras.getRange("B1").setValue(formulaHoras);
  nuevaHojaHoras.hideSheet();
  
  if(rol === "Responsable") {
    var nombrePestañaGastos = "Gastos_" + nombre;
    var plantillaTabGastos = ss.getSheetByName("PLANTILLA_TAB_GASTOS");
    var nuevaHojaGastos = plantillaTabGastos.copyTo(ss);
    nuevaHojaGastos.setName(nombrePestañaGastos);
    
    var formulaGastos = '=IMPORTRANGE("' + urlNuevoArchivo + '"; "GASTOS!A:H")';
    nuevaHojaGastos.getRange("E1").setValue(formulaGastos); 
    
    var buscadorGastos = nuevaHojaGastos.createTextFinder("PLANTILLA_TAB_HORAS");
    buscadorGastos.matchFormulaText(true);
    buscadorGastos.replaceAllWith("'" + nombrePestañaHoras + "'");
    
    nuevaHojaGastos.hideSheet();
  }
  
  // 6. EL REGISTRO EN EL EQUIPO (FASE 3)
  var hojaEquipo = ss.getSheetByName("EQUIPO");
  var valoresA = hojaEquipo.getRange("A1:A").getValues();
  var ultimaFilaNombres = 0;
  for (var i = 0; i < valoresA.length; i++) {
    if (valoresA[i][0] !== "") {
      ultimaFilaNombres = i + 1;
    }
  }
  
  var filaDestino = ultimaFilaNombres + 1;
  hojaEquipo.insertRowAfter(ultimaFilaNombres);
  var rangoPlantilla = hojaEquipo.getRange("2:2");
  var rangoDestino = hojaEquipo.getRange(filaDestino + ":" + filaDestino);
  rangoPlantilla.copyTo(rangoDestino);
  
  hojaEquipo.getRange(filaDestino, 1).setValue(nombre);       
  hojaEquipo.getRange(filaDestino, 2).setValue(apellidos);    
  hojaEquipo.getRange(filaDestino, 3).setValue(dni);          
  hojaEquipo.getRange(filaDestino, 4).setValue(rol);          
  hojaEquipo.getRange(filaDestino, 5).setValue(telefono);     
  hojaEquipo.getRange(filaDestino, 6).setValue(email);        
  hojaEquipo.getRange(filaDestino, 8).setValue(pHoraExtra);   
  hojaEquipo.getRange(filaDestino, 9).setValue(hContratadas); 
  hojaEquipo.getRange(filaDestino, 10).setValue(precioHora);  
  
  var buscador = rangoDestino.createTextFinder("PLANTILLA_HORAS");
  buscador.matchFormulaText(true); 
  buscador.replaceAllWith(nombrePestañaHoras);

  // 7. ACTUALIZACIÓN AUTOMÁTICA DE LAS QUERYS
  
  // 7.1 QUERY Horas (Corregido a C3)
  var hojaQuery = ss.getSheetByName("QUERY");
  var celdaQuery = hojaQuery.getRange("C3"); 
  var formQuery = celdaQuery.getFormula();
  
  if (formQuery !== "") {
    var nuevaFormQuery = formQuery.replace("};", "; '" + nombrePestañaHoras + "'!A2:E};");
    celdaQuery.setFormula(nuevaFormQuery);
  }

  // 7.2 QUERY Gastos (Preparado para la fórmula con corchetes {})
  if(rol === "Responsable") {
    var hojaQueryGastos = ss.getSheetByName("QUERYGASTOS");
    var celdaQueryGastos = hojaQueryGastos.getRange("B2"); 
    var formQueryGastos = celdaQueryGastos.getFormula();
    
    if (formQueryGastos !== "") {
      var nuevaFormQueryGastos = formQueryGastos.replace("};", "; '" + nombrePestañaGastos + "'!B2:M};");
      celdaQueryGastos.setFormula(nuevaFormQueryGastos);
    }
  }
  
  // 8. LIMPIEZA FINAL
  hojaAlta.getRange("C4:C12").clearContent();
  ss.setActiveSheet(hojaAlta);
  
  SpreadsheetApp.getUi().alert("✅ ¡Alta completada! Archivo creado, Plantillas conectadas, Registro actualizado y Querys unificadas.");
}