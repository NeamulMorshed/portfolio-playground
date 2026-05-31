// Design tokens (match CSS):
const COLORS = {
  black: '#101113',
  grey: '#454953',
  light: '#F4F6FA',
  bgBlack: '#212225'
};

// === LENIS SMOOTH SCROLL ===
let lenisInstance = null;

function initLenis() {
  if (typeof Lenis === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  // Sync Lenis with GSAP ScrollTrigger
  if (window.gsap && window.ScrollTrigger) {
    lenisInstance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

// === IMAGE OPTIMIZATION ===
function initImageOptimizations() {
  const images = document.querySelectorAll('img');
  
  images.forEach((img, index) => {
    // Skip already processed images
    if (img.dataset.optimized) return;
    
    // Add native lazy loading for images below the fold
    // First 3 images load eagerly (above the fold), rest are lazy
    if (index > 2 && !img.loading) {
      img.loading = 'lazy';
    }
    
    // Add async decoding for all images
    if (!img.decoding) {
      img.decoding = 'async';
    }
    
    // Add fetchpriority for above-the-fold images
    if (index <= 2) {
      img.fetchPriority = 'high';
    } else {
      img.fetchPriority = 'low';
    }
    
    // Handle lazy loaded images fade-in
    if (img.loading === 'lazy') {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function() {
          this.classList.add('loaded');
        }, { once: true });
      }
    }
    
    // Mark as processed
    img.dataset.optimized = 'true';
  });
  
  // Use Intersection Observer for enhanced lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // If image has data-src, swap it
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '100px 0px', // Start loading 100px before visible
      threshold: 0.01
    });
    
    // Observe all lazy images
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Component Loading
async function loadComponents() {
  try {
    const navbarResponse = await fetch('/components/navbar.html');
    if (!navbarResponse.ok) {
      throw new Error(`Failed to load navbar: ${navbarResponse.status} ${navbarResponse.statusText}`);
    }
    const navbarHTML = await navbarResponse.text();
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
      navbarPlaceholder.outerHTML = navbarHTML;
      setActiveNavLink();
    }

    // Footer embedded as template to avoid CORS issues with file:// protocol
    const footerHTML = `<!-- Footer -->
<footer id="footer">
    <div class="footer-top">
        <p class="hneue tertiary">PURPOSE FULL SOLUTION</p>
        <p class="hneue tertiary">FOR YOUR BUSINESS</p>
    </div>
    <div class="footer-cta">
        <div class="cta-copy">
            <p class="hneue title"><span class="italic secondary">Let's</span> Collaborate..</p>
            <p class="hneue underline">neamul.morshed.nahid@gmail.com</p>
        </div>
        <button class="btn" id="email-btn" data-block="button">
            <span class="button__flair"></span>
            <span class="button__label">EMAIL ME</span>
        </button>
    </div>
    <div class="footer-bottom" aria-label="Designed by Neamul Morshed Nahid">
        <div class="footer-marquee">
            <div class="marquee-content">
                <div class="marquee-text">DESIGNED BY NEAMUL MORSHED NAHID</div>
                <div class="marquee-text">DESIGNED BY NEAMUL MORSHED NAHID</div>
            </div>
        </div>
    </div>
</footer>

<!-- Back to Top Button -->
<button class="backToTopBtn" id="backToTopBtn" aria-label="Scroll to top">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
    </svg>
</button>

<!-- Email Contact Modal -->
<div id="email-modal" class="email-modal-overlay">
    <div class="email-modal-content">
        <button class="email-modal-close" id="email-modal-close" aria-label="Close contact form">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
            </svg>
        </button>

        <div class="email-modal-container">
            <div class="email-modal-left">
                <h2 class="email-modal-title">
                    <span class="italic">Let's build</span> something great
                </h2>
                <p class="email-modal-description">
                    Have a project, a new role, or just an idea you want to explore? Let's talk about it.
                </p>
                <div class="email-modal-decoration">
                    <img src="assets/popup%20hand.svg" alt="Hand gesture" style="width: 111px; height: 160px;">
                </div>
            </div>

            <div class="email-modal-right">
                <form class="email-modal-form" id="contact-form">
                    <div class="form-group">
                        <label for="fullname" class="form-label">Full Name</label>
                        <input type="text" id="fullname" name="fullname" class="form-input" placeholder="Type name here"
                            required>
                    </div>

                    <div class="form-group">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email" name="email" class="form-input" placeholder="Type email here"
                            required>
                    </div>

                    <div class="form-group">
                        <label for="message" class="form-label">Message</label>
                        <textarea id="message" name="message" class="form-input form-textarea"
                            placeholder="Write your message.." required></textarea>
                    </div>

                    <button type="submit" class="email-modal-submit" data-block="button">
                        <span class="button__flair"></span>
                        <span class="button__label">SEND EMAIL</span>
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>`;
    
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      footerPlaceholder.outerHTML = footerHTML;
    }
  } catch (error) {
    // silently fail — components are progressive enhancement
  }
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    const linkPage = linkHref.replace(/^\//, '');
    if (linkPage === currentPage) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}


// Fluid Cursor Animation
const TAIL_LENGTH = 20;
let mouseX = 0;
let mouseY = 0;
let cursorCircles;
let cursorHistory = Array(TAIL_LENGTH).fill({ x: 0, y: 0 });

function onMouseMove(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
}

function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  for (let i = 0; i < TAIL_LENGTH; i++) {
    let div = document.createElement('div');
    div.classList.add('cursor-circle');
    cursor.append(div);
  }
  cursorCircles = Array.from(document.querySelectorAll('.cursor-circle'));
  document.body.classList.add('js-cursor-ready');
}

function updateCursor() {
  cursorHistory.shift();
  cursorHistory.push({ x: mouseX, y: mouseY });

  for (let i = 0; i < TAIL_LENGTH; i++) {
    let current = cursorHistory[i];
    let next = cursorHistory[i + 1] || cursorHistory[TAIL_LENGTH - 1];

    let xDiff = next.x - current.x;
    let yDiff = next.y - current.y;

    current.x += xDiff * 0.35;
    current.y += yDiff * 0.35;
    cursorCircles[i].style.transform = `translate(${current.x}px, ${current.y}px) scale(${i / TAIL_LENGTH})`;
  }
  requestAnimationFrame(updateCursor);
}

// Button Hover Animation Class
class Button {
  constructor(buttonElement) {
    this.block = buttonElement;
    this.init();
    this.initEvents();
  }

  init() {
    const el = gsap.utils.selector(this.block);

    this.DOM = {
      button: this.block,
      flair: el(".button__flair")
    };

    this.xSet = gsap.quickSetter(this.DOM.flair, "xPercent");
    this.ySet = gsap.quickSetter(this.DOM.flair, "yPercent");
  }

  getXY(e) {
    const {
      left,
      top,
      width,
      height
    } = this.DOM.button.getBoundingClientRect();

    const xTransformer = gsap.utils.pipe(
      gsap.utils.mapRange(0, width, 0, 100),
      gsap.utils.clamp(0, 100)
    );

    const yTransformer = gsap.utils.pipe(
      gsap.utils.mapRange(0, height, 0, 100),
      gsap.utils.clamp(0, 100)
    );

    return {
      x: xTransformer(e.clientX - left),
      y: yTransformer(e.clientY - top)
    };
  }

  initEvents() {
    this.DOM.button.addEventListener("mouseenter", (e) => {
      const { x, y } = this.getXY(e);

      this.xSet(x);
      this.ySet(y);

      gsap.to(this.DOM.flair, {
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      });
    });

    this.DOM.button.addEventListener("mouseleave", (e) => {
      const { x, y } = this.getXY(e);

      gsap.killTweensOf(this.DOM.flair);

      gsap.to(this.DOM.flair, {
        xPercent: x > 90 ? x + 20 : x < 10 ? x - 20 : x,
        yPercent: y > 90 ? y + 20 : y < 10 ? y - 20 : y,
        scale: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    this.DOM.button.addEventListener("mousemove", (e) => {
      const { x, y } = this.getXY(e);

      gsap.to(this.DOM.flair, {
        xPercent: x,
        yPercent: y,
        duration: 0.4,
        ease: "power2"
      });
    });
  }
}

function initButtonAnimations() {
  const buttonElements = document.querySelectorAll('[data-block="button"]');
  buttonElements.forEach((buttonElement) => {
    new Button(buttonElement);
  });
}

// Scroll-triggered reveal for each case study card
function initCaseCardScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  const cards = document.querySelectorAll('.case-row.case-single');
  if (!cards.length) return;

  cards.forEach((card) => {
    gsap.from(card, {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

// Animate case study heading on scroll
function initCaseStudyHeadingAnimation() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const heading = document.querySelector('#case-studies-heading .case-title-heading');
  if (!heading) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from(heading, {
    opacity: 0,
    y: 30,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: heading,
      start: 'top 85%',
      end: 'top 50%',
      scrub: 0.5 // smooth scrub
    }
  });
}

// Overlay controls for pixel-perfect comparison with Figma export
function initOverlay() {
  const overlay = document.getElementById('pixel-overlay');
  if (!overlay) return;

  const img = overlay.querySelector('img');
  const status = overlay.querySelector('.overlay-controls span:first-child strong');
  const opacityEl = overlay.querySelector('.overlay-controls span:last-child strong');
  if (!img) return;
  let active = false;
  let opacity = 0.5;

  function render() {
    overlay.classList.toggle('active', active);
    img.style.opacity = String(opacity);
    if (status) status.textContent = active ? 'On' : 'Off';
    if (opacityEl) opacityEl.textContent = `${Math.round(opacity * 100)}%`;
  }

  render();

  window.addEventListener('keydown', (e) => {
    if (e.key === 'o' || e.key === 'O') {
      active = !active;
      render();
    } else if (e.key === '[') {
      opacity = Math.max(0, opacity - 0.05);
      render();
    } else if (e.key === ']') {
      opacity = Math.min(1, opacity + 0.05);
      render();
    }
  });
}

// Carousel scroll controls
function initCarousel() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track || !prevBtn || !nextBtn) return;

  const cards = Array.from(track.querySelectorAll('.grid-item'));
  const supportsSmoothScroll = 'scrollBehavior' in document.documentElement.style;
  const snapPositions = [];
  let isAnimating = false;

  // Add click handler for video playback
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const video = card.querySelector('video');
      if (!video) return;

      // Toggle playing state
      if (card.classList.contains('playing')) {
        video.pause();
        card.classList.remove('playing');
      } else {
        // Pause other videos
        cards.forEach((otherCard) => {
          const otherVideo = otherCard.querySelector('video');
          if (otherVideo) {
            otherVideo.pause();
            otherCard.classList.remove('playing');
          }
        });

        // Play this video
        card.classList.add('playing');
        video.currentTime = 0;
        video.play().catch((err) => {
          console.warn('Video playback failed:', err);
        });
      }
    });
  });

  function refreshMetrics() {
    snapPositions.length = 0;
    cards.forEach((card) => {
      snapPositions.push(card.offsetLeft);
    });
  }

  function clampScroll(value) {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    return Math.max(0, Math.min(value, maxScroll));
  }

  function resolveTarget(direction) {
    const current = track.scrollLeft;
    if (direction === 'next') {
      for (let i = 0; i < snapPositions.length; i += 1) {
        if (snapPositions[i] > current + 4) {
          return clampScroll(snapPositions[i]);
        }
      }
      return clampScroll(snapPositions[snapPositions.length - 1] ?? current);
    }

    for (let i = snapPositions.length - 1; i >= 0; i -= 1) {
      if (snapPositions[i] < current - 4) {
        return clampScroll(snapPositions[i]);
      }
    }
    return 0;
  }

  function runCardRipple(direction, duration) {
    if (!window.gsap) return;

    const offset = direction === 'next' ? 45 : -45;
    gsap.fromTo(
      cards,
      { x: offset, opacity: 0.94 },
      {
        x: 0,
        opacity: 1,
        duration,
        ease: 'power2.out',
        stagger: 0.04
      }
    );
  }

  function smoothScroll(direction) {
    if (isAnimating) return;

    const target = resolveTarget(direction);
    if (target === track.scrollLeft) return;

    isAnimating = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;

    const duration = 0.75;

    if (window.gsap) {
      gsap.to(track, {
        scrollLeft: target,
        duration,
        ease: 'power2.out',
        onUpdate: updateButtonStates,
        onComplete: () => {
          isAnimating = false;
          prevBtn.disabled = false;
          nextBtn.disabled = false;
          updateButtonStates();
        }
      });
      runCardRipple(direction, duration);
    } else if (supportsSmoothScroll) {
      track.scrollTo({ left: target, behavior: 'smooth' });
      setTimeout(() => {
        isAnimating = false;
        prevBtn.disabled = false;
        nextBtn.disabled = false;
        updateButtonStates();
      }, 500);
    } else {
      track.scrollLeft = target;
      isAnimating = false;
      prevBtn.disabled = false;
      nextBtn.disabled = false;
      updateButtonStates();
    }
  }

  function updateButtonStates() {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const isAtStart = track.scrollLeft <= 1;
    const isAtEnd = track.scrollLeft >= maxScroll - 1;

    prevBtn.disabled = isAtStart || isAnimating;
    nextBtn.disabled = isAtEnd || isAnimating;

    prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
    prevBtn.style.pointerEvents = prevBtn.disabled ? 'none' : 'auto';
    nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    nextBtn.style.pointerEvents = nextBtn.disabled ? 'none' : 'auto';
  }

  prevBtn.addEventListener('click', (event) => {
    event.preventDefault();
    smoothScroll('prev');
  });

  nextBtn.addEventListener('click', (event) => {
    event.preventDefault();
    smoothScroll('next');
  });

  track.addEventListener('scroll', updateButtonStates);
  window.addEventListener('resize', () => {
    refreshMetrics();
    track.scrollLeft = clampScroll(track.scrollLeft);
    updateButtonStates();
  });

  refreshMetrics();
  updateButtonStates();
}

function initPhilosophyMotion() {
  const section = document.getElementById('philosophy');
  const dots = section?.querySelector('.philo-dots');
  const lines = section ? Array.from(section.querySelectorAll('.philo-line')) : [];

  if (!section || !dots || !lines.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    dots.style.opacity = '0.7';
    return;
  }

  const dotTranslate = 44;
  const textTranslate = 26;

  let rafId = null;
  let targetX = 0;
  let targetY = 0;
  let lineOffsetX = 0;
  let lineOffsetY = 0;

  function applyTransforms() {
    const tx = targetX;
    const ty = targetY;

    dots.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${ty * -0.04}deg) rotateY(${tx * 0.04}deg) scale(1.02)`;
    lines.forEach((line, index) => {
      const depth = 1 + index * 0.4;
      line.style.transform = `translate3d(${lineOffsetX / depth}px, ${lineOffsetY / depth}px, 0)`;
    });

    rafId = null;
  }

  function requestUpdate(xRatio, yRatio) {
    targetX = -xRatio * dotTranslate;
    targetY = -yRatio * dotTranslate;
    lineOffsetX = -xRatio * textTranslate;
    lineOffsetY = -yRatio * textTranslate;

    if (!rafId) {
      rafId = window.requestAnimationFrame(applyTransforms);
    }
  }

  function reset() {
    targetX = 0;
    targetY = 0;
    lineOffsetX = 0;
    lineOffsetY = 0;
    dots.style.transition = 'transform 0.6s ease';
    lines.forEach((line) => {
      line.style.transition = 'transform 0.6s ease';
      line.style.transform = 'translate3d(0,0,0)';
    });
    dots.style.transform = 'translate3d(0,0,0)';

    window.setTimeout(() => {
      dots.style.transition = '';
      lines.forEach((line) => { line.style.transition = ''; });
    }, 600);
  }

  section.addEventListener('pointermove', (event) => {
    const rect = section.getBoundingClientRect();
    const xRatio = ((event.clientX - rect.left) / rect.width) - 0.5;
    const yRatio = ((event.clientY - rect.top) / rect.height) - 0.5;
    requestUpdate(xRatio, yRatio);
  });

  section.addEventListener('pointerleave', () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    reset();
  });

  section.addEventListener('pointerenter', () => {
    dots.style.transition = 'transform 0.35s ease';
    lines.forEach((line) => {
      line.style.transition = 'transform 0.35s ease';
    });
  });
}

function initFooterMarquee() {
  // Pure CSS animation via @keyframes scroll-left
}

function initRevealObserver(root = document) {
  const elements = root.querySelectorAll('.reveal');
  if (!elements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  if (typeof IntersectionObserver !== 'function') {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, io) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10%', threshold: 0.15 });

  elements.forEach((el) => observer.observe(el));
}

function initCaseBannerParallax(image) {
  if (!image) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  let rafId = null;

  function update() {
    const rect = image.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const progress = 1 - Math.min(Math.max((rect.top + rect.height) / (viewport + rect.height), 0), 1);
    const translate = (progress - 0.5) * 60; // clamp to subtle parallax
    image.style.transform = `translateY(${translate}px)`;
    rafId = null;
  }

  function onScroll() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

function initCaseScrollProgress() {
  const progressBar = document.getElementById('case-progress');
  if (!progressBar) return;

  function update() {
    const scrollTop = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docHeight > 0 ? scrollTop / docHeight : 0;
    progressBar.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function initCaseBackToTop() {
  const triggerDistance = 420;
  const button = document.getElementById('case-back-to-top');
  if (!button) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  function onScroll() {
    if ((window.scrollY || window.pageYOffset) > triggerDistance) {
      button.classList.add('is-visible');
    } else {
      button.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initCaseEntranceAnimation() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || prefersReducedMotion) return;

  const heroElements = document.querySelectorAll('#case-hero .reveal');
  if (!heroElements.length) return;

  heroElements.forEach((el) => el.classList.add('is-visible'));
  gsap.set(heroElements, { opacity: 0, y: 32 });

  gsap.to(heroElements, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.08
  });
}

function initCaseStudyPage() {
  const pageRoot = document.getElementById('case-study');
  if (!pageRoot) return;

  initRevealObserver(pageRoot);
  initCaseEntranceAnimation();
  initCaseBannerParallax(document.getElementById('case-banner-img'));
  initCaseScrollProgress();
  initCaseBackToTop();
}

// Back to Top Button Handler  
function initBackToTop() {
  const button = document.querySelector('.backToTopBtn');
  if (!button) return;

  function toggleVisibility() {
    const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    if (scrollPos > 500) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  }

  function scrollToTop(e) {
    e.preventDefault();
    if (window.gsap) {
      gsap.to(document.documentElement, {
        duration: 1,
        scrollTop: 0,
        ease: "power2.inOut"
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  button.addEventListener('click', scrollToTop);
  toggleVisibility(); // Check initial state
}

// Email Modal Handler
function initEmailModal() {
  const emailBtn = document.getElementById('email-btn');
  const emailModal = document.getElementById('email-modal');
  const closeBtn = document.getElementById('email-modal-close');
  const contactForm = document.getElementById('contact-form');

  if (!emailBtn || !emailModal) return;

  // Open modal
  emailBtn.addEventListener('click', () => {
    emailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // Close modal
  function closeModal() {
    emailModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  closeBtn?.addEventListener('click', closeModal);

  // Close on overlay click
  emailModal.addEventListener('click', (e) => {
    if (e.target === emailModal) {
      closeModal();
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && emailModal.classList.contains('active')) {
      closeModal();
    }
  });

  // Handle form submission
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullname = document.getElementById('fullname').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      // Create mailto link with form data
      const subject = 'Portfolio Contact Form';
      const body = `Name: ${fullname}\nEmail: ${email}\n\nMessage:\n${message}`;
      const mailtoLink = `mailto:neamul.morshed.nahid@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = mailtoLink;

      // Close modal after sending
      setTimeout(closeModal, 500);
    });
  }
}

// Mobile Navigation (hamburger drawer)
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const backdrop = document.getElementById('nav-backdrop');
  const nav = document.getElementById('nav');
  if (!toggle || !menu || !nav) return;

  const links = Array.from(menu.querySelectorAll('.nav-link'));
  let open = false;

  function openMenu() {
    open = true;
    nav.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';

    if (backdrop) backdrop.style.display = 'block';

    if (window.gsap) {
      gsap.set(menu, { visibility: 'visible', xPercent: 100 });
      gsap.to(menu, { xPercent: 0, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo(links,
        { x: 28, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.06, delay: 0.12, ease: 'power2.out' });
      if (backdrop) gsap.to(backdrop, { opacity: 1, duration: 0.4, onStart: () => { backdrop.style.pointerEvents = 'auto'; } });
    } else {
      menu.style.visibility = 'visible';
      menu.style.transform = 'translateX(0)';
      if (backdrop) { backdrop.style.opacity = '1'; backdrop.style.pointerEvents = 'auto'; }
    }
  }

  function closeMenu() {
    open = false;
    nav.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';

    if (window.gsap) {
      gsap.to(menu, { xPercent: 100, duration: 0.4, ease: 'power3.in', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
      if (backdrop) gsap.to(backdrop, { opacity: 0, duration: 0.3, onComplete: () => { backdrop.style.pointerEvents = 'none'; backdrop.style.display = 'none'; } });
    } else {
      menu.style.transform = 'translateX(100%)';
      menu.style.visibility = 'hidden';
      if (backdrop) { backdrop.style.opacity = '0'; backdrop.style.pointerEvents = 'none'; backdrop.style.display = 'none'; }
    }
  }

  toggle.addEventListener('click', () => (open ? closeMenu() : openMenu()));
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  links.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) closeMenu(); });

  // Returning to desktop width: reset any inline mobile state
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      if (open) closeMenu();
      if (window.gsap) {
        gsap.set(menu, { clearProps: 'transform,visibility,opacity' });
      } else {
        menu.style.transform = '';
        menu.style.visibility = '';
      }
      if (backdrop) { backdrop.style.display = 'none'; backdrop.style.opacity = '0'; backdrop.style.pointerEvents = 'none'; }
    }
  });
}

// === FLUID SCROLL ANIMATIONS ===

function initScrollProgressBar() {
  const bar = document.getElementById('scroll-progress-bar');
  if (!bar) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${docHeight > 0 ? scrollTop / docHeight : 0})`;
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initPageEntrance() {
  if (!window.gsap) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const nav = document.getElementById('nav');
  const heroTitle = document.getElementById('hero-title');
  const heroSub = document.querySelector('.hero-sub');
  const designation = document.querySelector('.designation');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (nav) {
    tl.from(nav, { y: -80, opacity: 0, duration: 0.7 }, 0);
  }

  if (heroTitle) {
    tl.from(heroTitle, { y: 60, opacity: 0, duration: 1, ease: 'power4.out' }, 0.2);
  }

  if (designation) {
    tl.from(designation, { y: 24, opacity: 0, duration: 0.7 }, 0.55);
  }

  if (heroSub) {
    tl.from(heroSub, { y: 24, opacity: 0, duration: 0.7 }, 0.7);
  }
}

function initSectionReveal() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  // About section image + text
  const aboutImage = document.querySelector('.about-image');
  const aboutCopy = document.querySelector('.about-copy');

  if (aboutImage) {
    gsap.from(aboutImage, {
      x: -60,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: aboutImage,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  if (aboutCopy) {
    gsap.from(aboutCopy, {
      x: 60,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: aboutCopy,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Footer CTA
  const footerCta = document.querySelector('.footer-cta');
  if (footerCta) {
    gsap.from(footerCta, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: footerCta,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Social links pop-in
  const socialLinks = document.querySelectorAll('.social li');
  if (socialLinks.length) {
    gsap.from(socialLinks, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.4)',
      stagger: 0.08,
      scrollTrigger: {
        trigger: '.social',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Case study section blocks — slide up on scroll
  const sectionBlocks = document.querySelectorAll('.section-block, .solutions-section, .progressive-disclosure-section, .predictable-experience-section, .conclusion-section');
  sectionBlocks.forEach((block) => {
    gsap.from(block, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: block,
        start: 'top 82%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Solution images — subtle scale in
  const solutionImages = document.querySelectorAll('.solution-item-image, .research-image, .design-process-image');
  solutionImages.forEach((img) => {
    gsap.from(img, {
      scale: 0.95,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: img,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Vision/challenge cards — staggered reveal
  const cards = document.querySelectorAll('.card, .persona-card, .lms-problem-item');
  if (cards.length) {
    cards.forEach((card, i) => {
      gsap.from(card, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: (i % 4) * 0.08,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }
}

function initHorizontalMarqueeHover() {
  const marquee = document.querySelector('.footer-marquee');
  if (!marquee) return;

  const content = marquee.querySelector('.marquee-content');
  if (!content) return;

  marquee.addEventListener('mouseenter', () => {
    content.style.animationPlayState = 'paused';
  });

  marquee.addEventListener('mouseleave', () => {
    content.style.animationPlayState = 'running';
  });
}

function initSmoothScrollLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;

      if (window.gsap && window.ScrollToPlugin) {
        gsap.to(window, { duration: 1, scrollTo: top, ease: 'power3.inOut' });
      } else {
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initImageOptimizations();

  await loadComponents();

  // Register GSAP plugins if available
  if (window.gsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
  }

  // Lenis must come before anything that uses scroll
  initLenis();

  initMobileNav();
  initCursor();
  if (cursorCircles && cursorCircles.length > 0) {
    updateCursor();
  }
  initButtonAnimations();
  initCaseStudyHeadingAnimation();
  initCaseCardScrollAnimations();
  initOverlay();
  initCarousel();
  initPhilosophyMotion();
  initFooterMarquee();
  initCaseStudyPage();
  initEmailModal();
  initBackToTop();

  // Fluid scroll animations
  initScrollProgressBar();
  initPageEntrance();
  initSectionReveal();
  initHorizontalMarqueeHover();
  initSmoothScrollLinks();

  // Advanced interaction layer
  initPageTransitions();
  initCursorContextual();
  initPreloader();
  initGrainTexture();
  initPhilosophyCharAnimation();
  initMagneticCards();
  initAboutReveal();
});

document.addEventListener('mousemove', onMouseMove, false);

// === PAGE TRANSITIONS ===
function initPageTransitions() {
  const curtain = document.getElementById('page-curtain');
  if (!curtain || !window.gsap) return;

  // Reveal: curtain exits on page load
  gsap.set(curtain, { scaleX: 1, transformOrigin: 'right center' });
  gsap.to(curtain, {
    scaleX: 0,
    duration: 0.9,
    ease: 'power3.inOut',
    delay: 0.05,
    onComplete: () => { curtain.style.pointerEvents = 'none'; }
  });

  // Intercept internal link clicks
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    // Skip anchors, external, mailto, empty
    if (!href || href.startsWith('#') || href.startsWith('mailto') ||
        href.startsWith('http') || href.startsWith('//')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      curtain.style.pointerEvents = 'all';
      gsap.set(curtain, { scaleX: 0, transformOrigin: 'left center' });
      gsap.to(curtain, {
        scaleX: 1,
        duration: 0.7,
        ease: 'power3.inOut',
        onComplete: () => { window.location.href = href; }
      });
    });
  });
}

// === CURSOR CONTEXTUAL STATES ===
function initCursorContextual() {
  const cursorEl = document.getElementById('cursor');
  if (!cursorEl) return;

  const label = document.createElement('span');
  label.className = 'cursor-label';
  cursorEl.appendChild(label);

  function setCursorState(state, text = '') {
    cursorEl.dataset.cursorState = state;
    label.textContent = text;
  }

  // Case study cards → "VIEW"
  document.querySelectorAll('.case-card-link, .case-card').forEach((el) => {
    el.addEventListener('mouseenter', () => setCursorState('view', 'VIEW'));
    el.addEventListener('mouseleave', () => setCursorState(''));
  });

  // Email button → pulse ring state
  document.addEventListener('mouseenter', (e) => {
    const btn = e.target.closest('#email-btn, .email-modal-submit');
    if (btn) setCursorState('cta');
  }, true);
  document.addEventListener('mouseleave', (e) => {
    const btn = e.target.closest('#email-btn, .email-modal-submit');
    if (btn) setCursorState('');
  }, true);

  // Portrait image → soft state
  document.querySelectorAll('.about-image img').forEach((el) => {
    el.addEventListener('mouseenter', () => setCursorState('soft'));
    el.addEventListener('mouseleave', () => setCursorState(''));
  });

  // Text/paragraphs → thin state
  document.querySelectorAll('p, h1, h2, h3, li').forEach((el) => {
    el.addEventListener('mouseenter', () => setCursorState('text'));
    el.addEventListener('mouseleave', () => setCursorState(''));
  });

  // Nav links
  document.querySelectorAll('.nav-link, .back-link').forEach((el) => {
    el.addEventListener('mouseenter', () => setCursorState('link'));
    el.addEventListener('mouseleave', () => setCursorState(''));
  });
}

// === PRELOADER ===
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader || !window.gsap) return;

  const letters = preloader.querySelectorAll('.preloader-letter');
  const bar = preloader.querySelector('.preloader-bar');

  // Already animated out (subsequent page visits via transition)
  if (sessionStorage.getItem('nahid-visited')) {
    gsap.set(preloader, { display: 'none' });
    return;
  }

  document.body.style.overflow = 'hidden';

  const tl = gsap.timeline({
    onComplete: () => {
      sessionStorage.setItem('nahid-visited', '1');
      document.body.style.overflow = '';
    }
  });

  // Letters build in staggered
  tl.from(letters, {
    y: 80,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out',
    stagger: 0.06,
  });

  // Bar fills
  if (bar) {
    tl.from(bar, { scaleX: 0, transformOrigin: 'left', duration: 0.7, ease: 'power2.inOut' }, '-=0.1');
    tl.to(bar, { scaleX: 1, duration: 0 }, '>');
  }

  // Hold a beat
  tl.to({}, { duration: 0.3 });

  // Wipe preloader up
  tl.to(preloader, {
    yPercent: -100,
    duration: 0.85,
    ease: 'power3.inOut',
    onComplete: () => { preloader.style.display = 'none'; }
  });
}

// === GRAIN TEXTURE ===
function initGrainTexture() {
  if (document.getElementById('grain-overlay')) return;

  const grain = document.createElement('div');
  grain.id = 'grain-overlay';
  grain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(grain);
}

// === PHILOSOPHY CHARACTER ANIMATION ===
function initPhilosophyCharAnimation() {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitType) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const lines = document.querySelectorAll('.philo-line');
  if (!lines.length) return;

  lines.forEach((line) => {
    // Don't re-split if SplitType already ran on this element
    const split = new SplitType(line, { types: 'chars', tagName: 'span' });
    const chars = split.chars;

    gsap.set(chars, { yPercent: 110, opacity: 0 });

    gsap.to(chars, {
      yPercent: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.025,
      scrollTrigger: {
        trigger: line,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      }
    });
  });

  // Velocity blur on fast scroll
  let lastScrollY = window.scrollY;
  let velocityBlurId = null;

  window.addEventListener('scroll', () => {
    const velocity = Math.abs(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;

    const blur = Math.min(velocity * 0.18, 6);
    lines.forEach((line) => {
      line.style.filter = blur > 0.5 ? `blur(${blur}px)` : '';
    });

    clearTimeout(velocityBlurId);
    velocityBlurId = setTimeout(() => {
      lines.forEach((line) => { line.style.filter = ''; });
    }, 120);
  }, { passive: true });
}

// === MAGNETIC CARDS ===
function initMagneticCards() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !window.gsap) return;

  document.querySelectorAll('.case-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const xRel = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const yRel = (e.clientY - rect.top - rect.height / 2) / rect.height;

      gsap.to(card, {
        x: xRel * 12,
        y: yRel * 8,
        rotateX: -yRel * 3,
        rotateY: xRel * 3,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 800,
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        x: 0, y: 0, rotateX: 0, rotateY: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });

  // Magnetic EMAIL ME button
  document.querySelectorAll('#email-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const xRel = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const yRel = (e.clientY - rect.top - rect.height / 2) / rect.height;
      gsap.to(btn, { x: xRel * 10, y: yRel * 6, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

// === ABOUT PORTRAIT WIPE REVEAL ===
function initAboutReveal() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const figure = document.querySelector('.about-image');
  if (!figure) return;

  // Insert wipe overlay
  const wipe = document.createElement('div');
  wipe.className = 'about-wipe';
  figure.style.position = 'relative';
  figure.style.overflow = 'hidden';
  figure.appendChild(wipe);

  gsap.set(wipe, { scaleX: 1, transformOrigin: 'left center' });

  gsap.to(wipe, {
    scaleX: 0,
    duration: 1.1,
    ease: 'power3.inOut',
    scrollTrigger: {
      trigger: figure,
      start: 'top 75%',
      toggleActions: 'play none none none',
    }
  });
}
