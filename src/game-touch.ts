// Keep native one-finger scrolling/swiping, but never interpret a game gesture as zoom.
export function installGameTouchGuard() {
  let multiple = false;
  let suppressClickUntil = 0;
  const block = (event: Event) => {
    if (event.cancelable) event.preventDefault();
  };
  // The standalone level has its own document, separate from menu styles.
  // Cancel native selection/callouts without cancelling taps or pipe turns.
  const gameArtwork = (event: Event) => {
    const target = event.target;
    const element =
      target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    return (
      !!element?.closest('#warm-glass-level') &&
      !element.closest('input,textarea,[contenteditable]:not([contenteditable="false"])')
    );
  };
  for (const type of ['selectstart', 'contextmenu', 'dragstart']) {
    document.addEventListener(
      type,
      (event) => {
        if (gameArtwork(event)) block(event);
      },
      true,
    );
  }
  const touch = (event: TouchEvent) => {
    if (event.type === 'touchstart' && event.touches.length === 1) multiple = false;
    if (event.touches.length > 1) multiple = true;
    if (multiple) block(event);
  };
  document.addEventListener('touchstart', touch, { passive: false });
  document.addEventListener('touchmove', touch, { passive: false });
  const finish = (event: TouchEvent) => {
    if (!multiple) return;
    block(event);
    suppressClickUntil = performance.now() + 350;
    if (!event.touches.length) multiple = false;
  };
  document.addEventListener('touchend', finish, { passive: false });
  document.addEventListener('touchcancel', finish, { passive: false });
  document.addEventListener('gesturestart', block, { passive: false });
  document.addEventListener('gesturechange', block, { passive: false });
  const reset = () => {
    multiple = false;
    suppressClickUntil = 0;
  };
  window.addEventListener('pagehide', reset);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reset();
  });
  document.addEventListener(
    'click',
    (event) => {
      if (event.detail && (multiple || performance.now() < suppressClickUntil)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true,
  );
}

export function installGameViewport() {
  let lastViewport = '';
  const resize = () => {
    // Do not change the layout in response to accessibility zoom outside the game.
    const viewport = window.visualViewport;
    const height = Math.round(viewport && viewport.scale === 1 ? viewport.height : innerHeight);
    const top = viewport && viewport.scale === 1 ? viewport.offsetTop : 0;
    const key = `${height}:${top}`;
    if (key === lastViewport) return;
    lastViewport = key;
    document.documentElement.style.setProperty('--game-height', `${height}px`);
    document.documentElement.style.setProperty('--game-top', `${top}px`);
    document.documentElement.dataset.gameHeight =
      height <= 260 ? 'tiny' : height <= 420 ? 'short' : 'full';
  };
  window.addEventListener('resize', resize);
  window.visualViewport?.addEventListener('resize', resize);
  resize();
}
