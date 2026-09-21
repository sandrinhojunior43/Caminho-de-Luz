(() => {
const $=s=>document.querySelector(s);
function close(){ $('#christSongPlayer').innerHTML='';$('#openChristSong').setAttribute('aria-expanded','false');$('#closeChristSong').classList.add('hidden');$('#christSongStatus').textContent='O player do YouTube será carregado ao tocar no botão. Requer internet.'; }
$('#openChristSong').onclick=()=>{
window.CDL_AUDIOBOOKS?.close();window.CDL_NARRATION?.stop();window.CDL_PAUSE_MUSIC?.();$('#miniPlayer').classList.add('hidden');
$('#christSongPlayer').innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/JWMdS8usKQI" title="O Homem de Nazareth — Antonio Marcos" allow="encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
$('#openChristSong').setAttribute('aria-expanded','true');$('#closeChristSong').classList.remove('hidden');$('#christSongStatus').textContent='Toque em reproduzir no player. Se ele não estiver disponível, use os links do YouTube ou Spotify abaixo.';
};
$('#closeChristSong').onclick=close;
window.CDL_SONG={close};
})();
