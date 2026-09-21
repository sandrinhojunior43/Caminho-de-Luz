(()=>{
    const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
    const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){toast('Não foi possível salvar. Exporte seus registros; seu texto foi mantido.');throw e}}};
    const {daily,books,stories}=window.CDL_CONTENT;
    const state={filter:'Todas',mood:'',cardTheme:'blue',deferred:null};
    const dateKey=(d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
    const dayNumber=(d=new Date())=>Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);
    let day=dayNumber(), message=daily[((day%daily.length)+daily.length)%daily.length];
    $('#todayDate').textContent=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
    $('#dailyText').textContent=message.text; $('#dailySource').textContent=message.source; $('#dailyQuestion').textContent=message.question;

    function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2400)}
    const viewScroll={};let activeView='today';
    function navigate(view){if(!['today','study','journal','create','stories','music','reader','audiobooks'].includes(view))return;if(view!=='audiobooks')window.CDL_AUDIOBOOKS?.close();if(view!=='music')window.CDL_SONG?.close();viewScroll[activeView]=window.scrollY||0;activeView=view;document.body.classList.remove('reader-focus');$$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===view));const tab=['reader','stories','music','audiobooks'].includes(view)?'study':view;$$('.nav-btn').forEach(b=>{b.classList.toggle('active',b.dataset.target===tab);b.setAttribute('aria-current',b.dataset.target===tab?'page':'false')});scrollTo({top:viewScroll[view]||0,behavior:'instant'});history.replaceState(null,'','#'+view)}
    window.CDL_NAV=navigate;
    $$('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));
    $$('.nav-btn').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.target)));
    $('#reflectBtn').onclick=()=>{navigate('journal');if(!$('#journalText').value.trim())$('#journalText').value=message.question+'\n\n';$('#journalText').focus()};

    function favs(){const a=store.get('cdl-favs',[]);return Array.isArray(a)?a.filter(x=>typeof x==='string'):[]}
    function isFav(id){return favs().includes(id)}
    function toggleFav(id){let a=favs();a=a.includes(id)?a.filter(x=>x!==id):[...a,id];store.set('cdl-favs',a);renderBooks();syncDailyFav();renderSaved();toast(a.includes(id)?'Guardado nos favoritos':'Removido dos favoritos')}
    function syncDailyFav(){const id='reflection-'+daily.indexOf(message), on=isFav(id);$('#dailyFav').textContent=(on?'★':'☆')+' Guardar'}
    $('#dailyFav').onclick=()=>toggleFav('reflection-'+daily.indexOf(message));syncDailyFav();
    $('#shareDaily').onclick=async()=>{const data={title:'Caminho de Luz',text:message.text+'\n\n'+message.source};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.text);toast('Mensagem copiada')}}catch(e){if(e.name!=='AbortError')toast('Não foi possível compartilhar. Tente baixar um cartão.')}}

    function normalize(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
    function renderBooks(){const q=normalize($('#bookSearch').value).trim();const list=books.filter(b=>(state.filter==='Todas'||b.cat===state.filter||(state.filter==='Favoritos'&&isFav(b.id)))&&(normalize(`${b.title} ${b.author} ${b.theme}`).includes(q)));$('#bookGrid').innerHTML=list.length?list.map((b,i)=>`<article class="glass book"><div><span class="tag">${b.cat}</span><div class="book-no">${String(i+1).padStart(2,'0')}</div><h3>${b.title}</h3><p>${b.theme}</p></div><div class="card-bottom"><button class="text-btn" data-book="${b.id}">Conhecer a obra</button><button class="fav ${isFav(b.id)?'on':''}" data-fav="${b.id}" aria-label="Favoritar">${isFav(b.id)?'★':'☆'}</button></div></article>`).join(''):'<div class="glass empty">Nenhuma obra encontrada com esses termos.</div>';$$('[data-book]').forEach(x=>x.onclick=()=>openBook(x.dataset.book));$$('[data-fav]').forEach(x=>x.onclick=()=>toggleFav(x.dataset.fav))}
    $('#bookSearch').oninput=renderBooks;$$('#bookFilters .chip').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;$$('#bookFilters .chip').forEach(x=>x.classList.toggle('active',x===b));renderBooks()});
    function openBook(id){const b=books.find(x=>x.id===id);$('#modalTag').textContent=b.cat;$('#modalTitle').textContent=b.title;$('#modalBody').innerHTML=`<p><strong>${b.author}</strong></p><section><h3>Sobre a obra</h3><p>${b.summary}</p></section><section><h3>Principais aprendizados</h3><ul>${b.lessons.map(x=>`<li>${x}</li>`).join('')}</ul></section><section><h3>Para refletir</h3><ul>${b.questions.map(x=>`<li>${x}</li>`).join('')}</ul></section><p class="notice">Este conteúdo é uma síntese introdutória. Consulte a obra e uma edição confiável para estudo completo.</p>`;$('#detailModal').classList.add('open');$('#sheet').scrollTop=0}renderBooks();

    function renderStories(){$('#storyGrid').innerHTML=stories.map((s,i)=>`<article class="glass story"><div><span class="tag">${s.tag}</span><div class="year">${s.year}</div><h3>${s.title}</h3><p>${s.text}</p></div><button class="text-btn" data-story="${i}">Ver contexto</button></article>`).join('');$$('[data-story]').forEach(b=>b.onclick=()=>{const s=stories[+b.dataset.story];$('#modalTag').textContent=s.tag;$('#modalTitle').textContent=s.title;$('#modalBody').innerHTML=`<p>${s.text}</p><section><h3>O que observar</h3><p>${s.learn}</p></section><section><h3>Fonte para aprofundar</h3><p>${s.source}</p></section><p class="notice">Relatos históricos e mediúnicos são apresentados como objetos de memória e estudo, com indicação de sua natureza e fonte.</p>`;$('#detailModal').classList.add('open')})}renderStories();
    $('#closeModal').onclick=()=>$('#detailModal').classList.remove('open');$('#detailModal').onclick=e=>{if(e.target===$('#detailModal'))$('#detailModal').classList.remove('open')};document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#detailModal').classList.remove('open')});

    $$('.mood').forEach(b=>b.onclick=()=>{state.mood=b.dataset.mood;$$('.mood').forEach(x=>x.classList.toggle('active',x===b))});
    function entries(){const a=store.get('cdl-journal',[]);return Array.isArray(a)?a.filter(e=>e&&typeof e.id==='string'&&typeof e.date==='string'&&Number.isFinite(Date.parse(e.date))&&typeof e.text==='string'&&(!e.gratitude||typeof e.gratitude==='string')):[]}
    function renderEntries(){const list=entries();$('#entries').innerHTML=list.length?list.map(e=>`<article class="entry"><div class="entry-head"><span>${escapeHtml(e.mood||'Reflexão')} • ${new Date(e.date).toLocaleDateString('pt-BR')}</span><button class="text-btn" data-delete="${escapeHtml(e.id)}">Excluir</button></div><p>${escapeHtml(e.text)}</p>${e.gratitude?`<p><strong>Gratidão:</strong> ${escapeHtml(e.gratitude)}</p>`:''}</article>`).join(''):'<div class="empty">Seu caderno ainda está em branco.<br>Comece quando sentir vontade.</div>';$$('[data-delete]').forEach(b=>b.onclick=()=>{if(confirm('Excluir esta reflexão deste aparelho?')){store.set('cdl-journal',entries().filter(e=>e.id!==b.dataset.delete));renderEntries();updateJourney()}})}
    function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
    $('#journalForm').onsubmit=e=>{e.preventDefault();const text=$('#journalText').value.trim(),gratitude=$('#gratitudeText').value.trim();if(!text&&!gratitude)return toast('Escreva algo para guardar');const list=entries();list.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),date:new Date().toISOString(),mood:state.mood,text,gratitude});store.set('cdl-journal',list);try{store.set('cdl-draft',null)}catch{}$('#draftStatus').textContent='';e.target.reset();state.mood='';$$('.mood').forEach(x=>x.classList.remove('active'));renderEntries();updateJourney();toast('Reflexão guardada neste aparelho')};
    $('#exportJournal').onclick=()=>{const text=entries().map(e=>`${new Date(e.date).toLocaleString('pt-BR')} — ${e.mood||'Reflexão'}\n${e.text}${e.gratitude?'\nGratidão: '+e.gratitude:''}`).join('\n\n———\n\n');if(!text)return toast('Ainda não há reflexões para exportar');downloadBlob(new Blob([text],{type:'text/plain;charset=utf-8'}),'meu-caderno-caminho-de-luz.txt')};
    function updateJourney(){const unique=new Set(entries().map(e=>dateKey(new Date(e.date)))).size;$('#journeyCount').textContent=unique+' '+(unique===1?'dia':'dias');$('#journeyTitle').textContent=unique<2?'Primeiro passo':unique<8?'Cultivando presença':'Um caminho em construção';$('#journeyBar').style.width=Math.min(100,unique*10)+'%'}renderEntries();updateJourney();

    function updateCard(){const text=$('#cardText').value.trim()||'Sua mensagem de luz';$('#previewText').textContent=text;$('#previewSignature').textContent=$('#cardSignature').value.trim()||'Uma mensagem de luz'}$('#cardText').oninput=updateCard;$('#cardSignature').oninput=updateCard;updateCard();
    $$('.swatch').forEach(b=>b.onclick=()=>{state.cardTheme=b.dataset.theme;$$('.swatch').forEach(x=>x.classList.toggle('active',x===b));$('#cardPreview').className='card-preview'+(state.cardTheme==='blue'?'':' '+state.cardTheme)});

    function cardLines(ctx,text,max){
      const rows=[];for(const paragraph of text.split('\n')){let row='';for(const word of paragraph.split(/\s+/)){let token=word;if(ctx.measureText(row+(row?' ':'')+token).width<=max){row+=(row?' ':'')+token;continue}if(row){rows.push(row);row=''}for(const char of token){if(ctx.measureText(row+char).width>max){rows.push(row);row=''}row+=char}}rows.push(row)}return rows;
    }
    function drawCard(){
      const c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d');
      if(!x)throw new Error('Canvas indisponível');const colors={blue:['#153a60','#3c80a4'],amber:['#70492b','#c58b42'],violet:['#382f64','#6d68a7']}[state.cardTheme],g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,colors[0]);g.addColorStop(1,colors[1]);x.fillStyle=g;x.fillRect(0,0,1080,1350);x.fillStyle='#ffe4a0';x.font='70px Georgia';x.fillText('✦',90,140);
      const text=($('#cardText').value.trim()||'Sua mensagem de luz').slice(0,240);let size=56,lines=[];
      do{x.font=size+'px Georgia';lines=cardLines(x,text,900);if(lines.length*size*1.4<=830)break;size-=2}while(size>=12);
      x.fillStyle='#fff';let y=260+Math.max(0,(830-lines.length*size*1.4)/2);for(const line of lines){x.fillText(line,90,y);y+=size*1.4}
      const signature=($('#cardSignature').value.trim()||'Uma mensagem de luz').slice(0,40);let sigSize=32;do{x.font='bold '+sigSize+'px Arial';if(x.measureText(signature).width<=900)break;sigSize--}while(sigSize>14);x.fillText(signature,90,1180);x.fillStyle='rgba(255,255,255,.75)';x.font='25px Arial';x.fillText('Caminho de Luz',90,1230);return c;
    }
    function downloadBlob(blob,name){if(!blob)return toast('Não foi possível gerar o arquivo');const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
    $('#downloadCard').onclick=()=>drawCard().toBlob(b=>{downloadBlob(b,'mensagem-de-luz.png');toast('Cartão criado')},'image/png');
    $('#shareCard').onclick=()=>drawCard().toBlob(async blob=>{const file=new File([blob],'mensagem-de-luz.png',{type:'image/png'});try{if(navigator.canShare?.({files:[file]}))await navigator.share({title:'Mensagem de luz',files:[file]});else{downloadBlob(blob,file.name);toast('Cartão baixado para compartilhar')}}catch{}},'image/png');

    $('#settingsBtn').onclick=()=>$('#settings').classList.toggle('open');document.addEventListener('click',e=>{if(!e.target.closest('#settings')&&!e.target.closest('#settingsBtn'))$('#settings').classList.remove('open')});
    const rawPrefs=store.get('cdl-prefs',{}); const prefs={dark:false,large:false,notify:false,time:'09:00',...(rawPrefs&&typeof rawPrefs==='object'&&!Array.isArray(rawPrefs)?rawPrefs:{})};if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(prefs.time))prefs.time='09:00';
    function applyPrefs(){document.body.classList.toggle('dark',prefs.dark);document.documentElement.style.setProperty('--font',prefs.large?'1.1':'1');$('#darkSwitch').classList.toggle('on',prefs.dark);$('#fontSwitch').classList.toggle('on',prefs.large);$('#notifySwitch').classList.toggle('on',prefs.notify)}applyPrefs();
    $('#darkSwitch').onclick=()=>{prefs.dark=!prefs.dark;store.set('cdl-prefs',prefs);applyPrefs()};$('#fontSwitch').onclick=()=>{prefs.large=!prefs.large;store.set('cdl-prefs',prefs);applyPrefs()};

    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.deferred=e;$('#installBtn').classList.remove('hidden')});$('#installBtn').onclick=async()=>{if(state.deferred){state.deferred.prompt();await state.deferred.userChoice;state.deferred=null}else toast('No celular, use “Adicionar à tela inicial” no menu do navegador')};
    
    if(document.modelContext?.registerTool){
      const toolLife=new AbortController();
      const register=tool=>{try{void Promise.resolve(document.modelContext.registerTool(tool,{signal:toolLife.signal})).catch(()=>{})}catch{}};
      register({name:'navigate_to_section',title:'Abrir seção',description:'Abre uma seção visível do aplicativo Caminho de Luz.',inputSchema:{type:'object',properties:{section:{type:'string',enum:['today','study','stories','journal','create','music']}},required:['section'],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||!['today','study','stories','journal','create','music'].includes(input.section))throw new Error('Seção inválida');navigate(input.section);return{section:input.section}}});
      register({name:'create_journal_entry',title:'Guardar reflexão',description:'Cria uma reflexão privada no diário deste aparelho e atualiza a lista visível.',inputSchema:{type:'object',properties:{text:{type:'string',minLength:1,maxLength:5000},gratitude:{type:'string',maxLength:500},mood:{type:'string',enum:['Em paz','Grato','Pensativo','Cansado']}},required:['text'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){if(!input||Object.keys(input).some(k=>!['text','gratitude','mood'].includes(k))||typeof input.text!=='string'||!input.text.trim()||input.text.length>5000)throw new Error('Texto inválido');if(input.gratitude!==undefined&&(typeof input.gratitude!=='string'||input.gratitude.length>500))throw new Error('Gratidão muito longa');if(input.mood&&!['Em paz','Grato','Pensativo','Cansado'].includes(input.mood))throw new Error('Estado inválido');const item={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),date:new Date().toISOString(),mood:input.mood||'',text:input.text.trim(),gratitude:(input.gratitude||'').trim()};store.set('cdl-journal',[item,...entries()]);renderEntries();updateJourney();navigate('journal');return{id:item.id,saved:true}}});
    }
    // Stable message favourites, preserving the original v1 day-based records.
    const oldFavs=favs();
    const migrated=[...new Set(oldFavs.map(id=>/^daily-\d+$/.test(id)?'reflection-'+(Number(id.slice(6))%10):id))];
    if(JSON.stringify(migrated)!==JSON.stringify(oldFavs)){try{store.set('cdl-favs',migrated)}catch{}}
    function renderSaved(){
      const list=daily.filter(m=>isFav(m.id));
      $('#savedMessages').innerHTML=list.length?list.map(m=>`<article class="entry"><blockquote>${escapeHtml(m.text)}</blockquote><p class="notice">${escapeHtml(m.source)}</p><button class="text-btn" data-remove-message="${m.id}">Remover dos favoritos</button></article>`).join(''):'<p class="notice">Use “Guardar” na reflexão de hoje. Ela ficará aqui para você reler.</p>';
      $$('[data-remove-message]').forEach(b=>b.onclick=()=>toggleFav(b.dataset.removeMessage));
    }
    renderSaved();syncDailyFav();renderBooks();
    function refreshDaily(){
      day=dayNumber();message=daily[((day%daily.length)+daily.length)%daily.length];
      $('#todayDate').textContent=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
      $('#dailyText').textContent=message.text;$('#dailySource').textContent=message.source;$('#dailyQuestion').textContent=message.question;$('#dailyContext').textContent=message.context;syncDailyFav();
    }
    refreshDaily();
    // Save drafts locally without overwriting saved entries. Failed saves retain typed input.
    const draft=store.get('cdl-draft',null);
    if(draft&&typeof draft.text==='string'){$('#journalText').value=draft.text;$('#gratitudeText').value=typeof draft.gratitude==='string'?draft.gratitude:'';$('#draftStatus').textContent='Rascunho recuperado deste aparelho.'}
    function saveDraft(){try{store.set('cdl-draft',{text:$('#journalText').value,gratitude:$('#gratitudeText').value});$('#draftStatus').textContent='Rascunho salvo neste aparelho.'}catch{$('#draftStatus').textContent='Não foi possível salvar o rascunho. Copie seu texto antes de sair.'}}
    $('#journalText').addEventListener('input',saveDraft);$('#gratitudeText').addEventListener('input',saveDraft);
    // Accessible modal focus, keyboard containment and return to originating control.
    let previousFocus=null;
    const modalObserver=new MutationObserver(()=>{
      if($('#detailModal').classList.contains('open')){
        previousFocus=document.activeElement;document.body.style.overflow='hidden';$('#sheet').scrollTop=0;$('#closeModal').focus();
        const b=books.find(x=>x.title===$('#modalTitle').textContent);
        if(b&&!$('#modalBody').querySelector('[data-reading-guide]')){
          const extra=document.createElement('section');extra.dataset.readingGuide='true';
          extra.innerHTML=`<h3>Por onde começar</h3><p>${escapeHtml(b.path)}</p><h3>Personagens e vozes</h3><p>${escapeHtml(b.people)}</p>${b.url?`<a href="${b.url}" target="_blank" rel="noopener noreferrer">Consultar a obra na KardecPedia ↗</a>`:'<p class="notice">Consulte estes tópicos na sua edição. Não reproduzimos a obra integral.</p>'}`;$('#modalBody').append(extra);
        }
        const s=stories.find(x=>x.title===$('#modalTitle').textContent);
        if(s?.url){const a=document.createElement('a');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Abrir fonte de estudo ↗';$('#modalBody').append(a)}
      }else{document.body.style.overflow='';previousFocus?.focus?.()}
    });modalObserver.observe($('#detailModal'),{attributes:true,attributeFilter:['class']});
    document.addEventListener('keydown',e=>{if(e.key==='Tab'&&$('#detailModal').classList.contains('open')){const items=$('button,a[href],input,textarea,select',$('#sheet')).filter(x=>!x.disabled);const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault()}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault()}}});
    function syncA11y(){for(const [id,val] of [['darkSwitch',prefs.dark],['fontSwitch',prefs.large],['notifySwitch',prefs.notify]]){$('#'+id).setAttribute('role','switch');$('#'+id).setAttribute('aria-checked',String(!!val))}$$('.nav-btn').forEach(b=>b.setAttribute('aria-current',b.classList.contains('active')?'page':'false'))}
    document.addEventListener('click',()=>setTimeout(syncA11y,0));syncA11y();
    // Notifications only while this document is running, or on resuming it.
    $('#reminderTime').value=prefs.time;
    function notificationStatus(){
      const permission='Notification'in window?Notification.permission:'unsupported';
      $('#notificationStatus').textContent=permission==='unsupported'?'Este navegador não oferece notificações. Use o calendário.':permission==='denied'?'Permissão bloqueada no navegador. Você pode reativá-la nas configurações do site.':prefs.notify?'Ativado para '+prefs.time+' no horário deste aparelho.':'Lembrete desativado. A permissão só é solicitada ao ativar.';
      syncA11y();
    }
    const swReady='serviceWorker'in navigator?navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>null):Promise.resolve(null);
    async function sendNotification(test=false){
      if(!('Notification'in window)||Notification.permission!=='granted')throw new Error('permission');
      const reg=await Promise.race([swReady,new Promise(r=>setTimeout(()=>r(null),3500))]);
      const options={body:test?'Tudo pronto para seu momento de reflexão.':message.text,icon:'./logo-192.png',tag:test?'cdl-test':'cdl-daily',data:{url:'./#today'}};
      if(reg?.active&&typeof reg.showNotification==='function')await reg.showNotification('Caminho de Luz',options);
      else {const n=new Notification('Caminho de Luz',options);n.onclick=()=>{window.focus();navigate('today');n.close()}}
    }
    let checking=false,notifiedInMemory='';
    async function checkReminder(){
      refreshDaily();
      if(!prefs.notify||checking||!('Notification'in window)||Notification.permission!=='granted')return;
      const now=new Date(),time=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'),key=dateKey();
      if(time<prefs.time||store.get('cdl-last-notified','')===key||notifiedInMemory===key)return;
      checking=true;
      try{await sendNotification();notifiedInMemory=key;store.set('cdl-last-notified',key)}catch{$('#notificationStatus').textContent='Não foi possível mostrar o aviso. Teste novamente ou use o calendário.'}finally{checking=false}
    }
    $('#notifySwitch').onclick=async()=>{
      if(prefs.notify){prefs.notify=false;try{store.set('cdl-prefs',prefs)}catch{}applyPrefs();notificationStatus();return}
      if(!('Notification'in window)){notificationStatus();return toast('Use o lembrete do calendário neste navegador')}
      try{const permission=await Notification.requestPermission();if(permission!=='granted'){notificationStatus();return toast('Notificações não autorizadas')}prefs.notify=true;store.set('cdl-prefs',prefs);applyPrefs();notificationStatus();toast('Lembrete ativado com o app aberto')}catch{toast('Não foi possível ativar o lembrete')}
    };
    $('#reminderTime').onchange=()=>{if(!/^([01]\d|2[0-3]):[0-5]\d$/.test($('#reminderTime').value))return;prefs.time=$('#reminderTime').value;try{store.set('cdl-prefs',prefs);notificationStatus()}catch{}};
    $('#testNotification').onclick=async()=>{try{await sendNotification(true);toast('Aviso de teste enviado')}catch{toast('Ative a permissão ou use o lembrete do calendário')}};
    $('#calendarReminder').onclick=()=>{
      const d=new Date(),[h,m]=prefs.time.split(':').map(Number);d.setHours(h,m,0,0);if(d<=new Date())d.setDate(d.getDate()+1);
      const local=dateKey(d).replaceAll('-','')+'T'+prefs.time.replace(':','')+'00';
      const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
      const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Caminho de Luz//PT-BR','BEGIN:VEVENT','UID:cdl-daily-'+Date.now()+'@caminho-de-luz','DTSTAMP:'+stamp,'DTSTART:'+local,'DURATION:PT10M','RRULE:FREQ=DAILY','SUMMARY:Meu momento de luz','DESCRIPTION:Abra o Caminho de Luz para uma leitura e uma reflexão.','BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Seu momento de luz','END:VALARM','END:VEVENT','END:VCALENDAR'];
      downloadBlob(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}),'momento-de-luz.ics');toast('Importe o arquivo no calendário para ativar o aviso');
    };
    notificationStatus();void checkReminder();setInterval(()=>void checkReminder(),30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){void checkReminder();checkSleep()}});
    // Music: manually started, unchanged licensed recordings streamed from Commons.
    const tracks=[
      {title:'Gymnopédie nº 1',composer:'Erik Satie',artist:'Robin Alciatore · Musopen',type:'Piano • contemplação',file:'https://upload.wikimedia.org/wikipedia/commons/9/90/Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg',source:'https://commons.wikimedia.org/wiki/File:Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg',license:'Domínio público declarado pela intérprete',licenseUrl:'https://commons.wikimedia.org/wiki/File:Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg'},
      {title:'Ave Maria, D.839',composer:'Franz Schubert',artist:'Paul De Bra',type:'Orquestra de acordeões • música sacra',file:"https://upload.wikimedia.org/wikipedia/commons/e/e1/Schubert%27s_Ave_Maria%2C_D.839_%28accordion_orchestra%29_-_Paul_De_Bra.ogg",source:"https://commons.wikimedia.org/wiki/File:Schubert%27s_Ave_Maria,_D.839_(accordion_orchestra)_-_Paul_De_Bra.ogg",license:'CC BY 4.0 • gravação sem alterações',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'}
    ];
    $('#trackList').innerHTML=tracks.map((t,i)=>`<article class="glass track"><span aria-hidden="true">♫</span><div><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.composer)} · ${escapeHtml(t.type)}</p><p>${escapeHtml(t.artist)}</p><p class="notice"><a href="${t.source}" target="_blank" rel="noopener noreferrer">Fonte e créditos</a> · <a href="${t.licenseUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(t.license)}</a></p></div><button class="primary" data-track="${i}">Ouvir</button></article>`).join('');
    const audio=$('#musicAudio');let currentTrack=-1,musicRequest=0,sleepDeadline=0;
    audio.volume=.4;audio.setAttribute('playsinline','');
    async function playTrack(i){
      window.CDL_SONG?.close();
      window.CDL_AUDIOBOOKS?.close();
      window.CDL_NARRATION?.stop();
      const request=++musicRequest;const t=tracks[i];if(!t)return;
      if(currentTrack!==i){audio.pause();audio.src=t.file;currentTrack=i;audio.load()}
      $('#miniPlayer').classList.remove('hidden');$('#nowTitle').textContent=t.title;$('#musicStatus').textContent='Carregando '+t.title+'…';
      try{await audio.play();if(request!==musicRequest)return;$('#musicStatus').textContent='Reproduzindo '+t.title+'. Você pode continuar lendo em outra aba do aplicativo.';syncMusic()}catch(e){if(request!==musicRequest)return;$('#musicStatus').textContent=e.name==='NotAllowedError'?'Toque novamente em Ouvir para autorizar a reprodução.':'A gravação não carregou. Verifique a conexão ou abra a fonte e tente novamente.';syncMusic()}
    }
    function syncMusic(){if(window.CDL_NARRATION?.active)return;$('#miniToggle').textContent=audio.paused?'Reproduzir':'Pausar';$('#miniToggle').setAttribute('aria-label',audio.paused?'Reproduzir música':'Pausar música');$$('[data-track]').forEach(b=>{b.textContent=Number(b.dataset.track)===currentTrack&&!audio.paused?'Pausar':'Ouvir'})}
    $$('[data-track]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.track);if(i===currentTrack&&!audio.paused){audio.pause();++musicRequest}else void playTrack(i)});
    $('#miniToggle').onclick=()=>{if(window.CDL_NARRATION?.active)return window.CDL_NARRATION.toggle();if(audio.paused)void playTrack(currentTrack);else{audio.pause();++musicRequest}};
    $('#stopMusic').onclick=()=>{if(window.CDL_NARRATION?.active)return window.CDL_NARRATION.stop();++musicRequest;audio.pause();audio.removeAttribute('src');audio.load();currentTrack=-1;sleepDeadline=0;$('#sleepTimer').value='0';$('#miniPlayer').classList.add('hidden');$('#musicStatus').textContent='Música encerrada.';syncMusic()};
    audio.onplay=()=>{window.CDL_NARRATION?.stop();checkSleep();syncMusic()};audio.onpause=syncMusic;audio.onended=()=>{$('#musicStatus').textContent='A música terminou. Escolha outra quando quiser.';syncMusic()};audio.onerror=()=>{$('#musicStatus').textContent='Não foi possível carregar o áudio. Confira sua internet ou abra a fonte da gravação.';syncMusic()};
    audio.ontimeupdate=()=>{if(window.CDL_NARRATION?.active)return;const s=Math.floor(audio.currentTime||0);$('#nowTime').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');checkSleep()};
    $('#musicVolume').oninput=()=>audio.volume=Number($('#musicVolume').value);
    $('#musicLoop').onchange=()=>audio.loop=$('#musicLoop').checked;
    $('#sleepTimer').onchange=()=>{const n=Number($('#sleepTimer').value);sleepDeadline=n?Date.now()+n*60000:0;$('#musicStatus').textContent=n?'A música será pausada em '+n+' minutos. O sistema pode adiar a pausa se suspender o app.':'Temporizador desativado.'};
    window.CDL_PAUSE_MUSIC=()=>{++musicRequest;audio.pause();sleepDeadline=0;$('#sleepTimer').value='0'};
    function checkSleep(){if(sleepDeadline&&Date.now()>=sleepDeadline){audio.pause();++musicRequest;sleepDeadline=0;$('#sleepTimer').value='0';$('#musicStatus').textContent='Seu tempo de escuta terminou. A música foi pausada.'}}
    setInterval(checkSleep,1000);
    window.addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(['today','study','stories','journal','create','music','audiobooks'].includes(v))navigate(v)});
    const initial=location.hash.slice(1);if(['today','study','stories','journal','create','music','audiobooks'].includes(initial))navigate(initial);
  })();
