(() => {
  const canvas = document.getElementById('chart');
  const ctx = canvas.getContext('2d');
  const drawBtn = document.getElementById('drawBtn');
  const exportBtn = document.getElementById('exportBtn');
  const termsInput = document.getElementById('terms');
  const typeSelect = document.getElementById('type');
  const logCheck = document.getElementById('logScale');
  const valuesPre = document.getElementById('values');
  const tooltip = document.getElementById('tooltip');
  let lastPlot = null;

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

  function getScale(data, w, h, pad, log) {
    const t = log ? data.map(v => (v <= 0 ? 0 : Math.log10(v))) : data;
    const max = Math.max(...t);
    const min = Math.min(...t);
    const step = (w - pad.left - pad.right) / Math.max(1, data.length - 1);
    const range = max - min || 1;
    return {
      x: i => pad.left + i * step,
      y: v => {
        const val = log ? (v <= 0 ? 0 : Math.log10(v)) : v;
        return pad.top + (h - pad.top - pad.bottom)*(1 - (val - min)/range);
      },
      min, max, range
    };
  }

  function drawAxes(w, h, pad, scale, log) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + i * (h - pad.top - pad.bottom)/5;
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '12px system-ui';
    for (let i = 0; i <= 5; i++) {
      const val = scale.min + (5 - i)*(scale.range/5);
      const txt = log ? `10^${val.toFixed(1)}` : Math.round(val);
      const y = pad.top + i * (h - pad.top - pad.bottom)/5 + 4;
      ctx.fillText(txt, 6, y);
    }
    ctx.restore();
  }

  function plotData(data, kind, log) {
    resizeCanvas();
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const pad = { top: 28, right: 24, bottom: 36, left: 44 };
    const scale = getScale(data, w, h, pad, log);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawAxes(w,h,pad,scale,log);
    lastPlot = { data, scale, pad, w, h };

    let frame = 0;
    const steps = 60;
    const animate = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      drawAxes(w,h,pad,scale,log);
      const ratio = frame/steps;
      const count = Math.floor(data.length * ratio);
      if (kind === 'bar') {
        const barW = Math.max(6, (w - pad.left - pad.right)/data.length*0.7);
        ctx.fillStyle = 'rgba(0,240,255,0.9)';
        data.forEach((v,i)=>{
          if (i<=count){
            const x = scale.x(i)-barW/2;
            const y = scale.y(v);
            ctx.fillRect(x,y,barW,(h - pad.bottom)-y);
          }
        });
      } else {
        ctx.beginPath();
        ctx.lineWidth=2.2;
        ctx.strokeStyle='rgba(0,240,255,0.9)';
        data.forEach((v,i)=>{
          if (i===0) ctx.moveTo(scale.x(0),scale.y(data[0]));
          else if (i<=count) ctx.lineTo(scale.x(i),scale.y(v));
        });
        ctx.stroke();
        ctx.fillStyle='#fff';
        data.forEach((v,i)=>{
          if (i<=count){
            ctx.beginPath();
            ctx.arc(scale.x(i),scale.y(v),4,0,Math.PI*2);
            ctx.fill();
          }
        });
      }
      frame++;
      if (frame<=steps) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  // Tooltip
  canvas.addEventListener('mousemove', e=>{
    if(!lastPlot) return;
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const {data, scale} = lastPlot;
    let c=null;
    data.forEach((v,i)=>{
      const x=scale.x(i), y=scale.y(v);
      const d=Math.hypot(x-mx,y-my);
      if(!c||d<c.d)c={i,v,x,y,d};
    });
    if(c&&c.d<10){
      tooltip.hidden=false;
      tooltip.style.left=`${c.x}px`;
      tooltip.style.top=`${c.y}px`;
      tooltip.textContent=`n=${c.i} → ${c.v}`;
    }else tooltip.hidden=true;
  });
  canvas.addEventListener('mouseleave',()=>tooltip.hidden=true);

  function showValues(data){
    valuesPre.textContent=data.map((v,i)=>`${i}: ${v}`).join('\n');
  }

  function draw(){
    let n=parseInt(termsInput.value)||1;
    n=Math.max(1,Math.min(n,50));
    const data=fibonacci(n);
    showValues(data);
    plotData(data,typeSelect.value,logCheck.checked);
  }

  drawBtn.addEventListener('click',draw);

  // Exportar gráfico a PNG
  exportBtn.addEventListener('click',()=>{
    const link=document.createElement('a');
    link.download=`fibonacci_${Date.now()}.png`;
    link.href=canvas.toDataURL('image/png');
    link.click();
  });
})();
