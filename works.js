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

        // 实时查询所有卡片（包括动态添加的），而非使用初始快照
        const allCards = worksGrid.querySelectorAll('.works__card');
        allCards.forEach(card => {
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
    function bindCardClick(card) {
      card.addEventListener('click', () => {
        visibleCards = getVisibleCardsWithMedia();
        const idx = visibleCards.indexOf(card);
        if (idx >= 0) {
          openLightbox(idx);
        }
      });
    }

    cards.forEach(bindCardClick);

    // ========== 一键添加照片 ==========
    const addBtn = document.getElementById('worksAddBtn');
    const addModal = document.getElementById('addModal');
    const addModalClose = document.getElementById('addModalClose');
    const addForm = document.getElementById('addForm');
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview = document.getElementById('uploadPreview');
    const addSubmit = document.getElementById('addSubmit');
    const worksGrid = document.getElementById('worksGrid');
    const filterContainer = document.querySelector('.works__filters');
    const STORAGE_KEY = 'works_custom_photos';

    // 弹窗开关
    function openAddModal() {
      addModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      addForm.reset();
      uploadPreview.classList.remove('is-visible');
      uploadPreview.src = '';
      uploadPlaceholder.style.opacity = '1';
      addSubmit.disabled = true;
    }

    function closeAddModal() {
      addModal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    addBtn.addEventListener('click', openAddModal);
    addModalClose.addEventListener('click', closeAddModal);
    addModal.querySelector('.add-modal__overlay').addEventListener('click', closeAddModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && addModal.classList.contains('is-open')) {
        closeAddModal();
      }
    });

    // 上传区交互
    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = '#dba460';
      uploadZone.style.background = 'rgba(219, 164, 96, 0.05)';
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.style.borderColor = '#e0e0e0';
      uploadZone.style.background = '#fafafa';
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = '#e0e0e0';
      uploadZone.style.background = '#fafafa';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) handleFile(file);
    });

    let uploadedDataUrl = '';

    function handleFile(file) {
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        showToast('仅支持 JPG / PNG / WebP 格式');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('图片大小不能超过 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedDataUrl = e.target.result;
        uploadPreview.src = uploadedDataUrl;
        uploadPreview.classList.add('is-visible');
        uploadPlaceholder.style.opacity = '0';
        addSubmit.disabled = false;
      };
      reader.readAsDataURL(file);
    }

    // 表单验证
    const titleInput = document.getElementById('workTitle');
    titleInput.addEventListener('input', () => {
      addSubmit.disabled = !uploadedDataUrl || !titleInput.value.trim();
    });

    // 提交
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = titleInput.value.trim();
      const desc = document.getElementById('workDesc').value.trim();
      const category = addForm.querySelector('input[name="category"]:checked').value;
      const tagMap = { modeling: '建模', shooting: '拍摄', color: '调色', other: '其他' };
      const tag = tagMap[category] || '其他';

      if (!title || !uploadedDataUrl) {
        showToast('请填写作品名称并上传图片');
        return;
      }

      addWorkToGrid({ title, desc, category, tag, dataUrl: uploadedDataUrl, id: Date.now() });
      saveToStorage();
      closeAddModal();
      showToast('作品添加成功！');
    });

    // 创建卡片 DOM
    function createCard(work) {
      const article = document.createElement('article');
      article.className = 'works__card fade-in';
      article.setAttribute('data-category', work.category);
      article.setAttribute('data-id', work.id);
      article.innerHTML = `
        <div class="works__card-media">
          <img class="works__card-img" src="${work.dataUrl}" alt="${work.title}" loading="lazy" />
        </div>
        <div class="works__card-info">
          <span class="works__card-tag">${work.tag}</span>
          <h3 class="works__card-title">${work.title}</h3>
          ${work.desc ? `<p class="works__card-desc">${work.desc}</p>` : ''}
        </div>
      `;
      return article;
    }

    // 添加到网格
    function addWorkToGrid(work) {
      const card = createCard(work);
      worksGrid.appendChild(card);
      bindCardClick(card);
      // 重新触发筛选（如果当前不是"全部"）
      const activeFilter = filterContainer.querySelector('.works__filter.is-active');
      if (activeFilter && activeFilter.dataset.filter !== 'all') {
        const filter = activeFilter.dataset.filter;
        const categories = card.dataset.category.split(' ');
        if (!categories.includes(filter)) {
          card.classList.add('is-hidden');
        }
      }
    }

    // Toast
    function showToast(msg) {
      let toast = document.querySelector('.add-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'add-toast';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('is-visible');
      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => {
        toast.classList.remove('is-visible');
      }, 2200);
    }

    // ========== localStorage 持久化 ==========
    function loadFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const works = JSON.parse(raw);
        if (!Array.isArray(works)) return;
        works.forEach(work => addWorkToGrid(work));
      } catch (err) {
        // 静默失败
      }
    }

    function saveToStorage() {
      const existing = getStoredWorks();
      const customCards = worksGrid.querySelectorAll('.works__card[data-id]');
      customCards.forEach(card => {
        const id = Number(card.getAttribute('data-id'));
        const img = card.querySelector('.works__card-img');
        const tagEl = card.querySelector('.works__card-tag');
        const titleEl = card.querySelector('.works__card-title');
        const descEl = card.querySelector('.works__card-desc');
        if (!existing.find(w => w.id === id)) {
          existing.push({
            id,
            title: titleEl ? titleEl.textContent : '',
            desc: descEl ? descEl.textContent : '',
            category: card.dataset.category,
            tag: tagEl ? tagEl.textContent : '',
            dataUrl: img ? img.src : ''
          });
        }
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      } catch (err) {
        // 存储空间不足
      }
    }

    function getStoredWorks() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (err) {
        return [];
      }
    }

    // 页面加载时恢复用户添加的作品
    loadFromStorage();

    // ========== 编辑模式 ==========
    const editBtn = document.getElementById('worksEditBtn');
    let isEditing = false;

    // 为所有已有卡片注入删除按钮
    function injectDeleteButtons() {
      const allCards = worksGrid.querySelectorAll('.works__card');
      allCards.forEach(card => {
        if (card.querySelector('.works__card-delete')) return;
        const delBtn = document.createElement('button');
        delBtn.className = 'works__card-delete';
        delBtn.setAttribute('aria-label', '删除此卡片');
        delBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        `;
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          showDeleteConfirm(card);
        });
        card.appendChild(delBtn);
      });
    }

    // 删除确认弹窗
    function showDeleteConfirm(card) {
      const titleEl = card.querySelector('.works__card-title');
      const cardName = titleEl ? titleEl.textContent : '这件作品';

      // 创建确认弹窗
      const overlay = document.createElement('div');
      overlay.className = 'delete-confirm-overlay';
      overlay.innerHTML = `
        <div class="delete-confirm">
          <div class="delete-confirm__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
          </div>
          <h3 class="delete-confirm__title">确认删除</h3>
          <p class="delete-confirm__desc">确定要删除 <strong>"${cardName}"</strong> 吗？此操作无法撤销。</p>
          <div class="delete-confirm__actions">
            <button class="delete-confirm__cancel">取消</button>
            <button class="delete-confirm__confirm">确认删除</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // 显示动画
      requestAnimationFrame(() => {
        overlay.classList.add('is-open');
      });

      // 取消按钮
      overlay.querySelector('.delete-confirm__cancel').addEventListener('click', () => {
        closeConfirm();
      });

      // 确认删除
      overlay.querySelector('.delete-confirm__confirm').addEventListener('click', () => {
        deleteCard(card);
        closeConfirm();
        showToast('作品已删除');
      });

      // 点击遮罩关闭
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeConfirm();
      });

      function closeConfirm() {
        overlay.classList.remove('is-open');
        setTimeout(() => {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 300);
      }
    }

    // 删除卡片
    function deleteCard(card) {
      // 动画移除
      card.style.transition = 'all 0.4s cubic-bezier(.22,1,.36,1)';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.85)';
      card.style.pointerEvents = 'none';

      setTimeout(() => {
        if (card.parentNode) {
          card.parentNode.removeChild(card);
        }
        // 同步删除 localStorage 中的数据
        removeFromStorage(card);
      }, 400);
    }

    // 从 localStorage 中移除
    function removeFromStorage(card) {
      const cardId = card.getAttribute('data-id');
      if (!cardId) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const works = JSON.parse(raw);
        const filtered = works.filter(w => String(w.id) !== String(cardId));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch (err) {
        // 静默失败
      }
    }

    // 切换编辑模式
    editBtn.addEventListener('click', () => {
      isEditing = !isEditing;

      if (isEditing) {
        document.body.classList.add('is-editing');
        editBtn.classList.add('is-active');
        editBtn.querySelector('span').textContent = '完成';
        injectDeleteButtons();
      } else {
        document.body.classList.remove('is-editing');
        editBtn.classList.remove('is-active');
        editBtn.querySelector('span').textContent = '编辑';
      }
    });

    // 监听新添加的卡片，自动注入删除按钮
    const gridObserver = new MutationObserver((mutations) => {
      if (!isEditing) return;
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && node.classList.contains('works__card')) {
            injectDeleteButtons();
          }
        });
      });
    });
    gridObserver.observe(worksGrid, { childList: true });

    // addWorkToGrid 之后也需要注入删除按钮
    const originalAddWorkToGrid = addWorkToGrid;
    addWorkToGrid = function(work) {
      originalAddWorkToGrid(work);
      if (isEditing) {
        // 延迟一帧确保 DOM 已插入
        requestAnimationFrame(() => injectDeleteButtons());
      }
    };
  });
})();
