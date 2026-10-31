/**
 * NOCTIS — Main Application Controller
 * Pure Vanilla JavaScript (No Frameworks, No Libraries)
 */

(function () {
  'use strict';

  // Ensure config is present
  const config = window.CONFIG || {
    frames: {
      hero: { count: 596, desktopPrefix: 'assets/frames/hero/frame_', mobilePrefix: 'assets/frames/hero-mobile/frame_', extension: '.webp', digits: 4 },
      dismantle: { count: 198, desktopPrefix: 'assets/frames/dismantle/frame_', mobilePrefix: 'assets/frames/dismantle-mobile/frame_', extension: '.webp', digits: 4 }
    },
    lineup: []
  };

  const isMobile = () => window.innerWidth <= 768;

  /* =========================================================
     1. CANVAS SCROLL-SCRUBBING ENGINE CLASS
     ========================================================= */
  class CanvasSequenceScrubber {
    constructor(options) {
      this.canvas = document.getElementById(options.canvasId);
      this.track = document.getElementById(options.trackId);
      this.frameCount = options.frameCount;
      this.desktopPrefix = options.desktopPrefix;
      this.mobilePrefix = options.mobilePrefix;
      this.extension = options.extension || '.webp';
      this.digits = options.digits || 4;
      this.progressBar = document.getElementById(options.progressBarId);
      this.frameHud = document.getElementById(options.frameHudId);
      this.percentHud = document.getElementById(options.percentHudId);
      this.speedCounter = document.getElementById(options.speedCounterId);
      this.beats = options.beats || [];

      this.ctx = this.canvas.getContext('2d', { alpha: false });
      this.images = new Array(this.frameCount);
      this.loadedFlags = new Uint8Array(this.frameCount);
      this.loadedCount = 0;

      this.targetFrame = 0;
      this.renderedFrame = 0;
      this.scrollProgress = 0;
      this.isTicking = false;

      this.init();
    }

    init() {
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });

      // Start preloading
      this.preloadFrames();

      // Scroll listener
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
      this.onScroll();

      // RAF Render Loop
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;

      if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
        this.canvas.width = Math.round(width * dpr);
        this.canvas.height = Math.round(height * dpr);
      }
      this.drawFrame(Math.round(this.renderedFrame));
    }

    getFrameUrl(index) {
      const prefix = isMobile() ? this.mobilePrefix : this.desktopPrefix;
      const numStr = String(index + 1).padStart(this.digits, '0');
      return `${prefix}${numStr}${this.extension}`;
    }

    preloadFrames() {
      const priorityCount = Math.min(25, this.frameCount);

      // Phase 1: Load the first 25 frames immediately
      for (let i = 0; i < priorityCount; i++) {
        this.loadSingleFrame(i);
      }

      // Phase 2: Load keyframes across the sequence (every 10th frame)
      for (let i = priorityCount; i < this.frameCount; i += 10) {
        this.loadSingleFrame(i);
      }

      // Phase 3: Progressively load remaining frames
      const loadRemaining = () => {
        let index = 0;
        const batchSize = 6;

        const nextBatch = () => {
          let loadedInBatch = 0;
          while (index < this.frameCount && loadedInBatch < batchSize) {
            if (!this.images[index]) {
              this.loadSingleFrame(index);
              loadedInBatch++;
            }
            index++;
          }
          if (index < this.frameCount) {
            if (window.requestIdleCallback) {
              window.requestIdleCallback(nextBatch, { timeout: 100 });
            } else {
              setTimeout(nextBatch, 20);
            }
          }
        };

        if (window.requestIdleCallback) {
          window.requestIdleCallback(nextBatch, { timeout: 200 });
        } else {
          setTimeout(nextBatch, 50);
        }
      };

      setTimeout(loadRemaining, 300);
    }

    loadSingleFrame(index) {
      if (this.images[index]) return;

      const img = new Image();
      img.src = this.getFrameUrl(index);
      img.onload = () => {
        this.images[index] = img;
        this.loadedFlags[index] = 1;
        this.loadedCount++;
        
        // If this is the current frame, render immediately
        if (Math.round(this.renderedFrame) === index) {
          this.drawFrame(index);
        }

        // Update global buffer indicator
        const total = (config.frames.hero.count + config.frames.dismantle.count);
        const percent = Math.min(100, Math.round((this.loadedCount / this.frameCount) * 100));
        const statusEl = document.getElementById('hudBufferStatus');
        if (statusEl && this.frameCount > 300) {
          statusEl.textContent = `STREAM: ${percent}% BUFFERED`;
          if (percent >= 100) statusEl.textContent = 'SYSTEMS STREAMING NOMINAL';
        }
      };
      this.images[index] = img;
    }

    onScroll() {
      const rect = this.track.getBoundingClientRect();
      const trackHeight = this.track.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollableDist = trackHeight - windowHeight;

      if (scrollableDist <= 0) return;

      // Calculate progress clamped [0, 1]
      const progress = Math.max(0, Math.min(1, -rect.top / scrollableDist));
      this.scrollProgress = progress;
      this.targetFrame = progress * (this.frameCount - 1);

      // Update story beats
      this.updateStoryBeats(progress);
    }

    updateStoryBeats(progress) {
      this.beats.forEach(beat => {
        const el = document.getElementById(beat.id);
        if (!el) return;

        const isActive = progress >= beat.start && progress <= beat.end;
        if (isActive) {
          el.classList.add('is-active');
        } else {
          el.classList.remove('is-active');
        }
      });

      // Update speed counter if configured
      if (this.speedCounter) {
        // Accelerate up to 240 km/h smoothly based on scroll
        const speed = Math.round(progress * 240);
        this.speedCounter.textContent = String(speed);
      }

      // Update telemetry
      if (this.progressBar) {
        this.progressBar.style.width = `${(progress * 100).toFixed(1)}%`;
      }
      if (this.percentHud) {
        this.percentHud.textContent = `${(progress * 100).toFixed(1)}% PROG`;
      }
      if (this.frameHud) {
        const frameNum = String(Math.round(this.renderedFrame) + 1).padStart(4, '0');
        const totalNum = String(this.frameCount).padStart(4, '0');
        this.frameHud.textContent = `FRAME ${frameNum} / ${totalNum}`;
      }
    }

    loop() {
      // Smooth lerp interpolation for silky motion
      const diff = this.targetFrame - this.renderedFrame;
      if (Math.abs(diff) > 0.005) {
        this.renderedFrame += diff * 0.18; // smooth easing factor
        this.drawFrame(Math.round(this.renderedFrame));
      }

      requestAnimationFrame(this.loop);
    }

    drawFrame(frameIndex) {
      const clampedIndex = Math.max(0, Math.min(this.frameCount - 1, frameIndex));
      let img = this.images[clampedIndex];

      // Fallback: If target frame is not yet fully loaded, find nearest loaded frame
      if (!img || !img.complete || img.naturalWidth === 0) {
        img = this.findNearestLoadedFrame(clampedIndex);
      }

      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cw = this.canvas.width;
      const ch = this.canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      // Cover-fit math
      const canvasRatio = cw / ch;
      const imgRatio = iw / ih;

      let sWidth, sHeight, sx, sy;

      if (canvasRatio > imgRatio) {
        sWidth = iw;
        sHeight = iw / canvasRatio;
        sx = 0;
        sy = (ih - sHeight) / 2;
      } else {
        sHeight = ih;
        sWidth = ih * canvasRatio;
        sy = 0;
        sx = (iw - sWidth) / 2;
      }

      this.ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, cw, ch);
    }

    findNearestLoadedFrame(targetIdx) {
      // Search outward from targetIdx
      for (let offset = 1; offset < 30; offset++) {
        const prev = targetIdx - offset;
        if (prev >= 0 && this.images[prev] && this.images[prev].complete && this.images[prev].naturalWidth > 0) {
          return this.images[prev];
        }
        const next = targetIdx + offset;
        if (next < this.frameCount && this.images[next] && this.images[next].complete && this.images[next].naturalWidth > 0) {
          return this.images[next];
        }
      }
      return null;
    }
  }

  /* =========================================================
     2. THE LINEUP (STUDIO SHOWCASE) CONTROLLER
     ========================================================= */
  class LineupController {
    constructor() {
      this.cars = config.lineup || [];
      this.currentId = this.cars[0]?.id || 'gt-e';

      this.tabsContainer = document.getElementById('lineupTabs');
      this.imageEl = document.getElementById('lineupImage');
      this.badgeEl = document.getElementById('modelBadge');
      this.finishEl = document.getElementById('modelFinish');
      this.nameEl = document.getElementById('modelName');
      this.categoryEl = document.getElementById('modelCategory');
      this.descEl = document.getElementById('modelDesc');
      this.powerEl = document.getElementById('modelPower');
      this.accelEl = document.getElementById('modelAccel');
      this.rangeEl = document.getElementById('modelRange');
      this.topSpeedEl = document.getElementById('modelTopSpeed');
      this.priceEl = document.getElementById('modelPrice');
      this.selectBtn = document.getElementById('modelSelectBtn');
      this.modelDropdown = document.getElementById('selectedModel');

      this.init();
    }

    init() {
      if (!this.tabsContainer || this.cars.length === 0) return;

      // Render tabs
      this.tabsContainer.innerHTML = '';
      this.cars.forEach((car, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `tab-btn ${car.id === this.currentId ? 'is-active' : ''}`;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', car.id === this.currentId ? 'true' : 'false');
        btn.dataset.id = car.id;
        btn.innerHTML = `
          <span>${car.name}</span>
          <span class="tab-badge">${car.badge}</span>
        `;

        btn.addEventListener('click', () => this.switchModel(car.id));
        this.tabsContainer.appendChild(btn);
      });

      if (this.selectBtn && this.modelDropdown) {
        this.selectBtn.addEventListener('click', () => {
          this.modelDropdown.value = this.currentId;
        });
      }

      this.renderCurrent();
    }

    switchModel(id) {
      if (this.currentId === id) return;
      this.currentId = id;

      // Update active tab styles
      const tabs = this.tabsContainer.querySelectorAll('.tab-btn');
      tabs.forEach(tab => {
        const isActive = tab.dataset.id === id;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      this.renderCurrent();
    }

    renderCurrent() {
      const car = this.cars.find(c => c.id === this.currentId);
      if (!car) return;

      // Crossfade studio image
      if (this.imageEl) {
        this.imageEl.classList.add('is-loading');
        const tempImg = new Image();
        tempImg.src = car.image;
        tempImg.onload = () => {
          this.imageEl.src = car.image;
          this.imageEl.alt = car.name;
          setTimeout(() => {
            this.imageEl.classList.remove('is-loading');
          }, 40);
        };
      }

      // Update metadata text
      if (this.badgeEl) this.badgeEl.textContent = car.badge;
      if (this.finishEl) this.finishEl.textContent = car.finish;
      if (this.nameEl) this.nameEl.textContent = car.name;
      if (this.categoryEl) this.categoryEl.textContent = car.category;
      if (this.descEl) this.descEl.textContent = car.description;
      if (this.powerEl) this.powerEl.textContent = car.power;
      if (this.accelEl) this.accelEl.textContent = car.accel;
      if (this.rangeEl) this.rangeEl.textContent = car.range;
      if (this.topSpeedEl) this.topSpeedEl.textContent = car.topSpeed;
      if (this.priceEl) this.priceEl.textContent = car.price;

      if (this.modelDropdown) {
        this.modelDropdown.value = car.id;
      }
    }
  }

  /* =========================================================
     3. NATIVE PROCEDURAL AUDIO SYNTHESIZER (WEB AUDIO API)
     ========================================================= */
  class AmbientAudioEngine {
    constructor() {
      this.toggleBtn = document.getElementById('audioToggle');
      this.labelEl = document.getElementById('audioLabel');
      this.ctx = null;
      this.isPlaying = false;
      this.masterGain = null;
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      this.filter = null;

      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', () => this.toggle());
      }

      // Subtle scroll pitch modulation
      window.addEventListener('scroll', () => {
        if (!this.isPlaying || !this.droneOsc1) return;
        const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const baseFreq = 48 + scrollPct * 32;
        this.droneOsc1.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.2);
        this.droneOsc2.frequency.setTargetAtTime(baseFreq * 1.5, this.ctx.currentTime, 0.2);
      }, { passive: true });
    }

    initAudioContext() {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Lowpass Filter for velvety acoustic dampening
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(240, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // Dual Sub-Bass Sine Oscillators for electric motor resonance
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(48, this.ctx.currentTime);

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(72, this.ctx.currentTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

      this.droneOsc1.connect(this.filter);
      this.droneOsc2.connect(oscGain);
      oscGain.connect(this.filter);

      // Procedural Atmospheric Pink Noise for night breeze
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.04;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(400, this.ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();
      whiteNoise.start();
    }

    toggle() {
      if (!this.ctx) {
        this.initAudioContext();
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.isPlaying = !this.isPlaying;

      if (this.isPlaying) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 1.2);
        this.toggleBtn.classList.add('is-active');
        if (this.labelEl) this.labelEl.textContent = 'AUDIO [ONLINE]';
      } else {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
        this.toggleBtn.classList.remove('is-active');
        if (this.labelEl) this.labelEl.textContent = 'AUDIO [OFF]';
      }
    }
  }

  /* =========================================================
     4. HUD REALTIME CLOCK & TELEMETRY
     ========================================================= */
  function initHudClock() {
    const clockEl = document.getElementById('hudClock');
    if (!clockEl) return;

    function updateTime() {
      const now = new Date();
      const hrs = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      clockEl.textContent = `${hrs}:${mins}:${secs} UTC`;
    }
    updateTime();
    setInterval(updateTime, 1000);
  }

  /* =========================================================
     5. COMMISSION FORM SUBMISSION CONTROLLER
     ========================================================= */
  function initCommissionForm() {
    const form = document.getElementById('reserveForm');
    const resp = document.getElementById('formResponse');
    if (!form || !resp) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('clientName').value;
      const model = document.getElementById('selectedModel').value.toUpperCase();
      const randomAlloc = Math.floor(1000 + Math.random() * 9000);

      resp.className = 'form-response is-success';
      resp.innerHTML = `
        <strong>DOSSIER RECEIVED // ALLOCATION RESERVED</strong><br>
        CHASSIS CODE: NOCTIS-${model}-ALLOC-${randomAlloc}<br>
        CONFIRMATION TRANSMITTED TO YOUR COMMUNICATION VECTOR.<br>
        OUR COLOGNE PRIVATE DESK WILL INITIATE CONTACT.
      `;

      form.reset();
    });
  }

  /* =========================================================
     INITIALIZE ALL COMPONENTS ON DOM READY
     ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Hero Scroller (596 frames)
    new CanvasSequenceScrubber({
      canvasId: 'heroCanvas',
      trackId: 'heroTrack',
      frameCount: config.frames.hero.count,
      desktopPrefix: config.frames.hero.desktopPrefix,
      mobilePrefix: config.frames.hero.mobilePrefix,
      extension: config.frames.hero.extension,
      digits: config.frames.hero.digits,
      progressBarId: 'heroProgressBar',
      frameHudId: 'heroFrameHud',
      percentHudId: 'heroPercentHud',
      speedCounterId: 'heroSpeedCounter',
      beats: [
        { id: 'heroBeat1', start: 0.00, end: 0.18 },
        { id: 'heroBeat2', start: 0.25, end: 0.46 },
        { id: 'heroBeat3', start: 0.52, end: 0.72 },
        { id: 'heroBeat4', start: 0.78, end: 0.99 }
      ]
    });

    // 2. Initialize Dismantle Scroller (198 frames)
    new CanvasSequenceScrubber({
      canvasId: 'dismantleCanvas',
      trackId: 'dismantleTrack',
      frameCount: config.frames.dismantle.count,
      desktopPrefix: config.frames.dismantle.desktopPrefix,
      mobilePrefix: config.frames.dismantle.mobilePrefix,
      extension: config.frames.dismantle.extension,
      digits: config.frames.dismantle.digits,
      progressBarId: 'dismantleProgressBar',
      frameHudId: 'dismantleFrameHud',
      percentHudId: 'dismantlePercentHud',
      beats: [
        { id: 'dismantleBeat1', start: 0.00, end: 0.22 },
        { id: 'dismantleBeat2', start: 0.27, end: 0.48 },
        { id: 'dismantleBeat3', start: 0.53, end: 0.74 },
        { id: 'dismantleBeat4', start: 0.78, end: 0.99 }
      ]
    });

    // 3. Initialize Lineup Showcase
    new LineupController();

    // 4. Initialize Audio Engine
    new AmbientAudioEngine();

    // 5. Initialize Clock & Form
    initHudClock();
    initCommissionForm();
  });
})();

