<template>
  <div
    class="flex items-center justify-between p-5 bg-white rounded-2xl shadow hover:shadow-md transition-shadow duration-300"
  >
    <!-- Left Section: Icon + Title -->
    <div>
      <div class="text-sm font-medium text-gray-500 mb-1">{{ title }}</div>
      <div class="text-3xl font-bold text-gray-800">
        {{ formattedValue }}
      </div>
    </div>

    <!-- Right Section: Icon -->
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center text-white"
      :class="gradient"
    >
      <component :is="iconComponent" class="w-6 h-6" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Users, Briefcase, Calendar } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, default: '' },
  value: { type: [String, Number], default: 0 },
  icon: { type: String, default: '' },
  color: { type: String, default: 'from-blue-400 to-indigo-500' },
})

// Choose correct icon dynamically
const iconComponent = computed(() => {
  switch (props.icon) {
    case 'users': return Users
    case 'briefcase': return Briefcase
    case 'calendar': return Calendar
    default: return Users
  }
})

// Gradient background for icon
const gradient = computed(() => `bg-gradient-to-r ${props.color}`)

// Optional: Format big numbers
const formattedValue = computed(() => {
  const val = Number(props.value)
  return isNaN(val)
    ? props.value
    : val.toLocaleString()
})
</script>
