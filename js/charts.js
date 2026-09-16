/**
 * SMARTGATE AI - Chart.js Visualizations
 * Admin Overview & AI Insights Analytics
 */

class SmartGateCharts {
  constructor() {
    this.exitActivityChart = null;
    this.deptStatsChart = null;
    this.throughputChart = null;
  }

  renderExitActivityChart(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.exitActivityChart) {
      this.exitActivityChart.destroy();
    }

    const data = window.store.state.aiAnalytics.exitDistributionHours;
    const labels = data.map(d => d.hour);
    const exitCounts = data.map(d => d.exits);
    const entryCounts = data.map(d => d.entries);

    this.exitActivityChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Student Exits (Peak 17:00 - 19:00)",
            data: exitCounts,
            borderColor: "#38BDF8",
            backgroundColor: "rgba(56, 189, 248, 0.15)",
            tension: 0.4,
            fill: true,
            borderWidth: 2.5,
            pointBackgroundColor: "#38BDF8",
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: "Student Entries",
            data: entryCounts,
            borderColor: "#10B981",
            backgroundColor: "rgba(16, 185, 129, 0.08)",
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            borderDash: [4, 4],
            pointBackgroundColor: "#10B981",
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: "#94A3B8",
              font: { family: "'Inter', sans-serif", size: 12 }
            }
          },
          tooltip: {
            backgroundColor: "#0F172A",
            titleColor: "#F8FAFC",
            bodyColor: "#CBD5E1",
            borderColor: "#334155",
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(51, 65, 85, 0.25)" },
            ticks: { color: "#94A3B8", font: { family: "'JetBrains Mono', monospace", size: 11 } }
          },
          y: {
            grid: { color: "rgba(51, 65, 85, 0.25)" },
            ticks: { color: "#94A3B8", font: { family: "'JetBrains Mono', monospace", size: 11 } }
          }
        }
      }
    });
  }

  renderDeptStatsChart(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.deptStatsChart) {
      this.deptStatsChart.destroy();
    }

    const data = window.store.state.aiAnalytics.deptStats;
    const labels = data.map(d => d.dept);
    const counts = data.map(d => d.count);

    this.deptStatsChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: [
              "#3B82F6", // Blue
              "#06B6D4", // Cyan
              "#8B5CF6", // Purple
              "#F59E0B", // Amber
              "#64748B"  // Slate
            ],
            borderColor: "#0F172A",
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#94A3B8",
              font: { family: "'Inter', sans-serif", size: 11 }
            }
          },
          tooltip: {
            backgroundColor: "#0F172A",
            titleColor: "#F8FAFC",
            bodyColor: "#CBD5E1",
            borderColor: "#334155",
            borderWidth: 1
          }
        },
        cutout: "68%"
      }
    });
  }
}

window.charts = new SmartGateCharts();
