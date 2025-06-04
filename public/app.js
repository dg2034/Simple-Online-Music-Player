document.addEventListener('DOMContentLoaded', () => {
  const DEFAULT_COVER = '/images/default-cover.png';

  const audio             = document.getElementById('audio');
  const playBtn           = document.querySelector('.play-btn');
  const prevBtn           = document.querySelector('.prev-btn');
  const nextBtn           = document.querySelector('.next-btn');
  const progressContainer = document.getElementById('progress-container');
  const progressBar       = document.getElementById('progress-bar');
  const currentTimeEl     = document.getElementById('current-time');
  const durationEl        = document.getElementById('duration');
  const songTitle         = document.querySelector('.song-title');
  const songArtist        = document.querySelector('.song-artist');
  const albumArt          = document.querySelector('.album-art');
  const playlistContainer = document.getElementById('playlist');
  const playIcon          = document.querySelector('.play-icon');
  const pauseIcon = document.querySelector('.pause-icon');
  const volumeSlider = document.getElementById('volume-slider');

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
  
// Progressive fill effect
function updateVolumeSliderStyle() {
  const value = volumeSlider.value * 100;
  volumeSlider.style.background = `linear-gradient(to right, #1db954 ${value}%, #555 ${value}%)`;
}

volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
  updateVolumeSliderStyle();
});

updateVolumeSliderStyle(); // Initialize on page load

let songs = [];
let currentSongIndex = 0;
let isPlaying = false;
let visibleCount = 0;
const increment = 3;

async function fetchSongs() {
  try {
    const res = await fetch('/api/songs');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching songs:', err);
    return [];
  }
}

const parseMetadata = async (song) => {
  const { jsmediatags } = window;

  return new Promise(async (resolve) => {
    const fallback = () => {
      const fileName = decodeURIComponent(song.url.split('/').pop());
      const [artist, title] = fileName.replace('.mp3', '').split(' - ');

      song.title = title || fileName;
      song.artist = artist || 'Unknown Artist';
      song.picture = '/images/default-cover.png';
      setDurationAndResolve();
    };

    const setDurationAndResolve = () => {
      const tempAudio = new Audio();
      tempAudio.src = song.url;
      tempAudio.addEventListener('loadedmetadata', () => {
        song.duration = formatDuration(tempAudio.duration);
        resolve(song);
      });
    };

    try {
      const response = await fetch(song.url);
      const blob = await response.blob();

      jsmediatags.read(blob, {
        onSuccess: (tag) => {
          const tags = tag.tags;
          let pictureUrl = null;

          if (tags.picture) {
            const { data, format } = tags.picture;
            const byteArray = new Uint8Array(data);
            const picBlob = new Blob([byteArray], { type: format });
            pictureUrl = URL.createObjectURL(picBlob);
          }

          const fileName = decodeURIComponent(song.url.split('/').pop());
          const [artist, title] = fileName.replace('.mp3', '').split(' - ');

          song.title = title || fileName;
          song.artist = artist || 'Unknown Artist';
          song.picture = pictureUrl || '/images/default-cover.png';

          setDurationAndResolve();
        },
        onError: fallback,
      });
    } catch (error) {
      fallback();
    }
  });
};

  
  async function init() {
    const rawSongs = await fetchSongs();
    songs = await Promise.all(rawSongs.map(parseMetadata));

    if (!songs.length) {
      alert('No songs found!');
      return;
    }

    buildPlaylist();
    loadSong(currentSongIndex);
  }

  function buildPlaylist() {
    playlistContainer.innerHTML = '';
    visibleCount = 0; // reset when rebuilding playlist
  
    const seeMoreBtn = document.createElement('button');
    seeMoreBtn.textContent = 'See More';
    seeMoreBtn.className = 'btn btn-outline-light mt-3 d-block mx-auto';
    seeMoreBtn.style.marginBottom = '100px';
    seeMoreBtn.style.display = 'none';
  
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'see-more-wrapper';
    buttonWrapper.appendChild(seeMoreBtn);
  
    // Prevent duplicate buttonWrapper on rebuild
    if (!document.querySelector('.see-more-wrapper')) {
      playlistContainer.parentElement.appendChild(buttonWrapper);
    }
  
    function renderSongs() {
      const nextSongs = songs.slice(visibleCount, visibleCount + increment);
  
      nextSongs.forEach((s, i) => {
        const item = document.createElement('div');
        item.className = 'playlist-item' + ((visibleCount + i) === currentSongIndex ? ' active' : '');
        item.innerHTML = `
          <div class="song-details">
            <img src="${s.picture}" class="playlist-thumb" />
            <div>
              <div>${s.title}</div>
              <small>${s.artist}</small>
            </div>
          </div>
          <div class="song-duration">${s.duration || '0:00'}</div>
        `;
        item.addEventListener('click', () => {
          currentSongIndex = visibleCount + i;
          loadSong(currentSongIndex);
          if (isPlaying) playSong();
        });
        playlistContainer.appendChild(item);
      });
  
      visibleCount += increment;
  
      // ✅ FINAL button visibility check
      if (visibleCount >= songs.length) {
        seeMoreBtn.style.display = 'none';
      } else {
        seeMoreBtn.style.display = 'inline-block';
      }
    }
  
    seeMoreBtn.addEventListener('click', renderSongs);
  
    // 👇 Initial load
    renderSongs();
  }
    
  
  function loadSong(i) {
    const s = songs[i];
    songTitle.textContent = s.title;
    songArtist.textContent = s.artist;
    albumArt.src = s.picture;
    audio.src = s.url;
    updateActive();
  }

  function updateActive() {
    document.querySelectorAll('.playlist-item').forEach((el, i) => {
      el.classList.toggle('active', i === currentSongIndex);
    });
  }

  async function playSong() {
    isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'inline';
    try {
      await audio.play();
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }

  function pauseSong() {
    isPlaying = false;
    pauseIcon.style.display = 'none';
    playIcon.style.display = 'inline';
    audio.pause();
  }

  function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
  }

  function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
  }

  function updateProgress() {
    const { currentTime, duration } = audio;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    const mins = t => String(Math.floor(t / 60));
    const secs = t => String(Math.floor(t % 60)).padStart(2, '0');
    currentTimeEl.textContent = `${mins(currentTime)}:${secs(currentTime)}`;
    durationEl.textContent = isNaN(duration) ? '0:00' : `${mins(duration)}:${secs(duration)}`;
  }

  function setProgress(e) {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
  }

  playBtn.addEventListener('click', () => isPlaying ? pauseSong() : playSong());
  prevBtn.addEventListener('click', prevSong);
  nextBtn.addEventListener('click', nextSong);
  progressContainer.addEventListener('click', setProgress);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', nextSong);

  init();
});

document.addEventListener('DOMContentLoaded', () => {
  const artistCards = document.querySelectorAll('.artist-card');
  const playlistContainer = document.getElementById('playlist');

  // Fetch all songs once and reuse them
  let allSongs = [];

  fetch('/api/songs')
    .then(res => res.json())
    .then(data => {
      allSongs = data;
    });

    const featuredArtists = ["One Direction", "Maroon 5", "Avicii", "Chainsmokers", "Alan Walker"];

    artistCards.forEach(card => {
      card.addEventListener('click', () => {
        const artist = card.getAttribute('data-artist');
    
        let filtered;
        let displayTitle;
    
        if (artist === "Other Artists") {
          filtered = allSongs.filter(song => !featuredArtists.includes(song.artist));
          displayTitle = "Other Artists";
        } else {
          filtered = allSongs.filter(song => song.artist.toLowerCase() === artist.toLowerCase());
          displayTitle = artist;
        }
    
        displaySongs(filtered, displayTitle);
      });
    });    

  function displaySongs(songs, artistName) {
    playlistContainer.innerHTML = `<h3>${artistName} – Songs</h3>`;
    const seeMoreWrapper = document.querySelector('.see-more-wrapper');
    if (seeMoreWrapper) seeMoreWrapper.style.display = 'none';

    if (songs.length === 0) {
      playlistContainer.innerHTML += `<p>No songs found for this artist.</p>`;
      return;
    }

    songs.forEach(song => {
      const item = document.createElement('div');
      item.className = 'playlist-item';
      item.innerHTML = `
        <div class="song-details">
          <img src="/images/default-cover.png" alt="cover" class="playlist-thumb">
          <div>
            <div>${song.title}</div>
            <small>${song.artist}</small>
          </div>
        </div>
        <div>▶</div>
      `;
      item.addEventListener('click', () => {
        playSong(song);
      });
      playlistContainer.appendChild(item);
    });
  }

  function playSong(song) {
    const audio = document.getElementById('audio');
    const titleEl = document.querySelector('.song-title');
    const artistEl = document.querySelector('.song-artist');
    const coverEl = document.querySelector('.album-art');

    titleEl.textContent = song.title;
    artistEl.textContent = song.artist;
    coverEl.src = '/images/default-cover.png';
    audio.src = song.url;
    audio.play();

    document.querySelector('.play-icon').style.display = 'none';
    document.querySelector('.pause-icon').style.display = 'inline';
  }
});