<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h1>Booking #{{ booking.id }}</h1>
      <button class="btn" @click="goBack">Back</button>
    </div>

    <div v-if="booking.id" style="margin-top:12px" class="card">
      <p><strong>Customer:</strong> {{ booking.customer_name || booking.customer }}</p>
      <p><strong>Provider:</strong> {{ booking.provider_name || booking.provider }}</p>
      <p><strong>Time:</strong> {{ booking.time }}</p>
      <p><strong>Status:</strong> {{ booking.status }}</p>

      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn btn-primary" @click="updateStatus('confirmed')">Confirm</button>
        <button class="btn" @click="updateStatus('cancelled')">Cancel</button>
      </div>
    </div>

    <p v-else style="margin-top:20px">Loading booking details...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getBookingDetail, updateBooking } from '../api/adminBookings';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const booking = ref({});

const load = async () => {
  try {
    const res = await getBookingDetail(route.params.id);
    booking.value = res.data;
  } catch (err) {
    console.warn('❌ Failed to load booking detail:', err);
    // fallback mock data
    booking.value = { 
      id: route.params.id, 
      customer_name: 'Mock Customer', 
      provider_name: 'Mock Provider', 
      time: '2025-10-28 10:00', 
      status: 'pending' 
    };
  }
};

const updateStatus = async (status) => {
  try {
    await updateBooking(booking.value.id, { status });
    booking.value.status = status;
    alert('✅ Booking status updated successfully!');
  } catch (err) {
    console.error('❌ Failed to update booking:', err);
    alert('Failed to update booking status');
  }
};

const goBack = () => router.back();

onMounted(load);
</script>
