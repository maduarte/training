// data/races.js — acceso a las carreras del atleta.
//
// Las carreras viven en localStorage (`tw_races`): las crea el wizard o llegan
// importadas desde Excel. Este archivo solo expone los helpers de lectura.
//
// No agregues planes de entrenamiento aquí. Este archivo se descarga en el
// navegador de todos los usuarios, y lo que se escriba se siembra en todos.
// (Ver la sección "Aislamiento entre usuarios" en CLAUDE.md.)

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
