const ATHLETES=[{id:'mauricio',name:'Mauricio',avatar:'🏔',races:[]}];

// ── Multi-race helpers ──────────────────────────────────────
function getAllRaces(){
  return S.get('tw_races')||[];
}
function getActiveRaceId(){
  const saved=S.get('tw_last_rid');
  if(saved) return saved;
  const all=getAllRaces();
  const today=new Date();
  const upcoming=all.filter(r=>new Date(r.date)>=today);
  return upcoming.length?upcoming[0].id:all[all.length-1]?.id;
}
function getRaceById(rid){
  return getAllRaces().find(r=>r.id===rid);
}

function W(id,date,label,session,type,km,desc,opts={}){
  return {id,date,label,session,type,km,desc,...opts};
}
function F(id,date,label,session,sets,desc,exercises){
  return {id,date,label,session,type:'FUERZA',km:0,sets,desc,exercises};
}

function buildWeeks(){return [
  {num:1,dates:"19–22 Feb",phase:"BASE",totalKm:24,days:[
    W("w1d0","2026-02-19","Jue 19 Feb","Rodaje suave trail","SUAVE",8,"Terreno natural, 6:40/km. Activa piernas. 5min caminata de calentamiento."),
    F("w1d1","2026-02-20","Vie 20 Feb","Fuerza – Tren inferior",3,"Semana 1. Establece técnica correcta en todos los movimientos.",[
      {name:"Sentadilla",reps:"12"},{name:"Estocada",reps:"12 c/lado"},{name:"Peso muerto rumano",reps:"12"},
      {name:"Elevación de talón",reps:"20"},{name:"Plancha",reps:"30 seg"},{name:"Bird-dog",reps:"10 c/lado"}]),
    W("w1d2","2026-02-21","Sáb 21 Feb","Trail con desnivel","MEDIO",12,"400m D+. Sube caminando pendientes >10%. Baja controlado."),
    W("w1d3","2026-02-22","Dom 22 Feb","Recuperación activa","SUAVE",4,"7:00/km. Terreno plano. Corto e indoloro."),
  ]},
  {num:2,dates:"23 Feb – 1 Mar",phase:"BASE",totalKm:35,days:[
    F("w2d0","2026-02-23","Lun 23 Feb","Fuerza – Superior + core",3,"Tren superior y core. Base para mantener postura en largos.",[
      {name:"Press inclinado",reps:"12"},{name:"Remo con mancuerna",reps:"12 c/lado"},
      {name:"Fondos",reps:"10"},{name:"Plancha",reps:"40 seg"},{name:"Dead bug",reps:"10 c/lado"}]),
    W("w2d1","2026-02-24","Mar 24 Feb","Descanso","DESCANSO",0,"Descanso activo o movilidad 20min."),
    W("w2d2","2026-02-25","Mié 25 Feb","Intervalos por tiempo","INTENSO",10,"WU 10min → 6×(3min a 5:00/km / 2min trote) → CD 10min."),
    W("w2d3","2026-02-26","Jue 26 Feb","Descanso","DESCANSO",0,"Descanso."),
    W("w2d4","2026-02-27","Vie 27 Feb","Rodaje suave","SUAVE",11,"6:40/km. Terreno mixto. Hidratación con mochila."),
    W("w2d5","2026-02-28","Sáb 28 Feb","Descanso","DESCANSO",0,"Descanso."),
    W("w2d6","2026-03-01","Dom 1 Mar","Largo trail 14km","MEDIO",14,"500m D+. ~2h en pie. Camina pendientes. Practica nutrición en ruta."),
  ]},
  {num:3,dates:"2–8 Mar",phase:"BASE",totalKm:46,days:[
    F("w3d0","2026-03-02","Lun 2 Mar","Fuerza – Tren inferior",3,"Añade carga. Foco en tobillo y estabilidad unilateral.",[
      {name:"Sentadilla búlgara",reps:"10 c/lado"},{name:"Hip thrust",reps:"12"},
      {name:"Plancha lateral",reps:"30 seg c/lado"},{name:"Trabajo de tobillo",reps:"15 c/dir."},{name:"Propioceptivo",reps:"30 seg c/pie"}]),
    W("w3d1","2026-03-03","Mar 3 Mar","Rodaje suave","SUAVE",8,"6:40/km. Primer trote de la semana. Piernas sueltas."),
    W("w3d2","2026-03-04","Mié 4 Mar","Intervalos","INTENSO",10,"WU 10min → 6×(3min a 5:00/km / 2min trote) → CD 10min."),
    W("w3d3","2026-03-05","Jue 5 Mar","Rodaje suave","SUAVE",8,"6:40/km. Terreno variado. Mantén conversación fluida."),
    W("w3d4","2026-03-06","Vie 6 Mar","Rodaje recuperación","SUAVE",6,"6:50/km. Corto y suave. Prepara piernas para el largo."),
    W("w3d5","2026-03-07","Sáb 7 Mar","Largo trail 16km","INTENSO",16,"650m D+. Busca tierra húmeda. Prueba zapatillas definitivas."),
    W("w3d6","2026-03-08","Dom 8 Mar","Descanso","DESCANSO",0,"Descanso completo o caminata 20min."),
  ]},
  {num:4,dates:"9–15 Mar",phase:"RECUPERACIÓN",totalKm:38,days:[
    W("w4d0","2026-03-09","Lun 9 Mar","Rodaje suave","SUAVE",8,"Semana de recuperación. 6:50/km. Sin presión."),
    W("w4d1","2026-03-10","Mar 10 Mar","Repeticiones","INTENSO",9,"WU 10min → 5×(3min a 5:00/km / 2min trote) → CD 10min."),
    W("w4d2","2026-03-11","Mié 11 Mar","Descanso","DESCANSO",0,"Descanso activo: caminata, estiramientos, foam roller."),
    W("w4d3","2026-03-12","Jue 12 Mar","Rodaje suave","SUAVE",9,"6:40/km. Terreno moderado."),
    W("w4d4","2026-03-13","Vie 13 Mar","Largo trail 13km","MEDIO",13,"500m D+. Largo moderado. Ritmo cómodo."),
    F("w4d5","2026-03-14","Sáb 14 Mar","Fuerza – Movilidad",2,"Reduce carga 40%. Foco total en movilidad y recuperación.",[
      {name:"Movilidad de cadera",reps:"10 c/dir."},{name:"Movilidad de tobillos",reps:"10 c/dir."},
      {name:"Movilidad de espalda",reps:"10 c/lado"},{name:"Foam roller",reps:"60 seg/zona"},{name:"Estiramientos",reps:"30 seg c/u"}]),
    W("w4d6","2026-03-15","Dom 15 Mar","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:5,dates:"16–22 Mar",phase:"DESARROLLO",totalKm:55,days:[
    F("w5d0","2026-03-16","Lun 16 Mar","Fuerza – Tren inferior",3,"Progresa en carga. Propioceptivo en superficie inestable.",[
      {name:"Sentadilla búlgara",reps:"10 c/lado"},{name:"Hip thrust",reps:"12"},{name:"Peso muerto rumano",reps:"10"},
      {name:"Propioceptivo",reps:"40 seg c/pie"},{name:"Paso de valla lateral",reps:"10 c/lado"},{name:"Plancha",reps:"45 seg"}]),
    W("w5d1","2026-03-17","Mar 17 Mar","Intervalos","INTENSO",11,"WU 10min → 7×(3min a 5:00/km / 90seg trote) → CD 10min."),
    W("w5d2","2026-03-18","Mié 18 Mar","Rodaje suave","SUAVE",10,"6:40/km. Terreno trail. Trabaja postura en bajadas."),
    W("w5d3","2026-03-19","Jue 19 Mar","Tempo","MEDIO",11,"WU 10min → 2×10min a 5:15/km con 3min pausa → CD 10min."),
    W("w5d4","2026-03-20","Vie 20 Mar","Rodaje recuperación","SUAVE",6,"6:50/km. Corto y suelto."),
    W("w5d5","2026-03-21","Sáb 21 Mar","Largo trail 20km","INTENSO",20,"800m D+. Primer 20km. Practica nutrición en ruta."),
    W("w5d6","2026-03-22","Dom 22 Mar","Descanso","DESCANSO",0,"Descanso. Piernas en alto 15min."),
  ]},
  {num:6,dates:"23–29 Mar",phase:"DESARROLLO",totalKm:50,days:[
    W("w6d0","2026-03-23","Lun 23 Mar","Rodaje suave","SUAVE",10,"6:40/km. Piernas activas tras el 20km del sábado."),
    W("w6d1","2026-03-24","Mar 24 Mar","Repeticiones","INTENSO",12,"WU 10min → 3×10min a 5:10/km con 3min pausa → CD 10min."),
    W("w6d2","2026-03-25","Mié 25 Mar","Descanso","DESCANSO",0,"Descanso activo. Movilidad 20min."),
    W("w6d3","2026-03-26","Jue 26 Mar","Rodaje suave","SUAVE",10,"6:40/km. Terreno mojado si posible."),
    W("w6d4","2026-03-27","Vie 27 Mar","Largo trail 18km","INTENSO",18,"800m D+. Ritmo cómodo. Entrena nutrición en movimiento."),
    F("w6d5","2026-03-28","Sáb 28 Mar","Fuerza – Full body",4,"Circuito funcional. 4 rondas, 90seg entre rondas.",[
      {name:"Sentadilla goblet",reps:"15"},{name:"Press de hombro",reps:"12"},{name:"Remo",reps:"12"},
      {name:"Core antirotación",reps:"10 c/lado"},{name:"Lunge con salto",reps:"8 c/lado"}]),
    W("w6d6","2026-03-29","Dom 29 Mar","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:7,dates:"30 Mar – 5 Abr",phase:"DESARROLLO",totalKm:62,days:[
    F("w7d0","2026-03-30","Lun 30 Mar","Fuerza – Glúteos",4,"Énfasis en glúteos y estabilizadores de rodilla. Progresa en carga.",[
      {name:"Box step-up",reps:"10 c/lado"},{name:"Hip thrust",reps:"10"},{name:"Sentadilla búlgara",reps:"10 c/lado"},
      {name:"Plancha lateral",reps:"40 seg c/lado"},{name:"Trabajo de tobillo",reps:"15 c/dir."}]),
    W("w7d1","2026-03-31","Mar 31 Mar","Intervalos largos","INTENSO",12,"WU 10min → 5×(4min a 5:05/km / 2min trote) → CD 10min."),
    W("w7d2","2026-04-01","Mié 1 Abr","Rodaje suave","SUAVE",11,"6:40/km. 4–5 acelerones de 30seg al final."),
    W("w7d3","2026-04-02","Jue 2 Abr","Tempo","MEDIO",12,"WU 10min → 2×12min a 5:10/km con 4min pausa → CD 10min."),
    W("w7d4","2026-04-03","Vie 3 Abr","Rodaje recuperación","SUAVE",7,"6:50/km. Suave. Prepara piernas para el largo."),
    W("w7d5","2026-04-04","Sáb 4 Abr","Largo trail 23km","INTENSO",23,"1050m D+. Sale temprano. Bastones si los usarás en carrera."),
    W("w7d6","2026-04-05","Dom 5 Abr","Descanso","DESCANSO",0,"Descanso. Nutrición de recuperación."),
  ]},
  {num:8,dates:"6–12 Abr",phase:"RECUPERACIÓN",totalKm:40,days:[
    W("w8d0","2026-04-06","Lun 6 Abr","Rodaje suave","SUAVE",9,"Semana de recuperación. 6:50/km."),
    W("w8d1","2026-04-07","Mar 7 Abr","Repeticiones suaves","INTENSO",10,"WU 10min → 4×(3min a 5:10/km / 2min trote) → CD 10min."),
    W("w8d2","2026-04-08","Mié 8 Abr","Descanso","DESCANSO",0,"Descanso. Movilidad articular 20min."),
    W("w8d3","2026-04-09","Jue 9 Abr","Rodaje suave","SUAVE",9,"6:40/km. Técnica de zancada."),
    W("w8d4","2026-04-10","Vie 10 Abr","Largo trail 14km","MEDIO",14,"550m D+. Largo de recuperación. Ritmo cómodo."),
    F("w8d5","2026-04-11","Sáb 11 Abr","Fuerza – Movilidad",2,"Reduce 40%. Yoga y cadena posterior.",[
      {name:"Yoga/movilidad",reps:"10 min"},{name:"Foam roller",reps:"60 seg/zona"},
      {name:"Movilidad de cadera",reps:"10 c/dir."},{name:"Estiramientos",reps:"40 seg c/u"}]),
    W("w8d6","2026-04-12","Dom 12 Abr","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:9,dates:"13–19 Abr",phase:"PEAK",totalKm:66,days:[
    F("w9d0","2026-04-13","Lun 13 Abr","Fuerza – Potencia",4,"Explosividad para subidas. 2min descanso entre series.",[
      {name:"Sentadilla explosiva",reps:"6"},{name:"Salto al cajón",reps:"6"},{name:"Hip thrust",reps:"8"},
      {name:"Lunge con salto",reps:"6 c/lado"},{name:"Plancha",reps:"50 seg"}]),
    W("w9d1","2026-04-14","Mar 14 Abr","Intervalos","INTENSO",13,"WU 10min → 6×(4min a 5:00/km / 2min trote) → CD 10min."),
    W("w9d2","2026-04-15","Mié 15 Abr","Rodaje suave","SUAVE",12,"6:40/km. Terreno trail. Gestiona el ritmo."),
    W("w9d3","2026-04-16","Jue 16 Abr","Tempo trail","MEDIO",13,"WU 10min → 2×14min a 5:10/km → CD 10min."),
    W("w9d4","2026-04-17","Vie 17 Abr","Rodaje recuperación","SUAVE",7,"6:50/km. Suave."),
    W("w9d5","2026-04-18","Sáb 18 Abr","Largo trail 26km","INTENSO",26,"1200m D+. Simula barro. Trabaja técnica de bajada."),
    W("w9d6","2026-04-19","Dom 19 Abr","Descanso","DESCANSO",0,"Descanso. Hidratación y nutrición."),
  ]},
  {num:10,dates:"20–26 Abr",phase:"PEAK",totalKm:55,days:[
    W("w10d0","2026-04-20","Lun 20 Abr","Rodaje suave","SUAVE",12,"6:40/km. Recupera del 26km."),
    W("w10d1","2026-04-21","Mar 21 Abr","Repeticiones largas","INTENSO",14,"WU 10min → 4×(6min a 5:00/km / 2min trote) → CD 10min."),
    W("w10d2","2026-04-22","Mié 22 Abr","Descanso","DESCANSO",0,"Descanso activo. Core en casa 20min."),
    W("w10d3","2026-04-23","Jue 23 Abr","Rodaje suave","SUAVE",12,"6:40/km. Evalúa fatiga acumulada."),
    W("w10d4","2026-04-24","Vie 24 Abr","Largo trail 22km","INTENSO",22,"1000m D+. Camina pendientes >12%."),
    F("w10d5","2026-04-25","Sáb 25 Abr","Fuerza – Full body",4,"Circuito con core en inestabilidad.",[
      {name:"Sentadilla goblet",reps:"12"},{name:"Remo",reps:"12"},{name:"Hip thrust",reps:"10"},
      {name:"Core antirotación",reps:"10 c/lado"},{name:"Propioceptivo",reps:"40 seg c/pie"}]),
    W("w10d6","2026-04-26","Dom 26 Abr","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:11,dates:"27 Abr – 3 May",phase:"PEAK",totalKm:73,days:[
    F("w11d0","2026-04-27","Lun 27 Abr","Fuerza – Tren inferior",4,"Último bloque de alta carga. Consolida base muscular.",[
      {name:"Sentadilla búlgara",reps:"8 c/lado"},{name:"Hip thrust",reps:"8"},{name:"Peso muerto rumano",reps:"8"},
      {name:"Trabajo de tobillo",reps:"20 c/dir."},{name:"Plancha lateral",reps:"45 seg c/lado"}]),
    W("w11d1","2026-04-28","Mar 28 Abr","Intervalos específicos","INTENSO",13,"WU 10min → 5×(5min a 5:00/km / 2min trote) → CD 10min."),
    W("w11d2","2026-04-29","Mié 29 Abr","Rodaje suave","SUAVE",13,"6:40/km. Terreno trail."),
    W("w11d3","2026-04-30","Jue 30 Abr","Tempo","MEDIO",13,"WU 10min → 3×12min a 5:10/km → CD 10min."),
    W("w11d4","2026-05-01","Vie 1 May","Rodaje recuperación","SUAVE",9,"6:50/km. Sin sobrecargar víspera del largo."),
    W("w11d5","2026-05-02","Sáb 2 May","Largo trail 29km","INTENSO",29,"1350m D+. Equipo de carrera completo. Nutrición c/45–60min."),
    W("w11d6","2026-05-03","Dom 3 May","Descanso","DESCANSO",0,"Descanso. Piernas en alto. Proteína."),
  ]},
  {num:12,dates:"4–10 May",phase:"RECUPERACIÓN",totalKm:46,days:[
    W("w12d0","2026-05-04","Lun 4 May","Rodaje suave","SUAVE",10,"Semana de recuperación. 6:50/km."),
    W("w12d1","2026-05-05","Mar 5 May","Repeticiones suaves","INTENSO",11,"WU 10min → 4×(4min a 5:10/km / 2min trote) → CD 10min."),
    W("w12d2","2026-05-06","Mié 6 May","Descanso","DESCANSO",0,"Descanso. Regeneración muscular."),
    W("w12d3","2026-05-07","Jue 7 May","Rodaje suave","SUAVE",11,"6:40/km. Terreno moderado."),
    W("w12d4","2026-05-08","Vie 8 May","Largo trail 16km","MEDIO",16,"650m D+. Largo moderado. Revisión de equipo."),
    F("w12d5","2026-05-09","Sáb 9 May","Fuerza ligera",2,"Semana de recuperación. Reduce 50%. Movilidad completa.",[
      {name:"Movilidad de cadera",reps:"12 c/dir."},{name:"Foam roller",reps:"60 seg/zona"},
      {name:"Estiramientos",reps:"40 seg c/u"},{name:"Activación de glúteo",reps:"15 c/lado"}]),
    W("w12d6","2026-05-10","Dom 10 May","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:13,dates:"11–17 May",phase:"PEAK",totalKm:76,days:[
    F("w13d0","2026-05-11","Lun 11 May","Fuerza – Mantenimiento",3,"Mantén el estímulo sin agotar. Carga moderada.",[
      {name:"Sentadilla",reps:"10"},{name:"Press de hombro",reps:"10"},{name:"Remo",reps:"10"},
      {name:"Core antirotación",reps:"10 c/lado"},{name:"Bird-dog",reps:"10 c/lado"}]),
    W("w13d1","2026-05-12","Mar 12 May","Intervalos","INTENSO",14,"WU 10min → 5×(5min a 5:00/km / 2min trote) → CD 10min."),
    W("w13d2","2026-05-13","Mié 13 May","Rodaje suave","SUAVE",13,"6:40/km. Trail con desnivel suave."),
    W("w13d3","2026-05-14","Jue 14 May","Tempo específico trail","MEDIO",14,"WU 10min → 3×14min a 5:10/km → CD 10min."),
    W("w13d4","2026-05-15","Vie 15 May","Rodaje recuperación","SUAVE",9,"6:50/km. Suave y suelto."),
    W("w13d5","2026-05-16","Sáb 16 May","Largo trail 32km","INTENSO",32,"1450m D+. Primer 32km. Ultra conservador los primeros 10km."),
    W("w13d6","2026-05-17","Dom 17 May","Descanso","DESCANSO",0,"Descanso completo. Recuperación absoluta."),
  ]},
  {num:14,dates:"18–24 May",phase:"PEAK",totalKm:57,days:[
    W("w14d0","2026-05-18","Lun 18 May","Rodaje suave","SUAVE",13,"6:40/km. Movimiento suave tras el 32km."),
    W("w14d1","2026-05-19","Mar 19 May","Repeticiones largas","INTENSO",14,"WU 10min → 4×(6min a 5:00/km / 2min trote) → CD 10min."),
    W("w14d2","2026-05-20","Mié 20 May","Descanso","DESCANSO",0,"Descanso activo. Movilidad de cadera y tobillos."),
    W("w14d3","2026-05-21","Jue 21 May","Rodaje suave","SUAVE",13,"6:40/km. Trail. Mantén consistencia."),
    W("w14d4","2026-05-22","Vie 22 May","Largo trail 26km","INTENSO",26,"1200m D+. Sale conservador. Última larga antes del peak."),
    F("w14d5","2026-05-23","Sáb 23 May","Fuerza – Core",3,"Core fuerte para los 44km. Sin fatiga.",[
      {name:"Core antirotación",reps:"12 c/lado"},{name:"Plancha",reps:"60 seg"},{name:"Dead bug",reps:"10 c/lado"},
      {name:"Bird-dog",reps:"10 c/lado"},{name:"Activación de glúteo",reps:"15 c/lado"}]),
    W("w14d6","2026-05-24","Dom 24 May","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:15,dates:"25–31 May",phase:"PEAK 🔺",totalKm:78,days:[
    F("w15d0","2026-05-25","Lun 25 May","Fuerza – Mantenimiento",3,"Última sesión de alta intensidad del plan. Después solo correr.",[
      {name:"Sentadilla",reps:"10"},{name:"Hip thrust",reps:"10"},{name:"Peso muerto rumano",reps:"8"},
      {name:"Core antirotación",reps:"10 c/lado"}]),
    W("w15d1","2026-05-26","Mar 26 May","Intervalos cortos","INTENSO",13,"WU 10min → 5×(4min a 5:00/km / 2min trote) → CD 10min."),
    W("w15d2","2026-05-27","Mié 27 May","Rodaje suave","SUAVE",12,"6:40/km. Trail. Suave y controlado."),
    W("w15d3","2026-05-28","Jue 28 May","Rodaje suave-medio","MEDIO",10,"No exprimas. El largo del sábado es el objetivo."),
    W("w15d4","2026-05-29","Vie 29 May","Rodaje recuperación","SUAVE",8,"6:50/km. Muy suave. Últimos pasos antes del peak."),
    W("w15d5","2026-05-30","Sáb 30 May 🔺","PEAK – Largo 35km","INTENSO",35,"1500m D+. Sale al 70% los primeros 15km. Equipo completo, nutrición c/45min."),
    W("w15d6","2026-05-31","Dom 31 May","Descanso absoluto","DESCANSO",0,"Inicio del taper. Hidratación y sueño prioridad."),
  ]},
  {num:16,dates:"1–7 Jun",phase:"TAPER",totalKm:46,days:[
    W("w16d0","2026-06-01","Lun 1 Jun","Rodaje suave","SUAVE",11,"Primer día de taper. 6:40/km."),
    W("w16d1","2026-06-02","Mar 2 Jun","Repeticiones taper","MEDIO",11,"WU 10min → 2×10min a ritmo umbral → CD 10min."),
    W("w16d2","2026-06-03","Mié 3 Jun","Descanso","DESCANSO",0,"Descanso activo. Repasa logística de carrera."),
    W("w16d3","2026-06-04","Jue 4 Jun","Rodaje suave","SUAVE",11,"6:40/km."),
    W("w16d4","2026-06-05","Vie 5 Jun","Trail plano + cerro","MEDIO",14,"~500m D+. Primer retorno post-lesión. Límite Z2-Z3 (143-148 bpm). Bajadas muy controladas, paso corto."),
    W("w16d5","2026-06-06","Sáb 6 Jun","Bici estática + activación","SUAVE",0,"🚲 35min bici estática Z1 (<131 bpm), cadencia suave — equivalente al rodaje de recuperación. Luego activación: sentadilla 10r, glúteo 15r c/lado, tobillo 15r, core 5min."),
    W("w16d6","2026-06-07","Dom 7 Jun","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:17,dates:"8–14 Jun",phase:"TAPER",totalKm:46,days:[
    W("w17d0","2026-06-08","Lun 8 Jun","Rodaje + fuerza en casa","SUAVE",8,"Rodaje 8km plano, límite Z2-Z3 (143-148 bpm). Después en casa: glúteo 12r c/lado, propioceptivo 30seg c/pie, foam roller."),
    W("w17d1","2026-06-09","Mar 9 Jun","Kinesio + rodaje suave","SUAVE",8,"🏥 Kinesio. Luego rodaje 8km plano, límite Z2-Z3 (143-148 bpm). Sin intervalos hoy."),
    W("w17d2","2026-06-10","Mié 10 Jun","Rodaje mixto","SUAVE",7,"Plano o terreno suave. Límite Z2-Z3 (143-148 bpm), ~5:50-6:10/km. Visualiza la carrera."),
    W("w17d3","2026-06-11","Jue 11 Jun","Kinesio + rodaje suave","SUAVE",6,"🏥 Kinesio. Luego rodaje 6km plano, Z2 (131-145 bpm). Corto y controlado."),
    W("w17d4","2026-06-12","Vie 12 Jun","Rodaje recuperación","SUAVE",5,"6:50/km. 25–30min muy suave. Descarga antes del trail del sábado."),
    W("w17d5","2026-06-13","Sáb 13 Jun","Trail cerro + plano","MEDIO",12,"350m D+. Subidas al límite Z2-Z3 (143-148 bpm). Bajadas controladas, paso corto. Última sesión con desnivel."),
    W("w17d6","2026-06-14","Dom 14 Jun","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:18,dates:"15–21 Jun",phase:"TAPER FINAL",totalKm:23,days:[
    W("w18d0","2026-06-15","Lun 15 Jun","Rodaje mixto","SUAVE",7,"Plano con algún repecho. Límite Z2-Z3 (143-148 bpm). ~5:50-6:10/km. Sensaciones frescas."),
    W("w18d1","2026-06-16","Mar 16 Jun","Kinesio + rodaje suave","SUAVE",6,"🏥 Kinesio. Luego rodaje 6km plano, Z2 (131-145 bpm). Liviano."),
    W("w18d2","2026-06-17","Mié 17 Jun","Descanso","DESCANSO",0,"Descanso. Hidratación óptima."),
    W("w18d3","2026-06-18","Jue 18 Jun","Kinesio + rodaje suave","SUAVE",5,"🏥 Kinesio. Luego rodaje 5km plano, Z2 (131-145 bpm). Mantiene el sistema activo."),
    W("w18d4","2026-06-19","Vie 19 Jun","Rodaje + strides","SUAVE",5,"6:40/km con 4×15seg strides al final."),
    F("w18d5","2026-06-20","Sáb 20 Jun","Movilidad + activación",1,"Sin pesas. Solo activación y movilidad.",[
      {name:"Yoga/movilidad",reps:"15 min"},{name:"Foam roller",reps:"30 seg/zona"},
      {name:"Activación de glúteo",reps:"10 c/lado"},{name:"Activación de core",reps:"5 min"}]),
    W("w18d6","2026-06-21","Dom 21 Jun","Descanso","DESCANSO",0,"Carga de carbos gradual. Duerme temprano."),
  ]},
  {num:"🏁",dates:"22–28 Jun",phase:"CARRERA",totalKm:29,days:[
    W("wRd0","2026-06-22","Lun 22 Jun","Trote suave 6km","SUAVE",6,"6:40–6:50/km. Activa las piernas para la semana de carrera. Plano y relajado."),
    W("wRd1","2026-06-23","Mar 23 Jun","Movilidad + logística","DESCANSO",0,"Prepara mochila y equipo. Activación ligera 15min."),
    W("wRd2","2026-06-24","Mié 24 Jun","Trote + strides","SUAVE",3,"20min trote suave + 4×15seg strides. Carga de carbos."),
    W("wRd3","2026-06-25","Jue 25 Jun","Descanso","DESCANSO",0,"Recoge dorsal. Duerme temprano."),
    W("wRd4","2026-06-26","Vie 26 Jun","Descanso pre-carrera","DESCANSO",0,"Descanso completo. Cena con carbos."),
    W("wRd5","2026-06-27","Sáb 27 Jun 🏁","CARRERA 20km","INTENSO",20,"1500m D+. ¡A correr! Sale al 70% los primeros 10km."),
    W("wRd6","2026-06-28","Dom 28 Jun","Descanso post-carrera","DESCANSO",0,"El cuerpo lo hizo. Descansa. Hielo en piernas si hay inflamación."),
  ]},
  {num:19,dates:"29 Jun – 5 Jul",phase:"RECUPERACIÓN POST",totalKm:3,days:[
    W("w19d1","2026-06-29","Lun 29 Jun","Descanso activo","DESCANSO",0,"Caminata suave 20–30min. Sin correr. Estira con calma."),
    W("w19d2","2026-06-30","Mar 30 Jun","Descanso","DESCANSO",0,"Descanso completo o movilidad articular 15min."),
    W("w19d3","2026-07-01","Mié 1 Jul","Trote suave opcional","SUAVE",3,"Solo si las piernas invitan. 20–25min muy suave, plano. Sin presión."),
    W("w19d4","2026-07-02","Jue 2 Jul","Descanso","DESCANSO",0,"Descanso. Foam roller y estiramientos."),
    W("w19d5","2026-07-03","Vie 3 Jul","Descanso","DESCANSO",0,"Descanso activo. Prioriza el sueño."),
    F("w19d6","2026-07-04","Sáb 4 Jul","Fuerza – Recuperación: fuerza y equilibrio",3,"Sesión de recuperación activa. Ningún ejercicio debe generar dolor.",[
      {name:"Clamshell",reps:"15 c/lado"},{name:"Balance a un pie (triángulo)",reps:"30 seg c/pie"},
      {name:"Activación de glúteo",reps:"15 c/lado"},{name:"Step-down asistido",reps:"5 c/lado"}]),
    W("w19d7","2026-07-05","Dom 5 Jul","Bici suave","SUAVE",0,"🚲 30min bici suave, cadencia cómoda. Cero impacto."),
  ]},
];}

// ── Plan de recuperación ITB – Putaendo 10k (1 Ago 2026) ─────
// Semanas lunes-domingo. Empieza el 6 jul (el 5 jul quedó en el cierre de Torrencial).
// Fines de semana alternados (ciclo de 2 semanas, sáb 4 jul bloqueado):
// bloqueados 18 jul y 15 ago (largo/fuerza se adelanta a viernes, sábado pasa a ser Fuerza,
// domingo siguiente admite trote suave 30min); libres 11 jul, 25 jul y 8 ago.
// 1 ago (carrera) es excepción puntual: hija queda con su abuela.
function buildTrail10kWeeks(){return [
  {num:1,dates:"6–12 Jul",phase:"RECUPERACIÓN",totalKm:14,days:[
    F("t1d0","2026-07-06","Lun 6 Jul","Fuerza – Activación y propiocepción",3,"Base de la recuperación: cadera y equilibrio. Ningún ejercicio debe doler.",[
      {name:"Clamshell",reps:"15 c/lado"},{name:"Elevación de cadera lateral",reps:"15 c/lado"},
      {name:"Step-down asistido",reps:"5 c/lado ×2"},{name:"Balance a un pie (triángulo)",reps:"30 seg c/pie"},
      {name:"Activación tibial",reps:"15 c/dir."}]),
    W("t1d1","2026-07-07","Mar 7 Jul","Kinesio + trote suave","SUAVE",4,"🏥 Kinesio. Luego trote 20min muy suave, plano. Tope dolor 2/10 — si sube, camina."),
    W("t1d2","2026-07-08","Mié 8 Jul","Bici (cross-training)","SUAVE",0,"🚲 30min bici Z1-Z2, cadencia suave. Cero impacto, mantiene el aeróbico."),
    W("t1d3","2026-07-09","Jue 9 Jul","Kinesio + trote suave","SUAVE",4,"🏥 Kinesio. Luego trote 20min muy suave, plano. Mismo tope de dolor que el martes."),
    W("t1d4","2026-07-10","Vie 10 Jul","Descanso","DESCANSO",0,"Descanso o movilidad 15min."),
    W("t1d5","2026-07-11","Sáb 11 Jul","Trote suave plano","SUAVE",6,"Fin de semana libre. 6km en plano. Test de tolerancia. Detente si el dolor supera 2/10."),
    W("t1d6","2026-07-12","Dom 12 Jul","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:2,dates:"13–19 Jul",phase:"PROGRESIÓN",totalKm:29,days:[
    W("t2d0","2026-07-13","Lun 13 Jul","Rodaje suave","SUAVE",5,"Este ciclo la fuerza se hace el sábado (fin de semana bloqueado). Trote suave, plano."),
    W("t2d1","2026-07-14","Mar 14 Jul","Kinesio + trote suave","SUAVE",6,"🏥 Kinesio. Trote 30min suave, plano. Sube cadencia (+5–10%) y acorta la zancada."),
    W("t2d2","2026-07-15","Mié 15 Jul","Bici o nado","SUAVE",0,"🚲 35min bici Z2 o nado suave 30min (evita patada fuerte si molesta la cadera)."),
    W("t2d3","2026-07-16","Jue 16 Jul","Kinesio + trote suave","SUAVE",6,"🏥 Kinesio. Trote 30min suave, plano. Cadencia alta."),
    W("t2d4","2026-07-17","Vie 17 Jul","Trote rodante suave","MEDIO",9,"Fin de semana bloqueado: el trote de la semana se adelanta a hoy. 9km en terreno rodante suave, sin bajadas pronunciadas. Ritmo cómodo."),
    F("t2d5","2026-07-18","Sáb 18 Jul","Fuerza – Progresión de carga",4,"Sábado bloqueado para trote: aprovecha para la fuerza. Sube reps y agrega estocada asistida.",[
      {name:"Clamshell con banda",reps:"20 c/lado"},{name:"Elevación de cadera lateral",reps:"20 c/lado"},
      {name:"Step-down",reps:"8 c/lado"},{name:"Estocada asistida",reps:"10 c/lado"},
      {name:"Balance a un pie",reps:"40 seg c/pie"}]),
    W("t2d6","2026-07-19","Dom 19 Jul","Trote suave (fin de semana alternado)","SUAVE",3,"Domingo de trote tras el sábado bloqueado: 30min muy suave, plano."),
  ]},
  {num:3,dates:"20–26 Jul",phase:"CONSOLIDACIÓN",totalKm:25,days:[
    F("t3d0","2026-07-20","Lun 20 Jul","Fuerza – Reintroduce pliometría",4,"Primer salto desde cajón a una pierna, bajo volumen. Aterrizaje suave y controlado.",[
      {name:"Salto cajón 1 pierna",reps:"5 c/lado"},{name:"Step-down",reps:"10 c/lado"},
      {name:"Estocada asistida",reps:"10 c/lado"},{name:"Balance a un pie con perturbación",reps:"40 seg c/pie"},
      {name:"Clamshell con banda",reps:"20 c/lado"}]),
    W("t3d1","2026-07-21","Mar 21 Jul","Kinesio + trote con cuestas","SUAVE",7,"🏥 Kinesio. Trote 35min con alguna cuesta suave. Primeras bajadas cortas y controladas."),
    W("t3d2","2026-07-22","Mié 22 Jul","Bici o nado","SUAVE",0,"🚲/🏊 Cross-training 30–35min Z2."),
    W("t3d3","2026-07-23","Jue 23 Jul","Kinesio + trote con cuestas","SUAVE",7,"🏥 Kinesio. Trote 35min, mismo perfil que el martes."),
    W("t3d4","2026-07-24","Vie 24 Jul","Descanso","DESCANSO",0,"Descanso."),
    W("t3d5","2026-07-25","Sáb 25 Jul","Simulacro trail","MEDIO",11,"Fin de semana libre. 11km con desnivel moderado y bajadas técnicas cortas. Cadencia alta, zancada corta. Evalúa dolor 24–48h después."),
    W("t3d6","2026-07-26","Dom 26 Jul","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:4,dates:"27 Jul – 2 Ago",phase:"TAPER + CARRERA",totalKm:18,days:[
    F("t4d0","2026-07-27","Lun 27 Jul","Fuerza – Mantenimiento",2,"Reduce volumen. Activación, sin carga nueva. Prioriza sensaciones frescas.",[
      {name:"Clamshell",reps:"15 c/lado"},{name:"Balance a un pie",reps:"30 seg c/pie"},
      {name:"Activación de glúteo",reps:"15 c/lado"}]),
    W("t4d1","2026-07-28","Mar 28 Jul","Kinesio + trote suave","SUAVE",5,"🏥 Kinesio. Trote 20–25min muy suave. Sin fatiga."),
    W("t4d2","2026-07-29","Mié 29 Jul","Trote corto o descanso","SUAVE",3,"Trote corto muy suave o descanso, según sensaciones."),
    W("t4d3","2026-07-30","Jue 30 Jul","Descanso","DESCANSO",0,"Descansa. Revisa equipo y logística de carrera."),
    W("t4d4","2026-07-31","Vie 31 Jul","Descanso pre-carrera","DESCANSO",0,"Descanso completo. Carga de carbos, duerme temprano."),
    W("t4d5","2026-08-01","Sáb 1 Ago 🏁","CARRERA Putaendo 10k","INTENSO",10,"600m D+. Sábado normalmente bloqueado, pero disponibilidad excepcional (tu hija queda con su abuela). Ritmo conservador, no all-out. Cadencia alta y zancada corta en bajadas técnicas/barrosas. Bastones si el terreno lo requiere. El objetivo es terminar sin dolor, no el tiempo."),
    W("t4d6","2026-08-02","Dom 2 Ago","Descanso post-carrera","DESCANSO",0,"El cuerpo lo hizo. Descansa. Hielo si hay inflamación, igual que después del 20k."),
  ]},
  {num:5,dates:"3–9 Ago",phase:"RECUPERACIÓN POST",totalKm:10,days:[
    W("t5d0","2026-08-03","Lun 3 Ago","Descanso activo","DESCANSO",0,"Caminata suave 20–30min. Sin correr."),
    W("t5d1","2026-08-04","Mar 4 Ago","Kinesio – evaluación","DESCANSO",0,"🏥 Kinesio: evalúa la respuesta post-carrera. Sin trote hoy."),
    W("t5d2","2026-08-05","Mié 5 Ago","Trote opcional muy suave","SUAVE",0,"Solo si no hay dolor: 15–20min muy suave. Ante la duda, descansa."),
    W("t5d3","2026-08-06","Jue 6 Ago","Kinesio + trote suave","SUAVE",4,"🏥 Kinesio. Trote suave si las sensaciones son buenas."),
    W("t5d4","2026-08-07","Vie 7 Ago","Descanso","DESCANSO",0,"Descanso."),
    W("t5d5","2026-08-08","Sáb 8 Ago","Trote suave plano","SUAVE",6,"Fin de semana libre. Retoma el trote suave en plano, igual que la semana post-20k. Sin presión."),
    W("t5d6","2026-08-09","Dom 9 Ago","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:6,dates:"10–15 Ago",phase:"CIERRE RECUPERACIÓN",totalKm:30,days:[
    W("t6d0","2026-08-10","Lun 10 Ago","Rodaje suave","SUAVE",7,"Este ciclo la fuerza se hace el sábado (fin de semana bloqueado). Trote suave, plano."),
    W("t6d1","2026-08-11","Mar 11 Ago","Trote suave plano","SUAVE",7,"Trote suave plano. Evalúa que no quede ninguna molestia."),
    W("t6d2","2026-08-12","Mié 12 Ago","Descanso o cross-training","DESCANSO",0,"Descanso activo o bici suave 30min."),
    W("t6d3","2026-08-13","Jue 13 Ago","Trote suave","SUAVE",6,"Trote suave, plano o con leve ondulación."),
    W("t6d4","2026-08-14","Vie 14 Ago","Trote con bajadas técnicas","MEDIO",10,"Fin de semana bloqueado: el checkpoint final se adelanta a hoy. Bajadas técnicas sin restricción. Si llegas sin dolor: recuperación completa 🎉."),
    F("t6d5","2026-08-15","Sáb 15 Ago","Fuerza – Mantenimiento",2,"Sábado bloqueado para trote: kinesiología puede bajar a 1x/semana si todo sigue bien.",[
      {name:"Clamshell",reps:"15 c/lado"},{name:"Balance a un pie",reps:"30 seg c/pie"},
      {name:"Activación de glúteo",reps:"15 c/lado"}]),
  ]},
];}

// ──────────────────────────────────────────────────
// BASAL DE TRAIL – 12 semanas (22 ago – 8 nov 2026)
// Sin carrera objetivo. Consistencia, salud y fuerza en subida.
// Debilidad a corregir: sostener el esfuerzo corriendo las subidas
// (lo que faltó en Valdivia jun-2026 y Putaendo ago-2026).
// La lesión de banda iliotibial vino de saltarse fuerza y movilidad:
// aquí son sesiones del plan, no un extra opcional.
//
// FINES DE SEMANA ALTERNADOS (cuidado de la hija):
//   Bloqueados para cerro: 29-30 ago, 12-13 sep, 26-27 sep,
//                          10-11 oct, 24-25 oct, 7-8 nov.
//   En esos fines de semana SÍ se entrena, pero sin trail en cerro:
//     · Sábado  → bici en casa o fuerza (cero impacto / carga controlada)
//     · Domingo → trote suave hasta 8km en plano, acompañando a la hija en bici
//   El largo de la semana se adelanta al viernes.
//   Libres para cerro: 5-6 sep, 19-20 sep, 3-4 oct, 17-18 oct, 31 oct-1 nov.
//
// REGLA DE FUERZA: nunca dos días de fuerza consecutivos.
// Patrón base lunes + jueves (48-72h de recuperación entre sesiones).
// ──────────────────────────────────────────────────

// Bloques de fuerza reutilizables
const FA_BASE=[
  {name:"Clamshell con banda",reps:"20 c/lado"},{name:"Elevación de cadera lateral",reps:"15 c/lado"},
  {name:"Monster walk",reps:"15 pasos c/dir."},{name:"Puente de glúteo a una pierna",reps:"12 c/lado"},
  {name:"Plancha lateral",reps:"30 seg c/lado"},{name:"Movilidad de cadera",reps:"10 c/dir."},
  {name:"Foam roller",reps:"60 seg/zona"}];
const FA_PLUS=[
  {name:"Clamshell con banda",reps:"25 c/lado"},{name:"Elevación de cadera lateral",reps:"20 c/lado"},
  {name:"Monster walk",reps:"20 pasos c/dir."},{name:"Paso de valla lateral",reps:"12 c/lado"},
  {name:"Step-down",reps:"10 c/lado"},{name:"Plancha lateral",reps:"45 seg c/lado"},
  {name:"Rotación de cadera 90/90",reps:"10 c/lado"},{name:"Foam roller",reps:"60 seg/zona"}];
const FB_BASE=[
  {name:"Sentadilla",reps:"12"},{name:"Box step-up",reps:"10 c/lado"},
  {name:"Peso muerto rumano",reps:"12"},{name:"Elevación de talón",reps:"20"},
  {name:"Sentadilla isométrica",reps:"45 seg"},{name:"Movilidad de tobillos",reps:"10 c/dir."}];
const FB_PLUS=[
  {name:"Sentadilla búlgara",reps:"10 c/lado"},{name:"Box step-up",reps:"12 c/lado con carga"},
  {name:"Hip thrust",reps:"12"},{name:"Elevación de talón a una pierna",reps:"15 c/lado"},
  {name:"Zancada caminando",reps:"12 c/lado"},{name:"Sentadilla isométrica",reps:"60 seg"},
  {name:"Estiramiento de psoas",reps:"40 seg c/lado"}];
const FB_POT=[
  {name:"Salto cajón 1 pierna",reps:"6 c/lado"},{name:"Sentadilla búlgara",reps:"10 c/lado"},
  {name:"Hip thrust",reps:"10"},{name:"Zancada caminando",reps:"12 c/lado"},
  {name:"Elevación de talón a una pierna",reps:"15 c/lado"},{name:"Sentadilla isométrica",reps:"60 seg"},
  {name:"Estiramiento de psoas",reps:"40 seg c/lado"}];
const F_MOV=[
  {name:"Movilidad de cadera",reps:"10 c/dir."},{name:"Rotación de cadera 90/90",reps:"10 c/lado"},
  {name:"Movilidad de tobillos",reps:"10 c/dir."},{name:"Estiramiento de psoas",reps:"45 seg c/lado"},
  {name:"Balance a un pie (triángulo)",reps:"40 seg c/pie"},{name:"Foam roller",reps:"60 seg/zona"},
  {name:"Estiramientos",reps:"40 seg c/u"}];
const F_MANT=[
  {name:"Clamshell con banda",reps:"20 c/lado"},{name:"Sentadilla búlgara",reps:"10 c/lado"},
  {name:"Hip thrust",reps:"12"},{name:"Elevación de talón a una pierna",reps:"15 c/lado"},
  {name:"Plancha lateral",reps:"45 seg c/lado"}];

function buildBasalTrailWeeks(){return [
  {num:1,dates:"22–23 Ago",phase:"REACTIVACIÓN",totalKm:5,days:[
    W("b1d0","2026-08-22","Sáb 22 Ago","Vuelta a correr","SUAVE",5,"Primera corrida desde el 6 de agosto. 5km planos, muy suave, conversando sin esfuerzo. No mires el ritmo.\n\n⚠️ Vienes saliendo de influenza: si aparece fatiga desproporcionada, pulso alto en esfuerzo fácil o falta de aire, corta la sesión. Esta semana el objetivo es reactivar, no entrenar."),
    F("b1d1","2026-08-23","Dom 23 Ago","Fuerza A – Cadera y movilidad",3,"La sesión que te saltaste en el plan de Torrencial y que terminó en la lesión. Aquí es innegociable: sin glúteo medio fuerte, la banda iliotibial paga la cuenta cuando suba el volumen.\n\nSin carga externa. Aprende el patrón: la pelvis no rota, la cadera no cae.",FA_BASE),
  ]},
  {num:2,dates:"24–30 Ago",phase:"REACTIVACIÓN",totalKm:22,days:[
    W("b2d0","2026-08-24","Lun 24 Ago","Descanso activo","DESCANSO",0,"Ayer hiciste fuerza: hoy no toca otra sesión de carga. Caminata suave 20min o movilidad. La adaptación de fuerza ocurre en el descanso, no en la repetición."),
    W("b2d1","2026-08-25","Mar 25 Ago","Rodaje suave plano","SUAVE",5,"5km planos, ritmo conversable. Sigues en ventana post-influenza: fácil de verdad."),
    F("b2d2","2026-08-26","Mié 26 Ago","Fuerza A – Cadera y glúteo medio",3,"Repite el patrón del domingo, ya con 3 días de recuperación. Si algún ejercicio te sale torcido, baja las repeticiones antes que la calidad.",FA_BASE),
    W("b2d3","2026-08-27","Jue 27 Ago","Rodaje ondulado suave","SUAVE",5,"5km con ~80m D+. Primera ondulación. Sube trotando corto, sin forzar."),
    W("b2d4","2026-08-28","Vie 28 Ago","Rodaje ondulado","SUAVE",6,"6km con ~130m D+. El cerro de la semana se hace hoy: el fin de semana está bloqueado."),
    F("b2d5","2026-08-29","Sáb 29 Ago","Fuerza B – Base de subida",3,"🏠 Fin de semana bloqueado para cerro, pero sí hay entrenamiento en casa. Empieza la fuerza específica de subida. Sin carga o muy liviana: esta semana es técnica.\n\nLa sentadilla isométrica es la más importante del bloque: entrena el cuádriceps a sostener tensión, que es exactamente lo que se te agotó en Putaendo.",FB_BASE),
    W("b2d6","2026-08-30","Dom 30 Ago","Trote suave con la hija","SUAVE",6,"👨‍👧 6km planos muy suaves acompañando a tu hija en bicicleta. Ritmo el que ella marque — es volumen fácil y tiempo juntos. Sin cerro."),
  ]},
  {num:3,dates:"31 Ago – 6 Sep",phase:"REACTIVACIÓN",totalKm:20,days:[
    F("b3d0","2026-08-31","Lun 31 Ago","Fuerza A – Cadera y glúteo medio",3,"Tercera sesión del patrón. Ya debería salirte sin pensarlo. Si el clamshell con banda te resulta fácil, sube la banda.",FA_BASE),
    W("b3d1","2026-09-01","Mar 1 Sep","Cuestas cortas","SUAVE",6,"Primera sesión de cuestas del plan. Calienta 15min → 6×(45 seg subiendo firme / bajada trotando suave) → 10min suave. ~160m D+.\n\nSube con zancada corta y cadencia alta, mirando 5 metros adelante. No es sprint: es fuerza. Debes terminar cada repetición pudiendo hacer una más."),
    W("b3d2","2026-09-02","Mié 2 Sep","Descanso o bici","DESCANSO",0,"🚲 Descanso, o 30min de bici suave si quieres mover piernas. Si pedaleas, regístralo — así el volumen aeróbico real queda visible."),
    F("b3d3","2026-09-03","Jue 3 Sep","Fuerza B – Base de subida",3,"Segunda de fuerza de subida. Si la sentadilla y el step-up van cómodos, agrega peso (mochila o mancuerna).",FB_BASE),
    W("b3d4","2026-09-04","Vie 4 Sep","Rodaje regenerativo","SUAVE",5,"5km planos muy suaves. Piernas frescas para el sábado."),
    W("b3d5","2026-09-05","Sáb 5 Sep","Largo trail – primera salida a cerro","MEDIO",9,"Fin de semana libre. 9km con ~350m D+. Primera salida a cerro del bloque.\n\nRegla del día: sube corriendo solo lo que puedas sostener conversando. Cuando se corte la conversación, camina — sin culpa. Aprender dónde está ese límite es el objetivo del bloque completo."),
    W("b3d6","2026-09-06","Dom 6 Sep","Descanso","DESCANSO",0,"Descanso completo. Revisa cómo respondió la rodilla a las 24h."),
  ]},
  {num:4,dates:"7–13 Sep",phase:"REACTIVACIÓN",totalKm:30,days:[
    F("b4d0","2026-09-07","Lun 7 Sep","Fuerza A – Cadera y glúteo medio",3,"Última semana de la fase de reactivación. Mantén el trabajo de cadera al día.",FA_BASE),
    W("b4d1","2026-09-08","Mar 8 Sep","Cuestas cortas","MEDIO",7,"Calienta 15min → 8×(45 seg subiendo firme / bajada trotando) → 10min suave. ~190m D+. Dos repeticiones más que la semana pasada, misma calidad."),
    W("b4d2","2026-09-09","Mié 9 Sep","Rodaje suave plano","SUAVE",5,"5km planos. Recuperación entre las dos sesiones duras."),
    F("b4d3","2026-09-10","Jue 10 Sep","Fuerza B – Progresión de carga",4,"Sube a 4 series y agrega carga. Entras a fuerza de verdad: la sentadilla búlgara y el step-up cargado son los que construyen la subida.",FB_PLUS),
    W("b4d4","2026-09-11","Vie 11 Sep","Largo ondulado (adelantado)","MEDIO",11,"Fin de semana bloqueado: el largo se adelanta a hoy. 11km con ~400m D+ en terreno rodante.\n\nBusca subidas de 3–5min y córrelas completas a ritmo cómodo. Es el primer ensayo de subida continua."),
    W("b4d5","2026-09-12","Sáb 12 Sep","Bici en casa","SUAVE",0,"🚲 Fin de semana bloqueado. 40min de bici Z1-Z2 en casa, cadencia cómoda. Cero impacto — descarga las piernas del largo de ayer sin perder aeróbico.\n\nSi el jueves te saltaste la fuerza, cámbiala por Fuerza B hoy."),
    W("b4d6","2026-09-13","Dom 13 Sep","Trote suave con la hija","SUAVE",7,"👨‍👧 7km planos suaves acompañando a tu hija en bicicleta. Sin cerro, sin ritmo objetivo."),
  ]},
  {num:5,dates:"14–20 Sep",phase:"FUERZA EN CUESTA",totalKm:26,days:[
    F("b5d0","2026-09-14","Lun 14 Sep","Fuerza B – Progresión de carga",4,"Arranca la fase de fuerza en cuesta. La fuerza pasa a ser el motor del bloque: no la saltes por semana de Fiestas Patrias.",FB_PLUS),
    W("b5d1","2026-09-15","Mar 15 Sep","Cuestas medias","MEDIO",8,"Calienta 15min → 6×(2 min subiendo a esfuerzo controlado / bajada trotando) → 10min suave. ~250m D+.\n\nCambio importante: de 45 segundos a 2 minutos. Ya no es fuerza pura, es sostener. Busca un esfuerzo que puedas repetir seis veces igual — si la última cae mucho, partiste muy fuerte."),
    W("b5d2","2026-09-16","Mié 16 Sep","Rodaje suave plano","SUAVE",5,"5km planos suaves."),
    F("b5d3","2026-09-17","Jue 17 Sep","Fuerza A – Cadera avanzada",4,"Sube a 4 series y entra el step-down: control excéntrico para las bajadas, que es donde la banda iliotibial más sufre.",FA_PLUS),
    W("b5d4","2026-09-18","Vie 18 Sep","Descanso","DESCANSO",0,"🇨🇱 Descanso. Come tranquilo, mañana hay cerro."),
    W("b5d5","2026-09-19","Sáb 19 Sep","Largo trail – primera subida sostenida","MEDIO",13,"Fin de semana libre. 13km con ~550m D+.\n\nLa sesión clave: elige UNA subida de 10–15min y córrela completa sin caminar, a ritmo conversable-justo. Si tienes que caminar, la elegiste muy empinada — anótalo y busca una más suave la próxima. El resto del recorrido, suave."),
    W("b5d6","2026-09-20","Dom 20 Sep","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:6,dates:"21–27 Sep",phase:"DESCARGA",totalKm:28,days:[
    F("b6d0","2026-09-21","Lun 21 Sep","Fuerza – Movilidad y activación",2,"Semana de descarga: bajas carga, no frecuencia. Sesión de movilidad pura.\n\nEsta es la sesión que más se salta la gente y la que más te habría servido en mayo. Hazla completa.",F_MOV),
    W("b6d1","2026-09-22","Mar 22 Sep","Rodaje ondulado suave","SUAVE",6,"6km con ~120m D+. Suave de verdad, es semana de asimilar."),
    W("b6d2","2026-09-23","Mié 23 Sep","Rodaje suave plano","SUAVE",5,"5km planos."),
    F("b6d3","2026-09-24","Jue 24 Sep","Fuerza A – Carga reducida",3,"Mismo patrón, 3 series, sin banda dura. Mantiene el estímulo sin sumar fatiga.",FA_BASE),
    W("b6d4","2026-09-25","Vie 25 Sep","Rodaje con cuestas suaves (adelantado)","MEDIO",11,"Fin de semana bloqueado: sesión adelantada. 11km con ~400m D+, cuestas suaves y continuas. Ritmo cómodo todo el rato, sin bloques duros."),
    W("b6d5","2026-09-26","Sáb 26 Sep","Bici en casa","SUAVE",0,"🚲 Fin de semana bloqueado. 35min de bici Z1-Z2, cadencia suave. Semana de descarga: no busques carga, busca circulación."),
    W("b6d6","2026-09-27","Dom 27 Sep","Trote suave con la hija","SUAVE",6,"👨‍👧 6km planos muy suaves acompañando a tu hija en bicicleta. Cierre de la primera mitad del bloque: si no hay molestias, vas bien encaminado."),
  ]},
  {num:7,dates:"28 Sep – 4 Oct",phase:"FUERZA EN CUESTA",totalKm:30,days:[
    F("b7d0","2026-09-28","Lun 28 Sep","Fuerza B – Progresión de carga",4,"Vuelve la carga tras la descarga. Sube peso donde puedas mantener la técnica.",FB_PLUS),
    W("b7d1","2026-09-29","Mar 29 Sep","Cuestas medias","MEDIO",9,"Calienta 15min → 8×(2 min subiendo a esfuerzo controlado / bajada trotando) → 10min suave. ~300m D+. Dos repeticiones más que en la semana 5."),
    W("b7d2","2026-09-30","Mié 30 Sep","Rodaje suave plano","SUAVE",5,"5km planos."),
    F("b7d3","2026-10-01","Jue 1 Oct","Fuerza A – Cadera avanzada",4,"Cadera y control excéntrico. Cuatro series completas.",FA_PLUS),
    W("b7d4","2026-10-02","Vie 2 Oct","Descanso","DESCANSO",0,"Descanso. Mañana es la sesión larga más exigente hasta ahora."),
    W("b7d5","2026-10-03","Sáb 3 Oct","Largo trail – dos subidas sostenidas","MEDIO",16,"Fin de semana libre. 16km con ~700m D+.\n\nDos bloques de subida continua de 12min cada uno, separados por al menos 15min de rodaje suave. Mismo esfuerzo en ambos: si el segundo se cae mucho, el primero fue muy fuerte. Registra la FC media de cada bloque."),
    W("b7d6","2026-10-04","Dom 4 Oct","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:8,dates:"5–11 Oct",phase:"FUERZA EN CUESTA",totalKm:40,days:[
    F("b8d0","2026-10-05","Lun 5 Oct","Fuerza B – Progresión de carga",4,"Cuarta semana con carga alta. Si algo molesta, baja peso antes que saltarte la sesión.",FB_PLUS),
    W("b8d1","2026-10-06","Mar 6 Oct","Subida sostenida","INTENSO",10,"Calienta 15min → 3×(8 min de subida continua a esfuerzo firme pero sostenible / baja trotando) → 10min suave. ~350m D+.\n\nPrimera sesión de subida larga. El esfuerzo debe ser el que aguantarías 30 minutos: respiración fuerte pero controlada. Esto es exactamente lo que te faltó en Putaendo."),
    W("b8d2","2026-10-07","Mié 7 Oct","Rodaje suave plano","SUAVE",6,"6km planos, recuperación."),
    F("b8d3","2026-10-08","Jue 8 Oct","Fuerza A – Cadera avanzada",4,"Cadera y excéntrico. Mantén la calidad con las piernas cansadas.",FA_PLUS),
    W("b8d4","2026-10-09","Vie 9 Oct","Largo ondulado (adelantado)","MEDIO",16,"Fin de semana bloqueado: largo adelantado. 16km con ~700m D+ rodante.\n\nSin bloques cronometrados: corre todas las subidas que puedas sostener y camina las que no. Es un test honesto de dónde estás."),
    W("b8d5","2026-10-10","Sáb 10 Oct","Bici en casa","SUAVE",0,"🚲 Fin de semana bloqueado. 40min de bici Z1-Z2 en casa. Descarga tras los 16km de ayer, cero impacto en la banda iliotibial."),
    W("b8d6","2026-10-11","Dom 11 Oct","Trote suave con la hija","SUAVE",8,"👨‍👧 8km planos suaves acompañando a tu hija en bicicleta. Es el tope de distancia para estos domingos — si las piernas piden menos, hazle caso."),
  ]},
  {num:9,dates:"12–18 Oct",phase:"SUBIDA SOSTENIDA",totalKm:36,days:[
    F("b9d0","2026-10-12","Lun 12 Oct","Fuerza B – Potencia",4,"Entra la pliometría: salto a cajón a una pierna, bajo volumen y aterrizaje suave. Si la rodilla dice algo, sáltate el salto y haz el resto.",FB_POT),
    W("b9d1","2026-10-13","Mar 13 Oct","Subida sostenida","INTENSO",10,"Calienta 15min → 2×(12 min de subida continua / baja trotando) → 10min suave. ~400m D+. Bloques más largos, mismo esfuerzo controlado."),
    W("b9d2","2026-10-14","Mié 14 Oct","Rodaje suave plano","SUAVE",6,"6km planos."),
    F("b9d3","2026-10-15","Jue 15 Oct","Fuerza A – Cadera avanzada",4,"Cadera al día antes del largo más exigente del bloque.",FA_PLUS),
    W("b9d4","2026-10-16","Vie 16 Oct","Descanso","DESCANSO",0,"Descanso completo. Prepara mochila, agua y comida para mañana."),
    W("b9d5","2026-10-17","Sáb 17 Oct","Largo trail 20km","MEDIO",20,"Fin de semana libre. 20km con ~900m D+. La sesión más larga desde la carrera de Valdivia.\n\nSube corriendo todo lo que puedas sostener. Come y bebe desde el kilómetro 5, no esperes a tener hambre. Al terminar, anota cuántas subidas corriste completas — ese es el número que queremos ver crecer."),
    W("b9d6","2026-10-18","Dom 18 Oct","Descanso","DESCANSO",0,"Descanso completo. Piernas en alto."),
  ]},
  {num:10,dates:"19–25 Oct",phase:"DESCARGA",totalKm:35,days:[
    F("b10d0","2026-10-19","Lun 19 Oct","Fuerza – Movilidad y activación",2,"Segunda descarga del bloque. Movilidad completa, sin carga.",F_MOV),
    W("b10d1","2026-10-20","Mar 20 Oct","Rodaje ondulado","SUAVE",7,"7km con ~200m D+. Suave, sin bloques."),
    W("b10d2","2026-10-21","Mié 21 Oct","Rodaje suave plano","SUAVE",6,"6km planos."),
    F("b10d3","2026-10-22","Jue 22 Oct","Fuerza A – Carga reducida",3,"Tres series, banda suave. Mantener, no construir.",FA_BASE),
    W("b10d4","2026-10-23","Vie 23 Oct","Rodaje ondulado largo (adelantado)","MEDIO",15,"Fin de semana bloqueado: sesión adelantada. 15km con ~600m D+ a ritmo cómodo de principio a fin."),
    W("b10d5","2026-10-24","Sáb 24 Oct","Bici en casa","SUAVE",0,"🚲 Fin de semana bloqueado. 35min de bici Z1-Z2 suave. Semana de descarga: mover piernas, nada más."),
    W("b10d6","2026-10-25","Dom 25 Oct","Trote suave con la hija","SUAVE",7,"👨‍👧 7km planos suaves acompañando a tu hija en bicicleta. Viene la semana pico: llega descansado."),
  ]},
  {num:11,dates:"26 Oct – 1 Nov",phase:"SUBIDA SOSTENIDA",totalKm:40,days:[
    F("b11d0","2026-10-26","Lun 26 Oct","Fuerza B – Potencia",4,"Semana pico. Última sesión de potencia con carga alta.",FB_POT),
    W("b11d1","2026-10-27","Mar 27 Oct","Subida sostenida","INTENSO",11,"Calienta 15min → 3×(10 min de subida continua / baja trotando) → 10min suave. ~450m D+. Treinta minutos de subida firme repartidos en tres bloques: el mayor estímulo del plan."),
    W("b11d2","2026-10-28","Mié 28 Oct","Rodaje suave plano","SUAVE",7,"7km planos, muy suaves."),
    F("b11d3","2026-10-29","Jue 29 Oct","Fuerza A – Cadera avanzada",4,"Cadera completa. Mañana descansas.",FA_PLUS),
    W("b11d4","2026-10-30","Vie 30 Oct","Descanso","DESCANSO",0,"Descanso completo. Duerme bien: mañana es el pico del bloque."),
    W("b11d5","2026-10-31","Sáb 31 Oct","Largo trail 22km – pico del bloque","MEDIO",22,"Fin de semana libre. 22km con ~1000m D+. La sesión más grande de las 12 semanas.\n\nMismo perfil que Valdivia en junio (19km / 1300m), pero llegando entrenado en subida en vez de improvisando. Sube corriendo, come temprano, y guarda algo para los últimos 5km."),
    W("b11d6","2026-11-01","Dom 1 Nov","Descanso","DESCANSO",0,"Descanso completo. Lo hiciste."),
  ]},
  {num:12,dates:"2–8 Nov",phase:"CIERRE Y TEST",totalKm:30,days:[
    F("b12d0","2026-11-02","Lun 2 Nov","Fuerza – Mantenimiento",3,"Última semana. Baja el volumen de fuerza pero no la sacas: el objetivo es llegar fresco al test del viernes.",F_MANT),
    W("b12d1","2026-11-03","Mar 3 Nov","Rodaje suave plano","SUAVE",6,"6km planos, muy suaves."),
    W("b12d2","2026-11-04","Mié 4 Nov","Rodaje ondulado suave","SUAVE",6,"6km con ~150m D+. Activación, nada más."),
    F("b12d3","2026-11-05","Jue 5 Nov","Fuerza – Mantenimiento",3,"Sesión corta. Sin carga nueva.",F_MANT),
    W("b12d4","2026-11-06","Vie 6 Nov","🎯 Test de cerro","INTENSO",12,"Fin de semana bloqueado: el test se hace hoy. 12km con ~500m D+.\n\nCalienta 20min → UNA subida sostenida de 15–20min a esfuerzo firme → baja controlado → 10min suave.\n\n**Registra la FC media de la subida.** Compárala con Putaendo (1 ago: 162 bpm de media, 187 máx en 10.6km). Si sostienes 15–20min de subida a una FC parecida o menor, el bloque funcionó."),
    W("b12d5","2026-11-07","Sáb 7 Nov","Bici en casa","SUAVE",0,"🚲 Fin de semana bloqueado. 30min de bici muy suave, soltando las piernas del test de ayer."),
    W("b12d6","2026-11-08","Dom 8 Nov","Trote suave + cierre del bloque","SUAVE",6,"👨‍👧 6km planos muy suaves acompañando a tu hija en bicicleta.\n\nFin de las 12 semanas. Revisa los números con Claude: volumen acumulado, D+ total, RHR y la FC del test versus Putaendo. Con eso armamos el bloque siguiente."),
  ]},
];}

// ──────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────
