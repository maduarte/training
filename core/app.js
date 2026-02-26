
// ── Feature Flags ────────────────────────────────────────────
const PACES_AUTO_UPDATE = false; // Set to true to enable auto-updating pace profile from workout logs

let st={
  athleteId:null,raceId:null,raceDate:null,weeks:[],
  weekIdx:0,tab:'cal',reactions:{},logs:{},selected:null,modalDay:null,
  overrides:{},
  chartKm:null,chartT:null,
  paces:{easy:400,fast:300}, // sec/km defaults: 6:40 easy, 5:00 fast
  pacesSet:false,
};

// ══════════════════════════════════════════════════
// SELECTOR
// ══════════════════════════════════════════════════
function openSettings(){
  const body=document.getElementById('settings-body');
  const all=getAllRaces();
  const profile=S.get('tw_profile')||{name:'Mauricio',avatar:'🏔'};
  const raceRows=all.map(r=>{
    const daysLeft=Math.ceil((new Date(r.date)-new Date())/86400000);
    const isActive=r.id===st.raceId;
    const badge=daysLeft>0?`${daysLeft}d`:'🏁';
    const canDelete=getAllRaces().length>1; // can delete as long as at least one remains
    return `<div class="settings-race-row${isActive?' settings-race-active':''}" onclick="closeSettings();launchApp('mauricio','${r.id}')">
      <div>
        <div class="settings-row-label">${r.name}${isActive?'<span style="color:#52c9a0;font-size:10px;font-weight:600;margin-left:6px">● ACTIVA</span>':''}</div>
        <div class="settings-row-sub">${r.date} · ${r.distance}km · ${r.elevation}m D+</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;font-weight:700;color:#f5b731">${badge}</span>
        ${canDelete?`<button class="settings-del-btn" onclick="event.stopPropagation();deleteRace('${r.id}')">🗑</button>`:''}
      </div>
    </div>`;
  }).join('');
  body.innerHTML=`
    <div class="settings-section-label">ATLETA</div>
    <div class="settings-row">
      <div><div class="settings-row-label">${profile.avatar} ${profile.name}</div></div>
      <button class="settings-row-action" onclick="closeSettings();openPaceModal(true)">Ritmos →</button>
    </div>
    <div class="settings-section-label" style="margin-top:16px">CARRERAS</div>
    ${raceRows}
    <button class="settings-new-race-btn" onclick="closeSettings();openNewRaceWizard()">+ Nueva carrera</button>
    <div class="settings-section-label" style="margin-top:16px">DATOS</div>
    <div class="settings-row">
      <div><div class="settings-row-label">Sincronización</div><div class="settings-row-sub">GitHub Gist</div></div>
      <button class="settings-row-action" onclick="closeSettings();openSyncModal()">Sync →</button>
    </div>
  `;
  document.getElementById('settings-panel').classList.remove('hidden');
}
function deleteRace(rid){
  const all=getAllRaces();
  if(all.length<=1){ alert('No puedes eliminar tu única carrera.'); return; }
  const race=getRaceById(rid);
  if(!confirm(`¿Eliminar "${race?.name}" y todos sus datos de entrenamiento?\n\nEsta acción no se puede deshacer.`)) return;

  // Remove from tw_races
  const updated=all.filter(r=>r.id!==rid);
  S.set('tw_races',updated);

  // Wipe all associated data
  ['weeks','logs','rxn','overrides','paces','title'].forEach(k=>{
    try{ localStorage.removeItem(`tw_${k}_${rid}`); }catch(e){}
  });

  // If deleted the active race, switch to another one
  if(st.raceId===rid){
    closeSettings();
    launchApp('mauricio', updated[0].id);
    return;
  }
  openSettings();
}
function closeSettings(){
  document.getElementById('settings-panel').classList.add('hidden');
}
function showSelector(){ const rid=getActiveRaceId(); if(rid) launchApp('mauricio',rid); else openOnboardingWizard(); }
function goSelector(){ showSelector(); }

function launchApp(aid,rid){
  const race=getRaceById(rid);
  if(!race)return;
  st.athleteId=aid; st.raceId=rid; st.raceDate=race.date;
  S.set('tw_last_aid',aid); S.set('tw_last_rid',rid);
  st.weeks=JSON.parse(JSON.stringify(race.weeks));
  const savedW=S.get(`tw_weeks_${rid}`);
  if(savedW)st.weeks=savedW;
  st.reactions=S.get(`tw_rxn_${rid}`)||{};
  st.logs=S.get(`tw_logs_${rid}`)||{};
  st.overrides=S.get(`tw_overrides_${rid}`)||{};
  // Load paces
  const savedPaces=S.get(`tw_paces_${rid}`);
  if(savedPaces){st.paces=savedPaces;st.pacesSet=true;}
  else{st.paces={easy:400,fast:300};st.pacesSet=false;}
  // Find current week
  const ti=st.weeks.findIndex(w=>w.days.some(d=>d.date===TODAY));
  st.weekIdx=ti>=0?ti:0;
  // Setup header
  const savedTitle=S.get(`tw_title_${rid}`);
  document.getElementById('app-title').textContent=savedTitle||race.defaultTitle||`⛰ ${race.name}`;
  document.getElementById('race-sub').textContent=`${race.distance}km · ${race.elevation}m D+`;
  // Hide selector, show app
  document.getElementById('app').classList.remove('hidden');
  st.tab='cal';
  switchTab('cal');
  renderCal();
  updateCountdown();
  updatePacePill();
  // Show banner if paces not configured
  document.getElementById('pace-banner').classList.toggle('show',!st.pacesSet);
  // Auto-open modal on first launch (slight delay for UX)
  if(!st.pacesSet)setTimeout(()=>openPaceModal(false),700);
}

// ══════════════════════════════════════════════════
// COUNTDOWN
// ══════════════════════════════════════════════════
function updateCountdown(){
  if(!st.raceDate)return;
  const diff=Math.ceil((new Date(st.raceDate)-new Date())/86400000);
  const el=document.getElementById('race-countdown');
  if(diff>0)el.innerHTML=`<div style="color:#aaa;font-size:9px;letter-spacing:1px">FALTAN</div><div class="cd-num" style="color:#f5b731">${diff}</div><div style="color:#aaa;font-size:9px;letter-spacing:1px">DÍAS</div>`;
  else if(diff===0)el.innerHTML=`<div class="cd-num" style="color:#f4634a">HOY 🏁</div>`;
  else el.innerHTML=`<div style="color:#52c9a0;font-size:11px;font-weight:700">¡TERMINADO! 🏆</div>`;
}

// ══════════════════════════════════════════════════
// CALENDAR RENDER
// ══════════════════════════════════════════════════
function renderCal(){
  const w=st.weeks[st.weekIdx];
  document.getElementById('week-num').textContent=typeof w.num==='number'?`Semana ${String(w.num).padStart(2,'0')}`:'Carrera 🏁';
  document.getElementById('week-dates').textContent=w.dates;
  const pc=PHASE_C[w.phase]||'#888';
  const pb=document.getElementById('phase-badge');
  pb.textContent=w.phase;
  pb.style.cssText=`display:inline-block;margin-top:4px;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:1px;background:${pc}22;color:${pc};border:1px solid ${pc}44`;
  document.getElementById('week-km').textContent=w.totalKm+' km planificados';
  // Legend
  document.getElementById('legend').innerHTML=
    ['SUAVE','MEDIO','INTENSO','FUERZA','DESCANSO'].map(t=>
      `<div class="lg-item" style="color:${TYPE[t].tx}"><div class="lg-dot" style="background:${TYPE[t].tx}"></div>${t}</div>`
    ).join('');
  document.getElementById('swap-banner').classList.toggle('show',st.selected!==null);
  // Cards
  const grid=document.getElementById('cards-grid');
  grid.innerHTML='';
  w.days.forEach((day,i)=>{
    const ts=TYPE[day.type];
    const log=st.logs[day.id];
    const rxn=st.reactions[day.id];
    const isToday=day.date===TODAY;
    const isSel=st.selected===i;
    const isTarget=st.selected!==null&&!isSel;
    const card=document.createElement('div');
    card.className=`day-card tc-${day.type}${isSel?' selected':''}${isTarget?' swap-target':''}`;
    if(isSel)card.style.boxShadow=`0 0 0 2px ${ts.tx},0 0 20px ${ts.tx}33`;
    else if(isToday)card.style.boxShadow=`0 0 0 1.5px ${ts.tx}55`;

    const rxnBtns=['😊','😐','😞'].map(em=>{
      let cls='rxn-btn'+(rxn?em===rxn?' active':' inactive':'');
      return `<button class="${cls}" onclick="cardReact(event,'${day.id}','${em}')">${em}</button>`;
    }).join('');

    let rightContent='';
    if(day.type==='FUERZA'){
      rightContent=`<div class="card-sets">${day.sets||3}×</div>`;
    } else if(day.km>0){
      const estSec=estSeconds(day);
      const durStr=st.pacesSet?fmtDur(estSec):'';
      rightContent=`<div class="card-km">${day.km}<span>km</span></div>`+
        (durStr?`<div class="card-dur has-dur"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${durStr}</div>`:'');
    }
    const logLine=log?.distance?`<div class="card-logged">✓ ${log.distance}km${log.time?' · '+log.time:''}</div>`:'';

    card.innerHTML=`
      <div class="swap-badge">MOVER</div>
      <div class="card-left">
        <div class="card-day">${isToday?'<span class="today-dot"></span>':''}${day.label}</div>
        <div class="card-session">${day.session}</div>
        <span class="card-chip">${day.type}</span>
        ${logLine}
      </div>
      <div class="card-right">
        ${rightContent}
        <div class="card-reacts">${rxnBtns}</div>
      </div>
      ${log?.distance?'<div class="log-dot"></div>':''}
      ${st.overrides[day.id]?'<div class="override-dot" title="Editado"></div>':''}`;

    let pressTimer;
    card.addEventListener('touchstart',()=>{pressTimer=setTimeout(()=>{if(st.selected===null){st.selected=i;renderCal();navigator.vibrate&&navigator.vibrate(60);}},500);},{passive:true});
    card.addEventListener('touchend',()=>clearTimeout(pressTimer),{passive:true});
    card.addEventListener('touchmove',()=>clearTimeout(pressTimer),{passive:true});
    card.addEventListener('click',e=>{
      if(e.target.closest('.rxn-btn'))return;
      if(st.selected!==null){st.selected===i?(st.selected=null,renderCal()):swapCards(st.selected,i,st.weekIdx);st.selected=null;}
      else openModal(i);
    });
    grid.appendChild(card);
  });
  const ti=w.days.findIndex(d=>d.date===TODAY);
  if(ti>=0)setTimeout(()=>{const c=grid.querySelectorAll('.day-card')[ti];c&&c.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});},120);
  // Show "add next race" banner in CARRERA or RECUPERACIÓN weeks
  const showBanner=(w.phase==='CARRERA'||w.phase?.startsWith('RECUPERACIÓN'));
  let bannerEl=document.getElementById('next-race-banner-cal');
  if(!bannerEl){
    bannerEl=document.createElement('div');
    bannerEl.id='next-race-banner-cal';
    const calSection=document.getElementById('cal-section')||document.getElementById('cards-grid')?.parentElement?.parentElement;
    if(calSection) calSection.appendChild(bannerEl);
  }
  if(showBanner){
    bannerEl.innerHTML=`<div class="next-race-banner" onclick="openNewRaceWizard()">
      <div><div class="nrb-text">¿Ya tienes tu próxima carrera?</div><div class="nrb-sub">Regístrala para continuar el timeline</div></div>
      <button class="nrb-btn">+ Agregar →</button>
    </div>`;
    bannerEl.style.display='block';
  } else {
    bannerEl.style.display='none';
  }
}

function swapCards(a,b,wi){
  const weeks=JSON.parse(JSON.stringify(st.weeks));
  const d=weeks[wi].days;
  ['session','type','km','desc','sets','exercises'].forEach(f=>{const tmp=d[a][f];d[a][f]=d[b][f];d[b][f]=tmp;});
  st.weeks=weeks;
  st.selected=null;
  S.set(`tw_weeks_${st.raceId}`,weeks);
  renderCal();
}

function cardReact(e,dayId,emoji){
  e.stopPropagation();
  const cur=st.reactions[dayId];
  st.reactions={...st.reactions,[dayId]:cur===emoji?null:emoji};
  S.set(`tw_rxn_${st.raceId}`,st.reactions);
  renderCal();
}

// ══════════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════
// PACE PROFILE FUNCTIONS
// ══════════════════════════════════════════════════
function fmtPace(secPerKm){
  const m=Math.floor(secPerKm/60);
  const s=Math.round(secPerKm%60);
  return `${m}:${String(s).padStart(2,'0')}`;
}
function parsePaceMM(minStr,secStr,fallback){
  const m=parseInt(minStr)||0, s=parseInt(secStr)||0;
  if(!m&&!s)return fallback;
  const total=m*60+s;
  return(total>=180&&total<=900)?total:fallback; // sanity: 3:00–15:00/km
}
function fmtDur(sec){
  if(!sec||sec<=0)return '';
  const h=Math.floor(sec/3600);
  const m=Math.round((sec%3600)/60);
  if(h>0)return `~${h}h${m>0?' '+m+'m':''}`;
  return `~${m}m`;
}

function estSeconds(day){
  if(day.type==='FUERZA')return 3600;
  if(day.type==='DESCANSO'||day.km<=0)return 0;
  const {easy,fast}=st.paces;
  let pace;
  if(day.type==='SUAVE')pace=easy;
  else if(day.type==='INTENSO')pace=easy*0.65+fast*0.35; // intervals have WU/CD
  else if(day.type==='MEDIO')pace=easy*0.55+fast*0.45;
  else pace=easy;
  return Math.round(day.km*pace);
}

function updatePacePill(){
  const {easy,fast}=st.paces;
  document.getElementById('pp-easy').textContent='🟢 '+fmtPace(easy);
  document.getElementById('pp-fast').textContent='🔴 '+fmtPace(fast);
}

function openPaceModal(canCancel){
  const {easy,fast}=st.paces;
  document.getElementById('pm-easy-min').value=Math.floor(easy/60);
  document.getElementById('pm-easy-sec').value=easy%60;
  document.getElementById('pm-fast-min').value=Math.floor(fast/60);
  document.getElementById('pm-fast-sec').value=fast%60;
  document.getElementById('pm-cancel').style.display=canCancel?'block':'none';
  document.getElementById('pace-overlay').classList.add('open');
}
function closePaceModal(){
  document.getElementById('pace-overlay').classList.remove('open');
}
function savePaceSettings(){
  const easy=parsePaceMM(document.getElementById('pm-easy-min').value,document.getElementById('pm-easy-sec').value,400);
  const fast=parsePaceMM(document.getElementById('pm-fast-min').value,document.getElementById('pm-fast-sec').value,300);
  st.paces={easy,fast};
  st.pacesSet=true;
  S.set(`tw_paces_${st.raceId}`,st.paces);
  closePaceModal();
  updatePacePill();
  document.getElementById('pace-banner').classList.remove('show');
  renderCal(); // re-render to update estimated durations
}

function updatePacesFromLog(day,totalSec,dist){
  // Only learn from clean easy or fast workouts with valid data
  if(!dist||dist<3||!totalSec||totalSec<300)return;
  if(day.type!=='SUAVE'&&day.type!=='INTENSO')return;
  const actualPace=totalSec/dist;
  // Sanity check: must be between 3:00 and 15:00 /km
  if(actualPace<180||actualPace>900)return;

  const key=day.type==='SUAVE'?'easy':'fast';
  const histKey=`tw_ph_${key}_${st.raceId}`;
  let hist=S.get(histKey)||[];
  hist.unshift(actualPace);
  hist=hist.slice(0,6); // keep last 6 workouts
  S.set(histKey,hist);

  // Weighted average: most recent gets highest weight
  const weights=[6,5,4,3,2,1];
  let sumW=0,sumP=0;
  hist.forEach((p,i)=>{const w=weights[i]||1;sumW+=w;sumP+=p*w;});
  const newPace=Math.round(sumP/sumW);

  st.paces[key]=newPace;
  S.set(`tw_paces_${st.raceId}`,st.paces);
  updatePacePill();
}

function calcPace(){
  const h=parseInt(document.getElementById('m-th')?.value)||0;
  const m=parseInt(document.getElementById('m-tm')?.value)||0;
  const s=parseInt(document.getElementById('m-ts')?.value)||0;
  const dist=parseFloat(document.getElementById('m-dist')?.value)||0;
  const el=document.getElementById('m-pace');
  if(!el)return;
  if(dist>0&&(h||m||s)){
    const spk=(h*3600+m*60+s)/dist;
    el.textContent=`⟶ ritmo medio ${Math.floor(spk/60)}:${String(Math.round(spk%60)).padStart(2,'0')} /km`;
    el.className='m-pace has-pace';
  } else {el.textContent='';el.className='m-pace';}
}

function openModal(i){
  const day=st.weeks[st.weekIdx].days[i];
  st.modalDay=day;
  // Restore view-mode elements (may have been hidden in edit mode)
  document.getElementById('m-title').style.display='';
  document.getElementById('m-chips').style.display='';
  document.getElementById('m-desc').style.display='';
  const editBtn=document.getElementById('m-edit-btn');
  editBtn.style.display='';
  editBtn.classList.toggle('active',!!st.overrides[day.id]);
  const ts=TYPE[day.type];
  const log=st.logs[day.id];
  const rxn=st.reactions[day.id];
  document.getElementById('m-day').textContent=day.label;
  const mt=document.getElementById('m-title');
  mt.textContent=day.session;
  mt.style.color=ts.tx;
  document.getElementById('m-chips').innerHTML=
    `<span class="m-chip" style="background:${ts.ch};color:${ts.tx}">${day.type}</span>`+
    (day.type==='FUERZA'?`<span class="m-km" style="color:${ts.tx}">${day.sets||3} series</span>`:
      day.km>0?`<span class="m-km" style="color:${ts.tx}">${day.km} km</span>`+
        (st.pacesSet&&day.type!=='DESCANSO'?`<span class="m-km" style="color:#7070a0;font-size:12px">· ${fmtDur(estSeconds(day))}</span>`:''):'');
  document.getElementById('m-desc').textContent=day.desc;

  // Body: FUERZA vs run
  const body=document.getElementById('m-body');
  if(day.type==='FUERZA'&&day.exercises?.length){
    body.innerHTML=`
      <div class="m-sets-badge">🔁 ${day.sets||3} SERIES</div>
      <div class="ex-list" id="ex-list">
        ${day.exercises.map((ex,idx)=>`
          <div class="ex-card" onclick="showExInfo('${ex.name.replace(/'/g,"\\'")}')">
            <div class="ex-card-left">
              <div class="ex-card-name">${ex.name}</div>
              <div class="ex-card-hint">Toca para ver descripción</div>
            </div>
            <div class="ex-card-reps">${ex.reps}</div>
          </div>`).join('')}
      </div>
      <div class="m-rxn-row">
        <span class="m-rxn-lbl">SENSACIÓN</span>
        <button class="m-rxn-btn${rxn==='😊'?' active':rxn?' inactive':''}" data-e="😊" onclick="reactModal('😊')">😊</button>
        <button class="m-rxn-btn${rxn==='😐'?' active':rxn?' inactive':''}" data-e="😐" onclick="reactModal('😐')">😐</button>
        <button class="m-rxn-btn${rxn==='😞'?' active':rxn?' inactive':''}" data-e="😞" onclick="reactModal('😞')">😞</button>
      </div>`;
  } else {
    // Time pre-fill
    let th='',tm='',ts2='';
    if(log?.th!==undefined){th=log.th;tm=log.tm;ts2=log.ts;}
    else{const est=estSeconds(day);th=Math.floor(est/3600)||'';tm=Math.floor((est%3600)/60)||'';ts2=est%60||'';}
    const dist=log?.distance!==undefined?log.distance:(day.km>0?day.km:'');
    body.innerHTML=`
      <div class="m-sec">Registrar entrenamiento real</div>
      <div class="m-lbl">TIEMPO REAL</div>
      <div class="m-time-row">
        <div><div class="m-lbl-sub">hh</div><input class="m-input" id="m-th" type="number" min="0" max="23" value="${th}" inputmode="numeric" oninput="calcPace()"></div>
        <div><div class="m-lbl-sub">mm</div><input class="m-input" id="m-tm" type="number" min="0" max="59" value="${tm}" inputmode="numeric" oninput="calcPace()"></div>
        <div><div class="m-lbl-sub">ss</div><input class="m-input" id="m-ts" type="number" min="0" max="59" value="${ts2}" inputmode="numeric" oninput="calcPace()"></div>
      </div>
      <div class="m-dist-row">
        <div class="m-lbl">DISTANCIA (km)</div>
        <input class="m-input-dist" id="m-dist" type="number" min="0" step="0.1" value="${dist}" inputmode="decimal" oninput="calcPace()">
      </div>
      <div class="m-pace" id="m-pace"></div>
      <div class="m-rxn-row">
        <span class="m-rxn-lbl">SENSACIÓN</span>
        <button class="m-rxn-btn${rxn==='😊'?' active':rxn?' inactive':''}" data-e="😊" onclick="reactModal('😊')">😊</button>
        <button class="m-rxn-btn${rxn==='😐'?' active':rxn?' inactive':''}" data-e="😐" onclick="reactModal('😐')">😐</button>
        <button class="m-rxn-btn${rxn==='😞'?' active':rxn?' inactive':''}" data-e="😞" onclick="reactModal('😞')">😞</button>
      </div>
      <button id="m-save" style="background:linear-gradient(135deg,${ts.bd.replace('88','')},${ts.tx}aa)" onclick="saveLog()">GUARDAR ENTRENAMIENTO</button>
      <div id="m-saved" style="display:none;text-align:center;color:#52c9a0;font-size:14px;font-weight:700;letter-spacing:1.5px;padding:10px 0">✓ GUARDADO</div>`;
    setTimeout(calcPace,50);
  }

  document.getElementById('modal-overlay').style.display='flex';
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal(e){
  if(e&&e.target!==document.getElementById('modal-overlay'))return;
  document.getElementById('modal-overlay').style.display='none';
  document.getElementById('modal-overlay').classList.remove('open');
  st.modalDay=null;
}

// ══════════════════════════════════════════════════
// EDIT MODE
// ══════════════════════════════════════════════════
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

let _editExercises=[];
let _editCurrentType='';

function openEditMode(){
  if(!st.modalDay)return;
  const day=st.modalDay;
  _editExercises=day.exercises?JSON.parse(JSON.stringify(day.exercises)):[];
  _editCurrentType=day.type;
  // Hide view-mode elements
  document.getElementById('m-title').style.display='none';
  document.getElementById('m-chips').style.display='none';
  document.getElementById('m-desc').style.display='none';
  document.getElementById('m-edit-btn').style.display='none';
  document.getElementById('m-body').innerHTML=_renderEditForm(day);
}

function _renderEditForm(day){
  const types=['SUAVE','MEDIO','INTENSO','FUERZA','DESCANSO'];
  const typeBtns=types.map(t=>{
    const c=TYPE[t].tx;
    const sel=t===_editCurrentType;
    return `<button class="edit-type-btn${sel?' sel':''}" style="--sel-c:${c}" data-type="${t}" onclick="editSelectType('${t}')">${t}</button>`;
  }).join('');
  const hasOverride=!!st.overrides[day.id];
  return `
    <div class="edit-sec-lbl">TIPO DE ENTRENAMIENTO</div>
    <div class="edit-type-row">${typeBtns}</div>
    <div id="edit-fields">${_renderEditFields(_editCurrentType,day)}</div>
    <button class="edit-save-btn" onclick="saveEdit()">✓ GUARDAR CAMBIOS</button>
    <button class="edit-cancel-btn" onclick="closeEditMode()">Cancelar</button>
    ${hasOverride?`<button class="edit-restore-btn" onclick="restoreOriginal()">↺ Restaurar entrenamiento original</button>`:''}`;
}

function _renderEditFields(type,day){
  if(type==='FUERZA'){
    return `
      <div class="edit-lbl edit-field-mb" style="margin-bottom:4px">SESIÓN</div>
      <input class="edit-input edit-field-mb" id="edit-session" value="${escHtml(day.session||'')}" placeholder="Nombre de la sesión">
      <div class="edit-lbl" style="margin-bottom:4px">SERIES</div>
      <input class="edit-input-sm edit-field-mb" id="edit-sets" type="number" min="1" max="10" value="${day.sets||3}" inputmode="numeric">
      <div class="edit-lbl" style="margin-top:10px;margin-bottom:4px">NOTAS</div>
      <textarea class="edit-textarea edit-field-mb" id="edit-desc" rows="3" placeholder="Descripción...">${escHtml(day.desc||'')}</textarea>
      <div class="edit-lbl" style="margin-bottom:8px">EJERCICIOS</div>
      <div id="edit-ex-list">${_renderExList()}</div>
      <button class="edit-add-ex" onclick="editAddEx()">+ Agregar ejercicio</button>`;
  }else{
    const showKm=type!=='DESCANSO';
    return `
      <div class="edit-lbl" style="margin-bottom:4px">SESIÓN</div>
      <input class="edit-input edit-field-mb" id="edit-session" value="${escHtml(day.session||'')}" placeholder="Nombre de la sesión">
      ${showKm?`<div class="edit-lbl" style="margin-bottom:4px">DISTANCIA (km)</div>
      <input class="edit-input-sm edit-field-mb" id="edit-km" type="number" min="0" step="0.5" value="${day.km||''}" placeholder="0" inputmode="decimal">`:''}
      <div class="edit-lbl" style="margin-top:${showKm?10:0}px;margin-bottom:4px">DESCRIPCIÓN</div>
      <textarea class="edit-textarea edit-field-mb" id="edit-desc" rows="4" placeholder="Descripción del entrenamiento...">${escHtml(day.desc||'')}</textarea>`;
  }
}

function _renderExList(){
  if(!_editExercises.length)return'<div style="font-size:12px;color:#444;padding:4px 0 10px">Sin ejercicios. Agrega uno abajo.</div>';
  return _editExercises.map((ex,i)=>`
    <div class="edit-ex-row">
      <input class="edit-ex-name" value="${escHtml(ex.name)}" placeholder="Ejercicio" oninput="_editExercises[${i}].name=this.value">
      <input class="edit-ex-reps" value="${escHtml(ex.reps)}" placeholder="reps" oninput="_editExercises[${i}].reps=this.value">
      <button class="edit-ex-del" onclick="editExDel(${i})">×</button>
    </div>`).join('');
}

function editSelectType(t){
  if(!st.modalDay)return;
  // Capture current field values before switching
  const prevType=_editCurrentType;
  _editCurrentType=t;
  // Update the modalDay type for rendering (doesn't persist yet)
  const daySnap={...st.modalDay,
    session:document.getElementById('edit-session')?.value??st.modalDay.session,
    km:parseFloat(document.getElementById('edit-km')?.value)||st.modalDay.km,
    desc:document.getElementById('edit-desc')?.value??st.modalDay.desc,
    sets:parseInt(document.getElementById('edit-sets')?.value)||st.modalDay.sets,
    type:t
  };
  // If switching to FUERZA and had no exercises, start fresh
  if(t==='FUERZA'&&prevType!=='FUERZA'&&!_editExercises.length)_editExercises=[];
  // Update type button styles
  document.querySelectorAll('.edit-type-btn').forEach(btn=>{
    const bt=btn.dataset.type;
    btn.className='edit-type-btn'+(bt===t?' sel':'');
    btn.style.setProperty('--sel-c',TYPE[bt].tx);
  });
  // Re-render fields
  document.getElementById('edit-fields').innerHTML=_renderEditFields(t,daySnap);
}

function editAddEx(){
  _editExercises.push({name:'',reps:''});
  document.getElementById('edit-ex-list').innerHTML=_renderExList();
  const inputs=document.querySelectorAll('.edit-ex-name');
  if(inputs.length)inputs[inputs.length-1].focus();
}

function editExDel(i){
  _editExercises.splice(i,1);
  document.getElementById('edit-ex-list').innerHTML=_renderExList();
}

function saveEdit(){
  if(!st.modalDay)return;
  const day=st.modalDay;
  const type=_editCurrentType;
  const session=(document.getElementById('edit-session')?.value||'').trim()||day.session;
  const desc=(document.getElementById('edit-desc')?.value||'').trim();
  const km=type!=='FUERZA'&&type!=='DESCANSO'?parseFloat(document.getElementById('edit-km')?.value)||0:0;
  const sets=type==='FUERZA'?parseInt(document.getElementById('edit-sets')?.value)||3:day.sets;
  const exercises=type==='FUERZA'?_editExercises.filter(e=>e.name.trim()):undefined;

  // Find actual day in st.weeks
  let targetDay=null;
  for(const w of st.weeks){for(const d of w.days){if(d.id===day.id){targetDay=d;break;}}if(targetDay)break;}
  if(!targetDay)return;

  // Save original if first edit
  if(!st.overrides[day.id]){
    st.overrides[day.id]={
      session:targetDay.session,type:targetDay.type,km:targetDay.km,
      desc:targetDay.desc,sets:targetDay.sets,
      exercises:targetDay.exercises?JSON.parse(JSON.stringify(targetDay.exercises)):undefined
    };
  }

  // Apply changes
  targetDay.session=session;
  targetDay.type=type;
  targetDay.km=km;
  targetDay.desc=desc;
  if(sets!==undefined)targetDay.sets=sets;
  if(exercises!==undefined)targetDay.exercises=exercises;

  // Persist
  S.set(`tw_weeks_${st.raceId}`,st.weeks);
  S.set(`tw_overrides_${st.raceId}`,st.overrides);

  // Close and refresh
  st.modalDay=null;
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('modal-overlay').style.display='none';
  renderCal();
}

function closeEditMode(){
  // Re-open modal in view mode with original (unsaved) data
  const id=st.modalDay?.id;
  if(!id)return;
  let idx=-1;
  const days=st.weeks[st.weekIdx].days;
  idx=days.findIndex(d=>d.id===id);
  if(idx>=0)openModal(idx);
  else{document.getElementById('modal-overlay').classList.remove('open');document.getElementById('modal-overlay').style.display='none';}
}

function restoreOriginal(){
  if(!st.modalDay||!st.overrides[st.modalDay.id])return;
  const orig=st.overrides[st.modalDay.id];
  let targetDay=null;
  for(const w of st.weeks){for(const d of w.days){if(d.id===st.modalDay.id){targetDay=d;break;}}if(targetDay)break;}
  if(!targetDay)return;
  Object.assign(targetDay,orig);
  delete st.overrides[st.modalDay.id];
  S.set(`tw_weeks_${st.raceId}`,st.weeks);
  S.set(`tw_overrides_${st.raceId}`,st.overrides);
  st.modalDay=null;
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('modal-overlay').style.display='none';
  renderCal();
}

function reactModal(emoji){
  if(!st.modalDay)return;
  const cur=st.reactions[st.modalDay.id];
  const next=cur===emoji?null:emoji;
  st.reactions={...st.reactions,[st.modalDay.id]:next};
  S.set(`tw_rxn_${st.raceId}`,st.reactions);
  document.querySelectorAll('.m-rxn-btn').forEach(b=>{
    b.className='m-rxn-btn'+(next?b.dataset.e===next?' active':' inactive':'');
  });
  renderCal();
}

function saveLog(){
  if(!st.modalDay)return;
  const th=parseInt(document.getElementById('m-th')?.value)||0;
  const tm=parseInt(document.getElementById('m-tm')?.value)||0;
  const ts2=parseInt(document.getElementById('m-ts')?.value)||0;
  const dist=parseFloat(document.getElementById('m-dist')?.value)||0;
  const timeStr=th>0?`${th}:${String(tm).padStart(2,'0')}:${String(ts2).padStart(2,'0')}`:`${tm}:${String(ts2).padStart(2,'0')}`;
  let pace='';
  if(dist>0&&(th||tm||ts2)){const spk=(th*3600+tm*60+ts2)/dist;pace=`${Math.floor(spk/60)}:${String(Math.round(spk%60)).padStart(2,'0')}/km`;}
  st.logs={...st.logs,[st.modalDay.id]:{th,tm,ts:ts2,distance:dist||null,time:timeStr,pace}};
  S.set(`tw_logs_${st.raceId}`,st.logs);
  // Update pace profile from real data (controlled by feature flag)
  if(PACES_AUTO_UPDATE && dist>0)updatePacesFromLog(st.modalDay,th*3600+tm*60+ts2,dist);
  renderCal();
  document.getElementById('m-save').style.display='none';
  document.getElementById('m-saved').style.display='block';
  setTimeout(()=>closeModal({target:document.getElementById('modal-overlay')}),900);
}

// Exercise overlay
function showExInfo(name){
  const desc=EX[name];
  if(!desc)return;
  document.getElementById('ex-box-name').textContent=name;
  document.getElementById('ex-box-desc').textContent=desc;
  document.getElementById('ex-overlay').classList.add('open');
}
function closeExOverlay(){
  document.getElementById('ex-overlay').classList.remove('open');
}

// Swipe down to close modal
let mTY=0;
document.getElementById('modal').addEventListener('touchstart',e=>{mTY=e.touches[0].clientY;},{passive:true});
document.getElementById('modal').addEventListener('touchend',e=>{if(e.changedTouches[0].clientY-mTY>80)closeModal({target:document.getElementById('modal-overlay')});},{passive:true});

// ══════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════
function renderStats(){
  let totKm=0,totMins=0,totPlan=0,adhPlan=0,adhKm=0;
  const kmData=[],timeData=[];
  st.weeks.forEach(w=>{
    let wkm=0,wm=0;
    w.days.forEach(d=>{
      const l=st.logs[d.id];
      if(l?.distance)wkm+=parseFloat(l.distance)||0;
      if(l?.th!==undefined)wm+=(l.th||0)*60+(l.tm||0)+(l.ts||0)/60;
      else if(l?.time){const p=l.time.split(':').map(Number);wm+=(p[0]||0)*60+(p[1]||0);}
      if(d.date<TODAY&&d.type!=='DESCANSO'){
        adhPlan+=d.km||0;
        adhKm+=parseFloat(l?.distance||0)||0;
      }
    });
    totKm+=wkm;totMins+=wm;totPlan+=w.totalKm;
    const lb=typeof w.num==='number'?`S${w.num}`:'🏁';
    kmData.push({lb,plan:w.totalKm,real:Math.round(wkm*10)/10});
    timeData.push({lb,m:Math.round(wm)});
  });
  const adh=adhPlan?Math.round(adhKm/adhPlan*100):0;
  const semAct=st.weeks.filter(w=>w.days.some(d=>{const l=st.logs[d.id];return l?.distance||l?.time;})).length;
  const fmt=m=>m>=60?`${Math.floor(m/60)}h ${Math.round(m%60)}m`:`${Math.round(m)}m`;
  document.getElementById('stat-grid').innerHTML=`
    <div class="stat-card" style="border-color:#52c9a033"><div class="stat-val" style="color:#52c9a0">${Math.round(totKm)}</div><div class="stat-lbl">km reales</div></div>
    <div class="stat-card" style="border-color:#7b9cf533"><div class="stat-val" style="color:#7b9cf5;font-size:${totMins>0?'18px':'24px'}">${totMins>0?fmt(totMins):'–'}</div><div class="stat-lbl">tiempo total</div></div>
    <div class="stat-card" style="border-color:#f5b73133"><div class="stat-val" style="color:#f5b731">${adh}%</div><div class="stat-lbl">adherencia</div></div>
    <div class="stat-card" style="border-color:#f4634a33"><div class="stat-val" style="color:#f4634a">${semAct}</div><div class="stat-lbl">semanas activas</div></div>`;
  if(st.chartKm){st.chartKm.destroy();st.chartKm=null;}
  if(st.chartT){st.chartT.destroy();st.chartT=null;}
  const cOpts={responsive:true,maintainAspectRatio:true,plugins:{legend:{labels:{color:'#4a4a5a',font:{size:10}}}},scales:{x:{ticks:{color:'#3a3a4a',font:{size:9},maxRotation:0,autoSkip:true,maxTicksLimit:10},grid:{color:'#141420'}},y:{ticks:{color:'#3a3a4a',font:{size:9}},grid:{color:'#141420'}}}};
  st.chartKm=new Chart(document.getElementById('chart-km').getContext('2d'),{type:'line',data:{labels:kmData.map(d=>d.lb),datasets:[
    {label:'Plan',data:kmData.map(d=>d.plan),borderColor:'#2a2a35',borderDash:[4,2],borderWidth:1.5,pointRadius:0,tension:.3},
    {label:'Real',data:kmData.map(d=>d.real),borderColor:'#52c9a0',backgroundColor:'#52c9a015',borderWidth:2.5,pointRadius:3,pointBackgroundColor:'#52c9a0',fill:true,tension:.3},
  ]},options:{...cOpts}});
  st.chartT=new Chart(document.getElementById('chart-t').getContext('2d'),{type:'bar',data:{labels:timeData.map(d=>d.lb),datasets:[{label:'min',data:timeData.map(d=>d.m),backgroundColor:'#7b9cf544',borderColor:'#7b9cf5',borderWidth:1,borderRadius:3}]},options:{...cOpts,plugins:{legend:{display:false}}}});
  const rc={'😊':0,'😐':0,'😞':0};
  Object.values(st.reactions).forEach(r=>{if(r&&rc[r]!==undefined)rc[r]++;});
  const tot=Object.values(rc).reduce((s,c)=>s+c,0);
  document.getElementById('rxn-sum').innerHTML=tot===0?
    '<div style="color:#2a2a35;font-size:12px">Registra entrenamientos para ver sensaciones.</div>':
    ['😊','😐','😞'].map(em=>`<div class="rxn-st"><div class="rxn-em">${em}</div><div class="rxn-ct">${rc[em]}</div><div class="rxn-pct">${Math.round(rc[em]/tot*100)}%</div></div>`).join('');
}

// ══════════════════════════════════════════════════
// TABS + NAV
// ══════════════════════════════════════════════════
function switchTab(tab){
  st.tab=tab;
  document.getElementById('tab-cal').classList.toggle('hidden',tab!=='cal');
  document.getElementById('tab-stats').classList.toggle('hidden',tab!=='stats');
  document.getElementById('tbtn-cal').classList.toggle('active',tab==='cal');
  document.getElementById('tbtn-stats').classList.toggle('active',tab==='stats');
  if(tab==='stats')renderStats();
}
document.getElementById('btn-prev').addEventListener('click',()=>{if(st.weekIdx>0){st.weekIdx--;st.selected=null;renderCal();}});
document.getElementById('btn-next').addEventListener('click',()=>{if(st.weekIdx<st.weeks.length-1){st.weekIdx++;st.selected=null;renderCal();}});
let sx=0,sy=0;
document.getElementById('week-nav').addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
document.getElementById('week-nav').addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-sx,dy=Math.abs(e.changedTouches[0].clientY-sy);
  if(Math.abs(dx)>50&&dy<40){if(dx<0&&st.weekIdx<st.weeks.length-1){st.weekIdx++;renderCal();}else if(dx>0&&st.weekIdx>0){st.weekIdx--;renderCal();}}
},{passive:true});

// ══════════════════════════════════════════════════
// EDITABLE TITLE
// ══════════════════════════════════════════════════
function initTitle(){
  const el=document.getElementById('app-title');
  el.addEventListener('blur',()=>{
    const v=el.textContent.trim();
    if(v&&st.raceId)S.set(`tw_title_${st.raceId}`,v);
  });
  el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();el.blur();}});
}

// ══════════════════════════════════════════════════
// PWA
// ══════════════════════════════════════════════════
function setupPWA(){
  const icon192=`data:image/png;base64,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`;
  const icon512=`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359DweedDamxmAAQEUWQ1CQUXS39z1C8my9gWShkCyhkCihk8oHvIUD+YQJARBR1ApCq3F+RTyn9tyoBgf1V++SbFfoslDblsaz9VQCLKOaLsPKF/ZUAiyzeExPRXnRKRESlhjxXRDFXBMACPGRP2OaWEhERUQMwASAiIoohJgBEREQxxASAiIgohpgAEBERxRATACIiohhiAkBERBRDTACIiIhiiAkAERFRDDEBICIiiiEmAERERDHEBICIiCiGmAAQERHFEBMAIiKiGGICQEREFENMAIiIiGKICQAREVEMMQEgIiKKISYAREREMcQEgIiIKIaYABAREcUQEwAiIqIYYgJAREQUQ0wAiIiIYogJABERUQwxASAiIoohJgBEREQxxASAiIgohpgAEBERxRATACIiohhiAkBERBRDTACIiIhiiAkAERFRDDEBICIiiiEmAERERDHEBICIiCiGmAAQERHFEBMAIiKiGGICQEREFENMAIiIiGJIDToAImoMM2Fi9qKDMXfRwZg8cyomTJ+EVGc7zIQJAEj3p7F35x5s37AVm17diNXPvow1z72MdH864MiJyA9CbzOtoIMgIn8IIXDoMQtx/PknYeEJi6HqmqPzc5ksnn90GR7740NY8eQLsCx+XRA1CyYARE3qyFOX4LwPX4SpB0335Hqvr3kNf7zmNjz716c9uR4RBYsJAFGTmTBtEt73pStw8FGH+XL9l55ajl9++zpsf32rL9cnosZgAkDURBaf8hZ84CsfR7I16et90n39+OWV1+DJex739T5E5B9FMdSvBR0EEdVHCIELPvouXPaFK6A5HOd3Q9U0LD7lLdBNHS8/86Lv9yMi7zEBIIo4IQQu+8IVOPOy8xp+79kL5iHV2Ya/P/58w+9NRPVhAkAUcRf906U4/ZKzA7v/zPmzIKXEyqUrAouBiJxjISCiCDv69GNw9vsvCDoMnHvFO7DkrOODDoOIHGACQBRRE6ZNwvu/8vGgwxh02RevwLipE4IOg4hsYgJAFFHv+9IVg1X8wiDRksTlX/xw0GEQkU1MAIgi6MhT3uLbOv96zH/L4Vh08lFBh0FENjABIIoYIQTO+8g7gw6jovM/8k4IIYIOg4hqYAJAFDGHHrPQs/K+fpg2ewbmv+XwoMMgohqYABBFzPEXnBx0CDUdf95JQYdARDUwASCKEDOZwMLj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`;
  try{
    const mf={name:"Nadie Corre Solo",short_name:"NCS",display:"standalone",background_color:"#060e08",theme_color:"#060e08",start_url:".",orientation:"portrait-primary",icons:[{src:icon192,sizes:"192x192",type:"image/png"},{src:icon512,sizes:"512x512",type:"image/png",purpose:"maskable any"}]};
    document.getElementById('manifest-link').href=URL.createObjectURL(new Blob([JSON.stringify(mf)],{type:'application/manifest+json'}));
  }catch(e){}
  if('serviceWorker' in navigator){
    try{
      const sw=`const C='trail-app-v3';self.addEventListener('install',e=>{self.skipWaiting();});self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.open(C).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{c.put(e.request,res.clone());return res;}))));});`;
      navigator.serviceWorker.register(URL.createObjectURL(new Blob([sw],{type:'text/javascript'}))).catch(()=>{});
    }catch(e){}
  }
}

// ══════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════
setupPWA();
initTitle();

// ══════════════════════════════════════════════════
// GITHUB GIST SYNC
// ══════════════════════════════════════════════════
const GIST_FILENAME = 'nadie-corre-solo-backup.json';

function syncGetPAT(){ return localStorage.getItem('tw_sync_pat')||''; }
function syncGetGistId(){ return localStorage.getItem('tw_sync_gist_id')||''; }

function syncSetStatus(msg, cls=''){
  const el = document.getElementById('sync-status');
  el.textContent = msg;
  el.className = 'sync-status' + (cls ? ' '+cls : '');
}

function syncSetBtnState(state){
  const btn = document.getElementById('hdr-settings');
  btn.classList.toggle('syncing', !!state);
}

function openSyncModal(){
  const modal = document.getElementById('sync-modal');
  modal.classList.add('show');
  const pat = syncGetPAT();
  if(pat) document.getElementById('sync-pat').value = pat;
  const gistId = syncGetGistId();
  if(pat && gistId){
    syncSetStatus('Conectado · Gist: ' + gistId.slice(0,8) + '…', 'ok');
  } else if(pat){
    syncSetStatus('Token guardado. Pulsa ⬆ Subir para crear el Gist.');
  } else {
    syncSetStatus('Sin configurar — introduce tu token para comenzar.');
  }
}

function closeSyncModal(){
  // Save PAT on close
  const pat = document.getElementById('sync-pat').value.trim();
  if(pat) localStorage.setItem('tw_sync_pat', pat);
  document.getElementById('sync-modal').classList.remove('show');
}

function syncDisconnect(){
  if(!confirm('¿Desconectar sync? Los datos locales no se borran.')) return;
  localStorage.removeItem('tw_sync_pat');
  localStorage.removeItem('tw_sync_gist_id');
  document.getElementById('sync-pat').value = '';
  syncSetStatus('Desconectado.');
  updateSyncBadge();
}

// Collect all localStorage keys for this app
function syncExportAll(){
  const data = { _ts: Date.now(), _v: 1 };
  for(let i=0; i<localStorage.length; i++){
    const k = localStorage.key(i);
    if(k && k.startsWith('tw_') && !k.startsWith('tw_sync_')){
      try{ data[k] = JSON.parse(localStorage.getItem(k)); }
      catch(e){ data[k] = localStorage.getItem(k); }
    }
  }
  return data;
}

// Write all keys from gist data to localStorage (last-write-wins by _ts)
function syncImportAll(remote){
  const localTs = parseInt(localStorage.getItem('tw_sync_ts')||'0');
  const remoteTs = parseInt(remote._ts||'0');
  // Merge: for each key, keep whichever is newer by overall timestamp
  // Simple strategy: if remote is newer overall, apply all keys
  Object.keys(remote).forEach(k => {
    if(k.startsWith('_')) return; // skip meta
    localStorage.setItem(k, JSON.stringify(remote[k]));
  });
  localStorage.setItem('tw_sync_ts', remoteTs.toString());
}

async function syncPush(){
  const pat = document.getElementById('sync-pat').value.trim() || syncGetPAT();
  if(!pat){ syncSetStatus('Introduce tu token primero.', 'err'); return; }
  localStorage.setItem('tw_sync_pat', pat);

  syncSetBtnState(true);
  syncSetStatus('Subiendo…');

  const payload = syncExportAll();
  const content = JSON.stringify(payload, null, 2);
  const gistId = syncGetGistId();
  const headers = {
    'Authorization': 'token ' + pat,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    let res, json;
    if(gistId){
      // Update existing gist
      res = await fetch('https://api.github.com/gists/' + gistId, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ files: { [GIST_FILENAME]: { content } } })
      });
    } else {
      // Create new gist
      res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          description: 'Nadie Corre Solo — Training Data Backup',
          public: false,
          files: { [GIST_FILENAME]: { content } }
        })
      });
    }
    json = await res.json();
    if(!res.ok) throw new Error(json.message || 'Error ' + res.status);

    localStorage.setItem('tw_sync_gist_id', json.id);
    localStorage.setItem('tw_sync_ts', payload._ts.toString());
    const ts = new Date(payload._ts).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
    syncSetStatus('✓ Subido a las ' + ts + ' · Gist: ' + json.id.slice(0,8) + '…', 'ok');
    updateSyncBadge(false);
  } catch(err){
    syncSetStatus('✗ Error: ' + err.message, 'err');
  } finally {
    syncSetBtnState(false);
  }
}

async function syncPull(){
  const pat = document.getElementById('sync-pat').value.trim() || syncGetPAT();
  const gistId = syncGetGistId();
  if(!pat){ syncSetStatus('Introduce tu token primero.', 'err'); return; }
  if(!gistId){ syncSetStatus('No hay Gist vinculado. Sube primero desde el dispositivo principal.', 'err'); return; }

  syncSetBtnState(true);
  syncSetStatus('Bajando…');

  try {
    const res = await fetch('https://api.github.com/gists/' + gistId, {
      headers: { 'Authorization': 'token ' + pat, 'Accept': 'application/vnd.github.v3+json' }
    });
    const json = await res.json();
    if(!res.ok) throw new Error(json.message || 'Error ' + res.status);

    const fileContent = json.files?.[GIST_FILENAME]?.content;
    if(!fileContent) throw new Error('Archivo no encontrado en el Gist.');

    const remote = JSON.parse(fileContent);
    syncImportAll(remote);

    const ts = new Date(parseInt(remote._ts||Date.now())).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
    syncSetStatus('✓ Datos bajados (guardados: ' + ts + ') · Recarga para aplicar.', 'ok');
    updateSyncBadge(false);

    // Reload data in-memory without full page reload
    setTimeout(()=>{
      closeSyncModal();
      if(st.raceId) launchApp(st.athleteId||'mauricio', st.raceId);
    }, 1200);
  } catch(err){
    syncSetStatus('✗ Error: ' + err.message, 'err');
  } finally {
    syncSetBtnState(false);
  }
}

// Show dirty dot when data changes and hasn't been pushed
function updateSyncBadge(dirty=false){
  const btn = document.getElementById('hdr-settings');
  if(!btn) return;
  if(!syncGetPAT()){ btn.classList.remove('dirty','synced','error','syncing'); return; }
  if(dirty){ btn.classList.add('dirty'); btn.classList.remove('synced','error'); }
  else { btn.classList.remove('dirty'); btn.classList.toggle('synced', !!syncGetGistId()); }
}

// Close modal on backdrop click (delegated — safe regardless of DOM order)
document.addEventListener('click', e=>{
  if(e.target && e.target.id === 'sync-modal') closeSyncModal();
});

// Mark dirty on any S.set call — patch S
const _origSset = S.set.bind(S);
const SYNC_SKIP_KEYS=/^tw_(last_rid|last_aid|migrated|sync_pat|sync_gist)$/;
S.set = function(k,v){ _origSset(k,v); if(syncGetPAT()&&!SYNC_SKIP_KEYS.test(k)) updateSyncBadge(true); };

// Init badge on load
updateSyncBadge(false);

// ══════════════════════════════════════════════════════════
// WIZARD (nueva carrera + onboarding first-launch)
// ══════════════════════════════════════════════════════════
const AVATARS=['🏔','🐺','🦅','⚡','🌊','🔥','🐻','🦁','🌿','🏹','🌑','⛰'];
const WZ={step:1, isOnboarding:false, selectedAvatar:'🏃', selectedDays:[2,4,6], altWeekend:false};

function openOnboardingWizard(){
  WZ.isOnboarding=true;
  WZ.selectedAvatar='🏃';
  // Render avatar grid
  const grid=document.getElementById('wz-avatar-grid');
  grid.innerHTML=AVATARS.map(a=>`<button class="wz-avatar-btn${a===WZ.selectedAvatar?' selected':''}" onclick="wzSelectAvatar('${a}')">${a}</button>`).join('');
  document.getElementById('wz-profile-name').value='';
  document.getElementById('wz-avatar-preview').textContent='🏃';
  // Clear race fields
  _wizardClearRaceFields();
  // Hide close button, show skip
  document.getElementById('wizard-close-btn').style.display='none';
  // Show overlay (no backdrop close)
  const ov=document.getElementById('wizard-overlay');
  ov.onclick=null;
  ov.classList.remove('hidden');
  wizardShowStep(0);
  wizardValidate0();
}

function openNewRaceWizard(){
  WZ.isOnboarding=false;
  _wizardClearRaceFields();
  // Pre-fill paces from current profile
  const profile=S.get('tw_profile');
  if(profile?.easy_pace){ const e=profile.easy_pace; document.getElementById('wz-easy-pace').value=`${Math.floor(e/60)}:${String(e%60).padStart(2,'0')}`; }
  else if(st.paces?.easy){ const e=st.paces.easy; document.getElementById('wz-easy-pace').value=`${Math.floor(e/60)}:${String(e%60).padStart(2,'0')}`; }
  if(profile?.fast_pace){ const f=profile.fast_pace; document.getElementById('wz-fast-pace').value=`${Math.floor(f/60)}:${String(f%60).padStart(2,'0')}`; }
  else if(st.paces?.fast){ const f=st.paces.fast; document.getElementById('wz-fast-pace').value=`${Math.floor(f/60)}:${String(f%60).padStart(2,'0')}`; }
  // Show close button
  document.getElementById('wizard-close-btn').style.display='';
  const ov=document.getElementById('wizard-overlay');
  ov.onclick=(e)=>{if(e.target===ov)closeWizard();};
  ov.classList.remove('hidden');
  wizardShowStep(1);
  wizardValidate();
}

function _wizardClearRaceFields(){
  const next=new Date(); next.setDate(next.getDate()+7);
  document.getElementById('wz-start-date').value=next.toISOString().split('T')[0];
  ['wz-name','wz-distance','wz-elevation','wz-date','wz-easy-km','wz-max-km'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  ['wz-easy-pace','wz-fast-pace'].forEach(id=>{
    const el=document.getElementById(id); if(el&&!el.value) el.value='';
  });
}

function closeWizard(){
  document.getElementById('wizard-overlay').classList.add('hidden');
}

function wzSelectAvatar(a){
  WZ.selectedAvatar=a;
  document.getElementById('wz-avatar-preview').textContent=a;
  document.querySelectorAll('.wz-avatar-btn').forEach(b=>b.classList.toggle('selected',b.textContent===a));
  wizardValidate0();
}

function wizardShowStep(n){
  WZ.step=n;
  document.querySelectorAll('.wizard-step').forEach(s=>s.classList.remove('active'));
  const el=document.getElementById(`wz-step-${n}`)||document.getElementById('wz-step-gen');
  if(el) el.classList.add('active');
  // Progress: steps are 0,1,2 (or 1,2 for add-race)
  const prog=document.getElementById('wizard-progress');
  const steps=WZ.isOnboarding?[0,1,2]:[1,2];
  prog.innerHTML=steps.map(i=>`<div class="wizard-step-dot${i<n?' done':i===n?' active':''}"></div>`).join('');
  const titles={0:'Tu perfil', 1:'La carrera', 2:'Tu nivel', gen:'Generando plan...'};
  document.getElementById('wizard-title').textContent=titles[n]||titles.gen;
  // Show back button on step 1 only in onboarding mode
  const backBtn=document.getElementById('wz-back-1');
  if(backBtn) backBtn.style.display=(n===1&&WZ.isOnboarding)?'':'none';
}

function wizardNext(step){
  if(step===0) wizardShowStep(1);
  else if(step===1) wizardShowStep(2);
  else if(step===2){ wizardShowStep(3); wzInitDayGrid(); }
}
function wizardBack(step){
  if(step===2) wizardShowStep(1);
  else if(step===1 && WZ.isOnboarding) wizardShowStep(0);
  else if(step===3) wizardShowStep(2);
}

function wizardValidate0(){
  const name=document.getElementById('wz-profile-name')?.value?.trim();
  const btn=document.getElementById('wz-next-0');
  if(btn) btn.disabled=!name;
}
function wizardValidate(){
  const name=document.getElementById('wz-name')?.value?.trim();
  const dist=document.getElementById('wz-distance')?.value;
  const date=document.getElementById('wz-date')?.value;
  const btn=document.getElementById('wz-next-1');
  if(btn) btn.disabled=!(name&&dist&&date);
}

function wzToggleDay(dow){
  const idx=WZ.selectedDays.indexOf(dow);
  if(idx===-1){ WZ.selectedDays.push(dow); } else { if(WZ.selectedDays.length>1) WZ.selectedDays.splice(idx,1); }
  WZ.selectedDays.sort((a,b)=>a-b);
  document.querySelectorAll('.wz-day-btn').forEach(b=>{
    const d=parseInt(b.dataset.dow);
    b.classList.toggle('selected',WZ.selectedDays.includes(d));
  });
  wzUpdateScheduleSummary();
}
function wzToggleAltWeekend(checked){
  WZ.altWeekend=checked;
  wzUpdateScheduleSummary();
}
const DAY_LABELS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
function wzUpdateScheduleSummary(){
  const days=WZ.selectedDays.map(d=>DAY_LABELS[d]).join(', ');
  const alt=WZ.altWeekend?' · fines de semana alternados':'';
  const el=document.getElementById('wz-schedule-summary');
  if(el) el.textContent=`${WZ.selectedDays.length} días: ${days}${alt}`;
}
function wzInitDayGrid(){
  const grid=document.getElementById('wz-day-grid');
  if(!grid) return;
  // 1=Mon...6=Sat, 0=Sun — render Mon first
  const order=[1,2,3,4,5,6,0];
  grid.innerHTML=order.map(d=>`<button class="wz-day-btn${WZ.selectedDays.includes(d)?' selected':''}" data-dow="${d}" onclick="wzToggleDay(${d})">${DAY_LABELS[d]}</button>`).join('');
  wzUpdateScheduleSummary();
}


  if(!str)return null;
  const parts=str.split(':');
  if(parts.length!==2)return null;
  const mins=parseInt(parts[0]), secs=parseInt(parts[1]);
  if(isNaN(mins)||isNaN(secs))return null;
  return mins*60+secs;
}

async function wizardGenerate(){
  wizardShowStep('gen');
  document.getElementById('wz-error').classList.add('hidden');
  document.getElementById('wz-error-footer').style.display='none';

  const raceName=document.getElementById('wz-name').value.trim();
  const distance=parseFloat(document.getElementById('wz-distance').value);
  const elevation=parseInt(document.getElementById('wz-elevation').value)||0;
  const raceDate=document.getElementById('wz-date').value;
  const startDate=document.getElementById('wz-start-date').value;
  const easyPaceSec=parsePace(document.getElementById('wz-easy-pace').value)||400;
  const fastPaceSec=parsePace(document.getElementById('wz-fast-pace').value)||300;
  const easyKm=parseFloat(document.getElementById('wz-easy-km').value)||10;
  const maxKm=parseFloat(document.getElementById('wz-max-km').value)||20;
  const weeksUntilRace=Math.max(4,Math.round((new Date(raceDate)-new Date(startDate))/(7*86400000)));

  document.getElementById('wz-gen-label').textContent='Diseñando tu plan de semanas...';
  document.getElementById('wz-gen-sub').textContent=`${weeksUntilRace} semanas · ${distance}km`;

  // Build schedule context from step 3
  const _dayNames=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const _daysStr=(WZ.selectedDays||[2,4,6]).map(d=>_dayNames[d]).join(', ');
  const _altNote=WZ.altWeekend
    ? '\n- Fines de semana alternados: SÍ. Un sábado disponible, el siguiente NO. Cuando el sábado está ocupado, el largo semanal se mueve al viernes y el sábado es DESCANSO.'
    : '\n- Fines de semana: disponibles siempre.';

  const prompt=`Genera un plan de entrenamiento de trail running para esta carrera:\n- Nombre: ${raceName}\n- Distancia: ${distance}km, Desnivel: ${elevation}m D+\n- Fecha carrera: ${raceDate}\n- Inicio plan: ${startDate} (${weeksUntilRace} semanas)\n- Nivel actual: cómodo a ${easyKm}km, máximo ${maxKm}km\n- Ritmo suave: ${Math.floor(easyPaceSec/60)}:${String(easyPaceSec%60).padStart(2,'0')}/km\n- Ritmo intenso: ${Math.floor(fastPaceSec/60)}:${String(fastPaceSec%60).padStart(2,'0')}/km\n\nEstructura semanal:\n- Días de entrenamiento: ${_daysStr}${_altNote}\n- Usar SOLO esos días para entrenamientos. Los demás días son DESCANSO.\n\nIMPORTANTE: Responde SOLO con JSON válido, sin markdown, sin texto adicional. Usa este schema exacto:\n[\n  {\n    \"num\": 1,\n    \"dates\": \"1–7 Mar\",\n    \"phase\": \"BASE\",\n    \"totalKm\": 25,\n    \"days\": [\n      {\"id\":\"w1d0\",\"date\":\"2026-03-02\",\"label\":\"Lun 2 Mar\",\"session\":\"Rodaje suave\",\"type\":\"SUAVE\",\"km\":8,\"desc\":\"Descripción.\"},\n      {\"id\":\"w1d1\",\"date\":\"2026-03-03\",\"label\":\"Mar 3 Mar\",\"session\":\"Fuerza – Tren inferior\",\"type\":\"FUERZA\",\"km\":0,\"sets\":3,\"desc\":\"Descripción.\",\"exercises\":[{\"name\":\"Sentadilla\",\"reps\":\"12\"},{\"name\":\"Plancha\",\"reps\":\"30 seg\"}]},\n      {\"id\":\"w1d2\",\"date\":\"2026-03-04\",\"label\":\"Mié 4 Mar\",\"session\":\"Descanso\",\"type\":\"DESCANSO\",\"km\":0,\"desc\":\"Descanso activo.\"}\n    ]\n  }\n]\n\nFases: BASE (25%), DESARROLLO (30%), PICO (25%), TAPER (2 semanas), CARRERA (1 semana), RECUPERACIÓN (2 semanas).\n3-4 sesiones por semana (1-2 FUERZA, resto SUAVE/MEDIO/INTENSO/DESCANSO).\nFase CARRERA: el día de la carrera tiene type INTENSO, km=${distance}.\nIDs de días: patrón wNdM (N=semana, M=índice). Fechas en YYYY-MM-DD.\`;

  try{
    const resp=await fetch('/api/generate-plan',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:8000,messages:[{role:'user',content:prompt}]})
    });
    if(!resp.ok) throw new Error(`API error ${resp.status}`);
    const data=await resp.json();
    const text=data.content?.map(c=>c.text||'').join('').trim();
    let weeks;
    try{
      const clean=text.replace(/^```json\s*/,'').replace(/```\s*$/,'').trim();
      weeks=JSON.parse(clean);
    }catch(e){ throw new Error('No se pudo parsear el plan. Intenta de nuevo.'); }
    if(!Array.isArray(weeks)||!weeks.length) throw new Error('El plan generado está vacío.');

    const raceId='race_'+Date.now();
    const newRace={id:raceId,name:raceName,date:raceDate,distance,elevation,defaultTitle:`⛰ ${raceName}`,weeks,status:'upcoming'};

    if(WZ.isOnboarding){
      // Save profile
      const profileName=document.getElementById('wz-profile-name').value.trim();
      S.set('tw_profile',{name:profileName,avatar:WZ.selectedAvatar,easy_pace:easyPaceSec,fast_pace:fastPaceSec});
      // Save as first custom race (overrides hardcoded Torrencial on auto-launch)
      const custom=S.get('tw_races')||[];
      custom.unshift(newRace);
      S.set('tw_races',custom);
    } else {
      const custom=S.get('tw_races')||[];
      custom.push(newRace);
      S.set('tw_races',custom);
    }

    document.getElementById('wz-gen-label').textContent='¡Plan listo! 🎉';
    document.getElementById('wz-gen-sub').textContent=`${weeks.length} semanas generadas`;
    setTimeout(()=>{
      closeWizard();
      launchApp('mauricio',raceId);
    },1200);
  }catch(err){
    const errEl=document.getElementById('wz-error');
    errEl.textContent='✗ '+err.message;
    errEl.classList.remove('hidden');
    document.getElementById('wz-error-footer').style.display='flex';
    document.getElementById('wz-gen-label').textContent='Error al generar el plan';
    document.getElementById('wz-gen-sub').textContent='';
  }
}

function migrateStorage(){
  const oldRid='torrencial44k', oldAid='mauro';

  // Step 1: Migrate old key format (runs only once)
  if(!S.get('tw_migrated')){
    const keyMap=['weeks','logs','rxn','overrides','paces','title'];
    keyMap.forEach(k=>{
      const oldKey=`tw_${k}_${oldAid}_${oldRid}`;
      const newKey=`tw_${k}_${oldRid}`;
      const val=S.get(oldKey);
      if(val!==null){
        if(S.get(newKey)===null) S.set(newKey,val);
        try{ localStorage.removeItem(oldKey); }catch(e){}
      }
    });
    if(!S.get('tw_last_rid')){
      S.set('tw_last_rid', oldRid);
      S.set('tw_last_aid', 'mauricio');
    }
    S.set('tw_migrated',true);
    console.log('[Migration] Claves antiguas migradas');
  }

  // Step 2: Seed torrencial44k into tw_races (runs every time until done)
  // This is separate from tw_migrated so it catches users who ran the old migration
  const existing=S.get('tw_races')||[];
  if(!existing.find(r=>r.id===oldRid)){
    const weeks=S.get(`tw_weeks_${oldRid}`)||buildWeeks();
    existing.unshift({
      id:oldRid,
      name:'Torrencial 44k',
      date:'2026-06-27',
      distance:44,
      elevation:1500,
      defaultTitle:'⛰ Torrencial 44k',
      weeks
    });
    S.set('tw_races',existing);
    if(!S.get('tw_last_rid')) S.set('tw_last_rid', oldRid);
    console.log('[Migration] Torrencial 44k sembrada en tw_races');
  }
}
migrateStorage();

// Splash → app or onboarding
setTimeout(()=>{
  const sp=document.getElementById('splash');
  sp.style.opacity='0';
  setTimeout(()=>{
    sp.style.display='none';
    const lastAid=S.get('tw_last_aid')||'mauricio';
    const lastRid=S.get('tw_last_rid')||getActiveRaceId();
    if(lastRid){
      launchApp(lastAid, lastRid);
    } else {
      // Brand new user — onboarding
      openOnboardingWizard();
    }
  },650);
},600);
