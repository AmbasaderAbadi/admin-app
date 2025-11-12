<template>
  <div class="admin-root">
    <!-- Hamburger Button -->
    <button
      ref="hamburgerBtn"
      class="hamburger-btn"
      :class="{ 
        'hovered': isHamburgerHovered,
        'sidebar-expanded': isSidebarExpanded && !isMobile
      }"
      @mouseenter="isHamburgerHovered = true"
      @mouseleave="isHamburgerHovered = false"
      @click="toggleSidebarManually"
      aria-label="Toggle sidebar"
    >
      <span>☰</span>
    </button>

    <!-- Tooltip -->
    <div v-if="isHamburgerHovered" class="tooltip">
      {{ isSidebarExpanded ? 'Collapse menu' : 'Expand menu' }}
    </div>

    <!-- Sidebar -->
    <aside
      ref="sidebar"
      class="sidebar"
      :class="{ 'sidebar-expanded': isSidebarExpanded }"
    >
      <div class="brand">Admin Panel</div>

      <nav class="nav">
        <a :class="{ active: isActive('/') }" @click.prevent="to('/')">Dashboard</a>
        <a :class="{ active: isActive('/providers') }" @click.prevent="to('/providers')">Providers</a>
        <a :class="{ active: isActive('/bookings') }" @click.prevent="to('/bookings')">Bookings</a>
        <a :class="{ active: isActive('/payments') }" @click.prevent="to('/payments')">Payments</a>
        <a :class="{ active: isActive('/customers') }" @click.prevent="to('/customers')">Customers</a>
        <a :class="{ active: isActive('/services') }" @click.prevent="to('/services')">Services</a>
      </nav>

      <div style="margin-top: auto">
        <button class="btn btn-ghost" @click="goSettings">Settings</button>
      </div>
    </aside>

    <!-- Mobile Overlay - Only shown on mobile when sidebar is expanded -->
    <div 
      v-if="isMobile && isSidebarExpanded" 
      class="mobile-overlay"
      @click="closeSidebar"
    ></div>

    <!-- Main Content -->
    <div class="main-area" :class="{ 'sidebar-hidden': !isSidebarExpanded }">
      <header class="header">
        <div class="title-section">
          <!-- Back Button - Show when not on dashboard -->
          <button 
            v-if="!isDashboard" 
            class="back-btn"
            @click="goBack"
          >
            ← Back
          </button>
          <div class="title">Admin</div>
        </div>
        <div class="actions">
          <div style="color: var(--muted)">Welcome, Admin</div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Sidebar state
const isSidebarExpanded = ref(false)
const isHamburgerHovered = ref(false)
const isMobile = ref(false)

// Navigation history stack
const navigationHistory = ref([])

// Computed property to check if we're on dashboard
const isDashboard = computed(() => route.path === '/')

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// Toggle manually (click only)
const toggleSidebarManually = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value
}

// Close sidebar (for mobile)
const closeSidebar = () => {
  if (isMobile.value) {
    isSidebarExpanded.value = false
  }
}

// Navigation helpers
const to = (path) => {
  // Add current path to history before navigating
  if (route.path !== path) {
    navigationHistory.value.push(route.path)
  }
  
  router.push(path)
  // Close sidebar on mobile after navigation
  if (isMobile.value) {
    isSidebarExpanded.value = false
  }
}

// Back navigation
const goBack = () => {
  if (navigationHistory.value.length > 0) {
    const previousPath = navigationHistory.value.pop()
    router.push(previousPath)
  } else {
    // Fallback: go to dashboard if no history
    router.push('/')
  }
  
  // Close sidebar on mobile after navigation
  if (isMobile.value) {
    isSidebarExpanded.value = false
  }
}

const isActive = (p) => {
  if (p === '/') return route.path === '/'
  return route.path.startsWith(p)
}

// Handle clicks outside sidebar (mobile only)
const handleClickOutside = (event) => {
  if (!isMobile.value || !isSidebarExpanded.value) return
  
  const sidebar = document.querySelector('.sidebar')
  const hamburgerBtn = document.querySelector('.hamburger-btn')
  
  // Close sidebar if clicking outside of sidebar and hamburger button
  if (sidebar && !sidebar.contains(event.target) && 
      hamburgerBtn && !hamburgerBtn.contains(event.target)) {
    isSidebarExpanded.value = false
  }
}

// Actions
const logout = () => {
  localStorage.removeItem('admin_token')
  router.push('/login')
}

const goSettings = () => {
  router.push('/settings')
  // Close sidebar on mobile after navigation
  if (isMobile.value) {
    isSidebarExpanded.value = false
  }
}

// Lifecycle
onMounted(() => {
  checkMobile()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', checkMobile)
  
  // Initialize navigation history with current path if not dashboard
  if (route.path !== '/') {
    navigationHistory.value.push('/')
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.admin-root {
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
  overflow: hidden;
  position: relative; /* needed for tooltip positioning */
}

/* Hamburger button */
.hamburger-btn {
  position: fixed;
  top: 46px;
  left: 15px;
  z-index: 1000;
  background: white;
  border-radius: 6px;
  width: 40px;
  height: 30px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  color: #333;
  transition: all 0.3s ease;
  /* Smooth transition for position changes */
  transition-property: left, transform, border-radius, background;
}

.hamburger-btn.hovered {
  border-radius: 12px;
  background: #f0f0f0;
  transform: scale(1.05);
}

/* When sidebar is expanded on desktop, move hamburger button */
.hamburger-btn.sidebar-expanded {
  left: 200px; /* Sidebar width (240px) + 15px margin */
}

/* Tooltip */
.tooltip {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1001;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Sidebar */
.sidebar {
  width: 0;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s ease, padding 0.3s ease;
  overflow: hidden;
  position: relative;
  z-index: 999;
}

.sidebar.sidebar-expanded {
  width: 240px;
  padding: 0;
}

.sidebar .brand {
  padding: 20px 20px 12px;
  font-weight: bold;
  font-size: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar.sidebar-expanded .brand {
  opacity: 1;
}

.sidebar .nav {
  padding: 16px 0;
  flex: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar.sidebar-expanded .nav {
  opacity: 1;
}

.sidebar .nav a {
  display: block;
  padding: 12px 24px;
  color: #ecf0f1;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar .nav a:hover,
.sidebar .nav a.active {
  background-color: #34495e;
}

.sidebar .btn-ghost {
  margin: 0 24px 24px;
  width: calc(100% - 48px);
  padding: 8px 16px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar.sidebar-expanded .btn-ghost {
  opacity: 1;
}

/* Main area */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.main-area.sidebar-hidden {
  margin-left: 0;
}

.main-area:not(.sidebar-hidden) {
  margin-left: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f8f9fa;
}

/* Mobile Overlay - Only for mobile */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
}

/* MOBILE-ONLY STYLES */
@media (max-width: 768px) {
  /* Make hamburger larger and more touch-friendly */
  .hamburger-btn {
    top: 47px;
    left: 15px;
    width: 30px;
    height: 30px;
    font-size: 24px;
  }
  
  /* On mobile, hamburger button stays fixed in left corner */
  .hamburger-btn.sidebar-expanded {
    left: 0 !important; /* Override desktop behavior on mobile */
  }
  
  /* Hide tooltip on mobile (no hover) */
  .tooltip {
    display: none !important;
  }
  
  /* Sidebar becomes a slide-in panel */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 260px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 999;
  }
  
  .sidebar.sidebar-expanded {
    transform: translateX(0);
  }
  
  /* Force sidebar content to be visible on mobile */
  .sidebar .brand,
  .sidebar .nav,
  .sidebar .btn-ghost {
    opacity: 1 !important;
  }
  
  /* Main area takes full width on mobile */
  .main-area {
    margin-left: 0;
    width: 100%;
  }
  
  /* Adjust header padding for mobile */
  .header {
    padding: 14px 16px;
  }
  
  /* Reduce content padding on mobile */
  .content {
    padding: 12px;
  }
  
  /* Mobile back button */
  .back-btn {
    padding: 10px 14px;
    font-size: 15px;
  }
}

/* DESKTOP STYLES */
@media (min-width: 769px) {
  .admin-root {
    flex-direction: row;
  }
  
  .hamburger-btn {
    top: 50px;
    left: 15px;
  }
  
  .sidebar {
    position: static;
    height: 100vh;
  }
  
  .sidebar:not(.sidebar-expanded) {
    width: 0 !important;
  }
  
  .sidebar.sidebar-expanded {
    width: 240px;
  }
  
  .main-area:not(.sidebar-hidden) {
    margin-left: 0;
    width: calc(100% - 240px);
  }
  
  .mobile-overlay {
    display: none;
  }
}
</style>