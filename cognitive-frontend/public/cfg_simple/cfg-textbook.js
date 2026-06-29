/**
 * CFG renderer — SWE 637 textbook style
 * numbered blue circles · conditions on edges · dummy node (hatched) · loop-back edges
 */
(function (global) {
  function angle(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }

  function edgePoint(node, r, toward) {
    const a = angle(node, toward);
    return { x: node.x + r * Math.cos(a), y: node.y + r * Math.sin(a) };
  }

  function edgePath(p1, p2, waypoints) {
    const pts = [p1, ...(waypoints || []), p2];
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`;
    return d;
  }

  function render(containerId, spec) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const r = spec.radius || 22;
    const nodes = {};
    spec.nodes.forEach((n) => {
      nodes[n.id] = n;
    });

    let edgeSvg = '';
    let labelSvg = '';
    let nodeSvg = '';

    if (spec.entry) {
      const n = nodes[spec.entry];
      edgeSvg += `<line x1="${n.x}" y1="${n.y - r - 28}" x2="${n.x}" y2="${n.y - r - 2}"
        stroke="#212121" stroke-width="2" marker-end="url(#tb-arrow)"/>`;
    }

    (spec.edges || []).forEach((e) => {
      const a = nodes[e.from];
      const b = nodes[e.to];
      if (!a || !b) return;
      const p1 = edgePoint(a, r, b);
      const p2 = edgePoint(b, r, a);
      const d = edgePath(p1, p2, e.waypoints);
      edgeSvg += `<path d="${d}" fill="none" stroke="#212121" stroke-width="2" marker-end="url(#tb-arrow)"/>`;
      if (e.label) {
        const mx = e.lx != null ? e.lx : (p1.x + p2.x) / 2 + (e.labelDx || 0);
        const my = e.ly != null ? e.ly : (p1.y + p2.y) / 2 + (e.labelDy || -8);
        labelSvg += `<text x="${mx}" y="${my}" text-anchor="middle"
          font-family="Consolas, monospace" font-size="13" fill="#212121">${e.label}</text>`;
      }
      if (e.note) {
        labelSvg += `<text x="${e.noteX || p1.x}" y="${e.noteY || p1.y - 6}"
          font-family="Arial, sans-serif" font-size="11" font-style="italic" fill="#1565c0">${e.note}</text>`;
      }
    });

    spec.nodes.forEach((n) => {
      if (n.dummy) {
        nodeSvg += `<circle cx="${n.x}" cy="${n.y}" r="${r}" fill="url(#tb-hatch)"
          stroke="#212121" stroke-width="2"/>`;
      } else {
        nodeSvg += `<circle cx="${n.x}" cy="${n.y}" r="${r}" fill="#1565c0"
          stroke="#212121" stroke-width="2"/>`;
      }
      nodeSvg += `<text x="${n.x}" y="${n.y + 6}" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="${n.dummy ? '#212121' : '#fff'}">${n.id}</text>`;
      if (n.code) {
        const side = n.side || 'right';
        const tx = side === 'right' ? n.x + r + 14 : n.x - r - 14;
        const anchor = side === 'right' ? 'start' : 'end';
        String(n.code).split('\n').forEach((line, i) => {
          nodeSvg += `<text x="${tx}" y="${n.y - 6 + i * 18}" text-anchor="${anchor}"
            font-family="Consolas, monospace" font-size="13" fill="#212121">${line}</text>`;
        });
      }
    });

    if (spec.title) {
      labelSvg += `<text x="${spec.width / 2}" y="${spec.height - 16}" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#212121">${spec.title}</text>`;
    }

    el.innerHTML = `
      <svg width="${spec.width}" height="${spec.height}" viewBox="0 0 ${spec.width} ${spec.height}"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tb-hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#90caf9" stroke-width="3"/>
          </pattern>
          <marker id="tb-arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#212121"/>
          </marker>
        </defs>
        <g>${edgeSvg}</g>
        <g>${nodeSvg}</g>
        <g>${labelSvg}</g>
      </svg>`;
  }

  global.CFGTextbook = { render };
})(window);
