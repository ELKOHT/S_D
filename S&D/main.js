/* ═══════════════════════════════════════════════
   main.js — Landing Page Logic
   Loader → Hero animation → Quotes → Transitions
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── LOADER SEQUENCE ───
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) { revealHero(); return; }

    // Generate loader stars first
    const starsContainer = loader.querySelector('.loader-stars');
    if (starsContainer) {
      for (let i = 0; i < 40; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 2 + 0.5;
        star.style.cssText = `
          position:absolute;
          width:${size}px; height:${size}px;
          border-radius:50%;
          background:rgba(${157 + Math.random()*60},${78 + Math.random()*100},221,${Math.random()*0.8+0.1});
          left:${Math.random()*100}%;
          top:${Math.random()*100}%;
          animation: starTwinkle ${2+Math.random()*3}s ease-in-out infinite;
          animation-delay:${Math.random()*2}s;
        `;
        starsContainer.appendChild(star);
      }
    }

    // Exit loader after CSS fill animation completes (~2.4s) + small buffer
    setTimeout(() => {
      gsap.to(loader, {
        opacity: 0, duration: 0.8, ease: 'power2.inOut',
        onComplete: () => {
          loader.style.display = 'none';
          revealHero();
        }
      });
    }, 2600);
  }

  // ─── HERO REVEAL SEQUENCE ───
  function revealHero() {
    const nav    = document.getElementById('main-nav');

    // Show nav
    if (nav) {
      nav.classList.remove('hidden');
      nav.classList.add('visible');
    }

    // Start ambient music auto-offer
    setTimeout(() => {
      const musicCtrl = document.getElementById('music-ctrl');
      if (musicCtrl) {
        musicCtrl.classList.remove('hidden');
        window.showToast('Click the music button for ambient sound 🎵');
      }
    }, 3000);

    // GSAP timeline for hero elements
    const tl = gsap.timeline({ delay: 0.2 });

    tl.to('#eid-ar', {
      opacity: 1, y: 0, duration: 1.2, ease: 'power3.out'
    })
    .to('#tl1', {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out'
    }, '-=0.5')
    .to('#tl2', {
      opacity: 1, y: 0, duration: 1.2, ease: 'power3.out'
    }, '-=0.6')
    .to('#tl3', {
      opacity: 1, duration: 0.8, ease: 'power2.out'
    }, '-=0.4')
    .to('#hero-sub', {
      opacity: 1, y: 0, duration: 1, ease: 'power2.out'
    }, '-=0.5')
    .to('#hero-div', {
      opacity: 1, duration: 0.8, ease: 'power2.out'
    }, '-=0.3')
    .to('#enter-btn', {
      opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.7)'
    }, '-=0.3')
    .to('#moon-wrap', {
      opacity: 1, duration: 1.2, ease: 'power2.out'
    }, '-=0.8')
    .to(['.lantern-1', '.lantern-2', '.lantern-3'], {
      opacity: 0.3, stagger: 0.2, duration: 1, ease: 'power2.out'
    }, '-=0.6');

    // Add scroll indicator
    addScrollIndicator();

    // Show quotes section
    setTimeout(() => {
      const qs = document.getElementById('quotes-section');
      if (qs) qs.classList.remove('hidden');
    }, 500);
  }

  // ─── SCROLL INDICATOR ───
  function addScrollIndicator() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const ind = document.createElement('div');
    ind.className = 'scroll-indicator';
    ind.innerHTML = `<span>Scroll</span><div class="scroll-indicator-line"></div>`;
    hero.appendChild(ind);

    // Hide on first scroll
    window.addEventListener('scroll', function hideInd() {
      gsap.to(ind, { opacity: 0, duration: 0.5 });
      window.removeEventListener('scroll', hideInd);
    });
  }

  // ─── ENTER BUTTON → PAGE TRANSITION ───
  function initEnterButton() {
    const btn = document.getElementById('enter-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (window.MusicEngine) {
        window.MusicEngine.sfxClick();
        window.MusicEngine.start(); // تهيئة وبدء محرك الصوت فورًا هنا
      }
      window.transitionTo('timeline.html');
    });
  }

  // ─── QUOTES ROTATOR ───
  const QUOTES = [
    "You are my favorite kind of quiet.",
    "Every time I think of Eid, I think of you first.",
    "You don't just fill the room — you become it.",
    "Some people make the world softer just by existing. You're one of them.",
    "I didn't know peace had a face until I saw yours.",
    "You are my أضحى and my عيد.",
    "The stars count differently when you're watching them.",
    "In every version of this life, I'd find you.",
  ];

  function initQuotes() {
    const textEl = document.getElementById('quote-text');
    const dotsEl = document.getElementById('quote-dots');
    if (!textEl || !dotsEl) return;

    let current = 0;

    // Create dots
    QUOTES.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'quote-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goToQuote(i));
      dotsEl.appendChild(dot);
    });

    function goToQuote(index) {
      const container = document.getElementById('quote-container');
      gsap.to(container, {
        opacity: 0, y: -10, duration: 0.4, ease: 'power2.in',
        onComplete: () => {
          current = index;
          textEl.textContent = QUOTES[current];
          document.querySelectorAll('.quote-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
          });
          gsap.to(container, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
        }
      });
    }

    // Init first quote with typing effect
    typeText(textEl, QUOTES[0], 45);

    // Auto rotate every 5s
    let autoTimer = setInterval(() => {
      goToQuote((current + 1) % QUOTES.length);
    }, 5000);

    // Pause on hover
    const container = document.getElementById('quote-container');
    if (container) {
      container.addEventListener('mouseenter', () => clearInterval(autoTimer));
      container.addEventListener('mouseleave', () => {
        autoTimer = setInterval(() => {
          goToQuote((current + 1) % QUOTES.length);
        }, 5000);
      });
    }
  }

  // ─── TYPING EFFECT ───
  function typeText(el, text, speed = 40) {
    el.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    el.appendChild(cursor);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        cursor.insertAdjacentText('beforebegin', text[i]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => cursor.remove(), 1500);
      }
    }, speed);
  }

  // ─── HERO MOUSE TILT ───
  function initHeroTilt() {
    const content = document.getElementById('hero-content');
    if (!content) return;
    window.addEventListener('mousemove', e => {
      const xp = (e.clientX / window.innerWidth  - 0.5) * 8;
      const yp = (e.clientY / window.innerHeight - 0.5) * 5;
      gsap.to(content, {
        rotateX: -yp,
        rotateY: xp,
        duration: 1,
        ease: 'power2.out',
        transformPerspective: 1000
      });
    });
  }

  // ─── DYNAMIC LIGHTING ORBS ───
  function createLightingOrbs() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const orbs = [
      { w: '600px', h: '600px', x: '10%', y: '20%', c: 'rgba(122,47,190,0.04)', anim: 'floatOrb1 20s ease-in-out infinite' },
      { w: '400px', h: '400px', x: '70%', y: '60%', c: 'rgba(157,78,221,0.03)', anim: 'floatOrb2 25s ease-in-out infinite' },
      { w: '300px', h: '300px', x: '40%', y: '10%', c: 'rgba(199,125,255,0.03)', anim: 'floatOrb3 18s ease-in-out infinite' },
    ];
    orbs.forEach(o => {
      const orb = document.createElement('div');
      orb.style.cssText = `
        position:absolute; width:${o.w}; height:${o.h};
        left:${o.x}; top:${o.y};
        border-radius:50%;
        background:radial-gradient(circle, ${o.c} 0%, transparent 70%);
        pointer-events:none;
        animation:${o.anim};
        z-index:0;
      `;
      hero.appendChild(orb);
    });
  }

  // ─── INIT ───
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initEnterButton();
    initQuotes();
    initHeroTilt();
    createLightingOrbs();

    const ep = document.getElementById('easter-purple');
    if (ep) {
      ep.addEventListener('click', () => {
        window.showToast('كل سنة وإنتِ طيبة يا أحلى واحدة عرفتها في حياتي', 6000);
        if (window.MusicEngine) window.MusicEngine.sfxReveal();
      });
    }
  });
})();