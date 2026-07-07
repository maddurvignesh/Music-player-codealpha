const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressThumb = document.getElementById('progressThumb');
const volumeBar = document.getElementById('volumeBar');
const volumeFill = document.getElementById('volumeFill');
const volumeThumb = document.getElementById('volumeThumb');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const albumArt = document.getElementById('albumArt');
const artBg = document.getElementById('artBg');
const artFrame = document.getElementById('artFrame');
const playlistEl = document.getElementById('playlist');
const songCount = document.getElementById('songCount');
const visualizer = document.getElementById('visualizer');
const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');
const toastSub = document.getElementById('toastSub');

const songs = [
  { title: 'Blinding Lights', artist: 'The Weeknd', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 0, colors: ['#667eea', '#764ba2'] },
  { title: 'Shape of You', artist: 'Ed Sheeran', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 0, colors: ['#00b4db', '#0083b0'] },
  { title: 'Bohemian Rhapsody', artist: 'Queen', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 0, colors: ['#f093fb', '#f5576c'] },
  { title: 'Hotel California', artist: 'Eagles', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 0, colors: ['#4facfe', '#00f2fe'] },
  { title: 'Stairway to Heaven', artist: 'Led Zeppelin', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: 0, colors: ['#43e97b', '#38f9d7'] },
  { title: 'Billie Jean', artist: 'Michael Jackson', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', duration: 0, colors: ['#fa709a', '#fee140'] },
  { title: 'Smells Like Teen Spirit', artist: 'Nirvana', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', duration: 0, colors: ['#a18cd1', '#fbc2eb'] },
  { title: 'Imagine', artist: 'John Lennon', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', duration: 0, colors: ['#0c0c1a', '#1a1a3e'] },
];

let currentIndex = 0;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 0;
let isDraggingProgress = false;
let isDraggingVolume = false;
let animationId = null;
let toastTimeout = null;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getGradientCSS(colors) {
  const angle = Math.floor(Math.random() * 60 + 30);
  return `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`;
}

function loadSong(index) {
  const song = songs[index];
  audio.src = song.src;
  songTitle.style.opacity = '0';
  songArtist.style.opacity = '0';
  setTimeout(() => {
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    songTitle.style.opacity = '1';
    songArtist.style.opacity = '1';
  }, 150);
  artBg.style.background = getGradientCSS(song.colors);
  albumArt.classList.remove('rotating');
  artFrame.classList.remove('playing');
  audio.load();
  updatePlaylistActive();
  updateSongCount();
}

function showToast(title, artist) {
  toastText.textContent = title;
  toastSub.textContent = artist;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2200);
}

function playSong() {
  audio.play().then(() => {
    isPlaying = true;
    playBtn.textContent = '⏸';
    albumArt.classList.add('rotating');
    artFrame.classList.add('playing');
    visualizer.classList.add('active');
    startVisualizer();
  }).catch(e => {
    console.warn('Playback failed:', e);
    isPlaying = false;
    playBtn.textContent = '▶';
  });
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playBtn.textContent = '▶';
  albumArt.classList.remove('rotating');
  artFrame.classList.remove('playing');
  visualizer.classList.remove('active');
  stopVisualizer();
}

function togglePlay() {
  if (audio.src) {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  }
}

function prevSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  currentIndex--;
  if (currentIndex < 0) currentIndex = songs.length - 1;
  const song = songs[currentIndex];
  loadSong(currentIndex);
  showToast(song.title, song.artist);
  if (isPlaying) playSong();
}

function getNextIndex() {
  if (isShuffled) {
    let next;
    do {
      next = Math.floor(Math.random() * songs.length);
    } while (next === currentIndex && songs.length > 1);
    return next;
  }
  return (currentIndex + 1) % songs.length;
}

function nextSong() {
  currentIndex = getNextIndex();
  const song = songs[currentIndex];
  loadSong(currentIndex);
  showToast(song.title, song.artist);
  if (isPlaying) playSong();
}

function toggleShuffle() {
  isShuffled = !isShuffled;
  shuffleBtn.classList.toggle('active');
}

function toggleRepeat() {
  repeatMode = (repeatMode + 1) % 3;
  const labels = ['🔁', '🔂', '🔁'];
  repeatBtn.textContent = labels[repeatMode];
  repeatBtn.classList.toggle('active', repeatMode > 0);
  if (repeatMode === 1) {
    repeatBtn.style.color = '#fbbf24';
  } else if (repeatMode === 2) {
    repeatBtn.style.color = '';
  }
}

function updateProgress() {
  if (audio.duration && !isDraggingProgress) {
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${pct}%`;
    progressThumb.style.left = `${pct}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
}

function setProgress(e) {
  const rect = progressBar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
  progressFill.style.width = `${pct * 100}%`;
  progressThumb.style.left = `${pct * 100}%`;
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

function setVolume(e) {
  const rect = volumeBar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.volume = pct;
  volumeFill.style.width = `${pct * 100}%`;
  volumeThumb.style.left = `${pct * 100}%`;
  const icon = pct === 0 ? '🔇' : pct < 0.5 ? '🔉' : '🔊';
  document.querySelector('.vol-icon').textContent = icon;
}

function updatePlaylistActive() {
  document.querySelectorAll('.playlist-item').forEach((item, i) => {
    item.classList.toggle('active', i === currentIndex);
    if (i === currentIndex) {
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
}

function updateSongCount() {
  const playing = songs[currentIndex];
  songCount.textContent = `${playing.title} • ${playing.artist}`;
}

function buildPlaylist() {
  playlistEl.innerHTML = '';
  songs.forEach((song, i) => {
    const item = document.createElement('div');
    item.className = `playlist-item${i === currentIndex ? ' active' : ''}`;
    item.style.animationDelay = `${i * 0.04}s`;
    item.innerHTML = `
      <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="track-info">
        <div class="track-title">${song.title}</div>
        <div class="track-artist">${song.artist}</div>
      </div>
      <span class="playing-indicator"></span>
      <span class="track-duration">${song.duration ? formatTime(song.duration) : '--:--'}</span>
    `;
    item.addEventListener('click', () => {
      if (currentIndex !== i) {
        currentIndex = i;
        const s = songs[currentIndex];
        loadSong(currentIndex);
        showToast(s.title, s.artist);
        if (isPlaying) playSong();
      }
    });
    playlistEl.appendChild(item);
  });
}

function getSynthData() {
  const arr = new Uint8Array(64);
  const now = Date.now() / 1000;
  for (let i = 0; i < 64; i++) {
    const freq = (i + 1) * 0.5;
    const val = Math.abs(Math.sin(now * freq + i * 0.3)) * 0.4
              + Math.abs(Math.sin(now * freq * 1.7 + i * 0.7)) * 0.3
              + Math.random() * 0.15;
    arr[i] = Math.min(255, Math.floor(val * 255));
  }
  return arr;
}

function startVisualizer() {
  stopVisualizer();
  const barCount = 64;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  function draw() {
    animationId = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const data = getSynthData();
    const w = canvas.width;
    const h = canvas.height;
    const barWidth = w / barCount;

    for (let i = 0; i < barCount; i++) {
      const val = data[i] / 255;
      const barH = Math.max(1, val * h);
      const x = i * barWidth;
      const y = h - barH;

      ctx.fillStyle = `hsl(${270 + i * 1.5}, 80%, ${50 + val * 30}%)`;
      ctx.fillRect(x + 1, y, barWidth - 2, barH);
    }
  }

  draw();
}

function stopVisualizer() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

audio.addEventListener('loadedmetadata', () => {
  songs[currentIndex].duration = audio.duration;
  totalDurationEl.textContent = formatTime(audio.duration);
  updatePlaylistActive();
});

audio.addEventListener('timeupdate', updateProgress);

audio.addEventListener('ended', () => {
  if (repeatMode === 1) {
    audio.currentTime = 0;
    playSong();
    return;
  }
  if (repeatMode === 2 || currentIndex < songs.length - 1) {
    nextSong();
    return;
  }
  isPlaying = false;
  playBtn.textContent = '▶';
  albumArt.classList.remove('rotating');
  artFrame.classList.remove('playing');
  visualizer.classList.remove('active');
  stopVisualizer();
});

audio.addEventListener('waiting', () => {
  playBtn.textContent = '⏳';
});

audio.addEventListener('canplay', () => {
  if (isPlaying) playBtn.textContent = '⏸';
});

playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);

progressBar.addEventListener('mousedown', (e) => {
  isDraggingProgress = true;
  setProgress(e);
});

document.addEventListener('mousemove', (e) => {
  if (isDraggingProgress) setProgress(e);
  if (isDraggingVolume) setVolume(e);
});

document.addEventListener('mouseup', () => {
  isDraggingProgress = false;
  isDraggingVolume = false;
});

volumeBar.addEventListener('mousedown', (e) => {
  isDraggingVolume = true;
  setVolume(e);
});

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  switch (e.code) {
    case 'Space': e.preventDefault(); togglePlay(); break;
    case 'ArrowLeft': e.preventDefault(); prevSong(); break;
    case 'ArrowRight': e.preventDefault(); nextSong(); break;
    case 'ArrowUp': e.preventDefault(); audio.volume = Math.min(1, audio.volume + 0.1); setVolume({ clientX: volumeBar.getBoundingClientRect().left + audio.volume * volumeBar.offsetWidth }); break;
    case 'ArrowDown': e.preventDefault(); audio.volume = Math.max(0, audio.volume - 0.1); setVolume({ clientX: volumeBar.getBoundingClientRect().left + audio.volume * volumeBar.offsetWidth }); break;
    case 'KeyS': toggleShuffle(); break;
    case 'KeyR': toggleRepeat(); break;
  }
});

buildPlaylist();
loadSong(0);
audio.volume = 0.7;
setVolume({ clientX: volumeBar.getBoundingClientRect().left + 0.7 * volumeBar.offsetWidth });
