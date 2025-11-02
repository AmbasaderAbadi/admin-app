<template>
  <div class="admin-root">
    <aside class="sidebar">
      <div class="brand">Admin Panel</div>

      <nav class="nav">
        <a :class="{active: isActive('/')}" @click.prevent="to('/')">Dashboard</a>
        <a :class="{active: isActive('/providers')}" @click.prevent="to('/providers')">Providers</a>
        <a :class="{active: isActive('/bookings')}" @click.prevent="to('/bookings')">Bookings</a>
        <a :class="{active: isActive('/payments')}" @click.prevent="to('/payments')">Payments</a>
        <a :class="{active: isActive('/customers')}" @click.prevent="to('/customers')">Customers</a>
      </nav>

      <div style="margin-top:auto">
        <button class="btn btn-ghost" @click="goSettings">Settings</button>
      </div>
    </aside>

    <div class="main-area">
      <header class="header">
        <div class="title">Admin</div>
        <div class="actions">
          <div style="color:var(--muted)">Welcome, Admin</div>
          <button class="btn" @click="logout">Logout</button>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

const to = (path) => router.push(path);
const isActive = (p) => {
  if (p === '/') return route.path === '/';
  return route.path.startsWith(p);
};

const logout = () => {
  localStorage.removeItem('admin_token');
  router.push('/login');
};
const goSettings = () => {
  // placeholder; implement if you have a settings page
  alert('Settings (not implemented)');
};
</script>
