let chart = null;

function fibonacci(n) {
    const sequence = [0, 1];
    for (let i = 2; i < n; i++) {
        sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
    return sequence.slice(0, n);
}

function generateFibonacci() {
    const terms = parseInt(document.getElementById('terms').value);
    
    if (terms < 2 || terms > 50) {
        alert('Por favor, ingresa un número entre 2 y 50');
        return;
    }

    const sequence = fibonacci(terms);
    
    // Mostrar secuencia
    document.getElementById('sequenceOutput').textContent = sequence.join(', ');
    
    // Calcular suma
    const sum = sequence.reduce((a, b) => a + b, 0);
    document.getElementById('sumTotal').textContent = sum.toLocaleString();
    
    // Calcular razón áurea
    if (sequence.length >= 2) {
        const ratio = (sequence[sequence.length - 1] / sequence[sequence.length - 2]).toFixed(6);
        document.getElementById('goldenRatio').textContent = `${ratio} (φ ≈ 1.618034)`;
    }

    // Crear gráfico
    createChart(sequence);
}

function createChart(sequence) {
    const ctx = document.getElementById('fibonacciChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }

    const labels = sequence.map((_, i) => `F${i}`);
    
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor de Fibonacci',
                data: sequence,
                backgroundColor: sequence.map((_, i) => {
                    const hue = (i * 360 / sequence.length);
                    return `hsla(${hue}, 70%, 60%, 0.8)`;
                }),
                borderColor: sequence.map((_, i) => {
                    const hue = (i * 360 / sequence.length);
                    return `hsla(${hue}, 70%, 50%, 1)`;
                }),
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 16
                    },
                    bodyFont: {
                        size: 14
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function downloadChart() {
    if (!chart) {
        alert('Primero debes generar un gráfico');
        return;
    }

    const link = document.createElement('a');
    link.download = 'fibonacci_chart.png';
    link.href = chart.toBase64Image();
    link.click();
}

// Generar gráfico inicial
generateFibonacci();
      }
    }
  });
});
