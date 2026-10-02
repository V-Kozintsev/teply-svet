// A few ready-made particles and the browser's animation/audio APIs are enough here.
export function createPowerEffect(
  box: HTMLElement,
  soundUrl: string | undefined,
  soundOn: boolean,
) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sparks = [...box.querySelectorAll<HTMLElement>('.power-spark')];
  const directions = [
    [-0.42, -0.24],
    [0.32, -0.38],
    [0.48, 0.04],
    [0.27, 0.32],
    [-0.31, 0.29],
  ];
  let active = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let animations: Animation[] = [];
  let context: AudioContext | undefined;
  let buffer: AudioBuffer | undefined;
  let decoding: Promise<void> | undefined;
  let source: AudioBufferSourceNode | undefined;

  const canPulse = () => active && !reducedMotion.matches;
  const stopSound = () => {
    source?.stop();
    source = undefined;
  };
  const cancelPulse = () => {
    clearTimeout(timer);
    animations.forEach((animation) => animation.cancel());
    animations = [];
    stopSound();
  };

  function pulse() {
    if (!canPulse()) return;
    // Lucide may recreate the icon when settings open, so use the current SVG.
    const bolt = box.querySelector<SVGElement>('.power-bolt');
    const spread = box.clientWidth;
    animations = [];
    if (bolt) {
      animations.push(
        bolt.animate(
          [
            { transform: 'translate(0, 0) rotate(0deg)' },
            { transform: 'translate(-1px, 0) rotate(-5deg)' },
            { transform: 'translate(1px, -1px) rotate(4deg)' },
            { transform: 'translate(-0.5px, 0) rotate(-3deg)' },
            { transform: 'translate(0, 0) rotate(0deg)' },
          ],
          { duration: 420, easing: 'ease-in-out' },
        ),
      );
    }
    for (const [index, spark] of sparks.entries()) {
      const [x, y] = directions[index % directions.length];
      animations.push(
        spark.animate(
          [
            { transform: 'translate(-50%, -50%) scale(0.3)', opacity: 0 },
            {
              transform: `translate(calc(-50% + ${x * spread * 0.3}px), calc(-50% + ${y * spread * 0.3}px)) scale(1)`,
              opacity: 0.85,
              offset: 0.2,
            },
            {
              transform: `translate(calc(-50% + ${x * spread}px), calc(-50% + ${y * spread}px)) scale(0.25)`,
              opacity: 0,
            },
          ],
          { duration: 540, easing: 'ease-out' },
        ),
      );
    }
    if (soundOn && context?.state === 'running' && buffer) {
      const current = context.createBufferSource();
      const gain = context.createGain();
      current.buffer = buffer;
      // The audio file is already quiet, including on mobile devices.
      gain.gain.value = 0.7;
      current.connect(gain).connect(context.destination);
      source = current;
      current.onended = () => {
        current.disconnect();
        gain.disconnect();
        if (source === current) source = undefined;
      };
      current.start();
    }
    timer = setTimeout(pulse, 3000);
  }

  function sync() {
    cancelPulse();
    if (canPulse()) {
      if (context && soundOn) void context.resume().catch(() => {});
      timer = setTimeout(pulse, 1400);
    } else if (context) {
      void context.suspend().catch(() => {});
    }
  }
  reducedMotion.addEventListener('change', sync);

  return {
    setActive(value: boolean) {
      if (active === value) return;
      active = value;
      sync();
    },
    setSoundEnabled(value: boolean) {
      soundOn = value;
      if (!value) {
        stopSound();
        if (context) void context.suspend().catch(() => {});
      }
    },
    activate() {
      if (!soundOn || reducedMotion.matches || !soundUrl) return;
      try {
        // Unlock only during a real user gesture; no automatic sound on page load.
        const audioContext = (context ??= new AudioContext());
        void audioContext
          .resume()
          .then(() => {
            if (!canPulse() || !soundOn) void audioContext.suspend().catch(() => {});
          })
          .catch(() => {});
        decoding ??= fetch(soundUrl)
          .then((response) => response.arrayBuffer())
          .then((data) => audioContext.decodeAudioData(data))
          .then((decoded) => {
            buffer = decoded;
          })
          .catch(() => {
            decoding = undefined;
          });
      } catch {
        // An unavailable optional sound must never block the menu.
      }
    },
  };
}
