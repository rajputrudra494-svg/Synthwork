/* ============================================
   SynthWork — Portfolio Page Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initPortfolioFilter();
});

function initPortfolioFilter() {
  const filterBar = document.getElementById('filterBar');
  const grid = document.getElementById('portfolioGrid');
  const empty = document.getElementById('portfolioEmpty');

  if (!filterBar || !grid) return;

  const buttons = filterBar.querySelectorAll('.filter-btn');
  const items = grid.querySelectorAll('.portfolio-item');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active state
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter items
      let visibleCount = 0;

      items.forEach((item, index) => {
        const category = item.dataset.category;
        const shouldShow = filter === 'all' || category === filter;

        if (shouldShow) {
          item.classList.remove('hidden');
          item.style.transitionDelay = (visibleCount * 0.05) + 's';
          visibleCount++;
        } else {
          item.classList.add('hidden');
          item.style.transitionDelay = '0s';
        }
      });

      // Show/hide empty state
      if (empty) {
        empty.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    });
  });
}
