<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h1>Provider Profile</h1>
      <button class="btn" @click="goBack">Back</button>
    </div>

    <div style="display:flex;gap:16px;margin-top:12px">
      <div style="flex:1">
        <div class="card">
          <h3>{{ provider.name }}</h3>
          <p style="color:var(--muted)">{{ provider.email }}</p>
          <p style="margin-top:8px">Status: <strong>{{ provider.status || 'pending' }}</strong></p>
        </div>

        <div class="card" style="margin-top:12px">
          <h4>Services</h4>
          <ul>
            <li v-for="s in provider.services || []" :key="s.id">{{ s.name }} — {{ s.duration }} mins — ${{ s.price }}</li>
            <li v-if="!(provider.services && provider.services.length)" style="color:var(--muted)">No services listed</li>
          </ul>
        </div>
      </div>

      <div style="width:360px">
        <div class="card">
          <h4>Schedule</h4>
          <div v-if="provider.schedule && provider.schedule.length">
            <div v-for="(s,i) in provider.schedule" :key="i" style="padding:8px 0;border-bottom:1px dashed #eee">
              <div style="font-weight:600">{{ s.day }}</div>
              <div style="color:var(--muted)">{{ s.from }} — {{ s.to }}</div>
            </div>
          </div>
          <div v-else style="color:var(--muted)">No schedule available</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getProviderDetail } from '../api/adminProviders';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const provider = ref({});

const load = async () => {
  try {
    const res = await getProviderDetail(route.params.id);
    provider.value = res.data;
  } catch (e) {
    console.warn('getProviderDetail failed, using mock', e);
    // Mock fallback
    provider.value = {
      id: route.params.id,
      name: 'Mock Provider',
      email: 'mock@provider.com',
      status: 'approved',
      services: [{ id: 1, name: 'Haircut', duration: 30, price: 12 }],
      schedule: [{ day: 'Mon-Fri', from: '09:00', to: '17:00' }]
    };
  }
};

onMounted(load);
const goBack = () => router.back();
</script>
