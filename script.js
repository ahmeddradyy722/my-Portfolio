/**
 * ============================================================================
 * AHMED RADY - BACKEND-FOCUSED SOFTWARE ENGINEER PORTFOLIO
 * Vanilla JavaScript (ES6+) Interactive Engine
 * ============================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. GLOBAL STATE & CONFIGURATION
  // --------------------------------------------------------------------------
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Update Copyright Year dynamically
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --------------------------------------------------------------------------
  // 2. TOAST NOTIFICATION SYSTEM
  // --------------------------------------------------------------------------
  const toastContainer = document.getElementById('toastContainer');

  function showToast(message, type = 'success', duration = 4000) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconClass = type === 'success' 
      ? 'fa-solid fa-circle-check' 
      : 'fa-solid fa-circle-exclamation';

    toast.innerHTML = `
      <i class="${iconClass}"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hiding');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, duration);
  }

  // --------------------------------------------------------------------------
  // 3. BACKGROUND CANVAS PARTICLE & CONSTELLATION SYSTEM
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('bgCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles = [];
    // Adjust density based on screen size
    const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
    const connectionDistance = 120;

    const mousePos = { x: -1000, y: -1000 };

    window.addEventListener('mousemove', (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    }, { passive: true });

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.5 + 0.75;
        // Subtle accent palette tints
        this.alpha = Math.random() * 0.4 + 0.15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around bounds
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Gentle mouse interaction
        const dx = mousePos.x - this.x;
        const dy = mousePos.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          this.x -= (dx / dist) * force * 0.8;
          this.y -= (dy / dist) * force * 0.8;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(223, 208, 184, ${this.alpha})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    initParticles();

    function renderCanvas() {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.14;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(148, 137, 121, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      requestAnimationFrame(renderCanvas);
    }

    requestAnimationFrame(renderCanvas);

    // Resize listener with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
      }, 200);
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 4. CUSTOM MINIMAL CURSOR (DESKTOP)
  // --------------------------------------------------------------------------
  const cursorDot = document.getElementById('cursorDot');
  const cursorOutline = document.getElementById('cursorOutline');

  if (cursorDot && cursorOutline && !isTouchDevice && !prefersReducedMotion) {
    let mouseX = -100;
    let mouseY = -100;
    let outlineX = -100;
    let outlineY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorDot.style.opacity = '1';
      cursorOutline.style.opacity = '1';
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorOutline.style.opacity = '0';
    });

    // Smooth cursor outline trail with lerp
    function animateCursor() {
      outlineX += (mouseX - outlineX) * 0.18;
      outlineY += (mouseY - outlineY) * 0.18;
      cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    // Expand cursor over interactive targets
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .tilt-card, .skill-chip, .tool-card');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    });
  }

  // --------------------------------------------------------------------------
  // 5. NAVBAR SCROLL EFFECT & PROGRESS BAR
  // --------------------------------------------------------------------------
  const siteHeader = document.getElementById('siteHeader');
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const backToTopBtn = document.getElementById('backToTopBtn');

  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Update progress bar
    if (scrollProgressBar && docHeight > 0) {
      const scrollPct = (scrollY / docHeight) * 100;
      scrollProgressBar.style.width = `${Math.min(Math.max(scrollPct, 0), 100)}%`;
    }

    // Header blurred background
    if (siteHeader) {
      if (scrollY > 50) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --------------------------------------------------------------------------
  // 6. ACTIVE NAVIGATION LINK OBSERVER
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function updateActiveNav() {
    const scrollPosition = (window.scrollY || window.pageYOffset) + 160;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        desktopNavLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });
        mobileNavLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // --------------------------------------------------------------------------
  // 7. MOBILE HAMBURGER DRAWER TOGGLE
  // --------------------------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  function toggleMobileMenu(isOpen) {
    if (!hamburgerBtn || !mobileDrawer) return;

    const willOpen = typeof isOpen === 'boolean' ? isOpen : !mobileDrawer.classList.contains('open');

    hamburgerBtn.classList.toggle('is-active', willOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(willOpen));
    mobileDrawer.classList.toggle('open', willOpen);
    mobileDrawer.setAttribute('aria-hidden', String(!willOpen));

    if (willOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', () => toggleMobileMenu());

    // Close on clicking mobile nav link
    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMobileMenu(false));
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        toggleMobileMenu(false);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. TYPING TEXT ANIMATION IN HERO SECTION
  // --------------------------------------------------------------------------
  const typedRoleEl = document.getElementById('typedRole');
  if (typedRoleEl) {
    const roles = [
      'Backend Developer',
      'ASP.NET Core Developer',
      'Full-Stack Developer',
      'Software Engineer'
    ];

    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    const typingSpeed = 90;
    const deletingSpeed = 45;
    const holdDelay = 1800;

    function typeLoop() {
      const currentRole = roles[roleIdx];

      if (isDeleting) {
        typedRoleEl.textContent = currentRole.substring(0, charIdx - 1);
        charIdx--;
      } else {
        typedRoleEl.textContent = currentRole.substring(0, charIdx + 1);
        charIdx++;
      }

      let nextSpeed = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIdx === currentRole.length) {
        // Finished typing word, wait before deleting
        nextSpeed = holdDelay;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        // Finished deleting, move to next role
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        nextSpeed = 400;
      }

      setTimeout(typeLoop, nextSpeed);
    }

    typeLoop();
  }

  // --------------------------------------------------------------------------
  // 9. 3D TILT EFFECT ON CARDS
  // --------------------------------------------------------------------------
  if (!isTouchDevice && !prefersReducedMotion) {
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // max 6deg tilt
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 10. MAGNETIC BUTTON EFFECT
  // --------------------------------------------------------------------------
  if (!isTouchDevice && !prefersReducedMotion) {
    const magneticBtns = document.querySelectorAll('.magnetic-btn');

    magneticBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 11. SCROLL REVEAL & ANIMATED STATISTICS COUNTERS
  // --------------------------------------------------------------------------
  const reveals = document.querySelectorAll('.reveal-on-scroll');
  const statNumbers = document.querySelectorAll('.stat-number');

  if ('IntersectionObserver' in window) {
    // Reveal Observer
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach((el) => revealObserver.observe(el));

    // Stats Counter Observer
    let hasAnimatedStats = false;
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimatedStats) {
          hasAnimatedStats = true;
          statNumbers.forEach((stat) => animateCounter(stat));
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });

    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
      statsObserver.observe(statsGrid);
    }
  } else {
    // Fallback if IntersectionObserver is not supported
    reveals.forEach((el) => el.classList.add('is-revealed'));
    statNumbers.forEach((stat) => {
      stat.textContent = stat.getAttribute('data-target');
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.floor(easeProgress * target);

      el.textContent = currentVal.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(updateCount);
  }

  // --------------------------------------------------------------------------
  // 12. CLIPBOARD COPY EMAIL FEATURE
  // --------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const emailContactLink = document.getElementById('emailContactLink');

  if (copyEmailBtn && emailContactLink) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = emailContactLink.textContent.trim();
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          // Fallback
          const textArea = document.createElement('textarea');
          textArea.value = email;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        showToast('Email address copied to clipboard!', 'success');
        copyEmailBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => {
          copyEmailBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
        }, 2500);
      } catch (err) {
        showToast('Failed to copy email automatically.', 'error');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 13. CONTACT FORM VALIDATION & DISPATCH ACTION
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('emailAddress');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const subjectError = document.getElementById('subjectError');
    const messageError = document.getElementById('messageError');

    const submitBtn = document.getElementById('submitFormBtn');

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function clearErrors() {
      [nameInput, emailInput, subjectInput, messageInput].forEach((input) => {
        if (input) input.classList.remove('is-invalid');
      });
      [nameError, emailError, subjectError, messageError].forEach((span) => {
        if (span) span.textContent = '';
      });
    }

    // Live validation feedback on input
    [nameInput, emailInput, subjectInput, messageInput].forEach((input) => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('is-invalid');
          const errorSpan = document.getElementById(`${input.name}Error`) || 
                            document.getElementById(`${input.id.replace('Address', '')}Error`);
          if (errorSpan) errorSpan.textContent = '';
        });
      }
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      let isValid = true;
      const nameVal = nameInput.value.trim();
      const emailVal = emailInput.value.trim();
      const subjectVal = subjectInput.value.trim();
      const messageVal = messageInput.value.trim();

      // Validate Name
      if (!nameVal || nameVal.length < 2) {
        nameInput.classList.add('is-invalid');
        nameError.textContent = 'Please enter your full name (at least 2 characters).';
        isValid = false;
      }

      // Validate Email
      if (!emailVal || !emailRegex.test(emailVal)) {
        emailInput.classList.add('is-invalid');
        emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
      }

      // Validate Subject
      if (!subjectVal || subjectVal.length < 3) {
        subjectInput.classList.add('is-invalid');
        subjectError.textContent = 'Please specify a subject (at least 3 characters).';
        isValid = false;
      }

      // Validate Message
      if (!messageVal || messageVal.length < 10) {
        messageInput.classList.add('is-invalid');
        messageError.textContent = 'Please write a message (at least 10 characters).';
        isValid = false;
      }

      if (!isValid) {
        showToast('Please correct the highlighted fields.', 'error');
        return;
      }

      // If valid, prepare mailto client fallback honestly without faking fake backend response
      const recipient = 'ahmeddradyy722@gmail.com';
      const formattedSubject = encodeURIComponent(`[Portfolio Inquiry] ${subjectVal} - from ${nameVal}`);
      const formattedBody = encodeURIComponent(
        `Hello Ahmed,\n\nMy name is ${nameVal} (${emailVal}).\n\n${messageVal}\n\n---\nSent via Ahmed Rady Portfolio Contact Form`
      );
      const mailtoUrl = `mailto:${recipient}?subject=${formattedSubject}&body=${formattedBody}`;

      // Visual feedback
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Opening Mail Client...</span>';
      }

      setTimeout(() => {
        window.location.href = mailtoUrl;

        showToast('Opening your email client to send your message directly to Ahmed Rady!', 'success', 6000);

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span class="btn-text">Send Message</span><i class="fa-solid fa-paper-plane btn-icon"></i>';
        }
      }, 700);
    });
  }

  // --------------------------------------------------------------------------
  // 14. CV DOWNLOAD NOTIFICATION FEEDBACK
  // --------------------------------------------------------------------------
  const cvButtons = document.querySelectorAll('a[download]');
  cvButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      showToast('Downloading Ahmed Rady\'s Curriculum Vitae...', 'success');
    });
  });

});
