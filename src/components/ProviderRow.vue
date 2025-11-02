<template>
  <tr>
    <td>{{ provider.id }}</td>
    <td>{{ provider.name }}</td>
    <td>{{ provider.email }}</td>
    <td>{{ provider.status || 'pending' }}</td>
    <td>
      <button class="btn" @click="$emit('view', provider.id)">View</button>
      <button class="btn" @click="$emit('approve', provider.id)">Approve</button>
      <button class="btn" @click="$emit('reject', provider.id)">Reject</button>
      <button class="btn btn-danger" @click="$emit('delete', provider.id)">Delete</button>
    </td>
  </tr>
</template>

<script setup>
defineProps({
  provider: { type: Object, required: true }
});
</script>
