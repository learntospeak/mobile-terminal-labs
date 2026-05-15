const stage = document.getElementById("stage");
const student = document.getElementById("student");
const speechText = document.getElementById("speechText");
const sceneStatus = document.getElementById("sceneStatus");
const replayBtn = document.getElementById("replayBtn");
const soundBtn = document.getElementById("soundBtn");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");

let audioContext = null;
let masterGain = null;
let ambienceGain = null;
let rackGain = null;
let ambienceNodes = [];
let soundEnabled = false;
let stepLoop = null;
let coffeeTimer = null;
let currentStep = 0;
let nextStepTimer = null;
let isPaused = false;

async function ensureAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.34;
    masterGain.connect(audioContext.destination);
    ambienceGain = audioContext.createGain();
    rackGain = audioContext.createGain();
    ambienceGain.gain.value = 0;
    rackGain.gain.value = 0;
    ambienceGain.connect(masterGain);
    rackGain.connect(masterGain);
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  return audioContext.state === "running";
}

function createNoiseBuffer(seconds = 1.5) {
  const length = Math.max(1, Math.floor(audioContext.sampleRate * seconds));
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function startSoundscape() {
  if (!soundEnabled || !audioContext || ambienceNodes.length) return;

  const now = audioContext.currentTime;
  const hum = audioContext.createOscillator();
  const subHum = audioContext.createOscillator();
  const noise = audioContext.createBufferSource();
  const fanFilter = audioContext.createBiquadFilter();
  const fanGain = audioContext.createGain();
  const rackPulse = audioContext.createOscillator();

  hum.type = "sine";
  hum.frequency.value = 58;
  subHum.type = "triangle";
  subHum.frequency.value = 116;
  noise.buffer = createNoiseBuffer(2);
  noise.loop = true;
  fanFilter.type = "bandpass";
  fanFilter.frequency.value = 860;
  fanFilter.Q.value = 0.7;
  fanGain.gain.value = 0.038;
  rackPulse.type = "sine";
  rackPulse.frequency.value = 3.2;

  hum.connect(ambienceGain);
  subHum.connect(ambienceGain);
  noise.connect(fanFilter);
  fanFilter.connect(fanGain);
  fanGain.connect(rackGain);
  rackPulse.connect(rackGain);

  hum.start(now);
  subHum.start(now);
  noise.start(now);
  rackPulse.start(now);

  ambienceGain.gain.setTargetAtTime(0.042, now, 0.8);
  rackGain.gain.setTargetAtTime(0.018, now, 0.8);
  ambienceNodes = [hum, subHum, noise, rackPulse];
  scheduleCoffeeEasterEgg();
}

function stopSoundscape() {
  if (!audioContext) return;

  const now = audioContext.currentTime;
  ambienceGain?.gain.setTargetAtTime(0.0001, now, 0.18);
  rackGain?.gain.setTargetAtTime(0.0001, now, 0.18);
  window.clearTimeout(coffeeTimer);
  coffeeTimer = null;

  ambienceNodes.forEach((node) => {
    try {
      node.stop(now + 0.35);
    } catch {
      // Already stopped.
    }
  });
  ambienceNodes = [];
}

function setSoundscapeIntensity(level = "office") {
  if (!soundEnabled || !audioContext || !ambienceGain || !rackGain) return;

  const now = audioContext.currentTime;
  const settings = {
    office: [0.042, 0.018],
    rack: [0.052, 0.03],
    terminal: [0.06, 0.04],
    crt: [0.025, 0.012]
  }[level] || [0.042, 0.018];

  ambienceGain.gain.setTargetAtTime(settings[0], now, 0.45);
  rackGain.gain.setTargetAtTime(settings[1], now, 0.45);
}

async function tone(frequency, duration = 0.08, type = "square", volume = 0.05, when = 0) {
  if (!soundEnabled) return;
  const audioReady = await ensureAudio();
  if (!audioReady || !masterGain) return;

  const now = audioContext.currentTime + when;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

async function noiseBurst(duration = 0.08, volume = 0.05, filterFrequency = 900, when = 0) {
  if (!soundEnabled) return;
  const audioReady = await ensureAudio();
  if (!audioReady || !masterGain) return;

  const now = audioContext.currentTime + when;
  const noise = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  noise.buffer = createNoiseBuffer(duration + 0.05);
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(filterFrequency, now);
  filter.Q.value = 1.2;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  noise.start(now);
  noise.stop(now + duration + 0.04);
}

function playCue(name) {
  if (name === "ticket") {
    tone(659, 0.12, "triangle", 0.13);
    tone(988, 0.14, "square", 0.1, 0.12);
    tone(1318, 0.1, "square", 0.08, 0.28);
    noiseBurst(0.06, 0.028, 1800, 0.08);
  } else if (name === "talk") {
    [0, 0.08, 0.17, 0.28, 0.4, 0.54].forEach((offset, index) => {
      tone(360 + (index % 3) * 70, 0.035, "square", 0.04, offset);
    });
  } else if (name === "terminal") {
    tone(220, 0.08, "triangle", 0.08);
    tone(440, 0.06, "square", 0.045, 0.1);
    noiseBurst(0.12, 0.025, 1200, 0.03);
  } else if (name === "crt") {
    setSoundscapeIntensity("crt");
    tone(96, 0.55, "sawtooth", 0.1);
    tone(52, 0.42, "triangle", 0.08, 0.2);
    tone(980, 0.12, "square", 0.08, 0.52);
    noiseBurst(0.42, 0.06, 2600, 0.16);
  } else if (name === "enabled") {
    tone(520, 0.08, "square", 0.12);
    tone(780, 0.08, "square", 0.1, 0.1);
    tone(1040, 0.12, "square", 0.09, 0.2);
  } else if (name === "button") {
    tone(620, 0.035, "square", 0.045);
    tone(840, 0.035, "square", 0.035, 0.04);
  } else if (name === "coffee") {
    tone(310, 0.08, "triangle", 0.045);
    noiseBurst(0.18, 0.025, 700, 0.05);
    tone(520, 0.04, "square", 0.025, 0.26);
  } else {
    const stepPitch = 92 + Math.random() * 32;
    tone(stepPitch, 0.045, "triangle", 0.08);
    noiseBurst(0.035, 0.035, 320);
  }
}

function scheduleCoffeeEasterEgg() {
  window.clearTimeout(coffeeTimer);
  if (!soundEnabled) return;

  coffeeTimer = window.setTimeout(() => {
    if (soundEnabled && !isPaused) {
      playCue("coffee");
    }
    scheduleCoffeeEasterEgg();
  }, 9000 + Math.random() * 8000);
}

function startFootsteps() {
  stopFootsteps();
  if (!soundEnabled) return;
  playCue("step");
  stepLoop = window.setInterval(() => {
    if (soundEnabled) {
      playCue("step");
    } else {
      stopFootsteps();
    }
  }, 520);
}

function stopFootsteps() {
  if (stepLoop) {
    window.clearInterval(stepLoop);
    stepLoop = null;
  }
}

function getCurrentSoundscapeLevel() {
  if (student.classList.contains("at-terminal")) return "terminal";
  if (student.classList.contains("at-manager") || student.classList.contains("at-workstation")) return "rack";
  return "office";
}

const steps = [
  {
    delay: 650,
    run() {
      sceneStatus.textContent = "Student entering cyber operations office...";
      student.className = "pixel-person student is-walking";
      setSoundscapeIntensity("office");
      startFootsteps();
    }
  },
  {
    delay: 700,
    run() {
      student.classList.add("at-manager");
    }
  },
  {
    delay: 2900,
    run() {
      student.classList.remove("is-walking");
      stopFootsteps();
      stage.classList.add("show-speech");
      sceneStatus.textContent = "Manager briefing the student...";
      playCue("talk");
    }
  },
  {
    delay: 1900,
    run() {
      stage.classList.add("show-ticket");
      speechText.textContent = "New ticket: DNS resolution is failing for the internal app.";
      sceneStatus.textContent = "Support ticket received.";
      setSoundscapeIntensity("rack");
      playCue("ticket");
    }
  },
  {
    delay: 3600,
    run() {
      speechText.textContent = "Understood. I will check the network config and terminal output.";
      sceneStatus.textContent = "Student confirms the parameters.";
      playCue("talk");
    }
  },
  {
    delay: 2800,
    run() {
      stage.classList.remove("show-speech", "show-ticket");
      student.classList.remove("at-manager");
      student.classList.add("is-walking", "at-workstation");
      sceneStatus.textContent = "Student walking to the workstation...";
      setSoundscapeIntensity("rack");
      startFootsteps();
    }
  },
  {
    delay: 3100,
    run() {
      student.classList.remove("is-walking");
      stopFootsteps();
      student.classList.add("at-terminal");
      sceneStatus.textContent = "Student faces the workstation and opens the terminal.";
      setSoundscapeIntensity("terminal");
      playCue("terminal");
    }
  },
  {
    delay: 1400,
    run() {
      stage.classList.add("is-zooming");
      sceneStatus.textContent = "Zooming into the CRT monitor...";
      playCue("crt");
    }
  },
  {
    delay: 1700,
    run() {
      stage.classList.add("show-crt");
      sceneStatus.textContent = "Prototype terminal transition. Not connected to the real lab yet.";
    }
  }
];

function clearNextStepTimer() {
  if (nextStepTimer) {
    window.clearTimeout(nextStepTimer);
    nextStepTimer = null;
  }
}

function clearTimers() {
  clearNextStepTimer();
  stopFootsteps();
}

function resetScene() {
  clearTimers();
  stage.className = "stage";
  student.className = "pixel-person student is-walking";
  speechText.textContent = "New ticket just came in. Can you investigate?";
  sceneStatus.textContent = "Student entering cyber operations office...";
  currentStep = 0;
  isPaused = false;
  if (soundEnabled) {
    setSoundscapeIntensity("office");
  }
}

function runCurrentStep() {
  if (isPaused || currentStep >= steps.length) return;

  steps[currentStep].run();
  currentStep += 1;
  scheduleNextStep();
}

function scheduleNextStep() {
  if (isPaused || currentStep >= steps.length) return;

  clearNextStepTimer();
  nextStepTimer = window.setTimeout(runCurrentStep, steps[currentStep].delay);
}

function playScene() {
  playCue("button");
  resetScene();
  scheduleNextStep();
}

function pauseScene() {
  if (isPaused) return;
  playCue("button");
  isPaused = true;
  clearTimers();
  stage.classList.add("is-paused");
  if (soundEnabled && audioContext) {
    ambienceGain?.gain.setTargetAtTime(0.018, audioContext.currentTime, 0.25);
    rackGain?.gain.setTargetAtTime(0.006, audioContext.currentTime, 0.25);
  }
  sceneStatus.textContent = `${sceneStatus.textContent} Paused.`;
}

function resumeScene() {
  if (!isPaused) return;
  playCue("button");
  isPaused = false;
  stage.classList.remove("is-paused");
  if (soundEnabled) {
    startSoundscape();
    setSoundscapeIntensity(getCurrentSoundscapeLevel());
    scheduleCoffeeEasterEgg();
  }

  if (soundEnabled && student.classList.contains("is-walking")) {
    startFootsteps();
  }

  sceneStatus.textContent = sceneStatus.textContent.replace(/\s*Paused\.$/, "");
  scheduleNextStep();
}

soundBtn.addEventListener("click", async () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? "Sound Enabled" : "Enable Sound";
  soundBtn.setAttribute("aria-pressed", String(soundEnabled));

  if (soundEnabled) {
    await ensureAudio();
    startSoundscape();
    playCue("enabled");
    playScene();
  } else {
    stopFootsteps();
    stopSoundscape();
    if (audioContext?.state === "running") {
      await audioContext.suspend();
    }
  }
});

replayBtn.addEventListener("click", async () => {
  if (soundEnabled) await ensureAudio();
  if (soundEnabled) startSoundscape();
  playScene();
});

pauseBtn.addEventListener("click", pauseScene);
playBtn.addEventListener("click", resumeScene);

playScene();
