<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg p-6 mb-10 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold">Admin Dashboard</h1>
        <p class="opacity-80">Welcome back, Admin 👋</p>
      </div>
      <div class="bg-white/20 rounded-lg px-4 py-2 text-sm font-medium">
        {{ today }}
      </div>
    </header>

    <!-- Stats Section -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <CardStat
        icon="users"
        title="Total Customers"
        :value="stats.customers"
        color="from-emerald-400 to-green-600"
        class="hover:scale-105 transition-transform"
      />

      <CardStat
        icon="briefcase"
        title="Service Providers"
        :value="stats.providers"
        color="from-blue-400 to-indigo-600"
        class="hover:scale-105 transition-transform"
      />

      <CardStat
        icon="calendar"
        title="Total Bookings"
        :value="stats.bookings"
        color="from-purple-400 to-pink-500"
        class="hover:scale-105 transition-transform"
      />

      <CardStat
        icon="dollar-sign"
        title="Monthly Revenue"
        :value="`$${stats.revenue}`"
        color="from-amber-400 to-orange-500"
        class="hover:scale-105 transition-transform"
      />
    </section>

    <!-- Chart + Activity Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
      <!-- Chart Section -->
      <section>
        <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          📈 Monthly Booking Summary
        </h2>
        <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all">
          <div v-if="loadingChart" class="text-center text-gray-400 py-12 animate-pulse">
            Loading chart data...
          </div>
          <BarChart v-else :data="chartData" />
        </div>
      </section>

      <!-- Activity Feed -->
      <section>
        <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          🔔 Latest Activity
        </h2>
        <div class="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-h-[420px] overflow-y-auto">
          <div
            v-for="(activity, index) in activities"
            :key="index"
            class="flex items-start gap-4 border-b pb-3 last:border-none"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              :class="activity.color"
            >
              {{ activity.icon }}
            </div>
            <div>
              <p class="text-gray-700 font-medium">{{ activity.title }}</p>
              <p class="text-gray-400 text-sm">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Recent Bookings Table -->
    <section class="mt-12">
      <h2 class="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
        🧾 Recent Bookings
      </h2>
      <div class="overflow-x-auto bg-white shadow-lg rounded-2xl hover:shadow-2xl transition-all">
        <table class="min-w-full text-sm text-gray-700">
          <thead class="bg-gradient-to-r from-indigo-100 to-purple-100 border-b text-gray-700 uppercase text-xs">
            <tr>
              <th class="px-4 py-3 text-left">ID</th>
              <th class="px-4 py-3 text-left">Customer</th>
              <th class="px-4 py-3 text-left">Provider</th>
              <th class="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="b in recent"
              :key="b.id"
              class="hover:bg-indigo-50 cursor-pointer transition"
              @click="$router.push(`/booking/${b.id}`)"
            >
              <td class="px-4 py-2 font-medium">#{{ b.id }}</td>
              <td class="px-4 py-2">{{ b.customer_name || b.customer }}</td>
              <td class="px-4 py-2">{{ b.provider_name || b.provider }}</td>
              <td>
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-green-100 text-green-700': b.status === 'confirmed',
                    'bg-yellow-100 text-yellow-700': b.status === 'pending',
                    'bg-red-100 text-red-700': b.status === 'cancelled',
                  }"
                >
                  {{ b.status }}
                </span>
              </td>
            </tr>

            <tr v-if="!recent.length">
              <td colspan="4" class="text-center py-6 text-gray-400">
                No recent bookings found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CardStat from '../components/CardStat.vue';
import BarChart from '../components/BarChart.vue';
import { getStats } from '../api/adminStats';
import { getBookings } from '../api/adminBookings';

const stats = ref({ customers: 0, providers: 0, bookings: 0, revenue: 0 });
const recent = ref([]);
const chartData = ref([]);
const loadingChart = ref(true);
const today = new Date().toLocaleDateString();

// Sample activities
const activities = ref([
  { title: 'New customer registered', time: '2 mins ago', icon: '👤', color: 'bg-blue-500' },
  { title: 'Booking #124 confirmed', time: '10 mins ago', icon: '✅', color: 'bg-green-500' },
  { title: 'Provider payout processed', time: '1 hr ago', icon: '💰', color: 'bg-yellow-500' },
  { title: 'Customer feedback received', time: '3 hrs ago', icon: '⭐', color: 'bg-purple-500' },
  { title: 'Booking #119 cancelled', time: 'Yesterday', icon: '⚠️', color: 'bg-red-500' },
]);

onMounted(async () => {
  try {
    const s = await getStats();
    if (s?.data) stats.value = s.data;
  } catch (e) {
    console.warn('getStats failed', e);
  }

  try {
    const r = await getBookings();
    const allBookings = r?.data || [];
    recent.value = allBookings.slice(0, 6);
    chartData.value = buildMonthlyData(allBookings);
  } catch (e) {
    console.warn('getBookings failed', e);
  } finally {
    loadingChart.value = false;
  }
});

function buildMonthlyData(bookings) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dataMap = {};
  months.forEach(m => (dataMap[m] = 0));
  bookings.forEach(b => {
    const date = new Date(b.created_at || b.date || b.timestamp);
    const monthName = months[date.getMonth()];
    if (monthName) dataMap[monthName]++;
  });
  return months.map(m => ({ month: m, bookings: dataMap[m] }));
}
</script>

<style scoped>
.dashboard {
  padding: 32px;
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f4f7fb, #e9edf5);
  transition: background 0.3s ease;
  background-color: forestgreen;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 8px;
}
</style>
