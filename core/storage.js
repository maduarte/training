const S={
  get:(k)=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
const TYPE={
  SUAVE:   {bg:'#061812',bd:'#52c9a088',tx:'#52c9a0',ch:'#0a2419'},
  MEDIO:   {bg:'#1c1505',bd:'#f5b73188',tx:'#f5b731',ch:'#2e2008'},
  INTENSO: {bg:'#1e0a07',bd:'#f4634a88',tx:'#f4634a',ch:'#2e0e08'},
  FUERZA:  {bg:'#080e22',bd:'#7b9cf588',tx:'#7b9cf5',ch:'#0e1535'},
  DESCANSO:{bg:'#0e0e12',bd:'#252530',  tx:'#3a3a4a',ch:'#141420'},
};
const PHASE_C={'BASE':'#52c9a0','DESARROLLO':'#f5b731','PEAK':'#f4634a','PEAK 🔺':'#f4634a','RECUPERACIÓN':'#a98be8','RECUPERACIÓN POST':'#a98be8','TAPER':'#7b9cf5','TAPER FINAL':'#7b9cf5','CARRERA':'#f5b731','REACTIVACIÓN':'#52c9a0','FUERZA EN CUESTA':'#f5b731','SUBIDA SOSTENIDA':'#f4634a','DESCARGA':'#a98be8','CIERRE Y TEST':'#7b9cf5','PROGRESIÓN':'#f5b731','CONSOLIDACIÓN':'#f5b731','TAPER + CARRERA':'#7b9cf5','CIERRE RECUPERACIÓN':'#a98be8'};
const TODAY=new Date().toLocaleDateString('en-CA',{timeZone:'America/Santiago'});
