// Draw only the board's light in a bounded bitmap. Pipe artwork, hit targets,
// stars and the circuit/animation clock remain with their original controllers.
function createLightQuality(initialDensity, change) {
  let density = initialDensity, last = null, samples = [];
  return {
    frame(now, active) {
      const dt = last === null ? 0 : now - last;
      last = active ? now : null;
      if (!active || dt <= 0 || dt > 200) { samples = []; return; }
      if (density <= 1) return;
      samples.push(dt);
      if (samples.length < 90) return;
      const ordered = [...samples].sort((a, b) => a - b);
      // Occasional input/storage stalls and high-refresh displays do not lower quality.
      const slow = ordered[45] > 24 && samples.filter(value => value > 25).length >= 60;
      samples = [];
      if (slow) { density = Math.max(1, density - 0.5); change(density); }
    },
  };
}
function createFirstEnergyCanvas(root, svg, reduced = false) {
  if (typeof Path2D === 'undefined' || typeof ResizeObserver === 'undefined')
    return null;
  const board = svg.parentElement,
    extent = svg.viewBox.baseVal.width;
  const canvas = document.createElement('canvas');
  canvas.className = 'first-energy-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const surfaces = [
    canvas,
    ...Array.from({ length: 3 }, () => document.createElement('canvas')),
  ];
  let contexts;
  try {
    contexts = surfaces.map((c) => c.getContext('2d'));
  } catch {
    return null;
  }
  if (contexts.some((c) => !c)) return null;
  const [screen, layer, interior, arrival] = contexts;
  const test = svg.querySelector('.test-base'),
    energy = svg.querySelector('.energy-layer'),
    wave = svg.querySelector('.travel-wave'),
    end = svg.querySelector('.end-glow'),
    front = svg.querySelector('.arrival-mask');
  const groups = [test, energy, wave];
  const masks = [...svg.querySelector('.interior-mask').children];
  const geometry = new WeakMap(),
    looks = new Map();
  let density = Math.min(devicePixelRatio || 1, 2);
  const quality = createLightQuality(density, value => {
    density = value;
    resize();
  });
  let resolution = 0,
    maskKey = '',
    observer = null,
    disabled = false,
    hadLight = false;
  const number = (s, fallback = 0) =>
    Number.isFinite(parseFloat(s)) ? parseFloat(s) : fallback;
  const dash = (s) =>
    s && s !== 'none' ? s.split(/[ ,]+/).map(parseFloat) : [];
  function shape(el) {
    const d = el.getAttribute('d') || '';
    let value = geometry.get(el);
    if (!value || value.d !== d) {
      value = { d, path: new Path2D(d) };
      geometry.set(el, value);
    }
    return value.path;
  }
  function appearance(el) {
    const key =
      (el.parentElement.getAttribute('class') || '') +
      '|' +
      (el.getAttribute('class') || '');
    let value = looks.get(key);
    if (!value) {
      const s = getComputedStyle(el);
      value = {
        stroke: s.stroke,
        width: number(s.strokeWidth),
        opacity:
          el.classList.contains('test-particles') ||
          el.classList.contains('energy-particles')
            ? 1
            : number(s.opacity, 1),
        cap: s.strokeLinecap,
        join: s.strokeLinejoin,
        dash: dash(s.strokeDasharray),
      };
      looks.set(key, value);
    }
    return value;
  }
  for (const group of groups) for (const el of group.children) appearance(el);
  function clear(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, resolution, resolution);
    ctx.setTransform(resolution / extent, 0, 0, resolution / extent, 0, 0);
  }
  function bitmap(ctx, image, alpha = 1, operation = 'source-over') {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = operation;
    ctx.drawImage(image, 0, 0);
    ctx.restore();
  }
  function prepareMask() {
    const key = masks
      .map((el) => (el.getAttribute('d') || '') + '|' + el.style.transform)
      .join(';');
    if (key === maskKey) return;
    maskKey = key;
    clear(interior);
    interior.strokeStyle = 'white';
    interior.fillStyle = 'white';
    interior.lineWidth = 14;
    interior.lineCap = 'butt';
    interior.lineJoin = 'round';
    interior.setLineDash([]);
    for (const el of masks) {
      if (el.tagName.toLowerCase() === 'circle') {
        interior.beginPath();
        interior.arc(
          number(el.getAttribute('cx')),
          number(el.getAttribute('cy')),
          number(el.getAttribute('r')),
          0,
          Math.PI * 2,
        );
        interior.fill();
        continue;
      }
      const offset = el.style.transform.match(/^translate\(([-\d.]+)px,\s*([-\d.]+)px\)$/),
        [x, y] = el.style.transformOrigin.split(' ').map(parseFloat),
        angle =
          (number(el.style.transform.replace('rotate(', '')) * Math.PI) / 180;
      interior.save();
      if (offset) {
        // Sliding pipes carry the light opening with their carriage.
        interior.translate(Number(offset[1]), Number(offset[2]));
      } else {
        interior.translate(x, y);
        interior.rotate(angle);
        interior.translate(-x, -y);
      }
      interior.stroke(shape(el));
      interior.restore();
    }
  }
  function paintGroup(group, reduced) {
    const alpha = number(group.style.opacity);
    if (alpha <= 0) return;
    clear(layer);
    for (const el of group.children) {
      if (
        reduced &&
        (el.classList.contains('test-particles') ||
          el.classList.contains('energy-particles'))
      )
        continue;
      const s = appearance(el);
      layer.strokeStyle = s.stroke;
      layer.lineWidth = s.width;
      layer.globalAlpha = s.opacity;
      layer.lineCap = s.cap;
      layer.lineJoin = s.join;
      layer.setLineDash(
        el.style.strokeDasharray ? dash(el.style.strokeDasharray) : s.dash,
      );
      layer.lineDashOffset = number(el.style.strokeDashoffset);
      layer.stroke(shape(el));
    }
    if (group === energy) {
      clear(arrival);
      arrival.strokeStyle = 'white';
      arrival.lineWidth = 22;
      arrival.lineCap = 'butt';
      arrival.lineJoin = 'round';
      for (const el of front.children) {
        arrival.setLineDash(dash(el.style.strokeDasharray));
        arrival.lineDashOffset = number(el.style.strokeDashoffset);
        arrival.stroke(shape(el));
      }
      bitmap(layer, surfaces[3], 1, 'destination-in');
    }
    bitmap(layer, surfaces[2], 1, 'destination-in');
    bitmap(screen, surfaces[1], alpha);
  }
  function paint() {
    if (disabled || !resolution) return;
    try {
      const visible =
        groups.some((g) => number(g.style.opacity) > 0) ||
        number(end.style.opacity) > 0;
      if (!visible) {
        if (hadLight) clear(screen);
        hadLight = false;
        return;
      }
      hadLight = true;
      clear(screen);
      prepareMask();
      for (const group of groups) paintGroup(group, reduced);
      const alpha = number(end.style.opacity);
      if (alpha > 0) {
        clear(layer);
        const x = number(end.getAttribute('cx')),
          y = number(end.getAttribute('cy')),
          r = number(end.getAttribute('r'), 13),
          g = layer.createRadialGradient(x, y, 0, x, y, r);
        for (const [at, a] of [
          [0, 0.95],
          [0.35, 0.85],
          [0.6, 0.42],
          [0.82, 0.1],
          [1, 0],
        ])
          g.addColorStop(at, `rgba(255,225,160,${a})`);
        layer.fillStyle = g;
        layer.fillRect(x - r, y - r, r * 2, r * 2);
        bitmap(layer, surfaces[2], 1, 'destination-in');
        bitmap(screen, surfaces[1], alpha);
      }
    } catch {
      disable();
    }
  }
  function resize() {
    // Bound backing-store cost independently of a phone's advertised DPR.
    const size = Math.max(
      1,
      Math.min(
        1024,
        Math.ceil(board.clientWidth * density),
      ),
    );
    if (size === resolution) return;
    resolution = size;
    canvas.dataset.density = String(density);
    for (const c of surfaces) c.width = c.height = size;
    maskKey = '';
    paint();
  }
  function disable() {
    disabled = true;
    observer?.disconnect();
    canvas.remove();
    for (const g of groups) g.parentElement.style.display = '';
    for (const c of surfaces) c.width = c.height = 1;
  }
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '2',
    pointerEvents: 'none',
  });
  board.insertBefore(canvas, svg);
  for (const g of groups) g.parentElement.style.display = 'none';
  observer = new ResizeObserver(resize);
  observer.observe(board);
  resize();
  canvas.addEventListener('contextlost', disable, { once: true });
  return {
    paint,
    observeFrame(now, continuous) {
      quality.frame(now, continuous && !disabled && !reduced && !document.hidden &&
        root.dataset.paused !== 'true' && !document.getElementById('level-entry'));
    },
    setReduced(value) {
      reduced = value;
      paint();
    },
  };
}
