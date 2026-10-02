const interactiveSelector =
  'button:not(:disabled):not([aria-disabled="true"]), a[href], [role="button"]:not([aria-disabled="true"])';

export function installPointerFeedback(root: Document | HTMLElement = document) {
  const ownerDocument = root instanceof Document ? root : root.ownerDocument;
  const host = root instanceof Document ? root.body : root;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function showFeedback(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0 || reducedMotion.matches) return;
    const target = event.target;
    if (!(target instanceof Element) || !target.closest(interactiveSelector)) return;

    const feedback = ownerDocument.createElement('span');
    feedback.className = 'warm-click-feedback';
    feedback.style.left = `${event.clientX}px`;
    feedback.style.top = `${event.clientY}px`;
    feedback.setAttribute('aria-hidden', 'true');
    host.append(feedback);
    feedback.addEventListener('animationend', () => feedback.remove(), { once: true });
    setTimeout(() => feedback.remove(), 600);
  }

  root.addEventListener('pointerdown', showFeedback as EventListener, { passive: true });
  return () => root.removeEventListener('pointerdown', showFeedback as EventListener);
}
