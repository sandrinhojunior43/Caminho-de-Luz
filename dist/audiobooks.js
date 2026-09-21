(()=>{
'use strict';
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],books=window.CDL_AUDIOBOOKS_DATA;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let saved=[];try{const v=JSON.parse(localStorage.getItem('cdl-audiobook-list')||'[]');if(Array.isArray(v))saved=v.filter(id=>books.some(b=>b.id===id))}catch{}
function filtered(){const q=normalize($('#audioSearch').value).trim(),a=$('#audioAuthor').value,x=$('#audioAccess').value,l=$('#audioLanguage').value;return books.filter(b=>(!a||b.author===a)&&(!l||b.language===l)&&(!x||(x==='saved'?saved.includes(b.id):b.access===x))&&normalize([b.title,b.author,b.spirit||'',b.narrator,b.category].join(' ')).includes(q))}
function render(){
 const list=filtered();$('#audioCount').textContent=list.length+' de '+books.length+' edições em áudio · '+books.filter(b=>b.language==='pt').length+' em português';
 $('#audiobookGrid').innerHTML=list.length?list.map(b=>'<article class="glass audiobook-card"><div class="audio-card-top"><span class="eyebrow">'+esc(b.category)+'</span><span class="audio-card-number" aria-hidden="true">♫</span></div><h2>'+esc(b.title)+'</h2><p class="audio-author">'+esc(b.author)+'</p>'+(b.spirit?'<p class="notice">'+esc(b.spirit)+'</p>':'')+'<div class="audio-labels"><span>'+(b.language==='en'?'Inglês':'Português')+'</span><span>'+(b.access==='free'?'Gratuito na fonte':'Compra ou assinatura')+'</span></div>'+(b.narrator?'<p class="notice">Narração: '+esc(b.narrator)+'</p>':'')+'<p class="notice">'+esc(b.note)+'</p><button class="text-btn audio-mark" data-audio-save="'+b.id+'" aria-pressed="'+saved.includes(b.id)+'">'+(saved.includes(b.id)?'★ Na minha lista':'☆ Guardar na lista')+'</button><div class="audio-links">'+(b.embed?'<button class="primary" data-audio-embed="'+b.id+'">'+(b.access==='free'?'Abrir player completo':'Abrir player Spotify')+'</button>':'')+b.links.map(l=>'<a data-audio-link="'+b.id+'" href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer">Abrir '+esc(l.label)+' ↗</a>').join('')+'</div></article>').join(''):'<div class="glass audio-empty">Nenhuma obra encontrada. Tente outro nome ou ajuste os filtros.</div>';
 all('[data-audio-save]').forEach(b=>b.onclick=()=>toggleSaved(b.dataset.audioSave));
 all('[data-audio-embed]').forEach(b=>b.onclick=()=>openEmbed(b.dataset.audioEmbed));
 all('[data-audio-link]').forEach(b=>b.onclick=()=>{close();pauseOtherAudio()});
}
function toggleSaved(id){if(!books.some(b=>b.id===id))return false;const next=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];try{localStorage.setItem('cdl-audiobook-list',JSON.stringify(next));saved=next;$('#audioSaveStatus').textContent='Lista salva neste aparelho.';render();return true}catch{$('#audioSaveStatus').textContent='Não foi possível salvar a lista neste aparelho.';return false}}
function pauseOtherAudio(){window.CDL_SONG?.close();window.CDL_NARRATION?.stop();window.CDL_PAUSE_MUSIC?.();$('#miniPlayer').classList.add('hidden')}
function close(){$('#audioEmbedHost').innerHTML='';$('#audioEmbedPanel').classList.add('hidden')}
function openEmbed(id){const b=books.find(x=>x.id===id);if(!b?.embed)return false;pauseOtherAudio();close();$('#audioEmbedTitle').textContent=b.title;$('#audioEmbedNotice').textContent=b.note+' Player externo: ao abrir, você se conecta ao provedor. Se não carregar, use o link da fonte abaixo.';$('#audioEmbedSource').href=b.links.find(l=>l.label==='Spotify')?.url||b.links[0].url;$('#audioEmbedHost').innerHTML='<iframe src="'+esc(b.embed)+'" title="'+esc(b.title)+' — player externo" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>';$('#audioEmbedPanel').classList.remove('hidden');$('#audioEmbedPanel').scrollIntoView({block:'start',behavior:'smooth'});return true}
window.CDL_AUDIOBOOKS={close};
$('#audioAuthor').innerHTML='<option value="">Todos os autores</option>'+[...new Set(books.map(b=>b.author))].sort((a,b)=>a.localeCompare(b,'pt-BR')).map(a=>'<option value="'+esc(a)+'">'+esc(a)+'</option>').join('');
$('#audioSearch').oninput=render;for(const id of ['audioAuthor','audioAccess','audioLanguage'])$('#'+id).onchange=render;
$('#closeAudioEmbed').onclick=close;
window.addEventListener('pagehide',close);
render();
})();
