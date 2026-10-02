const svgNamespace = 'http://www.w3.org/2000/svg';

// Static meadow geometry follows the real transformer and house bounds.
export function createMenuGarden(sceneArt: HTMLElement) {
  const back = document.createElementNS(svgNamespace, 'svg');
  const front = document.createElementNS(svgNamespace, 'svg');
  back.setAttribute('class', 'menu-garden-back');
  back.setAttribute('aria-hidden', 'true');
  front.setAttribute('class', 'menu-garden-front');
  front.setAttribute('aria-hidden', 'true');
  sceneArt.prepend(back);
  sceneArt.append(front);
  let lastGeometry = '';

  return (house: DOMRect, source: DOMRect, bounds: DOMRect) => {
    const geometry = [
      bounds.width,
      bounds.height,
      house.x,
      house.y,
      house.width,
      source.x,
      source.y,
      source.width,
    ].join(',');
    if (geometry === lastGeometry || !bounds.width || !bounds.height) return;
    lastGeometry = geometry;
    const node = (tag: string, attributes: Record<string, string | number>) => {
      const element = document.createElementNS(svgNamespace, tag);
      for (const [name, value] of Object.entries(attributes))
        element.setAttribute(name, String(value));
      return element;
    };
    const add = (
      layer: SVGSVGElement | SVGElement,
      tag: string,
      attributes: Record<string, string | number>,
    ) => {
      const element = node(tag, attributes);
      layer.append(element);
      return element;
    };
    for (const layer of [back, front]) {
      layer.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      layer.replaceChildren();
    }
    const defs = add(back, 'defs', {});
    defs.innerHTML =
      '<linearGradient id="menu-lawn" x2="0" y2="1"><stop stop-color="#315f49"/><stop offset="1" stop-color="#163f3e"/></linearGradient><linearGradient id="menu-trail" x2="0" y2="1"><stop stop-color="#9d9165"/><stop offset="1" stop-color="#606b4b"/></linearGradient><radialGradient id="menu-house-light"><stop stop-color="#ffda6866"/><stop offset="1" stop-color="#e6c44c00"/></radialGradient>';

    const houseX = house.left - bounds.left;
    const houseBottom = house.bottom - bounds.top;
    const sourceBottom = source.bottom - bounds.top;
    const ground = Math.min(bounds.height - 8, Math.max(houseBottom, sourceBottom));
    add(back, 'path', {
      d: `M0 ${ground - bounds.height * 0.04}Q${bounds.width * 0.28} ${ground - bounds.height * 0.11} ${bounds.width * 0.55} ${ground - bounds.height * 0.02}T${bounds.width} ${ground - bounds.height * 0.06}V${bounds.height}H0Z`,
      fill: 'url(#menu-lawn)',
    });

    const doorX = houseX + house.width * (287 / 482);
    const depth = Math.max(18, bounds.height - houseBottom);
    const trail = add(back, 'path', {
      d: `M${doorX - house.width * 0.045} ${houseBottom}C${doorX - house.width * 0.02} ${houseBottom + depth * 0.3} ${bounds.width * 0.56} ${houseBottom + depth * 0.55} ${bounds.width * 0.62} ${bounds.height + 6}L${bounds.width * 0.75} ${bounds.height + 6}C${bounds.width * 0.66} ${houseBottom + depth * 0.5} ${doorX + house.width * 0.045} ${houseBottom + depth * 0.28} ${doorX + house.width * 0.045} ${houseBottom}Z`,
      fill: 'url(#menu-trail)',
      'data-meadow-door': '0',
    }) as SVGPathElement;
    add(back, 'ellipse', {
      class: 'menu-garden-light',
      cx: doorX - house.width * 0.12,
      cy: houseBottom + depth * 0.16,
      rx: house.width * 0.42,
      ry: Math.max(14, depth * 0.36),
      fill: 'url(#menu-house-light)',
    });
    const length = trail.getTotalLength();
    for (const fraction of [0.14, 0.34, 0.56, 0.78]) {
      const point = trail.getPointAtLength(length * fraction);
      add(back, 'ellipse', {
        cx: point.x,
        cy: point.y,
        rx: Math.max(4, house.width * 0.018),
        ry: Math.max(2, house.width * 0.007),
        fill: '#9c9b73',
        opacity: '.75',
      });
    }
    for (let index = 0; index < 26; index++) {
      const x = (((index * 43 + 11) % 101) / 100) * bounds.width;
      const y = ground + (((index * 29 + 7) % 91) / 100) * (bounds.height - ground);
      if (Math.abs(x - doorX) < house.width * 0.12) continue;
      const size = Math.max(2.5, bounds.width * 0.0045);
      add(back, 'path', {
        d: `M${x} ${y}q${-size} ${-size} ${-size * 0.8} ${-size * 2.2}q${size * 1.2} ${size} ${size * 1.1} ${size * 2.2}q${size * 0.2} ${-size * 2.1} ${size * 1.4} ${-size * 2.7}q${size * 0.1} ${size * 1.8} ${-size * 0.7} ${size * 2.8}Z`,
        fill: index % 2 ? '#386d4b' : '#214f43',
        opacity: '.8',
      });
    }
    for (const [x, size] of [
      [bounds.width * 0.02, 1.1],
      [bounds.width * 0.98, 1.25],
    ] as const) {
      add(front, 'path', {
        d: `M${x - 42 * size} ${bounds.height + 4}Q${x - 55 * size} ${bounds.height - 25 * size} ${x - 24 * size} ${bounds.height - 28 * size}Q${x - 20 * size} ${bounds.height - 55 * size} ${x + 2 * size} ${bounds.height - 39 * size}Q${x + 28 * size} ${bounds.height - 51 * size} ${x + 37 * size} ${bounds.height - 24 * size}Q${x + 58 * size} ${bounds.height - 15 * size} ${x + 43 * size} ${bounds.height + 4}Z`,
        fill: '#0d343a',
      });
    }
  };
}
