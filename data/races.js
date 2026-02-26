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
    W("w16d4","2026-06-05","Vie 5 Jun","Largo trail 20km","MEDIO",20,"800m D+. Taper largo. Ritmo cómodo."),
    F("w16d5","2026-06-06","Sáb 6 Jun","Fuerza ligera",2,"Activación neuromuscular. Sin fatiga.",[
      {name:"Sentadilla",reps:"10"},{name:"Activación de glúteo",reps:"15 c/lado"},
      {name:"Trabajo de tobillo",reps:"15 c/dir."},{name:"Activación de core",reps:"5 min"}]),
    W("w16d6","2026-06-07","Dom 7 Jun","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:17,dates:"8–14 Jun",phase:"TAPER",totalKm:34,days:[
    F("w17d0","2026-06-08","Lun 8 Jun","Fuerza muy ligera",2,"Solo activación articular y movilidad.",[
      {name:"Activación articular",reps:"10 c/articulación"},{name:"Movilidad de cadera",reps:"10 c/dir."},
      {name:"Activación de glúteo",reps:"12 c/lado"},{name:"Foam roller",reps:"30 seg/zona"}]),
    W("w17d1","2026-06-09","Mar 9 Jun","Intervalos cortos","MEDIO",9,"WU 10min → 4×(3min fuerte / 90seg trote) → CD 10min."),
    W("w17d2","2026-06-10","Mié 10 Jun","Rodaje suave","SUAVE",7,"6:40/km. Trail. Visualiza la carrera."),
    W("w17d3","2026-06-11","Jue 11 Jun","Rodaje suave","SUAVE",6,"6:50/km. Corto y suave."),
    W("w17d4","2026-06-12","Vie 12 Jun","Rodaje recuperación","SUAVE",5,"6:50/km. 25–30min muy suave."),
    W("w17d5","2026-06-13","Sáb 13 Jun","Trail suave 12km","SUAVE",12,"350m D+. Muy cómodo. Última tirada larga."),
    W("w17d6","2026-06-14","Dom 14 Jun","Descanso","DESCANSO",0,"Descanso completo."),
  ]},
  {num:18,dates:"15–21 Jun",phase:"TAPER FINAL",totalKm:17,days:[
    W("w18d0","2026-06-15","Lun 15 Jun","Rodaje suave","SUAVE",7,"6:40/km. 7km se siente trivial: eso buscamos."),
    W("w18d1","2026-06-16","Mar 16 Jun","Descanso","DESCANSO",0,"Descanso activo. Caminata 20min."),
    W("w18d2","2026-06-17","Mié 17 Jun","Descanso","DESCANSO",0,"Descanso. Hidratación óptima."),
    W("w18d3","2026-06-18","Jue 18 Jun","Rodaje suave","SUAVE",5,"6:40/km. 25–30min. Mantiene el sistema activo."),
    W("w18d4","2026-06-19","Vie 19 Jun","Rodaje + strides","SUAVE",5,"6:40/km con 4×15seg strides al final."),
    F("w18d5","2026-06-20","Sáb 20 Jun","Movilidad + activación",1,"Sin pesas. Solo activación y movilidad.",[
      {name:"Yoga/movilidad",reps:"15 min"},{name:"Foam roller",reps:"30 seg/zona"},
      {name:"Activación de glúteo",reps:"10 c/lado"},{name:"Activación de core",reps:"5 min"}]),
    W("w18d6","2026-06-21","Dom 21 Jun","Descanso","DESCANSO",0,"Carga de carbos gradual. Duerme temprano."),
  ]},
  {num:"🏁",dates:"22–27 Jun",phase:"CARRERA",totalKm:50,days:[
    W("wRd0","2026-06-22","Lun 22 Jun","Trote suave 6km","SUAVE",6,"6:40–6:50/km. Activa las piernas para la semana de carrera. Plano y relajado."),
    W("wRd1","2026-06-23","Mar 23 Jun","Movilidad + logística","DESCANSO",0,"Prepara mochila y equipo. Activación ligera 15min."),
    W("wRd2","2026-06-24","Mié 24 Jun","Trote + strides","SUAVE",3,"20min trote suave + 4×15seg strides. Carga de carbos."),
    W("wRd3","2026-06-25","Jue 25 Jun","Descanso","DESCANSO",0,"Recoge dorsal. Duerme temprano."),
    W("wRd4","2026-06-26","Vie 26 Jun","Descanso pre-carrera","DESCANSO",0,"Descanso completo. Cena con carbos."),
    W("wRd5","2026-06-27","Sáb 27 Jun 🏁","CARRERA 44km","INTENSO",44,"1500m D+. ¡A correr! Sale al 70% los primeros 10km."),
  ]},
  {num:19,dates:"28 Jun – 4 Jul",phase:"RECUPERACIÓN POST",totalKm:11,days:[
    W("w19d0","2026-06-28","Dom 28 Jun","Descanso post-carrera","DESCANSO",0,"El cuerpo lo hizo. Descansa. Hielo en piernas si hay inflamación."),
    W("w19d1","2026-06-29","Lun 29 Jun","Descanso activo","DESCANSO",0,"Caminata suave 20–30min. Sin correr. Estira con calma."),
    W("w19d2","2026-06-30","Mar 30 Jun","Descanso","DESCANSO",0,"Descanso completo o movilidad articular 15min."),
    W("w19d3","2026-07-01","Mié 1 Jul","Trote suave opcional","SUAVE",3,"Solo si las piernas invitan. 20–25min muy suave, plano. Sin presión."),
    W("w19d4","2026-07-02","Jue 2 Jul","Descanso","DESCANSO",0,"Descanso. Foam roller y estiramientos."),
    W("w19d5","2026-07-03","Vie 3 Jul","Descanso","DESCANSO",0,"Descanso activo. Prioriza el sueño."),
    W("w19d6","2026-07-04","Sáb 4 Jul","Rodaje suave","SUAVE",8,"7:00/km o más lento. Terreno plano. La primera sensación real post-carrera."),
  ]},
  {num:20,dates:"5–11 Jul",phase:"RECUPERACIÓN POST",totalKm:22,days:[
    W("w20d0","2026-07-05","Dom 5 Jul","Descanso","DESCANSO",0,"Descanso completo tras el largo del sábado."),
    W("w20d1","2026-07-06","Lun 6 Jul","Rodaje suave","SUAVE",6,"6:50/km. Piernas sueltas. Evalúa cómo responde el cuerpo."),
    W("w20d2","2026-07-07","Mar 7 Jul","Descanso","DESCANSO",0,"Descanso activo. Movilidad 20min."),
    W("w20d3","2026-07-08","Mié 8 Jul","Rodaje suave","SUAVE",8,"6:45/km. Terreno variado. Sin forzar ritmo."),
    W("w20d4","2026-07-09","Jue 9 Jul","Descanso","DESCANSO",0,"Descanso. Escucha el cuerpo."),
    W("w20d5","2026-07-10","Vie 10 Jul","Descanso","DESCANSO",0,"Descanso activo. Prepara el largo del sábado."),
    W("w20d6","2026-07-11","Sáb 11 Jul","Largo suave","SUAVE",8,"7:00/km. Trail suave. Disfruta. Sin objetivos de ritmo."),
  ]},
];}
// ══════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════
