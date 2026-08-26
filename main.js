(() => {
  const reduceMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const body = document.body;
  const nav = document.querySelector('.nav');
  const navPanel = document.querySelector('.site-nav');
  const menuButton = document.querySelector('.menu');
  const progressBar = document.querySelector('.progress i');

  const drift = document.querySelector('.drift');
  const driftCar = document.querySelector('.drift-car');
  const driftSmokes = [...document.querySelectorAll('.drift .smoke')];
  const tireMarks = document.querySelector('.tire-marks');

  const burnout = document.querySelector('.burnout');
  const burnoutCar = document.querySelector('.burnout-car');
  const burnoutSmokes = [...document.querySelectorAll('.burn-smoke')];
  const smokeWipe = document.querySelector('.smoke-wipe');

  const navLinks = [...document.querySelectorAll('.site-nav a:not(.ticket)')];
  const anchorLinks = [...document.querySelectorAll('a[href^="#"]')];
  const observedSections = [...document.querySelectorAll('main section[id]')];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  let ticking = false;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const lerp = (start, end, amount) => start + (end - start) * amount;
  const mapRange = (value, inStart, inEnd, outStart, outEnd) => {
    if (inStart === inEnd) return outEnd;
    return lerp(outStart, outEnd, clamp((value - inStart) / (inEnd - inStart)));
  };
  const stageProgress = (value, start, end) => clamp((value - start) / (end - start));
  const easeOut = (value) => 1 - Math.pow(1 - clamp(value), 3);
  const easeInOut = (value) => 0.5 - Math.cos(clamp(value) * Math.PI) / 2;
  const sectionProgress = (section) => {
    const rect = section.getBoundingClientRect();
    const span = Math.max(section.offsetHeight - window.innerHeight, 1);
    return clamp(-rect.top / span);
  };
  const navOffset = () => nav ? nav.offsetHeight + 18 : 94;

  function setNavOpen(isOpen) {
    body.classList.toggle('nav-open', isOpen);
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', String(isOpen));
    }
    if (navPanel) {
      navPanel.id = 'site-nav-panel';
    }
  }

  function renderDrift(progress) {
    const enter = stageProgress(progress, 0, 0.24);
    const mid = stageProgress(progress, 0.24, 0.68);
    const exit = stageProgress(progress, 0.68, 1);

    const xEnter = lerp(9, 1.5, easeOut(enter));
    const xMid = lerp(1.5, -13, easeInOut(mid));
    const xExit = lerp(-13, -21, easeOut(exit));
    const x = progress < 0.24 ? xEnter : progress < 0.68 ? xMid : xExit;

    const yEnter = lerp(6, -1, easeOut(enter));
    const yMid = lerp(-1, -6, easeInOut(mid));
    const yExit = lerp(-6, -2, easeOut(exit));
    const y = progress < 0.24 ? yEnter : progress < 0.68 ? yMid : yExit;

    const rotation = progress < 0.24
      ? lerp(-4, 6, easeOut(enter))
      : progress < 0.68
        ? lerp(6, 18, easeInOut(mid))
        : lerp(18, 8, easeOut(exit));
    const scale = progress < 0.68 ? lerp(0.98, 1.02, mid) : lerp(1.02, 0.99, exit);

    driftCar.style.transform = `translate3d(${x}vw, ${y}vh, 0) rotate(${rotation}deg) scale(${scale})`;

    const marksProgress = easeOut(stageProgress(progress, 0.34, 0.84));
    tireMarks.style.opacity = String(marksProgress * 0.58);
    tireMarks.style.transform = `rotate(-11deg) scaleX(${lerp(0.68, 1.04, marksProgress)})`;

    driftSmokes.forEach((smoke, index) => {
      const delay = 0.2 + index * 0.1;
      const appear = easeOut(stageProgress(progress, delay, 0.72 + index * 0.05));
      const settle = 1 - easeOut(stageProgress(progress, 0.84, 1));
      const intensity = appear * settle;
      const driftX = lerp(-4 - index * 2, -20 - index * 6, appear);
      const driftY = lerp(0, -7 - index * 2.5, appear);
      const scaleSmoke = lerp(0.48, 1.08 + index * 0.18, appear);
      smoke.style.opacity = String(intensity * (0.34 + index * 0.12));
      smoke.style.transform = `translate3d(${driftX}vw, ${driftY}vh, 0) scale(${scaleSmoke})`;
    });
  }

  function renderBurnout(progress) {
    const launch = stageProgress(progress, 0.18, 0.75);
    const release = stageProgress(progress, 0.82, 1);
    const wobble = Math.sin(progress * Math.PI * 10) * launch * (1 - release);
    burnoutCar.style.transform = `translateX(-50%) rotate(${wobble * 1.4}deg) scale(${lerp(1, 1.02, launch * (1 - release))})`;

    burnoutSmokes.forEach((smoke, index) => {
      const start = 0.14 + index * 0.08;
      const build = easeOut(stageProgress(progress, start, 0.76));
      const clear = 1 - easeOut(stageProgress(progress, 0.84, 1));
      const intensity = build * clear;
      const x = (index % 2 === 0 ? -1 : 1) * lerp(2, 9 + index * 1.5, build);
      const y = lerp(0, -8 - index * 2.8, build);
      const scale = lerp(0.36, 1.08 + index * 0.18, build);
      smoke.style.opacity = String(intensity * (0.3 + index * 0.1));
      smoke.style.transform = `translate3d(${x}vw, ${y}vh, 0) scale(${scale})`;
    });

    const wipeIn = mapRange(progress, 0.74, 0.88, 0, 0.56);
    const wipeOut = mapRange(progress, 0.88, 1, 0.56, 0);
    const wipeOpacity = progress < 0.88 ? wipeIn : wipeOut;
    const wipeShift = progress < 0.88
      ? lerp(10, 0, easeOut(stageProgress(progress, 0.74, 0.88)))
      : lerp(0, -10, easeOut(stageProgress(progress, 0.88, 1)));
    smokeWipe.style.opacity = String(clamp(wipeOpacity, 0, 0.56));
    smokeWipe.style.transform = `translateY(${wipeShift}%)`;
  }

  function render() {
    ticking = false;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;

    if (reduceMotionQuery.matches) {
      return;
    }

    if (drift && driftCar && tireMarks && driftSmokes.length) {
      renderDrift(sectionProgress(drift));
    }

    if (burnout && burnoutCar && burnoutSmokes.length && smokeWipe) {
      renderBurnout(sectionProgress(burnout));
    }
  }

  function requestRender() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  }

  if (menuButton) {
    menuButton.addEventListener('click', () => {
      setNavOpen(!body.classList.contains('nav-open'));
    });
  }

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      setNavOpen(false);
      const top = target.getBoundingClientRect().top + window.scrollY - navOffset();
      window.scrollTo({ top, behavior: reduceMotionQuery.matches ? 'auto' : 'smooth' });
    });
  });

  navLinks.forEach((link) => {
    const page = link.dataset.page;
    if (!page) return;
    link.classList.toggle('active', page === currentPage || (currentPage === '' && page === 'index.html'));
  });

  const hashNavLinks = navLinks.filter((link) => link.hash);
  if (hashNavLinks.length && observedSections.length) {
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        hashNavLinks.forEach((link) => {
          link.classList.toggle('active', link.hash === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-32% 0px -52% 0px', threshold: 0.1 });

    observedSections.forEach((section) => intersectionObserver.observe(section));
  }

  reduceMotionQuery.addEventListener('change', () => {
    if (!reduceMotionQuery.matches) {
      requestRender();
      return;
    }
    if (smokeWipe) {
      smokeWipe.style.opacity = '0';
      smokeWipe.style.transform = 'translateY(8%)';
    }
  });

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);
  window.addEventListener('orientationchange', requestRender);

  navPanel?.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.tagName === 'A') {
      setNavOpen(false);
    }
  });

  render();
})();
