<template>
  <div class="chart-container bg-white p-4 rounded-2xl shadow">
    <h3 class="text-lg font-semibold mb-3 text-gray-700">{{ title }}</h3>
    <canvas ref="chartEl" height="120"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

// register Chart.js components
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({
  title: { type: String, default: 'Bookings Summary' },
  data: {
    type: Array,
    default: () => [
      { month: 'Jan', value: 40 },
      { month: 'Feb', value: 55 },
      { month: 'Mar', value: 32 },
      { month: 'Apr', value: 70 },
      { month: 'May', value: 48 },
      { month: 'Jun', value: 60 },
    ],
  },
})

const chartEl = ref(null)
let chartInstance = null

onMounted(() => {
  if (chartEl.value) {
    renderChart()
  }
})

watchEffect(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
  renderChart()
})

function renderChart() {
  const ctx = chartEl.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.data.map((d) => d.month),
      datasets: [
        {
          label: 'Bookings',
          data: props.data.map((d) => d.value),
          backgroundColor: '#6366F1',
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  })
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: auto;
}
</style>
