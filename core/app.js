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
      <div style="display:flex;gap:6px">
        <button class="settings-row-action" onclick="closeSettings();openProfileModal()">Editar →</button>
        <button class="settings-row-action" onclick="closeSettings();openPaceModal(true)">Ritmos →</button>
      </div>
    </div>
    <div class="settings-section-label" style="margin-top:16px">CARRERAS</div>
    ${raceRows}
    <button class="settings-new-race-btn" onclick="closeSettings();openNewRaceWizard()">+ Nueva carrera</button>
    <div class="settings-section-label" style="margin-top:16px">DATOS</div>
    <div class="settings-row">
      <div><div class="settings-row-label">Sincronización</div><div class="settings-row-sub">GitHub Gist</div></div>
      <button class="settings-row-action" onclick="closeSettings();openSyncModal()">Sync →</button>
    </div>
    <div class="settings-section-label" style="margin-top:16px">EXCEL</div>
    <div class="settings-row">
      <div><div class="settings-row-label">Exportar calendario</div><div class="settings-row-sub">Descarga plan activo como .xlsx</div></div>
      <button class="settings-row-action" onclick="exportToExcel()">Exportar ↓</button>
    </div>
    <div class="settings-row">
      <div><div class="settings-row-label">Importar carrera</div><div class="settings-row-sub">Carga un plan desde archivo .xlsx</div></div>
      <button class="settings-row-action" onclick="importFromExcel()">Importar ↑</button>
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

let _profAvatar='🏃';
function openProfileModal(){
  const profile=S.get('tw_profile')||{name:'Mauricio',avatar:'🏔'};
  _profAvatar=profile.avatar||'🏃';
  document.getElementById('prof-name').value=profile.name||'';
  document.getElementById('prof-avatar-preview').textContent=_profAvatar;
  const grid=document.getElementById('prof-avatar-grid');
  grid.innerHTML=AVATARS.map(a=>`<button class="wz-avatar-btn${a===_profAvatar?' selected':''}" onclick="_profSelectAvatar('${a}')">${a}</button>`).join('');
  document.getElementById('profile-overlay').classList.add('open');
}
function closeProfileModal(){
  document.getElementById('profile-overlay').classList.remove('open');
}
function _profSelectAvatar(a){
  _profAvatar=a;
  document.getElementById('prof-avatar-preview').textContent=a;
  document.querySelectorAll('#prof-avatar-grid .wz-avatar-btn').forEach(b=>b.classList.toggle('selected',b.textContent===a));
}
function saveProfileSettings(){
  const name=document.getElementById('prof-name').value.trim();
  if(!name){alert('El nombre no puede estar vacío.');return;}
  const profile=S.get('tw_profile')||{};
  S.set('tw_profile',{...profile,name,avatar:_profAvatar});
  closeProfileModal();
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
      navigator.serviceWorker.register('./sw.js').catch(()=>{});
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
  if(gistId) document.getElementById('sync-gist-manual').value = gistId;
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
  if(!pat){ syncSetStatus('Introduce tu token primero.', 'err'); return; }
  const manualId = document.getElementById('sync-gist-manual')?.value.trim();
  if(manualId){ localStorage.setItem('tw_sync_gist_id', manualId); }
  const gistId = syncGetGistId() || manualId;
  if(!gistId){ syncSetStatus('No hay Gist vinculado. Introduce el Gist ID o sube primero desde el dispositivo principal.', 'err'); return; }
  
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

function parsePace(str){
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

  const prompt=`Genera un plan de entrenamiento de trail running para esta carrera:\n- Nombre: ${raceName}\n- Distancia: ${distance}km, Desnivel: ${elevation}m D+\n- Fecha carrera: ${raceDate}\n- Inicio plan: ${startDate} (${weeksUntilRace} semanas)\n- Nivel actual: cómodo a ${easyKm}km, máximo ${maxKm}km\n- Ritmo suave: ${Math.floor(easyPaceSec/60)}:${String(easyPaceSec%60).padStart(2,'0')}/km\n- Ritmo intenso: ${Math.floor(fastPaceSec/60)}:${String(fastPaceSec%60).padStart(2,'0')}/km\n\nEstructura semanal:\n- Días de entrenamiento: ${_daysStr}${_altNote}\n- Usar SOLO esos días para entrenamientos. Los demás días son DESCANSO.\n\nIMPORTANTE: Responde SOLO con JSON válido, sin markdown, sin texto adicional. Usa este schema exacto:\n[\n  {\n    \"num\": 1,\n    \"dates\": \"1–7 Mar\",\n    \"phase\": \"BASE\",\n    \"totalKm\": 25,\n    \"days\": [\n      {\"id\":\"w1d0\",\"date\":\"2026-03-02\",\"label\":\"Lun 2 Mar\",\"session\":\"Rodaje suave\",\"type\":\"SUAVE\",\"km\":8,\"desc\":\"Descripción.\"},\n      {\"id\":\"w1d1\",\"date\":\"2026-03-03\",\"label\":\"Mar 3 Mar\",\"session\":\"Fuerza – Tren inferior\",\"type\":\"FUERZA\",\"km\":0,\"sets\":3,\"desc\":\"Descripción.\",\"exercises\":[{\"name\":\"Sentadilla\",\"reps\":\"12\"},{\"name\":\"Plancha\",\"reps\":\"30 seg\"}]},\n      {\"id\":\"w1d2\",\"date\":\"2026-03-04\",\"label\":\"Mié 4 Mar\",\"session\":\"Descanso\",\"type\":\"DESCANSO\",\"km\":0,\"desc\":\"Descanso activo.\"}\n    ]\n  }\n]\n\nFases: BASE (25%), DESARROLLO (30%), PICO (25%), TAPER (2 semanas), CARRERA (1 semana), RECUPERACIÓN (2 semanas).\n3-4 sesiones por semana (1-2 FUERZA, resto SUAVE/MEDIO/INTENSO/DESCANSO).\nFase CARRERA: el día de la carrera tiene type INTENSO, km=${distance}.\nIDs de días: patrón wNdM (N=semana, M=índice). Fechas en YYYY-MM-DD.`;

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

// ══════════════════════════════════════════════════
// EXCEL EXPORT / IMPORT
// ══════════════════════════════════════════════════
function exportToExcel(){
  if(typeof XLSX==='undefined'){alert('Librería Excel no disponible. Recarga la app.');return;}
  const race=getRaceById(st.raceId);
  const wb=XLSX.utils.book_new();

  // Sheet 1: race metadata
  const raceWs=XLSX.utils.aoa_to_sheet([
    ['Nombre','Fecha','Distancia_km','Desnivel_m'],
    [race.name, race.date, race.distance||0, race.elevation||0]
  ]);
  XLSX.utils.book_append_sheet(wb,raceWs,'Carrera');

  // Sheet 2: full plan
  const hdrs=['Semana','Fase','Km_Semana','Fecha','Día','Tipo','Km_Plan','Series','Sesión','Descripción','Ejercicios','Km_Real','Tiempo_Real','Reacción'];
  const rows=[hdrs];
  st.weeks.forEach(w=>{
    w.days.forEach(day=>{
      const log=st.logs[day.id]||{};
      const rxn=st.reactions[day.id]||'';
      const exStr=day.exercises?day.exercises.map(ex=>`${ex.name} ${ex.reps}`).join('; '):'';
      let timeStr='';
      if(log.h!==undefined)timeStr=`${String(log.h).padStart(2,'0')}:${String(log.m).padStart(2,'0')}:${String(log.s).padStart(2,'0')}`;
      else if(log.time)timeStr=log.time;
      rows.push([
        w.num??'Carrera', w.phase||'', w.totalKm||0,
        day.date, day.label, day.type,
        day.km||0, day.sets||'',
        day.session, day.desc||'',
        exStr,
        log.distance||log.km||'', timeStr, rxn
      ]);
    });
  });
  const planWs=XLSX.utils.aoa_to_sheet(rows);
  planWs['!cols']=[
    {wch:8},{wch:13},{wch:10},{wch:12},{wch:18},{wch:10},
    {wch:9},{wch:7},{wch:32},{wch:50},{wch:40},{wch:9},{wch:12},{wch:8}
  ];
  XLSX.utils.book_append_sheet(wb,planWs,'Plan');

  const fname=`${(race.name||'plan').replace(/\s+/g,'-')}_${race.date}.xlsx`;
  XLSX.writeFile(wb,fname);
}

function importFromExcel(){
  if(typeof XLSX==='undefined'){alert('Librería Excel no disponible. Recarga la app.');return;}
  const input=document.createElement('input');
  input.type='file'; input.accept='.xlsx,.xls';
  input.onchange=e=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=evt=>{
      try{
        const wb=XLSX.read(evt.target.result,{type:'binary'});

        // Race metadata
        const raceWs=wb.Sheets['Carrera'];
        if(!raceWs)throw new Error('Hoja "Carrera" no encontrada');
        const raceRows=XLSX.utils.sheet_to_json(raceWs,{header:1});
        if(raceRows.length<2)throw new Error('Hoja "Carrera" sin datos');
        const [raceName,raceDate,raceDist,raceElev]=raceRows[1];
        if(!raceName||!raceDate)throw new Error('Faltan nombre o fecha de carrera');

        // Plan
        const planWs=wb.Sheets['Plan'];
        if(!planWs)throw new Error('Hoja "Plan" no encontrada');
        const planRows=XLSX.utils.sheet_to_json(planWs,{header:1});
        if(planRows.length<2)throw new Error('Hoja "Plan" sin datos');

        const colHdrs=planRows[0];
        const ix={};
        colHdrs.forEach((h,i)=>ix[String(h)]=i);

        const raceId='import_'+Date.now();
        const logsOut={}, rxnOut={};
        const weeksArr=[];
        let curWeek=null, curWNum=undefined;

        planRows.slice(1).forEach(row=>{
          const wNum=row[ix['Semana']];
          if(wNum!==curWNum){
            curWeek={
              num:typeof wNum==='number'?wNum:null,
              phase:String(row[ix['Fase']]||'BASE'),
              totalKm:Number(row[ix['Km_Semana']])||0,
              dates:'', days:[]
            };
            weeksArr.push(curWeek);
            curWNum=wNum;
          }
          const di=curWeek.days.length;
          const dayId=`${raceId}_w${weeksArr.length-1}_d${di}`;
          const tipo=String(row[ix['Tipo']]||'DESCANSO').toUpperCase();
          const ejStr=String(row[ix['Ejercicios']]||'');
          const exercises=ejStr?ejStr.split(';').filter(Boolean).map(s=>{
            s=s.trim(); const sp=s.lastIndexOf(' ');
            return sp>0?{name:s.slice(0,sp),reps:s.slice(sp+1)}:{name:s,reps:''};
          }):undefined;
          const day={
            id:dayId,
            date:String(row[ix['Fecha']]||''),
            label:String(row[ix['Día']]||''),
            session:String(row[ix['Sesión']]||''),
            type:tipo,
            km:Number(row[ix['Km_Plan']])||0,
            desc:String(row[ix['Descripción']]||'')
          };
          const sets=row[ix['Series']];
          if(sets)day.sets=Number(sets)||3;
          if(exercises&&exercises.length)day.exercises=exercises;
          curWeek.days.push(day);
          if(day.date){
            const d0=curWeek.dates.split('–')[0].trim();
            curWeek.dates=(d0||day.date)+' – '+day.date;
          }

          // Logged data
          const kmReal=row[ix['Km_Real']];
          const tReal=String(row[ix['Tiempo_Real']]||'').trim();
          const rxn=String(row[ix['Reacción']]||'').trim();
          if(kmReal||tReal){
            const pts=tReal.split(':');
            logsOut[dayId]={
              distance:Number(kmReal)||0, time:tReal,
              h:Number(pts[0])||0, m:Number(pts[1])||0, s:Number(pts[2])||0
            };
          }
          if(rxn&&rxn!=='undefined')rxnOut[dayId]=rxn;
        });

        const newRace={
          id:raceId, name:String(raceName), date:String(raceDate),
          distance:Number(raceDist)||0, elevation:Number(raceElev)||0,
          weeks:weeksArr
        };
        const all=S.get('tw_races')||[];
        all.push(newRace);
        S.set('tw_races',all);
        S.set(`tw_weeks_${raceId}`,weeksArr);
        if(Object.keys(logsOut).length)S.set(`tw_logs_${raceId}`,logsOut);
        if(Object.keys(rxnOut).length)S.set(`tw_rxn_${raceId}`,rxnOut);

        closeSettings();
        launchApp('mauricio',raceId);
      }catch(err){alert('Error al importar: '+err.message);}
    };
    reader.readAsBinaryString(file);
  };
  input.click();
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
