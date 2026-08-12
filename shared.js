// Shared behavior used across every TacTix page: home button, music toggle,
// and small localStorage-backed stat helpers for scoreboards/high scores.

function initHomeButton(homeBtnId = "home-btn", target = "index.html") {
  const btn = document.getElementById(homeBtnId);
  if (!btn) return;
  btn.addEventListener("click", () => {
    window.location.href = target;
  });
}

// Autoplay-safe music toggle: browsers block audio.play() before a user
// gesture, so playback is (re)attempted on the first click/keypress anywhere
// on the page, then the button just pauses/resumes from there on.
function initMusicToggle(musicBtnId = "music-btn", audioId = "bg-music") {
  const btn = document.getElementById(musicBtnId);
  const audio = document.getElementById(audioId);
  if (!btn || !audio) return;

  let playing = false;

  const setIcon = () => {
    const icon = btn.querySelector("i");
    if (icon) icon.className = playing ? "fas fa-music" : "fas fa-volume-mute";
  };

  const tryPlay = () => {
    audio.muted = false;
    audio.play()
      .then(() => { playing = true; setIcon(); })
      .catch(() => { playing = false; setIcon(); });
  };

  const startOnFirstGesture = () => tryPlay();
  window.addEventListener("pointerdown", startOnFirstGesture, { once: true });
  window.addEventListener("keydown", startOnFirstGesture, { once: true });

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (playing) {
      audio.pause();
      playing = false;
      setIcon();
    } else {
      tryPlay();
    }
  });
}

function loadStats(key, initial) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...initial, ...JSON.parse(raw) } : { ...initial };
  } catch {
    return { ...initial };
  }
}

function saveStats(key, stats) {
  try {
    localStorage.setItem(key, JSON.stringify(stats));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) - stats just won't persist
  }
}
