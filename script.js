// Shared helpers and global state
const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const compliments = [
  { title: "You make people smile", text: "Not loudly, not for attention, just naturally. That is special." },
  { title: "You're an amazing friend", text: "The kind of friend people remember in the quiet moments too." },
  { title: "You make ordinary days better", text: "Some people enter a room and the whole day feels softer." },
  { title: "Your heart is rare", text: "Kind, thoughtful, and impossible to replace." },
  { title: "You are quietly brilliant", text: "Your glow does not need permission. It is already there." },
  { title: "You are worth celebrating", text: "Not only on 17 August. Every day before it too." },
  { title: "You bring calm to chaos", text: "That is a gift most people do not even know they need." },
  { title: "You are someone's favorite notification", text: "Probably more than one person's, honestly." },
  { title: "You make friendship feel easy", text: "Safe, funny, warm, and real." },
  { title: "You deserve a whole universe", text: "So Bhaswar made a small one to begin with." },
  { title: "Portugal fan energy suits you", text: "Loyal, bright, passionate, and impossible to ignore." }
];

const memories = [
  "Memory placeholder: the day we laughed about something tiny for way too long.",
  "Memory placeholder: a conversation that made a normal day feel important.",
  "Memory placeholder: the moment Sara made everyone around her smile.",
  "Memory placeholder: a simple plan that became a favorite little story.",
  "Memory placeholder: one of those little moments only good friends understand."
];

// Typewriter effect used in the intro and hero sections.
function typeText(element, lines, speed = 55, pause = 900) {
  let lineIndex = 0;
  let charIndex = 0;

  return new Promise((resolve) => {
    function tick() {
      const currentLine = lines[lineIndex];
      element.textContent = currentLine.slice(0, charIndex);
      charIndex += 1;

      if (charIndex <= currentLine.length) {
        setTimeout(tick, speed);
        return;
      }

      lineIndex += 1;
      charIndex = 0;

      if (lineIndex < lines.length) {
        setTimeout(tick, pause);
      } else {
        resolve();
      }
    }

    tick();
  });
}

// Generate decorative stars and floating particles.
function createStars(container, count, interactive = false) {
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement(interactive ? "button" : "span");
    star.className = interactive ? "constellation-star" : "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 4}s`;

    if (!interactive) {
      const size = Math.random() * 2.6 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
    } else {
      star.type = "button";
      star.setAttribute("aria-label", "Open a star message");
      star.dataset.index = String(i);
    }

    container.appendChild(star);
  }
}

function createParticles() {
  const layer = qs("#particleLayer");
  for (let i = 0; i < 42; i += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${12 + Math.random() * 16}s`;
    particle.style.animationDelay = `${Math.random() * -16}s`;
    layer.appendChild(particle);
  }
}

// Opening animation sequence.
async function runIntro() {
  createStars(qs(".intro-stars"), 90);
  await typeText(qs("#introLine"), ["Hey Sara...", "Something special is coming..."], 58, 900);
  setTimeout(() => qs("#introScreen").classList.add("hidden"), 550);
}

// Countdown timer to 17 August of the current year.
function updateCountdown() {
  const now = new Date();
  let target = new Date(now.getFullYear(), 7, 17, 0, 0, 0);
  if (target < now) target = new Date(now.getFullYear() + 1, 7, 17, 0, 0, 0);

  const diff = Math.max(0, target - now);
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  qs("#days").textContent = String(days).padStart(2, "0");
  qs("#hours").textContent = String(hours).padStart(2, "0");
  qs("#minutes").textContent = String(minutes).padStart(2, "0");
  qs("#seconds").textContent = String(seconds).padStart(2, "0");
}

// Scroll reveal observer.
function setupReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.16 });

  qsa(".reveal").forEach((element) => observer.observe(element));
}

// Constellation modal cards.
function setupConstellation() {
  const field = qs("#constellationField");
  createStars(field, 32, true);

  const modal = qs("#memoryModal");
  const modalKicker = qs("#modalKicker");
  const modalTitle = qs("#modalTitle");
  const modalText = qs("#modalText");

  field.addEventListener("click", (event) => {
    const star = event.target.closest(".constellation-star");
    if (!star) return;

    const index = Number(star.dataset.index);
    const compliment = compliments[index % compliments.length];
    const memory = memories[index % memories.length];

    modalKicker.textContent = index % 2 === 0 ? "Star Compliment" : "Memory Placeholder";
    modalTitle.textContent = compliment.title;
    modalText.textContent = index % 2 === 0 ? compliment.text : memory;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  });

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  qs("#closeModal").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

// Mini game logic: collect falling stars until score reaches 20.
function setupGame() {
  const board = qs("#gameBoard");
  const player = qs("#player");
  const scoreEl = qs("#score");
  const message = qs("#gameMessage");
  const startButton = qs("#startGame");
  let score = 0;
  let playerX = 50;
  let running = false;
  let spawnTimer = null;
  const keys = new Set();

  function setPlayer(percent) {
    playerX = Math.max(8, Math.min(92, percent));
    player.style.left = `${playerX}%`;
  }

  function movePlayer(direction) {
    setPlayer(playerX + direction * 7);
  }

  function spawnFallingStar() {
    if (!running) return;

    const star = document.createElement("span");
    star.className = "falling-star";
    star.textContent = Math.random() > 0.78 ? "\u{1F381}" : "\u2726";
    star.style.left = `${Math.random() * 88 + 4}%`;
    star.style.top = "-30px";
    board.appendChild(star);

    let y = -30;
    const speed = 2.2 + Math.random() * 2.2;

    function fall() {
      if (!running || !star.isConnected) return;
      y += speed;
      star.style.top = `${y}px`;

      const starRect = star.getBoundingClientRect();
      const playerRect = player.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      const caught =
        starRect.bottom >= playerRect.top &&
        starRect.left <= playerRect.right &&
        starRect.right >= playerRect.left;

      if (caught) {
        star.remove();
        score += 1;
        scoreEl.textContent = score;

        if (score >= 20) completeGame();
        return;
      }

      if (starRect.top > boardRect.bottom) {
        star.remove();
        return;
      }

      requestAnimationFrame(fall);
    }

    requestAnimationFrame(fall);
  }

  function completeGame() {
    running = false;
    clearInterval(spawnTimer);
    message.textContent = "You're amazing, Sara! A bigger surprise is waiting on your birthday \u{1F381}";
    message.classList.add("complete");
    startButton.textContent = "Replay";
    qsa(".falling-star", board).forEach((star) => star.remove());
    launchConfetti();
  }

  function startGame() {
    running = true;
    score = 0;
    scoreEl.textContent = "0";
    message.textContent = "Catch 20 stars to unlock a brighter message.";
    message.classList.remove("complete");
    startButton.textContent = "Restart";
    qsa(".falling-star", board).forEach((star) => star.remove());
    clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnFallingStar, 650);
    board.focus();
  }

  startButton.addEventListener("click", startGame);

  document.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(event.key)) {
      keys.add(event.key.toLowerCase());
    }
  });

  document.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

  function keyLoop() {
    if (keys.has("arrowleft") || keys.has("a")) movePlayer(-1);
    if (keys.has("arrowright") || keys.has("d")) movePlayer(1);
    requestAnimationFrame(keyLoop);
  }
  keyLoop();

  board.addEventListener("pointermove", (event) => {
    const rect = board.getBoundingClientRect();
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    setPlayer(percent);
  });

  qs("#leftBtn").addEventListener("click", () => movePlayer(-1));
  qs("#rightBtn").addEventListener("click", () => movePlayer(1));
}

// Secret gift behavior.
function setupGift() {
  const gift = qs("#giftBox");
  const letter = qs("#letter");

  gift.addEventListener("click", () => {
    gift.classList.remove("shake");
    void gift.offsetWidth;
    gift.classList.add("shake");
    letter.classList.add("open");
    launchConfetti();
  });
}

// Lightweight canvas confetti animation.
function launchConfetti() {
  const canvas = qs("#confettiCanvas");
  const ctx = canvas.getContext("2d");
  const colors = ["#62f7ff", "#b66cff", "#ff74d4", "#ffffff", "#6f8dff"];
  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * 0.25,
    size: 5 + Math.random() * 7,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: 2 + Math.random() * 4,
    drift: -2 + Math.random() * 4,
    spin: Math.random() * Math.PI
  }));
  let frames = 0;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((piece) => {
      piece.y += piece.speed;
      piece.x += piece.drift;
      piece.spin += 0.08;
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.spin);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
      ctx.restore();
    });

    frames += 1;
    if (frames < 190) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  draw();
}

// Browser-generated background songs: original soft loops for each selectable mood.
function createSaraTheme(mode = "perfect") {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  const audio = new AudioContext();
  const master = audio.createGain();
  const delay = audio.createDelay();
  const feedback = audio.createGain();
  const filter = audio.createBiquadFilter();

  const presets = {
    perfect: {
      volume: 0.045,
      delay: 0.34,
      feedback: 0.32,
      interval: 520,
      notes: [523.25, 659.25, 783.99, 987.77, 880, 783.99, 659.25, 587.33],
      bass: [261.63, 329.63, 392, 329.63],
      wave: "sine",
      padWave: "triangle"
    },
    until: {
      volume: 0.05,
      delay: 0.42,
      feedback: 0.36,
      interval: 610,
      notes: [392, 493.88, 587.33, 659.25, 587.33, 493.88, 440, 493.88],
      bass: [196, 246.94, 293.66, 246.94],
      wave: "triangle",
      padWave: "sine"
    },
    golden: {
      volume: 0.052,
      delay: 0.29,
      feedback: 0.27,
      interval: 470,
      notes: [440, 554.37, 659.25, 739.99, 830.61, 739.99, 659.25, 554.37],
      bass: [220, 277.18, 329.63, 369.99],
      wave: "sine",
      padWave: "triangle"
    }
  };

  const preset = presets[mode] || presets.perfect;
  master.gain.value = preset.volume;
  delay.delayTime.value = preset.delay;
  feedback.gain.value = preset.feedback;
  filter.type = "lowpass";
  filter.frequency.value = 1800;

  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(filter);
  filter.connect(master);
  master.connect(audio.destination);

  let step = 0;
  let timer = null;

  function pluck(freq, time, length = 0.9, gainValue = 0.13) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = preset.wave;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(gainValue, time + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
    osc.connect(gain);
    gain.connect(master);
    gain.connect(delay);
    osc.start(time);
    osc.stop(time + length + 0.05);
  }

  function pad(freq, time) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = preset.padWave;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.045, time + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);
    osc.connect(gain);
    gain.connect(filter);
    osc.start(time);
    osc.stop(time + 1.9);
  }

  function playStep() {
    const now = audio.currentTime;
    pluck(preset.notes[step % preset.notes.length], now);
    if (step % 2 === 0) pluck(preset.notes[(step + 2) % preset.notes.length] / 2, now + 0.16, 1.1, 0.09);
    if (step % 4 === 0) pad(preset.bass[(step / 4) % preset.bass.length], now);
    step += 1;
  }

  return {
    async start() {
      if (audio.state === "suspended") await audio.resume();
      if (timer) return;
      playStep();
      timer = setInterval(playStep, preset.interval);
    },
    stop() {
      clearInterval(timer);
      timer = null;
    }
  };
}

function setupMusicToggle() {
  const button = qs("#musicToggle");
  const label = button.querySelector("span:last-child");
  const externalAudio = qs("#externalAudio");
  const tracks = {
    perfect: {
      label: "Perfect",
      fallback: "Perfect Night",
      file: "perfect-ed-sheeran.mp3",
      start: 68,
      duration: 60
    },
    until: {
      label: "Until I Found You",
      fallback: "Until I Found You Mood",
      file: "until-i-found-you.mp3",
      start: 42,
      duration: 60
    },
    golden: {
      label: "Golden Hour",
      fallback: "Golden Hour Mood",
      file: "golden-hour.wav",
      start: 45,
      duration: 60
    }
  };
  const sequence = ["perfect", "until", "golden"];
  let currentIndex = 0;
  let currentMode = sequence[currentIndex];
  let theme = createSaraTheme(currentMode);
  let active = false;
  let usingExternal = false;
  let clipTimer = null;
  let countdownTimer = null;
  let fadeTimer = null;

  if (!theme && !externalAudio) {
    label.textContent = "Music Unavailable";
    button.disabled = true;
    return;
  }

  function currentTrack() {
    return tracks[currentMode] || tracks.perfect;
  }

  function stopAll() {
    clearTimeout(clipTimer);
    clearInterval(countdownTimer);
    clearInterval(fadeTimer);
    clipTimer = null;
    countdownTimer = null;
    fadeTimer = null;
    if (externalAudio) {
      externalAudio.pause();
      externalAudio.volume = 0.5;
      externalAudio.removeAttribute("src");
      externalAudio.load();
    }
    if (theme) theme.stop();
    usingExternal = false;
  }

  function setIdleLabel() {
    label.textContent = "Play Jukebox";
  }

  function startClipCountdown(track) {
    let remaining = track.duration;
    label.textContent = `${track.label} - ${remaining}s`;
    countdownTimer = setInterval(() => {
      remaining -= 1;
      label.textContent = `${track.label} - ${Math.max(0, remaining)}s`;
    }, 1000);

    clipTimer = setTimeout(() => {
      stopAll();
      if (!active) return;
      currentIndex += 1;
      if (currentIndex < sequence.length) {
        currentMode = sequence[currentIndex];
        playSelected();
      } else {
        active = false;
        currentIndex = 0;
        currentMode = sequence[currentIndex];
        button.classList.remove("active", "perfect-ready");
        button.setAttribute("aria-pressed", "false");
        label.textContent = "Jukebox Ended";
        setTimeout(setIdleLabel, 1400);
      }
    }, track.duration * 1000);
  }

  function fadeExternalAudio(direction, seconds = 3) {
    if (!externalAudio) return;
    clearInterval(fadeTimer);
    const steps = 30;
    const target = direction === "in" ? 0.5 : 0.04;
    const start = direction === "in" ? 0.04 : externalAudio.volume;
    let step = 0;
    externalAudio.volume = start;
    fadeTimer = setInterval(() => {
      step += 1;
      const progress = Math.min(1, step / steps);
      externalAudio.volume = start + (target - start) * progress;
      if (progress >= 1) clearInterval(fadeTimer);
    }, (seconds * 1000) / steps);
  }

  async function playSelected() {
    const track = currentTrack();
    stopAll();

    if (externalAudio) {
      try {
        externalAudio.volume = 0.5;
        externalAudio.src = track.file;
        await new Promise((resolve) => {
          if (externalAudio.readyState >= 1) {
            resolve();
            return;
          }
          externalAudio.addEventListener("loadedmetadata", resolve, { once: true });
          externalAudio.load();
        });
        externalAudio.currentTime = Math.min(track.start, Math.max(0, externalAudio.duration - track.duration - 1));
        await externalAudio.play();
        usingExternal = true;
        button.classList.add("perfect-ready");
        fadeExternalAudio("in", 2.5);
        setTimeout(() => {
          if (active && usingExternal) fadeExternalAudio("out", 4);
        }, Math.max(0, (track.duration - 4) * 1000));
        startClipCountdown(track);
        return;
      } catch (error) {
        usingExternal = false;
        button.classList.remove("perfect-ready");
      }
    }

    theme = createSaraTheme(currentMode);
    if (theme) {
      await theme.start();
      startClipCountdown(track);
    } else {
      active = false;
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
      label.textContent = "Music Unavailable";
    }
  }

  button.addEventListener("click", async () => {
    active = !active;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));

    if (active) {
      currentIndex = 0;
      currentMode = sequence[currentIndex];
      await playSelected();
    } else {
      stopAll();
      currentIndex = 0;
      currentMode = sequence[currentIndex];
      button.classList.remove("perfect-ready");
      setIdleLabel();
    }
  });

  setIdleLabel();
}

// Custom cursor glow.
function setupCursor() {
  const glow = qs(".cursor-glow");
  document.addEventListener("pointermove", (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
}

// Review wall: rating selection, local saving, and rendering.
function setupReviews() {
  const form = qs("#reviewForm");
  const picker = qs("#ratingPicker");
  const wall = qs("#reviewWall");
  const status = qs("#reviewStatus");
  const nameInput = qs("#reviewName");
  const textInput = qs("#reviewText");
  const storageKey = "saraUniverseReviews";
  let selectedRating = 5;

  if (!form || !picker || !wall) return;

  function updateStars(rating) {
    selectedRating = rating;
    qsa("button", picker).forEach((button) => {
      const value = Number(button.dataset.rating);
      button.classList.toggle("active", value <= selectedRating);
      button.setAttribute("aria-pressed", String(value <= selectedRating));
    });
  }

  function makeReviewCard(review) {
    const article = document.createElement("article");
    article.className = "review-card glass-panel";

    const stars = document.createElement("div");
    stars.className = "review-stars";
    stars.textContent = "\u2605".repeat(review.rating);

    const text = document.createElement("p");
    text.textContent = `"${review.text}"`;

    const author = document.createElement("strong");
    author.textContent = `- ${review.name}`;

    article.append(stars, text, author);
    return article;
  }

  function getSavedReviews() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveReviews(reviews) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(reviews.slice(0, 6)));
    } catch (error) {
      status.textContent = "Saved on screen for now.";
    }
  }

  function renderSavedReviews() {
    getSavedReviews().forEach((review) => {
      wall.prepend(makeReviewCard(review));
    });
  }

  picker.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-rating]");
    if (!button) return;
    updateStars(Number(button.dataset.rating));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const review = {
      name: nameInput.value.trim() || "Sara",
      rating: selectedRating,
      text: textInput.value.trim() || "This universe feels magical."
    };
    const reviews = [review, ...getSavedReviews()];
    saveReviews(reviews);
    wall.prepend(makeReviewCard(review));
    textInput.value = "";
    status.textContent = "Review added to the stars.";
    launchConfetti();
  });

  updateStars(selectedRating);
  renderSavedReviews();
}

// Layout optimizer for Auto, Mobile, and PC viewing.
function setupDeviceMode() {
  const control = qs("#deviceMode");
  const storageKey = "saraUniverseDeviceMode";
  if (!control) return;

  function applyMode(mode) {
    document.body.classList.toggle("device-mobile", mode === "mobile");
    document.body.classList.toggle("device-desktop", mode === "desktop");
    qsa("button", control).forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    try {
      localStorage.setItem(storageKey, mode);
    } catch (error) {
      // The mode still applies for the current visit.
    }
  }

  control.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mode]");
    if (!button) return;
    applyMode(button.dataset.mode);
  });

  let savedMode = "auto";
  try {
    savedMode = localStorage.getItem(storageKey) || "auto";
  } catch (error) {
    savedMode = "auto";
  }
  applyMode(savedMode);
}

// Boot the single-page experience.
document.addEventListener("DOMContentLoaded", () => {
  createStars(qs(".star-layer"), 180);
  createStars(qs("#heroStars"), 110);
  createParticles();
  setupReveals();
  setupConstellation();
  setupGame();
  setupGift();
  setupMusicToggle();
  setupReviews();
  setupDeviceMode();
  setupCursor();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  runIntro();
  typeText(qs("#heroTypewriter"), ["Hey Sara...", "Something special is being built for you."], 52, 850);
});
