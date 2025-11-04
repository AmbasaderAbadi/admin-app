<template>
  <div class="bookings-container">
    <!-- Header -->
    <div class="header">
      <h1>Bookings</h1>
      <button class="btn-add" @click="createNewBooking">+</button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search by name, ID, service..."
        @input="filterBookings"
      />
      <span class="search-icon">🔍</span>
    </div>

    <!-- Filter Buttons -->
    <div class="filter-buttons">
      <button
        :class="{ active: filterStatus === 'upcoming' }"
        @click="setFilter('upcoming')"
      >
        Upcoming
      </button>
      <button
        :class="{ active: filterStatus === 'completed' }"
        @click="setFilter('completed')"
      >
        Completed
      </button>
      <button
        :class="{ active: filterStatus === 'cancelled' }"
        @click="setFilter('cancelled')"
      >
        Cancelled
      </button>
    </div>

    <!-- Bookings List -->
    <div v-if="filteredBookings.length > 0" class="bookings-list">
      <div
        v-for="booking in filteredBookings"
        :key="booking.id"
        class="booking-card"
        @click="view(booking.id)"
      >
        <div class="booking-header">
          <h3>{{ booking.service_name }}</h3>
          <span class="price">${{ booking.price.toFixed(2) }}</span>
        </div>
        <div class="booking-meta">
          {{ booking.customer_name }} • {{ booking.provider_name }}
        </div>
        <div class="booking-footer">
          <span class="date">{{ formatDate(booking.time) }}</span>
          <span
            :class="[
              'status-badge',
              { 
                'status-confirmed': booking.status === 'confirmed',
                'status-pending': booking.status === 'pending',
                'status-completed': booking.status === 'completed',
                'status-cancelled': booking.status === 'cancelled'
              }
            ]"
          >
            <span v-if="booking.status === 'confirmed'">● Confirmed</span>
            <span v-if="booking.status === 'pending'">● Pending</span>
            <span v-if="booking.status === 'completed'">● Completed</span>
            <span v-if="booking.status === 'cancelled'">● Cancelled</span>
          </span>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="no-results">
      <div class="icon">🔍</div>
      <h3>No Bookings Found</h3>
      <p>Try adjusting your search or filters to find what you're looking for.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getBookings } from '../api/adminBookings';
import { useRouter } from 'vue-router';

const router = useRouter();
const bookings = ref([]);
const searchQuery = ref('');
const filterStatus = ref('upcoming'); // default filter

onMounted(async () => {
  try {
    const res = await getBookings();
    bookings.value = res.data || [];
  } catch (e) {
    console.warn('getBookings failed, using mock', e);
    bookings.value = [
      {
        id: 101,
        service_name: 'Deep Tissue Massage',
        customer_name: 'Olivia Chen',
        provider_name: 'Dr. Aris',
        time: '2024-10-28T14:00:00',
        price: 75.0,
        status: 'confirmed'
      },
      {
        id: 102,
        service_name: 'General Consultation',
        customer_name: 'Ben Carter',
        provider_name: 'Dr. Wells',
        time: '2024-10-29T10:30:00',
        price: 50.0,
        status: 'pending'
      },
      {
        id: 103,
        service_name: 'Acupuncture Session',
        customer_name: 'Liam Johnson',
        provider_name: 'Dr. Faye',
        time: '2024-10-25T16:00:00',
        price: 90.0,
        status: 'completed'
      },
      {
        id: 104,
        service_name: 'Chiropractic Adjustment',
        customer_name: 'Sophia Garcia',
        provider_name: 'Dr. Smith',
        time: '2024-10-30T11:00:00',
        price: 65.0,
        status: 'cancelled'
      }
    ];
  }
});

// Format date to "Oct 28, 2024 at 2:00 PM"
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Filter bookings based on search and status
const filteredBookings = computed(() => {
  let results = bookings.value;

  // Apply status filter
  if (filterStatus.value !== 'all') {
    results = results.filter(b => b.status === filterStatus.value);
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    results = results.filter(b =>
      b.service_name.toLowerCase().includes(query) ||
      b.customer_name.toLowerCase().includes(query) ||
      b.provider_name.toLowerCase().includes(query) ||
      b.id.toString().includes(query)
    );
  }

  return results;
});

const setFilter = (status) => {
  filterStatus.value = status;
};

const view = (id) => router.push(`/bookings/${id}`);

const createNewBooking = () => {
  router.push('/bookings/new');
};
</script>

<style scoped>
.bookings-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-add {
  background-color: #4285f4;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-bar {
  position: relative;
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.search-icon {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background-color: #eee;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.filter-buttons button.active {
  background-color: #4285f4;
  color: white;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.booking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.booking-header h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.price {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.booking-meta {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

.booking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.date {
  font-size: 14px;
  color: #555;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-confirmed {
  background-color: #e6f7e6;
  color: #2e8b57;
}

.status-pending {
  background-color: #fff3cd;
  color: #d97706;
}

.status-completed {
  background-color: #e2e8f0;
  color: #4b5563;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #dc2626;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}

.no-results .icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.no-results p {
  font-size: 14px;
  line-height: 1.5;
}
</style>