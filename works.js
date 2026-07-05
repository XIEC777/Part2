/* ================================================
   作品页 - 筛选交互 & 灯箱脚本
   ================================================ */

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.works__filter');
    const cards = document.querySelectorAll('.works__card');

    // ========== 筛选 ==========
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.dataset.filter;

        cards.forEach(card => {
          if (filter === 'all') {
            card.classList.remove('is-hidden');
          } else {
            const categories = card.dataset.category.split(' ');
            if (categories.includes(filter)) {
              card.classList.remove('is-hidden');
            } else {
              card.classList.add('is-hidden');
            }
          }
        });
      });
    });

    // ========== 灯箱 ==========
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTag = document.getElementById('lightboxTag');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let currentIndex = -1;
    let visibleCards = [];

    // 获取所有可见且有媒体内容的卡片
    function getVisibleCardsWithMedia() {
      return Array.from(cards).filter(card => {
        if (card.classList.contains('is-hidden')) return false;
        const media = card.querySelector('.works__card-img');
        return media && (media.src || media.tagName === 'VIDEO');
      });
    }

    // 打开灯箱
    function openLightbox(index) {
      visibleCards = getVisibleCardsWithMedia();
      if (visibleCards.length === 0) return;
      currentIndex = Math.max(0, Math.min(index, visibleCards.length - 1));
      updateLightboxContent();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      updateNavButtons();
    }

    // 关闭灯箱
    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      // 停止灯箱中的视频
      const lbVideo = lightbox.querySelector('video');
      if (lbVideo) lbVideo.pause();
      currentIndex = -1;
    }

    // 更新灯箱内容
    function updateLightboxContent() {
      if (currentIndex < 0 || currentIndex >= visibleCards.length) return;
      const card = visibleCards[currentIndex];
      const media = card.querySelector('.works__card-img');
      const tag = card.querySelector('.works__card-tag');
      const title = card.querySelector('.works__card-title');
      const desc = card.querySelector('.works__card-desc');

      if (media) {
        if (media.tagName === 'VIDEO') {
          // 视频：在灯箱中创建 video 元素
          const existingVideo = lightbox.querySelector('.lightbox__video');
          if (existingVideo) existingVideo.remove();
          const video = document.createElement('video');
          video.className = 'lightbox__video';
          video.src = media.querySelector('source') ? media.querySelector('source').src : media.src;
          video.autoplay = true;
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.controls = true;
          video.style.maxWidth = '100%';
          video.style.maxHeight = '78vh';
          video.style.borderRadius = '8px';
          video.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
          lightboxImg.style.display = 'none';
          lightboxImg.parentElement.appendChild(video);
        } else {
          // 图片
          const existingVideo = lightbox.querySelector('.lightbox__video');
          if (existingVideo) existingVideo.remove();
          lightboxImg.style.display = '';
          lightboxImg.src = media.src;
          lightboxImg.alt = media.alt;
          if (media.classList.contains('works__card-img--flip')) {
            lightboxImg.style.transform = 'rotate(180deg)';
          } else {
            lightboxImg.style.transform = '';
          }
        }
      }
      if (tag) lightboxTag.textContent = tag.textContent;
      if (title) lightboxTitle.textContent = title.textContent;
      if (desc) {
        lightboxDesc.textContent = desc.textContent;
        lightboxDesc.style.display = '';
      } else {
        lightboxDesc.style.display = 'none';
      }
    }

    // 上一张/下一张按钮
    function updateNavButtons() {
      lightboxPrev.style.display = visibleCards.length > 1 ? '' : 'none';
      lightboxNext.style.display = visibleCards.length > 1 ? '' : 'none';
    }

    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentIndex > 0) {
        currentIndex--;
        updateLightboxContent();
      }
    });

    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentIndex < visibleCards.length - 1) {
        currentIndex++;
        updateLightboxContent();
      }
    });

    // 键盘导航
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        currentIndex--;
        updateLightboxContent();
      }
      if (e.key === 'ArrowRight' && currentIndex < visibleCards.length - 1) {
        currentIndex++;
        updateLightboxContent();
      }
    });

    // 关闭按钮
    lightboxClose.addEventListener('click', closeLightbox);

    // 点击遮罩关闭
    lightbox.querySelector('.lightbox__overlay').addEventListener('click', closeLightbox);

    // 为每张卡片绑定点击事件
    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        visibleCards = getVisibleCardsWithMedia();
        // 找到该卡片在可见卡片中的索引
        const idx = visibleCards.indexOf(card);
        if (idx >= 0) {
          openLightbox(idx);
        }
      });
    });
  });
})();
