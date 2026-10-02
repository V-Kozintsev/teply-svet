// Let the selected control visibly press before its destination covers it.
export function createSelectionFeedback() {
  let selected: HTMLButtonElement | null = null;
  let timer: number | undefined;

  function cancel() {
    window.clearTimeout(timer);
    timer = undefined;
    if (selected) delete selected.dataset.selecting;
    selected = null;
  }

  function run(button: HTMLButtonElement, navigate: () => void) {
    if (selected || button.disabled) return false;
    selected = button;
    button.dataset.selecting = 'true';
    timer = window.setTimeout(() => {
      const visible =
        !button.ownerDocument.hidden &&
        button.isConnected &&
        !button.disabled &&
        !button.closest('[hidden], [inert], dialog:not([open])') &&
        button.getClientRects().length > 0;
      cancel();
      if (visible) navigate();
    }, 180);
    return true;
  }

  return { run, cancel };
}
