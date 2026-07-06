/**
 * 社交页入场动画 — 扑克牌摊开效果（扇形层叠）
 *
 * 核心策略：单一 rAF 循环驱动整个动画，所有视觉变化通过 transform/opacity 实现，
 * 不触碰 left/top（避免 layout thrashing），动画结束最后才用 transition 平滑收尾。
 */
(function () {
  const grid = document.querySelector('.social__grid');
  const cards = document.querySelectorAll('.social__card');
  if (!grid || cards.length === 0) return;

  let ran = false;

  // ========== 配置 ==========
  const CARD_W = 200;
  const OVERLAP = 80;
  const FAN_Y = [48, 24, 8, 0, 0, 8, 24, 48];

  // ========== 光标视差偏移 ==========
  function setupParallax(items, cardHeight) {
    const gridEl = grid;

    // 为每张卡片保存基准位置（left/top），用于计算偏移
    const basePositions = items.map((it) => {
      const c = it.card;
      return {
        card: c,
        i: it.i,
        baseLeft: parseFloat(c.style.left),
        baseTop: parseFloat(c.style.top),
      };
    });

    const mid = (items.length - 1) / 2;

    document.addEventListener('mousemove', (e) => {
      // 计算光标相对于视口中心的偏移比例 (-1 ~ 1)
      const cx = e.clientX / window.innerWidth;   // 0 ~ 1
      const cy = e.clientY / window.innerHeight;  // 0 ~ 1

      // 转换为 -1 ~ 1 范围（中心为 0）
      const ox = (cx - 0.5) * 2;
      const oy = (cy - 0.5) * 2;

      // 最大偏移量
      const MAX_X = 28;
      const MAX_Y = 16;

      basePositions.forEach((bp) => {
        const c = bp.card;
        // 跳过正在 hover 的卡片（其 transform 由 hover 逻辑接管）
        if (c.dataset.hovered === '1') return;

        // 不同卡片偏移幅度略微不同，越远离中心偏移越大（层次感）
        const distFactor = 1 + Math.abs(bp.i - mid) * 0.12;
        const dx = ox * MAX_X * distFactor;
        const dy = oy * MAX_Y * distFactor;

        c.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    });
  }

  // ========== Hover 联动：当前卡片抽出上移，相邻卡片向两侧推开 ==========
  function setupHover(items) {
    items.forEach((it) => {
      const card = it.card;

      card.addEventListener('mouseenter', () => {
        // 标记当前卡片正在 hover，视差偏移跳过它
        card.dataset.hovered = '1';

        // 当前卡片：向上抽出约一张卡片的高度，跳出牌堆 + 提升 z-index + 深阴影
        card.style.transform = 'translateY(-140px) scale(1.06)';
        card.style.zIndex = '999';
        card.style.boxShadow = '0 40px 100px rgba(0,0,0,0.25)';
        card.style.borderColor = '#dba460';

        // 左邻（i-1）：上移 + 向左推开足够距离，给当前卡片腾出空间
        if (it.i > 0) {
          const left = items[it.i - 1].card;
          left.dataset.hovered = '1';
          left.style.transform = 'translateY(-20px) translateX(-40px)';
          left.style.zIndex = '500';
          left.style.boxShadow = '0 10px 28px rgba(0,0,0,0.06)';
        }
        // 右邻（i+1）：上移 + 向右推开足够距离，给当前卡片腾出空间
        if (it.i < items.length - 1) {
          const right = items[it.i + 1].card;
          right.dataset.hovered = '1';
          right.style.transform = 'translateY(-20px) translateX(40px)';
          right.style.zIndex = '500';
          right.style.boxShadow = '0 10px 28px rgba(0,0,0,0.06)';
        }
      });

      card.addEventListener('mouseleave', () => {
        // 清除 hover 标记
        card.dataset.hovered = '';
        if (it.i > 0) items[it.i - 1].card.dataset.hovered = '';
        if (it.i < items.length - 1) items[it.i + 1].card.dataset.hovered = '';

        // 还原当前卡片（transform 置空，由 CSS transition 接管平滑回位）
        card.style.transform = '';
        card.style.zIndex = String(200 - it.i);
        card.style.boxShadow = '';
        card.style.borderColor = '';

        // 还原左邻
        if (it.i > 0) {
          const left = items[it.i - 1].card;
          left.style.transform = '';
          left.style.zIndex = String(200 - (it.i - 1));
          left.style.boxShadow = '';
        }
        // 还原右邻
        if (it.i < items.length - 1) {
          const right = items[it.i + 1].card;
          right.style.transform = '';
          right.style.zIndex = String(200 - (it.i + 1));
          right.style.boxShadow = '';
        }
      });
    });
  }

  function init() {
    if (ran) return;
    ran = true;

    const total = cards.length;
    const visiblePerCard = CARD_W - OVERLAP;       // 80
    const mid = (total - 1) / 2;                    // 3.5

    // 网格位置（视口坐标）
    const gridRect = grid.getBoundingClientRect();
    const centerX = gridRect.left + gridRect.width / 2;
    const baseY = gridRect.top + 60;
    const cardHeight = cards[0].getBoundingClientRect().height;

    // 堆叠起点：页面下方（视口底部下方，卡片从底部飞入）
    const sx = centerX;
    const sy = window.innerHeight + cardHeight;

    // 准备 items：用 transform 偏移表达位置，原点设在卡片左上角
    const items = Array.from(cards).map((card, i) => {
      const targetCx = centerX - CARD_W / 2 + (i - mid) * visiblePerCard + CARD_W / 2;
      const targetCy = baseY + (FAN_Y[i] || 0) + cardHeight / 2;
      return { card, i, targetCx, targetCy };
    });

    // ========== 初始状态：页面下方堆叠，从底部进入 ==========
    items.forEach((it) => {
      const c = it.card;
      c.style.position = 'fixed';
      c.style.left = (sx - CARD_W / 2) + 'px';
      c.style.top = (sy - cardHeight / 2) + 'px';
      c.style.width = CARD_W + 'px';
      c.style.height = cardHeight + 'px';
      c.style.margin = '0';
      c.style.zIndex = 200 - it.i;
      c.style.pointerEvents = 'none';
      c.style.transition = 'none';
      c.style.willChange = 'transform, opacity';
      c.style.transformOrigin = 'center center';
      c.style.opacity = '0';
      c.style.transform = 'translate3d(0,0,0) scale(0.6)';
    });

    grid.classList.add('is-entering');

    // ========== 动画参数 ==========
    const T_RISE = 1200;       // 卡片从底部飞入到中心堆叠位置
    const T_HOLD = 400;        // 短暂保持
    const STAGGER = 100;       // 摊开时卡片错开延迟
    const T_SPREAD = 700;      // 扇形摊开持续时间
    const totalDur = T_RISE + T_HOLD + Math.floor(mid) * STAGGER + T_SPREAD;

    const t0 = performance.now();

    // 堆叠时卡片在页面中心的目标位置（中间态）
    const stackCenterY = baseY + cardHeight / 2;

    // ========== 单一 rAF 循环驱动整个动画 ==========
    function tick(now) {
      const elapsed = now - t0;

      if (elapsed < T_RISE) {
        // 阶段 1：卡片从页面下方飞入，堆叠在页面中心，同时渐显 + 放大 + 旋转
        const t = elapsed / T_RISE;
        const ease = 1 - Math.pow(1 - t, 3.5); // easeOutCubic
        const o = Math.min(ease * 2, 1);       // 前半段渐显完
        const s = 0.6 + ease * 0.4;            // scale 0.6 → 1
        const dy = (stackCenterY - sy) * ease;  // 从底部向上飞到中心
        items.forEach((it) => {
          // 旋转角度：越远离中心旋转越大，随进度逐渐归零
          const maxRot = (it.i - mid) * 18;    // 中心 0°，两侧最多 ±63°
          const rot = maxRot * (1 - ease);     // ease 0→1 时 rot 从 maxRot→0
          it.card.style.transform =
            `translate3d(0, ${dy}px, 0) scale(${s}) rotate(${rot}deg)`;
          it.card.style.opacity = String(o);
        });
        requestAnimationFrame(tick);
        return;
      }

      if (elapsed < T_RISE + T_HOLD) {
        // 阶段 2：在中心堆叠位置短暂保持（旋转已归零）
        items.forEach((it) => {
          it.card.style.transform =
            `translate3d(0, ${stackCenterY - sy}px, 0) scale(1) rotate(0deg)`;
          it.card.style.opacity = '1';
        });
        requestAnimationFrame(tick);
        return;
      }

      if (elapsed < totalDur) {
        // 阶段 3：扇形摊开 — 卡片从中心飞向各自目标位置
        items.forEach((it) => {
          const dist = Math.abs(it.i - mid);
          let delay = 0;
          if (dist > 0.5) {
            delay = Math.floor(dist - 0.5) * STAGGER;
          }
          const slideStart = T_RISE + T_HOLD + delay;
          const slideEnd = slideStart + T_SPREAD;

          if (elapsed < slideStart) return;

          if (elapsed >= slideEnd) {
            // 精确到达目标
            it.card.style.transform =
              `translate3d(${it.targetCx - sx}px, ${it.targetCy - sy}px, 0) scale(1) rotate(0deg)`;
            return;
          }
          // 摊开中：从堆叠中心位置 → 目标位置
          const t = (elapsed - slideStart) / T_SPREAD;
          const e = 1 - Math.pow(1 - t, 3.2);
          const dx = (it.targetCx - sx) * e;
          const dySpread = (it.targetCy - stackCenterY) * e;
          const dy = (stackCenterY - sy) + dySpread;
          it.card.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1) rotate(0deg)`;
        });

        // 所有卡片都到达目标位置后，延迟一帧再 finish
        const allDone = items.every((it) => {
          const dist = Math.abs(it.i - mid);
          const delay = dist > 0.5 ? Math.floor(dist - 0.5) * STAGGER : 0;
          return elapsed >= T_RISE + T_HOLD + delay + T_SPREAD;
        });

        if (allDone) {
          // 最后一帧：先确保所有卡片精确到目标 transform
          items.forEach((it) => {
            it.card.style.transform =
              `translate3d(${it.targetCx - sx}px, ${it.targetCy - sy}px, 0) scale(1) rotate(0deg)`;
            it.card.style.opacity = '1';
          });
          // 等浏览器渲染完这帧后，再切换到 left/top 定位
          requestAnimationFrame(() => finish());
          return;
        }

        requestAnimationFrame(tick);
        return;
      }
    }

    function finish() {
      // 先禁用所有 transition，防止切换 left/top 时产生过渡动画
      items.forEach((it) => { it.card.style.transition = 'none'; });

      // 立即切换到 left/top 定位（无过渡，精确对齐）
      items.forEach((it) => {
        const c = it.card;
        c.style.willChange = '';
        c.style.left = (it.targetCx - CARD_W / 2) + 'px';
        c.style.top = (it.targetCy - cardHeight / 2) + 'px';
        c.style.transform = '';
        c.style.opacity = '1';
        c.style.zIndex = 200 - it.i;
        c.style.pointerEvents = 'auto';
      });

      // 等浏览器渲染完这帧后，再启用 hover 用的 transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          items.forEach((it) => {
            it.card.style.transition =
              'transform 0.4s cubic-bezier(.22,1,.36,1),' +
              'box-shadow 0.4s cubic-bezier(.22,1,.36,1),' +
              'border-color 0.4s ease';
          });
        });
      });

      grid.classList.add('is-spread');
      grid.classList.add('is-done');
      grid.classList.remove('is-entering');

      // ========== Hover 联动 ==========
      setupHover(items);

      // ========== 光标视差偏移 ==========
      setupParallax(items, cardHeight);
    }

    requestAnimationFrame(tick);

    // 安全网：万一 raf 出问题，setTimeout 兜底
    setTimeout(finish, totalDur + 100);
  }

  // ========== resize 重新定位 ==========
  let rt;
  window.addEventListener('resize', () => {
    if (!ran) return;
    clearTimeout(rt);
    rt = setTimeout(() => {
      const gr = grid.getBoundingClientRect();
      const cx = gr.left + gr.width / 2;
      const by = gr.top + 60;
      const total = cards.length;
      const mid = (total - 1) / 2;
      const visiblePerCard = CARD_W - OVERLAP;
      const ch = cards[0].getBoundingClientRect().height;
      cards.forEach((card, i) => {
        const targetCx = cx + (i - mid) * visiblePerCard;
        const targetCy = by + (FAN_Y[i] || 0) + ch / 2;
        card.style.left = (targetCx - CARD_W / 2) + 'px';
        card.style.top = (targetCy - ch / 2) + 'px';
      });
    }, 200);
  });

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 350));
  } else {
    setTimeout(init, 350);
  }
})();
