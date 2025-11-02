<template>
  <tr>
    <td>{{ booking.id }}</td>
    <td>{{ booking.customer_name || booking.customer }}</td>
    <td>{{ booking.provider_name || booking.provider }}</td>
    <td>{{ booking.status }}</td>
    <td>
      <button class="btn" @click="$emit('view', booking.id)">View</button>
    </td>
  </tr>
</template>

<script setup>
defineProps({
  booking: { type: Object, required: true }
});
</script>
