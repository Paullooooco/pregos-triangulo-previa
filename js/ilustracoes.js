// Ilustrações técnicas de cada linha (SVG gerado).
// Para usar foto real: coloque img/produtos/<id>.jpg e preencha FOTOS abaixo.
(function () {
  const FOTOS = {
    'com-cabeca': 'img/produtos/com-cabeca.jpg',
    'cabeca-dupla': 'img/produtos/cabeca-dupla.jpg',
    'sem-cabeca': 'img/produtos/sem-cabeca.jpg',
    'ardox': 'img/produtos/ardox.jpg',
    'telhado': 'img/produtos/telhado.jpg',
    'grampos': 'img/produtos/grampos.jpg',
    'taco': 'img/produtos/taco.jpg',
    'arames': 'img/produtos/arames.jpg',
  };

  const STEEL = [['0', '#5d646b'], ['.32', '#dfe3e6'], ['.46', '#ffffff'], ['.7', '#9ea5ac'], ['1', '#454b51']];
  const ZINC = [['0', '#6f767c'], ['.35', '#c9ced2'], ['.5', '#e4e7e9'], ['.75', '#a3a9ae'], ['1', '#5a6066']];
  const BLACK = [['0', '#1f2124'], ['.4', '#5b5f63'], ['.55', '#73777b'], ['1', '#191b1d']];

  function grad(id, stops, horizontal) {
    const dir = horizontal ? 'x1="0" y1="0" x2="1" y2="0"' : 'x1="0" y1="0" x2="0" y2="1"';
    return `<linearGradient id="${id}" ${dir}>${stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"/>`).join('')}</linearGradient>`;
  }

  // Prego desenhado na horizontal (cabeça em x=0), depois girado
  function prego(o, ids, sombra) {
    const { len, t, head = 'flat', grooves = false } = o;
    const fV = sombra ? '#000' : `url(#${ids.v})`;
    const fH = sombra ? '#000' : `url(#${ids.h})`;
    let s = '';
    if (head === 'flat' || head === 'double') {
      const hw = t * 0.85, hh = t * 3.1;
      s += `<rect x="${-hw}" y="${-hh / 2}" width="${hw}" height="${hh}" rx="${hw * 0.35}" fill="${fH}"/>`;
      if (head === 'double') s += `<rect x="${t * 2.4}" y="${-hh / 2.2}" width="${hw}" height="${hh / 1.1}" rx="${hw * 0.35}" fill="${fH}"/>`;
    } else if (head === 'lost') {
      s += `<rect x="${-t * 0.5}" y="${-t * 0.78}" width="${t * 0.62}" height="${t * 1.56}" rx="${t * 0.25}" fill="${fH}"/>`;
    } else if (head === 'umbrella') {
      const hh = t * 5.4;
      s += `<path d="M${t * 0.2},${-hh / 2} Q${-t * 2.6},0 ${t * 0.2},${hh / 2} Q${-t * 0.9},0 ${t * 0.2},${-hh / 2}Z" fill="${fH}"/>`;
    }
    s += `<rect x="0" y="${-t / 2}" width="${len}" height="${t}" fill="${fV}"/>`;
    s += `<path d="M${len},${-t / 2} L${len + t * 2.3},0 L${len},${t / 2}Z" fill="${fV}"/>`;
    if (!sombra) {
      if (grooves) {
        for (let x = len * 0.18; x < len * 0.92; x += t * 0.9) {
          s += `<path d="M${x},${-t / 2} L${x + t * 0.75},${t / 2}" stroke="#2c3136" stroke-opacity=".38" stroke-width="${t * 0.16}"/>`;
        }
      } else if (head !== 'lost') {
        for (let i = 1; i <= 3; i++) {
          const x = t * 0.5 + i * t * 0.45 + (head === 'double' ? t * 3 : 0);
          s += `<path d="M${x},${-t / 2} V${t / 2}" stroke="#2c3136" stroke-opacity=".22" stroke-width="${t * 0.12}"/>`;
        }
      }
    }
    return s;
  }

  function grampo(o, ids, sombra) {
    const { w, h, t } = o;
    const f = sombra ? '#000' : `url(#${ids.v})`;
    const r = w / 2;
    return `<path d="M0,${h} V${r} A${r},${r} 0 0 1 ${w},${r} V${h}" fill="none" stroke="${f}" stroke-width="${t}"/>` +
      `<path d="M${-t / 2},${h} L0,${h + t * 2.2} L${t / 2},${h}Z" fill="${f}"/>` +
      `<path d="M${w - t / 2},${h} L${w},${h + t * 2.2} L${w + t / 2},${h}Z" fill="${f}"/>`;
  }

  function cena(id, pecas, metal, escala = 1.22) {
    const ids = { v: `${id}-v`, h: `${id}-h`, sh: `${id}-sh` };
    const stops = metal === 'zinc' ? ZINC : STEEL;
    let defs = grad(ids.v, stops) + grad(ids.h, stops, true) +
      `<filter id="${ids.sh}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>`;
    let sombras = '', corpos = '';
    pecas.forEach(p => {
      const fn = p.tipo === 'grampo' ? grampo : prego;
      const tr = `translate(${p.x},${p.y}) rotate(${p.a || 0})`;
      sombras += `<g transform="translate(7,9) ${tr}" opacity=".22">${fn(p, ids, true)}</g>`;
      corpos += `<g transform="${tr}">${fn(p, ids, false)}</g>`;
    });
    return `<svg viewBox="0 0 400 300" role="img" aria-hidden="true"><defs>${defs}</defs><g transform="translate(200 160) scale(${escala}) translate(-200 -160)"><g filter="url(#${ids.sh})">${sombras}</g>${corpos}</g></svg>`;
  }

  function bobina(id) {
    const sh = `${id}-sh`;
    const cores = ['#2b2e31', '#3b3f43', '#55595d', '#6d7175', '#34373a', '#46494d'];
    let fios = '';
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 46; i++) {
      const k = i / 45;
      const rx = 72 + k * 50 + rnd() * 3, ry = 40 + k * 32 + rnd() * 2;
      const rot = (rnd() - 0.5) * 4;
      fios += `<ellipse cx="200" cy="150" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" transform="rotate(${rot.toFixed(1)} 200 150)" fill="none" stroke="${cores[i % cores.length]}" stroke-width="2.1"/>`;
    }
    // brilho sobre o arame
    fios += `<ellipse cx="200" cy="150" rx="97" ry="56" fill="none" stroke="#c7cbce" stroke-opacity=".35" stroke-width="10" stroke-dasharray="70 540" stroke-dashoffset="-40"/>`;
    const amarra = (x, y, a) => `<g transform="translate(${x},${y}) rotate(${a})"><path d="M-3,-22 C6,-10 -6,10 3,22" stroke="#8d9296" stroke-width="2.4" fill="none"/><path d="M3,-22 C-6,-10 6,10 -3,22" stroke="#5f6468" stroke-width="2.4" fill="none"/></g>`;
    return `<svg viewBox="0 0 400 300" role="img" aria-hidden="true"><defs><filter id="${sh}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter></defs>` +
      `<ellipse cx="208" cy="166" rx="124" ry="76" fill="#000" opacity=".22" filter="url(#${sh})"/>` +
      `<g transform="translate(200 150) scale(1.12) translate(-200 -150)">${fios}` +
      amarra(103, 150, 0) + amarra(297, 150, 0) + amarra(200, 94, 90) + amarra(200, 206, 90) + `</g></svg>`;
  }

  const ILUSTRACOES = {
    'com-cabeca': cena('com-cabeca', [
      { x: 62, y: 214, len: 262, t: 10, a: -20 },
      { x: 120, y: 248, len: 196, t: 8, a: -9 },
      { x: 92, y: 140, len: 130, t: 6, a: -24 },
    ]),
    'cabeca-dupla': cena('cabeca-dupla', [
      { x: 70, y: 200, len: 250, t: 10, a: -18, head: 'double' },
      { x: 112, y: 250, len: 210, t: 9, a: -6, head: 'double' },
    ]),
    'sem-cabeca': cena('sem-cabeca', [
      { x: 70, y: 196, len: 260, t: 6, a: -20, head: 'lost' },
      { x: 92, y: 234, len: 220, t: 5.5, a: -12, head: 'lost' },
      { x: 120, y: 150, len: 160, t: 4.5, a: -26, head: 'lost' },
    ]),
    'ardox': cena('ardox', [
      { x: 70, y: 206, len: 250, t: 10, a: -18, grooves: true },
      { x: 118, y: 250, len: 190, t: 8, a: -7, grooves: true },
    ]),
    'telhado': cena('telhado', [
      { x: 92, y: 196, len: 220, t: 9, a: -18, head: 'umbrella', grooves: true },
      { x: 138, y: 250, len: 170, t: 8, a: -6, head: 'umbrella', grooves: true },
    ], 'zinc'),
    'grampos': cena('grampos', [
      { tipo: 'grampo', x: 110, y: 70, w: 70, h: 120, t: 11, a: -14 },
      { tipo: 'grampo', x: 230, y: 96, w: 62, h: 104, t: 10, a: 12 },
    ], 'zinc'),
    'taco': cena('taco', [
      { x: 96, y: 190, len: 120, t: 12, a: -22 },
      { x: 150, y: 236, len: 104, t: 11, a: -4 },
      { x: 236, y: 132, len: 88, t: 10, a: -30 },
    ]),
    'arames': bobina('arames'),
  };

  // imediata = true para imagens do topo da página (sem carregamento preguiçoso)
  window.imagemProduto = function (id, alt, imediata) {
    if (FOTOS[id]) return `<img src="${FOTOS[id]}" alt="${alt || ''}" width="780" height="520"${imediata ? '' : ' loading="lazy"'}>`;
    return ILUSTRACOES[id] || '';
  };
})();
