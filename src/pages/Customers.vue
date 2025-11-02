<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h1>Customers</h1>
      <div>
        <input
          class="input"
          v-model="q"
          placeholder="Search customer by name or email..."
          @input="onSearch"
          style="width:260px"
        />
      </div>
    </div>

    <div v-if="loading" style="text-align:center;color:gray;margin-top:12px">
      Loading customers...
    </div>

    <div v-if="error" style="text-align:center;color:red;margin-top:12px">
      {{ error }}
    </div>

    <table v-if="!loading && !error" class="table" style="margin-top:12px">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Joined</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in filtered" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.name }}</td>
          <td>{{ c.email }}</td>
          <td>{{ formatDate(c.created_at) }}</td>
        </tr>

        <tr v-if="filtered.length===0">
          <td colspan="4" style="text-align:center;color:var(--muted)">No customers</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import http from '../api/http'; // axios instance

const customers = ref([]);
const q = ref('');
const loading = ref(false);
const error = ref('');

const fetchCustomers = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await http.get('/users/customers'); // real backend endpoint
    customers.value = res.data || [];
  } catch (e) {
    console.error('Failed to fetch customers:', e);
    error.value = 'Failed to load customers. Please try again later.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCustomers);

const filtered = computed(() => {
  if (!q.value) return customers.value;
  const term = q.value.toLowerCase().trim();
  return customers.value.filter(c =>
    (c.name || '').toLowerCase().includes(term) ||
    (c.email || '').toLowerCase().includes(term) ||
    String(c.id).includes(term)
  );
});

const onSearch = () => {
  // keep this for future debounce if needed
};

function formatDate(iso) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}
</script>
