const header = document.querySelector('.site-header');
if (header) {
  const root = document.documentElement;
  if (!document.querySelector('.page-shell')) {
    root.classList.add('legacy-scroll-header');
    if ('ResizeObserver' in window) new ResizeObserver(() => root.style.setProperty('--site-header-height',`${header.offsetHeight}px`)).observe(header);
  }
  root.classList.add('scroll-header-enabled');
  let previous = window.scrollY;
  let travel = 0;
  let frame = 0;
  let pointerActive = false;
  const reveal = () => { header.classList.remove('is-scroll-hidden'); travel = 0; };
  const update = () => {
    frame = 0;
    const y = Math.max(0,Math.min(window.scrollY,document.documentElement.scrollHeight - window.innerHeight));
    const delta = y - previous;
    previous = y;
    if (pointerActive || root.classList.contains('menu-open') || root.classList.contains('quick-contact-open') || document.activeElement?.matches('input,textarea,select') || header.contains(document.activeElement) && root.dataset.focusInput === 'keyboard') {
      travel = 0;
      return;
    }
    if (y < header.offsetHeight) { reveal(); return; }
    if (!delta) return;
    if (Math.sign(delta) !== Math.sign(travel)) travel = 0;
    travel += delta;
    if (travel > 12) header.classList.add('is-scroll-hidden');
    else if (travel < -8) reveal();
  };
  window.addEventListener('scroll',() => { if (!frame) frame = requestAnimationFrame(update); },{passive:true});
  header.addEventListener('pointerdown',() => {
    pointerActive = true;
    previous = window.scrollY;
    reveal();
  });
  const releasePointer = () => {
    if (!pointerActive) return;
    pointerActive = false;
    previous = window.scrollY;
    travel = 0;
  };
  document.addEventListener('pointerup',releasePointer);
  document.addEventListener('pointercancel',releasePointer);
  window.addEventListener('blur',releasePointer);
  document.addEventListener('focusin',event => {
    if (!header.contains(event.target)) return;
    previous = window.scrollY;
    reveal();
  });
  document.addEventListener('keydown',event => { if (event.key === 'Tab') reveal(); },{capture:true});
  window.addEventListener('resize',() => { previous = window.scrollY; travel = 0; });
  window.addEventListener('pageshow',() => { previous = window.scrollY; reveal(); });
}
