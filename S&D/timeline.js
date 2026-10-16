/* ═══════════════════════════════════════════════
   timeline.js — Meticulous Event & Animation Core
   Fixed Mouse Scroll Isolation & Vortex Stabilization
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── CONFIG TOKENS ───
  const START_DATE = new Date('2025-10-17T00:00:00');
  const SECRET_MESSAGE_TEXT = `أمنيتي في اليوم والشهر ده… إنك تكوني معايا، حتى لو بكلمة واحدة بس.
أنا فعلًا بحبك… وبموت فيكي.

ولو إحنا فعلًا مبقيناش بنتكلم، فأنا عملت كل ده علشان اللحظة دي… اللحظة اللي كنت بتمنى تيجي.
كنت بتمنى تدخلي تسألي عليا، حتى لو برسالة صغيرة، ويمكن ساعتها أحس إن قلبي ما استناش عبث.

رغم البُعد، ورغم الوقت الطويل اللي عدى، لسه عندي أمل صغير…
أمل إنك تكوني لسه فاكراني، وإنّي ما كنتش مجرد شخص عدى في حياتك واتنسي.

عارفة؟
إنتِ كنتِ الحلم اللي بدعي بيه ربنا كل ليلة، والأمنية الوحيدة اللي كنت بخاف ما تتحققش.
ويمكن أصدق حاجة في عمري كله… إني حبيتك بصدق عمره ما اتكرر.

من أكتر شخص حبك… واتعذب في حبك،
شريف عبدالوهاب.

ولعلّنا من بعدِ بُعدٍ نلتقي
ويطيبُ قلبي عندما ألقاكِ
ويراكِ بعضُ الناسِ شخصًا عابرًا
وأنا أراكِ حبيبتي… وملاكي.`;

  const els = {
    years:      document.getElementById('c-years'),
    months:     document.getElementById('c-months'),
    weeks:      document.getElementById('c-weeks'),
    days:       document.getElementById('c-days'),
    hours:      document.getElementById('c-hours'),
    mins:       document.getElementById('c-mins'),
    secs:       document.getElementById('c-secs'),
    bigSecs:    document.getElementById('big-secs'),
    dateDisplay:document.getElementById('counter-date-display'),
  };

  let globalEngineState = "NORMAL";
  let audioTracks = {}; 

  function formatStartDate() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return START_DATE.toLocaleDateString('en-US', options);
  }

  function getDuration(from, to) {
    const totalMs = to - from;
    const totalSecs = Math.max(0, Math.floor(totalMs / 1000));
    const totalMins = Math.floor(totalSecs / 60);
    const totalHrs  = Math.floor(totalMins / 60);
    const totalDays = Math.floor(totalHrs  / 24);
    const totalWeeks= Math.floor(totalDays / 7);

    let years  = to.getFullYear() - from.getFullYear();
    let months = to.getMonth()    - from.getMonth();
    let days   = to.getDate()     - from.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) { years--; months += 12; }

    return { years: Math.max(0, years), months: Math.max(0, months), weeks: totalWeeks, days: totalDays, hours: totalHrs % 24, mins: totalMins % 60, secs: totalSecs % 60, totalSecs };
  }

  function updateNum(el, newVal) {
    if (!el) return;
    const str = newVal.toLocaleString();
    if (el.textContent === str) return;
    el.textContent = str;
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
    setTimeout(() => el.classList.remove('tick'), 350);
  }

  // ─── دالة توليد الأصوات والاهتزاز الذكي (تم عزل الـ Body لحماية الماوس) ───
  function playSyntheticFX(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'thud') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.9, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
        
        // 🛠️ التعديل الجوهري: الاهتزاز يضرب الأوفرلاي فقط وليس الـ Body بالكامل لمنع اختفاء الماوس
        const targetOverlay = document.getElementById('vortex-overlay');
        if (targetOverlay) {
          targetOverlay.style.animation = 'none';
          void targetOverlay.offsetWidth;
          targetOverlay.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';
        }
      } else if (type === 'vortex') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 1);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
        osc.start(); osc.stop(ctx.currentTime + 1);
      }
    } catch(e) { console.log("Audio Context Locked"); }
  }

  function executeTimeLocks(now) {
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hour = now.getHours();
    const min = now.getMinutes();
    const sec = now.getSeconds();

    if (month === 11 && date === 11) {
      
      if (hour === 11 && min === 0 && sec < 10) {
        if (globalEngineState !== "MORNING_WAIT") {
          globalEngineState = "MORNING_WAIT";
          const morningOverlay = document.getElementById('morning-overlay');
          if (morningOverlay) morningOverlay.classList.add('active');
        }
      } else if (globalEngineState === "MORNING_WAIT") {
        globalEngineState = "NORMAL";
        const morningOverlay = document.getElementById('morning-overlay');
        if (morningOverlay) morningOverlay.classList.remove('active');
      }

      if (hour === 23 && min === 10 && sec >= 45) {
        const remainingToTarget = 60 - sec;

        if (globalEngineState === "NORMAL") {
          globalEngineState = "VORTEX_RUN";
          window.setParticleCosmicVortex && window.setParticleCosmicVortex(true);
          
          const overlay = document.getElementById('vortex-overlay');
          if(overlay) {
            overlay.classList.add('active');
            overlay.classList.add('gravity-heavy-effect');
          }
        }

        const timerEl = document.getElementById('vortex-countdown');
        if (remainingToTarget <= 3 && remainingToTarget > 0) {
          const overlay = document.getElementById('vortex-overlay');
          if(overlay) overlay.classList.remove('gravity-heavy-effect');
          
          if (timerEl) {
            timerEl.style.display = "block";
            timerEl.textContent = remainingToTarget;
            playSyntheticFX('thud');
          }
        } else if (timerEl) {
          timerEl.style.display = "none";
        }
      } 
      
      else if (hour === 23 && min === 11) {
        if (globalEngineState === "VORTEX_RUN") {
          globalEngineState = "SHOW_CELEBRATION";
          window.setParticleCosmicVortex && window.setParticleCosmicVortex(false);
          
          document.getElementById('vortex-countdown').style.display = "none";
          document.getElementById('vortex-dalia-title').classList.add('reveal');
          
          const box = document.getElementById('vortex-secret-box');
          if(box) box.style.display = "block";
          
          audioTracks.romantic = new Audio('yaliel.mp3');
          if (audioTracks.romantic && audioTracks.romantic.play) {
            audioTracks.romantic.loop = true;
            audioTracks.romantic.volume = 0.5;
            audioTracks.romantic.play().catch(e => console.log("Audio waiting user touch"));
          }
          
          if (typeof gsap !== 'undefined') {
            gsap.to('#vortex-secret-box', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
            gsap.to('#vortex-typing-text', { text: SECRET_MESSAGE_TEXT, duration: 6, ease: 'none' });
          } else {
            document.getElementById('vortex-typing-text').textContent = SECRET_MESSAGE_TEXT;
          }
        }
      } 
      
      else if (hour === 23 && min > 11 && (globalEngineState === "SHOW_CELEBRATION" || globalEngineState === "VORTEX_RUN")) {
        globalEngineState = "NORMAL";
        document.getElementById('vortex-overlay').classList.remove('active');
        document.getElementById('vortex-dalia-title').classList.remove('reveal');
        document.getElementById('vortex-secret-box').style.display = "none";
        document.getElementById('vortex-typing-text').textContent = "";
      }
    }
  }

  function tick() {
    const now = new Date();
    const d = getDuration(START_DATE, now);
    
    if (globalEngineState === "NORMAL") {
      updateNum(els.years,   d.years);
      updateNum(els.months,  d.months);
      updateNum(els.weeks,   d.weeks);
      updateNum(els.days,    d.days);
      updateNum(els.hours,   d.hours);
      updateNum(els.mins,    d.mins);
      updateNum(els.secs,    d.secs);
      if (els.bigSecs) updateNum(els.bigSecs, d.totalSecs);
    }

    const lockScreen = document.getElementById('celestial-lock');
    if (lockScreen && lockScreen.classList.contains('unlocked')) {
      executeTimeLocks(now);
    }
  }

  function initCelestialLock() {
    const btn = document.getElementById('lock-btn');
    const bar = document.getElementById('lock-progress-bar');
    const screen = document.getElementById('celestial-lock');
    if (!btn || !bar || !screen) return;

    let holdTimer = null;
    let progress = 0;
    const maxProgress = 100;

    function startHold() {
      if (holdTimer) clearInterval(holdTimer);
      holdTimer = setInterval(() => {
        progress += 4; 
        if (progress >= maxProgress) {
          progress = maxProgress;
          clearInterval(holdTimer);
          screen.classList.add('unlocked'); 
          playSyntheticFX('thud');
        }
        const offset = 700 - (700 * progress) / 100;
        bar.style.strokeDashoffset = offset;
      }, 100);
    }

    function stopHold() {
      if (holdTimer) clearInterval(holdTimer);
      holdTimer = setInterval(() => {
        progress -= 8; 
        if (progress <= 0) {
          progress = 0;
          clearInterval(holdTimer);
        }
        const offset = 700 - (700 * progress) / 100;
        bar.style.strokeDashoffset = offset;
      }, 50);
    }

    btn.addEventListener('mousedown', startHold);
    btn.addEventListener('mouseup', stopHold);
    btn.addEventListener('mouseleave', stopHold);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); startHold(); });
    btn.addEventListener('touchend', stopHold);
  }

  function initCounter() {
    if (els.dateDisplay) els.dateDisplay.textContent = formatStartDate();
    tick();
    setInterval(tick, 1000);
  }

  function initFinalStars() {
    const canvas = document.getElementById('final-stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, stars = [];
    function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
    class Star {
      constructor() { this.reset(true); }
      reset(init) {
        this.x = Math.random() * W; this.y = init ? Math.random() * H : H + 5;
        this.r = Math.random() * 1.5 + 0.3; this.vy = -(Math.random() * 0.25 + 0.05);
        this.alpha = 0; this.targetAlpha = Math.random() * 0.7 + 0.1;
        this.phase = Math.random() * Math.PI * 2; this.twinkle = Math.random() * 0.03 + 0.01;
        this.drift = (Math.random() - 0.5) * 0.1;
      }
      update(t) { this.y += this.vy; this.x += this.drift; this.alpha = this.targetAlpha * (0.5 + 0.5 * Math.sin(t * this.twinkle + this.phase)); if (this.y < -10) this.reset(); }
      draw() {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 6);
        g.addColorStop(0, `rgba(199,125,255,${this.alpha})`); g.addColorStop(1, 'rgba(199,125,255,0)');
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 6, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      }
    }
    window.addEventListener('resize', resize); resize();
    stars = Array.from({ length: 80 }, () => new Star());
    let t = 0;
    function loop() { ctx.clearRect(0, 0, W, H); t++; stars.forEach(s => { s.update(t); s.draw(); }); requestAnimationFrame(loop); }
    loop();
  }

  function initFinalReveal() {
    const final = document.getElementById('final-section');
    if (final) return;
    gsap.set(['.final-eyebrow', '.final-title', '.final-divider', '.final-sign', '.final-arabic', '.final-stars-row', '.back-btn'], { opacity: 0, y: 30 });
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) return;
      gsap.timeline({ delay: 0.2 })
        .to('.final-eyebrow',   { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
        .to('.final-title',     { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out' }, '-=0.6')
        .to('.back-btn',        { opacity: 1, y: 0, duration: 1,   ease: 'power3.out' }, '-=0.3');
      observer.disconnect();
    }, { threshold: 0.15 });
    observer.observe(final);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCelestialLock();
    initCounter();
    initFinalStars();
    initFinalReveal();
  });
})();