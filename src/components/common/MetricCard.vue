<!-- src/components/common/MetricCard.vue -->
<template>
  <div 
    class="metric-card clickable"
    :class="{ loading: isLoading }"
    @click="$emit('click', metric)"
  >
    <div class="metric-icon">{{ metric.icon }}</div>
    <div class="metric-title">{{ metric.title }}</div>
    <div class="metric-value">{{ metric.value }}</div>
    <div 
      :class="['metric-change', { 'positive': metric.change >= 0, 'negative': metric.change < 0 }]"
    >
      {{ metric.change >= 0 ? '+' : '' }}{{ Math.abs(metric.change) }}%
    </div>
  </div>
</template>

<script setup>
defineProps({
  metric: {
    type: Object,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.metric-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.metric-card.clickable {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  background-color: #e0e5ff;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 20px;
}

.metric-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.metric-change {
  font-size: 13px;
  font-weight: 500;
}

.metric-change.positive {
  color: #00c853;
}

.metric-change.negative {
  color: #ff5252;
}

.metric-card.loading {
  opacity: 0.7;
  pointer-events: none;
}
</style>