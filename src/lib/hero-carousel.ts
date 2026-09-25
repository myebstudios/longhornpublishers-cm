export interface HeroAutoplayState {
  multipleSlides: boolean;
  reducedMotion: boolean;
  manuallyStopped: boolean;
  hoverPaused: boolean;
  focusPaused: boolean;
  documentHidden: boolean;
}

/** The complete autoplay gate, kept pure so the pause policy is testable. */
export function canHeroAutoplay(state: HeroAutoplayState): boolean {
  return state.multipleSlides
    && !state.reducedMotion
    && !state.manuallyStopped
    && !state.hoverPaused
    && !state.focusPaused
    && !state.documentHidden;
}

const focusable = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initHeroCarousels(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-hero-carousel]').forEach((carousel) => {
    if (carousel.dataset.initialized === 'true') return;
    carousel.dataset.initialized = 'true';

    const slides = Array.from(carousel.querySelectorAll<HTMLElement>('[data-hero-slide]'));
    const controls = carousel.querySelector<HTMLElement>('[data-hero-controls]');
    if (slides.length <= 1 || !controls) return;

    const dots = Array.from(controls.querySelectorAll<HTMLButtonElement>('[data-hero-dot]'));
    const previous = controls.querySelector<HTMLButtonElement>('[data-hero-previous]');
    const next = controls.querySelector<HTMLButtonElement>('[data-hero-next]');
    const toggle = controls.querySelector<HTMLButtonElement>('[data-hero-toggle]');
    const counter = controls.querySelector<HTMLElement>('[data-hero-counter]');
    const live = carousel.querySelector<HTMLElement>('[data-hero-live]');
    const stack = carousel.querySelector<HTMLElement>('[data-hero-stack]');
    if (!previous || !next || !toggle || !counter || !live || !stack) return;

    const interval = Math.min(30_000, Math.max(3_000, Number(carousel.dataset.autoplayInterval) || 6_000));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const labels = {
      play: toggle.dataset.playLabel ?? 'Play slideshow',
      pause: toggle.dataset.pauseLabel ?? 'Pause slideshow',
      reduced: toggle.dataset.reducedLabel ?? 'Autoplay disabled by reduced motion preference',
      announcement: live.dataset.announcement ?? 'Slide {current} of {total}',
    };
    const state: HeroAutoplayState = {
      multipleSlides: true,
      reducedMotion: reducedMotion.matches,
      manuallyStopped: carousel.dataset.autoplayEnabled !== 'true',
      hoverPaused: false,
      focusPaused: false,
      documentHidden: document.hidden,
    };
    let current = 0;
    let timer: number | undefined;
    let progressFrame: number | undefined;
    let remaining = interval;
    let startedAt = 0;
    let pointerStartX: number | null = null;

    const autoplayModeEnabled = () => !state.reducedMotion && !state.manuallyStopped;

    const updateToggle = () => {
      if (state.reducedMotion) {
        toggle.disabled = true;
        toggle.textContent = labels.reduced;
        toggle.setAttribute('aria-label', labels.reduced);
        toggle.dataset.state = 'disabled';
        toggle.setAttribute('aria-pressed', 'true');
        return;
      }
      toggle.disabled = false;
      const playing = autoplayModeEnabled();
      toggle.textContent = playing ? labels.pause : labels.play;
      toggle.setAttribute('aria-label', playing ? labels.pause : labels.play);
      toggle.dataset.state = playing ? 'playing' : 'paused';
      toggle.setAttribute('aria-pressed', String(!playing));
    };

    const pauseTimer = () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
        remaining = Math.max(0, remaining - (performance.now() - startedAt));
        timer = undefined;
      }
      if (progressFrame !== undefined) {
        window.cancelAnimationFrame(progressFrame);
        progressFrame = undefined;
      }
    };

    const show = (nextIndex: number, announce = false) => {
      current = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const active = index === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.inert = !active;
        slide.querySelectorAll<HTMLElement>(focusable).forEach((element) => {
          if (active) element.removeAttribute('tabindex');
          else element.setAttribute('tabindex', '-1');
        });
      });
      dots.forEach((dot, index) => {
        const active = index === current;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
      counter.textContent = `${current + 1} / ${slides.length}`;
      if (announce) {
        live.textContent = labels.announcement
          .replace('{current}', String(current + 1))
          .replace('{total}', String(slides.length));
      }
    };

    const startTimer = () => {
      startedAt = performance.now();
      timer = window.setTimeout(() => {
        timer = undefined;
        remaining = interval;
        carousel.dataset.running = 'false';
        show(current + 1);
        schedule();
      }, remaining);
    };

    const schedule = () => {
      pauseTimer();
      updateToggle();
      if (!canHeroAutoplay(state)) {
        if (state.manuallyStopped || state.reducedMotion) {
          carousel.dataset.running = 'false';
          remaining = interval;
        } else {
          carousel.dataset.progressPaused = 'true';
        }
        return;
      }
      if (carousel.dataset.running === 'true') {
        carousel.dataset.progressPaused = 'false';
        startTimer();
        return;
      }
      remaining = interval;
      progressFrame = window.requestAnimationFrame(() => {
        progressFrame = undefined;
        if (!canHeroAutoplay(state)) return;
        carousel.dataset.running = 'true';
        carousel.dataset.progressPaused = 'false';
        startTimer();
      });
    };

    const takeManualControl = (nextIndex: number) => {
      state.manuallyStopped = true;
      carousel.dataset.running = 'false';
      show(nextIndex, true);
      schedule();
    };

    previous.addEventListener('click', () => takeManualControl(current - 1));
    next.addEventListener('click', () => takeManualControl(current + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => takeManualControl(index)));
    toggle.addEventListener('click', () => {
      state.manuallyStopped = autoplayModeEnabled();
      schedule();
    });

    carousel.addEventListener('mouseenter', () => { state.hoverPaused = true; schedule(); });
    carousel.addEventListener('mouseleave', () => { state.hoverPaused = false; schedule(); });
    carousel.addEventListener('focusin', () => { state.focusPaused = true; schedule(); });
    carousel.addEventListener('focusout', (event) => {
      if (event.relatedTarget instanceof Node && carousel.contains(event.relatedTarget)) return;
      state.focusPaused = false;
      schedule();
    });
    carousel.addEventListener('keydown', (event) => {
      if (event.target !== carousel || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      takeManualControl(current + (event.key === 'ArrowRight' ? 1 : -1));
    });
    stack.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse') pointerStartX = event.clientX;
    });
    stack.addEventListener('pointerup', (event) => {
      if (pointerStartX === null) return;
      const distance = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(distance) < 50) return;
      takeManualControl(current + (distance < 0 ? 1 : -1));
    });
    document.addEventListener('visibilitychange', () => {
      state.documentHidden = document.hidden;
      schedule();
    });
    reducedMotion.addEventListener('change', (event) => {
      state.reducedMotion = event.matches;
      schedule();
    });

    carousel.dataset.enhanced = 'true';
    carousel.style.setProperty('--hero-autoplay-ms', `${interval}ms`);
    show(0);
    schedule();
  });
}
