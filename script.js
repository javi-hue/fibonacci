// script.js
(() => {
  const canvas = document.getElementById('chart');
  const ctx = canvas.getContext('2d');
  const drawBtn = document.getElementById('drawBtn');
  const termsInput = document.getElementById('terms');
  const typeSelect = document.getElementById('type');
  const valuesPre = document.getElementById('values');
  const tooltip = document.getElementById('tooltip');

  // DPR scaling to make canvas crisp on hi-dpi screens
  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Generate Fibonacci sequence (first n terms, starting with 0,1)
  function fibonacci(n) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      if (i === 0) arr.push(0);
      else if (i === 1) arr.push(1);
      else arr.push(arr[i-1] + arr[i-2]);
    }
    return arr;
  }

  // Map values to canvas coordinates
  function getScale(data, w, h, padding) {
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const xStep = (w - padding.left - padding.right) / Math.max(1, data.length - 1);
    const yRange = maxVal - minVal || 1;
    return { maxVal, minVal, xStep, yRange,
      xToCanvas: (i) => padding.left + i * xStep,
      yToCanvas: (v) => padding.top + (h - padding.top - padding.bottom) * (1 - (v - minVal) / yRange)
    };
  }

  // Draw axes, grid and labels
  function drawAxes(w, h, padding, scale) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;

    // horizontal grid lines (5)
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + i * (h - padding.top - padding.bottom)/5;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
    }
    ctx.stroke();

    // axes lines
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    // x axis
    ctx.moveTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    // y axis
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.stroke();

    // y labels
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '12px system-ui, Arial';
    for (let i = 0; i <= 5; i++) {
      const val = scale.minVal + (5 - i) * (scale.yRange / 5);
      const y = padding.top + i * (h - padding.top - padding.bottom)/5 + 4;
      ctx.fillText(Math.round(val), 6, y);
    }
    ctx.restore();
  }

  // Plot data as line, bars or dots
  function plotData(data, kind) {
    resizeCanvas();
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const padding = { top: 28, right: 24, bottom: 36, left: 36 };
    const scale = getScale(data, w, h, padding);

    // clear
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // draw axes & grid
    drawAxes(w,h,padding,scale);

    // draw depending on type
    if (kind === 'bar') {
      const barW = Math.max(6, (w - padding.left - padding.right) / data.length * 0.7);
      ctx.fillStyle = 'rgba(125,211,252,0.85)'; // accent-like
      data.forEach((v,i) => {
        const x = scale.xToCanvas(i) - barW/2;
        const y = scale.yToCanvas(v);
        const heightBar = (h - padding.bottom) - y;
        ctx.fillRect(x, y, barW, heightBar);
      });
    } else {
      // line or dots
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(125,211,252,0.95)';
      data.forEach((v,i) => {
        const x = scale.xToCanvas(i);
        const y = scale.yToCanvas(v);
        if (i === 0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      });
      if (kind === 'line') ctx.stroke();

      // draw points
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      data.forEach((v,i) => {
        const x = scale.xToCanvas(i);
        const y = scale.yToCanvas(v);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI*2);
        ctx.fill();
      });
    }

    // store positions for interactivity
    lastPlot = { data, scale, padding, w, h, kind };
  }

  // Interactivity: show tooltip when hovering near points
  let lastPlot = null;
  canvas.addEventListener('mousemove', (ev) => {
    if (!lastPlot) return;
    const rect = canvas.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const my = ev.clientY - rect.top;
    const { data, scale } = lastPlot;
    let closest = null;
    data.forEach((v,i) => {
      const x = scale.xToCanvas(i);
      const y = scale.yToCanvas(v);
      const dist = Math.hypot(x - mx, y - my);
      if (closest === null || dist < closest.dist) closest = {i, v, x, y, dist};
    });
    if (closest && closest.dist < 10) {
      tooltip.hidden = false;
      tooltip.style.left = `${closest.x}px`;
      tooltip.style.top = `${closest.y}px`;
      tooltip.textContent = `n=${closest.i} → ${closest.v}`;
    } else {
      tooltip.hidden = true;
    }
  });

  canvas.addEventListener('mouseleave', () => { tooltip.hidden = true; });

  // Render values into <pre>
  function showValues(data) {
    valuesPre.textContent = data.map((v,i)=> `${i}: ${v}`).join('\n');
  }

  // Main draw function
  function draw() {
    let n = parseInt(termsInput.value, 10) || 1;
    if (n < 1) n = 1;
    if (n > 50) n = 50; // safety
    const data = fibonacci(n);
    showValues(data);
    plotData(data, typeSelect.value);
  }

  // initial draw
  draw();

  drawBtn.addEventListener('click', draw);
  // allow Enter on input to redraw
  termsInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') draw(); });
})();
