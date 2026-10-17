/* Original pixel-style hazard tiles and a deformable wooden spring plank. */
(function (root) {
  'use strict';
  function createBlockArt(document, type) {
    if (type === '^' || type === '~') {
      const image = document.createElement('img');
      image.className = 'block-art';
      image.src = `assets/${type === '^' ? 'spikes' : 'lava'}.svg`;
      image.alt = '';image.draggable = false;
      return {element: image};
    }
    if (type !== 'T') return null;
    const node = (name, attrs) => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', name);
      for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
      return element;
    };
    const svg = node('svg', {viewBox: '0 0 32 32', class: 'block-art spring-art', 'aria-hidden': 'true'});
    svg.append(node('path', {d: 'M2 9H6V29H2ZM26 9H30V29H26Z', fill: '#586b70'}));
    svg.append(node('path', {d: 'M4 10H6V28H4ZM28 10H30V28H28Z', fill: '#263b42'}));
    svg.append(node('path', {d: 'M1 28H8V31H1ZM24 28H31V31H24Z', fill: '#8a9c9b'}));
    const plank = node('path', {fill: '#b47a37', stroke: '#664421', 'stroke-width': 1});
    const grain = node('path', {fill: 'none', stroke: '#f4ce83', 'stroke-width': 1.4});
    svg.append(plank);svg.append(grain);
    svg.append(node('rect', {x: 2, y: 5, width: 3, height: 3, fill: '#d7e1d5'}));
    svg.append(node('rect', {x: 27, y: 5, width: 3, height: 3, fill: '#d7e1d5'}));
    const setBend = bend => {
      const center = (6 + bend * 12).toFixed(2);
      const bottom = (10 + bend * 12).toFixed(2);
      plank.setAttribute('d', `M2 6 Q16 ${center} 30 6 L30 10 Q16 ${bottom} 2 10 Z`);
      grain.setAttribute('d', `M5 7 Q16 ${(7 + bend * 12).toFixed(2)} 27 7`);
    };
    setBend(0);
    return {element: svg, setBend};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {createBlockArt};
  else root.GravityBlocks = {createBlockArt};
})(globalThis);
