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

/* ============================================================
   Lightbox · 点击放大（全站 .work-figure 图）
   追加于文末，独立 IIFE，不影响既有逻辑
   ============================================================ */
(function () {
  function init() {
    if (document.querySelector('.lb-overlay')) return;           // 防重复初始化
    var figImgs = document.querySelectorAll('.work-figure img');
    if (!figImgs.length) return;

    var overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="lb-hint">点击图片可放至原始尺寸 · Esc 关闭</div>' +
      '<button class="lb-close" type="button" aria-label="关闭">&times;</button>' +
      '<div class="lb-stage"><img alt=""></div>' +
      '<div class="lb-caption"></div>';
    document.body.appendChild(overlay);

    var stage = overlay.querySelector('.lb-stage');
    var lbImg = overlay.querySelector('.lb-stage img');
    var cap = overlay.querySelector('.lb-caption');
    var closeBtn = overlay.querySelector('.lb-close');

    function open(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || '';
      cap.textContent = alt || '';
      overlay.classList.remove('is-actual');
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lb-lock');
      closeBtn.focus();
    }
    function close() {
      overlay.classList.remove('is-open');
      overlay.classList.remove('is-actual');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lb-lock');
      setTimeout(function () {
        if (!overlay.classList.contains('is-open')) lbImg.src = '';
      }, 260);
    }

    for (var i = 0; i < figImgs.length; i++) {
      (function (img) {
        img.addEventListener('click', function () {
          open(img.currentSrc || img.src, img.getAttribute('alt'));
        });
      })(figImgs[i]);
    }

    // 点图片：适应视口 <-> 原始尺寸 切换（阻止冒泡以免触发关闭）
    lbImg.addEventListener('click', function (e) {
      e.stopPropagation();
      overlay.classList.toggle('is-actual');
      stage.scrollTop = 0;
      stage.scrollLeft = 0;
    });
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      close();
    });
    // 点图片以外的遮罩区域：关闭
    overlay.addEventListener('click', function () { close(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
