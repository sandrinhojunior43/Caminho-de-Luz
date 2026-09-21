(()=>{
'use strict';
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],lessons=window.CDL_LESSONS;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='cdl-study-v1',supported='speechSynthesis'in window&&'SpeechSynthesisUtterance'in window;
let raw={};try{raw=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
const state={current:lessons.some(l=>l.id===raw.current)?raw.current:lessons[0].id,items:{},rate:[.8,1,1.25,1.5].includes(raw.rate)?raw.rate:1};
for(const lesson of lessons){const v=raw.items?.[lesson.id]||{};state.items[lesson.id]={block:Number.isInteger(v.block)?Math.max(0,Math.min(lesson.blocks.length-1,v.block)):0,note:typeof v.note==='string'?v.note.slice(0,5000):'',saved:v.saved===true,done:v.done===true,visited:v.visited===true}}
let current=lessons.find(l=>l.id===state.current),token=0,utterance=null,active=false,paused=false,voiceList=[];
function item(){return state.items[current.id]}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{$('#noteStatus').textContent='Não foi possível salvar neste aparelho. Copie ou exporte suas anotações antes de sair.';return false}}
function renderLists(){
  $('#lessonGrid').innerHTML=lessons.map((l,i)=>{const v=state.items[l.id];return '<article class="glass lesson-card"><span class="eyebrow">'+String(i+1).padStart(2,'0')+' · '+esc(l.topic)+'</span><h2>'+esc(l.title)+'</h2><p class="notice">3 trechos · texto + voz sintética</p><p class="notice">'+(v.done?'Encontro concluído — releia quando quiser':v.visited?'Retomar no trecho '+(v.block+1):'Uma leitura breve, no seu ritmo')+'</p><button class="primary" data-lesson="'+l.id+'">'+(v.visited?'Continuar':'Abrir estudo')+'</button></article>'}).join('');
  const list=lessons.filter(l=>{const v=state.items[l.id];return v.visited||v.saved||v.note});
  $('#myStudies').innerHTML=list.length?list.map(l=>{const v=state.items[l.id];return '<article class="study-saved"><strong>'+esc(l.title)+'</strong><p class="notice">'+(v.saved?'★ Marcado · ':'')+(v.done?'Concluído':'Trecho '+(v.block+1)+' de 3')+'</p>'+(v.note?'<p>'+esc(v.note)+'</p>':'')+'<button class="text-btn" data-lesson="'+l.id+'">Retomar estudo</button></article>'}).join(''):'<p class="notice">Seus estudos e anotações aparecerão aqui.</p>';
  all('[data-lesson]').forEach(b=>b.onclick=()=>open(b.dataset.lesson));
  const c=lessons.find(l=>l.id===state.current),v=state.items[c.id];
  $('#continueTitle').textContent=v.visited?c.title:'Comece por uma boa pergunta';
  $('#continueDetail').textContent=v.visited?'Retomar no trecho '+(v.block+1)+' de 3 · '+c.topic:'Primeiros passos: um encontro curto para ler ou escutar.';
  $('#continueStudy').textContent=v.visited?'Continuar estudo':'Começar estudo';
}
function renderReader(){
  $('#lessonTopic').textContent=current.topic;$('#lessonTitle').textContent=current.title;$('#lessonReference').textContent=current.reference;$('#lessonSource').href=current.source;
  $('#lessonBlocks').innerHTML=current.blocks.map((b,i)=>'<section class="lesson-block" id="lesson-block-'+i+'"><span class="eyebrow">Trecho '+(i+1)+' de '+current.blocks.length+'</span><h2>'+esc(b[0])+'</h2><p>'+esc(b[1])+'</p><button class="text-btn" data-block="'+i+'">Retomar por este trecho</button></section>').join('');
  $('#lessonQuestion').textContent=current.question;$('#lessonNote').value=item().note;$('#noteStatus').textContent='Anotações salvas somente neste aparelho.';
  all('[data-block]').forEach(b=>b.onclick=()=>chooseBlock(Number(b.dataset.block)));
  $('#saveLesson').textContent=item().saved?'★ Estudo marcado':'☆ Marcar estudo';
  $('#saveLesson').setAttribute('aria-pressed',String(item().saved));
  $('#completeLesson').textContent=item().done?'Reabrir encontro':'Concluir este encontro';
  $('#speechRate').value=String(state.rate);
  $('#focusReader').textContent=document.body.classList.contains('reader-focus')?'Sair do modo de leitura':'Leitura sem distrações';
  $('#nextLesson').disabled=current===lessons[lessons.length-1];
  highlight();syncSpeech();
}
function open(id){
  const lesson=lessons.find(l=>l.id===id);if(!lesson)return false;
  if(current.id!==id)stop();
  current=lesson;state.current=id;item().visited=true;const saved=persist();
  renderReader();renderLists();window.CDL_NAV('reader');
  if(!saved)$('#noteStatus').textContent='Não salvo: exporte suas anotações antes de sair.';
  document.getElementById('lesson-block-'+item().block)?.scrollIntoView({block:'start',behavior:'instant'});
  return true;
}
function highlight(){all('.lesson-block').forEach((el,i)=>{el.classList.toggle('current',i===item().block);el.setAttribute('aria-current',i===item().block?'step':'false')})}
function chooseBlock(index){
  if(!Number.isInteger(index)||index<0||index>=current.blocks.length)return false;
  const playing=active&&!paused;cancelQueue();item().block=index;persist();highlight();renderLists();if(playing){active=true;paused=false;speak(token)}else syncSpeech();return true;
}
function cancelQueue(){token++;if(supported)window.speechSynthesis.cancel();utterance=null}
function syncSpeech(){
  $('#listenLesson').disabled=!supported;
  $('#listenLesson').textContent=active&&!paused?'Pausar leitura':active?'Retomar trecho':'Ouvir estudo';
  if(!supported){$('#speechStatus').textContent='Este navegador não oferece leitura em voz alta. Todo o estudo continua disponível em texto.';return}
  if(active){$('#miniPlayer').classList.remove('hidden');$('#nowTitle').textContent=current.title;$('#nowTime').textContent='Voz sintética · trecho '+(item().block+1)+'/'+current.blocks.length;$('#miniToggle').textContent=paused?'Retomar':'Pausar';$('#miniToggle').setAttribute('aria-label',paused?'Retomar leitura':'Pausar leitura')}
}
function speak(generation){
  if(!supported||generation!==token||paused||!active)return;
  const b=current.blocks[item().block];utterance=new SpeechSynthesisUtterance(b[0]+'. '+b[1]);utterance.lang='pt-BR';utterance.rate=state.rate;
  const voice=voiceList.find(v=>v.voiceURI===$('#speechVoice').value);if(voice)utterance.voice=voice;
  utterance.onstart=()=>{if(generation!==token)return;$('#speechStatus').textContent='Lendo o trecho '+(item().block+1)+'. Ao pausar, a retomada começa neste trecho.';highlight();syncSpeech()};
  utterance.onend=()=>{
    if(generation!==token||paused||!active)return;
    if(item().block<current.blocks.length-1){item().block++;persist();highlight();renderLists();speak(generation)}
    else{stop();$('#speechStatus').textContent='Leitura encerrada. A conclusão do encontro é sua escolha; registre sua reflexão quando quiser.'}
  };
  utterance.onerror=e=>{if(generation!==token||e.error==='canceled'||e.error==='interrupted')return;paused=true;syncSpeech();$('#speechStatus').textContent='A voz não ficou disponível. Escolha outra voz ou tente novamente; você pode continuar pelo texto.'};
  try{window.speechSynthesis.speak(utterance)}catch{paused=true;syncSpeech();$('#speechStatus').textContent='Não foi possível iniciar a voz neste aparelho.'}
}
function toggle(){
  if(!supported)return false;
  window.CDL_AUDIOBOOKS?.close();window.CDL_SONG?.close();
  if(active&&!paused){cancelQueue();paused=true;persist();syncSpeech();$('#speechStatus').textContent='Pausado. A retomada começa no início deste trecho.';return true}
  window.CDL_PAUSE_MUSIC?.();cancelQueue();active=true;paused=false;item().visited=true;persist();renderLists();syncSpeech();speak(token);return true;
}
function stop(){if(!active)return;cancelQueue();active=false;paused=false;persist();$('#miniPlayer').classList.add('hidden');syncSpeech()}
window.CDL_NARRATION={get active(){return active},toggle,stop};
function loadVoices(){
  if(!supported)return;const selected=$('#speechVoice').value;voiceList=window.speechSynthesis.getVoices().filter(v=>/^pt(?:-|_)/i.test(v.lang));
  $('#speechVoice').innerHTML='<option value="">Português do aparelho</option>'+voiceList.map(v=>'<option value="'+esc(v.voiceURI)+'">'+esc(v.name)+(v.localService?' · local':' · online')+'</option>').join('');
  if(voiceList.some(v=>v.voiceURI===selected))$('#speechVoice').value=selected;
}
$('#listenLesson').onclick=toggle;$('#previousBlock').onclick=()=>chooseBlock(Math.max(0,item().block-1));
$('#speechRate').onchange=()=>{state.rate=Number($('#speechRate').value);persist();if(active&&!paused){cancelQueue();speak(token)}};
$('#speechVoice').onchange=()=>{if(active&&!paused){cancelQueue();speak(token)}};
$('#lessonNote').addEventListener('input',()=>{item().note=$('#lessonNote').value.slice(0,5000);const saved=persist();if(saved)$('#noteStatus').textContent='Anotação salva neste aparelho.';renderLists()});
$('#saveLesson').onclick=()=>{item().saved=!item().saved;const saved=persist();renderReader();renderLists();if(!saved)$('#noteStatus').textContent='Não foi possível salvar o marcador.'};
$('#completeLesson').onclick=()=>{item().done=!item().done;const saved=persist();renderReader();renderLists();if(!saved)$('#noteStatus').textContent='Não foi possível salvar a conclusão.'};
$('#nextLesson').onclick=()=>{const i=lessons.indexOf(current);if(i<lessons.length-1)open(lessons[i+1].id)};
$('#continueStudy').onclick=()=>open(state.current);
$('#focusReader').onclick=()=>{const on=document.body.classList.toggle('reader-focus');$('#focusReader').textContent=on?'Sair do modo de leitura':'Leitura sem distrações';$('#focusReader').setAttribute('aria-pressed',String(on))};
$('#exportStudies').onclick=()=>{
  const text=lessons.filter(l=>state.items[l.id].visited||state.items[l.id].note||state.items[l.id].saved).map(l=>{const v=state.items[l.id];return l.title+'\n'+l.reference+'\nTrecho: '+(v.block+1)+'\n'+(v.note||'Sem anotação.')}).join('\n\n———\n\n');
  const blob=new Blob([text||'Nenhum estudo registrado.'],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='meus-estudos-caminho-de-luz.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
};
function pauseAway(){if(active&&!paused){cancelQueue();paused=true;syncSpeech();$('#speechStatus').textContent='Leitura pausada ao sair da tela. Toque em retomar para continuar neste trecho.'}persist()}
window.addEventListener('pagehide',pauseAway);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAway()});
if(supported)window.speechSynthesis.addEventListener?.('voiceschanged',loadVoices);
loadVoices();renderReader();renderLists();
// The existing favourites remain intact; expose them beside the diary.
const savedSection=$('#savedMessages').closest('section');if(savedSection)document.querySelector('[data-view="journal"]').append(savedSection);
if(location.hash==='#reader')open(state.current);
})();
