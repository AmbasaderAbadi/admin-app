<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h1>Bookings</h1>
    </div>

    <table class="table">
      <thead>
        <tr><th>ID</th><th>Customer</th><th>Provider</th><th>Time</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <BookingRow v-for="b in bookings" :key="b.id" :booking="b" @view="view" />
        <tr v-if="bookings.length===0"><td colspan="6" style="text-align:center;color:var(--muted)">No bookings</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getBookings } from '../api/adminBookings';
import BookingRow from '../components/BookingRow.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const bookings = ref([]);

onMounted(async () => {
  try {
    const res = await getBookings();
    bookings.value = res.data || [];
  } catch (e) {
    console.warn('getBookings failed, using mock', e);
    bookings.value = [
      { id: 101, customer_name: 'John', provider_name: 'Alice', time: '2025-10-27 14:00', status: 'confirmed' }
    ];
  }
});

const view = (id) => router.push(`/bookings/${id}`);
</script>
