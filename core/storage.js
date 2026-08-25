const S={
  get:(k)=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
// ── Números con coma decimal (es-CL) ───────────────────────────
// Los teclados de iOS en español ofrecen coma, no punto: los campos aceptan
// ambos separadores y todo lo que se muestra en pantalla usa coma.

// Parsea aceptando coma o punto. NaN si no hay número.
function numIn(v){
  if(v===''||v===null||v===undefined)return NaN;
  return parseFloat(String(v).trim().replace(',','.'));
}

// Formatea con coma, sin ceros de relleno: 10 → "10", 10.5 → "10,5"
function fmtNum(n,dec=1){
  if(n===''||n===null||n===undefined)return '';
  const x=Number(n);
  if(!isFinite(x))return '';
  let s=x.toFixed(dec);
  if(s.includes('.'))s=s.replace(/0+$/,'').replace(/\.$/,'');
  return s.replace('.',',');
}

// Sanea un input decimal mientras se escribe: deja dígitos y un solo separador.
function decInput(el){
  let v=el.value.replace(/[^\d.,]/g,'');
  const i=v.search(/[.,]/);
  if(i>=0)v=v.slice(0,i+1)+v.slice(i+1).replace(/[.,]/g,'');
  if(v!==el.value)el.value=v;
}

const TYPE={
  SUAVE:   {bg:'#061812',bd:'#52c9a088',tx:'#52c9a0',ch:'#0a2419'},
  MEDIO:   {bg:'#1c1505',bd:'#f5b73188',tx:'#f5b731',ch:'#2e2008'},
  INTENSO: {bg:'#1e0a07',bd:'#f4634a88',tx:'#f4634a',ch:'#2e0e08'},
  FUERZA:  {bg:'#080e22',bd:'#7b9cf588',tx:'#7b9cf5',ch:'#0e1535'},
  DESCANSO:{bg:'#0e0e12',bd:'#252530',  tx:'#7d7d92',ch:'#141420'},  // el tipo más apagado, pero legible (4.8:1)
};
const PHASE_C={'BASE':'#52c9a0','DESARROLLO':'#f5b731','PEAK':'#f4634a','PEAK 🔺':'#f4634a','RECUPERACIÓN':'#a98be8','RECUPERACIÓN POST':'#a98be8','TAPER':'#7b9cf5','TAPER FINAL':'#7b9cf5','CARRERA':'#f5b731','REACTIVACIÓN':'#52c9a0','FUERZA EN CUESTA':'#f5b731','SUBIDA SOSTENIDA':'#f4634a','DESCARGA':'#a98be8','CIERRE Y TEST':'#7b9cf5','PROGRESIÓN':'#f5b731','CONSOLIDACIÓN':'#f5b731','TAPER + CARRERA':'#7b9cf5','CIERRE RECUPERACIÓN':'#a98be8'};
const TODAY=new Date().toLocaleDateString('en-CA',{timeZone:'America/Santiago'});
