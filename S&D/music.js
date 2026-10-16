/* ═══════════════════════════════════════════════
   music.js — Web Audio API ambient engine & MP3 Player
   Generative ambient music + Custom Track
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  let ctx = null, masterGain = null, playing = false;
  let oscillators = [], lfoNodes = [], reverbNode = null;

  // ─── تمت إضافة ملف الصوت الخاص بك هنا ───
   let bgAudio = new Audio('intersellar.mp3');
  //let bgAudio = new Audio('m2.mp3');
  bgAudio.loop = true;
  bgAudio.volume = 0.5;

  // Pentatonic scale frequencies (A minor pentatonic — emotional, cinematic)
  const NOTES = [
    220.0,  // A3
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.26, // E5
    783.99, // G5
  ];

  function createReverb(audioCtx) {
    const convolver = audioCtx.createConvolver();
    const len = audioCtx.sampleRate * 4;
    const buf = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
      }
    }
    convolver.buffer = buf;
    return convolver;
  }

  function createPad(audioCtx, freq, gainVal, detune = 0) {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.detune.setValueAtTime(detune, audioCtx.currentTime);

    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.3 + Math.random() * 0.3, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(4, audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune);
    lfo.start();

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(gainVal, audioCtx.currentTime + 4);

    osc.connect(gain);
    osc.start();

    return { osc, gain, lfo, lfoGain };
  }

  function buildAmbience(audioCtx) {
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 3);

    reverbNode = createReverb(audioCtx);
    const dryGain = audioCtx.createGain();
    const wetGain = audioCtx.createGain();
    dryGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    wetGain.gain.setValueAtTime(0.6, audioCtx.currentTime);

    masterGain.connect(dryGain);
    masterGain.connect(reverbNode);
    reverbNode.connect(wetGain);
    dryGain.connect(audioCtx.destination);
    wetGain.connect(audioCtx.destination);

    const chord = [NOTES[0], NOTES[2], NOTES[4], NOTES[6]]; 
    chord.forEach((freq, i) => {
      const pad = createPad(audioCtx, freq * 0.5, 0.06 + Math.random() * 0.03, (i - 1.5) * 8);
      pad.gain.connect(masterGain);
      oscillators.push(pad.osc);
      lfoNodes.push(pad.lfo, pad.lfoGain);

      const padUp = createPad(audioCtx, freq, 0.035, (i - 1.5) * -6);
      padUp.gain.connect(masterGain);
      oscillators.push(padUp.osc);
      lfoNodes.push(padUp.lfo, padUp.lfoGain);
    });

    let twinkleInterval = setInterval(() => {
      if (!playing) { clearInterval(twinkleInterval); return; }
      const note = NOTES[Math.floor(Math.random() * NOTES.length)];
      const osc  = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note * 2, audioCtx.currentTime);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0, audioCtx.currentTime);
      g.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.8);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 4);
      osc.connect(g);
      g.connect(masterGain);
      osc.start();
      osc.stop(audioCtx.currentTime + 5);
    }, 3500 + Math.random() * 2000);
  }

  function startAmbience() {
    if (playing) return;
    try {
      // تم استبدال الكود المعقد بتشغيل ملفك مباشرة
      bgAudio.play().catch(e => console.log('[Music] Audio play waiting for user interaction'));
      playing = true;
    } catch (e) {
      console.warn('[Music] Error playing file:', e);
    }
  }

  function stopAmbience() {
    if (!playing) return;
    // إيقاف ملفك
    bgAudio.pause();
    playing = false;
  }

  function toggleMusic() {
    const btn  = document.getElementById('music-ctrl');
    const icon = document.getElementById('music-icon');
    if (!playing) {
      startAmbience();
      btn && btn.classList.remove('paused');
      icon && icon.parentElement.classList.remove('paused');
    } else {
      stopAmbience();
      btn && btn.classList.add('paused');
    }
  }

  // ─── SOUND EFFECTS ───
  function sfxClick() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const g   = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + 0.15);
      g.gain.setValueAtTime(0.08, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.3);
      osc.connect(g); g.connect(ac.destination);
      osc.start(); osc.stop(ac.currentTime + 0.35);
      setTimeout(() => ac.close(), 500);
    } catch (e) {}
  }

  function sfxHover() {
    try {
      const ac  = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const g   = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ac.currentTime);
      g.gain.setValueAtTime(0.03, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.15);
      osc.connect(g); g.connect(ac.destination);
      osc.start(); osc.stop(ac.currentTime + 0.2);
      setTimeout(() => ac.close(), 400);
    } catch (e) {}
  }

  function sfxReveal() {
    try {
      const ac  = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const g   = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, ac.currentTime);
      osc.frequency.linearRampToValueAtTime(550, ac.currentTime + 0.4);
      g.gain.setValueAtTime(0.06, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.6);
      osc.connect(g); g.connect(ac.destination);
      osc.start(); osc.stop(ac.currentTime + 0.7);
      setTimeout(() => ac.close(), 900);
    } catch (e) {}
  }

  // ─── EXPOSE ───
  window.MusicEngine = { start: startAmbience, stop: stopAmbience, toggle: toggleMusic, sfxClick, sfxHover, sfxReveal };

  // ─── BIND MUSIC BUTTON ───
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('music-ctrl');
    if (btn) {
      btn.addEventListener('click', () => {
        window.MusicEngine.toggle();
        sfxClick();
      });
    }
  });
})();