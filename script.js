/* ================================================
   主页 - 黑色圆形自定义光标 + 标题文字切换 + 字符3D朝向
   ================================================ */

(() => {
  'use strict';

  const cursor = document.getElementById('cursor');
  const heroTitle = document.getElementById('heroTitle');
  const heroBrand = document.querySelector('.hero__brand');
  const heroLabel = document.querySelector('.hero__label');
  const heroNum = document.getElementById('heroNum');
  const header = document.querySelector('.header');
  if (!cursor) return;

  const ORIGINAL_TEXT = 'xiec 的 blog';
  const REVEAL_TEXT = '你好 我是谢承轩';

  let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let target = { x: pos.x, y: pos.y };
  let visible = false;
  let wasOver = false;
  let charsBuilt = false;

  // 隐藏系统光标
  document.body.style.cursor = 'none';
  const style = document.createElement('style');
  style.textContent = 'a, button, input, textarea, select { cursor: none !important; }';
  document.head.appendChild(style);

  // 将标题文字拆成单个字符 span
  function buildChars(text) {
    heroTitle.innerHTML = '';
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'hero__char';
      span.textContent = ch;
      heroTitle.appendChild(span);
    }
    charsBuilt = true;
  }

  // 恢复普通文字
  function restoreText() {
    heroTitle.innerHTML = '';
    heroTitle.textContent = ORIGINAL_TEXT;
    charsBuilt = false;
  }

  // 检测光标圆形是否与元素重叠（200px半径）
  function isCircleOverElement(mx, my, el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // 简化：检测元素中心到光标的距离是否在200px内
    const dx = mx - cx;
    const dy = my - cy;
    return Math.sqrt(dx * dx + dy * dy) < 200;
  }

  // 检测光标是否在导航栏区域
  function isOverHeader(mx, my) {
    if (!header) return false;
    const rect = header.getBoundingClientRect();
    return mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom;
  }

  // 检测光标是否在hero内容区域内（包括标题+小字）
  function isOverHeroArea(mx, my) {
    if (!heroTitle) return false;
    const rect = heroTitle.getBoundingClientRect();
    const expand = 120;
    return mx >= rect.left - expand && mx <= rect.right + expand && my >= rect.top - expand && my <= rect.bottom + expand;
  }

  // 更新每个字符的3D旋转 + 位置偏移
  function updateCharRotation(mx, my) {
    const chars = heroTitle.querySelectorAll('.hero__char');
    chars.forEach((char) => {
      const rect = char.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // 距离越近旋转越大，最大30度
      const maxAngle = 30;
      const clampedDist = Math.max(dist, 30);
      const factor = Math.min(maxAngle / clampedDist, 1) * maxAngle;
      const rotateY = (dx / clampedDist) * factor;
      const rotateX = -(dy / clampedDist) * factor;
      // 位置偏移：向光标方向微移，最大40px
      const offsetMax = 40;
      const offsetFactor = Math.min(offsetMax / clampedDist, 1) * offsetMax;
      const tx = (dx / clampedDist) * offsetFactor;
      const ty = (dy / clampedDist) * offsetFactor;
      char.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translate(${tx}px, ${ty}px)`;
    });
  }

  // 更新普通元素的视差偏移（hero__brand, hero__label, hero__num）
  function updateElementOffset(mx, my, el, intensity = 50) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.max(dist, 50);
    const factor = Math.min(intensity / clampedDist, 1) * intensity;
    const tx = (dx / clampedDist) * factor;
    const ty = (dy / clampedDist) * factor;
    el.style.transform = `translate(${tx}px, ${ty}px)`;
  }

  function resetElementOffset(el) {
    if (!el) return;
    el.style.transform = '';
  }

  let wasOverHeader = false;

  // 鼠标移动
  window.addEventListener('mousemove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;

    const overHeader = isOverHeader(e.clientX, e.clientY);

    if (overHeader) {
      // 导航栏内：隐藏自定义光标，恢复系统光标
      cursor.style.opacity = '0';
      document.body.style.cursor = '';
      wasOverHeader = true;
      return;
    }

    // 离开导航栏：恢复自定义光标
    if (wasOverHeader) {
      document.body.style.cursor = 'none';
      wasOverHeader = false;
    }

    if (!visible) {
      visible = true;
      cursor.style.opacity = '1';
    }

    const over = isOverHeroArea(e.clientX, e.clientY);
    if (over && !wasOver) {
      // 进入区域
      buildChars(REVEAL_TEXT);
      heroTitle.style.color = '#fff';
      if (heroBrand) heroBrand.style.color = '#fff';
      if (heroLabel) heroLabel.style.color = '#fff';
      if (heroNum) heroNum.style.color = '#fff';
      wasOver = true;
    } else if (!over && wasOver) {
      // 离开区域
      restoreText();
      heroTitle.style.color = '#111';
      if (heroBrand) heroBrand.style.color = '';
      if (heroLabel) heroLabel.style.color = '';
      if (heroNum) heroNum.style.color = '';
      wasOver = false;
    }

    if (over && charsBuilt) {
      updateCharRotation(e.clientX, e.clientY);
    }

    // 始终更新所有元素的视差偏移
    if (over) {
      updateElementOffset(e.clientX, e.clientY, heroBrand, 50);
      updateElementOffset(e.clientX, e.clientY, heroLabel, 50);
      updateElementOffset(e.clientX, e.clientY, heroNum, 50);
    } else {
      resetElementOffset(heroBrand);
      resetElementOffset(heroLabel);
      resetElementOffset(heroNum);
    }
  });

  // 鼠标离开窗口
  document.documentElement.addEventListener('mouseleave', () => {
    visible = false;
    cursor.style.opacity = '0';
  });

  // 鼠标进入窗口
  document.documentElement.addEventListener('mouseenter', () => {
    visible = true;
    cursor.style.opacity = '1';
  });

  // 动画循环
  const animate = () => {
    pos.x += (target.x - pos.x) * 0.18;
    pos.y += (target.y - pos.y) * 0.18;
    cursor.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  };
  animate();

})();
