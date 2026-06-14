/**
 * CFG renderer — لایه‌ها: پس‌زمینه → یال‌ها → گره‌ها → برچسب
 */
(function (global) {
  const COL = {
    start: { fill: '#c8e6c9', stroke: '#388e3c' },
    process: { fill: '#bbdefb', stroke: '#1565c0' },
    decision: { fill: '#fff9c4', stroke: '#f9a825' },
    return: { fill: '#e1bee7', stroke: '#8e24aa' },
    join: { fill: '#37474f', stroke: '#263238' },
  };

  function center(n) {
    return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
  }

  function estWidth(text, fs) {
    return String(text).length * fs * 0.58;
  }

  /** متن بلند را برای جا شدن داخل لوزی به چند خط می‌شکند */
  function autoLines(lines, maxChars) {
    const out = [];
    (lines || []).forEach((line) => {
      const s = String(line);
      if (s.length <= maxChars) {
        out.push(s);
        return;
      }
      const mid = Math.floor(s.length / 2);
      let splitAt = s.lastIndexOf(' ', mid);
      if (splitAt < 4) splitAt = s.indexOf(' ', mid);
      if (splitAt < 0) splitAt = mid;
      const a = s.slice(0, splitAt).trim();
      const b = s.slice(splitAt).trim();
      if (a) out.push(a);
      if (b) out.push(b);
    });
    return out.slice(0, 3);
  }

  /** اندازه لوزی را از روی متن حساب می‌کند — مرکز ثابت می‌ماند */
  function fitDecision(n) {
    const lines = autoLines(n.lines, 14);
    n.lines = lines;
    let maxW = 0;
    lines.forEach((line, i) => {
      const fs = i ? 8.5 : 10;
      maxW = Math.max(maxW, estWidth(line, fs));
    });
    const neededW = Math.ceil(maxW + 40);
    const neededH = Math.ceil(lines.length * 12 + 38);
    const newW = Math.max(n.w || 100, neededW);
    const newH = Math.max(n.h || 56, neededH);
    n.x -= (newW - n.w) / 2;
    n.y -= (newH - n.h) / 2;
    n.w = newW;
    n.h = newH;
  }

  function diamondPoints(n) {
    const c = center(n);
    return `${c.x},${n.y} ${n.x + n.w},${c.y} ${c.x},${n.y + n.h} ${n.x},${c.y}`;
  }

  function port(n, side) {
    const c = center(n);
    if (n.type === 'decision') {
      if (side === 'top') return { x: c.x, y: n.y };
      if (side === 'bottom') return { x: c.x, y: n.y + n.h };
      if (side === 'left') return { x: n.x, y: c.y };
      if (side === 'right') return { x: n.x + n.w, y: c.y };
    }
    if (n.type === 'join') {
      const cx = n.x + n.w / 2;
      const cy = n.y + n.h / 2;
      if (side === 'top') return { x: cx, y: cy - 10 };
      if (side === 'bottom') return { x: cx, y: cy + 10 };
      if (side === 'left') return { x: cx - 10, y: cy };
      if (side === 'right') return { x: cx + 10, y: cy };
    }
    if (side === 'top') return { x: c.x, y: n.y };
    if (side === 'bottom') return { x: c.x, y: n.y + n.h };
    if (side === 'left') return { x: n.x, y: c.y };
    if (side === 'right') return { x: n.x + n.w, y: c.y };
    return c;
  }

  function route(from, to, fromSide, toSide, waypoints) {
    const a = port(from, fromSide);
    const b = port(to, toSide);
    const pts = [{ x: a.x, y: a.y }];
    (waypoints || []).forEach((p) => pts.push(p));
    pts.push({ x: b.x, y: b.y });
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`;
    return { d, a, b };
  }

  function markerDefs(id) {
    return `
      <marker id="${id}G" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="#2e7d32"/>
      </marker>
      <marker id="${id}R" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="#c62828"/>
      </marker>
      <marker id="${id}B" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="#455a64"/>
      </marker>`;
  }

  function safeId(mid, id) {
    return `${mid}-clip-${String(id).replace(/[^a-z0-9]/gi, '')}`;
  }

  function render(containerId, spec) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const mid = spec.id || 'm';
    const nodes = {};
    spec.nodes.forEach((n) => {
      if (n.type === 'decision') fitDecision(n);
      nodes[n.id] = n;
    });

    let bgSvg = '';
    if (spec.region) {
      const r = spec.region;
      bgSvg = `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="6"
        fill="none" stroke="#90a4ae" stroke-width="1.5" stroke-dasharray="8,5"/>
        <text x="${r.x + 12}" y="${r.y + 20}" font-family="Tahoma" font-size="11" font-weight="700" fill="#37474f">${r.label}</text>`;
    }

    let edgeSvg = '';
    let labelSvg = '';
    spec.edges.forEach((e) => {
      const aNode = nodes[e.from];
      const bNode = nodes[e.to];
      if (!aNode || !bNode) return;
      const color = e.kind === 'T' ? '#2e7d32' : e.kind === 'F' ? '#c62828' : '#455a64';
      const mk = e.kind === 'T' ? `url(#${mid}G)` : e.kind === 'F' ? `url(#${mid}R)` : `url(#${mid}B)`;
      const { d, a, b } = route(aNode, bNode, e.fromSide || 'bottom', e.toSide || 'top', e.waypoints);
      edgeSvg += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" marker-end="${mk}"/>`;
      edgeSvg += `<circle cx="${a.x}" cy="${a.y}" r="4" fill="${color}"/>`;
      edgeSvg += `<circle cx="${b.x}" cy="${b.y}" r="4" fill="${color}"/>`;
      if (e.kind && e.label !== false) {
        const wp = e.waypoints && e.waypoints.length ? e.waypoints[0] : a;
        const lx = (wp.x + b.x) / 2;
        const ly = (wp.y + b.y) / 2 - 10;
        const tc = e.kind === 'T' ? '#2e7d32' : '#c62828';
        labelSvg += `<g transform="translate(${lx},${ly})"><rect x="-13" y="-10" width="26" height="18" rx="3" fill="#fff" stroke="${tc}" stroke-width="1.5"/>
          <text x="0" y="4" text-anchor="middle" font-family="Tahoma" font-size="11" font-weight="700" fill="${tc}">${e.kind}</text></g>`;
      }
      if (e.note) {
        const p = e.waypoints && e.waypoints.length ? e.waypoints[0] : a;
        labelSvg += `<text x="${p.x - 20}" y="${p.y - 8}" text-anchor="middle" font-family="Tahoma" font-size="9" fill="#546e7a">${e.note}</text>`;
      }
    });

    let clipDefs = '';
    let nodeSvg = '';
    spec.nodes.forEach((n) => {
      const st = COL[n.type] || COL.process;
      if (n.type === 'decision') {
        const clipId = safeId(mid, n.id);
        clipDefs += `<clipPath id="${clipId}"><polygon points="${diamondPoints(n)}"/></clipPath>`;
        nodeSvg += `<polygon points="${diamondPoints(n)}"
          fill="${st.fill}" stroke="${st.stroke}" stroke-width="2"/>`;
        const c = center(n);
        const lines = n.lines || [];
        const blockH = lines.length * 12;
        const startY = c.y - blockH / 2 + 8;
        nodeSvg += `<g clip-path="url(#${clipId})">`;
        lines.forEach((line, i) => {
          const fs = i ? 8.5 : 10;
          const fw = i ? 400 : 700;
          const fill = i ? '#546e7a' : '#212121';
          nodeSvg += `<text x="${c.x}" y="${startY + i * 12}" text-anchor="middle"
            font-family="Consolas,Tahoma" font-size="${fs}" font-weight="${fw}"
            fill="${fill}" style="direction:ltr;unicode-bidi:isolate">${line}</text>`;
        });
        nodeSvg += '</g>';
      } else if (n.type === 'join') {
        const cx = n.x + n.w / 2;
        const cy = n.y + n.h / 2;
        nodeSvg += `<circle cx="${cx}" cy="${cy}" r="10" fill="${st.fill}" stroke="${st.stroke}" stroke-width="2"/>`;
        if (n.lines && n.lines[0]) {
          nodeSvg += `<text x="${cx}" y="${cy + 26}" text-anchor="middle" font-family="Tahoma" font-size="10" font-weight="700" fill="#37474f">${n.lines[0]}</text>`;
        }
      } else {
        nodeSvg += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="4"
          fill="${st.fill}" stroke="${st.stroke}" stroke-width="2"/>`;
        const c = center(n);
        (n.lines || []).slice(0, 3).forEach((line, i) => {
          nodeSvg += `<text x="${c.x}" y="${c.y - 6 + i * 14}" text-anchor="middle"
            font-family="Consolas,Tahoma" font-size="${i ? 9 : 11}" font-weight="${i ? 400 : 700}"
            fill="${i ? '#546e7a' : '#212121'}" style="direction:ltr;unicode-bidi:isolate">${line}</text>`;
        });
      }
    });

    el.innerHTML = `
      <svg width="${spec.width}" height="${spec.height}" viewBox="0 0 ${spec.width} ${spec.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>${markerDefs(mid)}${clipDefs}</defs>
        <g id="cfg-bg">${bgSvg}</g>
        <g id="cfg-edges">${edgeSvg}</g>
        <g id="cfg-nodes">${nodeSvg}</g>
        <g id="cfg-labels">${labelSvg}</g>
      </svg>`;
  }

  global.CFGGraph = { render };
})(window);
