// === Nav + Progress behavior, shared across pages ===

(function() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  // Scroll-aware nav hide/show
  let lastScrollY = window.scrollY;
  let ticking = false;
  const HIDE_THRESHOLD = 80;   // 滚到 80px 之后才允许隐藏
  const SCROLL_DELTA = 6;      // 滚动至少 6px 才触发状态变化（避免抖动）
  let isHoveringTop = false;

  function onScroll() {
    const currentY = window.scrollY;
    const diff = currentY - lastScrollY;

    // scrolled 状态（导航底色出现）
    nav.classList.toggle('scrolled', currentY > 8);

    if (Math.abs(diff) > SCROLL_DELTA) {
      if (currentY > HIDE_THRESHOLD && diff > 0 && !isHoveringTop) {
        // 向下滚动 + 已经过了阈值 + 鼠标不在顶部 → 隐藏
        nav.classList.add('hidden');
      } else if (diff < 0 || currentY <= HIDE_THRESHOLD) {
        // 向上滚动 或 在页面顶部 → 显示
        nav.classList.remove('hidden');
      }
      lastScrollY = currentY;
    }

    // 阅读进度条
    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (currentY / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    }

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });

  // Hover trigger zone (桌面端): 鼠标移到顶部 80px 区域时唤醒导航
  // 只在能 hover 的设备上启用（@media hover: hover）
  if (window.matchMedia('(hover: hover)').matches) {
    const hoverZone = document.createElement('div');
    hoverZone.className = 'nav-hover-zone';
    document.body.appendChild(hoverZone);

    hoverZone.addEventListener('mouseenter', () => {
      isHoveringTop = true;
      nav.classList.remove('hidden');
    });
    hoverZone.addEventListener('mouseleave', () => {
      isHoveringTop = false;
    });

    // 鼠标离开导航本身时也允许重新隐藏（避免一直停在那里）
    nav.addEventListener('mouseenter', () => { isHoveringTop = true; });
    nav.addEventListener('mouseleave', () => { isHoveringTop = false; });
  }

  // === Reading progress bar (仅详情页) ===
  // 通过 data-progress="true" 标记，在详情页 body 上加这个属性即可启用
  let progressBar = null;
  if (document.body.dataset.progress === 'true') {
    progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);
  }

  onScroll();
})();
