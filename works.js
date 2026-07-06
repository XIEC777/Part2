/* ================================================
   作品页 - 筛选交互 & 灯箱脚本
   ================================================ */

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // ========== 公共引用 ==========
    const cards = document.querySelectorAll('.works__card');
    const filterBtns = document.querySelectorAll('.works__filter');

    // ========== 灯箱（提前声明，供轮播图复用）==========
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

    function getVisibleCardsWithMedia() {
      return Array.from(cards).filter(card => {
        if (card.classList.contains('is-hidden')) return false;
        const media = card.querySelector('.works__card-img');
        return media && (media.src || media.tagName === 'VIDEO');
      });
    }

    function updateLightboxContent() {
      if (currentIndex < 0 || currentIndex >= visibleCards.length) return;
      const card = visibleCards[currentIndex];
      const media = card.querySelector('.works__card-img');
      const tag = card.querySelector('.works__card-tag');
      const title = card.querySelector('.works__card-title');
      const desc = card.querySelector('.works__card-desc');

      if (media) {
        if (media.tagName === 'VIDEO') {
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

    function updateNavButtons() {
      lightboxPrev.style.display = visibleCards.length > 1 ? '' : 'none';
      lightboxNext.style.display = visibleCards.length > 1 ? '' : 'none';
    }

    function openLightbox(index) {
      visibleCards = getVisibleCardsWithMedia();
      if (visibleCards.length === 0) return;
      currentIndex = Math.max(0, Math.min(index, visibleCards.length - 1));
      updateLightboxContent();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      updateNavButtons();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      const lbVideo = lightbox.querySelector('video');
      if (lbVideo) lbVideo.pause();
      currentIndex = -1;
    }

    // 灯箱按钮事件
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

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__overlay').addEventListener('click', closeLightbox);

    // ========== 轮播图 ==========
    const carousel = document.getElementById('worksCarousel');
    if (carousel) {
      const track = document.getElementById('carouselTrack');
      const slides = track.querySelectorAll('.carousel__slide');
      const dotsContainer = document.getElementById('carouselDots');
      const prevBtn = document.getElementById('carouselPrev');
      const nextBtn = document.getElementById('carouselNext');
      const totalSlides = slides.length;

      let currentSlide = 0;
      let autoPlayTimer;
      let isTransitioning = false;

      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot';
        dot.setAttribute('aria-label', `第${i + 1}张`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }
      const dots = dotsContainer.querySelectorAll('.carousel__dot');

      function updateCarousel() {
        slides.forEach((slide, i) => {
          slide.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');
          if (i === currentSlide) {
            slide.classList.add('is-active');
          } else if (i === (currentSlide - 1 + totalSlides) % totalSlides) {
            slide.classList.add('is-prev');
          } else if (i === (currentSlide + 1) % totalSlides) {
            slide.classList.add('is-next');
          } else {
            slide.classList.add('is-hidden');
          }
        });
        dots.forEach((d, i) => d.classList.toggle('is-active', i === currentSlide));
      }

      function goToSlide(index) {
        if (isTransitioning || index === currentSlide) return;
        if (index < 0 || index >= totalSlides) return;
        isTransitioning = true;
        currentSlide = index;
        updateCarousel();
        setTimeout(() => { isTransitioning = false; }, 600);
        resetAutoPlay();
      }

      function nextSlide() {
        const next = currentSlide + 1 >= totalSlides ? 0 : currentSlide + 1;
        goToSlide(next);
      }

      function prevSlide() {
        const prev = currentSlide - 1 < 0 ? totalSlides - 1 : currentSlide - 1;
        goToSlide(prev);
      }

      function startAutoPlay() {
        autoPlayTimer = setInterval(nextSlide, 4000);
      }

      function resetAutoPlay() {
        clearInterval(autoPlayTimer);
        startAutoPlay();
      }

      prevBtn.addEventListener('click', prevSlide);
      nextBtn.addEventListener('click', nextSlide);

      carousel.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
      carousel.addEventListener('mouseleave', startAutoPlay);

      let touchStartX = 0;
      let touchEndX = 0;
      carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? nextSlide() : prevSlide();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (!carousel.matches(':hover')) return;
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
      });

      // ========== 轮播图卡片点击打开灯箱 ==========
      function openCarouselLightbox(slide) {
        const img = slide.querySelector('.carousel__inner img');
        if (!img) return;
        const slideSrc = img.getAttribute('src');
        // 在网格卡片中查找匹配的图片
        let matchedCard = null;
        cards.forEach(card => {
          const cardImg = card.querySelector('.works__card-img');
          if (cardImg && cardImg.getAttribute('src') === slideSrc) {
            matchedCard = card;
          }
        });
        if (matchedCard) {
          const allVisible = Array.from(cards).filter(c => !c.classList.contains('is-hidden') && c.querySelector('.works__card-img')?.src);
          const idx = allVisible.indexOf(matchedCard);
          if (idx >= 0) {
            visibleCards = allVisible;
            openLightbox(idx);
          }
        } else {
          // 没有匹配的网格卡片，直接用轮播图数据打开
          const tagEl = slide.querySelector('.carousel__tag');
          const titleEl = slide.querySelector('.carousel__caption h3');
          const tag = tagEl ? tagEl.textContent : '';
          const title = titleEl ? titleEl.textContent : '';
          lightboxImg.style.display = '';
          lightboxImg.src = slideSrc;
          lightboxImg.alt = title;
          lightboxImg.style.transform = '';
          lightboxTag.textContent = tag || '';
          lightboxTitle.textContent = title || '';
          lightboxDesc.style.display = 'none';
          const existingVideo = lightbox.querySelector('.lightbox__video');
          if (existingVideo) existingVideo.remove();
          lightbox.classList.add('is-open');
          document.body.style.overflow = 'hidden';
          visibleCards = [];
          currentIndex = 0;
          lightboxPrev.style.display = 'none';
          lightboxNext.style.display = 'none';
        }
      }

      slides.forEach(slide => {
        slide.addEventListener('click', (e) => {
          e.stopPropagation();
          openCarouselLightbox(slide);
        });
      });

      // ========== 鼠标视差效果 ==========
      const parallaxMaxTilt = 20;
      const parallaxMaxShift = 24;
      const sideParallaxTilt = 12;
      const sideParallaxShift = 14;

      carousel.addEventListener('mousemove', (e) => {
        const rect = carousel.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 2 - 1;
        const y = (e.clientY - rect.top) / rect.height * 2 - 1;

        const activeSlide = track.querySelector('.carousel__slide.is-active');
        if (activeSlide) {
          const activeInner = activeSlide.querySelector('.carousel__inner');
          if (activeInner) {
            const rotateY = x * parallaxMaxTilt;
            const rotateX = -y * parallaxMaxTilt;
            const translateX = x * parallaxMaxShift;
            const translateY = y * parallaxMaxShift;
            activeInner.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateX(${translateX}px) translateY(${translateY}px)`;
            activeInner.style.boxShadow = `
              ${-x * 12}px ${-y * 12}px 40px rgba(0,0,0,0.12),
              inset 0 1px 0 rgba(255,255,255,0.4)
            `;
          }
        }

        const prevSlideEl = track.querySelector('.carousel__slide.is-prev');
        if (prevSlideEl) {
          const prevInner = prevSlideEl.querySelector('.carousel__inner');
          if (prevInner) {
            const pRotateY = x * sideParallaxTilt;
            const pRotateX = -y * sideParallaxTilt;
            const pShiftX = x * sideParallaxShift;
            const pShiftY = y * sideParallaxShift;
            prevInner.style.transform = `rotateY(${pRotateY}deg) rotateX(${pRotateX}deg) translateX(${pShiftX}px) translateY(${pShiftY}px)`;
          }
        }

        const nextSlideEl = track.querySelector('.carousel__slide.is-next');
        if (nextSlideEl) {
          const nextInner = nextSlideEl.querySelector('.carousel__inner');
          if (nextInner) {
            const nRotateY = x * sideParallaxTilt;
            const nRotateX = -y * sideParallaxTilt;
            const nShiftX = x * sideParallaxShift;
            const nShiftY = y * sideParallaxShift;
            nextInner.style.transform = `rotateY(${nRotateY}deg) rotateX(${nRotateX}deg) translateX(${nShiftX}px) translateY(${nShiftY}px)`;
          }
        }
      });

      carousel.addEventListener('mouseleave', () => {
        const allInners = track.querySelectorAll('.carousel__inner');
        allInners.forEach(inner => {
          inner.style.transform = '';
          inner.style.boxShadow = '';
        });
      });

      updateCarousel();
      startAutoPlay();
    }

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

    // ========== 网格卡片点击打开灯箱 ==========
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        visibleCards = getVisibleCardsWithMedia();
        const idx = visibleCards.indexOf(card);
        if (idx >= 0) {
          openLightbox(idx);
        }
      });
    });
  });
})();
