// Non-browser regression harness. Does not assert rendering or live audio delivery.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
process.env.TZ='America/Sao_Paulo';
const html=fs.readFileSync('dist/index.html','utf8');
let checks=0;const ok=(v,label)=>{assert.ok(v,label);checks++;console.log('PASS '+label)};
function boot(seed={},options={}){
  const nodes=[],ids=new Map(),tools={},listeners={},memory=new Map(Object.entries(seed));
  let doc,failWrite=false,clock=Date.parse('2026-09-19T12:00:00-03:00');
  class Element{
    constructor(tag='div',attrs={}){this.tagName=tag;this.attrs=attrs;this.dataset={};this.value=attrs.value||'';this.textContent='';this._html='';this.paused=true;this.currentTime=0;this.style={setProperty(){}};this.handlers={};this.children=[];this.classes=new Set((attrs.class||'').split(' '));this.classList={add:(s)=>this.classes.add(s),remove:(s)=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>{const on=v===undefined?!this.classes.has(s):v;on?this.classes.add(s):this.classes.delete(s);return on}};for(const[k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;if(attrs.id)ids.set(attrs.id,this);nodes.push(this)}
    set innerHTML(v){this._html=v;this.children=parse(v)}
    get innerHTML(){return this._html}
    addEventListener(k,f){(this.handlers[k]??=[]).push(f)}
    setAttribute(k,v){this.attrs[k]=v}
    removeAttribute(k){delete this.attrs[k]}
    querySelector(s){return select(s,this.children)[0]||null}
    querySelectorAll(s){return select(s,this.children)}
    append(e){this.children.push(e)}
    focus(){doc.activeElement=this}
    remove(){}
    closest(){return null}
    scrollIntoView(){}
    reset(){for(const id of ['journalText','gratitudeText'])ids.get(id).value=''}
    click(){return this.onclick?.({target:this})}
    load(){}
    async play(){if(options.audioFails)throw Error('network');this.paused=false;this.onplay?.()}
    pause(){this.paused=true;this.onpause?.()}
  }
  function parse(text){const a=[];for(const m of text.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)){const attrs={};for(const v of m[2].matchAll(/([\w-]+)="([^"]*)"/g))attrs[v[1]]=v[2];a.push(new Element(m[1],attrs))}return a}
  function select(s,pool=nodes){if(s.includes(' '))s=s.split(' ').at(-1);if(s[0]==='#')return ids.has(s.slice(1))?[ids.get(s.slice(1))]:[];if(s[0]==='.')return pool.filter(n=>n.classes.has(s.slice(1)));const m=s.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);if(m)return pool.filter(n=>m[1]in n.attrs&&(m[2]===undefined||n.attrs[m[1]]===m[2]));return pool.filter(n=>n.tagName===s)}
  parse(html);doc={querySelector:s=>select(s)[0]||null,querySelectorAll:s=>select(s),body:new Element('body'),documentElement:new Element('html'),addEventListener:(k,f)=>(listeners[k]??=[]).push(f),createElement:t=>new Element(t),modelContext:{registerTool:t=>{tools[t.name]=t}},activeElement:null,hidden:false};
  const FakeDate=class extends Date{constructor(...a){super(...(a.length?a:[clock]))}static now(){return clock}};
  const localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>{if(failWrite)throw Error('quota');memory.set(k,v)}};
  const ctx={document:doc,localStorage,navigator:{},history:{replaceState(){}},location:{hash:''},scrollTo(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,Date:FakeDate,Intl,crypto:require('crypto').webcrypto,AbortController,MutationObserver:class{observe(){}},Blob,URL,console,addEventListener(){},focus(){},confirm:()=>true};
  const notifications=[];
  if(options.notifications){
    ctx.Notification=class {static permission='granted';static async requestPermission(){return 'granted'}constructor(){throw Error('Mobile constructor must not be used')}};
    ctx.navigator.serviceWorker={register:async()=>({active:true,showNotification:async(title,data)=>{notifications.push({title,data})}})};
  }
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/content.js','utf8'),ctx);
  doc.getElementById=id=>ids.get(id);
  const spoken=[];
  if(options.speech){ctx.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};ctx.speechSynthesis={getVoices:()=>[],addEventListener(){},cancel(){},speak:u=>{spoken.push(u);u.onstart?.()}}}
  const source=fs.readFileSync('dist/app.js','utf8').replace(/\}\)\(\);\s*$/,'globalThis.testAPI={dateKey,dayNumber,entries,renderEntries,refreshDaily,cardLines,renderSaved,checkReminder,playTrack,checkSleep};})();');
  vm.runInContext(source,ctx);
  vm.runInContext(fs.readFileSync('dist/lessons.js','utf8'),ctx);
  vm.runInContext(fs.readFileSync('dist/study.js','utf8').replace(/\}\)\(\);\s*$/,'globalThis.studyAPI={open,chooseBlock,item,toggle,stop,state,pauseAway};})();'),ctx);
  vm.runInContext(fs.readFileSync('dist/audiobooks-data.js','utf8'),ctx);
  vm.runInContext(fs.readFileSync('dist/audiobooks.js','utf8').replace(/\}\)\(\);\s*$/,'globalThis.audioAPI={filtered,toggleSaved,openEmbed,close};})();'),ctx);
  vm.runInContext(fs.readFileSync('dist/christ-song.js','utf8'),ctx);
  return {ctx,ids,memory,tools,spoken,api:ctx.testAPI,study:ctx.studyAPI,notifications,setClock:v=>clock=Date.parse(v),setFail:v=>failWrite=v};
}
(async()=>{
  const b=boot({'cdl-favs':'["daily-263","le"]','cdl-journal':'[]'});
  ok(b.ctx.CDL_CONTENT.daily.length===24,'24 original reflections');
  ok(JSON.parse(b.memory.get('cdl-favs')).includes('reflection-3'),'v1 favourite migration');
  ok(b.ids.get('savedMessages').innerHTML.includes('Somos convidados'),'saved reflection retrieval');
  b.ids.get('bookSearch').value='espiritos';b.ids.get('bookSearch').oninput();
  ok(b.ids.get('bookGrid').innerHTML.includes('O Livro dos Espíritos'),'accent-insensitive search');
  b.ids.get('journalText').value='Existing unsaved thought';b.ids.get('reflectBtn').onclick();
  ok(b.ids.get('journalText').value==='Existing unsaved thought','reflection prompt does not overwrite draft');
  const created=b.tools.create_journal_entry.execute({text:'<img src=x onerror=alert(1)>',gratitude:'Hoje',mood:'Grato'});
  ok(created.saved&&b.api.entries().length===1,'journal save and state read-back');
  ok(b.ids.get('entries').innerHTML.includes('&lt;img'),'journal output escapes markup');
  const count=b.api.entries().length;
  assert.throws(()=>b.tools.create_journal_entry.execute({text:'valid',gratitude:42}));checks++;
  ok(b.api.entries().length===count,'invalid tool input leaves state unchanged');
  b.setFail(true);b.ids.get('journalText').value='Keep this text';
  assert.throws(()=>b.ids.get('journalForm').onsubmit({preventDefault(){},target:b.ids.get('journalForm')}));checks++;
  ok(b.ids.get('journalText').value==='Keep this text','quota failure preserves typed text');b.setFail(false);
  const before=b.ids.get('dailyText').textContent;b.setClock('2026-09-20T12:00:00-03:00');b.api.refreshDaily();
  ok(before!==b.ids.get('dailyText').textContent,'daily reflection changes without reload');
  ok(b.api.dayNumber(new Date('2026-12-31T12:00:00-03:00'))+1===b.api.dayNumber(new Date('2027-01-01T12:00:00-03:00')),'day identity crosses year boundary');
  const lines=b.api.cardLines({measureText:s=>({width:s.length*10})},'W'.repeat(240),900);
  ok(lines.every(s=>s.length<=90)&&lines.join('').length===240,'long card words wrap without loss');
  ok(b.tools.navigate_to_section.execute({section:'music'}).section==='music','music navigation tool');
  await b.api.playTrack(0);ok(b.ids.get('musicAudio').paused===false,'manual audio play path');
  b.ids.get('miniToggle').onclick();ok(b.ids.get('musicAudio').paused,'audio pause path');
  b.ids.get('sleepTimer').value='5';b.ids.get('sleepTimer').onchange();await b.api.playTrack(1);b.setClock('2026-09-20T12:06:00-03:00');b.api.checkSleep();ok(b.ids.get('musicAudio').paused,'sleep timer pauses music');
  const bad=boot({'cdl-favs':'{}','cdl-journal':'null','cdl-prefs':'[]'},{audioFails:true});await bad.api.playTrack(0);
  ok(bad.ids.get('musicStatus').textContent.includes('não carregou'),'audio network error is visible');
  ok(bad.api.entries().length===0,'malformed local data does not crash initialization');
  const reminders=boot({'cdl-prefs':'{"notify":true,"time":"13:00"}'},{notifications:true});
  await reminders.api.checkReminder();ok(reminders.notifications.length===0,'no notification before chosen local time');
  reminders.setClock('2026-09-19T14:00:00-03:00');await reminders.api.checkReminder();
  ok(reminders.notifications.length===1,'mobile notification uses service worker');
  await reminders.api.checkReminder();ok(reminders.notifications.length===1,'daily notification is deduplicated');
  reminders.setClock('2026-09-20T14:00:00-03:00');await reminders.api.checkReminder();
  ok(reminders.notifications.length===2,'notification resumes on next local day');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);ok(ids.length===new Set(ids).size,'unique element IDs');
  ok(b.ctx.CDL_LESSONS.length===6,'six original guided studies');
  ok(b.ids.get('listenLesson').disabled,'unsupported speech keeps text available');
  const s=boot({},{speech:true});s.study.open('caridade');s.study.chooseBlock(1);
  s.ids.get('lessonNote').value='<script>personal note</script>';s.ids.get('lessonNote').handlers.input[0]();
  s.ids.get('saveLesson').onclick();s.ids.get('completeLesson').onclick();
  ok(s.ids.get('myStudies').innerHTML.includes('&lt;script&gt;'),'study notes escape markup');
  const restored=boot(Object.fromEntries(s.memory));
  ok(restored.study.state.current==='caridade'&&restored.study.item().block===1,'study resumes saved paragraph');
  ok(restored.study.item().saved&&restored.study.item().done&&restored.study.item().note.includes('personal note'),'notes bookmarks and completion persist');
  ok(!s.study.chooseBlock(99)&&!s.study.open('missing'),'invalid study targets rejected');
  await s.api.playTrack(0);s.study.toggle();
  ok(s.ids.get('musicAudio').paused&&s.spoken.length===1,'narration pauses music');
  const old=s.spoken[0];s.study.toggle();old.onend();
  ok(s.study.item().block===1,'stale speech events cannot advance progress');
  s.study.toggle();s.spoken.at(-1).onend();
  ok(s.study.item().block===2,'narration advances and persists paragraph');
  s.study.pauseAway();ok(s.ids.get('listenLesson').textContent==='Retomar trecho','leaving app pauses narration');
  await s.api.playTrack(1);ok(!s.ctx.CDL_NARRATION.active,'music stops narration');
  s.setFail(true);s.ids.get('lessonNote').value='Keep my note';s.ids.get('lessonNote').handlers.input[0]();
  ok(s.ids.get('lessonNote').value==='Keep my note'&&s.ids.get('noteStatus').textContent.includes('Não foi possível'),'study quota failure preserves draft and warns');
  ok((html.match(/class="nav-btn/g)||[]).length===4,'four primary navigation destinations');
  const ab=boot({},{speech:true});
  ok(ab.ctx.CDL_AUDIOBOOKS_DATA.length===33,'33 reviewed audiobook editions');
  ab.ids.get('audioSearch').value='lucius';ab.ids.get('audioSearch').oninput();
  ok(ab.ctx.audioAPI.filtered().length===1&&ab.ids.get('audiobookGrid').innerHTML.includes('Se abrindo'),'spiritual author search finds Zibia and Lucius');
  ab.ids.get('audioSearch').value='leon denis';ok(ab.ctx.audioAPI.filtered().length===1,'accent insensitive audiobook search');
  ab.ids.get('audioSearch').value='';ab.ids.get('audioLanguage').value='pt';ab.ids.get('audioAccess').value='free';ok(ab.ctx.audioAPI.filtered().length===0,'paid Portuguese books not mislabeled free');
  ab.ids.get('audioAccess').value='saved';ab.ctx.audioAPI.toggleSaved('se-abrindo');ok(ab.ctx.audioAPI.filtered().length===1,'saved audiobook filter');
  const abReload=boot(Object.fromEntries(ab.memory));abReload.ids.get('audioAccess').value='saved';ok(abReload.ctx.audioAPI.filtered().length===1,'audio list survives reload');
  ab.setFail(true);ok(!ab.ctx.audioAPI.toggleSaved('espiritos')&&ab.ids.get('audioSaveStatus').textContent.includes('Não foi possível'),'audiobook storage failure reported');ab.setFail(false);
  await ab.api.playTrack(0);ab.ctx.audioAPI.openEmbed('spirits-en');ok(ab.ids.get('musicAudio').paused&&ab.ids.get('audioEmbedHost').innerHTML.includes('archive.org/embed/'),'external audiobook pauses music and loads player on demand');
  ab.ctx.CDL_NAV('study');ok(ab.ids.get('audioEmbedHost').innerHTML==='','leaving audiobook view removes playing iframe');
  ab.study.toggle();ab.ctx.audioAPI.openEmbed('se-abrindo');ok(!ab.ctx.CDL_NARRATION.active,'audiobook player stops synthetic narration');
  await ab.api.playTrack(0);ok(ab.ids.get('audioEmbedHost').innerHTML==='','music closes external audiobook player');
  ok(!ab.ctx.audioAPI.openEmbed('missing'),'unknown audiobook rejected');
  const song=boot({}, {speech:true});
  ok(song.ids.get('christSongPlayer').innerHTML==='','song does not load on launch');
  await song.api.playTrack(0);song.ids.get('openChristSong').click();
  ok(song.ids.get('musicAudio').paused&&song.ids.get('christSongPlayer').innerHTML.includes('youtube-nocookie.com/embed/JWMdS8usKQI'),'song opens verified publication and pauses classical music');
  song.ctx.CDL_NAV('journal');ok(song.ids.get('christSongPlayer').innerHTML==='','leaving music destroys song iframe');
  song.ids.get('openChristSong').click();await song.api.playTrack(0);ok(song.ids.get('christSongPlayer').innerHTML==='','classical music closes song');
  song.ids.get('openChristSong').click();song.study.toggle();ok(song.ids.get('christSongPlayer').innerHTML==='','narration closes song');
  song.ids.get('openChristSong').click();song.ctx.audioAPI.openEmbed('spirits-en');ok(song.ids.get('christSongPlayer').innerHTML==='','audiobook closes song');
  song.ids.get('openChristSong').click();ok(song.ids.get('audioEmbedHost').innerHTML==='','song closes audiobook');
  song.ids.get('closeChristSong').click();ok(song.ids.get('christSongPlayer').innerHTML==='','explicit song stop destroys iframe');

  for(const f of ['study.js','study.css','lessons.js'])ok(fs.readFileSync('dist/sw.js','utf8').includes('./'+f),'offline asset '+f);
  for(const f of ['index.html','content.js','app.js','refinement.css','sw.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png'])ok(fs.existsSync('dist/'+f),'asset exists '+f);
  const manifest=JSON.parse(fs.readFileSync('dist/manifest.webmanifest'));ok(manifest.icons.some(i=>i.sizes==='192x192'),'installable raster icon');
  console.log('Total: '+checks+' assertions passed. Browser rendering, live audio, real notifications and native WebMCP not validated by this harness.');
})().catch(e=>{console.error(e);process.exitCode=1});
