import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-display.component.html',
  styleUrl: './chart-display.component.css'
})
export class ChartDisplayComponent implements OnChanges {
  @Input() plotData: any = null;
  @Input() chartType: string = 'line';
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  chart: Chart | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['plotData'] && this.plotData) {
      this.createChart();
    }
  }

  createChart() {
    // Destroy existing chart if any
    if (this.chart) {
      this.chart.destroy();
    }

    // Wait for canvas to be available
    setTimeout(() => {
      if (!this.chartCanvas) return;

      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      // Calculate min/max for better scaling
      const allYValues: number[] = [];
      this.plotData.datasets.forEach((dataset: any) => {
        allYValues.push(...dataset.data.filter((v: any) => v !== null && !isNaN(v)));
      });

      const minY = Math.min(...allYValues);
      const maxY = Math.max(...allYValues);
      const padding = (maxY - minY) * 0.1; // 10% padding

      // Update datasets with enhanced colors for bar charts
      const enhancedDatasets = this.plotData.datasets.map((dataset: any, index: number) => {
        const colors = this.getBarColors(index);
        return {
          ...dataset,
          borderColor: colors.border,
          backgroundColor: this.chartType === 'bar' ? colors.bar : colors.background,
        };
      });

      const config: ChartConfiguration = {
        type: this.chartType as any,
        data: {
          labels: this.plotData.labels,
          datasets: enhancedDatasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'CSV Data Plot',
              font: {
                size: 18
              }
            },
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: this.plotData.xColumn || 'X-Axis'
              },
              ticks: {
                maxRotation: 45,
                minRotation: 0
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Y-Axis'
              },
              min: minY - padding,
              max: maxY + padding,
              ticks: {
                callback: function(value) {
                  // Format large numbers
                  if (Math.abs(value as number) >= 1000000) {
                    return (value as number / 1000000).toFixed(1) + 'M';
                  } else if (Math.abs(value as number) >= 1000) {
                    return (value as number / 1000).toFixed(1) + 'K';
                  }
                  return value;
                }
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          }
        }
      };

      this.chart = new Chart(ctx, config);
    }, 100);
  }

  // Get vibrant colors for bar charts, normal colors for others
  getBarColors(index: number) {
    const vibrantColors = [
      {
        border: 'rgb(59, 130, 246)',
        background: 'rgba(59, 130, 246, 0.2)',
        bar: 'rgba(59, 130, 246, 0.8)'
      },
      {
        border: 'rgb(239, 68, 68)',
        background: 'rgba(239, 68, 68, 0.2)',
        bar: 'rgba(239, 68, 68, 0.8)'
      },
      {
        border: 'rgb(34, 197, 94)',
        background: 'rgba(34, 197, 94, 0.2)',
        bar: 'rgba(34, 197, 94, 0.8)'
      },
      {
        border: 'rgb(251, 191, 36)',
        background: 'rgba(251, 191, 36, 0.2)',
        bar: 'rgba(251, 191, 36, 0.8)'
      },
      {
        border: 'rgb(168, 85, 247)',
        background: 'rgba(168, 85, 247, 0.2)',
        bar: 'rgba(168, 85, 247, 0.8)'
      },
      {
        border: 'rgb(249, 115, 22)',
        background: 'rgba(249, 115, 22, 0.2)',
        bar: 'rgba(249, 115, 22, 0.8)'
      }
    ];
    return vibrantColors[index % vibrantColors.length];
  }

  changeChartType(type: string) {
    this.chartType = type;
    this.createChart();
  }

  downloadChart() {
    if (this.chart) {
      const link = document.createElement('a');
      link.download = 'chart.png';
      link.href = this.chart.toBase64Image();
      link.click();
    }
  }
}
