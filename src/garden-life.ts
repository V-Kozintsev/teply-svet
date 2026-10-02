// Shared by the menu and all level builds. Native animation clocks only;
// no polling or JavaScript work per frame. Layout owns the collision-free route.
export type GardenBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

export function gardenWalkRange(
  box: GardenBox,
  obstacles: GardenBox[],
  left: number,
  right: number,
  distance: number,
) {
  let min = Math.max(left - box.x, -distance),
    max = Math.min(right - box.right, distance);
  for (const other of obstacles) {
    if (box.y >= other.bottom + 5 || box.bottom <= other.y - 5) continue;
    if (other.right <= box.x) min = Math.max(min, other.right + 5 - box.x);
    if (other.x >= box.right) max = Math.min(max, other.x - 5 - box.right);
  }
  return { min: Math.min(0, min), max: Math.max(0, max) };
}

type GardenClip = { start: number; count: number; duration: number };
type GardenSheet = { columns: number; rows: number; clips: Record<string, GardenClip> };
const gardenSpriteLoads = new Map<string, Promise<boolean>>();

// Optional decoration has a bounded preparation budget. Failure hides it for
// this visit, never exposing blank frames or stopping a playable level.
export async function prepareGardenSprites(scope: ParentNode): Promise<void> {
  await Promise.all(
    [...scope.querySelectorAll<HTMLElement>('.garden-art[data-atlas]')].map(async (art) => {
      const source = art.dataset.atlas!;
      let task = gardenSpriteLoads.get(source);
      if (!task) {
        task = new Promise<boolean>((resolve) => {
          const image = new Image();
          let settled = false;
          const finish = (ok: boolean) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            image.onload = image.onerror = null;
            if (!ok) image.removeAttribute('src');
            resolve(ok);
          };
          const timer = setTimeout(() => finish(false), 4000);
          image.onerror = () => finish(false);
          image.onload = async () => {
            try {
              if (typeof image.decode === 'function') await image.decode();
              finish(image.complete && image.naturalWidth > 0);
            } catch {
              finish(false);
            }
          };
          image.src = source;
        });
        gardenSpriteLoads.set(source, task);
      }
      const ready = await task;
      art.dataset.spriteReady = String(ready);
      const button = art.closest<HTMLButtonElement>('button')!;
      button.style.visibility = ready ? '' : 'hidden';
      button.disabled = !ready;
      if (ready) art.style.backgroundImage = `url("${source}")`;
    }),
  );
}

export function createGardenWalker(button: HTMLButtonElement, kind: 'cat' | 'hedgehog') {
  // Placement aliases stay stable; both drawings are now whole-frame rabbits.
  const art = button.querySelector<HTMLElement>('.garden-art')!;
  const sheet: GardenSheet = JSON.parse(art.dataset.sheet!);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = true,
    min = 0,
    max = 0,
    x = 0,
    direction = kind === 'cat' ? -1 : 1;
  let animations: Animation[] = [],
    version = 0,
    pendingGreeting = false,
    rests = 0;
  let tripDestination = 0;
  let phase = 'idle';
  const side = () => (direction < 0 ? 'left' : 'right');
  const position = (frame: number) =>
    `${((frame % sheet.columns) / (sheet.columns - 1)) * 100}% ${(Math.floor(frame / sheet.columns) / (sheet.rows - 1)) * 100}%`;
  function stop() {
    version++;
    animations.forEach((a) => a.cancel());
    animations = [];
  }
  function stand() {
    art.style.backgroundPosition = position(sheet.clips[`idle-${side()}`].start);
  }
  function play(name: string, next: () => void, iterations = 1, destination?: number) {
    stop();
    phase = name;
    button.dataset.gardenPhase = name;
    const clip = sheet.clips[`${name}-${side()}`];
    const loop = name === 'walk' || name === 'idle';
    const frames: Keyframe[] = Array.from({ length: clip.count + 1 }, (_, i) => ({
      backgroundPosition: position(
        clip.start + (i === clip.count ? (loop ? 0 : clip.count - 1) : i),
      ),
      offset: i / clip.count,
      easing: 'steps(1, end)',
    }));
    const sprite = art.animate(frames, { duration: clip.duration, iterations, fill: 'forwards' });
    animations.push(sprite);
    if (destination !== undefined) {
      tripDestination = destination;
      const journey = button.animate(
        [{ transform: `translateX(${x}px)` }, { transform: `translateX(${destination}px)` }],
        {
          duration: clip.duration * iterations,
          fill: 'forwards',
          easing: 'linear',
        },
      );
      animations.push(journey);
      const time = document.timeline.currentTime;
      if (time !== null) sprite.startTime = journey.startTime = time;
    }
    const token = version;
    sprite.onfinish = () => {
      if (version !== token) return;
      if (destination !== undefined) {
        x = tripDestination;
        button.style.transform = `translateX(${x}px)`;
      }
      next();
    };
    if (paused) animations.forEach((a) => a.pause());
  }
  function greet() {
    pendingGreeting = false;
    button.dataset.reacting = 'true';
    play('greet', () => {
      delete button.dataset.reacting;
      rests = 0;
      idle();
    });
  }
  function idle() {
    delete button.dataset.walking;
    stand();
    if (reduced.matches || button.hidden || art.dataset.spriteReady !== 'true') {
      stop();
      return;
    }
    if (pendingGreeting) {
      greet();
      return;
    }
    play('idle', () => {
      if (pendingGreeting) greet();
      else if (++rests >= (kind === 'cat' ? 2 : 3) && max - min >= 8) walk();
      else idle();
    });
  }
  function walk() {
    rests = 0;
    button.dataset.walking = 'true';
    const destination = Math.abs(x - min) < Math.abs(x - max) ? max : min;
    const nextDirection = destination > x ? 1 : -1;
    const start = () =>
      play('start', () => {
        if (pendingGreeting) {
          play('stop', greet);
          return;
        }
        const cycles = Math.max(
          1,
          Math.min(
            3,
            Math.round(Math.abs(destination - x) / Math.max(12, button.offsetWidth * 0.38)),
          ),
        );
        play('walk', () => play('stop', idle), cycles, destination);
      });
    if (direction !== nextDirection) {
      direction = nextDirection;
      play('turn', () => (pendingGreeting ? greet() : start()));
    } else start();
  }
  function configure(range: { min: number; max: number }) {
    stop();
    min = range.min;
    max = range.max;
    x = 0;
    rests = 0;
    pendingGreeting = false;
    button.style.transform = 'translateX(0px)';
    button.dataset.walkMin = String(min);
    button.dataset.walkMax = String(max);
    delete button.dataset.reacting;
    idle();
  }
  function setPaused(value: boolean) {
    if (paused === value) return;
    paused = value;
    animations.forEach((a) => {
      if (a.playState !== 'finished') value ? a.pause() : a.play();
    });
  }
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    if (paused || button.hidden || button.disabled || button.dataset.reacting) return;
    button.dataset.reacting = 'true';
    if (reduced.matches) {
      const response = art.animate([{ opacity: 1 }, { opacity: 0.65 }, { opacity: 1 }], {
        duration: 650,
      });
      animations.push(response);
      response.onfinish = () => {
        stop();
        delete button.dataset.reacting;
      };
    } else if (phase === 'idle') greet();
    else {
      pendingGreeting = true;
      // Finish the current cycle at the same speed, then greet. Shortening both
      // time and distance proportionally preserves the displayed position.
      if (phase === 'walk' && animations.length === 2) {
        const [sprite, journey] = animations;
        const timing = sprite.effect!.getTiming();
        const duration = Number(timing.duration);
        const iterations = timing.iterations ?? 1;
        const cycles = Math.max(
          1,
          Math.min(iterations, Math.ceil(Number(sprite.currentTime) / duration)),
        );
        tripDestination = x + ((tripDestination - x) * cycles) / iterations;
        (journey.effect as KeyframeEffect).setKeyframes([
          { transform: `translateX(${x}px)` },
          { transform: `translateX(${tripDestination}px)` },
        ]);
        journey.effect!.updateTiming({ duration: duration * cycles });
        sprite.effect!.updateTiming({ iterations: cycles });
      }
    }
  });
  reduced.addEventListener('change', () => {
    x = new DOMMatrixReadOnly(getComputedStyle(button).transform).m41;
    stop();
    button.style.transform = `translateX(${x}px)`;
    pendingGreeting = false;
    delete button.dataset.reacting;
    idle();
  });
  const ready = prepareGardenSprites(button).then(() => idle());
  stand();
  return { configure, setPaused, ready };
}

export type SceneryTarget = { kind: 'moon' | 'house' | 'tree'; element: Element };
export function createSceneryReactions(host: HTMLElement, soundEnabled: () => boolean) {
  const plane = document.createElement('div');
  plane.className = 'scenery-interactions';
  host.append(plane);
  let paused = true,
    audio: AudioContext | undefined;
  let requestedPause = true,
    pageAway = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const entries: { button: HTMLButtonElement; target: SceneryTarget; animations: Animation[] }[] =
    [];
  const voices = new Set<OscillatorNode>();
  function knock() {
    if (!soundEnabled() || paused || document.hidden) return;
    try {
      audio ??= new AudioContext();
      void audio.resume().catch(() => {});
      for (let i = 0; i < 3; i++) {
        const oscillator = audio.createOscillator(),
          gain = audio.createGain(),
          time = audio.currentTime + i * 0.17;
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(230, time);
        oscillator.frequency.exponentialRampToValueAtTime(100, time + 0.07);
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(0.065, time + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.095);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(time);
        oscillator.stop(time + 0.1);
        voices.add(oscillator);
        oscillator.onended = () => {
          voices.delete(oscillator);
          oscillator.disconnect();
          gain.disconnect();
        };
      }
    } catch {
      /* Optional sound never blocks the game. */
    }
  }
  function layout(targets: SceneryTarget[], obstacles: Element[] = []) {
    while (entries.length > targets.length) {
      const old = entries.pop()!;
      old.animations.forEach((a) => a.cancel());
      old.button.remove();
    }
    const origin = host.getBoundingClientRect();
    const occupied = obstacles.map((e) => e.getBoundingClientRect());
    targets.forEach((target, index) => {
      let entry = entries[index];
      if (!entry) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'scenery-touch';
        button.innerHTML = '<span class="scenery-response" aria-hidden="true"></span>';
        plane.append(button);
        entry = { button, target, animations: [] };
        entries.push(entry);
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          if (paused || entry.button.dataset.reacting || entry.button.hidden) return;
          const kind = entry.target.kind,
            response = button.firstElementChild!;
          button.dataset.reacting = 'true';
          if (kind === 'house') knock();
          const duration = kind === 'house' ? 850 : kind === 'moon' ? 1800 : 1400;
          const pulse = kind === 'house' ? [0, 0.85, 0, 0.85, 0, 0.85, 0] : [0, 1, 1, 0];
          const a = response.animate(
            pulse.map((opacity) => ({ opacity })),
            { duration, easing: 'ease-in-out' },
          );
          entry.animations = [a];
          if (kind === 'tree' && !reduced.matches) {
            const tree = entry.target.element as HTMLElement;
            tree.style.transformOrigin = '50% 100%';
            tree.style.transformBox = 'fill-box';
            entry.animations.push(
              tree.animate(
                [
                  { transform: 'rotate(0deg)' },
                  { transform: 'rotate(-2deg)' },
                  { transform: 'rotate(1.5deg)' },
                  { transform: 'rotate(-.7deg)' },
                  { transform: 'rotate(0deg)' },
                ],
                { duration, easing: 'ease-in-out' },
              ),
            );
          }
          a.onfinish = () => {
            entry.animations.forEach((a) => a.cancel());
            entry.animations = [];
            delete button.dataset.reacting;
          };
        });
      }
      if (entry.target.element !== target.element) {
        entry.animations.forEach((a) => a.cancel());
        entry.animations = [];
        delete entry.button.dataset.reacting;
      }
      entry.target = target;
      entry.button.dataset.scenery = target.kind;
      entry.button.setAttribute(
        'aria-label',
        target.kind === 'house'
          ? 'Постучать в дверь'
          : target.kind === 'moon'
            ? 'Подсветить луну'
            : 'Пошелестеть листвой',
      );
      const r = target.element.getBoundingClientRect(),
        size =
          target.kind === 'tree'
            ? Math.max(44, Math.min(90, r.width * 0.65))
            : target.kind === 'house'
              ? Math.max(44, Math.min(80, r.width * 0.3))
              : Math.max(44, r.width * 1.3);
      const cx = target.kind === 'house' ? r.left + r.width * 0.596 : r.left + r.width * 0.5,
        cy =
          target.kind === 'house'
            ? r.top + r.height * 0.83
            : target.kind === 'tree'
              ? r.top + r.height * 0.28
              : r.top + r.height * 0.5;
      const x = Math.max(
        2 - origin.left,
        Math.min(innerWidth - 2 - origin.left - size, cx - origin.left - size / 2),
      );
      const choices =
        target.kind === 'tree' ? [cy, r.top + r.height * 0.52, r.top + r.height * 0.78] : [cy];
      const y = choices
        .map((center) =>
          Math.max(2, Math.min(origin.height - size - 2, center - origin.top - size / 2)),
        )
        .find(
          (y) =>
            !occupied.some(
              (other) =>
                x + origin.left < other.right + 2 &&
                x + origin.left + size > other.left - 2 &&
                y + origin.top < other.bottom + 2 &&
                y + origin.top + size > other.top - 2,
            ),
        );
      entry.button.hidden =
        !r.width ||
        !r.height ||
        origin.height < size + 4 ||
        y === undefined ||
        getComputedStyle(target.element).display === 'none';
      if (entry.button.hidden) {
        entry.animations.forEach((a) => a.cancel());
        entry.animations = [];
        delete entry.button.dataset.reacting;
        return;
      }
      occupied.push(new DOMRect(x + origin.left, y! + origin.top, size, size));
      Object.assign(entry.button.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
      });
    });
  }
  function setPaused(value: boolean) {
    requestedPause = value;
    applyPause();
  }
  function applyPause() {
    const value = requestedPause || pageAway || document.hidden;
    if (paused === value) return;
    paused = value;
    plane.inert = value;
    plane.dataset.paused = String(value);
    entries.forEach((e) => e.animations.forEach((a) => (value ? a.pause() : a.play())));
    if (value) {
      voices.forEach((v) => {
        try {
          v.stop();
        } catch {}
      });
    }
  }
  plane.inert = true;
  plane.dataset.paused = 'true';
  document.addEventListener('visibilitychange', applyPause);
  for (const name of ['pagehide', 'freeze'])
    (name === 'freeze' ? document : window).addEventListener(name, () => {
      pageAway = true;
      applyPause();
    });
  for (const name of ['pageshow', 'resume'])
    (name === 'resume' ? document : window).addEventListener(name, () => {
      pageAway = false;
      applyPause();
    });
  reduced.addEventListener('change', () =>
    entries.forEach((entry) => {
      entry.animations.forEach((a) => a.cancel());
      entry.animations = [];
      delete entry.button.dataset.reacting;
    }),
  );
  return { layout, setPaused };
}
