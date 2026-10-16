/* ═══════════════════════════════════════════════
   animations.js — GSAP + Scroll + Cursor + Parallax + Dark Mode
   Shared across index.html and timeline.html
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    if (typeof gsap === 'undefined') {
      console.warn('[animations.js] GSAP not loaded');
      return;
    }
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    // ─── CUSTOM CELESTIAL CURSOR (ANTI-SCROLL REFACTOR) ───
    (function initCursor() {
      const cursor = document.getElementById('cursor');
      const trail = document.getElementById('cursor-trail');
      if (!cursor || !trail) return;

      let mx = -200, my = -200; 
      let tx = -200, ty = -200; 

      cursor.style.left = "0px";
      cursor.style.top = "0px";
      trail.style.left = "0px";
      trail.style.top = "0px";

      window.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        
        // النقطة تتحرك فوراً وبثبات كامل في الـ Viewport لمنع الاختفاء مع السكرول
        cursor.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      });

      // دالة اللحاق وتنعيم حركة الحلقة الخارجية رغماً عن السكرول
      function updateTrail() {
        tx += (mx - tx) * 0.12; 
        ty += (my - ty) * 0.12;
        
        trail.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
        
        requestAnimationFrame(updateTrail);
      }
      requestAnimationFrame(updateTrail);
    })();

    // تفعيل تأثير الهوفير على الأزرار
    document.addEventListener('mouseover', e => {
      if (e.target.closest('a, button, .tl-card, .ms-card, .moment-inner, .fs, .enter-btn, .music-ctrl')) {
        document.body.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', e => {
      if (!e.target.closest('a, button, .tl-card, .ms-card, .moment-inner, .fs, .enter-btn, .music-ctrl')) {
        document.body.classList.remove('cursor-hover');
      }
    });

    // Click ripple (معدل لمنع التضارب)
    document.addEventListener('click', e => {
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position:fixed;
        left:${e.clientX}px; top:${e.clientY}px;
        width:6px; height:6px; border-radius:50%;
        border:1px solid rgba(157,78,221,0.7);
        pointer-events:none; z-index:99999;
        transform:translate(-50%,-50%) scale(0);
        opacity:1;
      `;
      document.body.appendChild(ripple);
      gsap.to(ripple, {
        scale: 8, opacity: 0, duration: 0.7,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
    });

    // ─── SCROLL PROGRESS BAR ───
    (function initScrollProgress() {
      const bar = document.getElementById('scroll-progress');
      if (!bar) return;
      window.addEventListener('scroll', () => {
        const max = document.body.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
      }, { passive: true });
    })();

    // ─── NAV SCROLL ───
    (function initNav() {
      const nav = document.getElementById('main-nav');
      if (!nav) return;
      window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
      }, { passive: true });
    })();

    // ─── PARALLAX HERO (index.html only) ───
    (function initParallax() {
      const pl1  = document.getElementById('pl1');
      const pl2  = document.getElementById('pl2');
      const pl3  = document.getElementById('pl3');
      const moon = document.getElementById('moon-wrap');
      const geo  = document.getElementById('geo-lines');
      if (!pl1) return;

      let sy = 0, mx = 0, my = 0;

      function apply() {
        if (pl1) pl1.style.transform = `translateY(${sy * 0.15}px) translate(${mx * 0.3}px,${my * 0.3}px)`;
        if (pl2) pl2.style.transform = `translateY(${sy * 0.25}px) translate(${mx * 0.5}px,${my * 0.5}px)`;
        if (pl3) pl3.style.transform = `translateY(${sy * 0.35}px) translate(${mx * 0.2}px,${my * 0.2}px)`;
        if (moon) moon.style.transform = `translateY(${sy * 0.12}px) translate(${mx * 0.4}px,${my * 0.4}px)`;
        if (geo) {
          const svg = geo.querySelector('.geo-svg');
          if (svg) svg.style.transform = `rotate(${mx * 0.3}deg)`;
        }
      }

      window.addEventListener('scroll', () => { sy = window.scrollY; apply(); }, { passive: true });
      window.addEventListener('mousemove', e => {
        mx = (e.clientX / window.innerWidth  - 0.5) * 20;
        my = (e.clientY / window.innerHeight - 0.5) * 20;
        apply();
      });

      const svg = geo && geo.querySelector('.geo-svg');
      if (svg) setTimeout(() => gsap.to(svg, { opacity: 0.2, duration: 3, ease: 'power2.out' }), 3200);
    })();

    // ─── SCROLL REVEAL ───
    (function initScrollReveal() {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          setTimeout(() => el.classList.add('in-view'), parseFloat(el.dataset.delay || 0));
          obs.unobserve(el);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      document.querySelectorAll('.reveal-up, .reveal-card, .reveal-milestone').forEach(el => obs.observe(el));
    })();

    // ─── TIMELINE SPINE ───
    (function initTimelineSpine() {
      const spine = document.getElementById('tl-spine');
      if (!spine || !spine.parentElement) return;
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { spine.classList.add('drawn'); obs.disconnect(); }
      }, { threshold: 0.05 });
      obs.observe(spine.parentElement);
    })();

    // ─── TOAST (global) ───
    window.showToast = function (msg, duration) {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(window._toastTimer);
      window._toastTimer = setTimeout(() => toast.classList.remove('show'), duration || 3000);
    };

    // ─── CARD MOUSE GLOW ───
    window.addEventListener('mousemove', e => {
      document.querySelectorAll('.card-inner, .ms-card, .moment-inner').forEach(card => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top)  + 'px');
      });
    });

    // ─── HOVER / CLICK SFX ───
    document.querySelectorAll('button, .enter-btn, .back-btn, .nav-cta').forEach(el => {
      el.addEventListener('mouseenter', () => window.MusicEngine && window.MusicEngine.sfxHover());
      el.addEventListener('click',      () => window.MusicEngine && window.MusicEngine.sfxClick());
    });

    // ─── KEYBOARD EASTER EGG: type "purple" ───
    (function () {
      const secret = 'purple';
      let typed = '';
      document.addEventListener('keydown', e => {
        typed = (typed + e.key.toLowerCase()).slice(-secret.length);
        if (typed === secret) {
          window.showToast && window.showToast('💜 I purple you, Dalia. — Shreif', 4000);
          const flash = document.createElement('div');
          flash.style.cssText = 'position:fixed;inset:0;background:rgba(157,78,221,0.14);pointer-events:none;z-index:99997;';
          document.body.appendChild(flash);
          gsap.to(flash, { opacity: 0, duration: 1.8, ease: 'power2.out', onComplete: () => flash.remove() });
          typed = '';
        }
      });
    })();

    // ─── FINAL STARS EASTER EGG (timeline.html) ───
    (function () {
      const stars = document.querySelectorAll('.fs');
      const msg   = document.getElementById('final-easter-msg');
      if (!stars.length || !msg) return;
      stars.forEach(star => {
        star.addEventListener('click', () => {
          msg.textContent = star.dataset.msg || '';
          msg.classList.add('visible');
          clearTimeout(window._msgTimer);
          window._msgTimer = setTimeout(() => msg.classList.remove('visible'), 3500);
          window.MusicEngine && window.MusicEngine.sfxReveal();
        });
      });
    })();

    // ─── PAGE TRANSITION: reset layers on entry ───
    gsap.set('.pt-layer', { scaleY: 0 });

    // ─── PAGE TRANSITION: exit helper ───
    window.transitionTo = function (url) {
      const overlay = document.getElementById('page-transition');
      if (overlay) overlay.style.pointerEvents = 'all';
      gsap.timeline({ onComplete: () => { window.location.href = url; } })
        .to('.pt-1', { scaleY: 1, transformOrigin: 'bottom', duration: 0.45, ease: 'power3.inOut' })
        .to('.pt-2', { scaleY: 1, transformOrigin: 'bottom', duration: 0.38, ease: 'power3.inOut' }, '-=0.25')
        .to('.pt-3', { scaleY: 1, transformOrigin: 'bottom', duration: 0.30, ease: 'power3.inOut' }, '-=0.18');
    };

    // ─── TIMELINE HERO SCROLL PARALLAX (timeline.html only) ───
    if (document.querySelector('#tl-hero')) {
      ScrollTrigger.create({
        trigger: '#tl-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: self => {
          const hero = document.querySelector('.tl-hero-content');
          if (hero) gsap.set(hero, { y: self.progress * 80, opacity: Math.max(0, 1 - self.progress * 1.4) });
        }
      });
    }

    // ─── DARK / LIGHT MODE TOGGLE ENGINE ───
    (function initDarkMode() {
      const toggleBtn = document.getElementById('dark-mode-toggle');
      const isDarkMode = localStorage.getItem('theme') === 'dark';
      
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      }

      if (!toggleBtn) return;

      toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (window.MusicEngine) window.MusicEngine.sfxClick();

        if (document.body.classList.contains('dark-mode')) {
          localStorage.setItem('theme', 'dark');
          window.showToast && window.showToast('Dark Mode Activated 🌙', 2000);
        } else {
          localStorage.setItem('theme', 'light');
          window.showToast && window.showToast('Light Mode Activated ☀️', 2000);
        }
      });
    })();

  }); // end DOMContentLoaded
})();