<template>
  <div>
    <h1>Payments</h1>

    <table class="table" style="margin-top:12px">
      <thead>
        <tr><th>ID</th><th>Client</th><th>Amount</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr v-for="p in payments" :key="p.id">
          <td>{{ p.id }}</td>
          <td>{{ p.client_name || p.client }}</td>
          <td>${{ p.amount }}</td>
          <td>{{ p.status }}</td>
        </tr>
        <tr v-if="payments.length===0"><td colspan="4" style="text-align:center;color:var(--muted)">No payments</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPayments } from '../api/adminPayments';

const payments = ref([]);

onMounted(async () => {
  try {
    const res = await getPayments();
    payments.value = res.data || [];
  } catch (e) {
    console.warn('getPayments failed, using mock', e);
    payments.value = [
      { id: 501, client_name: 'John Doe', amount: 30, status: 'paid' }
    ];
  }
});
</script>
