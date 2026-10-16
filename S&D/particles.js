/* ═══════════════════════════════════════════════
   particles.js — Advanced Canvas Particle System
   Floating Twilight Stars + Hyperspace Warp Speed Engine
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  // زيادة عدد النجوم بناءً على حجم الشاشة لتغطية الخلفية بكثافة فخمة
  const COUNT = window.innerWidth < 600 ? 150 : 350; 
  let isWarpSpeedActive = false; 

  function resize() { 
    W = canvas.width = window.innerWidth; 
    H = canvas.height = window.innerHeight; 
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.r = Math.random() * 2 + 0.4; // أحجام متفاوتة للنجوم لإعطاء عمق
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = -(Math.random() * 0.3 + 0.05);
      
      // إعدادات اللمعان (Twinkle) في الوضع الطبيعي
      this.alpha = Math.random() * 0.5 + 0.2;
      this.twinkleSpeed = Math.random() * 0.02 + 0.005;
      this.phase = Math.random() * Math.PI * 2;

      // إحداثيات الانفجار الكوني لسرعة الضوء (تنطلق بصعق من السنتر لبرة)
      this.warpX = W / 2;
      this.warpY = H / 2;
      const angle = Math.random() * Math.PI * 2;
      // زيادة سرعة الانطلاق لإعطاء تأثير الـ Hyperspace الحقيقي
      const speed = Math.random() * 12 + 6; 
      this.warpVx = Math.cos(angle) * speed;
      this.warpVy = Math.sin(angle) * speed;
    }

    update(t) {
      if (isWarpSpeedActive) {
        // تحديث إحداثيات سرعة الضوء المتسارعة للخارج
        this.warpX += this.warpVx;
        this.warpY += this.warpVy;
        // تسارع تدريجي خفيف للخطوط أثناء الطيران
        this.warpVx *= 1.02;
        this.warpVy *= 1.02;

        // إعادة تدوير النجم لو خرج برة الشاشة لتستمر القفزة بشكل لانهائي
        if (this.warpX < 0 || this.warpX > W || this.warpY < 0 || this.warpY > H) {
          this.warpX = W / 2;
          this.warpY = H / 2;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 12 + 6;
          this.warpVx = Math.cos(angle) * speed;
          this.warpVy = Math.sin(angle) * speed;
        }
      } else {
        // الوضع الطبيعي: حركة عائمة ناعمة مع لمعان متذبذب خفيف
        this.y += this.vy;
        this.x += this.vx;
        this.phase += this.twinkleSpeed;
        
        if (this.y < -20 || this.x < -20 || this.x > W + 20) {
          this.reset(false);
        }
      }
    }

    draw(t) {
      if (isWarpSpeedActive) {
        // رسم خط ضوئي متدرج الألوان (Hyperspace Glow Trail)
        ctx.beginPath();
        ctx.moveTo(this.warpX, this.warpY);
        // طول الخط يمتد بناءً على سرعته الحالية لإعطاء تأثير مطاطي سينمائي
        ctx.lineTo(this.warpX - this.warpVx * 1.8, this.warpY - this.warpVy * 1.8);
        
        // صناعة تدرج لوني للخط (أبيض في السنتر ويتلاشى بنفسجي نيون برة)
        const grad = ctx.createLinearGradient(
          this.warpX, this.warpY, 
          this.warpX - this.warpVx * 1.8, this.warpY - this.warpVy * 1.8
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#c084fc');
        grad.addColorStop(1, 'rgba(107, 33, 168, 0)');
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.r * 1.2;
        ctx.lineCap = 'round';
        ctx.stroke();
      } else {
        // رسم النجم العادي في الأيام العادية بلمعان متذبذب مريح للعين
        ctx.beginPath();
        const currentAlpha = this.alpha * (0.6 + 0.4 * Math.sin(this.phase));
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${currentAlpha})`;
        ctx.fill();
      }
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
    window.addEventListener('resize', resize);
  }

  let time = 0;
  function loop() {
    // ترك أثر خفيف جداً في الـ ClearRect لخلق Motion Blur ناعم في الأنيميشن
    ctx.fillStyle = isWarpSpeedActive ? 'rgba(24, 15, 41, 0.25)' : 'rgba(248, 246, 252, 0)'; 
    ctx.clearRect(0, 0, W, H);
    
    time++;
    particles.forEach(p => { p.update(time); p.draw(time); });
    requestAnimationFrame(loop);
  }

  window.setParticleCosmicVortex = function (status) {
    isWarpSpeedActive = status;
    // عند العودة للوضع الطبيعي يتم إعادة تصفير النجوم عشان ما يحصلش قفزة فجائية
    if (!status) {
      particles.forEach(p => p.reset(true));
    }
  };

  document.addEventListener('DOMContentLoaded', () => { init(); loop(); });
})();