(() => {
  const canvas = document.getElementById('chart');
  const ctx = canvas.getContext('2d');
  const drawBtn = document.getElementById('drawBtn');
  const termsInput = document.getElementById('terms');
  const typeSelect = document.getElementById('type');
  const logCheck = document.getElementById('logScale');
  const valuesPre = document.getElementById('values');
  const tooltip = document.getElementById('tooltip');

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

  function fibonacci(n) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      if (i === 0) arr.push(0);
      else if (i === 1) arr.push(1);
      else arr.push(arr[i-1] + arr[i-2]);
    }
    return arr;
  }

  function getScale(data, w, h, padding, log) {
    const transformed = log ? data.map(v => (v <= 0 ? 0 : Math.log10(v))) : data;
    const maxVal = Math.max(...transformed);
    const minVal = Math.min(...transformed);
    const xStep = (w - padding.left - padding.right) / Math.max(1, data.length - 1);
    const yRange = maxVal - minVal || 1;
    return {
      maxVal, minVal, xStep, yRange, log,
      xToCanvas: (i) => padding.left + i * xStep,
      yToCanvas: (v) => {
        const val = log ? (v <= 0 ? 0 : Math.log10(v)) : v;
        return padding.top + (h - padding.top - padding.bottom) * (1 - (val - minVal) / yRange);
      }
    };
  }

  function drawAxes(w, h, padding, scale) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;

    // grid horizontal
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + i * (h - padding.top - padding.bottom)/5;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
    }
    ctx.stroke();

    // axes
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.moveTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.stroke();

    // y labels
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '12px system-ui, Arial';
    for (let i = 0; i <= 5; i++) {
      const val = scale.minVal + (5 - i) * (scale.yRange / 5);
      const shown = scale.log ? `10^${val.toFixed(1)}` : Math.round(val);
      const y = padding.top + i * (h - padding.top - padding.bottom)/5 + 4;
      ctx.fillText(shown, 6, y);
    }
    ctx.restore();
  }

  function plotData(data, kind, log) {
    resizeCanvas();
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const padding = { top: 28, right: 24, bottom: 36, left: 36 };
    const scale = getScale(data, w, h, padding, log);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawAxes(w,h,padding,scale);
    lastPlot = { data, scale, padding, w, h, kind };

    // animación
    let progress = 0;
    const steps = 60; // frames (~1s)

    function animate() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      drawAxes(w,h,padding,scale);
      progress++;
      const ratio = progress / steps;
      const visible = Math.floor(data.length * ratio);
      const interp = (data.length * ratio) % 1;

      if (kind === 'bar') {
        const barW = Math.max(6, (w - padding.left - padding.right) / data.length * 0.7);
        ctx.fillStyle = 'rgba(125,211,252,0.85)';
        data.forEach((v,i) => {
          if (i <= visible) {
            const x = scale.xToCanvas(i) - barW/2;
            const y = scale.yToCanvas(v);
            const hBar = (h - padding.bottom) - y;
            ctx.fillRect(x, y, barW, hBar);
          }
        });
      } else {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(125,211,252,0.95)';
        data.forEach((v,i) => {
          if (i === 0) ctx.moveTo(scale.xToCanvas(0), scale.yToCanvas(data[0]));
          else if (i <= visible) ctx.lineTo(scale.xToCanvas(i), scale.yToCanvas(v));
        });
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        data.forEach((v,i) => {
          if (i <= visible)
            ctx.beginPath(), ctx.arc(scale.xToCanvas(i), scale.yToCanvas(v), 4, 0, Math.PI*2), ctx.fill();
        });
      }

      if (progress < steps) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

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
  canvas.addEventListener('mouseleave', () => tooltip.hidden = true);

  function showValues(data) {
    valuesPre.textContent = data.map((v,i)=> `${i}: ${v}`).join('\n');
  }

  function draw() {
    let n = parseInt(termsInput.value, 10) || 1;
    n = Math.max(1, Math.min(n, 50));
    const data = fibonacci(n);
    showValues(data);
    plotData(data, typeSelect.value, logCheck.checked);
  }

  drawBtn.addEventListener('click', draw);
})();
