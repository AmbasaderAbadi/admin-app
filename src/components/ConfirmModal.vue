<template>
  <div v-if="visible" class="modal-backdrop">
    <div class="modal">
      <h3 style="margin:0 0 8px 0">{{ title }}</h3>
      <p style="margin:0 0 12px 0">{{ message }}</p>
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button class="btn" @click="$emit('cancel')">Cancel</button>
        <button class="btn btn-danger" @click="$emit('confirm')">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' }
});
</script>
