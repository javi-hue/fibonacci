const btn = document.getElementById("generateBtn");
const numInput = document.getElementById("numTerms");
const ctx = document.getElementById("fibonacciChart").getContext("2d");

let chart;

btn.addEventListener("click", () => {
  const n = parseInt(numInput.value);
  if (n < 2 || n > 30) {
    alert("Introduce un número entre 2 y 30");
    return;
  }

  const fib = [0, 1];
  for (let i = 2; i < n; i++) fib.push(fib[i - 1] + fib[i - 2]);

  const labels = fib.map((_, i) => `n=${i}`);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Secuencia Fibonacci",
        data: fib,
        borderColor: "#66fcf1",
        backgroundColor: "rgba(102, 252, 241, 0.3)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: "#45a29e",
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 1500,
        easing: "easeOutQuart"
      },
      scales: {
        x: { ticks: { color: "#c5c6c7" } },
        y: { ticks: { color: "#c5c6c7" } }
      },
      plugins: {
        legend: {
          labels: { color: "#fff" }
        }
      }
    }
  });
});
