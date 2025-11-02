<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h1>Providers</h1>
      <div>
        <input class="input" v-model="q" placeholder="Search provider..." @input="search" style="width:220px" />
      </div>
    </div>

    <table class="table">
      <thead>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <ProviderRow v-for="p in filtered" :key="p.id" :provider="p"
          @view="view"
          @approve="approve"
          @reject="reject"
          @delete="remove"
        />
        <tr v-if="filtered.length===0"><td colspan="5" style="text-align:center;color:var(--muted)">No providers</td></tr>
      </tbody>
    </table>

    <ConfirmModal 
      :visible="confirmVisible" 
      title="Delete provider"
      message="Are you sure you want to delete this provider?"
      @confirm="confirmDelete"
      @cancel="confirmVisible=false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ProviderRow from '../components/ProviderRow.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { getProviders, approveProvider, rejectProvider, deleteProvider } from '../api/adminProviders';
import { useRouter } from 'vue-router';

const router = useRouter();
const providers = ref([]);
const q = ref('');
const confirmId = ref(null);
const confirmVisible = ref(false);

onMounted(async () => {
  try {
    const res = await getProviders();
    providers.value = res.data || [];
  } catch (e) {
    console.warn('getProviders failed, using mock data', e);
    // fallback mock
    providers.value = [
      { id: 1, name: 'Alice Doe', email: 'alice@example.com', status: 'pending' },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', status: 'approved' }
    ];
  }
});

const filtered = computed(() => {
  if (!q.value) return providers.value;
  const term = q.value.toLowerCase();
  return providers.value.filter(p => (p.name||'').toLowerCase().includes(term) || (p.email||'').toLowerCase().includes(term));
});

const view = (id) => router.push(`/providers/${id}`);
const approve = async (id) => {
  try {
    await approveProvider(id);
    providers.value = providers.value.map(p => p.id===id ? {...p, status:'approved'} : p);
  } catch (e) {
    console.warn(e);
  }
};
const reject = async (id) => {
  try {
    await rejectProvider(id);
    providers.value = providers.value.map(p => p.id===id ? {...p, status:'rejected'} : p);
  } catch (e) {
    console.warn(e);
  }
};
const remove = (id) => {
  confirmId.value = id;
  confirmVisible.value = true;
};
const confirmDelete = async () => {
  try {
    await deleteProvider(confirmId.value);
    providers.value = providers.value.filter(p => p.id !== confirmId.value);
  } catch (e) {
    console.warn(e);
  } finally {
    confirmVisible.value = false;
    confirmId.value = null;
  }
};
const search = () => {};
</script>
