
/**
 * Persian Radio — Simple PWA Player
 * Configure your stream and (optionally) nowplaying JSON endpoint below.
 */

const CONFIG = {
  STREAM_URL: "https://a10.asurahosting.com/public/radio-dubai/stream",
  // If you have a nowplaying endpoint, set it here; leave empty to skip.
  // Example AzuraCast public JSON: "https://a10.asurahosting.com/public/radio-dubai/nowplaying"
  NOWPLAYING_URL: ""
};

const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const vol = document.getElementById('volume');
const volPct = document.getElementById('volPct');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');

// Setup audio
audio.src = CONFIG.STREAM_URL;
audio.volume = vol.value/100;

function setLive(on){
  statusDot.classList.toggle('live', !!on);
  statusText.textContent = on ? 'در حال پخش' : 'آماده';
}

function play(){
  // Bust cache for live streams to avoid stale segments
  const url = new URL(CONFIG.STREAM_URL);
  url.searchParams.set('_t', Date.now().toString());
  audio.src = url.toString();
  audio.play().then(()=>{
    playBtn.textContent = '⏸︎ مکث';
    setLive(true);
  }).catch(err=>{
    console.warn('Autoplay blocked or error:', err);
    statusText.textContent = 'روی «پخش» بزنید';
  });
}

function pause(){
  audio.pause();
  playBtn.textContent = '▶︎ پخش';
  setLive(false);
}

playBtn.addEventListener('click', ()=>{
  if (audio.paused) play(); else pause();
});

stopBtn.addEventListener('click', ()=>{
  audio.pause();
  audio.currentTime = 0;
  playBtn.textContent = '▶︎ پخش';
  setLive(false);
});

vol.addEventListener('input', ()=>{
  audio.volume = vol.value/100;
  volPct.textContent = vol.value + '%';
});

audio.addEventListener('playing', ()=> setLive(true));
audio.addEventListener('pause',   ()=> setLive(false));
audio.addEventListener('error',   ()=> { setLive(false); statusText.textContent='خطا در پخش'; });

// Optional: fetch now playing metadata periodically
async function fetchNowPlaying(){
  if (!CONFIG.NOWPLAYING_URL) return;
  try{
    const r = await fetch(CONFIG.NOWPLAYING_URL, { cache: 'no-store' });
    const data = await r.json();
    // Try AzuraCast-like JSON shape
    const np = data.now_playing || data.playing || data;
    const artist = (np?.song?.artist) || (np?.artist) || '';
    const title  = (np?.song?.title)  || (np?.title)  || 'Live Stream';
    const art    = (np?.song?.art)    || (np?.art)    || '';

    titleEl.textContent  = title || 'Live Stream';
    artistEl.textContent = artist || '';
    if (art){
      const bust = art + (art.includes('?') ? '&' : '?') + '_t=' + Date.now();
      coverEl.src = bust;
    }else{
      coverEl.src = 'assets/logo.png';
    }
  }catch(e){
    // Silently ignore
    // console.log('metadata err', e);
  }
}
setInterval(fetchNowPlaying, 15000);
fetchNowPlaying();

// PWA install prompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-flex';
});
installBtn?.addEventListener('click', async ()=>{
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
});
