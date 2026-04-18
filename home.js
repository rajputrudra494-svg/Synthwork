/* ============================================
   SynthWork — Home Page Interactions
   ============================================ */

function initHome() {
  initHeroTyping();
  initParallaxOrbs();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHome);
} else {
  initHome();
}

// --- Typing animation for code block ---
function initHeroTyping() {
  const codeLines = document.querySelectorAll('.code-line');
  if (!codeLines.length) return;

  codeLines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(8px)';
    line.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateY(0)';
    }, 600 + i * 180);
  });
}

// --- Parallax effect on hero orbs following mouse ---
function initParallaxOrbs() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const orbs = hero.querySelectorAll('.hero-orb');

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    orbs.forEach((orb, i) => {
      const speed = (i + 1) * 15;
      orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
  });
}
